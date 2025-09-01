import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  Monitor,
  List,
  Database,
  Key,
  History
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { AccessDenied } from '@/components/AccessDenied';
import { ContentLoader } from '@/components/ui/loader';
import { getRoleConfig } from '@/lib/roles';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { formatDate } from '@/lib/dateUtils';

interface Asset {
  id: string;
  name: string;
  type: 'hardware' | 'software' | 'license' | 'certificate';
  serial_number?: string;
  license_key?: string;
  site_name: string;
  site_id: string;
  status: 'active' | 'inactive' | 'expired' | 'pending_renewal' | 'maintenance';
  assigned_to?: string;
  purchase_date: string;
  expiry_date?: string;
  cost: number;
  manufacturer?: string;
  model?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface AssetRequest {
  id: string;
  siteName: string;
  siteId: string;
  requestedBy: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assetType: 'hardware' | 'software' | 'license' | 'certificate';
  assetName: string;
  quantity: number;
  estimatedCost: number;
  justification: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComment?: string;
}

const Assets = () => {
  const { currentRole, profile } = useAuth();
  const { getTabAccess } = useRoleAccess();
  const navigate = useNavigate();
  const roleConfig = getRoleConfig(currentRole || 'admin');
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [siteFilter, setSiteFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inventory' | 'licenses'>('inventory');
  const [showAddAssetDialog, setShowAddAssetDialog] = useState(false);
  const [newAssetRequest, setNewAssetRequest] = useState<Partial<AssetRequest>>({
    assetType: 'hardware',
    quantity: 1,
    priority: 'medium'
  });

  // Check access permissions
  const tabAccess = getTabAccess('/assets');
  
  if (!tabAccess.canAccess) {
    return (
      <AccessDenied 
        pageName="Assets"
        customMessage="You don't have permission to access the Assets page."
      />
    );
  }

  // Mock data
  useEffect(() => {
    if (!currentRole || !profile) {
      return;
    }
    
    const mockAssets: Asset[] = [
      {
        id: '1',
        name: 'POS Terminal 001',
        type: 'hardware',
        serial_number: 'POS-2025-001',
        site_name: 'London Central',
        site_id: '1',
        status: 'active',
        assigned_to: 'John Smith',
        purchase_date: '2025-09-01',
        cost: 2500,
        manufacturer: 'Ingenico',
        model: 'Telium 2',
        notes: 'Primary POS terminal for main counter',
        created_at: '2025-09-01',
        updated_at: '2025-09-15'
      },
      {
        id: '2',
        name: 'Display Screen 001',
        type: 'hardware',
        serial_number: 'DS-2025-001',
        site_name: 'Manchester North',
        site_id: '2',
        status: 'active',
        assigned_to: 'Sarah Wilson',
        purchase_date: '2025-09-05',
        cost: 1800,
        manufacturer: 'Samsung',
        model: 'SM-T580',
        notes: 'Customer-facing display for menu and promotions',
        created_at: '2025-09-05',
        updated_at: '2025-09-10'
      },
      {
        id: '3',
        name: 'POS Software License',
        type: 'software',
        license_key: 'LIC-POS-2025-001',
        site_name: 'Birmingham South',
        site_id: '3',
        status: 'active',
        assigned_to: 'Emma Davis',
        purchase_date: '2025-09-10',
        expiry_date: '2026-09-10',
        cost: 500,
        notes: 'Annual POS software license',
        created_at: '2025-09-10',
        updated_at: '2025-09-10'
      },
      {
        id: '4',
        name: 'Food Safety Certificate',
        type: 'certificate',
        site_name: 'London Central',
        site_id: '1',
        status: 'active',
        purchase_date: '2025-08-15',
        expiry_date: '2026-08-15',
        cost: 200,
        notes: 'Annual food safety compliance certificate',
        created_at: '2025-08-15',
        updated_at: '2025-08-15'
      },
      {
        id: '5',
        name: 'Payment Processing License',
        type: 'license',
        license_key: 'PAY-LIC-2025-001',
        site_name: 'Manchester North',
        site_id: '2',
        status: 'pending_renewal',
        assigned_to: 'Sarah Wilson',
        purchase_date: '2025-07-01',
        expiry_date: '2025-12-01',
        cost: 300,
        notes: 'Payment processing license expiring soon',
        created_at: '2025-07-01',
        updated_at: '2025-11-15'
      }
    ];

    setAssets(mockAssets);
    setFilteredAssets(mockAssets);
    setLoading(false);
  }, [currentRole, profile]);

  useEffect(() => {
    let filtered = assets;

    if (searchTerm) {
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (asset.serial_number && asset.serial_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (asset.license_key && asset.license_key.toLowerCase().includes(searchTerm.toLowerCase())) ||
        asset.site_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(asset => asset.status === statusFilter);
    }

    if (siteFilter !== 'all') {
      filtered = filtered.filter(asset => asset.site_id === siteFilter);
    }

    // Filter by tab
    if (activeTab === 'inventory') {
      filtered = filtered.filter(asset => asset.type === 'hardware');
    } else if (activeTab === 'licenses') {
      filtered = filtered.filter(asset => ['software', 'license', 'certificate'].includes(asset.type));
    }

    setFilteredAssets(filtered);
  }, [assets, searchTerm, statusFilter, siteFilter, activeTab]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'pending_renewal': return 'bg-orange-100 text-orange-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hardware': return 'bg-blue-100 text-blue-800';
      case 'software': return 'bg-purple-100 text-purple-800';
      case 'license': return 'bg-indigo-100 text-indigo-800';
      case 'certificate': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddAsset = () => {
    if (!newAssetRequest.siteName || !newAssetRequest.assetName || !newAssetRequest.justification) {
      toast.error('Please fill in all required fields');
      return;
    }

    // In a real app, this would submit to the approval workflow
    toast.success('Asset request submitted for approval');
    setShowAddAssetDialog(false);
    setNewAssetRequest({
      assetType: 'hardware',
      quantity: 1,
      priority: 'medium'
    });
  };

  if (loading) {
    return <ContentLoader />;
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assets</h1>
          <p className="text-gray-600 mt-1">
            Manage site assets, licenses, and compliance certificates
          </p>
        </div>
        <Button 
          onClick={() => setShowAddAssetDialog(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Asset Request
        </Button>
      </div>

      {/* Asset Status Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Assets</p>
                <p className="text-2xl font-bold text-gray-900">
                  {assets.filter(a => a.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Renewal</p>
                <p className="text-2xl font-bold text-gray-900">
                  {assets.filter(a => a.status === 'pending_renewal').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-gray-900">
                  {assets.filter(a => a.status === 'expired').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  £{assets.reduce((sum, a) => sum + a.cost, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-white p-1 rounded-lg border">
          <Button
            variant={activeTab === 'inventory' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('inventory')}
            className="flex-1"
          >
            <Package className="h-4 w-4 mr-2" />
            Inventory ({assets.filter(a => a.type === 'hardware').length})
          </Button>
          <Button
            variant={activeTab === 'licenses' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('licenses')}
            className="flex-1"
          >
            <Key className="h-4 w-4 mr-2" />
            Licenses ({assets.filter(a => ['software', 'license', 'certificate'].includes(a.type)).length})
          </Button>
        </div>
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
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="pending_renewal">Pending Renewal</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={siteFilter} onValueChange={setSiteFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Sites" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sites</SelectItem>
                <SelectItem value="1">London Central</SelectItem>
                <SelectItem value="2">Manchester North</SelectItem>
                <SelectItem value="3">Birmingham South</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setSiteFilter('all');
              }}
            >
              <Filter className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {activeTab === 'inventory' ? (
              <>
                <Package className="h-5 w-5" />
                <span>Hardware Inventory</span>
              </>
            ) : (
              <>
                <Key className="h-5 w-5" />
                <span>Licenses & Certificates</span>
              </>
            )}
          </CardTitle>
          <CardDescription>
            {activeTab === 'inventory' 
              ? 'Manage hardware assets and equipment'
              : 'Track software licenses and compliance certificates'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell>
                    <div className="font-medium">{asset.name}</div>
                    {asset.serial_number && (
                      <div className="text-sm text-gray-500 font-mono">{asset.serial_number}</div>
                    )}
                    {asset.license_key && (
                      <div className="text-sm text-gray-500 font-mono">{asset.license_key}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(asset.type)}>
                      {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Building className="h-3 w-3 text-gray-400" />
                      <span>{asset.site_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(asset.status)}>
                      {asset.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {asset.assigned_to ? (
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3 text-gray-400" />
                        <span>{asset.assigned_to}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">£{asset.cost.toLocaleString()}</div>
                    {asset.expiry_date && (
                      <div className="text-xs text-gray-500">
                        Expires: {formatDate(asset.expiry_date)}
                      </div>
                    )}
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

      {/* Add Asset Request Dialog */}
      <Dialog open={showAddAssetDialog} onOpenChange={setShowAddAssetDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request New Asset</DialogTitle>
            <DialogDescription>
              Submit a request for new hardware, software, or license. This will go through the approval process.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="site">Site *</Label>
                <Select 
                  value={newAssetRequest.siteId} 
                  onValueChange={(value) => setNewAssetRequest(prev => ({ ...prev, siteId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select site" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">London Central</SelectItem>
                    <SelectItem value="2">Manchester North</SelectItem>
                    <SelectItem value="3">Birmingham South</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority *</Label>
                <Select 
                  value={newAssetRequest.priority} 
                  onValueChange={(value) => setNewAssetRequest(prev => ({ ...prev, priority: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assetType">Asset Type *</Label>
                <Select 
                  value={newAssetRequest.assetType} 
                  onValueChange={(value) => setNewAssetRequest(prev => ({ ...prev, assetType: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hardware">Hardware</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="license">License</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  type="number"
                  min="1"
                  value={newAssetRequest.quantity}
                  onChange={(e) => setNewAssetRequest(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  placeholder="1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="assetName">Asset Name *</Label>
              <Input
                value={newAssetRequest.assetName}
                onChange={(e) => setNewAssetRequest(prev => ({ ...prev, assetName: e.target.value }))}
                placeholder="e.g., POS Terminal, Software License, Safety Certificate"
              />
            </div>

            <div>
              <Label htmlFor="estimatedCost">Estimated Cost (£) *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={newAssetRequest.estimatedCost}
                onChange={(e) => setNewAssetRequest(prev => ({ ...prev, estimatedCost: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="justification">Justification *</Label>
              <Textarea
                value={newAssetRequest.justification}
                onChange={(e) => setNewAssetRequest(prev => ({ ...prev, justification: e.target.value }))}
                placeholder="Explain why this asset is needed..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAssetDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAsset} className="bg-green-600 hover:bg-green-700">
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Assets; 