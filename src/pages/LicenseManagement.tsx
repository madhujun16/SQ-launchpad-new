import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Filter, Download, RefreshCw, Search, Eye, Edit, Trash2, Shield, AlertCircle, CheckCircle, Clock, Calendar, Building, MapPin, Store, Package, Zap, TrendingUp, BarChart3, Activity, Bell, Star, Award, Target, Users, FileText, AlertTriangle } from 'lucide-react';
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
import Header from '@/components/Header';
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
  const [searchTerm, setSearchTerm] = useState('');

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

  // Enhanced data for charts and analytics
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

  // Mock data for enhanced analytics
  const renewalTrendData = [
    { month: 'Jan', renewals: 8, expirations: 3 },
    { month: 'Feb', renewals: 12, expirations: 5 },
    { month: 'Mar', renewals: 15, expirations: 7 },
    { month: 'Apr', renewals: 10, expirations: 4 },
    { month: 'May', renewals: 18, expirations: 6 },
    { month: 'Jun', renewals: 22, expirations: 9 },
  ];

  const alerts = [
    {
      id: 1,
      type: 'warning',
      title: 'License Expiring Soon',
      message: '5 software licenses will expire within 30 days.',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'error',
      title: 'Expired Licenses',
      message: '3 hardware licenses have expired and need immediate attention.',
      time: '4 hours ago'
    },
    {
      id: 3,
      type: 'success',
      title: 'Renewal Completed',
      message: 'ASDA Redditch software licenses renewed successfully.',
      time: '6 hours ago'
    }
  ];

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

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'info':
        return <Activity className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredLicensesData = licensesData?.data.filter(license =>
    searchTerm === '' || 
    license.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    license.license_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    license.vendor?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="w-full max-w-none px-2 sm:px-4 lg:px-6 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">License Management</h1>
          <p className="text-muted-foreground">
            Track, manage, and monitor all types of licenses across operational hierarchy
          </p>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="space-y-3 mb-8">
            {alerts.map((alert) => (
              <Alert key={alert.id} className={`border-l-4 ${
                alert.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
                alert.type === 'error' ? 'border-l-red-500 bg-red-50' :
                alert.type === 'success' ? 'border-l-green-500 bg-green-50' :
                'border-l-blue-500 bg-blue-50'
              }`}>
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      alert.type === 'warning' ? 'text-yellow-800' :
                      alert.type === 'error' ? 'text-red-800' :
                      alert.type === 'success' ? 'text-green-800' :
                      'text-blue-800'
                    }`}>{alert.title}</h4>
                    <p className={`text-sm mt-1 ${
                      alert.type === 'warning' ? 'text-yellow-700' :
                      alert.type === 'error' ? 'text-red-700' :
                      alert.type === 'success' ? 'text-green-700' :
                      'text-blue-700'
                    }`}>{alert.message}</p>
                    <p className={`text-xs mt-2 ${
                      alert.type === 'warning' ? 'text-yellow-600' :
                      alert.type === 'error' ? 'text-red-600' :
                      alert.type === 'success' ? 'text-green-600' :
                      'text-blue-600'
                    }`}>{alert.time}</p>
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
                <CardTitle className="text-sm font-medium">Total Licenses</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.total_licenses || 0}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  +8% from last month
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{summary?.active_licenses || 0}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                  Currently valid
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{summary?.expiring_soon || 0}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3 mr-1 text-yellow-500" />
                  Within 30 days
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expired</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{summary?.expired_licenses || 0}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <AlertCircle className="h-3 w-3 mr-1 text-red-500" />
                  Requires attention
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* License Type Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Software</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{summary?.software_licenses || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hardware</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary?.hardware_licenses || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Service</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{summary?.service_licenses || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Integration</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{summary?.integration_licenses || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-4">
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
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
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search licenses..."
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
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="licenses">
                    <Shield className="h-4 w-4 mr-2" />
                    Licenses
                  </TabsTrigger>
                  <TabsTrigger value="compliance">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Compliance
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* License Status Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
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

                  {/* Renewal Trend */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        Renewal Trend
                      </CardTitle>
                      <CardDescription>Monthly renewal and expiration activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={renewalTrendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="renewals" stroke="#10B981" strokeWidth={2} />
                          <Line type="monotone" dataKey="expirations" stroke="#EF4444" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* License Type Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
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

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-orange-600" />
                        Quick Actions
                      </CardTitle>
                      <CardDescription>Common license operations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button 
                        className="w-full" 
                        onClick={() => setIsCreateModalOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New License
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setActiveTab('compliance')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        View Compliance Report
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export License Data
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
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
                <Card>
                  <CardHeader>
                    <CardTitle>License Filters</CardTitle>
                    <CardDescription>Filter licenses by various criteria</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm font-medium">Organisation</label>
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
                        <label className="text-sm font-medium">Food Court (Unit)</label>
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
                        <label className="text-sm font-medium">License Type</label>
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
                        <label className="text-sm font-medium">Expiry Status</label>
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
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Licenses</CardTitle>
                        <CardDescription>
                          {filteredLicensesData.length} licenses found
                        </CardDescription>
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
                        <div className="rounded-lg border overflow-hidden">
                          <Table>
                            <TableHeader>
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
                              {filteredLicensesData.map((license) => (
                                <TableRow key={license.id} className="hover:bg-muted/50 transition-colors">
                                  <TableCell className="font-medium">{license.name}</TableCell>
                                  <TableCell className="text-muted-foreground">ASDA</TableCell>
                                  <TableCell className="text-muted-foreground">Redditch</TableCell>
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
                                  <TableCell className="text-muted-foreground">{license.expiry_date || 'N/A'}</TableCell>
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
                                    className={page === 1 ? 'pointer-events-none opacity-50' : 'hover:bg-muted'}
                                  />
                                </PaginationItem>
                                {Array.from({ length: Math.ceil(licensesData.total / 20) }, (_, i) => i + 1).map((pageNum) => (
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
                                    className={page >= Math.ceil(licensesData.total / 20) ? 'pointer-events-none opacity-50' : 'hover:bg-muted'}
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Compliance Overview</CardTitle>
                      <CardDescription>License compliance status and requirements</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Overall Compliance</span>
                          <Badge className="bg-green-100 text-green-800">95%</Badge>
                        </div>
                        <Progress value={95} className="h-2" />
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Active Licenses</span>
                            <span className="text-sm font-medium text-green-600">85%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Expiring Soon</span>
                            <span className="text-sm font-medium text-yellow-600">8%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Expired</span>
                            <span className="text-sm font-medium text-red-600">7%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Upcoming Renewals</CardTitle>
                      <CardDescription>Licenses requiring attention</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">ASDA Software License</p>
                            <p className="text-xs text-yellow-600">Expires in 15 days</p>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800">Urgent</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">HSBC Hardware License</p>
                            <p className="text-xs text-blue-600">Expires in 25 days</p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">Warning</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">Integration Service License</p>
                            <p className="text-xs text-green-600">Expires in 45 days</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Safe</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </Card>

        {/* Enhanced Modals */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add License</DialogTitle>
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
      </main>
    </div>
  );
} 