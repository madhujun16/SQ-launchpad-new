import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/roles';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Building, 
  Search, 
  Eye, 
  CheckCircle, 
  Download,
  MoreHorizontal,
  ArrowUpDown,
  Package,
  DollarSign,
  BarChart3,
  Activity,
  CreditCardIcon,
  MonitorIcon,
  PrinterIcon,
  ServerIcon,
  RouterIcon,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface HardwareItem {
  id: string;
  hardware_name: string;
  category: string;
  mounting_types: string[];
  manufacturer: string;
  unit_cost: number;
  service_types: string[];
  service_costs: Record<string, number>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SiteHardwareSummary {
  siteId: string;
  siteName: string;
  organization: string;
  totalHardware: number;
  posSystems: number;
  kiosks: number;
  printers: number;
  networking: number;
  servers: number;
  other: number;
  deployedDate: string;
  lastUpdated: string;
}

const HardwareMaster = () => {
  const { currentRole } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSite, setFilterSite] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [activeTab, setActiveTab] = useState('inventory');

  // Check if user has permission to access hardware master
  useEffect(() => {
    if (currentRole && !hasPermission(currentRole, 'view_inventory')) {
      toast.error('You do not have permission to access the Hardware Master panel');
      navigate('/dashboard');
    }
  }, [currentRole, navigate]);

  // Mock data for hardware inventory
  const hardwareInventory: HardwareItem[] = [
    {
      id: '1',
      hardware_name: '15.6" Kitchen Screen',
      category: 'Kitchen Display System (KDS)',
      mounting_types: ['Fixed'],
      manufacturer: 'ELO',
      unit_cost: 839.00,
      service_types: ['On-site Support', 'Remote Support', 'Delivery'],
      service_costs: {
        'onSiteSupport': 199.00,
        'remoteSupport': 259.00,
        'delivery': 80.00
      },
      is_active: true,
      created_at: '2024-12-01T10:00:00Z',
      updated_at: '2024-12-01T10:00:00Z'
    },
    {
      id: '2',
      hardware_name: 'Printer with Cable',
      category: 'Kitchen Display System (KDS)',
      mounting_types: ['Other'],
      manufacturer: '',
      unit_cost: 199.00,
      service_types: [],
      service_costs: {},
      is_active: true,
      created_at: '2024-12-01T10:00:00Z',
      updated_at: '2024-12-01T10:00:00Z'
    },
    {
      id: '3',
      hardware_name: 'Wall Mounting Kit (Fixed)',
      category: 'Kitchen Display System (KDS)',
      mounting_types: ['Wall Mounted'],
      manufacturer: '',
      unit_cost: 136.00,
      service_types: [],
      service_costs: {},
      is_active: true,
      created_at: '2024-12-01T10:00:00Z',
      updated_at: '2024-12-01T10:00:00Z'
    },
    {
      id: '4',
      hardware_name: 'ELO Remote Support',
      category: 'Support & Sundries',
      mounting_types: ['Other'],
      manufacturer: 'ELO',
      unit_cost: 259.00,
      service_types: ['Remote Support'],
      service_costs: {
        'remoteSupport': 259.00
      },
      is_active: true,
      created_at: '2024-12-01T10:00:00Z',
      updated_at: '2024-12-01T10:00:00Z'
    },
    {
      id: '5',
      hardware_name: 'Installation Engineer - Weekday',
      category: 'Support & Sundries',
      mounting_types: ['Other'],
      manufacturer: '',
      unit_cost: 500.00,
      service_types: ['On-site Support'],
      service_costs: {
        'onSiteSupport': 500.00
      },
      is_active: true,
      created_at: '2024-12-01T10:00:00Z',
      updated_at: '2024-12-01T10:00:00Z'
    }
  ];

  // Mock data for site hardware summaries
  const siteHardwareSummaries: SiteHardwareSummary[] = [
    {
      siteId: '1',
      siteName: 'ASDA Redditch',
      organization: 'ASDA',
      totalHardware: 4,
      posSystems: 1,
      kiosks: 1,
      printers: 1,
      networking: 1,
      servers: 0,
      other: 0,
      deployedDate: '2024-12-15',
      lastUpdated: '2024-12-30'
    },
    {
      siteId: '2',
      siteName: 'HSBC Canary Wharf',
      organization: 'HSBC',
      totalHardware: 2,
      posSystems: 1,
      kiosks: 1,
      printers: 0,
      networking: 0,
      servers: 0,
      other: 0,
      deployedDate: '2024-12-20',
      lastUpdated: '2024-12-29'
    },
    {
      siteId: '3',
      siteName: 'Manchester Central',
      organization: 'Compass Group UK',
      totalHardware: 1,
      posSystems: 1,
      kiosks: 0,
      printers: 0,
      networking: 0,
      servers: 0,
      other: 0,
      deployedDate: '2024-11-10',
      lastUpdated: '2024-12-28'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'bg-green-100 text-green-800';
      case 'available': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'retired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Kitchen Display System (KDS)': return <MonitorIcon className="h-4 w-4" />;
      case 'Support & Sundries': return <Activity className="h-4 w-4" />;
      case 'Kiosk': return <MonitorIcon className="h-4 w-4" />;
      case 'POS Terminal': return <CreditCardIcon className="h-4 w-4" />;
      case 'Customer Display Screen (TDS)': return <MonitorIcon className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Kitchen Display System (KDS)': return 'bg-green-100 text-green-800';
      case 'Support & Sundries': return 'bg-orange-100 text-orange-800';
      case 'Kiosk': return 'bg-purple-100 text-purple-800';
      case 'POS Terminal': return 'bg-indigo-100 text-indigo-800';
      case 'Customer Display Screen (TDS)': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownloadReport = (type: string) => {
    toast.success(`Downloading ${type} report`);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredHardware = hardwareInventory.filter(item => {
    const matchesSearch = item.hardware_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || (item.is_active ? 'active' : 'inactive') === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedHardware = [...filteredHardware].sort((a, b) => {
    let aValue = a[sortBy as keyof HardwareItem];
    let bValue = b[sortBy as keyof HardwareItem];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const totalHardware = hardwareInventory.length;
  const activeHardware = hardwareInventory.filter(h => h.is_active).length;
  const inactiveHardware = hardwareInventory.filter(h => !h.is_active).length;

  const totalValue = hardwareInventory.reduce((sum, item) => sum + item.unit_cost, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="w-full max-w-none px-2 sm:px-4 lg:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Hardware Master</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Complete hardware inventory management and deployment tracking
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Hardware</p>
                  <p className="text-2xl font-bold text-green-600">{totalHardware}</p>
                </div>
                <Package className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{activeHardware}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inactive</p>
                  <p className="text-2xl font-bold text-red-600">{inactiveHardware}</p>
                </div>
                <Package className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-purple-600">£{totalValue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inventory">Hardware Inventory</TabsTrigger>
            <TabsTrigger value="sites">Site Deployment</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-6">
            {/* Filters */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search hardware..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="Kitchen Display System (KDS)">Kitchen Display System (KDS)</SelectItem>
                          <SelectItem value="Support & Sundries">Support & Sundries</SelectItem>
                          <SelectItem value="Kiosk">Kiosk</SelectItem>
                          <SelectItem value="POS Terminal">POS Terminal</SelectItem>
                          <SelectItem value="Customer Display Screen (TDS)">Customer Display Screen (TDS)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={() => handleDownloadReport('inventory')} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Hardware Table */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold text-gray-700">
                          <Button variant="ghost" onClick={() => handleSort('hardware_name')} className="h-auto p-0 font-semibold">
                            Hardware Name
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">Category</TableHead>
                        <TableHead className="font-semibold text-gray-700">Mounting Types</TableHead>
                        <TableHead className="font-semibold text-gray-700">Manufacturer</TableHead>
                        <TableHead className="font-semibold text-gray-700">Unit Cost</TableHead>
                        <TableHead className="font-semibold text-gray-700">Service Types</TableHead>
                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedHardware.map((item) => (
                        <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium text-gray-900">
                            <div>
                              <div className="font-semibold">{item.hardware_name}</div>
                              <div className="text-sm text-gray-500">{item.manufacturer}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(item.category)}
                              <Badge className={getCategoryColor(item.category)}>
                                {item.category}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {item.mounting_types.map((type, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {item.manufacturer || 'N/A'}
                          </TableCell>
                          <TableCell className="text-gray-700">
                            £{item.unit_cost.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {item.service_types.map((type, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {type}
                                </Badge>
                              ))}
                              {item.service_types.length === 0 && (
                                <span className="text-gray-400 text-sm">None</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {item.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download Specs
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sites" className="space-y-6">
            {/* Site Deployment Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {siteHardwareSummaries.map((site) => (
                <Card key={site.siteId} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-green-600" />
                      {site.siteName}
                    </CardTitle>
                    <CardDescription>{site.organization}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Hardware</p>
                        <p className="text-2xl font-bold text-green-600">{site.totalHardware}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Deployed Date</p>
                        <p className="text-sm">{site.deployedDate}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">POS Systems</span>
                        <Badge variant="secondary">{site.posSystems}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Kiosks</span>
                        <Badge variant="secondary">{site.kiosks}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Printers</span>
                        <Badge variant="secondary">{site.printers}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Networking</span>
                        <Badge variant="secondary">{site.networking}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            {/* Reports Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    Deployment Report
                  </CardTitle>
                  <CardDescription>Hardware deployment by site</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => handleDownloadReport('deployment')} className="w-full" variant="gradient">
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    Maintenance Report
                  </CardTitle>
                  <CardDescription>Upcoming maintenance schedule</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => handleDownloadReport('maintenance')} className="w-full" variant="gradient">
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                    Cost Report
                  </CardTitle>
                  <CardDescription>Hardware cost analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => handleDownloadReport('cost')} className="w-full" variant="gradient">
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HardwareMaster; 