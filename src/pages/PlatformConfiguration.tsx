import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Settings, 
  Users, 
  Building, 
  Package, 
  Database, 
  Bell, 
  FileText, 
  Search, 
  Filter,
  Eye,
  Edit,
  Plus,
  Trash2,
  Shield,
  Activity,
  Calendar,
  MapPin,
  Mail,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getRoleConfig } from '@/lib/roles';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Organization {
  id: string;
  name: string;
  sector: string;
  description: string;
  linked_sites: number;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  organization: string;
  status: 'active' | 'inactive' | 'pending';
  last_login: string;
  created_at: string;
}

interface SoftwareModule {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'active' | 'inactive' | 'deprecated';
  version: string;
  created_at: string;
  updated_at: string;
}

interface HardwareItem {
  id: string;
  name: string;
  description: string;
  category: string;
  model: string;
  manufacturer: string;
  cost: number;
  status: 'available' | 'discontinued' | 'maintenance';
  created_at: string;
  updated_at: string;
}

interface AuditLog {
  id: string;
  entity: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
  ip_address: string;
}

const PlatformConfiguration = () => {
  const { currentRole, profile } = useAuth();
  const roleConfig = getRoleConfig(currentRole || 'admin');
  
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [softwareModules, setSoftwareModules] = useState<SoftwareModule[]>([]);
  const [hardwareItems, setHardwareItems] = useState<HardwareItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data
  useEffect(() => {
    const mockOrganizations: Organization[] = [
      {
        id: '1',
        name: 'Compass Group UK',
        sector: 'Business & Industry',
        description: 'Leading food service company in the UK',
        linked_sites: 15,
        created_at: '2024-01-01',
        updated_at: '2024-01-15'
      },
      {
        id: '2',
        name: 'Compass Group Healthcare',
        sector: 'Healthcare & Senior Living',
        description: 'Healthcare food service division',
        linked_sites: 8,
        created_at: '2024-01-05',
        updated_at: '2024-01-12'
      }
    ];

    const mockUsers: User[] = [
      {
        id: '1',
        full_name: 'John Smith',
        email: 'john.smith@compassgroup.com',
        role: 'admin',
        organization: 'Compass Group UK',
        status: 'active',
        last_login: '2024-01-20T10:30:00Z',
        created_at: '2024-01-01'
      },
      {
        id: '2',
        full_name: 'Sarah Wilson',
        email: 'sarah.wilson@compassgroup.com',
        role: 'ops_manager',
        organization: 'Compass Group UK',
        status: 'active',
        last_login: '2024-01-19T14:20:00Z',
        created_at: '2024-01-05'
      },
      {
        id: '3',
        full_name: 'Mike Johnson',
        email: 'mike.johnson@compassgroup.com',
        role: 'deployment_engineer',
        organization: 'Compass Group Healthcare',
        status: 'active',
        last_login: '2024-01-18T09:15:00Z',
        created_at: '2024-01-10'
      }
    ];

    const mockSoftwareModules: SoftwareModule[] = [
      {
        id: '1',
        name: 'POS System',
        description: 'Point of sale system for cafeteria operations',
        category: 'Payment Processing',
        status: 'active',
        version: '2.1.0',
        created_at: '2024-01-01',
        updated_at: '2024-01-15'
      },
      {
        id: '2',
        name: 'Inventory Management',
        description: 'Real-time inventory tracking and management',
        category: 'Inventory',
        status: 'active',
        version: '1.5.2',
        created_at: '2024-01-05',
        updated_at: '2024-01-12'
      }
    ];

    const mockHardwareItems: HardwareItem[] = [
      {
        id: '1',
        name: 'POS Terminal',
        description: 'Ingenico Telium 2 POS terminal',
        category: 'Payment Processing',
        model: 'Telium 2',
        manufacturer: 'Ingenico',
        cost: 2500,
        status: 'available',
        created_at: '2024-01-01',
        updated_at: '2024-01-15'
      },
      {
        id: '2',
        name: 'Display Screen',
        description: 'Samsung tablet for customer display',
        category: 'Display',
        model: 'SM-T580',
        manufacturer: 'Samsung',
        cost: 1800,
        status: 'available',
        created_at: '2024-01-05',
        updated_at: '2024-01-10'
      }
    ];

    const mockAuditLogs: AuditLog[] = [
      {
        id: '1',
        entity: 'User Management',
        action: 'User Created',
        user: 'John Smith',
        timestamp: '2024-01-20T10:30:00Z',
        details: 'Created new user: sarah.wilson@compassgroup.com',
        ip_address: '192.168.1.100'
      },
      {
        id: '2',
        entity: 'Organization Management',
        action: 'Organization Updated',
        user: 'Sarah Wilson',
        timestamp: '2024-01-19T14:20:00Z',
        details: 'Updated organization: Compass Group UK',
        ip_address: '192.168.1.101'
      },
      {
        id: '3',
        entity: 'Software Management',
        action: 'Software Added',
        user: 'Mike Johnson',
        timestamp: '2024-01-18T09:15:00Z',
        details: 'Added new software module: Inventory Management v1.5.2',
        ip_address: '192.168.1.102'
      }
    ];

    setOrganizations(mockOrganizations);
    setUsers(mockUsers);
    setSoftwareModules(mockSoftwareModules);
    setHardwareItems(mockHardwareItems);
    setAuditLogs(mockAuditLogs);
    setLoading(false);
  }, []);

  const getRoleConfig = (role: string) => {
    const configs = {
      admin: { label: 'Admin', color: 'text-red-600' },
      ops_manager: { label: 'Ops Manager', color: 'text-blue-600' },
      deployment_engineer: { label: 'Deployment Engineer', color: 'text-green-600' }
    };
    return configs[role as keyof typeof configs] || configs.admin;
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      active: { label: 'Active', color: 'bg-green-100 text-green-800' },
      inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      available: { label: 'Available', color: 'bg-green-100 text-green-800' },
      discontinued: { label: 'Discontinued', color: 'bg-red-100 text-red-800' },
      maintenance: { label: 'Maintenance', color: 'bg-orange-100 text-orange-800' }
    };
    return configs[status as keyof typeof configs] || configs.active;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading platform configuration...</p>
          </div>
        </div>
      </div>
    );
  }

  // Only allow admin access
  if (currentRole !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access Platform Configuration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Configuration</h1>
          <p className="text-gray-600 mt-1">
            Global setup: organizations, users, software/hardware, notifications, audit logs
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <roleConfig.icon className="h-3 w-3" />
            <span>{roleConfig.displayName}</span>
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="organizations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="software">Software Management</TabsTrigger>
          <TabsTrigger value="hardware">Hardware Management</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Organization Management</CardTitle>
                  <CardDescription>
                    Create and manage organizations with their sectors and linked sites
                  </CardDescription>
                </div>
                <Button variant="gradient" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Organization</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization Name</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Linked Sites</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizations.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell>
                        <div className="font-medium">{org.name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{org.sector}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {org.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span>{org.linked_sites} sites</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {new Date(org.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage users, roles, and access permissions
                  </CardDescription>
                </div>
                <Button variant="gradient" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add User</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const roleConfig = getRoleConfig(user.role);
                    const statusConfig = getStatusConfig(user.status);
                    
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="font-medium">{user.full_name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{user.email}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={roleConfig.color}>
                            {roleConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{user.organization}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">
                            {new Date(user.last_login).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="software" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Software Management</CardTitle>
                  <CardDescription>
                    Manage software modules, versions, and deployment status
                  </CardDescription>
                </div>
                <Button variant="gradient" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Software</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Software Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {softwareModules.map((software) => {
                    const statusConfig = getStatusConfig(software.status);
                    
                    return (
                      <TableRow key={software.id}>
                        <TableCell>
                          <div className="font-medium">{software.name}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{software.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-mono">{software.version}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {software.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hardware" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Hardware Management</CardTitle>
                  <CardDescription>
                    Manage hardware inventory, specifications, and availability
                  </CardDescription>
                </div>
                <Button variant="gradient" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Hardware</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hardware Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Manufacturer</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hardwareItems.map((hardware) => {
                    const statusConfig = getStatusConfig(hardware.status);
                    
                    return (
                      <TableRow key={hardware.id}>
                        <TableCell>
                          <div className="font-medium">{hardware.name}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{hardware.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{hardware.manufacturer}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-mono">{hardware.model}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">£{hardware.cost.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Audit Log</CardTitle>
                  <CardDescription>
                    Access activity logs with filters and export functionality
                  </CardDescription>
                </div>
                <Button variant="outline" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Export Logs</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entity</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="font-medium">{log.entity}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{log.user}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-mono">{log.ip_address}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {log.details}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlatformConfiguration; 