import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building,
  FileText,
  Home,
  ChevronRight,
  AlertCircle,
  Plus,
  Eye,
  Edit,
  Users,
  Database
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ContentLoader } from '@/components/ui/loader';
import { getRoleConfig } from '@/lib/roles';
import { useNavigate, Link } from 'react-router-dom';

export default function PlatformConfiguration() {
  const { currentRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const roleConfig = getRoleConfig(currentRole || 'admin');

  // Only allow admin access
  if (currentRole !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access the Platform Configuration. Please contact an administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/dashboard" className="flex items-center space-x-1 hover:text-gray-900">
          <Home className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Platform Configuration</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Configuration</h1>
          <p className="text-gray-600 mt-1">
            Manage platform-level settings, organizations, users, and system configurations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <roleConfig.icon className="h-3 w-3" />
            <span>{roleConfig.displayName}</span>
          </Badge>
        </div>
      </div>

      {/* Main Configuration Interface */}
      <div className="w-full">
        <Tabs defaultValue="organizations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="organizations" className="flex items-center space-x-2">
              <Building className="h-4 w-4" />
              <span>Organizations</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>User Management</span>
            </TabsTrigger>
            <TabsTrigger value="software" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Software & Hardware</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Audit & Logs</span>
            </TabsTrigger>
          </TabsList>

          {/* Organizations Tab */}
          <TabsContent value="organizations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>Organization Management</span>
                </CardTitle>
                <CardDescription>
                  Manage organizations, their details, and configurations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Organizations</h3>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Organization
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Building className="h-5 w-5 text-blue-600" />
                          <h4 className="font-medium">SmartQ Solutions</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">Primary organization for SmartQ LaunchPad</p>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>User Management</span>
                </CardTitle>
                <CardDescription>
                  Manage user accounts, roles, and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">User Accounts</h3>
                    <Button onClick={() => navigate('/platform-configuration/admin')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Users className="h-5 w-5 text-green-600" />
                          <h4 className="font-medium">Admin Users</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">Full system access and configuration rights</p>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Software & Hardware Tab */}
          <TabsContent value="software" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <span>Software & Hardware Catalog</span>
                </CardTitle>
                <CardDescription>
                  Manage software modules and hardware inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Software Modules</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 border rounded">
                          <span>POS System</span>
                          <Badge variant="outline">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded">
                          <span>Inventory Management</span>
                          <Badge variant="outline">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded">
                          <span>Kitchen Display</span>
                          <Badge variant="outline">Active</Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-3">Hardware Items</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 border rounded">
                          <span>POS Terminal</span>
                          <Badge variant="outline">Available</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded">
                          <span>Thermal Printer</span>
                          <Badge variant="outline">Available</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded">
                          <span>Tablet</span>
                          <Badge variant="outline">Available</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit & Logs Tab */}
          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Audit & System Logs</span>
                </CardTitle>
                <CardDescription>
                  View system logs, audit trails, and activity records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">System Logs</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 border rounded">
                          <span>User login</span>
                          <Badge variant="outline">Info</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded">
                          <span>Configuration change</span>
                          <Badge variant="outline">Warning</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded">
                          <span>System backup</span>
                          <Badge variant="outline">Info</Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-3">Activity Logs</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 border rounded">
                          <span>User management</span>
                          <Badge variant="outline">Admin</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded">
                          <span>Configuration update</span>
                          <Badge variant="outline">Admin</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded">
                          <span>System maintenance</span>
                          <Badge variant="outline">System</Badge>
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
    </div>
  );
} 