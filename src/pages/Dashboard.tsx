import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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

interface RequestSummaryItem { name: string; units?: number }
interface RequestSummary { software: RequestSummaryItem[]; hardware: RequestSummaryItem[] }

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

const Dashboard = () => {
  const { currentRole, profile } = useAuth();
  const roleConfig = getRoleConfig(currentRole || 'admin');
  const navigate = useNavigate();

  // Mock data - in real app, this would come from API
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);

  // Requests scoped for the dashboard role views
  const [allRequests, setAllRequests] = useState<RequestRow[]>([]);

  useEffect(() => {
    // Seed requests
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

  useEffect(() => {
    // Generate role-specific metrics and widgets
    generateDashboardContent();
  }, [currentRole]);

  const getStatusBadge = (status: RequestRow['status']) => {
    switch (status) {
      case 'pending': return <Badge className="bg-orange-100 text-orange-800">Pending</Badge>;
      case 'approved': return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'procurement': return <Badge className="bg-blue-100 text-blue-800">Procurement</Badge>;
      default: return <Badge>Unknown</Badge>;
    }
  };

  const approveInline = (id: string) => {
    setAllRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
    toast.success('Request approved');
  };
  const rejectInline = (id: string) => {
    setAllRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected', rejectionReason: 'Rejected from dashboard' } : r));
    toast.success('Request rejected');
  };

  const generateDashboardContent = () => {
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
      baseMetrics.push(
        {
          title: 'Active Users',
          value: 24,
          change: '+3 this month',
          icon: Users,
          color: 'text-purple-600',
          description: 'Active platform users'
        }
      );
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

    setMetrics(baseMetrics);

    // Widgets remain, but we add role sections below metrics grid
    const roleWidgets: DashboardWidget[] = [];

    // Common recent activity widget
    roleWidgets.push(
      {
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
      }
    );

    setWidgets(roleWidgets);
  };

  const getWidgetSizeClass = (size: string) => {
    switch (size) {
      case 'small':
        return 'col-span-1';
      case 'medium':
        return 'col-span-1 md:col-span-2';
      case 'large':
        return 'col-span-1 md:col-span-2 lg:col-span-3';
      default:
        return 'col-span-1';
    }
  };

  // Role-specific sections
  const renderDeploymentEngineerSection = () => {
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
              <div className="space-y-2">
                {pendingOrRejected.map(r => (
                  <div key={r.id} className="p-3 border rounded flex items-center justify-between">
                    <div>
                      <div className="font-medium">{r.siteName}</div>
                      <div className="text-xs text-gray-500">Submitted {new Date(r.submittedAt).toLocaleDateString()}</div>
                      <div className="mt-1 flex items-center gap-2">
                        {getStatusBadge(r.status)}
                        {r.status === 'rejected' && (
                          <span className="text-xs text-red-700">{r.rejectionReason}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.status === 'rejected' ? (
                        <Button size="sm" onClick={() => navigate(`/sites/${r.siteId}/study`)}>
                          <Edit className="h-4 w-4 mr-1" /> Edit & Resubmit
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => navigate('/approvals-procurement')}>
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
              <div className="space-y-2">
                {upcoming.map(r => (
                  <div key={r.id} className="p-3 border rounded flex items-center justify-between">
                    <div>
                      <div className="font-medium">{r.siteName}</div>
                      <div className="text-xs text-gray-500">Value £{r.totalValue.toLocaleString()}</div>
                    </div>
                    <Badge variant="secondary">{r.status === 'procurement' ? 'In Procurement' : 'Approved'}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </>
    );
  };

  const renderOpsManagerSection = () => {
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
              <div className="space-y-2">
                {pending.map(r => (
                  <div key={r.id} className="p-3 border rounded">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{r.siteName}</div>
                        <div className="text-xs text-gray-500">Submitted {new Date(r.submittedAt).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => approveInline(r.id)}><CheckCircle className="h-4 w-4 mr-1" />Approve</Button>
                        <Button size="sm" variant="outline" onClick={() => rejectInline(r.id)}><AlertCircle className="h-4 w-4 mr-1" />Reject</Button>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="p-2 border rounded">
                        <p className="text-xs font-medium mb-1">Software</p>
                        {r.summary.software.map((s, i) => (
                          <div key={i} className="text-xs text-gray-700">• {s.name}</div>
                        ))}
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-xs font-medium mb-1">Hardware</p>
                        {r.summary.hardware.map((h, i) => (
                          <div key={i} className="text-xs text-gray-700">• {h.name} {h.units ? `(${h.units})` : ''}</div>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">Total Cost: £{r.totalValue.toLocaleString()}</div>
                  </div>
                ))}
              </div>
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
  };

  const renderAdminSection = () => {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Platform Health</CardTitle>
            <CardDescription>Overview of platform metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">98%</div>
                <div className="text-sm text-gray-500">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">24</div>
                <div className="text-sm text-gray-500">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">37</div>
                <div className="text-sm text-gray-500">Active Sites</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">5</div>
                <div className="text-sm text-gray-500">Alerts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
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

      {/* Metrics Grid */}
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

      {/* Role-specific sections */}
      {currentRole === 'deployment_engineer' && renderDeploymentEngineerSection()}
      {currentRole === 'ops_manager' && renderOpsManagerSection()}
      {currentRole === 'admin' && renderAdminSection()}

      {/* Widgets Grid */}
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" onClick={() => navigate('/sites')}>
              <Building className="h-6 w-6" />
              <span className="text-sm font-medium">View Sites</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" onClick={() => navigate('/approvals-procurement')}>
              <Package className="h-6 w-6" />
              <span className="text-sm font-medium">Approvals</span>
            </Button>
            
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard; 