import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Database, 
  Search, 
  Filter,
  Eye,
  Edit,
  Plus,
  Wrench,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  MapPin,
  Package,
  Activity,
  Settings,
  FileText,
  Trash2,
  RefreshCw,
  Shield,
  CreditCard
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
import { Progress } from '@/components/ui/progress';

interface Asset {
  id: string;
  name: string;
  type: string;
  serial_number: string;
  site_name: string;
  site_id: string;
  status: 'in_stock' | 'assigned' | 'deployed' | 'in_maintenance' | 'retired';
  location: string;
  assigned_to?: string;
  purchase_date: string;
  warranty_expiry: string;
  last_maintenance: string;
  next_maintenance: string;
  maintenance_schedule: string;
  license_key?: string;
  license_expiry?: string;
  cost: number;
  manufacturer: string;
  model: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const Assets = () => {
  const { currentRole, profile } = useAuth();
  const roleConfig = getRoleConfig(currentRole || 'admin');
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [siteFilter, setSiteFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Mock data
  useEffect(() => {
    const mockAssets: Asset[] = [
      {
        id: '1',
        name: 'POS Terminal 001',
        type: 'POS Terminal',
        serial_number: 'POS-2024-001',
        site_name: 'London Central',
        site_id: '1',
        status: 'deployed',
        location: 'Main Counter',
        assigned_to: 'John Smith',
        purchase_date: '2024-01-01',
        warranty_expiry: '2027-01-01',
        last_maintenance: '2024-01-15',
        next_maintenance: '2024-04-15',
        maintenance_schedule: 'quarterly',
        license_key: 'LIC-POS-001-2024',
        license_expiry: '2025-01-01',
        cost: 2500,
        manufacturer: 'Ingenico',
        model: 'Telium 2',
        notes: 'Primary POS terminal for main counter',
        created_at: '2024-01-01',
        updated_at: '2024-01-15'
      },
      {
        id: '2',
        name: 'Display Screen 001',
        type: 'Display Screen',
        serial_number: 'DS-2024-001',
        site_name: 'Manchester North',
        site_id: '2',
        status: 'deployed',
        location: 'Customer Area',
        assigned_to: 'Sarah Wilson',
        purchase_date: '2024-01-05',
        warranty_expiry: '2027-01-05',
        last_maintenance: '2024-01-10',
        next_maintenance: '2024-04-10',
        maintenance_schedule: 'quarterly',
        cost: 1800,
        manufacturer: 'Samsung',
        model: 'SM-T580',
        notes: 'Customer-facing display for menu and promotions',
        created_at: '2024-01-05',
        updated_at: '2024-01-10'
      }
    ];

    setAssets(mockAssets);
    setFilteredAssets(mockAssets);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = assets;

    if (searchTerm) {
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.site_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(asset => asset.status === statusFilter);
    }

    if (siteFilter !== 'all') {
      filtered = filtered.filter(asset => asset.site_id === siteFilter);
    }

    setFilteredAssets(filtered);
  }, [assets, searchTerm, statusFilter, siteFilter]);

  const getStatusConfig = (status: string) => {
    const configs = {
      in_stock: { label: 'In Stock', color: 'bg-green-100 text-green-800', icon: Package },
      assigned: { label: 'Assigned', color: 'bg-blue-100 text-blue-800', icon: MapPin },
      deployed: { label: 'Deployed', color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
      in_maintenance: { label: 'In Maintenance', color: 'bg-orange-100 text-orange-800', icon: Wrench },
      retired: { label: 'Retired', color: 'bg-red-100 text-red-800', icon: Trash2 }
    };
    return configs[status as keyof typeof configs] || configs.in_stock;
  };

  const canManageAssets = currentRole === 'ops_manager' || currentRole === 'admin';

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'in_stock', label: 'In Stock' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'deployed', label: 'Deployed' },
    { value: 'in_maintenance', label: 'In Maintenance' },
    { value: 'retired', label: 'Retired' }
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading assets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assets</h1>
          <p className="text-gray-600 mt-1">
            Post-live asset lifecycle management and monitoring
          </p>
        </div>
        {canManageAssets && (
          <Button variant="gradient" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Asset</span>
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, serial number, or site..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={siteFilter} onValueChange={setSiteFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sites</SelectItem>
                <SelectItem value="1">London Central</SelectItem>
                <SelectItem value="2">Manchester North</SelectItem>
                <SelectItem value="3">Birmingham South</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Clear Filters</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Asset Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Status Dashboard</CardTitle>
          <CardDescription>
            Overview of asset counts and status breakdowns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {assets.filter(a => a.status === 'deployed').length}
              </div>
              <div className="text-sm text-green-600">Deployed</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {assets.filter(a => a.status === 'assigned').length}
              </div>
              <div className="text-sm text-blue-600">Assigned</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {assets.filter(a => a.status === 'in_maintenance').length}
              </div>
              <div className="text-sm text-orange-600">In Maintenance</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {assets.filter(a => a.status === 'in_stock').length}
              </div>
              <div className="text-sm text-purple-600">In Stock</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {assets.filter(a => a.status === 'retired').length}
              </div>
              <div className="text-sm text-red-600">Retired</div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Warranty</TableHead>
                <TableHead>Next Maintenance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map((asset) => {
                const statusConfig = getStatusConfig(asset.status);
                const StatusIcon = statusConfig.icon;
                const warrantyExpired = new Date(asset.warranty_expiry) < new Date();
                const maintenanceDue = new Date(asset.next_maintenance) < new Date();
                
                return (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <div className="font-medium">{asset.name}</div>
                      <div className="text-sm text-gray-500">{asset.serial_number}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{asset.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span>{asset.site_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusConfig.color} flex items-center space-x-1`}>
                        <StatusIcon className="h-3 w-3" />
                        <span>{statusConfig.label}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className={`text-sm ${warrantyExpired ? 'text-red-600' : 'text-gray-600'}`}>
                        {new Date(asset.warranty_expiry).toLocaleDateString()}
                        {warrantyExpired && <AlertCircle className="h-3 w-3 inline ml-1" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`text-sm ${maintenanceDue ? 'text-orange-600' : 'text-gray-600'}`}>
                        {new Date(asset.next_maintenance).toLocaleDateString()}
                        {maintenanceDue && <Clock className="h-3 w-3 inline ml-1" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canManageAssets && (
                          <>
                            <Button variant="outline" size="sm">
                              <Wrench className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Assets; 