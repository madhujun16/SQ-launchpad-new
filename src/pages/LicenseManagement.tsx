import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Filter, Download, RefreshCw, Search, Eye, Edit, Trash2, Shield, AlertCircle, CheckCircle, Clock, Calendar, Building, MapPin, Store, Package, Zap, TrendingUp, BarChart3, Activity } from 'lucide-react';
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
import { licenseService, referenceDataService } from '@/services/inventoryService';

// Types
import {
  License,
  LicenseFilters,
  Sector,
  City,
  Site,
  LICENSE_STATUS_OPTIONS,
  LICENSE_TYPE_OPTIONS,
} from '@/types/inventory';

// Components
import { LicenseForm } from '../components/inventory/LicenseForm';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// License Management specific types
export interface LicenseManagementFilters {
  organisation_id?: string;
  food_court_id?: string;
  restaurant_id?: string;
  license_type?: string;
  status?: string;
  expiry_status?: 'active' | 'expiring' | 'expired';
  vendor?: string;
  search?: string;
}

export interface LicenseManagementSummary {
  total_licenses: number;
  active_licenses: number;
  expiring_soon: number;
  expired_licenses: number;
  software_licenses: number;
  hardware_licenses: number;
  service_licenses: number;
  integration_licenses: number;
}

export interface LicenseByType {
  license_type: string;
  count: number;
  active: number;
  expiring: number;
  expired: number;
}

export interface LicenseByStatus {
  status: string;
  count: number;
}

export interface LicenseByOrganisation {
  organisation: string;
  count: number;
  active: number;
  expiring: number;
  expired: number;
}

export default function LicenseManagement() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState<LicenseManagementFilters>({});
  const [page, setPage] = useState(1);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Queries
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['license-management-summary'],
    queryFn: () => licenseService.getLicenseManagementSummary(),
  });

  const { data: licensesData, isLoading: licensesLoading } = useQuery({
    queryKey: ['license-management', filters, page],
    queryFn: () => licenseService.getLicenseManagementItems(filters, page, 20),
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

  const { data: licenseByType } = useQuery({
    queryKey: ['license-by-type'],
    queryFn: licenseService.getLicenseByType,
  });

  const { data: licenseByStatus } = useQuery({
    queryKey: ['license-by-status'],
    queryFn: licenseService.getLicenseByStatus,
  });

  const { data: licenseByOrganisation } = useQuery({
    queryKey: ['license-by-organisation'],
    queryFn: licenseService.getLicenseByOrganisation,
  });

  // Mutations
  const createLicenseMutation = useMutation({
    mutationFn: licenseService.createLicense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['license-management'] });
      queryClient.invalidateQueries({ queryKey: ['license-management-summary'] });
      queryClient.invalidateQueries({ queryKey: ['license-by-type'] });
      queryClient.invalidateQueries({ queryKey: ['license-by-status'] });
      queryClient.invalidateQueries({ queryKey: ['license-by-organisation'] });
      toast.success('License created successfully');
      setIsCreateModalOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to create license');
      console.error('Create license error:', error);
    },
  });

  const updateLicenseMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      licenseService.updateLicense(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['license-management'] });
      queryClient.invalidateQueries({ queryKey: ['license-management-summary'] });
      toast.success('License updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update license');
      console.error('Update license error:', error);
    },
  });

  const deleteLicenseMutation = useMutation({
    mutationFn: licenseService.deleteLicense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['license-management'] });
      queryClient.invalidateQueries({ queryKey: ['license-management-summary'] });
      toast.success('License deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete license');
      console.error('Delete license error:', error);
    },
  });

  // Chart data
  const statusChartData = licenseByStatus?.map(item => ({
    name: item.status,
    value: item.count,
  })) || [];

  const typeChartData = licenseByType?.map(item => ({
    name: item.license_type,
    active: item.active,
    expiring: item.expiring,
    expired: item.expired,
  })) || [];

  const organisationChartData = licenseByOrganisation?.map(item => ({
    name: item.organisation,
    active: item.active,
    expiring: item.expiring,
    expired: item.expired,
  })) || [];

  const handleDeleteLicense = (licenseId: string) => {
    if (confirm('Are you sure you want to delete this license?')) {
      deleteLicenseMutation.mutate(licenseId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'expired':
        return 'destructive';
      case 'pending_renewal':
        return 'secondary';
      case 'suspended':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    const statusOption = LICENSE_STATUS_OPTIONS.find(option => option.value === status);
    return statusOption?.label || status;
  };

  const getLicenseTypeLabel = (type: string) => {
    const typeOption = LICENSE_TYPE_OPTIONS.find(option => option.value === type);
    return typeOption?.label || type;
  };

  const getExpiryStatus = (expiryDate: string | undefined) => {
    if (!expiryDate) return 'active';
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'expiring';
    return 'active';
  };

  const getExpiryStatusColor = (expiryDate: string | undefined) => {
    const status = getExpiryStatus(expiryDate);
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expiring':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                License Management
              </h1>
              <p className="text-slate-600 mt-2 text-lg">
                Track, manage, and monitor all types of licenses across operational hierarchy
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.location.reload()} className="shadow-sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => setIsCreateModalOpen(true)} className="shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add License
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
                    <p className="text-sm font-medium text-slate-600">Total Licenses</p>
                    <p className="text-3xl font-bold text-slate-900">{summary?.total_licenses || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">All license types</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Shield className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Active</p>
                    <p className="text-3xl font-bold text-green-600">{summary?.active_licenses || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">Currently valid</p>
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
                    <p className="text-sm font-medium text-slate-600">Expiring Soon</p>
                    <p className="text-3xl font-bold text-yellow-600">{summary?.expiring_soon || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">Within 30 days</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Expired</p>
                    <p className="text-3xl font-bold text-red-600">{summary?.expired_licenses || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">Requires attention</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* License Type Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Software</p>
                  <p className="text-2xl font-bold text-blue-600">{summary?.software_licenses || 0}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Hardware</p>
                  <p className="text-2xl font-bold text-green-600">{summary?.hardware_licenses || 0}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Service</p>
                  <p className="text-2xl font-bold text-purple-600">{summary?.service_licenses || 0}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-full">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Integration</p>
                  <p className="text-2xl font-bold text-orange-600">{summary?.integration_licenses || 0}</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-slate-200">
              <div className="px-6 py-4">
                <TabsList className="grid w-full grid-cols-3 bg-slate-100">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="licenses" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Licenses
                  </TabsTrigger>
                  <TabsTrigger value="compliance" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Compliance
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* License Status Distribution */}
                  <Card className="shadow-sm border-slate-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <PieChart className="h-5 w-5 text-blue-600" />
                        License Status Distribution
                      </CardTitle>
                      <CardDescription>Current license status breakdown</CardDescription>
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

                  {/* License Type Distribution */}
                  <Card className="shadow-sm border-slate-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <BarChart3 className="h-5 w-5 text-green-600" />
                        License Type Distribution
                      </CardTitle>
                      <CardDescription>Licenses by type and status</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={typeChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="active" fill="#10B981" name="Active" />
                          <Bar dataKey="expiring" fill="#F59E0B" name="Expiring" />
                          <Bar dataKey="expired" fill="#EF4444" name="Expired" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Organisation Distribution */}
                  <Card className="shadow-sm border-slate-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Building className="h-5 w-5 text-purple-600" />
                        License Distribution by Organisation
                      </CardTitle>
                      <CardDescription>Licenses across different organisations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={organisationChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="active" fill="#10B981" name="Active" />
                          <Bar dataKey="expiring" fill="#F59E0B" name="Expiring" />
                          <Bar dataKey="expired" fill="#EF4444" name="Expired" />
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
                      <CardDescription>Common license operations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-sm" 
                        onClick={() => setIsCreateModalOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New License
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full shadow-sm hover:shadow-md transition-shadow"
                        onClick={() => setActiveTab('compliance')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        View Compliance Report
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full shadow-sm hover:shadow-md transition-shadow"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export License Data
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full shadow-sm hover:shadow-md transition-shadow"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Renewal Calendar
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Licenses Tab */}
              <TabsContent value="licenses" className="space-y-6">
                {/* Enhanced Filters */}
                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">License Filters</CardTitle>
                    <CardDescription>Filter licenses by various criteria</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700">Organisation</label>
                        <Select value={filters.organisation_id} onValueChange={(value) => setFilters({...filters, organisation_id: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Organisations" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All Organisations</SelectItem>
                            <SelectItem value="asda">ASDA</SelectItem>
                            <SelectItem value="hsbc">HSBC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-slate-700">Food Court (Unit)</label>
                        <Select value={filters.food_court_id} onValueChange={(value) => setFilters({...filters, food_court_id: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Units" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All Units</SelectItem>
                            <SelectItem value="redditch">Redditch</SelectItem>
                            <SelectItem value="canary-wharf">Canary Wharf</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-slate-700">License Type</label>
                        <Select value={filters.license_type} onValueChange={(value) => setFilters({...filters, license_type: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All Types</SelectItem>
                            <SelectItem value="software">Software</SelectItem>
                            <SelectItem value="hardware">Hardware</SelectItem>
                            <SelectItem value="service">Service</SelectItem>
                            <SelectItem value="integration">Integration</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-slate-700">Expiry Status</label>
                        <Select value={filters.expiry_status} onValueChange={(value) => setFilters({...filters, expiry_status: value as any})}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="expiring">Expiring Soon</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced License Table */}
                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg">Licenses</CardTitle>
                        <CardDescription>
                          {licensesData?.total || 0} licenses found
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
                    {licensesLoading ? (
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
                                <TableHead className="font-semibold">License Name</TableHead>
                                <TableHead className="font-semibold">Organisation</TableHead>
                                <TableHead className="font-semibold">Unit</TableHead>
                                <TableHead className="font-semibold">Type</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                                <TableHead className="font-semibold">Expiry Status</TableHead>
                                <TableHead className="font-semibold">Expiry Date</TableHead>
                                <TableHead className="font-semibold">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {licensesData?.data.map((license) => (
                                <TableRow key={license.id} className="hover:bg-slate-50 transition-colors">
                                  <TableCell className="font-medium">{license.name}</TableCell>
                                  <TableCell className="text-slate-600">ASDA</TableCell>
                                  <TableCell className="text-slate-600">Redditch</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="font-medium">
                                      {getLicenseTypeLabel(license.license_type)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge 
                                      variant={getStatusColor(license.status) as any}
                                      className="font-medium"
                                    >
                                      {getStatusLabel(license.status)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge 
                                      className={`font-medium ${getExpiryStatusColor(license.expiry_date)}`}
                                    >
                                      {getExpiryStatus(license.expiry_date)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-slate-600">{license.expiry_date || 'N/A'}</TableCell>
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
                                        onClick={() => handleDeleteLicense(license.id)}
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
                        {licensesData && licensesData.total > 20 && (
                          <div className="mt-6">
                            <Pagination>
                              <PaginationContent>
                                <PaginationItem>
                                  <PaginationPrevious 
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    className={page === 1 ? 'pointer-events-none opacity-50' : 'hover:bg-slate-100'}
                                  />
                                </PaginationItem>
                                {Array.from({ length: Math.ceil(licensesData.total / 20) }, (_, i) => i + 1).map((pageNum) => (
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
                                    className={page >= Math.ceil(licensesData.total / 20) ? 'pointer-events-none opacity-50' : 'hover:bg-slate-100'}
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

              {/* Compliance Tab */}
              <TabsContent value="compliance" className="space-y-6">
                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Compliance Overview</CardTitle>
                    <CardDescription>License compliance status and requirements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-slate-500">
                      <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <h3 className="text-lg font-medium mb-2">Compliance Dashboard</h3>
                      <p className="text-sm">Compliance monitoring and reporting features will be implemented here</p>
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
              <DialogTitle className="text-xl">Add License</DialogTitle>
              <DialogDescription>
                Create a new license with hierarchical assignment
              </DialogDescription>
            </DialogHeader>
            <LicenseForm
              onSubmit={createLicenseMutation.mutate}
              isLoading={createLicenseMutation.isPending}
              sites={sites || []}
              inventoryItems={[]}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 