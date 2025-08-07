import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Search, 
  Filter, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Package, 
  Truck, 
  Calendar,
  User,
  Building,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  FileText,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Wrench,
  Shield,
  Zap,
  MapPin,
  Settings,
  Users,
  Database,
  Monitor,
  CreditCard,
  List,
  Cog,
  BarChart,
  Globe,
  ArrowLeft,
  ChevronRight,
  Home,
  ChevronDown,
  Bell,
  Key,
  Mail
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ContentLoader } from '@/components/ui/loader';
import { getRoleConfig } from '@/lib/roles';
import { useNavigate, Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

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
  const navigate = useNavigate();
  const roleConfig = getRoleConfig(currentRole || 'admin');
  
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [softwareModules, setSoftwareModules] = useState<SoftwareModule[]>([]);
  const [hardwareItems, setHardwareItems] = useState<HardwareItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

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
        name: 'Card Reader',
        description: 'Contactless card reader for POS',
        category: 'Payment Processing',
        model: 'P4000',
        manufacturer: 'Verifone',
        cost: 150,
        status: 'available',
        created_at: '2024-01-05',
        updated_at: '2024-01-12'
      }
    ];

    const mockAuditLogs: AuditLog[] = [
      {
        id: '1',
        entity: 'Site',
        action: 'Created',
        user: 'john.smith@compassgroup.com',
        timestamp: '2024-01-20T10:30:00Z',
        details: 'Created new site: ASDA Redditch',
        ip_address: '192.168.1.100'
      },
      {
        id: '2',
        entity: 'User',
        action: 'Updated',
        user: 'sarah.wilson@compassgroup.com',
        timestamp: '2024-01-19T14:20:00Z',
        details: 'Updated user permissions for Mike Johnson',
        ip_address: '192.168.1.101'
      }
    ];

    setOrganizations(mockOrganizations);
    setUsers(mockUsers);
    setSoftwareModules(mockSoftwareModules);
    setHardwareItems(mockHardwareItems);
    setAuditLogs(mockAuditLogs);
    setLoading(false);
  }, []);

  const getStatusConfig = (status: string) => {
    const configs = {
      active: { label: 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-800', icon: XCircle },
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      available: { label: 'Available', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      discontinued: { label: 'Discontinued', color: 'bg-red-100 text-red-800', icon: XCircle },
      maintenance: { label: 'Maintenance', color: 'bg-orange-100 text-orange-800', icon: Wrench },
      deprecated: { label: 'Deprecated', color: 'bg-gray-100 text-gray-800', icon: XCircle }
    };
    return configs[status as keyof typeof configs] || configs.active;
  };

  if (loading) {
    return <ContentLoader />;
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
            System settings, user management, and platform administration
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <roleConfig.icon className="h-3 w-3" />
            <span>{roleConfig.displayName}</span>
          </Badge>
        </div>
      </div>

      {/* Nested Navigation with Accordion Style */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuration Sections</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-3">
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4" />
                        <span>Organizations</span>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-6">
                    <div className="space-y-1">
                      <Button variant="ghost" className="w-full justify-start p-2 text-sm">
                        <List className="h-3 w-3 mr-2" />
                        All Organizations
                      </Button>
                      <Button variant="ghost" className="w-full justify-start p-2 text-sm">
                        <Plus className="h-3 w-3 mr-2" />
                        Add Organization
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-3">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>User Management</span>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-6">
                    <div className="space-y-1">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start p-2 text-sm"
                        onClick={() => navigate('/platform-configuration/admin')}
                      >
                        <User className="h-3 w-3 mr-2" />
                        User Accounts
                      </Button>
                      <Button variant="ghost" className="w-full justify-start p-2 text-sm">
                        <Shield className="h-3 w-3 mr-2" />
                        Roles & Permissions
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-3">
                      <div className="flex items-center space-x-2">
                        <Database className="h-4 w-4" />
                        <span>Software & Hardware</span>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-6">
                    <div className="space-y-1">
                      <Button variant="ghost" className="w-full justify-start p-2 text-sm">
                        <Database className="h-3 w-3 mr-2" />
                        Software Modules
                      </Button>
                      <Button variant="ghost" className="w-full justify-start p-2 text-sm">
                        <Package className="h-3 w-3 mr-2" />
                        Hardware Catalog
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-3">
                      <div className="flex items-center space-x-2">
                        <Bell className="h-4 w-4" />
                        <span>Notifications</span>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-6">
                    <div className="space-y-1">
                      <Button variant="ghost" className="w-full justify-start p-2 text-sm">
                        <Bell className="h-3 w-3 mr-2" />
                        Notification Settings
                      </Button>
                      <Button variant="ghost" className="w-full justify-start p-2 text-sm">
                        <Mail className="h-3 w-3 mr-2" />
                        Email Templates
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-3">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4" />
                        <span>Audit & Logs</span>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-6">
                    <div className="space-y-1">
                      <Button variant="ghost" className="w-full justify-start p-2 text-sm">
                        <FileText className="h-3 w-3 mr-2" />
                        System Logs
                      </Button>
                      <Button variant="ghost" className="w-full justify-start p-2 text-sm">
                        <Activity className="h-3 w-3 mr-2" />
                        Activity Logs
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="organizations" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="organizations" className="flex items-center space-x-2">
                <Building className="h-4 w-4" />
                <span>Organizations</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>User Accounts</span>
              </TabsTrigger>
              <TabsTrigger value="software" className="flex items-center space-x-2">
                <Database className="h-4 w-4" />
                <span>Software Modules</span>
              </TabsTrigger>
              <TabsTrigger value="hardware" className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>Hardware Catalog</span>
              </TabsTrigger>
              <TabsTrigger value="audit" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>System Logs</span>
              </TabsTrigger>
            </TabsList>

            {/* Organizations Tab */}
            <TabsContent value="organizations" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Organizations</CardTitle>
                      <CardDescription>
                        Manage client organizations and their associated sites
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
                            <div className="text-sm text-gray-600">
                              {new Date(org.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
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

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>User Accounts</CardTitle>
                      <CardDescription>
                        Manage user accounts, roles, and access permissions
                      </CardDescription>
                    </div>
                    <Button 
                      variant="gradient" 
                      className="flex items-center space-x-2"
                      onClick={() => navigate('/platform-configuration/admin')}
                    >
                      <Users className="h-4 w-4" />
                      <span>Manage Users</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
                    <p className="text-gray-600 mb-4">
                      Manage user accounts, roles, and access permissions for the platform.
                    </p>
                    <Button 
                      onClick={() => navigate('/platform-configuration/admin')}
                      className="flex items-center space-x-2 mx-auto"
                    >
                      <Users className="h-4 w-4" />
                      <span>View User Management</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Software Modules Tab */}
            <TabsContent value="software" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Software Modules</CardTitle>
                      <CardDescription>
                        Manage software modules and their configurations
                      </CardDescription>
                    </div>
                    <Button variant="gradient" className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Add Software Module</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Module Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {softwareModules.map((module) => (
                        <TableRow key={module.id}>
                          <TableCell>
                            <div className="font-medium">{module.name}</div>
                            <div className="text-sm text-gray-600">{module.description}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{module.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-sm">{module.version}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusConfig(module.status).color}>
                              {getStatusConfig(module.status).label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600">
                              {new Date(module.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
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

            {/* Hardware Catalog Tab */}
            <TabsContent value="hardware" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Hardware Catalog</CardTitle>
                      <CardDescription>
                        Manage hardware catalog and specifications
                      </CardDescription>
                    </div>
                    <Button variant="gradient" className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Add Hardware Item</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Manufacturer</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hardwareItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-600">{item.description}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-sm">{item.model}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{item.manufacturer}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-3 w-3 text-gray-400" />
                              <span>£{item.cost.toLocaleString()}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusConfig(item.status).color}>
                              {getStatusConfig(item.status).label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
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

            {/* System Logs Tab */}
            <TabsContent value="audit" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>System Logs</CardTitle>
                      <CardDescription>
                        View system activity and audit logs
                      </CardDescription>
                    </div>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <Download className="h-4 w-4" />
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
                            <div className="text-sm text-gray-600">
                              {new Date(log.timestamp).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-sm">{log.ip_address}</div>
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
      </div>
    </div>
  );
};

export default PlatformConfiguration; 