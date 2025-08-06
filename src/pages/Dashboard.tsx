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
  Database
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getRoleConfig } from '@/lib/roles';

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

const Dashboard = () => {
  const { currentRole, profile } = useAuth();
  const roleConfig = getRoleConfig(currentRole || 'admin');

  // Mock data - in real app, this would come from API
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);

  useEffect(() => {
    // Generate role-specific metrics and widgets
    generateDashboardContent();
  }, [currentRole]);

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
        value: 5,
        change: '-3 this week',
        icon: AlertCircle,
        color: 'text-orange-600',
        description: 'Hardware requests awaiting review'
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
          title: 'Total Users',
          value: 24,
          change: '+3 this month',
          icon: Users,
          color: 'text-purple-600',
          description: 'Active platform users'
        },
        {
          title: 'Platform Health',
          value: '98%',
          change: '+2% this week',
          icon: Activity,
          color: 'text-green-600',
          description: 'System uptime and performance'
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
          title: 'My Deployments',
          value: 4,
          change: '+1 this week',
          icon: Wrench,
          color: 'text-green-600',
          description: 'Sites you\'re deploying'
        },
        {
          title: 'Completion Rate',
          value: '96%',
          change: '+2% this month',
          icon: TrendingUp,
          color: 'text-green-600',
          description: 'On-time deployment success'
        }
      );
    }

    setMetrics(baseMetrics);

    // Generate role-specific widgets
    const roleWidgets: DashboardWidget[] = [];

    // Common widgets for all roles
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
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Package className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Hardware approval requested for "Birmingham South"</p>
                  <p className="text-xs text-gray-500">6 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        )
      }
    );

    // Role-specific widgets
    if (currentRole === 'admin') {
      roleWidgets.push(
        {
          id: 'system-overview',
          title: 'System Overview',
          description: 'Platform-wide metrics and health',
          size: 'large',
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">98%</div>
                  <div className="text-sm text-gray-500">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">24</div>
                  <div className="text-sm text-gray-500">Active Users</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Storage Usage</span>
                  <span>75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
            </div>
          )
        },
        {
          id: 'user-management',
          title: 'User Management',
          description: 'Quick user actions and statistics',
          size: 'medium',
          content: (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">New Users This Month</span>
                <Badge variant="secondary">+3</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Pending Invitations</span>
                <Badge variant="outline">2</Badge>
              </div>
              <Button variant="gradient" size="sm" className="w-full">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
            </div>
          )
        }
      );
    } else if (currentRole === 'ops_manager') {
      roleWidgets.push(
        {
          id: 'approval-queue',
          title: 'Approval Queue',
          description: 'Pending hardware requests requiring your review',
          size: 'medium',
          content: (
            <div className="space-y-3">
              <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">Birmingham South</p>
                    <p className="text-xs text-gray-500">Hardware request - 2 items</p>
                  </div>
                  <Badge variant="secondary">High Priority</Badge>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">Leeds Central</p>
                    <p className="text-xs text-gray-500">Hardware request - 5 items</p>
                  </div>
                  <Badge variant="outline">Medium Priority</Badge>
                </div>
              </div>
              <Button variant="gradient" size="sm" className="w-full">
                <AlertCircle className="mr-2 h-4 w-4" />
                Review All Requests
              </Button>
            </div>
          )
        }
      );
    } else if (currentRole === 'deployment_engineer') {
      roleWidgets.push(
        {
          id: 'deployment-schedule',
          title: 'Deployment Schedule',
          description: 'Your upcoming deployment tasks',
          size: 'medium',
          content: (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">Manchester North</p>
                    <p className="text-xs text-gray-500">Scheduled for tomorrow</p>
                  </div>
                  <Badge variant="secondary">Ready</Badge>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">Liverpool East</p>
                    <p className="text-xs text-gray-500">Scheduled for Friday</p>
                  </div>
                  <Badge variant="outline">Pending</Badge>
                </div>
              </div>
              <Button variant="gradient" size="sm" className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                View Full Schedule
              </Button>
            </div>
          )
        }
      );
    }

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
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Building className="h-6 w-6" />
              <span className="text-sm font-medium">View Sites</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <FileText className="h-6 w-6" />
              <span className="text-sm font-medium">Site Study</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Package className="h-6 w-6" />
              <span className="text-sm font-medium">Hardware</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Database className="h-6 w-6" />
              <span className="text-sm font-medium">Inventory</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard; 