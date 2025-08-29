import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  Users, 
  Package, 
  Clock, 
  Truck, 
  TrendingUp,
  Eye,
  Plus,
  DollarSign,
  Target,
  Settings,
  CheckCircle,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Simple mock data
const MOCK_METRICS = [
  {
    title: 'Sites currently in progress',
    value: '8',
    change: '+2 this week',
    icon: Building,
    color: 'text-blue-600'
  },
  {
    title: 'Awaiting review',
    value: '3',
    change: '+1 today',
    icon: Clock,
    color: 'text-orange-600'
  },
  {
    title: 'Sites deployed successfully',
    value: '12',
    change: '+1 this week',
    icon: Truck,
    color: 'text-green-600'
  },
  {
    title: 'Active platform users',
    value: '24',
    change: '+3 this month',
    icon: Users,
    color: 'text-purple-600'
  }
];

const MOCK_REQUESTS = [
  {
    id: '1',
    siteName: 'Birmingham South',
    status: 'pending',
    priority: 'high',
    totalValue: 45000
  },
  {
    id: '2',
    siteName: 'Leeds Central',
    status: 'approved',
    priority: 'medium',
    totalValue: 32000
  },
  {
    id: '3',
    siteName: 'Liverpool East',
    status: 'rejected',
    priority: 'low',
    totalValue: 28000
  },
  {
    id: '4',
    siteName: 'Manchester North',
    status: 'procurement',
    priority: 'urgent',
    totalValue: 78000
  }
];

const MOCK_PLATFORM_DATA = {
  totalRequests: 4,
  approvedRequests: 1
};

const MOCK_FINANCIAL_DATA = {
  totalInvestment: 185700,
  monthlyOPEX: 2558,
  deploymentSuccessRate: 87.5,
  costPerSite: 23212,
  totalSites: 8
};

// Mock user role - in real app this would come from context
type UserRole = 'admin' | 'ops_manager' | 'deployment_engineer';
const MOCK_USER_ROLE: UserRole = 'admin'; // Change this to test different roles

const Dashboard = () => {
  const navigate = useNavigate();
  // Ensure currentRole is properly typed as UserRole union type
  const currentRole: UserRole = MOCK_USER_ROLE; // Static role - switching handled by hamburger menu

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge className="bg-orange-100 text-orange-800">Pending</Badge>;
      case 'approved': return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'procurement': return <Badge className="bg-blue-100 text-blue-800">Procurement</Badge>;
      default: return <Badge>Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low': return <Badge variant="secondary">Low</Badge>;
      case 'medium': return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'high': return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case 'urgent': return <Badge className="bg-red-100 text-red-800">Urgent</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(value);
  };

  // Role-based dashboard content
  const renderAdminDashboard = () => (
    <>
      {/* Admin dashboard is now clean - no extra sections */}
    </>
  );

  const renderOpsManagerDashboard = () => (
    <>
      {/* Assigned Sites Section */}
      <Card>
        <CardHeader>
          <CardTitle>My Assigned Sites</CardTitle>
          <CardDescription>Sites under your management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_REQUESTS.slice(0, 3).map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm">{request.siteName}</span>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="text-xs text-gray-600 mb-3">
                      Total Value: {formatCurrency(request.totalValue)}
                    </div>
                    <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate(`/sites/${request.id}`)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>Your team's deployment metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">12</div>
              <div className="text-sm text-gray-600">Sites Managed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">85%</div>
              <div className="text-sm text-gray-600">On-Time Delivery</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );

  const renderDeploymentEngineerDashboard = () => (
    <>
      {/* My Tasks Section */}
      <Card>
        <CardHeader>
          <CardTitle>My Active Deployments</CardTitle>
          <CardDescription>Current deployment assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_REQUESTS.slice(0, 3).map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm">{request.siteName}</span>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="text-xs text-gray-600 mb-3">
                      Priority: {request.priority} • Value: {formatCurrency(request.totalValue)}
                    </div>
                    <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate(`/sites/${request.id}`)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Site
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tools & Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Tools & Resources</CardTitle>
          <CardDescription>Quick access to deployment tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-20" onClick={() => navigate('/deployment')}>
              <div className="text-center">
                <Truck className="h-8 w-8 mx-auto mb-2" />
                <div>Deployment</div>
              </div>
            </Button>
            <Button variant="outline" className="h-20" onClick={() => navigate('/assets')}>
              <div className="text-center">
                <Package className="h-8 w-8 mx-auto mb-2" />
                <div>Assets</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );

  const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'ops_manager': return 'Operations Manager';
      case 'deployment_engineer': return 'Deployment Engineer';
    }
  };

  const getRoleColor = (role: UserRole): string => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'ops_manager': return 'bg-blue-100 text-blue-800';
      case 'deployment_engineer': return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here's your {getRoleDisplayName(currentRole)} overview.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={`px-3 py-1 ${getRoleColor(currentRole)}`}>
            {getRoleDisplayName(currentRole)}
          </Badge>
        </div>
      </div>
      
      {/* Key Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {MOCK_METRICS.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                  <p className="text-xs text-green-600 mt-1">{metric.change}</p>
                </div>
                <div className={`p-2 rounded-lg ${metric.color} bg-opacity-10`}>
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Financial Overview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
          <CardDescription>Key investment metrics and performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-700">{formatCurrency(MOCK_FINANCIAL_DATA.totalInvestment)}</div>
                <div className="text-lg text-blue-600 mt-1">Total Investment</div>
                <div className="text-sm text-blue-500 mt-2">{MOCK_FINANCIAL_DATA.totalSites} sites deployed</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-700">{MOCK_FINANCIAL_DATA.deploymentSuccessRate}%</div>
                <div className="text-lg text-green-600 mt-1">Success Rate</div>
                <div className="text-sm text-green-500 mt-2">Deployments completed</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-purple-700">{formatCurrency(MOCK_FINANCIAL_DATA.costPerSite)}</div>
                <div className="text-lg text-purple-600 mt-1">Cost per Site</div>
                <div className="text-sm text-purple-500 mt-2">Average deployment</div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Monthly Operational Costs</h4>
                <p className="text-sm text-gray-600">Recurring expenses across all sites</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(MOCK_FINANCIAL_DATA.monthlyOPEX)}</div>
                <div className="text-sm text-gray-600">per month</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Overview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Overview</CardTitle>
          <CardDescription>System-wide statistics and recent activity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{MOCK_PLATFORM_DATA.totalRequests}</div>
                <div className="text-sm text-blue-700 mt-1">Total Requests</div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-green-600">{MOCK_PLATFORM_DATA.approvedRequests}</div>
                <div className="text-sm text-green-700 mt-1">Approved Requests</div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-3">Recent Requests</h3>
            <div className="space-y-3">
              {MOCK_REQUESTS.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">{request.siteName}</span>
                      {getStatusBadge(request.status)}
                      {getPriorityBadge(request.priority)}
                    </div>
                    <div className="text-xs text-gray-600">
                      Total Value: {formatCurrency(request.totalValue)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/sites/${request.id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Role-specific metrics - Only for non-admin roles */}
      {(currentRole as UserRole) !== 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle>{getRoleDisplayName(currentRole)} Metrics</CardTitle>
            <CardDescription>Role-specific performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
                         {(currentRole as UserRole) === 'ops_manager' && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="text-center p-4 bg-blue-50 rounded-lg">
                   <div className="text-2xl font-bold text-blue-600">6</div>
                   <div className="text-sm text-blue-700">Sites Under Management</div>
                 </div>
                 <div className="text-center p-4 bg-orange-50 rounded-lg">
                   <div className="text-2xl font-bold text-orange-600">3</div>
                   <div className="text-sm text-orange-700">Pending Reviews</div>
                 </div>
                 <div className="text-center p-4 bg-green-50 rounded-lg">
                   <div className="text-2xl font-bold text-green-600">78%</div>
                   <div className="text-sm text-green-700">On-Time Delivery</div>
                 </div>
               </div>
             )}
            
            {(currentRole as UserRole) === 'deployment_engineer' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">4</div>
                  <div className="text-sm text-green-700">Active Deployments</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <div className="text-sm text-blue-700">Completed This Month</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">92%</div>
                  <div className="text-sm text-purple-700">Success Rate</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Role-based content */}
      {(() => {
        // Explicitly type the switch to ensure TypeScript understands the union type
        const roleContent = (() => {
          switch (currentRole as UserRole) {
            case 'admin':
              return renderAdminDashboard();
            case 'ops_manager':
              return renderOpsManagerDashboard();
            case 'deployment_engineer':
              return renderDeploymentEngineerDashboard();
            default:
              // This should never happen with our UserRole type, but TypeScript needs it
              return renderAdminDashboard();
          }
        })();
        return roleContent;
      })()}
      
      {/* Recent Activity Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates and actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>Activity feed coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard; 