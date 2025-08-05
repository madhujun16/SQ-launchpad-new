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
import { inventoryService } from '@/services/inventoryService';
import { referenceDataService } from '@/services/referenceDataService';
import { licenseService } from '@/services/licenseService';

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
    queryFn: () => inventoryService.getLicenses(),
  });

  const { data: licensesData, isLoading: licensesLoading } = useQuery({
    queryKey: ['licenses', filters, page],
    queryFn: () => inventoryService.getLicenses(),
  });

  // Mock data for now since we need to implement these services
  const mockSummary: LicenseManagementSummary = {
    total_licenses: licensesData?.length || 0,
    active_licenses: licensesData?.filter(l => l.status === 'active').length || 0,
    expiring_soon: 0,
    expired_licenses: 0,
    software_licenses: licensesData?.filter(l => l.license_type === 'software').length || 0,
    hardware_licenses: licensesData?.filter(l => l.license_type === 'hardware').length || 0,
    service_licenses: licensesData?.filter(l => l.license_type === 'service').length || 0,
    integration_licenses: licensesData?.filter(l => l.license_type === 'integration').length || 0,
  };

  const mockLicensesByType: LicenseByType[] = [
    { license_type: 'Software', count: mockSummary.software_licenses, active: mockSummary.software_licenses, expiring: 0, expired: 0 },
    { license_type: 'Hardware', count: mockSummary.hardware_licenses, active: mockSummary.hardware_licenses, expiring: 0, expired: 0 },
    { license_type: 'Service', count: mockSummary.service_licenses, active: mockSummary.service_licenses, expiring: 0, expired: 0 },
    { license_type: 'Integration', count: mockSummary.integration_licenses, active: mockSummary.integration_licenses, expiring: 0, expired: 0 },
  ];

  const { data: sites = [] } = useQuery({
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
    mutationFn: inventoryService.createLicense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      queryClient.invalidateQueries({ queryKey: ['license-management-summary'] });
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
      inventoryService.updateLicense(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      queryClient.invalidateQueries({ queryKey: ['license-management-summary'] });
      toast.success('License updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update license');
      console.error('Update license error:', error);
    },
  });

  const deleteLicenseMutation = useMutation({
    mutationFn: inventoryService.deleteLicense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      queryClient.invalidateQueries({ queryKey: ['license-management-summary'] });
      toast.success('License deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete license');
      console.error('Delete license error:', error);
    },
  });

  // Enhanced data for charts and analytics
  const statusChartData = (licenseByStatus as any)?.map?.((item: any) => ({
    name: item.status,
    value: item.count,
  })) || [];

  const typeChartData = (licenseByType as any)?.map?.((item: any) => ({
    name: item.license_type,
    active: item.active,
    expiring: item.expiring,
    expired: item.expired,
  })) || [];

  const organisationChartData = (licenseByOrganisation as any)?.map?.((item: any) => ({
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
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'expiring':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'expired':
        return 'Expired';
      case 'expiring':
        return 'Expiring Soon';
      default:
        return status;
    }
  };

  const getLicenseTypeLabel = (type: string) => {
    switch (type) {
      case 'software':
        return 'Software';
      case 'hardware':
        return 'Hardware';
      case 'service':
        return 'Service';
      case 'integration':
        return 'Integration';
      default:
        return type;
    }
  };

  const getExpiryStatus = (expiryDate: string | undefined) => {
    if (!expiryDate) return 'unknown';
    const expiry = new Date(expiryDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    if (expiry < now) return 'expired';
    if (expiry <= thirtyDaysFromNow) return 'expiring';
    return 'active';
  };

  const getExpiryStatusColor = (expiryDate: string | undefined) => {
    const status = getExpiryStatus(expiryDate);
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'expiring':
        return 'text-yellow-600';
      case 'expired':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'info':
        return <Activity className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // Mock alerts for demonstration
  const alerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Licenses Expiring Soon',
      message: '5 software licenses will expire within 30 days',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'error',
      title: 'Expired Licenses',
      message: '3 hardware licenses have expired and need renewal',
      time: '4 hours ago'
    }
  ];

  if (summaryLoading || licensesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="w-full max-w-none px-2 sm:px-4 lg:px-6 py-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="w-full max-w-none px-2 sm:px-4 lg:px-6 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">License Management</h1>
          <p className="text-muted-foreground">
            Manage software, hardware, and service licenses across all sites
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Licenses</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockSummary.total_licenses}</div>
              <p className="text-xs text-muted-foreground">
                All license types
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Licenses</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{mockSummary.active_licenses}</div>
              <p className="text-xs text-muted-foreground">
                Currently valid
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{mockSummary.expiring_soon}</div>
              <p className="text-xs text-muted-foreground">
                Within 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired Licenses</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{mockSummary.expired_licenses}</div>
              <p className="text-xs text-muted-foreground">
                Need renewal
              </p>
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
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="licenses">
                    <Shield className="h-4 w-4 mr-2" />
                    Licenses
                  </TabsTrigger>
                  <TabsTrigger value="analytics">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger value="reports">
                    <FileText className="h-4 w-4 mr-2" />
                    Reports
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* License Type Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-blue-600" />
                        License Type Distribution
                      </CardTitle>
                      <CardDescription>Breakdown by license type</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={mockLicensesByType}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {mockLicensesByType.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* License Status Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-green-600" />
                        License Status Distribution
                      </CardTitle>
                      <CardDescription>Current license status breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={mockLicensesByStatus}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="status" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#10B981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Licenses Tab */}
              <TabsContent value="licenses" className="space-y-6">
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
                      {licensesData?.map((license) => (
                        <TableRow key={license.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium">{license.name}</TableCell>
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
                          <TableCell className="text-muted-foreground">{license.vendor}</TableCell>
                          <TableCell className={getExpiryStatusColor(license.expiry_date)}>
                            {license.expiry_date || 'N/A'}
                          </TableCell>
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
                                onClick={() => setSelectedLicense(license)}
                                className="hover:bg-green-50 hover:text-green-600"
                              >
                                <Edit className="h-4 w-4" />
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
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <h3 className="text-lg font-medium mb-2">License Analytics</h3>
                  <p className="text-sm">Advanced analytics and reporting features will be implemented here</p>
                </div>
              </TabsContent>

              {/* Reports Tab */}
              <TabsContent value="reports" className="space-y-6">
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <h3 className="text-lg font-medium mb-2">License Reports</h3>
                  <p className="text-sm">Generate detailed reports and export functionality will be implemented here</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </Card>

        {/* Create License Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add License</DialogTitle>
              <DialogDescription>
                Create a new license for software, hardware, or service
              </DialogDescription>
            </DialogHeader>
            <LicenseForm
              onSubmit={createLicenseMutation.mutate}
              isLoading={createLicenseMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
} 