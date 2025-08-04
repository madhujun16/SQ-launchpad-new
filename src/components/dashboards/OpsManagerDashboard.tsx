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
  Users, 
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
  Wrench,
  UserCheck,
  PieChart,
  BarChart3,
  Calendar,
  MapPin,
  Shield
} from '@/lib/icons';
import { getOpsManagerDashboardMetrics, getTaskQueueItems, getExceptionAlerts, DashboardMetrics, TaskQueueItem, ExceptionAlert } from '@/services/dashboardService';
import { useAuth } from '@/hooks/useAuth';
import { WorkflowStatusBadge } from '@/components/ui/WorkflowStatusBadge';
import { TaskQueueCard } from '@/components/ui/TaskQueueCard';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { Site, Alert as AlertType, TaskQueue } from '@/types/workflow';

// Mock data for Ops Manager
const mockOpsManagerAlerts: AlertType[] = [
  {
    id: '1',
    type: 'approval_overdue',
    severity: 'high',
    title: 'Hardware Approval Overdue',
    message: 'Hardware request for Tesco Birmingham has been pending for 5 days',
    entityType: 'hardware_request',
    entityId: 'hw-001',
    assignedTo: 'ops_manager',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'deployment_delay',
    severity: 'medium',
    title: 'Site Study Delayed',
    message: 'Site study for ASDA Coventry is 2 days behind schedule',
    entityType: 'site_study',
    entityId: 'study-001',
    assignedTo: 'ops_manager',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
];

const mockOpsManagerTasks: TaskQueue[] = [
  {
    id: '1',
    title: 'Approve Hardware Request',
    description: 'Review and approve hardware specifications for Tesco Birmingham',
    type: 'approval',
    priority: 'high',
    status: 'pending',
    assignedTo: 'ops_manager',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    siteId: 'site-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Review Site Study',
    description: 'Review completed site study for ASDA Coventry',
    type: 'approval',
    priority: 'medium',
    status: 'in_progress',
    assignedTo: 'ops_manager',
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
    status: 'in_progress',
    createdBy: 'admin',
    assignedTo: 'ops_manager',
    workflowStatus: {
      siteId: 'site-001',
      deploymentStage: 'approval_pending',
      approvalStatus: 'pending',
      assetStage: 'scoped',
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
    status: 'study_completed',
    createdBy: 'admin',
    assignedTo: 'ops_manager',
    workflowStatus: {
      siteId: 'site-002',
      deploymentStage: 'study_completed',
      approvalStatus: 'approved',
      assetStage: 'scoped',
      goLiveStatus: 'not_ready',
      lastUpdated: new Date().toISOString(),
      updatedBy: 'ops_manager',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const OpsManagerDashboard = () => {
  const { currentRole } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  // Queries
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['ops-manager-dashboard-metrics'],
    queryFn: getOpsManagerDashboardMetrics,
  });

  const { data: taskQueue, isLoading: taskQueueLoading } = useQuery({
    queryKey: ['ops-manager-task-queue'],
    queryFn: getTaskQueueItems,
  });

  const { data: exceptionAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['ops-manager-exception-alerts'],
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

  const activeAlerts = mockOpsManagerAlerts.filter(alert => !dismissedAlerts.includes(alert.id));

  if (metricsLoading || taskQueueLoading || alertsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-muted-foreground">Loading ops manager dashboard...</p>
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
              <Shield className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Review Approvals</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Review pending hardware requests</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">My Sites</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">View assigned sites</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Calendar View</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Schedule overview</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg">Site Studies</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Conduct site studies</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="sites">My Sites</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
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
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.pendingApprovals || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics?.overdueApprovals || 0} overdue
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Site Studies</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
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
                <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.approvalRate || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest approvals and site updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exceptionAlerts?.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full bg-${alert.severity === 'high' ? 'red' : 'yellow'}-500`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{alert.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          {/* Approval Queue */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Approval Queue</h3>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {mockOpsManagerTasks.map((task) => (
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

        <TabsContent value="calendar" className="space-y-6">
          {/* Calendar View */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Approvals Due</span>
                    <span>{metrics?.approvalsThisWeek || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Site Studies</span>
                    <span>{metrics?.studiesThisWeek || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Deployments</span>
                    <span>{metrics?.deploymentsThisWeek || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Next Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Approvals Due</span>
                    <span>{metrics?.approvalsNextWeek || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Site Studies</span>
                    <span>{metrics?.studiesNextWeek || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Deployments</span>
                    <span>{metrics?.deploymentsNextWeek || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Today</span>
                    <span>{metrics?.deadlinesToday || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>This Week</span>
                    <span>{metrics?.deadlinesThisWeek || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Overdue</span>
                    <span className="text-red-600">{metrics?.overdueDeadlines || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calendar Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>Schedule overview and important dates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Calendar component placeholder - Monthly view with deadlines and events
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OpsManagerDashboard; 