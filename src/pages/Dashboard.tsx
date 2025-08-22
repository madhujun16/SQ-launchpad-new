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
  Edit
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getRoleConfig } from '@/lib/roles';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader } from '@/components/ui/loader';

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

// Constants
const LOADING_TIMEOUT = 10000; // 10 seconds

// Loading Component
const DashboardLoading = () => (
  <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <Loader size="lg" />
      <p className="text-gray-600 mt-4">Loading dashboard...</p>
    </div>
  </div>
);

// Timeout Warning Component
const DashboardTimeoutWarning = () => (
  <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="text-orange-600 mb-4">
        <AlertCircle className="h-12 w-12 mx-auto" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Taking Longer Than Expected</h2>
      <p className="text-gray-600 mb-4">The dashboard is still loading. This might be due to:</p>
      <ul className="text-sm text-gray-500 text-left max-w-md mx-auto space-y-1">
        <li>• Slow database connection</li>
        <li>• Authentication service delay</li>
        <li>• Network connectivity issues</li>
      </ul>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Refresh Page
      </button>
    </div>
  </div>
);

// Access Denied Component
const DashboardAccessDenied = ({ profile, currentRole, loading }: { 
  profile: any; 
  currentRole: any; 
  loading: boolean; 
}) => (
  <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="text-red-600 mb-4">
        <AlertCircle className="h-12 w-12 mx-auto" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
      <p className="text-gray-600 mb-4">You don't have the required permissions to access this dashboard.</p>
      <div className="text-sm text-gray-500 space-y-1">
        <p>Debug Info:</p>
        <p>• Profile: {profile ? 'Loaded' : 'Not loaded'}</p>
        <p>• Current Role: {currentRole || 'None'}</p>
        <p>• Loading State: {loading ? 'True' : 'False'}</p>
      </div>
    </div>
  </div>
);

// Dashboard Header Component
const DashboardHeader = React.memo(({ profile, roleConfig }: { 
  profile: any; 
  roleConfig: any; 
}) => (
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-gray-600 mt-1">
        Welcome back, {profile?.full_name || 'User'}. Here's your {roleConfig.displayName} overview.
      </p>
    </div>
    <div className="flex items-center space-x-2">
      <Badge variant="outline" className="flex items-center space-x-1">
        <roleConfig.icon className="h-3 w-3" />
        <span>{roleConfig.displayName}</span>
      </Badge>
    </div>
  </div>
));

// Metrics Grid Component
const MetricsGrid = React.memo(({ metrics }: { metrics: DashboardMetric[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {metrics.map((metric, index) => (
      <Card key={index} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{metric.title}</p>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              {metric.change && (
                <p className="text-xs text-green-600 mt-1">{metric.change}</p>
              )}
            </div>
            <div className={`p-3 rounded-full bg-gray-100 ${metric.color}`}>
              <metric.icon className="h-6 w-6" />
            </div>
          </div>
          {metric.description && (
            <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
          )}
        </CardContent>
      </Card>
    ))}
  </div>
));

// Widgets Grid Component
const WidgetsGrid = React.memo(({ widgets }: { widgets: DashboardWidget[] }) => {
  const getWidgetSizeClass = useCallback((size: string) => {
    switch (size) {
      case 'small': return 'col-span-1';
      case 'medium': return 'col-span-1 md:col-span-2';
      case 'large': return 'col-span-1 md:col-span-2 lg:col-span-3';
      default: return 'col-span-1';
    }
  }, []);

  if (widgets.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
});

// Main Dashboard Component
const Dashboard = () => {
  // Add error boundary state
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Use auth context safely
  const authData = useAuth();
  
  // Check if auth context is available
  if (!authData) {
    return (
      <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader size="lg" />
          <p className="text-gray-600 mt-4">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  const { currentRole, profile, loading } = authData;
  const roleConfig = getRoleConfig(currentRole || 'admin');
  const navigate = useNavigate();

  // State
  const [allRequests, setAllRequests] = useState<RequestRow[]>([]);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Memoized helper functions - MUST be defined before any conditional returns
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

  // Timeout handling
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        console.warn('⚠️ Dashboard loading timeout - forcing display');
        setLoadingTimeout(true);
      }, LOADING_TIMEOUT);

      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [loading]);

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
  }, []);



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

  // Role-specific section renderers - MUST be defined before any early returns
  const renderDeploymentEngineerSection = useCallback(() => {
    const mine = allRequests.filter(r => r.assignedEngineer === (profile?.full_name || profile?.email));
    const pendingOrRejected = mine.filter(r => r.status === 'pending' || r.status === 'rejected');
    const upcoming = mine.filter(r => r.status === 'approved' || r.status === 'procurement');
    
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">My Scoping Queue</CardTitle>
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
    
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Approvals</CardTitle>
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Decisions</CardTitle>
            <CardDescription>Approved, rejected, and resubmitted scopes</CardDescription>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-sm text-gray-600">No recent activity.</p>
            ) : (
              <div className="space-y-2">
                {recent.map(r => (
                  <div key={r.id} className="p-3 border rounded flex items-center justify-between">
                    <div>
                      <div className="font-medium">{r.siteName}</div>
                      <div className="text-xs text-gray-500">Value £{r.totalValue.toLocaleString()}</div>
                    </div>
                    {getStatusBadge(r.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </>
    );
  }, [allRequests, profile, approveInline, rejectInline, getStatusBadge]);

  const renderAdminSection = useCallback(() => {
    const totalSites = 42;
    const activeLicenses = 120;
    const inventoryItems = 340;
    const procurementSpend = 248000;
    
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Key Metrics</CardTitle>
            <CardDescription>Platform-wide overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 border rounded">
                <div className="text-sm text-gray-600">Total Sites</div>
                <div className="text-2xl font-bold">{totalSites}</div>
              </div>
              <div className="p-3 border rounded">
                <div className="text-sm text-gray-600">Active Licenses</div>
                <div className="text-2xl font-bold">{activeLicenses}</div>
              </div>
              <div className="p-3 border rounded">
                <div className="text-sm text-gray-600">Inventory Items</div>
                <div className="text-2xl font-bold">{inventoryItems}</div>
              </div>
              <div className="p-3 border rounded">
                <div className="text-sm text-gray-600">Procurement Spend</div>
                <div className="text-2xl font-bold">£{procurementSpend.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
        </div>
      </>
    );
  }, []);

  // Loading states - AFTER all hooks are defined
  if (loading && !loadingTimeout) {
    return <DashboardLoading />;
  }

  if (loading && loadingTimeout) {
    return <DashboardTimeoutWarning />;
  }

  if (!currentRole) {
    return <DashboardAccessDenied profile={profile} currentRole={currentRole} loading={loading} />;
  }

  // Debug logging
  console.log('🎯 Dashboard render - currentRole:', currentRole, 'profile:', profile, 'roleConfig:', roleConfig);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <DashboardHeader profile={profile} roleConfig={roleConfig} />
      <MetricsGrid metrics={metrics} />
      
      {/* Role-specific sections */}
      {currentRole === 'deployment_engineer' && renderDeploymentEngineerSection()}
      {currentRole === 'ops_manager' && renderOpsManagerSection()}
      {currentRole === 'admin' && renderAdminSection()}

      <WidgetsGrid widgets={widgets} />
    </div>
  );
};

export default Dashboard; 