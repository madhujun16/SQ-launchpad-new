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
  name: string;
  category: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  status: 'deployed' | 'available' | 'maintenance' | 'retired';
  siteId: string;
  siteName: string;
  deploymentDate: string;
  warrantyExpiry: string;
  lastMaintenance: string;
  nextMaintenance: string;
  cost: number;
  specifications: string;
  location: string;
  assignedTo: string;
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
      name: 'SmartQ POS Terminal',
      category: 'POS Systems',
      model: 'SQ-POS-2024',
      manufacturer: 'SmartQ Technologies',
      serialNumber: 'SQ001-2024-001',
      status: 'deployed',
      siteId: '1',
      siteName: 'ASDA Redditch',
      deploymentDate: '2024-07-15',
      warrantyExpiry: '2027-07-15',
      lastMaintenance: '2024-06-15',
      nextMaintenance: '2024-09-15',
      cost: 2500,
      specifications: 'Touch screen, card reader, receipt printer, 4GB RAM, 128GB SSD',
      location: 'Main Counter',
      assignedTo: 'John Smith'
    },
    {
      id: '2',
      name: 'Self-Service Kiosk',
      category: 'Kiosks',
      model: 'SQ-KIOSK-2024',
      manufacturer: 'SmartQ Technologies',
      serialNumber: 'SQ002-2024-001',
      status: 'deployed',
      siteId: '1',
      siteName: 'ASDA Redditch',
      deploymentDate: '2024-07-15',
      warrantyExpiry: '2027-07-15',
      lastMaintenance: '2024-06-15',
      nextMaintenance: '2024-09-15',
      cost: 3500,
      specifications: 'Large touch screen, payment terminal, thermal printer, 8GB RAM, 256GB SSD',
      location: 'Entrance Area',
      assignedTo: 'Emma Wilson'
    },
    {
      id: '3',
      name: 'Network Switch',
      category: 'Networking',
      model: 'Cisco-C2960',
      manufacturer: 'Cisco',
      serialNumber: 'CIS001-2024-001',
      status: 'deployed',
      siteId: '1',
      siteName: 'ASDA Redditch',
      deploymentDate: '2024-07-15',
      warrantyExpiry: '2026-07-15',
      lastMaintenance: '2024-06-15',
      nextMaintenance: '2024-09-15',
      cost: 5500,
      specifications: '24-port PoE switch, managed, Layer 2',
      location: 'Server Room',
      assignedTo: 'David Brown'
    },
    {
      id: '4',
      name: 'Thermal Printer',
      category: 'Printers',
      model: 'TP-80',
      manufacturer: 'Epson',
      serialNumber: 'EPS001-2024-001',
      status: 'deployed',
      siteId: '1',
      siteName: 'ASDA Redditch',
      deploymentDate: '2024-07-15',
      warrantyExpiry: '2026-07-15',
      lastMaintenance: '2024-06-15',
      nextMaintenance: '2024-09-15',
      cost: 300,
      specifications: '80mm thermal printer, USB connection',
      location: 'Main Counter',
      assignedTo: 'John Smith'
    },
    {
      id: '5',
      name: 'Vendor POS System',
      category: 'POS Systems',
      model: 'VPOS-2024',
      manufacturer: 'VendorTech',
      serialNumber: 'VT001-2024-001',
      status: 'deployed',
      siteId: '2',
      siteName: 'HSBC Canary Wharf',
      deploymentDate: '2024-07-20',
      warrantyExpiry: '2027-07-20',
      lastMaintenance: '2024-06-20',
      nextMaintenance: '2024-09-20',
      cost: 1800,
      specifications: 'Basic POS with card reader, 2GB RAM, 64GB SSD',
      location: 'Vendor Counter 1',
      assignedTo: 'Mike Thompson'
    },
    {
      id: '6',
      name: 'Kitchen Display System',
      category: 'Kiosks',
      model: 'KDS-2024',
      manufacturer: 'KitchenTech',
      serialNumber: 'KT001-2024-001',
      status: 'deployed',
      siteId: '2',
      siteName: 'HSBC Canary Wharf',
      deploymentDate: '2024-07-20',
      warrantyExpiry: '2027-07-20',
      lastMaintenance: '2024-06-20',
      nextMaintenance: '2024-09-20',
      cost: 1200,
      specifications: 'Digital order display for kitchen, 4GB RAM, 128GB SSD',
      location: 'Kitchen Area',
      assignedTo: 'Sarah Johnson'
    },
    {
      id: '7',
      name: 'POS Terminal Replacement',
      category: 'POS Systems',
      model: 'SQ-POS-2024',
      manufacturer: 'SmartQ Technologies',
      serialNumber: 'SQ003-2024-001',
      status: 'maintenance',
      siteId: '3',
      siteName: 'Manchester Central',
      deploymentDate: '2024-06-10',
      warrantyExpiry: '2027-06-10',
      lastMaintenance: '2024-05-10',
      nextMaintenance: '2024-08-10',
      cost: 2500,
      specifications: 'Touch screen, card reader, receipt printer, 4GB RAM, 128GB SSD',
      location: 'Counter 3',
      assignedTo: 'David Brown'
    },
    {
      id: '8',
      name: 'Advanced POS System',
      category: 'POS Systems',
      model: 'SQ-POS-PRO-2024',
      manufacturer: 'SmartQ Technologies',
      serialNumber: 'SQ004-2024-001',
      status: 'available',
      siteId: '',
      siteName: 'Warehouse',
      deploymentDate: '',
      warrantyExpiry: '2027-08-01',
      lastMaintenance: '',
      nextMaintenance: '',
      cost: 3500,
      specifications: 'Advanced features, analytics dashboard, 8GB RAM, 256GB SSD',
      location: 'Warehouse',
      assignedTo: 'Unassigned'
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
      deployedDate: '2024-07-15',
      lastUpdated: '2024-07-30'
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
      deployedDate: '2024-07-20',
      lastUpdated: '2024-07-29'
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
      deployedDate: '2024-06-10',
      lastUpdated: '2024-07-28'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'bg-green-100 text-green-800';
      case 'available': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'retired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'POS Systems': return <CreditCardIcon className="h-4 w-4" />;
      case 'Kiosks': return <MonitorIcon className="h-4 w-4" />;
      case 'Printers': return <PrinterIcon className="h-4 w-4" />;
      case 'Networking': return <RouterIcon className="h-4 w-4" />;
      case 'Servers': return <ServerIcon className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'POS Systems': return 'bg-indigo-100 text-indigo-800';
      case 'Kiosks': return 'bg-purple-100 text-purple-800';
      case 'Printers': return 'bg-orange-100 text-orange-800';
      case 'Networking': return 'bg-blue-100 text-blue-800';
      case 'Servers': return 'bg-green-100 text-green-800';
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
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.siteName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSite = filterSite === 'all' || item.siteId === filterSite;
    return matchesSearch && matchesCategory && matchesStatus && matchesSite;
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
  const deployedHardware = hardwareInventory.filter(h => h.status === 'deployed').length;
  const availableHardware = hardwareInventory.filter(h => h.status === 'available').length;
  const maintenanceHardware = hardwareInventory.filter(h => h.status === 'maintenance').length;

  const totalValue = hardwareInventory.reduce((sum, item) => sum + item.cost, 0);

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
                  <p className="text-2xl font-bold text-blue-600">{totalHardware}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Deployed</p>
                  <p className="text-2xl font-bold text-green-600">{deployedHardware}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-blue-600">{availableHardware}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
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
                          <SelectItem value="POS Systems">POS Systems</SelectItem>
                          <SelectItem value="Kiosks">Kiosks</SelectItem>
                          <SelectItem value="Printers">Printers</SelectItem>
                          <SelectItem value="Networking">Networking</SelectItem>
                          <SelectItem value="Servers">Servers</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="deployed">Deployed</SelectItem>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="retired">Retired</SelectItem>
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
                          <Button variant="ghost" onClick={() => handleSort('name')} className="h-auto p-0 font-semibold">
                            Hardware Name
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">Category</TableHead>
                        <TableHead className="font-semibold text-gray-700">Site</TableHead>
                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700">Deployment Date</TableHead>
                        <TableHead className="font-semibold text-gray-700">Cost</TableHead>
                        <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedHardware.map((item) => (
                        <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium text-gray-900">
                            <div>
                              <div className="font-semibold">{item.name}</div>
                              <div className="text-sm text-gray-500">{item.model}</div>
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
                            <div className="text-sm">
                              <div className="font-medium">{item.siteName}</div>
                              <div className="text-gray-500">{item.location}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {item.deploymentDate || 'Not deployed'}
                          </TableCell>
                          <TableCell className="text-gray-700">
                            £{item.cost.toLocaleString()}
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
                      <Building className="h-5 w-5 text-blue-600" />
                      {site.siteName}
                    </CardTitle>
                    <CardDescription>{site.organization}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Hardware</p>
                        <p className="text-2xl font-bold text-blue-600">{site.totalHardware}</p>
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
                    <BarChart3 className="h-5 w-5 text-blue-600" />
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