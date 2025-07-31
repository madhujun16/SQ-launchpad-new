import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/roles';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Server, 
  Monitor, 
  Printer, 
  Network, 
  Search, 
  Plus, 
  Filter, 
  Download,
  HardDrive,
  Cpu,
  Memory,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

interface HardwareItem {
  id: string;
  name: string;
  type: 'server' | 'workstation' | 'printer' | 'network' | 'storage';
  status: 'available' | 'allocated' | 'maintenance' | 'retired';
  specifications: {
    cpu?: string;
    memory?: string;
    storage?: string;
    network?: string;
  };
  location: string;
  assignedTo?: string;
  lastUpdated: string;
  description: string;
}

const HardwareScoping = () => {
  const { currentRole } = useAuth();
  const navigate = useNavigate();
  const [hardwareItems, setHardwareItems] = useState<HardwareItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Check if user has permission to access hardware scoping
  useEffect(() => {
    if (currentRole && !hasPermission(currentRole, 'approve_hardware_requests')) {
      toast.error('You do not have permission to access the Hardware Scoping panel');
      navigate('/dashboard');
    }
  }, [currentRole, navigate]);

  // Mock data for hardware items
  useEffect(() => {
    const mockHardware: HardwareItem[] = [
      {
        id: '1',
        name: 'Dell PowerEdge R740 Server',
        type: 'server',
        status: 'allocated',
        specifications: {
          cpu: 'Intel Xeon E5-2680 v4',
          memory: '64GB DDR4',
          storage: '2TB SSD + 4TB HDD',
          network: '10GbE'
        },
        location: 'Manchester Central',
        assignedTo: 'John Smith',
        lastUpdated: '2024-07-30',
        description: 'Production server for cafeteria management system'
      },
      {
        id: '2',
        name: 'HP EliteDesk 800 G5',
        type: 'workstation',
        status: 'available',
        specifications: {
          cpu: 'Intel Core i7-9700',
          memory: '16GB DDR4',
          storage: '512GB SSD',
          network: '1GbE'
        },
        location: 'London Bridge',
        lastUpdated: '2024-07-29',
        description: 'Workstation for staff use'
      },
      {
        id: '3',
        name: 'Canon imageRUNNER ADVANCE C5560',
        type: 'printer',
        status: 'maintenance',
        specifications: {
          network: 'WiFi + Ethernet'
        },
        location: 'Birmingham Office',
        lastUpdated: '2024-07-28',
        description: 'Multi-function printer for office use'
      },
      {
        id: '4',
        name: 'Cisco Catalyst 2960-X',
        type: 'network',
        status: 'available',
        specifications: {
          network: '48-Port Gigabit'
        },
        location: 'Manchester Central',
        lastUpdated: '2024-07-27',
        description: 'Network switch for cafeteria infrastructure'
      }
    ];
    setHardwareItems(mockHardware);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'allocated': return 'bg-blue-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'retired': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'server': return Server;
      case 'workstation': return Monitor;
      case 'printer': return Printer;
      case 'network': return Network;
      case 'storage': return HardDrive;
      default: return Activity;
    }
  };

  const filteredItems = hardwareItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getKeyMetrics = () => {
    const total = hardwareItems.length;
    const available = hardwareItems.filter(item => item.status === 'available').length;
    const allocated = hardwareItems.filter(item => item.status === 'allocated').length;
    const maintenance = hardwareItems.filter(item => item.status === 'maintenance').length;
    
    return { total, available, allocated, maintenance };
  };

  const metrics = getKeyMetrics();

  // If user doesn't have permission, show access denied
  if (currentRole && !hasPermission(currentRole, 'approve_hardware_requests')) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
            <p className="text-muted-foreground">
              You do not have permission to access the Hardware Scoping panel.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Hardware Scoping</h1>
          <p className="text-muted-foreground">
            Manage hardware inventory, allocation, and specifications across all sites
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hardware</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics.available}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Allocated</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{metrics.allocated}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
              <Printer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{metrics.maintenance}</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-4">
            <Button className="bg-primary hover:bg-primary-dark">
              <Plus className="mr-2 h-4 w-4" />
              Add Hardware
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
                placeholder="Search hardware..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        {/* Hardware Items */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Hardware</TabsTrigger>
            <TabsTrigger value="servers">Servers</TabsTrigger>
            <TabsTrigger value="workstations">Workstations</TabsTrigger>
            <TabsTrigger value="printers">Printers</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const TypeIcon = getTypeIcon(item.type);
                return (
                  <Card key={item.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <TypeIcon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <CardTitle className="text-lg">{item.name}</CardTitle>
                            <CardDescription className="flex items-center mt-1">
                              <span className="capitalize">{item.type}</span>
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Location</span>
                          <span className="font-medium">{item.location}</span>
                        </div>
                        
                        {item.assignedTo && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Assigned To</span>
                            <span className="font-medium">{item.assignedTo}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Last Updated</span>
                          <span className="font-medium">{item.lastUpdated}</span>
                        </div>
                        
                        {item.specifications.cpu && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">CPU</span>
                            <span className="font-medium">{item.specifications.cpu}</span>
                          </div>
                        )}
                        
                        {item.specifications.memory && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Memory</span>
                            <span className="font-medium">{item.specifications.memory}</span>
                          </div>
                        )}
                        
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No hardware found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms.' : 'No hardware items are currently available.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default HardwareScoping; 