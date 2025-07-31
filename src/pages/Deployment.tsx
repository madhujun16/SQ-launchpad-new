import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Server, 
  Database, 
  Globe, 
  Settings, 
  Activity, 
  Wifi,
  Shield,
  HardDrive,
  Monitor,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getRoleConfig, hasPermission } from "@/lib/roles";
import { useNavigate } from "react-router-dom";
import RoleIndicator from "@/components/RoleIndicator";
import { toast } from "sonner";
import React from "react";

const Deployment = () => {
  const { currentRole } = useAuth();
  const navigate = useNavigate();

  // Check if user has deployment engineer access
  React.useEffect(() => {
    if (currentRole && !hasPermission(currentRole, 'conduct_site_studies')) {
      toast.error('You do not have permission to access the Deployment panel');
      navigate('/dashboard');
    }
  }, [currentRole, navigate]);

  const deployments = [
    {
      id: 1,
      siteName: "Manchester Central",
      environment: "Production",
      status: "Live",
      uptime: "99.9%",
      lastDeployed: "2024-07-28",
      version: "v2.1.4",
      health: "Healthy"
    },
    {
      id: 2,
      siteName: "London Bridge Hub",
      environment: "Staging",
      status: "Testing",
      uptime: "98.7%",
      lastDeployed: "2024-07-29",
      version: "v2.2.0-beta",
      health: "Warning"
    },
    {
      id: 3,
      siteName: "Birmingham Office",
      environment: "Production",
      status: "Deploying",
      uptime: "99.5%",
      lastDeployed: "2024-07-29",
      version: "v2.1.5",
      health: "Deploying"
    }
  ];

  const systemMetrics = [
    {
      name: "CPU Usage",
      value: "45%",
      status: "normal",
      icon: Monitor
    },
    {
      name: "Memory Usage",
      value: "67%",
      status: "warning",
      icon: HardDrive
    },
    {
      name: "Network Traffic",
      value: "1.2 GB/s",
      status: "normal",
      icon: Wifi
    },
    {
      name: "Database Load",
      value: "23%",
      status: "normal",
      icon: Database
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Live': return 'bg-green-500';
      case 'Testing': return 'bg-blue-500';
      case 'Deploying': return 'bg-yellow-500';
      case 'Offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'Healthy': return 'text-green-600';
      case 'Warning': return 'text-yellow-600';
      case 'Critical': return 'text-red-600';
      case 'Deploying': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getMetricColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // If user doesn't have deployment engineer permissions, show access denied
  if (currentRole && !hasPermission(currentRole, 'conduct_site_studies')) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
            <p className="text-muted-foreground">
              You do not have permission to access the Deployment panel.
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
            <h1 className="text-3xl font-bold text-foreground">Deployment Dashboard</h1>
            <RoleIndicator />
          </div>
          <p className="text-muted-foreground">
            {roleConfig?.description || 'Monitor and manage deployment operations across all sites.'}
          </p>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {systemMetrics.map((metric) => (
            <Card key={metric.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                <metric.icon className={`h-4 w-4 ${getMetricColor(metric.status)}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getMetricColor(metric.status)}`}>
                  {metric.value}
                </div>
                <p className="text-xs text-muted-foreground capitalize">{metric.status}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Active Deployments */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Site Deployments
            </CardTitle>
            <CardDescription>
              Current deployment status and system information for all sites
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deployments.map((deployment) => (
                <div key={deployment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{deployment.siteName}</h3>
                      <Badge className={`text-white ${getStatusColor(deployment.status)}`}>
                        {deployment.status}
                      </Badge>
                      <Badge variant="outline">
                        {deployment.environment}
                      </Badge>
                      <span className={`text-sm font-medium ${getHealthColor(deployment.health)}`}>
                        {deployment.health}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Activity className="h-4 w-4" />
                        Uptime: {deployment.uptime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Settings className="h-4 w-4" />
                        Version: {deployment.version}
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        Last Deployed: {deployment.lastDeployed}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Logs
                    </Button>
                    <Button variant="outline" size="sm">
                      SSH Access
                    </Button>
                    <Button size="sm">
                      Deploy Update
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Deployment Tools */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Deployment Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                Deploy to Staging
              </Button>
              <Button className="w-full" variant="outline">
                Deploy to Production
              </Button>
              <Button className="w-full" variant="outline">
                Rollback Deployment
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                Security Scan
              </Button>
              <Button className="w-full" variant="outline">
                Performance Monitor
              </Button>
              <Button className="w-full" variant="outline">
                Backup Systems
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Alerts & Issues
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                View System Alerts
              </Button>
              <Button className="w-full" variant="outline">
                Infrastructure Health
              </Button>
              <Button className="w-full" variant="outline">
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Deployment;