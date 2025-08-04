import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building, 
  Shield, 
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
  PieChart,
  Target,
  Zap,
  Star,
  Award,
  Plus,
  Settings,
  Eye,
  Calendar,
  DollarSign,
  Package,
  Wrench,
  UserCheck,
  AlertCircle,
  Info
} from 'lucide-react';
import { DashboardService, DashboardMetrics, TaskQueueItem, ExceptionAlert } from '@/services/dashboardService';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { profile } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({});
  const [taskQueue, setTaskQueue] = useState<TaskQueueItem[]>([]);
  const [exceptionAlerts, setExceptionAlerts] = useState<ExceptionAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [metricsData, taskQueueData, alertsData] = await Promise.all([
          DashboardService.getAdminDashboardMetrics(),
          DashboardService.getAdminTaskQueue(),
          DashboardService.getAdminExceptionAlerts()
        ]);

        setMetrics(metricsData);
        setTaskQueue(taskQueueData);
        setExceptionAlerts(alertsData);
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Full visibility and control across all sites, users, and operations</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Settings className="mr-2 h-4 w-4" />
                Site Management
              </Button>
            </Link>
            <Link to="/site-creation">
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Add New Site
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Core Metrics Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Sites Created */}
          <Card className="border-primary/20 bg-card shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary-dark">Total Sites Created</CardTitle>
              <div className="p-2 rounded-lg bg-primary/5">
                <Building className="h-4 w-4 text-primary-dark" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-dark">{metrics.totalSites || 0}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-success" />
                +12% from last month
              </div>
            </CardContent>
          </Card>

          {/* Site Studies In Progress */}
          <Card className="border-primary/20 bg-card shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary-dark">Site Studies In Progress</CardTitle>
              <div className="p-2 rounded-lg bg-blue-500/5">
                <FileText className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-dark">{metrics.sitesInProgress || 0}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1 text-blue-500" />
                Active studies
              </div>
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card className="border-primary/20 bg-card shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary-dark">Pending Approvals</CardTitle>
              <div className="p-2 rounded-lg bg-warning/5">
                <AlertTriangle className="h-4 w-4 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-dark">{metrics.pendingApprovals || 0}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <AlertCircle className="h-3 w-3 mr-1 text-warning" />
                Requires attention
              </div>
            </CardContent>
          </Card>

          {/* Total Active Sites */}
          <Card className="border-primary/20 bg-card shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary-dark">Total Active Sites</CardTitle>
              <div className="p-2 rounded-lg bg-success/5">
                <CheckCircle className="h-4 w-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-dark">{metrics.totalActiveSites || 0}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-success" />
                +8% from last month
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Active Licenses */}
          <Card className="border-primary/20 bg-card shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center text-primary-dark">
                <Shield className="mr-2 h-5 w-5 text-primary" />
                Total Active Licenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{metrics.totalActiveLicenses || 0}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Active software and hardware licenses
              </p>
            </CardContent>
          </Card>

          {/* Average Deployment Time */}
          <Card className="border-primary/20 bg-card shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center text-primary-dark">
                <Zap className="mr-2 h-5 w-5 text-primary" />
                Average Deployment Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary-dark">{metrics.averageDeploymentTime || 0} days</div>
              <p className="text-xs text-muted-foreground mt-2">
                From site study start to activation
              </p>
            </CardContent>
          </Card>

          {/* Procurement Spend */}
          <Card className="border-primary/20 bg-card shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center text-primary-dark">
                <DollarSign className="mr-2 h-5 w-5 text-primary" />
                Procurement Spend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">£{metrics.procurementSpend?.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Total asset procurement cost
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
            <TabsTrigger value="audit-oversight" className="text-gray-800 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md px-3 py-2">
              Audit & Oversight
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
                    Common administrative tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link to="/site-creation">
                      <Button className="w-full justify-start" variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Site
                      </Button>
                    </Link>
                    <Link to="/admin">
                      <Button className="w-full justify-start" variant="outline">
                        <Users className="mr-2 h-4 w-4" />
                        Manage Users
                      </Button>
                    </Link>
                    <Link to="/inventory">
                      <Button className="w-full justify-start" variant="outline">
                        <Package className="mr-2 h-4 w-4" />
                        Inventory Management
                      </Button>
                    </Link>
                    <Link to="/license-management">
                      <Button className="w-full justify-start" variant="outline">
                        <Shield className="mr-2 h-4 w-4" />
                        License Management
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Audit & Oversight Tab */}
          <TabsContent value="audit-oversight" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Audit Trail */}
              <Card className="border-primary/20 bg-card shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary-dark">
                    <FileText className="mr-2 h-5 w-5 text-primary" />
                    Recent Audit Trail
                  </CardTitle>
                  <CardDescription>
                    Last 7 days of system activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <Info className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Audit Trail</h3>
                      <p className="text-gray-600">Audit logging will be implemented in the next phase</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Overview */}
              <Card className="border-primary/20 bg-card shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary-dark">
                    <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                    System Overview
                  </CardTitle>
                  <CardDescription>
                    Key system metrics and health
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Users</span>
                      <span className="font-medium">24</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">System Uptime</span>
                      <span className="font-medium text-green-600">99.9%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Data Sync Status</span>
                      <span className="font-medium text-green-600">Synced</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Last Backup</span>
                      <span className="font-medium">2 hours ago</span>
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

export default AdminDashboard; 