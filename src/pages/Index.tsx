import Header from "@/components/Header";
import DashboardStats from "@/components/DashboardStats";
import WorkflowCard from "@/components/WorkflowCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building, 
  Shield, 
  Users, 
  Wrench, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Bell,
  FileText,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Star,
  Award,
  Plus
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getRoleConfig, canAccessPage } from "@/lib/roles";

const Index = () => {
  const { currentRole } = useAuth();
  const roleConfig = currentRole ? getRoleConfig(currentRole) : null;

  const recentActivities = [
    {
      title: "Manchester Central Cafeteria",
      location: "Manchester, UK",
      assignee: "Sarah Johnson",
      dueDate: "Due in 3 days",
      status: "in-progress" as const,
      description: "Site study completed, awaiting cost approval",
      client: "Compass Group",
      type: "mixed",
      progress: 75,
      priority: "high"
    },
    {
      title: "Birmingham Office Cafeteria",
      location: "Birmingham, UK", 
      assignee: "Mike Thompson",
      dueDate: "Due today",
      status: "pending" as const,
      description: "Awaiting Ops Manager approval for hardware procurement",
      client: "Compass Group",
      type: "staff",
      progress: 45,
      priority: "medium"
    },
    {
      title: "Leeds Shopping Center Cafeteria",
      location: "Leeds, UK",
      assignee: "Emma Wilson", 
      dueDate: "Completed",
      status: "completed" as const,
      description: "Full deployment completed, systems integrated successfully",
      client: "Compass Group",
      type: "mixed",
      progress: 100,
      priority: "low"
    },
    {
      title: "Liverpool Business Park",
      location: "Liverpool, UK",
      assignee: "David Brown",
      dueDate: "Due in 1 week",
      status: "in-progress" as const,
      description: "Hardware installation in progress",
      client: "Compass Group",
      type: "visitor",
      progress: 60,
      priority: "high"
    }
  ];

  const notifications = [
    {
      id: 1,
      title: "Hardware approval required",
      message: "Birmingham Office Cafeteria needs hardware approval",
      type: "warning",
      time: "2 hours ago"
    },
    {
      id: 2,
      title: "Site study completed",
      message: "Manchester Central site study has been completed",
      type: "success",
      time: "4 hours ago"
    },
    {
      id: 3,
      title: "New deployment started",
      message: "Liverpool Business Park deployment initiated",
      type: "info",
      time: "6 hours ago"
    }
  ];

  const performanceMetrics = {
    totalSites: 24,
    activeDeployments: 18,
    inProgress: 4,
    pendingApproval: 2,
    completionRate: 85,
    averageDeploymentTime: 12,
    customerSatisfaction: 4.8
  };

  const getRoleSpecificActions = () => {
    if (!currentRole) return [];

    const actions = [];

    // Site Study - accessible to all users
    if (canAccessPage(currentRole, '/site-study')) {
      actions.push({
        label: 'Site Study',
        path: '/site-study',
        icon: Building,
        description: 'Conduct comprehensive site studies for cafeteria deployments',
        color: 'text-blue-600'
      });
    }

    // Site Creation - accessible to all users
    if (canAccessPage(currentRole, '/site-creation')) {
      actions.push({
        label: 'Create Site',
        path: '/site-creation',
        icon: Plus,
        description: 'Create new cafeteria sites and manage site information',
        color: 'text-green-600'
      });
    }

    // Role-specific actions
    if (canAccessPage(currentRole, '/admin')) {
      actions.push({
        label: 'Site Management',
        path: '/admin',
        icon: Shield,
        description: 'Manage Compass Group cafeteria sites and user assignments',
        color: 'text-red-600'
      });
    }

    if (canAccessPage(currentRole, '/ops-manager')) {
      actions.push({
        label: 'Ops Manager',
        path: '/ops-manager',
        icon: Users,
        description: 'Approve hardware requests and manage approvals',
        color: 'text-green-600'
      });
    }

    if (canAccessPage(currentRole, '/deployment')) {
      actions.push({
        label: 'Deployment',
        path: '/deployment',
        icon: Wrench,
        description: 'Manage deployment tasks and site status',
        color: 'text-purple-600'
      });
    }

    return actions;
  };

  const roleActions = getRoleSpecificActions();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'info':
        return <Activity className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Dashboard Content */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
                <p className="text-muted-foreground">
                  Welcome back! Here's your {roleConfig?.displayName.toLowerCase()} overview for Compass Group cafeterias
                </p>
                {roleConfig && (
                  <div className="flex items-center mt-2">
                    <roleConfig.icon className={`h-5 w-5 mr-2 ${roleConfig.color}`} />
                    <span className={`text-sm ${roleConfig.color} font-medium`}>
                      {roleConfig.description}
                    </span>
                  </div>
                )}
              </div>
              {roleActions.length > 0 && (
                <div className="flex gap-2">
                  {roleActions.map((action) => (
                    <Link key={action.path} to={action.path}>
                      <Button className="bg-primary hover:bg-primary-dark">
                        <action.icon className="mr-2 h-4 w-4" />
                        {action.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cafeterias</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceMetrics.totalSites}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  +12% from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Deployments</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceMetrics.activeDeployments}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  +8% from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceMetrics.inProgress}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                  -2 from last week
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceMetrics.pendingApproval}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1 text-yellow-500" />
                  Requires attention
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{performanceMetrics.completionRate}%</div>
                <Progress value={performanceMetrics.completionRate} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Target: 90% | Current: {performanceMetrics.completionRate}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="mr-2 h-5 w-5" />
                  Avg Deployment Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{performanceMetrics.averageDeploymentTime} days</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Target: 10 days | Current: {performanceMetrics.averageDeploymentTime} days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="mr-2 h-5 w-5" />
                  Customer Satisfaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{performanceMetrics.customerSatisfaction}/5.0</div>
                <div className="flex mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`h-4 w-4 ${star <= performanceMetrics.customerSatisfaction ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="activities" className="space-y-6">
            <TabsList>
              <TabsTrigger value="activities">Recent Activities</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="quick-actions">Quick Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="activities" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {recentActivities.map((activity, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{activity.title}</CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {activity.location}
                          </CardDescription>
                        </div>
                        <div className="flex gap-1">
                          <Badge className={getStatusColor(activity.status)}>
                            {activity.status.replace('-', ' ')}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(activity.priority)}>
                            {activity.priority}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Client</span>
                          <span className="font-medium">{activity.client}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Assigned to</span>
                          <span className="font-medium">{activity.assignee}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Due date</span>
                          <span className="font-medium">{activity.dueDate}</span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{activity.progress}%</span>
                          </div>
                          <Progress value={activity.progress} className="h-2" />
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {activity.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card key={notification.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-foreground">{notification.title}</h4>
                            <span className="text-xs text-muted-foreground">{notification.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="quick-actions" className="space-y-6">
              {roleActions.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {roleActions.map((action) => (
                    <Link key={action.path} to={action.path}>
                      <div className="p-6 border border-border rounded-lg hover:border-primary transition-colors cursor-pointer group">
                        <div className="flex items-center mb-3">
                          <action.icon className={`h-6 w-6 mr-3 ${action.color} group-hover:scale-110 transition-transform`} />
                          <h4 className="font-semibold text-foreground">{action.label}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Quick Actions Available</h3>
                  <p className="text-muted-foreground">
                    Quick actions will appear here based on your role permissions.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Index;
