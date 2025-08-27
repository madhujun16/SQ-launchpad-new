import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AppTable } from '@/components/ui/AppTable';
import { 
  Building, 
  Users, 
  Package, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  TrendingUp, 
  Activity,
  MapPin,
  Truck,
  Wrench,
  Shield,
  BarChart3,
  Calendar,
  FileText,
  Database,
  Eye,
  Edit,
  Settings,
  Target,
  CheckSquare,
  AlertTriangle,
  Play,
  Pause,
  Plus
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getRoleConfig } from '@/lib/roles';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader } from '@/components/ui/loader';
import { useRoleAccess } from '@/hooks/useRoleAccess';

// Types
interface DashboardMetric {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description?: string;
}

interface DashboardWidget {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  size: 'small' | 'medium' | 'large';
}

interface RequestSummaryItem { 
  name: string; 
  units?: number; 
}

interface RequestSummary { 
  software: RequestSummaryItem[]; 
  hardware: RequestSummaryItem[]; 
}

interface RequestRow {
  id: string;
  siteId: string;
  siteName: string;
  requestedBy: string;
  status: 'pending' | 'approved' | 'rejected' | 'procurement';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  totalValue: number;
  assignedOps?: string;
  assignedEngineer?: string;
  rejectionReason?: string;
  submittedAt: string;
  summary: RequestSummary;
}

// New interface for cost tracking
interface SiteCosts {
  siteId: string;
  siteName: string;
  status: string;
  capex: number;
  opex: number;
  assignedOps?: string;
  totalValue: number;
}

// Loading Component
const DashboardLoading = () => (
  <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <Loader size="lg" />
      <p className="text-gray-600 mt-4">Loading dashboard...</p>
    </div>
  </div>
);

// Dashboard Header Component
const DashboardHeader = ({ profile, roleConfig }: { profile: any; roleConfig: any }) => (
  <div className="flex items-center justify-between mb-8">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-gray-600 mt-2">
        Welcome back, {profile?.full_name || profile?.email || 'User'}. Here's your {roleConfig?.displayName} overview.
      </p>
    </div>
    <div className="flex items-center space-x-2">
      <Badge variant="secondary" className="px-3 py-1">
        {roleConfig?.icon && <roleConfig.icon className="h-4 w-4 mr-2" />}
        {roleConfig?.displayName}
      </Badge>
    </div>
  </div>
);

// Metrics Grid Component
const MetricsGrid = ({ metrics }: { metrics: DashboardMetric[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {metrics.map((metric, index) => (
      <Card key={index} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{metric.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
              {metric.change && (
                <p className="text-sm text-green-600 mt-1">{metric.change}</p>
              )}
              {metric.description && (
                <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
              )}
            </div>
            <div className={`p-3 rounded-lg ${metric.color} bg-opacity-10`}>
              <metric.icon className={`h-6 w-6 ${metric.color}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Widgets Grid Component
const WidgetsGrid = ({ widgets }: { widgets: DashboardWidget[] }) => {
  const getWidgetSizeClass = (size: string) => {
    switch (size) {
      case 'small': return 'col-span-1';
      case 'medium': return 'col-span-1 lg:col-span-2';
      case 'large': return 'col-span-1 lg:col-span-3';
      default: return 'col-span-1';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {widgets.map((widget) => (
        <Card key={widget.id} className={`${getWidgetSizeClass(widget.size)} hover:shadow-md transition-shadow`}>
          <CardHeader>
            <CardTitle className="text-lg">{widget.title}</CardTitle>
            <CardDescription>{widget.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {widget.content}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  console.log('🔧 Dashboard: Component rendering');
  
  // Call useAuth hook at the top level (Rules of Hooks requirement)
  const { currentRole, profile, loading: authLoading } = useAuth();
  const { getTabAccess } = useRoleAccess();
  const navigate = useNavigate();
  
  console.log('🔧 Dashboard: useAuth result:', { currentRole, profile, authLoading });
  
  // State
  const [allRequests, setAllRequests] = useState<RequestRow[]>([]);
  const [siteCosts, setSiteCosts] = useState<SiteCosts[]>([]);

  // Memoized helper functions
  const getStatusBadge = useCallback((status: RequestRow['status']) => {
    switch (status) {
      case 'pending': return <Badge className="bg-orange-100 text-orange-800">Pending</Badge>;
      case 'approved': return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'procurement': return <Badge className="bg-blue-100 text-blue-800">Procurement</Badge>;
      default: return <Badge>Unknown</Badge>;
    }
  }, []);

  const approveInline = useCallback((id: string) => {
    setAllRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
    toast.success('Request approved');
  }, []);

  const rejectInline = useCallback((id: string) => {
    setAllRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected', rejectionReason: 'Rejected from dashboard' } : r));
    toast.success('Request rejected');
  }, []);

  // Mock data initialization
  useEffect(() => {
    const seed: RequestRow[] = [
      {
        id: 'r1', siteId: '3', siteName: 'Birmingham South', requestedBy: 'Tom Wilson',
        status: 'pending', priority: 'high', totalValue: 4500, assignedOps: 'Emma Davis', assignedEngineer: 'Tom Wilson',
        submittedAt: '2024-01-16T10:30:00Z',
        summary: { software: [{ name: 'POS System' }, { name: 'Kiosk Software' }], hardware: [{ name: 'POS Terminals', units: 2 }] }
      },
      {
        id: 'r2', siteId: '4', siteName: 'Leeds Central', requestedBy: 'Chris Taylor',
        status: 'approved', priority: 'medium', totalValue: 12000, assignedOps: 'Lisa Anderson', assignedEngineer: 'Chris Taylor',
        submittedAt: '2024-01-17T14:20:00Z',
        summary: { software: [{ name: 'POS System' }, { name: 'Kitchen Display' }], hardware: [{ name: 'POS Terminals', units: 4 }] }
      },
      {
        id: 'r3', siteId: '5', siteName: 'Liverpool East', requestedBy: 'Anna Garcia',
        status: 'rejected', priority: 'low', totalValue: 800, assignedOps: 'Mark Thompson', assignedEngineer: 'Anna Garcia',
        rejectionReason: 'Please reduce scope and resubmit.', submittedAt: '2024-01-18T09:15:00Z',
        summary: { software: [{ name: 'Self-Service Kiosks' }], hardware: [{ name: 'Tablets', units: 1 }] }
      },
      {
        id: 'r4', siteId: '2', siteName: 'Manchester North', requestedBy: 'David Brown',
        status: 'procurement', priority: 'urgent', totalValue: 7500, assignedOps: 'Sarah Wilson', assignedEngineer: 'David Brown',
        submittedAt: '2024-01-19T11:45:00Z',
        summary: { software: [{ name: 'Kitchen Display' }], hardware: [{ name: 'KDS Screens', units: 3 }] }
      }
    ];
    setAllRequests(seed);

    // Mock site costs data
    const costsSeed: SiteCosts[] = [
      {
        siteId: '1', siteName: 'London Central', status: 'live', capex: 25000, opex: 5000, assignedOps: 'Emma Davis', totalValue: 30000
      },
      {
        siteId: '2', siteName: 'Manchester North', status: 'live', capex: 18000, opex: 3500, assignedOps: 'Sarah Wilson', totalValue: 21500
      },
      {
        siteId: '3', siteName: 'Birmingham South', status: 'live', capex: 22000, opex: 4200, assignedOps: 'Emma Davis', totalValue: 26200
      },
      {
        siteId: '4', siteName: 'Leeds Central', status: 'live', capex: 15000, opex: 3000, assignedOps: 'Lisa Anderson', totalValue: 18000
      },
      {
        siteId: '5', siteName: 'Liverpool East', status: 'live', capex: 12000, opex: 2500, assignedOps: 'Mark Thompson', totalValue: 14500
      },
      {
        siteId: '6', siteName: 'Edinburgh West', status: 'live', capex: 28000, opex: 5500, assignedOps: 'Emma Davis', totalValue: 33500
      },
      {
        siteId: '7', siteName: 'Cardiff Central', status: 'live', capex: 16000, opex: 3200, assignedOps: 'Sarah Wilson', totalValue: 19200
      },
      {
        siteId: '8', siteName: 'Bristol North', status: 'live', capex: 19000, opex: 3800, assignedOps: 'Lisa Anderson', totalValue: 22800
      }
    ];
    setSiteCosts(costsSeed);
  }, []);

  // Enhanced error handling for role configuration
  let roleConfig;
  try {
    roleConfig = getRoleConfig(currentRole || 'admin');
  } catch (error) {
    console.error('Dashboard: Error getting role config:', error);
    roleConfig = getRoleConfig('admin'); // Fallback to admin
  }

  // Enhanced loading states with better error handling
  if (authLoading) {
    console.log('Dashboard: Auth still loading, showing loader');
    return <DashboardLoading />;
  }

  // Check if auth context is properly initialized
  if (!profile || !currentRole) {
    console.log('Dashboard: Auth context not ready, profile:', profile, 'currentRole:', currentRole);
    return <DashboardLoading />;
  }

  // Memoized metrics generation
  const metrics = useMemo(() => {
    const baseMetrics: DashboardMetric[] = [
      {
        title: 'Active Sites',
        value: 12,
        change: '+2 this week',
        icon: Building,
        color: 'text-blue-600',
        description: 'Sites currently in progress'
      },
      {
        title: 'Pending Approvals',
        value: allRequests.filter(r => r.status === 'pending').length,
        change: '+1 today',
        icon: AlertCircle,
        color: 'text-orange-600',
        description: 'Awaiting review'
      },
      {
        title: 'Deployments This Month',
        value: 8,
        change: '+1 this week',
        icon: Truck,
        color: 'text-green-600',
        description: 'Sites deployed successfully'
      }
    ];

    // Role-specific metrics
    if (currentRole === 'admin') {
      baseMetrics.push({
        title: 'Active Users',
        value: 24,
        change: '+3 this month',
        icon: Users,
        color: 'text-purple-600',
        description: 'Active platform users'
      });
    } else if (currentRole === 'ops_manager') {
      baseMetrics.push(
        {
          title: 'My Assigned Sites',
          value: 6,
          change: '+1 this week',
          icon: MapPin,
          color: 'text-blue-600',
          description: 'Sites under your management'
        },
        {
          title: 'Approval Rate',
          value: '94%',
          change: '+3% this month',
          icon: CheckCircle,
          color: 'text-green-600',
          description: 'Hardware approval success rate'
        }
      );
    } else if (currentRole === 'deployment_engineer') {
      baseMetrics.push(
        {
          title: 'My Sites',
          value: 7,
          change: '+1 this week',
          icon: Wrench,
          color: 'text-green-600',
          description: 'You are assigned to these sites'
        },
        {
          title: 'Rejected Scopes',
          value: allRequests.filter(r => r.status === 'rejected').length,
          icon: AlertCircle,
          color: 'text-red-600',
          description: 'Need resubmission'
        }
      );
    }

    return baseMetrics;
  }, [currentRole, allRequests]);

  // Memoized widgets generation
  const widgets = useMemo(() => {
    const roleWidgets: DashboardWidget[] = [];

    // Common recent activity widget
    roleWidgets.push({
      id: 'recent-activity',
      title: 'Recent Activity',
      description: 'Latest updates and actions',
      size: 'medium',
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Site "London Central" deployed successfully</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Site study completed for "Manchester North"</p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      )
    });

    return roleWidgets;
  }, []);

  // Role-specific section renderers
  const renderDeploymentEngineerSection = useCallback(() => {
    const mine = allRequests.filter(r => r.assignedEngineer === (profile?.full_name || profile?.email));
    const pendingOrRejected = mine.filter(r => r.status === 'pending' || r.status === 'rejected');
    const upcoming = mine.filter(r => r.status === 'approved' || r.status === 'procurement');
    
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Scoping Queue</CardTitle>
            <CardDescription>Pending and rejected scopes requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingOrRejected.length === 0 ? (
              <p className="text-sm text-gray-600">Nothing needs your attention right now.</p>
            ) : (
              <AppTable headers={[ 'Site', 'Submitted', 'Status', 'Action' ]}>
                {pendingOrRejected.map(r => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="p-3">
                      <div className="font-medium">{r.siteName}</div>
                    </td>
                    <td className="p-3 text-sm text-gray-600">{new Date(r.submittedAt).toLocaleDateString()}</td>
                    <td className="p-3">{getStatusBadge(r.status)}</td>
                    <td className="p-3">
                      {r.status === 'rejected' ? (
                        <Button size="sm" onClick={() => navigate(`/sites/${r.siteId}/study`)}>
                          <Edit className="h-4 w-4 mr-1" /> Edit & Resubmit
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => navigate('/approvals-procurement')}>
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </AppTable>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Procurement</CardTitle>
            <CardDescription>Approved scopes moving to procurement</CardDescription>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-sm text-gray-600">No approved scopes at the moment.</p>
            ) : (
              <AppTable headers={[ 'Site', 'Value', 'Stage' ]}>
                {upcoming.map(r => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="p-3 font-medium">{r.siteName}</td>
                    <td className="p-3 text-sm">£{r.totalValue.toLocaleString()}</td>
                    <td className="p-3">
                      <Badge variant="secondary">{r.status === 'procurement' ? 'In Procurement' : 'Approved'}</Badge>
                    </td>
                  </tr>
                ))}
              </AppTable>
            )}
          </CardContent>
        </Card>
      </>
    );
  }, [allRequests, profile, getStatusBadge, navigate]);

  const renderOpsManagerSection = useCallback(() => {
    const mine = allRequests.filter(r => r.assignedOps === (profile?.full_name || profile?.email));
    const pending = mine.filter(r => r.status === 'pending');
    const recent = mine.filter(r => r.status !== 'pending').slice(0, 5);
    
    // Get costs for sites assigned to this Ops Manager
    const mySiteCosts = siteCosts.filter(site => site.assignedOps === (profile?.full_name || profile?.email));
    const totalCapex = mySiteCosts.reduce((sum, site) => sum + site.capex, 0);
    const totalOpex = mySiteCosts.reduce((sum, site) => sum + site.opex, 0);
    const totalValue = mySiteCosts.reduce((sum, site) => sum + site.totalValue, 0);
    
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Approval Queue</CardTitle>
            <CardDescription>Newly submitted scopes awaiting your decision</CardDescription>
          </CardHeader>
          <CardContent>
            {pending.length === 0 ? (
              <p className="text-sm text-gray-600">No pending approvals.</p>
            ) : (
              <AppTable headers={[ 'Site', 'Submitted', 'Summary', 'Total', 'Actions' ]}>
                {pending.map(r => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="p-3 font-medium">{r.siteName}</td>
                    <td className="p-3 text-sm text-gray-600">{new Date(r.submittedAt).toLocaleDateString()}</td>
                    <td className="p-3 text-xs text-gray-700">
                      Software: {r.summary.software.map(s => s.name).join(', ')} | Hardware: {r.summary.hardware.map(h => `${h.name}${h.units?`(${h.units})`:''}`).join(', ')}
                    </td>
                    <td className="p-3 text-sm">£{r.totalValue.toLocaleString()}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => approveInline(r.id)}><CheckCircle className="h-4 w-4 mr-1" />Approve</Button>
                        <Button size="sm" variant="outline" onClick={() => rejectInline(r.id)}><AlertCircle className="h-4 w-4 mr-1" />Reject</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </AppTable>
            )}
          </CardContent>
        </Card>
        
        {/* Cost Summary Card for Ops Manager */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Financial Overview</CardTitle>
            <CardDescription>Cost summary for your assigned live sites</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">£{totalCapex.toLocaleString()}</p>
                <p className="text-sm text-blue-600">Total CAPEX</p>
                <p className="text-xs text-gray-500">{mySiteCosts.length} sites</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">£{totalOpex.toLocaleString()}</p>
                <p className="text-sm text-green-600">Total OPEX</p>
                <p className="text-xs text-gray-500">Annual costs</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">£{totalValue.toLocaleString()}</p>
                <p className="text-sm text-purple-600">Total Value</p>
                <p className="text-xs text-gray-500">CAPEX + OPEX</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Decisions</CardTitle>
            <CardDescription>Your recent approval decisions</CardDescription>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-sm text-gray-600">No recent activity.</p>
            ) : (
              <AppTable headers={[ 'Site', 'Decision', 'Date' ]}>
                {recent.map(r => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="p-3 font-medium">{r.siteName}</td>
                    <td className="p-3">{getStatusBadge(r.status)}</td>
                    <td className="p-3 text-sm text-gray-600">{new Date(r.submittedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </AppTable>
            )}
          </CardContent>
        </Card>
      </>
    );
  }, [allRequests, profile, approveInline, rejectInline, getStatusBadge, siteCosts]);

  const renderAdminSection = useCallback(() => {
    const pending = allRequests.filter(r => r.status === 'pending');
    const recent = allRequests.slice(0, 5);
    
    // Get costs for all live sites
    const liveSiteCosts = siteCosts.filter(site => site.status === 'live');
    const totalCapex = liveSiteCosts.reduce((sum, site) => sum + site.capex, 0);
    const totalOpex = liveSiteCosts.reduce((sum, site) => sum + site.opex, 0);
    const totalValue = liveSiteCosts.reduce((sum, site) => sum + site.totalValue, 0);
    const avgCapexPerSite = liveSiteCosts.length > 0 ? Math.round(totalCapex / liveSiteCosts.length) : 0;
    const avgOpexPerSite = liveSiteCosts.length > 0 ? Math.round(totalOpex / liveSiteCosts.length) : 0;
    
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Platform Overview</CardTitle>
            <CardDescription>System-wide statistics and recent activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{allRequests.length}</p>
                <p className="text-sm text-blue-600">Total Requests</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{allRequests.filter(r => r.status === 'approved').length}</p>
                <p className="text-sm text-green-600">Approved Requests</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Recent Requests</p>
              {recent.map(r => (
                <div key={r.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{r.siteName}</span>
                  <span className="text-xs text-gray-500">{getStatusBadge(r.status)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Financial Overview Card for Admin */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Financial Overview</CardTitle>
            <CardDescription>Complete cost analysis across all live sites</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">£{totalCapex.toLocaleString()}</p>
                <p className="text-sm text-blue-600">Total CAPEX</p>
                <p className="text-xs text-gray-500">{liveSiteCosts.length} sites</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">£{totalOpex.toLocaleString()}</p>
                <p className="text-sm text-green-600">Total OPEX</p>
                <p className="text-xs text-gray-500">Annual costs</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">£{totalValue.toLocaleString()}</p>
                <p className="text-sm text-purple-600">Total Value</p>
                <p className="text-xs text-gray-500">CAPEX + OPEX</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">£{avgCapexPerSite.toLocaleString()}</p>
                <p className="text-sm text-orange-600">Avg CAPEX/Site</p>
                <p className="text-xs text-gray-500">Per deployment</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }, [allRequests, getStatusBadge, siteCosts]);

  // Handle create new site
  const handleCreateSite = () => {
    navigate('/sites/create');
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Page Header with Create Site Button */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your sites.</p>
        </div>
        
        {/* Create Site Button - Only visible to Admin users */}
        {currentRole === 'admin' && (
          <Button 
            onClick={handleCreateSite}
            className="bg-gradient-to-r from-black to-green-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 hover:from-gray-900 hover:to-green-700 transition-all duration-200 shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span>Create Site</span>
          </Button>
        )}
      </div>

      
      
      <MetricsGrid metrics={metrics} />
      
      {/* Role-specific sections - simplified without headers */}
      {currentRole === 'deployment_engineer' && (
        <div className="space-y-6">
          {renderDeploymentEngineerSection()}
        </div>
      )}
      
      {currentRole === 'ops_manager' && (
        <div className="space-y-6">
          {renderOpsManagerSection()}
        </div>
      )}
      
      {currentRole === 'admin' && (
        <div className="space-y-6">
          {renderAdminSection()}
        </div>
      )}

      <WidgetsGrid widgets={widgets} />
    </div>
  );
};

export default Dashboard; 