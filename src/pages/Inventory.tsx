import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Filter, Download, RefreshCw, Search, Eye, Edit, Trash2, Package, Shield, Wrench, TrendingUp, BarChart3, Activity, Zap, AlertCircle, CheckCircle, Clock, MapPin, Bell, Star, Award, Target, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Charts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

// Services
import { inventoryService, licenseService, referenceDataService } from '@/services/inventoryService';

// Types
import {
  InventoryItem,
  InventoryFilters,
  InventorySummary,
  InventoryByGroupType,
  InventoryByType,
  InventoryByStatus,
  License,
  LicenseFilters,
  Sector,
  City,
  Site,
  INVENTORY_STATUS_OPTIONS,
  INVENTORY_TYPE_OPTIONS,
  GROUP_TYPE_OPTIONS,
  LICENSE_STATUS_OPTIONS,
  LICENSE_TYPE_OPTIONS,
} from '@/types/inventory';

// Components
import Header from '@/components/Header';
import { InventoryFiltersPanel } from '../components/inventory/InventoryFiltersPanel';
import { InventoryItemForm } from '../components/inventory/InventoryItemForm';
import { LicenseForm } from '../components/inventory/LicenseForm';
import { InventoryItemDetails } from '../components/inventory/InventoryItemDetails';
import { DeployInventoryForm } from '../components/inventory/DeployInventoryForm';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function Inventory() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState<InventoryFilters>({});
  const [licenseFilters, setLicenseFilters] = useState<LicenseFilters>({});
  const [page, setPage] = useState(1);
  const [licensePage, setLicensePage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Queries
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['inventory-summary'],
    queryFn: inventoryService.getSummary,
  });

  const { data: inventoryData, isLoading: inventoryLoading } = useQuery({
    queryKey: ['inventory-items', filters, page],
    queryFn: () => inventoryService.getInventoryItems(filters, page, 20),
  });

  const { data: licensesData, isLoading: licensesLoading } = useQuery({
    queryKey: ['licenses', licenseFilters, licensePage],
    queryFn: () => licenseService.getLicenses(licenseFilters, licensePage, 20),
  });

  const { data: sectors } = useQuery({
    queryKey: ['sectors'],
    queryFn: referenceDataService.getSectors,
  });

  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: referenceDataService.getCities,
  });

  const { data: sites } = useQuery({
    queryKey: ['sites'],
    queryFn: referenceDataService.getSites,
  });

  const { data: inventoryByGroupType } = useQuery({
    queryKey: ['inventory-by-group-type'],
    queryFn: inventoryService.getInventoryByGroupType,
  });

  const { data: inventoryByType } = useQuery({
    queryKey: ['inventory-by-type'],
    queryFn: inventoryService.getInventoryByType,
  });

  const { data: inventoryByStatus } = useQuery({
    queryKey: ['inventory-by-status'],
    queryFn: inventoryService.getInventoryByStatus,
  });

  // Mutations
  const createInventoryMutation = useMutation({
    mutationFn: inventoryService.createInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-by-group-type'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-by-type'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-by-status'] });
      toast.success('Inventory item created successfully');
      setIsCreateModalOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to create inventory item');
      console.error('Create inventory error:', error);
    },
  });

  const updateInventoryMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      inventoryService.updateInventoryItem(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      toast.success('Inventory item updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update inventory item');
      console.error('Update inventory error:', error);
    },
  });

  const deleteInventoryMutation = useMutation({
    mutationFn: inventoryService.deleteInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      toast.success('Inventory item deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete inventory item');
      console.error('Delete inventory error:', error);
    },
  });

  const createLicenseMutation = useMutation({
    mutationFn: licenseService.createLicense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      toast.success('License created successfully');
      setIsLicenseModalOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to create license');
      console.error('Create license error:', error);
    },
  });

  const deployInventoryMutation = useMutation({
    mutationFn: inventoryService.deployInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      toast.success('Inventory item deployed successfully');
      setIsDeployModalOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to deploy inventory item');
      console.error('Deploy inventory error:', error);
    },
  });

  const createMaintenanceMutation = useMutation({
    mutationFn: inventoryService.createMaintenanceLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast.success('Maintenance log created successfully');
      setIsMaintenanceModalOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to create maintenance log');
      console.error('Create maintenance error:', error);
    },
  });

  // Enhanced data for charts and analytics
  const statusChartData = inventoryByStatus?.map(item => ({
    name: item.status,
    value: item.count,
  })) || [];

  const groupTypeChartData = inventoryByGroupType?.map(item => ({
    name: item.group_type,
    available: item.available,
    deployed: item.deployed,
    maintenance: item.maintenance,
  })) || [];

  const typeChartData = inventoryByType?.map(item => ({
    name: item.inventory_type.replace('_', ' ').toUpperCase(),
    available: item.available,
    deployed: item.deployed,
    maintenance: item.maintenance,
  })) || [];

  // Mock data for enhanced analytics
  const deploymentTrendData = [
    { month: 'Jan', deployed: 12, available: 8 },
    { month: 'Feb', deployed: 15, available: 5 },
    { month: 'Mar', deployed: 18, available: 2 },
    { month: 'Apr', deployed: 22, available: 1 },
    { month: 'May', deployed: 25, available: 3 },
    { month: 'Jun', deployed: 28, available: 2 },
  ];

  const alerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Low Inventory Alert',
      message: 'POS systems running low. Only 3 units available.',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'info',
      title: 'Maintenance Due',
      message: '5 items require scheduled maintenance this week.',
      time: '4 hours ago'
    },
    {
      id: 3,
      type: 'success',
      title: 'Deployment Complete',
      message: 'Manchester Central deployment completed successfully.',
      time: '6 hours ago'
    }
  ];

  const handleStatusChange = (itemId: string, newStatus: string) => {
    updateInventoryMutation.mutate({
      id: itemId,
      updates: { status: newStatus },
    });
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm('Are you sure you want to delete this inventory item?')) {
      deleteInventoryMutation.mutate(itemId);
    }
  };

  const getStatusColor = (status: string) => {
    const statusOption = INVENTORY_STATUS_OPTIONS.find(option => option.value === status);
    return statusOption?.color || 'gray';
  };

  const getStatusLabel = (status: string) => {
    const statusOption = INVENTORY_STATUS_OPTIONS.find(option => option.value === status);
    return statusOption?.label || status;
  };

  const getGroupTypeLabel = (groupType: string) => {
    const groupOption = GROUP_TYPE_OPTIONS.find(option => option.value === groupType);
    return groupOption?.label || groupType;
  };

  const getInventoryTypeLabel = (type: string) => {
    const typeOption = INVENTORY_TYPE_OPTIONS.find(option => option.value === type);
    return typeOption?.label || type;
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredInventoryData = inventoryData?.data.filter(item =>
    searchTerm === '' || 
    item.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.inventory_type.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="w-full max-w-none px-2 sm:px-4 lg:px-6 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Inventory & Deployment</h1>
          <p className="text-muted-foreground">
            Manage hardware assets, track deployments, and monitor licenses
          </p>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="space-y-3 mb-8">
            {alerts.map((alert) => (
              <Alert key={alert.id} className="border-l-4 border-l-yellow-500 bg-yellow-50">
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <h4 className="font-medium text-yellow-800">{alert.title}</h4>
                    <p className="text-sm text-yellow-700 mt-1">{alert.message}</p>
                    <p className="text-xs text-yellow-600 mt-2">{alert.time}</p>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        {/* Key Metrics */}
        {summaryLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-8 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.total_items || 0}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  +12% from last month
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{summary?.available_items || 0}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                  Ready for deployment
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Deployed</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{summary?.deployed_items || 0}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3 mr-1 text-blue-500" />
                  Currently in use
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{summary?.maintenance_items || 0}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Wrench className="h-3 w-3 mr-1 text-yellow-500" />
                  Under service
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-4">
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
            <Button variant="outline" onClick={() => setIsLicenseModalOpen(true)}>
              <Shield className="mr-2 h-4 w-4" />
              Add License
            </Button>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b">
              <div className="px-6 py-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="inventory">
                    <Package className="h-4 w-4 mr-2" />
                    Inventory
                  </TabsTrigger>
                  <TabsTrigger value="licenses">
                    <Shield className="h-4 w-4 mr-2" />
                    Licenses
                  </TabsTrigger>
                  <TabsTrigger value="deployment">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Deployment
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Status Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-blue-600" />
                        Status Distribution
                      </CardTitle>
                      <CardDescription>Current inventory status breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={statusChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {statusChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Deployment Trend */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        Deployment Trend
                      </CardTitle>
                      <CardDescription>Monthly deployment activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={deploymentTrendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="deployed" stroke="#3B82F6" strokeWidth={2} />
                          <Line type="monotone" dataKey="available" stroke="#10B981" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Group Type Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-green-600" />
                        Group Type Distribution
                      </CardTitle>
                      <CardDescription>Inventory by group type</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={groupTypeChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="available" fill="#10B981" name="Available" />
                          <Bar dataKey="deployed" fill="#3B82F6" name="Deployed" />
                          <Bar dataKey="maintenance" fill="#F59E0B" name="Maintenance" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-orange-600" />
                        Quick Actions
                      </CardTitle>
                      <CardDescription>Common inventory operations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button 
                        className="w-full" 
                        onClick={() => setIsCreateModalOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Item
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setIsLicenseModalOpen(true)}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Add License
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setActiveTab('deployment')}
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Deploy Item
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setIsMaintenanceModalOpen(true)}
                      >
                        <Wrench className="h-4 w-4 mr-2" />
                        Log Maintenance
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Inventory Tab */}
              <TabsContent value="inventory" className="space-y-6">
                {/* Enhanced Filters */}
                <InventoryFiltersPanel
                  filters={filters}
                  onFiltersChange={setFilters}
                  sectors={sectors || []}
                  cities={cities || []}
                  sites={sites || []}
                />

                {/* Enhanced Inventory Table */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Inventory Items</CardTitle>
                        <CardDescription>
                          {filteredInventoryData.length} items found
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {inventoryLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="animate-pulse">
                            <Skeleton className="h-12 w-full" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <div className="rounded-lg border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="font-semibold">Serial Number</TableHead>
                                <TableHead className="font-semibold">Model</TableHead>
                                <TableHead className="font-semibold">Type</TableHead>
                                <TableHead className="font-semibold">Group</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                                <TableHead className="font-semibold">Site</TableHead>
                                <TableHead className="font-semibold">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredInventoryData.map((item) => (
                                <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
                                  <TableCell className="font-mono font-medium">{item.serial_number}</TableCell>
                                  <TableCell className="font-medium">{item.model}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="font-medium">
                                      {getInventoryTypeLabel(item.inventory_type)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="secondary" className="font-medium">
                                      {getGroupTypeLabel(item.group_type)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge 
                                      variant={getStatusColor(item.status) as any}
                                      className="font-medium"
                                    >
                                      {getStatusLabel(item.status)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-muted-foreground">
                                    {item.site?.name || 'Unassigned'}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedItem(item)}
                                        className="hover:bg-blue-50 hover:text-blue-600"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedItem(item);
                                          setIsDeployModalOpen(true);
                                        }}
                                        className="hover:bg-green-50 hover:text-green-600"
                                      >
                                        <TrendingUp className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedItem(item);
                                          setIsMaintenanceModalOpen(true);
                                        }}
                                        className="hover:bg-yellow-50 hover:text-yellow-600"
                                      >
                                        <Wrench className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="hover:bg-red-50 hover:text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Enhanced Pagination */}
                        {inventoryData && inventoryData.total > 20 && (
                          <div className="mt-6">
                            <Pagination>
                              <PaginationContent>
                                <PaginationItem>
                                  <PaginationPrevious 
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    className={page === 1 ? 'pointer-events-none opacity-50' : 'hover:bg-muted'}
                                  />
                                </PaginationItem>
                                {Array.from({ length: Math.ceil(inventoryData.total / 20) }, (_, i) => i + 1).map((pageNum) => (
                                  <PaginationItem key={pageNum}>
                                    <PaginationLink
                                      onClick={() => setPage(pageNum)}
                                      isActive={page === pageNum}
                                      className="hover:bg-muted"
                                    >
                                      {pageNum}
                                    </PaginationLink>
                                  </PaginationItem>
                                ))}
                                <PaginationItem>
                                  <PaginationNext 
                                    onClick={() => setPage(page + 1)}
                                    className={page >= Math.ceil(inventoryData.total / 20) ? 'pointer-events-none opacity-50' : 'hover:bg-muted'}
                                  />
                                </PaginationItem>
                              </PaginationContent>
                            </Pagination>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Licenses Tab */}
              <TabsContent value="licenses" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Licenses</CardTitle>
                        <CardDescription>Hardware, software, and service licenses</CardDescription>
                      </div>
                      <Button 
                        onClick={() => setIsLicenseModalOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add License
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {licensesLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="animate-pulse">
                            <Skeleton className="h-12 w-full" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="font-semibold">Name</TableHead>
                              <TableHead className="font-semibold">Type</TableHead>
                              <TableHead className="font-semibold">Status</TableHead>
                              <TableHead className="font-semibold">Vendor</TableHead>
                              <TableHead className="font-semibold">Expiry Date</TableHead>
                              <TableHead className="font-semibold">Cost</TableHead>
                              <TableHead className="font-semibold">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {licensesData?.data.map((license) => (
                              <TableRow key={license.id} className="hover:bg-muted/50 transition-colors">
                                <TableCell className="font-medium">{license.name}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="font-medium">
                                    {license.license_type}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    variant={license.status === 'active' ? 'default' : 'destructive'}
                                    className="font-medium"
                                  >
                                    {license.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{license.vendor}</TableCell>
                                <TableCell className="text-muted-foreground">{license.expiry_date || 'N/A'}</TableCell>
                                <TableCell className="font-medium">{license.cost ? `£${license.cost}` : 'N/A'}</TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setSelectedLicense(license)}
                                      className="hover:bg-blue-50 hover:text-blue-600"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteItem(license.id)}
                                      className="hover:bg-red-50 hover:text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Deployment Tab */}
              <TabsContent value="deployment" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Deployment History</CardTitle>
                    <CardDescription>Track inventory deployments across sites</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <h3 className="text-lg font-medium mb-2">Deployment History</h3>
                      <p className="text-sm">Use the Deploy action to move inventory items between sites</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </Card>

        {/* Enhanced Modals */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
              <DialogDescription>
                Create a new inventory item with all required details
              </DialogDescription>
            </DialogHeader>
            <InventoryItemForm
              onSubmit={createInventoryMutation.mutate}
              isLoading={createInventoryMutation.isPending}
              sectors={sectors || []}
              cities={cities || []}
              sites={sites || []}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isLicenseModalOpen} onOpenChange={setIsLicenseModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add License</DialogTitle>
              <DialogDescription>
                Create a new license for hardware, software, or service
              </DialogDescription>
            </DialogHeader>
            <LicenseForm
              onSubmit={createLicenseMutation.mutate}
              isLoading={createLicenseMutation.isPending}
              sites={sites || []}
              inventoryItems={inventoryData?.data || []}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isDeployModalOpen} onOpenChange={setIsDeployModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Deploy Inventory Item</DialogTitle>
              <DialogDescription>
                Move inventory item to a new site
              </DialogDescription>
            </DialogHeader>
            <DeployInventoryForm
              inventoryItem={selectedItem}
              onSubmit={deployInventoryMutation.mutate}
              isLoading={deployInventoryMutation.isPending}
              sites={sites || []}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isMaintenanceModalOpen} onOpenChange={setIsMaintenanceModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Log Maintenance</DialogTitle>
              <DialogDescription>
                Record maintenance activity for inventory item
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Maintenance logging functionality will be implemented here.
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Item Details Modal */}
        {selectedItem && (
          <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
            <DialogContent className="max-w-4xl">
              <InventoryItemDetails
                item={selectedItem}
                onClose={() => setSelectedItem(null)}
                onStatusChange={handleStatusChange}
              />
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
} 