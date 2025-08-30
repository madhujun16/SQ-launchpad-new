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
import { useAuth } from '@/hooks/useAuth';

// Simple mock data - no heavy operations
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
const MOCK_USER_ROLE: UserRole = 'admin';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, currentRole } = useAuth();
  const userRole = currentRole || 'deployment_engineer';

  const handleViewAll = (path: string) => {
    navigate(path);
  };

  const handleCreateNew = (path: string) => {
    navigate(path);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'procurement':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'User'}
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your deployment projects today.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {MOCK_METRICS.map((metric, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {metric.title}
                </CardTitle>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                <p className="text-xs text-gray-600 mt-1">{metric.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span>Financial Overview</span>
              </CardTitle>
              <CardDescription>
                Current investment and operational metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Investment</p>
                  <p className="text-2xl font-bold text-gray-900">
                    £{MOCK_FINANCIAL_DATA.totalInvestment.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monthly OPEX</p>
                  <p className="text-2xl font-bold text-gray-900">
                    £{MOCK_FINANCIAL_DATA.monthlyOPEX.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {MOCK_FINANCIAL_DATA.deploymentSuccessRate}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cost per Site</p>
                  <p className="text-2xl font-bold text-gray-900">
                    £{MOCK_FINANCIAL_DATA.costPerSite.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span>Platform Overview</span>
              </CardTitle>
              <CardDescription>
                System performance and user activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {MOCK_PLATFORM_DATA.totalRequests}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {MOCK_PLATFORM_DATA.approvedRequests}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Sites</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {MOCK_FINANCIAL_DATA.totalSites}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Users Online</p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Requests */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Requests</CardTitle>
                <CardDescription>
                  Latest procurement and approval requests
                </CardDescription>
              </div>
              <Button onClick={() => handleViewAll('/approvals')} variant="outline">
                View All
                <Eye className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_REQUESTS.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium text-gray-900">{request.siteName}</p>
                      <p className="text-sm text-gray-600">Request #{request.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                    <Badge className={getPriorityColor(request.priority)}>
                      {request.priority}
                    </Badge>
                    <p className="text-sm font-medium text-gray-900">
                      £{request.totalValue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => handleCreateNew('/sites/create')}
                className="h-20 flex flex-col items-center justify-center space-y-2"
                variant="outline"
              >
                <Plus className="h-6 w-6" />
                <span>Create New Site</span>
              </Button>
              <Button 
                onClick={() => handleViewAll('/sites')}
                className="h-20 flex flex-col items-center justify-center space-y-2"
                variant="outline"
              >
                <Building className="h-6 w-6" />
                <span>View All Sites</span>
              </Button>
              <Button 
                onClick={() => handleViewAll('/approvals')}
                className="h-20 flex flex-col items-center justify-center space-y-2"
                variant="outline"
              >
                <CheckCircle className="h-6 w-6" />
                <span>Review Approvals</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 