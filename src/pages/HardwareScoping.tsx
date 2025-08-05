import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  FileText,
  Package,
  Truck,
  Wrench,
  Settings,
  Calendar,
  User,
  MapPin,
  Monitor,
  Printer,
  CreditCard,
  Smartphone,
  Tablet,
  Server,
  Wifi,
  Zap,
  Shield,
  FileImage
} from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';

interface HardwareItem {
  id: string;
  type: string;
  category: string;
  quantity: number;
  source: 'site-study' | 'manual';
  location: string;
  notes: string;
  status: 'pending' | 'in-progress' | 'done';
  deliveryStatus: 'pending' | 'dispatched' | 'delivered';
  etaDelivery: string;
  etaInstall: string;
}

interface SiteSummary {
  organisation: string;
  unitName: string;
  deploymentEngineer: string;
  goLiveDate: string;
  smartQSolution: string;
}

interface HardwareScope {
  id: string;
  siteName: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  submittedOn: string;
  approvedBy: string;
  hardwareItems: HardwareItem[];
  supportingFiles: File[];
  remarks: string;
  estimatedDispatchDate: string;
  requiredInstallationDate: string;
}

interface Site {
  id: string;
  name: string;
  food_court_unit: string;
  sector_name: string;
  city_name: string;
  address: string;
  status: string;
}

interface Sector {
  id: string;
  name: string;
  description: string | null;
}

interface CostItem {
  hardware: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  source: 'site-study' | 'manual';
}

interface CostSummary {
  hardwareCosts: CostItem[];
  licensing: {
    appFee: number;
    controlDesk: number;
    kioskLicense: number;
    monthlyTotal: number;
  };
  supportCosts: {
    deployment: number;
    menuSetup: number;
    melfordSurvey: number;
    smartqSupport: number;
  };
  capex: number;
  opex: number;
  totalCost: number;
}

const HardwareScoping = () => {
  const { currentRole } = useAuth();
  const [activeTab, setActiveTab] = useState('scope');
  const [isAddHardwareOpen, setIsAddHardwareOpen] = useState(false);
  const [isViewScopeOpen, setIsViewScopeOpen] = useState(false);
  const [selectedScope, setSelectedScope] = useState<HardwareScope | null>(null);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('');

  // Static mock data to avoid infinite loops
  const sites = [
    {
      id: '1',
      name: 'ASDA Redditch',
      food_court_unit: 'ASDA',
      sector_name: 'ASDA',
      city_name: 'Redditch',
      address: '123 Main Street',
      status: 'active'
    },
    {
      id: '2',
      name: 'HSBC Canary Wharf',
      food_court_unit: 'HSBC',
      sector_name: 'HSBC',
      city_name: 'London',
      address: '456 Canary Wharf',
      status: 'active'
    },
    {
      id: '3',
      name: 'Compass Group Manchester',
      food_court_unit: 'Compass',
      sector_name: 'Compass Group',
      city_name: 'Manchester',
      address: '789 Business Park',
      status: 'active'
    }
  ];

  const sectors = [
    { id: '1', name: 'ASDA', description: 'ASDA Group' },
    { id: '2', name: 'HSBC', description: 'HSBC Bank' },
    { id: '3', name: 'Compass Group', description: 'Compass Group' }
  ];

  // Filter sites based on selected sector
  const filteredSites = sites.filter(site => 
    selectedSector === 'all' || !selectedSector || site.sector_name === selectedSector
  );

  // Get selected site data
  const selectedSiteData = sites?.find(site => site.id === selectedSite);
  
  // Handle "all" selection for organization
  const isAllOrganizations = selectedSector === 'all' || !selectedSector;
  const isAllSites = selectedSite === 'all' || !selectedSite;
  
  const siteSummary: SiteSummary = selectedSiteData ? {
    organisation: selectedSiteData.sector_name,
    unitName: selectedSiteData.name,
    deploymentEngineer: "John Smith", // This would come from site assignments
    goLiveDate: "14-Aug-2024", // This would come from site data
    smartQSolution: "POS + Kiosk + TDS" // This would come from site study
  } : isAllSites ? {
    organisation: isAllOrganizations ? "All Organizations" : selectedSector || "All Organizations",
    unitName: isAllSites ? "All Sites" : "No site selected",
    deploymentEngineer: "Multiple Engineers",
    goLiveDate: "Various Dates",
    smartQSolution: "Multiple Solutions"
  } : {
    organisation: "Select a site",
    unitName: "No site selected",
    deploymentEngineer: "N/A",
    goLiveDate: "N/A",
    smartQSolution: "N/A"
  };

  // Mock auto-pulled hardware from site study
  const autoPulledHardware: HardwareItem[] = [
    {
      id: "1",
      type: "POS Terminals",
      category: "POS",
      quantity: 4,
      source: "site-study",
      location: "2 at Deli, 2 at Café",
      notes: "Main POS terminals for payment processing",
      status: "done",
      deliveryStatus: "delivered",
      etaDelivery: "25-Jul",
      etaInstall: "26-Jul"
    },
    {
      id: "2",
      type: "PED Devices",
      category: "POS",
      quantity: 4,
      source: "site-study",
      location: "1 per POS",
      notes: "Card payment devices",
      status: "in-progress",
      deliveryStatus: "dispatched",
      etaDelivery: "26-Jul",
      etaInstall: "27-Jul"
    },
    {
      id: "3",
      type: "Token Display",
      category: "TDS",
      quantity: 1,
      source: "site-study",
      location: "Customer entry point",
      notes: "Digital display for order tokens",
      status: "pending",
      deliveryStatus: "pending",
      etaDelivery: "-",
      etaInstall: "-"
    },
    {
      id: "4",
      type: "Printer (BOH)",
      category: "PRINTER",
      quantity: 2,
      source: "site-study",
      location: "KOT printers in kitchen",
      notes: "Back of house kitchen order printers",
      status: "done",
      deliveryStatus: "delivered",
      etaDelivery: "25-Jul",
      etaInstall: "26-Jul"
    }
  ];

  // Mock additional hardware
  const additionalHardware: HardwareItem[] = [
    {
      id: "5",
      type: "Self-Service Kiosk",
      category: "KIOSK",
      quantity: 2,
      source: "manual",
      location: "Main entrance",
      notes: "Added due to higher lunch footfall",
      status: "pending",
      deliveryStatus: "pending",
      etaDelivery: "-",
      etaInstall: "-"
    },
    {
      id: "6",
      type: "Kitchen Display Screen",
      category: "KMS",
      quantity: 1,
      source: "manual",
      location: "Kitchen area",
      notes: "Requested by chef",
      status: "pending",
      deliveryStatus: "pending",
      etaDelivery: "-",
      etaInstall: "-"
    }
  ];

  // Calculate cost summary based on hardware items
  const calculateCostSummary = (): CostSummary => {
    // Auto-pulled hardware costs
    const autoPulledCosts: CostItem[] = [
      {
        hardware: "POS Terminals",
        quantity: 4,
        unitCost: 150,
        totalCost: 4 * 150,
        source: "site-study"
      },
      {
        hardware: "PED Devices",
        quantity: 4,
        unitCost: 75,
        totalCost: 4 * 75,
        source: "site-study"
      },
      {
        hardware: "Token Display",
        quantity: 1,
        unitCost: 200,
        totalCost: 1 * 200,
        source: "site-study"
      },
      {
        hardware: "Printer (BOH)",
        quantity: 2,
        unitCost: 125,
        totalCost: 2 * 125,
        source: "site-study"
      }
    ];

    // Additional hardware costs - dynamically calculated
    const additionalCosts: CostItem[] = additionalHardware.map(item => {
      let unitCost = 0;
      switch (item.type) {
        case "Self-Service Kiosk":
          unitCost = 250.37;
          break;
        case "Kitchen Display Screen":
          unitCost = 300;
          break;
        default:
          unitCost = 200; // Default cost for unknown hardware
      }
      
      return {
        hardware: item.type,
        quantity: item.quantity,
        unitCost: unitCost,
        totalCost: item.quantity * unitCost,
        source: "manual"
      };
    });

    const hardwareCosts = [...autoPulledCosts, ...additionalCosts];

    const licensing = {
      appFee: 150,
      controlDesk: 625,
      kioskLicense: 135,
      monthlyTotal: 150 + 625 + 135
    };

    const supportCosts = {
      deployment: 550,
      menuSetup: 550,
      melfordSurvey: 400,
      smartqSupport: 600
    };

    const capex = hardwareCosts.reduce((sum, item) => sum + item.totalCost, 0);
    const opex = licensing.monthlyTotal + supportCosts.deployment + supportCosts.menuSetup + supportCosts.melfordSurvey + supportCosts.smartqSupport;
    const totalCost = capex + opex;

    return {
      hardwareCosts,
      licensing,
      supportCosts,
      capex,
      opex,
      totalCost
    };
  };

  const costSummary = calculateCostSummary();

  // Mock hardware scopes
  const hardwareScopes: HardwareScope[] = [
    {
      id: "1",
      siteName: "ASDA Redditch",
      status: "approved",
      submittedOn: "20-Jul",
      approvedBy: "Jessica Cleaver",
      hardwareItems: [...autoPulledHardware, ...additionalHardware],
      supportingFiles: [],
      remarks: "All hardware approved for deployment",
      estimatedDispatchDate: "25-Jul-2024",
      requiredInstallationDate: "26-Jul-2024"
    },
    {
      id: "2",
      siteName: "HSBC Canary",
      status: "pending",
      submittedOn: "23-Jul",
      approvedBy: "",
      hardwareItems: autoPulledHardware,
      supportingFiles: [],
      remarks: "Awaiting Ops Manager approval",
      estimatedDispatchDate: "28-Jul-2024",
      requiredInstallationDate: "29-Jul-2024"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'done':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
      case 'dispatched':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'done':
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'in-progress':
      case 'dispatched':
        return <Package className="h-4 w-4" />;
      case 'rejected':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleViewScope = (scope: HardwareScope) => {
    setSelectedScope(scope);
    setIsViewScopeOpen(true);
  };

  const handleSubmitForApproval = () => {
    // Implementation for submitting for approval
    console.log('Submitting for approval...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      <div className="w-full max-w-none px-2 sm:px-4 lg:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Hardware Scoping & Approval</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Convert site study insights into scoped hardware requirements and manage approval workflows
          </p>
        </div>

        {/* Site and Organization Selection */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="h-5 w-5 text-blue-600" />
              Select Site & Organization
            </CardTitle>
            <CardDescription className="text-gray-600">Choose the site and organization for hardware scoping</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization (Sector)</Label>
                  <Select value={selectedSector} onValueChange={setSelectedSector}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                                      <SelectContent>
                    <SelectItem value="all">All Organizations</SelectItem>
                    {sectors?.map((sector) => (
                      <SelectItem key={sector.id} value={sector.name}>
                        {sector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site">Site</Label>
                  <Select value={selectedSite} onValueChange={setSelectedSite}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select site" />
                    </SelectTrigger>
                                      <SelectContent>
                    <SelectItem value="all">All Sites</SelectItem>
                    {filteredSites.map((site) => (
                      <SelectItem key={site.id} value={site.id}>
                        {site.name} - {site.food_court_unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                  </Select>
                </div>
              </div>
            {(selectedSite || selectedSector) && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Selection Details:</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  {selectedSector && selectedSector !== 'all' && (
                    <p><strong>Organization:</strong> {selectedSector}</p>
                  )}
                  {selectedSite && selectedSite !== 'all' && (
                    <p><strong>Site:</strong> {sites?.find(s => s.id === selectedSite)?.name} - {sites?.find(s => s.id === selectedSite)?.sector_name}</p>
                  )}
                  {selectedSector === 'all' && (
                    <p><strong>Organization:</strong> All Organizations</p>
                  )}
                  {selectedSite === 'all' && (
                    <p><strong>Site:</strong> All Sites</p>
                  )}
                  {!selectedSector && !selectedSite && (
                    <p>No specific selection made</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <TabsTrigger value="scope" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Hardware Scope</TabsTrigger>
            <TabsTrigger value="approval" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Approval Workflow</TabsTrigger>
            <TabsTrigger value="tracking" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Delivery Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="scope" className="space-y-6">
            {/* Site Summary Section */}
            {(selectedSite || selectedSector) ? (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building className="h-5 w-5 text-blue-600" />
                    {isAllSites ? "Overview Summary" : "Site Summary"}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {isAllSites ? "Overview of selected organization/sites" : "Read-only site information from completed site study"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Organisation</Label>
                      <p className="text-sm">{siteSummary.organisation}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Unit Name</Label>
                      <p className="text-sm">{siteSummary.unitName}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Deployment Engineer</Label>
                      <p className="text-sm">{siteSummary.deploymentEngineer}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Go-Live Date</Label>
                      <p className="text-sm">{siteSummary.goLiveDate}</p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-medium text-muted-foreground">SmartQ Solution</Label>
                      <p className="text-sm">{siteSummary.smartQSolution}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Site Selection Required
                  </CardTitle>
                  <CardDescription>Please select a site or organization above to view hardware scoping details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Select a site or organization to begin hardware scoping</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Auto-Pulled Hardware Section */}
            {(selectedSite || selectedSector) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {isAllSites ? "Hardware Overview" : "Auto-Pulled Hardware from Site Study"}
                  </CardTitle>
                  <CardDescription>
                    {isAllSites ? "Hardware requirements across selected sites" : "Hardware automatically extracted from completed site study"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                                    <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold text-gray-700">Hardware Type</TableHead>
                          <TableHead className="font-semibold text-gray-700">Quantity</TableHead>
                          <TableHead className="font-semibold text-gray-700">Source</TableHead>
                          <TableHead className="font-semibold text-gray-700">Location</TableHead>
                          <TableHead className="font-semibold text-gray-700">Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {autoPulledHardware.map((item) => (
                          <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
                            <TableCell className="font-medium text-gray-900">{item.type}</TableCell>
                            <TableCell className="text-gray-700">{item.quantity}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                {item.source === 'site-study' ? 'Site Study' : 'Manual'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-700">{item.location}</TableCell>
                            <TableCell className="text-gray-600">{item.notes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Hardware Section */}
            {(selectedSite || selectedSector) && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                                          <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      {isAllSites ? "Additional Hardware Overview" : "Additional Hardware"}
                    </CardTitle>
                    <CardDescription>
                      {isAllSites ? "Manually added hardware requirements across selected sites" : "Manually added hardware requirements"}
                    </CardDescription>
                    </div>
                    <Dialog open={isAddHardwareOpen} onOpenChange={setIsAddHardwareOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Hardware
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-lg">Add Hardware Item</DialogTitle>
                          <DialogDescription className="text-gray-600">
                            Add additional hardware requirements for this site
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="hardware-category">Hardware Category</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pos">POS</SelectItem>
                                <SelectItem value="kiosk">KIOSK</SelectItem>
                                <SelectItem value="kms">KMS</SelectItem>
                                <SelectItem value="printer">PRINTER</SelectItem>
                                <SelectItem value="tds">TDS</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="hardware-type">Hardware Type</Label>
                            <Input id="hardware-type" placeholder="e.g., Self-Service Kiosk" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input id="quantity" type="number" placeholder="1" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="location">Location / Reason</Label>
                            <Textarea id="location" placeholder="e.g., Main entrance - Added due to higher lunch footfall" />
                          </div>
                        </div>
                        <DialogFooter className="pt-4">
                          <Button variant="outline" onClick={() => setIsAddHardwareOpen(false)} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                            Cancel
                          </Button>
                          <Button onClick={() => setIsAddHardwareOpen(false)} className="bg-blue-600 hover:bg-blue-700 text-white">
                            Add Hardware
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hardware Group</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Location / Reason</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {additionalHardware.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.category}</TableCell>
                          <TableCell>{item.type}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.notes}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Cost Summary & Estimation Section */}
            {(selectedSite || selectedSector) && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    💰 Cost Summary & Estimation
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {isAllSites ? "Cost overview across selected sites" : "Detailed cost breakdown for hardware and services"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Hardware Costs Table */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Hardware Costs</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Hardware</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Unit Cost (£)</TableHead>
                            <TableHead>Total (£)</TableHead>
                            <TableHead>Source</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {costSummary.hardwareCosts.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{item.hardware}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>£{item.unitCost.toFixed(2)}</TableCell>
                              <TableCell>£{item.totalCost.toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {item.source === 'site-study' ? 'Site Study' : 'Manual'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Licensing Costs */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Licensing & Monthly Costs</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 border rounded-lg">
                          <p className="text-sm text-muted-foreground">App Fee</p>
                          <p className="text-lg font-semibold">£{costSummary.licensing.appFee}</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <p className="text-sm text-muted-foreground">Control Desk</p>
                          <p className="text-lg font-semibold">£{costSummary.licensing.controlDesk}</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <p className="text-sm text-muted-foreground">Kiosk License</p>
                          <p className="text-lg font-semibold">£{costSummary.licensing.kioskLicense}</p>
                        </div>
                        <div className="p-3 border rounded-lg bg-primary/10">
                          <p className="text-sm text-muted-foreground">Monthly Total</p>
                          <p className="text-lg font-semibold text-primary">£{costSummary.licensing.monthlyTotal}</p>
                        </div>
                      </div>
                    </div>

                    {/* Support Costs */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Support & Setup Costs</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 border rounded-lg">
                          <p className="text-sm text-muted-foreground">Deployment</p>
                          <p className="text-lg font-semibold">£{costSummary.supportCosts.deployment}</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <p className="text-sm text-muted-foreground">Menu Setup</p>
                          <p className="text-lg font-semibold">£{costSummary.supportCosts.menuSetup}</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <p className="text-sm text-muted-foreground">Melford Survey</p>
                          <p className="text-lg font-semibold">£{costSummary.supportCosts.melfordSurvey}</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <p className="text-sm text-muted-foreground">SmartQ Support</p>
                          <p className="text-lg font-semibold">£{costSummary.supportCosts.smartqSupport}</p>
                        </div>
                      </div>
                    </div>

                                            {/* Cost Summary */}
                        <div className="border-t pt-6">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 border-0 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 shadow-md">
                              <p className="text-sm text-orange-700 font-medium">Hardware Cost Total</p>
                              <p className="text-2xl font-bold text-orange-600">£{costSummary.hardwareCosts.reduce((sum, item) => sum + item.totalCost, 0).toFixed(2)}</p>
                            </div>
                            <div className="p-4 border-0 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 shadow-md">
                              <p className="text-sm text-blue-700 font-medium">CAPEX (Hardware)</p>
                              <p className="text-2xl font-bold text-blue-600">£{costSummary.capex.toFixed(2)}</p>
                            </div>
                            <div className="p-4 border-0 rounded-xl bg-gradient-to-br from-green-50 to-green-100 shadow-md">
                              <p className="text-sm text-green-700 font-medium">OPEX (Services)</p>
                              <p className="text-2xl font-bold text-green-600">£{costSummary.opex.toFixed(2)}</p>
                            </div>
                            <div className="p-4 border-0 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 shadow-md">
                              <p className="text-sm text-purple-700 font-medium">Total Project Cost</p>
                              <p className="text-2xl font-bold text-purple-600">£{costSummary.totalCost.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Supporting Files Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Supporting Files
                </CardTitle>
                <CardDescription>Upload layout markups, screenshots, and approval documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Layout Markup (PDF/Image)</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Drop files here or click to upload</p>
                        <p className="text-xs text-gray-500">PDF, PNG, JPG, DOCX</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Screenshot of Study Summary</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <FileImage className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Drop files here or click to upload</p>
                        <p className="text-xs text-gray-500">PNG, JPG</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Client Approval Email</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Drop files here or click to upload</p>
                      <p className="text-xs text-gray-500">PDF, DOCX</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Final Submission Section */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Final Submission & Approval Workflow
                </CardTitle>
                <CardDescription className="text-gray-600">Submit hardware scope for two-level approval process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Level 1: D&T Approval */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Level 1: D&T Approval
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dt-approver">D&T Approver</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select D&T Approver" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="simon">Simon</SelectItem>
                            <SelectItem value="tony">Tony</SelectItem>
                            <SelectItem value="andrews">Andrews</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dt-approval-date">D&T Approval Date</Label>
                        <Input id="dt-approval-date" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dt-approval-status">D&T Approval Status</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Level 2: Ops Manager Approval */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Level 2: Ops Manager Approval
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ops-approver">Ops Manager</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Ops Manager" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="jessica">Jessica Cleaver</SelectItem>
                            <SelectItem value="mike">Mike Thompson</SelectItem>
                            <SelectItem value="sarah">Sarah Johnson</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ops-approval-date">Ops Manager Approval Date</Label>
                        <Input id="ops-approval-date" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ops-approval-status">Ops Manager Approval Status</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Project Timeline */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Project Timeline
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="estimated-dispatch">Estimated Dispatch Date</Label>
                        <Input id="estimated-dispatch" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="required-installation">Required Installation Date</Label>
                        <Input id="required-installation" type="date" />
                      </div>
                    </div>
                  </div>

                  {/* Remarks */}
                  <div className="space-y-2">
                    <Label htmlFor="remarks">Remarks</Label>
                    <Textarea id="remarks" placeholder="Additional comments or special requirements..." />
                  </div>
                </div>
                <div className="mt-6">
                  <Button onClick={handleSubmitForApproval} variant="gradient" className="w-full">
                    Submit for D&T Approval
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approval" className="space-y-6">
            {/* Approval Workflow */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Approval Workflow
                </CardTitle>
                <CardDescription>Track approval status and manage workflow</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Admin / Engineer</p>
                        <p className="text-sm text-muted-foreground">Create scope, submit</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Completed
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Shield className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium">Ops Manager</p>
                        <p className="text-sm text-muted-foreground">Approve / Reject with reason</p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Clock className="h-4 w-4 mr-1" />
                      Pending
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg opacity-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Package className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">System</p>
                        <p className="text-sm text-muted-foreground">Notify Melford via email / webhook</p>
                      </div>
                    </div>
                    <Badge className="bg-gray-100 text-gray-800">
                      <Clock className="h-4 w-4 mr-1" />
                      Waiting
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg opacity-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Truck className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">Procurement Team (Melford)</p>
                        <p className="text-sm text-muted-foreground">Update provisioning & delivery</p>
                      </div>
                    </div>
                    <Badge className="bg-gray-100 text-gray-800">
                      <Clock className="h-4 w-4 mr-1" />
                      Waiting
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* View All Hardware Scopes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  View All Hardware Scopes
                </CardTitle>
                <CardDescription>Manage and track all hardware scopes</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Site Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted On</TableHead>
                      <TableHead>Approved By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hardwareScopes.map((scope) => (
                      <TableRow key={scope.id}>
                        <TableCell className="font-medium">{scope.siteName}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(scope.status)}`}>
                            {getStatusIcon(scope.status)}
                            <span className="ml-1">{scope.status.replace('-', ' ')}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>{scope.submittedOn}</TableCell>
                        <TableCell>{scope.approvedBy || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewScope(scope)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            {scope.status === 'pending' && (
                              <>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            {/* Melford Configuration & Delivery Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Melford Configuration & Delivery Status
                </CardTitle>
                <CardDescription>Track hardware delivery and installation progress</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hardware Type</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Delivery Status</TableHead>
                      <TableHead>ETA (Delivery)</TableHead>
                      <TableHead>ETA (Install)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...autoPulledHardware, ...additionalHardware].map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.type}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(item.status)}`}>
                            {getStatusIcon(item.status)}
                            <span className="ml-1">{item.status.replace('-', ' ')}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(item.deliveryStatus)}`}>
                            {getStatusIcon(item.deliveryStatus)}
                            <span className="ml-1">{item.deliveryStatus}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>{item.etaDelivery}</TableCell>
                        <TableCell>{item.etaInstall}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Deployment Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Deployment Tracking (Post-Delivery)
                </CardTitle>
                <CardDescription>Track installation and configuration tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Monitor className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Device Installation</p>
                        <p className="text-sm text-muted-foreground">POS Terminals installed</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      <Package className="h-4 w-4 mr-1" />
                      In Progress
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Monitor className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium">TDS Screen Mounting</p>
                        <p className="text-sm text-muted-foreground">Wall mount pending delivery</p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Clock className="h-4 w-4 mr-1" />
                      Pending
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Zap className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Power Verification</p>
                        <p className="text-sm text-muted-foreground">Verified on 26-Jul</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Completed
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Wifi className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium">Wi-Fi Static IP Config</p>
                        <p className="text-sm text-muted-foreground">Waiting for IT</p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Clock className="h-4 w-4 mr-1" />
                      Pending
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* View Scope Dialog */}
        <Dialog open={isViewScopeOpen} onOpenChange={setIsViewScopeOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Hardware Scope - {selectedScope?.siteName}
              </DialogTitle>
              <DialogDescription>
                Detailed view of hardware scope and approval information
              </DialogDescription>
            </DialogHeader>
            {selectedScope && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge className={`mt-1 ${getStatusColor(selectedScope.status)}`}>
                      {getStatusIcon(selectedScope.status)}
                      <span className="ml-1">{selectedScope.status}</span>
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Submitted On</Label>
                    <p className="text-sm mt-1">{selectedScope.submittedOn}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Approved By</Label>
                    <p className="text-sm mt-1">{selectedScope.approvedBy || 'Pending'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Estimated Dispatch</Label>
                    <p className="text-sm mt-1">{selectedScope.estimatedDispatchDate}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Remarks</Label>
                  <p className="text-sm mt-1">{selectedScope.remarks}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Hardware Items</Label>
                  <Table className="mt-2">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Delivery Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedScope.hardwareItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.type}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(item.status)}`}>
                              {getStatusIcon(item.status)}
                              <span className="ml-1">{item.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(item.deliveryStatus)}`}>
                              {getStatusIcon(item.deliveryStatus)}
                              <span className="ml-1">{item.deliveryStatus}</span>
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewScopeOpen(false)}>
                Close
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default HardwareScoping; 