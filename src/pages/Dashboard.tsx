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
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

// Chart data for visual representations
const SITE_PROGRESS_DATA = [
  { month: 'Jan', sites: 2, deployed: 1 },
  { month: 'Feb', sites: 4, deployed: 2 },
  { month: 'Mar', sites: 6, deployed: 4 },
  { month: 'Apr', sites: 8, deployed: 6 },
  { month: 'May', sites: 10, deployed: 8 },
  { month: 'Jun', sites: 8, deployed: 12 }
];

const STATUS_DISTRIBUTION_DATA = [
  { name: 'In Progress', value: 8, color: '#8b5cf6' },
  { name: 'Awaiting Review', value: 3, color: '#f59e0b' },
  { name: 'Deployed', value: 12, color: '#10b981' },
  { name: 'Pending Approval', value: 4, color: '#ef4444' }
];

const FINANCIAL_TREND_DATA = [
  { month: 'Jan', investment: 15000, opex: 2000, budget: 500000 },
  { month: 'Feb', investment: 25000, opex: 2200, budget: 500000 },
  { month: 'Mar', investment: 35000, opex: 2400, budget: 500000 },
  { month: 'Apr', investment: 45000, opex: 2600, budget: 500000 },
  { month: 'May', investment: 55000, opex: 2800, budget: 500000 },
  { month: 'Jun', investment: 185700, opex: 2558, budget: 500000 }
];

const WEEKLY_DEPLOYMENT_DATA = [
  { week: 'Week 1', deployed: 2, inProgress: 3 },
  { week: 'Week 2', deployed: 3, inProgress: 4 },
  { week: 'Week 3', deployed: 5, inProgress: 2 },
  { week: 'Week 4', deployed: 4, inProgress: 3 },
  { week: 'Week 5', deployed: 6, inProgress: 1 },
  { week: 'Week 6', deployed: 8, inProgress: 2 }
];

const OPERATIONS_DATA = [
  { metric: 'Response Time', value: 2.3, unit: 'days', color: '#8b5cf6' },
  { metric: 'Software Licenses', value: 156, unit: 'licenses', color: '#10b981' },
  { metric: 'Total Assets', value: 89, unit: 'assets', color: '#f59e0b' },
  { metric: 'Go-Live Time', value: 34.2, unit: 'days', color: '#ef4444' }
];

// Simple mock data - no heavy operations
const MOCK_METRICS = [
  {
    title: 'Sites currently in progress',
    value: '8',
    change: '+2 this week',
    icon: Building,
    color: 'text-green-600'
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
    title: 'Approval Requests Pending',
    value: '4',
    change: '+2 today',
    icon: AlertTriangle,
    color: 'text-red-600'
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
  approvalRequests: 4,
  avgResponseTime: '2.3 days',
  softwareLicenses: 156,
  totalAssets: 89,
  avgGoLiveDays: 34.2
};

const MOCK_FINANCIAL_DATA = {
  totalInvestment: 185700,
  monthlyOPEX: 2558,
  deploymentSuccessRate: 87.5,
  costPerSite: 23212,
  totalSites: 8,
  budgetUtilization: 78.5,
  resourceUtilization: 92.3,
  totalBudget: 500000,
  remainingBudget: 314300
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
      // Green: Live
      case 'approved':
        return 'bg-green-100 text-green-800';
      
      // Gray: Created, Pending
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      
      // Red: Blocked, On Hold, Rejected
      case 'rejected':
        return 'bg-red-100 text-red-800';
      
      // Blue: Procurement Done, Deployed, Approved
      case 'procurement':
        return 'bg-green-100 text-green-800';
      
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

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Site Progress Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>Site Progress Trend</span>
              </CardTitle>
              <CardDescription>
                Monthly site deployment progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={SITE_PROGRESS_DATA}>
                  <defs>
                    <linearGradient id="colorSites" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorDeployed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="sites"
                    stroke="#8b5cf6"
                    fillOpacity={1}
                    fill="url(#colorSites)"
                    name="Sites in Progress"
                  />
                  <Area
                    type="monotone"
                    dataKey="deployed"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorDeployed)"
                    name="Sites Deployed"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5 text-green-600" />
                <span>Site Status Distribution</span>
              </CardTitle>
              <CardDescription>
                Current distribution of site statuses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={STATUS_DISTRIBUTION_DATA}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {STATUS_DISTRIBUTION_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Financial Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Financial Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span>Financial Overview</span>
              </CardTitle>
              <CardDescription>
                Investment vs Budget utilization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={FINANCIAL_TREND_DATA}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip formatter={(value, name) => [`£${value.toLocaleString()}`, name]} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="investment"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    name="Investment"
                  />
                  <Line
                    type="monotone"
                    dataKey="budget"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Total Budget"
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-gray-600">Total Investment</p>
                  <p className="text-xl font-bold text-gray-900">
                    £{MOCK_FINANCIAL_DATA.totalInvestment.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-gray-600">Remaining Budget</p>
                  <p className="text-xl font-bold text-gray-900">
                    £{MOCK_FINANCIAL_DATA.remainingBudget.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Deployments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                <span>Weekly Deployments</span>
              </CardTitle>
              <CardDescription>
                Deployment progress by week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={WEEKLY_DEPLOYMENT_DATA}>
                  <XAxis dataKey="week" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="deployed" fill="#10b981" name="Deployed" />
                  <Bar dataKey="inProgress" fill="#8b5cf6" name="In Progress" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Operations Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-600" />
                <span>Operations Metrics</span>
              </CardTitle>
              <CardDescription>
                Key operational performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {OPERATIONS_DATA.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.metric}</p>
                      <p className="text-xs text-gray-600">{item.unit}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-600" />
                <span>Performance Indicators</span>
              </CardTitle>
              <CardDescription>
                Performance metrics and utilization rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {MOCK_PLATFORM_DATA.avgGoLiveDays} days
                  </div>
                  <p className="text-sm text-gray-600">Average Go-Live Time</p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, (MOCK_PLATFORM_DATA.avgGoLiveDays / 60) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {MOCK_FINANCIAL_DATA.budgetUtilization}%
                  </div>
                  <p className="text-sm text-gray-600">Budget Utilization</p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${MOCK_FINANCIAL_DATA.budgetUtilization}%` }}
                    ></div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {MOCK_FINANCIAL_DATA.resourceUtilization}%
                  </div>
                  <p className="text-sm text-gray-600">Resource Utilization</p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${MOCK_FINANCIAL_DATA.resourceUtilization}%` }}
                    ></div>
                  </div>
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