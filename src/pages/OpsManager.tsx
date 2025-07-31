import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin,
  Calendar,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getRoleConfig, hasPermission } from "@/lib/roles";
import { useNavigate } from "react-router-dom";
import RoleIndicator from "@/components/RoleIndicator";
import { toast } from "sonner";
import React from "react";

const OpsManager = () => {
  const { currentRole } = useAuth();
  const navigate = useNavigate();

  // Check if user has ops manager access
  React.useEffect(() => {
    if (currentRole && !hasPermission(currentRole, 'approve_hardware_requests')) {
      toast.error('You do not have permission to access the Ops Manager panel');
      navigate('/dashboard');
    }
  }, [currentRole, navigate]);

  const activeProjects = [
    {
      id: 1,
      siteName: "Manchester Central",
      location: "Manchester, UK",
      status: "In Progress",
      progress: 75,
      dueDate: "2024-08-15",
      team: 4,
      priority: "High"
    },
    {
      id: 2,
      siteName: "London Bridge Hub",
      location: "London, UK", 
      status: "Planning",
      progress: 25,
      dueDate: "2024-09-01",
      team: 6,
      priority: "Medium"
    },
    {
      id: 3,
      siteName: "Birmingham Office",
      location: "Birmingham, UK",
      status: "Review",
      progress: 90,
      dueDate: "2024-07-30",
      team: 3,
      priority: "High"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-500';
      case 'Planning': return 'bg-yellow-500';
      case 'Review': return 'bg-green-500';
      case 'Completed': return 'bg-green-600';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // If user doesn't have ops manager permissions, show access denied
  if (currentRole && !hasPermission(currentRole, 'approve_hardware_requests')) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
            <p className="text-muted-foreground">
              You do not have permission to access the Ops Manager panel.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const roleConfig = currentRole ? getRoleConfig(currentRole) : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">Operations Manager Dashboard</h1>
            <RoleIndicator />
          </div>
          <p className="text-muted-foreground">
            {roleConfig?.description || 'Monitor and manage site onboarding operations across all locations.'}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+3 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">Across all projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">3 critical, 4 medium</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">+5% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Projects */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Active Projects
            </CardTitle>
            <CardDescription>
              Current site onboarding projects and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{project.siteName}</h3>
                      <Badge className={`text-white ${getStatusColor(project.status)}`}>
                        {project.status}
                      </Badge>
                      <Badge variant="outline" className={`text-white ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {project.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {project.team} team members
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Due: {project.dueDate}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{project.progress}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button size="sm">
                      Update Status
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Task Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                Review Pending Tasks
              </Button>
              <Button className="w-full" variant="outline">
                Assign Resources
              </Button>
              <Button className="w-full" variant="outline">
                Update Timeline
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                View Team Performance
              </Button>
              <Button className="w-full" variant="outline">
                Schedule Training
              </Button>
              <Button className="w-full" variant="outline">
                Resource Planning
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Issue Resolution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                Critical Issues (3)
              </Button>
              <Button className="w-full" variant="outline">
                Escalate to Admin
              </Button>
              <Button className="w-full" variant="outline">
                Generate Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default OpsManager;