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
  Activity,
  Timer,
  Shield,
  HardDrive,
  Zap,
  Gauge
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
const SITE_WORKFLOW_STAGES_DATA = [
  { stage: 'Site Study', avgDays: 12, color: '#3B82F6' },
  { stage: 'Scoping', avgDays: 8, color: '#F59E0B' },
  { stage: 'Approval', avgDays: 5, color: '#8B5CF6' },
  { stage: 'Procurement', avgDays: 15, color: '#EF4444' },
  { stage: 'Deployment', avgDays: 10, color: '#10B981' },
  { stage: 'Go Live', avgDays: 3, color: '#06B6D4' }
];

const SITE_STAGES_BREAKUP_DATA = [
  { stage: 'Site Study', sites: 12, color: '#3B82F6' },
  { stage: 'Scoping', sites: 8, color: '#F59E0B' },
  { stage: 'Approval', sites: 5, color: '#8B5CF6' },
  { stage: 'Procurement', sites: 15, color: '#EF4444' },
  { stage: 'Deployment', sites: 10, color: '#10B981' },
  { stage: 'Go Live', sites: 6, color: '#06B6D4' }
];

const FINANCIAL_TREND_DATA = [
  { month: 'Jul', investment: 200000, opex: 2500, budget: 500000 },
  { month: 'Aug', investment: 250000, opex: 2600, budget: 500000 },
  { month: 'Sep', investment: 300000, opex: 2700, budget: 500000 }
];

const MONTHLY_DEPLOYMENT_DATA = [
  { month: 'Oct 24', deployed: 3, inProgress: 5 },
  { month: 'Nov 24', deployed: 4, inProgress: 4 },
  { month: 'Dec 24', deployed: 5, inProgress: 3 },
  { month: 'Jan 25', deployed: 6, inProgress: 2 },
  { month: 'Feb 25', deployed: 7, inProgress: 3 },
  { month: 'Mar 25', deployed: 8, inProgress: 1 },
  { month: 'Apr 25', deployed: 6, inProgress: 4 },
  { month: 'May 25', deployed: 9, inProgress: 2 },
  { month: 'Jun 25', deployed: 7, inProgress: 3 },
  { month: 'Jul 25', deployed: 8, inProgress: 2 },
  { month: 'Aug 25', deployed: 10, inProgress: 1 },
  { month: 'Sep 25', deployed: 9, inProgress: 2 }
];

const OPERATIONS_DATA = [
  { metric: 'Response Time', value: 2.3, unit: 'days', color: '#3B82F6', icon: Timer, trend: 'down', description: 'Less is good' },
  { metric: 'Software Licenses', value: 156, unit: 'licenses', color: '#10B981', icon: Shield, trend: 'neutral', description: 'Count' },
  { metric: 'Total Assets', value: 89, unit: 'assets', color: '#F59E0B', icon: HardDrive, trend: 'neutral', description: 'Hardware count' },
  { metric: 'Go-Live Time', value: 34.2, unit: 'days', color: '#EF4444', icon: Zap, trend: 'down', description: 'Less is good' }
];

const PERFORMANCE_DATA = [
  { metric: 'Sites On-Time Deployment', value: 75.0, unit: '%', color: '#10B981', icon: CheckCircle, description: 'Deployments on/before target date' },
  { metric: 'Budget Utilization', value: 78.5, unit: '%', color: '#3B82F6', icon: DollarSign, description: 'Budget consumed this year' },
  { metric: 'Resource Utilization', value: 92.3, unit: '%', color: '#F59E0B', icon: Gauge, description: 'Deployment engineers occupancy' }
];

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
    color: 'text-amber-600'
  },
  {
    title: 'Sites deployed successfully',
    value: '12',
    change: '+1 this week',
    icon: Truck,
    color: 'text-emerald-600'
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
  sitesOnTimeDeployment: 75.0,
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'User'}
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your deployment projects today.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_METRICS.map((metric, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{metric.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Site Workflow Stages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-primary" />
                <span>Workflow Stage Duration</span>
              </CardTitle>
              <CardDescription>
                Average days spent in each workflow stage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={SITE_WORKFLOW_STAGES_DATA} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                  <XAxis 
                    dataKey="stage" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    fontSize={12}
                  />
                  <YAxis domain={[0, 20]} />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip 
                    formatter={(value) => [`${value} days`, 'Avg Days']}
                    labelFormatter={(label) => `Stage: ${label}`}
                  />
                  <Bar dataKey="avgDays" fill="#3B82F6" name="Avg Days" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Site Stages Breakup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5 text-primary" />
                <span>Site Stages Breakup</span>
              </CardTitle>
              <CardDescription>
                Distribution of sites across workflow stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={SITE_STAGES_BREAKUP_DATA}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ stage, percent }) => `${stage} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="sites"
                  >
                    {SITE_STAGES_BREAKUP_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} sites`, 'Sites']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Financial Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Financial Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-primary" />
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
                    stroke="#3B82F6"
                    strokeWidth={3}
                    name="Investment"
                  />
                  <Line
                    type="monotone"
                    dataKey="budget"
                    stroke="#10B981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Total Budget"
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-700">Total Investment</p>
                  <p className="text-xl font-bold text-blue-900">
                    £{MOCK_FINANCIAL_DATA.totalInvestment.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-emerald-700">Remaining Budget</p>
                  <p className="text-xl font-bold text-emerald-900">
                    £{MOCK_FINANCIAL_DATA.remainingBudget.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Deployments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Monthly Deployments</span>
              </CardTitle>
              <CardDescription>
                Deployment progress by month (Oct 24 - Sep 25)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={MONTHLY_DEPLOYMENT_DATA}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="deployed"
                    stroke="#10B981"
                    strokeWidth={3}
                    name="Deployed"
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="inProgress"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    name="In Progress"
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Operations Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Activity className="h-5 w-5 text-blue-600" />
                <span>Operations Metrics</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Key operational performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {OPERATIONS_DATA.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 rounded-md" style={{ backgroundColor: `${item.color}20` }}>
                            <IconComponent className="h-4 w-4" style={{ color: item.color }} />
                          </div>
                          <div className="text-xs font-medium text-gray-600">{item.unit}</div>
                        </div>
                        <div className="text-lg font-bold text-gray-900">{item.value}</div>
                      </div>
                      <div className="text-sm font-medium text-gray-800">{item.metric}</div>
                      <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Target className="h-5 w-5 text-green-600" />
                <span>Performance Indicators</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Success rates and utilization metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Sites On-Time Deployment with Progress Bar */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-md" style={{ backgroundColor: `${PERFORMANCE_DATA[0].color}20` }}>
                        <CheckCircle className="h-4 w-4" style={{ color: PERFORMANCE_DATA[0].color }} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">{PERFORMANCE_DATA[0].metric}</div>
                        <div className="text-xs text-gray-500">{PERFORMANCE_DATA[0].description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{PERFORMANCE_DATA[0].value}%</div>
                    </div>
                  </div>
                  
                  {/* Simple Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${PERFORMANCE_DATA[0].value}%`,
                        backgroundColor: PERFORMANCE_DATA[0].color
                      }}
                    ></div>
                  </div>
                  
                  {/* Progress Labels */}
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Resource and Budget Utilization - Horizontal Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {PERFORMANCE_DATA.slice(1).map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="p-1.5 rounded-md" style={{ backgroundColor: `${item.color}20` }}>
                              <IconComponent className="h-4 w-4" style={{ color: item.color }} />
                            </div>
                            <div className="text-xs font-medium text-gray-600">{item.unit}</div>
                          </div>
                          <div className="text-lg font-bold text-gray-900">{item.value}%</div>
                        </div>
                        <div className="text-sm font-medium text-gray-800">{item.metric}</div>
                        <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>



        {/* Recent Requests */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Recent Requests</CardTitle>
                <CardDescription>
                  Latest procurement and approval requests
                </CardDescription>
              </div>
              <Button onClick={() => handleViewAll('/approvals')} variant="outline" className="border-border/50">
                View All
                <Eye className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_REQUESTS.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium text-foreground">{request.siteName}</p>
                      <p className="text-sm text-muted-foreground">Request #{request.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                    <Badge className={getPriorityColor(request.priority)}>
                      {request.priority}
                    </Badge>
                    <p className="text-sm font-medium text-foreground">
                      £{request.totalValue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => handleCreateNew('/sites/create')}
                className="h-20 flex flex-col items-center justify-center space-y-2 border-border/50 hover:bg-primary/5 hover:border-primary/20 transition-all duration-200"
                variant="outline"
              >
                <Plus className="h-6 w-6 text-primary" />
                <span className="text-foreground">Create New Site</span>
              </Button>
              <Button 
                onClick={() => handleViewAll('/sites')}
                className="h-20 flex flex-col items-center justify-center space-y-2 border-border/50 hover:bg-primary/5 hover:border-primary/20 transition-all duration-200"
                variant="outline"
              >
                <Building className="h-6 w-6 text-primary" />
                <span className="text-foreground">View All Sites</span>
              </Button>
              <Button 
                onClick={() => handleViewAll('/approvals')}
                className="h-20 flex flex-col items-center justify-center space-y-2 border-border/50 hover:bg-primary/5 hover:border-primary/20 transition-all duration-200"
                variant="outline"
              >
                <CheckCircle className="h-6 w-6 text-primary" />
                <span className="text-foreground">Review Approvals</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 