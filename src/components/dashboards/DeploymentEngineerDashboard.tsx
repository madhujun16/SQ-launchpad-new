import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building, 
  Wrench, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Eye,
  Download,
  Upload,
  List,
  Search,
  SettingsIcon,
  Mail,
  Activity,
  ClipboardList,
  Truck,
  AlertCircle,
  Info,
  TrendingUp,
  TrendingDown,
  DollarSign,
  UserCheck,
  PieChart,
  BarChart3,
  Calendar,
  MapPin,
  Shield,
  FileText,
  Plus
} from '@/lib/icons';
import { getDeploymentEngineerDashboardMetrics, getTaskQueueItems, getExceptionAlerts, DashboardMetrics, TaskQueueItem, ExceptionAlert } from '@/services/dashboardService';
import { useAuth } from '@/hooks/useAuth';
import { WorkflowStatusBadge } from '@/components/ui/WorkflowStatusBadge';
import { TaskQueueCard } from '@/components/ui/TaskQueueCard';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { Site, Alert as AlertType, TaskQueue } from '@/types/workflow';

// Mock data for Deployment Engineer
const mockDeploymentEngineerAlerts: AlertType[] = [
  {
    id: '1',
    type: 'deployment_delay',
    severity: 'high',
    title: 'Deployment Overdue',
    message: 'Hardware deployment for Tesco Birmingham is 3 days overdue',
    entityType: 'deployment',
    entityId: 'deployment-001',
    assignedTo: 'deployment_engineer',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'service_due',
    severity: 'medium',
    title: 'Site Study Due',
    message: 'Site study for ASDA Coventry needs to be completed by tomorrow',
    entityType: 'site_study',
    entityId: 'study-001',
    assignedTo: 'deployment_engineer',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
];

const mockDeploymentEngineerTasks: TaskQueue[] = [
  {
    id: '1',
    title: 'Complete Site Study',
    description: 'Conduct site study for Tesco Birmingham and upload findings',
    type: 'study',
    priority: 'high',
    status: 'in_progress',
    assignedTo: 'deployment_engineer',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    siteId: 'site-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Deploy Hardware',
    description: 'Deploy POS systems and networking equipment for ASDA Coventry',
    type: 'deployment',
    priority: 'medium',
    status: 'pending',
    assignedTo: 'deployment_engineer',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    siteId: 'site-002',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockAssignedSites: Site[] = [
  {
    id: 'site-001',
    name: 'Tesco Birmingham',
    type: 'supermarket',
    location: 'Birmingham, UK',
    status: 'study_in_progress',
    createdBy: 'admin',
    assignedTo: 'deployment_engineer',
    workflowStatus: {
      siteId: 'site-001',
      deploymentStage: 'study_in_progress',
      approvalStatus: 'pending',
      assetStage: 'not_required',
      goLiveStatus: 'not_ready',
      lastUpdated: new Date().toISOString(),
      updatedBy: 'deployment_engineer',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'site-002',
    name: 'ASDA Coventry',
    type: 'supermarket',
    location: 'Coventry, UK',
    status: 'deployment_scheduled',
    createdBy: 'admin',
    assignedTo: 'deployment_engineer',
    workflowStatus: {
      siteId: 'site-002',
      deploymentStage: 'deployment_scheduled',
      approvalStatus: 'approved',
      assetStage: 'ordered',
      goLiveStatus: 'not_ready',
      lastUpdated: new Date().toISOString(),
      updatedBy: 'ops_manager',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DeploymentEngineerDashboard = () => {
  const { currentRole } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  // Queries
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['deployment-engineer-dashboard-metrics'],
    queryFn: getDeploymentEngineerDashboardMetrics,
  });

  const { data: taskQueue, isLoading: taskQueueLoading } = useQuery({
    queryKey: ['deployment-engineer-task-queue'],
    queryFn: getTaskQueueItems,
  });

  const { data: exceptionAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['deployment-engineer-exception-alerts'],
    queryFn: getExceptionAlerts,
  });

  const handleAlertDismiss = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
  };

  const handleAlertAction = (alertId: string, action: string) => {
    console.log(`Alert ${alertId} action: ${action}`);
    // Implement alert action handling
  };

  const handleTaskAction = (taskId: string, action: 'start' | 'complete' | 'cancel') => {
    console.log(`Task ${taskId} action: ${action}`);
    // Implement task action handling
  };

  const activeAlerts = mockDeploymentEngineerAlerts.filter(alert => !dismissedAlerts.includes(alert.id));

  if (metricsLoading || taskQueueLoading || alertsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-muted-foreground">Loading deployment engineer dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alerts Section */}
      {activeAlerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <span>Active Alerts</span>
            <Badge variant="secondary">{activeAlerts.length}</Badge>
          </h3>
          {activeAlerts.map((alert) => (
            <AlertBanner
              key={alert.id}
              alert={alert}
              onDismiss={handleAlertDismiss}
              onAction={handleAlertAction}
              showActions={true}
            />
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Start Study</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Begin new site study</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Deploy Hardware</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Deploy equipment to site</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Upload Reports</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Submit status reports</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <ClipboardList className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg">Checklist</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">View deployment checklist</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="sites">Assigned Sites</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assigned Sites</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.assignedSites || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics?.activeSites || 0} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.pendingTasks || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics?.overdueTasks || 0} overdue
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Site Studies</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.siteStudies || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics?.completedStudies || 0} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Deployments</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.deployments || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics?.completedDeployments || 0} completed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Completion Rate</CardTitle>
                <CardDescription>This month's task completion progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Completed</span>
                    <span>{metrics?.completedTasks || 0}</span>
                  </div>
                  <Progress value={metrics?.taskCompletionRate || 0} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Target: 90%</span>
                    <span>{metrics?.taskCompletionRate || 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deployment Success Rate</CardTitle>
                <CardDescription>Successful deployments this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Successful</span>
                    <span>{metrics?.successfulDeployments || 0}</span>
                  </div>
                  <Progress value={metrics?.deploymentSuccessRate || 0} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Target: 95%</span>
                    <span>{metrics?.deploymentSuccessRate || 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          {/* Task Queue */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">My Task Queue</h3>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {mockDeploymentEngineerTasks.map((task) => (
                <TaskQueueCard
                  key={task.id}
                  task={task}
                  onAction={handleTaskAction}
                  showActions={true}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sites" className="space-y-6">
          {/* Assigned Sites */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">My Assigned Sites</h3>
              <Button variant="outline" size="sm">
                <MapPin className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockAssignedSites.map((site) => (
                <Card key={site.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{site.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {site.location} • {site.type}
                        </CardDescription>
                      </div>
                      <WorkflowStatusBadge 
                        stage={site.workflowStatus.deploymentStage}
                        showIcon={true}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Status:</span>
                        <Badge variant="outline">{site.status}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Last Updated:</span>
                        <span>{new Date(site.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          <Activity className="h-4 w-4 mr-1" />
                          Update Status
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="deployments" className="space-y-6">
          {/* Deployment Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Deployment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Scheduled</span>
                    <span>{metrics?.deploymentsScheduled || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>In Progress</span>
                    <span>{metrics?.deploymentsInProgress || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Completed</span>
                    <span>{metrics?.deploymentsCompleted || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Deployment Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>This Week</span>
                    <span>{metrics?.deploymentsThisWeek || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Next Week</span>
                    <span>{metrics?.deploymentsNextWeek || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>This Month</span>
                    <span>{metrics?.deploymentsThisMonth || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall</span>
                    <span>{metrics?.deploymentSuccessRate || 0}%</span>
                  </div>
                  <Progress value={metrics?.deploymentSuccessRate || 0} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Last 30 days</span>
                    <span>{metrics?.deploymentSuccessRateLastMonth || 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Deployment Checklist */}
          <Card>
            <CardHeader>
              <CardTitle>Deployment Checklist</CardTitle>
              <CardDescription>Standard deployment procedures and quality checks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Pre-Deployment</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Site study completed</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Hardware approved</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Equipment delivered</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Deployment</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Install POS systems</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Configure networking</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Test connectivity</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeploymentEngineerDashboard; 