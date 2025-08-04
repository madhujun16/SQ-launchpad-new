import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building, 
  Users, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Bell,
  FileText,
  BarChart3,
  Target,
  Zap,
  Star,
  Award,
  Plus,
  Settings,
  Eye,
  Calendar,
  Package,
  Wrench,
  UserCheck,
  AlertCircle,
  Info,
  MapPin,
  ActivitySquare,
  Search,
  Truck
} from 'lucide-react';
import { DashboardService, DashboardMetrics, TaskQueueItem, ExceptionAlert } from '@/services/dashboardService';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

const DeploymentEngineerDashboard = () => {
  const { profile } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({});
  const [taskQueue, setTaskQueue] = useState<TaskQueueItem[]>([]);
  const [exceptionAlerts, setExceptionAlerts] = useState<ExceptionAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        if (profile?.user_id) {
          const [metricsData, taskQueueData, alertsData] = await Promise.all([
            DashboardService.getDeploymentEngineerDashboardMetrics(profile.user_id),
            DashboardService.getDeploymentEngineerTaskQueue(profile.user_id),
            DashboardService.getDeploymentEngineerExceptionAlerts(profile.user_id)
          ]);

          setMetrics(metricsData);
          setTaskQueue(taskQueueData);
          setExceptionAlerts(alertsData);
        }
      } catch (error) {
        console.error('Error fetching deployment engineer dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [profile?.user_id]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Deployment Engineer Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage site studies, hardware scoping, and deployment execution</p>
          </div>
          <div className="flex gap-2">
            <Link to="/deployment">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Settings className="mr-2 h-4 w-4" />
                Deployment Management
              </Button>
            </Link>
            <Link to="/site-study">
              <Button className="bg-green-600 hover:bg-green-700">
                <Search className="mr-2 h-4 w-4" />
                Site Studies
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Core Metrics Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Assigned Sites */}
          <Card className="border-primary/20 bg-card shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary-dark">Assigned Sites</CardTitle>
              <div className="p-2 rounded-lg bg-primary/5">
                <Building className="h-4 w-4 text-primary-dark" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-dark">{metrics.assignedSites || 0}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1 text-primary" />
                Your sites
              </div>
            </CardContent>
          </Card>

          {/* Site Studies In Progress */}
          <Card className="border-primary/20 bg-card shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary-dark">Site Studies In Progress</CardTitle>
              <div className="p-2 rounded-lg bg-blue-500/5">
                <Search className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-dark">{metrics.siteStudiesInProgress || 0}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1 text-blue-500" />
                Active studies
              </div>
            </CardContent>
          </Card>

          {/* Hardware Scoping Completed */}
          <Card className="border-primary/20 bg-card shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary-dark">Hardware Scoping Completed</CardTitle>
              <div className="p-2 rounded-lg bg-success/5">
                <Wrench className="h-4 w-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-dark">{metrics.hardwareScopingCompleted || 0}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <CheckCircle className="h-3 w-3 mr-1 text-success" />
                Scoping done
              </div>
            </CardContent>
          </Card>

          {/* Average Deployment Time */}
          <Card className="border-primary/20 bg-card shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary-dark">Avg Deployment Time</CardTitle>
              <div className="p-2 rounded-lg bg-warning/5">
                <Zap className="h-4 w-4 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-dark">{metrics.averageDeploymentTimePerSite || 0} days</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingDown className="h-3 w-3 mr-1 text-success" />
                From study start to activation
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Procurement Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-primary/20 bg-card shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center text-primary-dark">
                <Package className="mr-2 h-5 w-5 text-primary" />
                Requested
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{metrics.procurementRequested || 0}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Procurement requests
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-card shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center text-primary-dark">
                <CheckCircle className="mr-2 h-5 w-5 text-primary" />
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{metrics.procurementApproved || 0}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Approved requests
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-card shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center text-primary-dark">
                <Truck className="mr-2 h-5 w-5 text-primary" />
                Dispatched
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{metrics.procurementDispatched || 0}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Items dispatched
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Deployment Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-primary/20 bg-card shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center text-primary-dark">
                <Calendar className="mr-2 h-5 w-5 text-primary" />
                Scheduled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{metrics.deploymentScheduled || 0}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Deployments scheduled
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-card shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center text-primary-dark">
                <ActivitySquare className="mr-2 h-5 w-5 text-primary" />
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{metrics.deploymentInProgress || 0}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Currently deploying
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-card shadow-soft">
            <CardHeader>
                              <CardTitle className="flex items-center text-primary-dark">
                  <CheckCircle className="mr-2 h-5 w-5 text-primary" />
                  Live
                </CardTitle>
            </CardHeader>
            <CardContent>
                              <div className="text-3xl font-bold text-green-600">{metrics.deploymentLive || 0}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Successfully deployed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="task-queue" className="space-y-6">
          <TabsList className="bg-gray-100 border border-gray-300 rounded-lg p-1">
            <TabsTrigger value="task-queue" className="text-gray-800 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md px-3 py-2">
              Task Queue
            </TabsTrigger>
            <TabsTrigger value="deployment-status" className="text-gray-800 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md px-3 py-2">
              Deployment Status
            </TabsTrigger>
            <TabsTrigger value="exception-alerts" className="text-gray-800 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md px-3 py-2">
              Exception Alerts
            </TabsTrigger>
          </TabsList>

          {/* Task Queue Tab */}
          <TabsContent value="task-queue" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pending Tasks */}
              <Card className="border-primary/20 bg-card shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary-dark">
                    <Clock className="mr-2 h-5 w-5 text-primary" />
                    Pending Tasks
                  </CardTitle>
                  <CardDescription>
                    Tasks requiring immediate attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {taskQueue.length > 0 ? (
                      taskQueue.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{task.title}</h4>
                            <p className="text-sm text-gray-600">{task.description}</p>
                            <div className="flex items-center mt-2">
                              <Badge className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                              <span className="text-xs text-gray-500 ml-2">
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                              </span>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Tasks</h3>
                        <p className="text-gray-600">All tasks are up to date!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-primary/20 bg-card shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary-dark">
                    <Activity className="mr-2 h-5 w-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>
                    Common deployment tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link to="/site-study">
                      <Button className="w-full justify-start" variant="outline">
                        <Search className="mr-2 h-4 w-4" />
                        Conduct Site Study
                      </Button>
                    </Link>
                    <Link to="/hardware-scoping">
                      <Button className="w-full justify-start" variant="outline">
                                                 <Wrench className="mr-2 h-4 w-4" />
                         Hardware Scoping
                      </Button>
                    </Link>
                    <Link to="/deployment">
                      <Button className="w-full justify-start" variant="outline">
                                                 <ActivitySquare className="mr-2 h-4 w-4" />
                         Deployment Status
                      </Button>
                    </Link>
                    <Link to="/inventory">
                      <Button className="w-full justify-start" variant="outline">
                        <Package className="mr-2 h-4 w-4" />
                        Inventory Check
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Deployment Status Tab */}
          <TabsContent value="deployment-status" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Deployment Overview */}
              <Card className="border-primary/20 bg-card shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary-dark">
                    <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                    Deployment Overview
                  </CardTitle>
                  <CardDescription>
                    Current deployment progress across assigned sites
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Scheduled</span>
                      <span className="font-medium text-blue-600">{metrics.deploymentScheduled || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">In Progress</span>
                      <span className="font-medium text-yellow-600">{metrics.deploymentInProgress || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                                              <span className="text-sm text-gray-600">Live</span>
                                              <span className="font-medium text-green-600">{metrics.deploymentLive || 0}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">Total Sites</span>
                        <span className="font-bold text-gray-900">{metrics.assignedSites || 0}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Procurement Status */}
              <Card className="border-primary/20 bg-card shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary-dark">
                    <Package className="mr-2 h-5 w-5 text-primary" />
                    Procurement Status
                  </CardTitle>
                  <CardDescription>
                    Current procurement progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Requested</span>
                      <span className="font-medium text-blue-600">{metrics.procurementRequested || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Approved</span>
                      <span className="font-medium text-green-600">{metrics.procurementApproved || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Dispatched</span>
                      <span className="font-medium text-yellow-600">{metrics.procurementDispatched || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Exception Alerts Tab */}
          <TabsContent value="exception-alerts" className="space-y-6">
            <div className="space-y-4">
              {exceptionAlerts.length > 0 ? (
                exceptionAlerts.map((alert) => (
                  <Alert key={alert.id} className="border-l-4 border-l-red-500">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{alert.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(alert.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Exception Alerts</h3>
                  <p className="text-gray-600">All systems are operating normally!</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DeploymentEngineerDashboard; 