import Header from "@/components/Header";
import DashboardStats from "@/components/DashboardStats";
import WorkflowCard from "@/components/WorkflowCard";
import { Button } from "@/components/ui/button";
import { Building, Shield, Users, Wrench, MapPin, Calendar, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getRoleConfig, canAccessPage } from "@/lib/roles";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
      type: "mixed"
    },
    {
      title: "Birmingham Office Cafeteria",
      location: "Birmingham, UK", 
      assignee: "Mike Thompson",
      dueDate: "Due today",
      status: "pending" as const,
      description: "Awaiting Ops Manager approval for hardware procurement",
      client: "Compass Group",
      type: "staff"
    },
    {
      title: "Leeds Shopping Center Cafeteria",
      location: "Leeds, UK",
      assignee: "Emma Wilson", 
      dueDate: "Completed",
      status: "completed" as const,
      description: "Full deployment completed, systems integrated successfully",
      client: "Compass Group",
      type: "mixed"
    }
  ];

  const getRoleSpecificActions = () => {
    if (!currentRole) return [];

    const actions = [];

    if (canAccessPage(currentRole, '/site-study')) {
      actions.push({
        label: 'Site Study',
        path: '/site-study',
        icon: Building,
        description: 'Conduct site studies for cafeteria deployments'
      });
    }

    if (canAccessPage(currentRole, '/admin')) {
      actions.push({
        label: 'Site Management',
        path: '/admin',
        icon: Shield,
        description: 'Manage Compass Group cafeteria sites'
      });
    }

    if (canAccessPage(currentRole, '/ops-manager')) {
      actions.push({
        label: 'Ops Manager',
        path: '/ops-manager',
        icon: Users,
        description: 'Approve hardware requests and manage approvals'
      });
    }

    if (canAccessPage(currentRole, '/deployment')) {
      actions.push({
        label: 'Deployment',
        path: '/deployment',
        icon: Wrench,
        description: 'Manage deployment tasks and site status'
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Dashboard Content */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cafeterias</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">Compass Group locations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Deployments</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18</div>
                <p className="text-xs text-muted-foreground">Successfully deployed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-muted-foreground">Currently being deployed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">Awaiting Ops Manager</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12">
            <h3 className="text-2xl font-semibold mb-6 text-foreground">Recent Cafeteria Activities</h3>
            <div className="grid md:grid-cols-3 gap-6">
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
                        <Badge variant="outline">
                          {activity.type}
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
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {activity.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Role-specific quick actions */}
          {roleActions.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-semibold mb-6 text-foreground">Quick Actions</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {roleActions.map((action) => (
                  <Link key={action.path} to={action.path}>
                    <div className="p-6 border border-border rounded-lg hover:border-primary transition-colors cursor-pointer">
                      <div className="flex items-center mb-3">
                        <action.icon className={`h-6 w-6 mr-3 ${roleConfig?.color}`} />
                        <h4 className="font-semibold text-foreground">{action.label}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
