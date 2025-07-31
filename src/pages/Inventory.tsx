import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Filter, Download, RefreshCw, Search, Eye, Edit, Trash2, Package, Shield, Wrench, TrendingUp, BarChart3, Activity, Zap, AlertCircle, CheckCircle, Clock, MapPin } from 'lucide-react';
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

  // Chart data
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Inventory & Deployment
              </h1>
              <p className="text-slate-600 mt-2 text-lg">
                Manage hardware assets, track deployments, and monitor licenses
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.location.reload()} className="shadow-sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => setIsCreateModalOpen(true)} className="shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Summary Cards */}
        {summaryLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="shadow-sm border-slate-200">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Items</p>
                    <p className="text-3xl font-bold text-slate-900">{summary?.total_items || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">All hardware assets</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Available</p>
                    <p className="text-3xl font-bold text-green-600">{summary?.available_items || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">Ready for deployment</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Deployed</p>
                    <p className="text-3xl font-bold text-blue-600">{summary?.deployed_items || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">Currently in use</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <MapPin className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Maintenance</p>
                    <p className="text-3xl font-bold text-yellow-600">{summary?.maintenance_items || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">Under service</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Wrench className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-slate-200">
              <div className="px-6 py-4">
                <TabsList className="grid w-full grid-cols-4 bg-slate-100">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="inventory" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Package className="h-4 w-4 mr-2" />
                    Inventory
                  </TabsTrigger>
                  <TabsTrigger value="licenses" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Licenses
                  </TabsTrigger>
                  <TabsTrigger value="deployment" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Deployment
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Status Distribution */}
                  <Card className="shadow-sm border-slate-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
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

                  {/* Group Type Distribution */}
                  <Card className="shadow-sm border-slate-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
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

                  {/* Inventory Type Distribution */}
                  <Card className="shadow-sm border-slate-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Activity className="h-5 w-5 text-purple-600" />
                        Inventory Type Distribution
                      </CardTitle>
                      <CardDescription>Hardware type breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={typeChartData}>
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
                  <Card className="shadow-sm border-slate-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Zap className="h-5 w-5 text-orange-600" />
                        Quick Actions
                      </CardTitle>
                      <CardDescription>Common inventory operations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-sm" 
                        onClick={() => setIsCreateModalOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Item
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full shadow-sm hover:shadow-md transition-shadow"
                        onClick={() => setIsLicenseModalOpen(true)}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Add License
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full shadow-sm hover:shadow-md transition-shadow"
                        onClick={() => setActiveTab('deployment')}
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Deploy Item
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full shadow-sm hover:shadow-md transition-shadow"
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
                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg">Inventory Items</CardTitle>
                        <CardDescription>
                          {inventoryData?.total || 0} items found
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="shadow-sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
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
                        <div className="rounded-lg border border-slate-200 overflow-hidden">
                          <Table>
                            <TableHeader className="bg-slate-50">
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
                              {inventoryData?.data.map((item) => (
                                <TableRow key={item.id} className="hover:bg-slate-50 transition-colors">
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
                                  <TableCell className="text-slate-600">
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
                                    className={page === 1 ? 'pointer-events-none opacity-50' : 'hover:bg-slate-100'}
                                  />
                                </PaginationItem>
                                {Array.from({ length: Math.ceil(inventoryData.total / 20) }, (_, i) => i + 1).map((pageNum) => (
                                  <PaginationItem key={pageNum}>
                                    <PaginationLink
                                      onClick={() => setPage(pageNum)}
                                      isActive={page === pageNum}
                                      className="hover:bg-slate-100"
                                    >
                                      {pageNum}
                                    </PaginationLink>
                                  </PaginationItem>
                                ))}
                                <PaginationItem>
                                  <PaginationNext 
                                    onClick={() => setPage(page + 1)}
                                    className={page >= Math.ceil(inventoryData.total / 20) ? 'pointer-events-none opacity-50' : 'hover:bg-slate-100'}
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
                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg">Licenses</CardTitle>
                        <CardDescription>Hardware, software, and service licenses</CardDescription>
                      </div>
                      <Button 
                        onClick={() => setIsLicenseModalOpen(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-sm"
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
                      <div className="rounded-lg border border-slate-200 overflow-hidden">
                        <Table>
                          <TableHeader className="bg-slate-50">
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
                              <TableRow key={license.id} className="hover:bg-slate-50 transition-colors">
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
                                <TableCell className="text-slate-600">{license.vendor}</TableCell>
                                <TableCell className="text-slate-600">{license.expiry_date || 'N/A'}</TableCell>
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
                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Deployment History</CardTitle>
                    <CardDescription>Track inventory deployments across sites</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-slate-500">
                      <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <h3 className="text-lg font-medium mb-2">Deployment History</h3>
                      <p className="text-sm">Use the Deploy action to move inventory items between sites</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Enhanced Modals */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">Add Inventory Item</DialogTitle>
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
              <DialogTitle className="text-xl">Add License</DialogTitle>
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
              <DialogTitle className="text-xl">Deploy Inventory Item</DialogTitle>
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
              <DialogTitle className="text-xl">Log Maintenance</DialogTitle>
              <DialogDescription>
                Record maintenance activity for inventory item
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
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
      </div>
    </div>
  );
} 