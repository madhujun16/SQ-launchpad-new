import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building,
  Package,
  Database,
  Calculator,
  Cog,
  FileText,
  Shield,
  Home,
  ChevronRight,
  AlertCircle,
  CheckSquare,
  Plus,
  Eye,
  Edit,
  Users,
  Bell,
  Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ContentLoader } from '@/components/ui/loader';
import { getRoleConfig } from '@/lib/roles';
import { useNavigate, Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

// Enhanced interfaces for unified configuration
interface SoftwareModule {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'active' | 'inactive' | 'deprecated';
  version: string;
  monthlyFee: number;
  setupFee: number;
  licenseType: 'per_user' | 'per_device' | 'per_site' | 'unlimited';
  hardwareRequirements: string[];
  dependencies: string[];
  created_at: string;
  updated_at: string;
}

interface HardwareItem {
  id: string;
  name: string;
  description: string;
  category: string;
  model: string;
  manufacturer: string;
  unitCost: number;
  status: 'available' | 'discontinued' | 'maintenance';
  softwareCompatibility: string[];
  outletTypeCompatibility: string[];
  created_at: string;
  updated_at: string;
}

interface OutletType {
  id: string;
  name: string;
  description: string;
  defaultHardware: string[];
  defaultSoftware: string[];
  businessRules: string[];
}

interface CostBreakdown {
  capex: {
    hardware: number;
    software: number;
    setup: number;
    contingency: number;
    total: number;
  };
  opex: {
    monthlyFees: number;
    maintenance: number;
    licenses: number;
    total: number;
  };
  total: number;
}

interface ScopingConfiguration {
  id: string;
  siteId: string;
  outletType: string;
  selectedSoftware: string[];
  selectedHardware: Array<{
    hardwareId: string;
    quantity: number;
    customizations?: string;
  }>;
  costBreakdown: CostBreakdown;
  approvalStatus: 'draft' | 'pending' | 'approved' | 'rejected';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function PlatformConfiguration() {
  const { currentRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('configuration');
  
  // State for unified configuration
  const [softwareModules, setSoftwareModules] = useState<SoftwareModule[]>([]);
  const [hardwareItems, setHardwareItems] = useState<HardwareItem[]>([]);
  const [outletTypes, setOutletTypes] = useState<OutletType[]>([]);
  const [scopingConfigurations, setScopingConfigurations] = useState<ScopingConfiguration[]>([]);
  
  // State for active configuration
  const [selectedOutletType, setSelectedOutletType] = useState<string>('');
  const [selectedSoftware, setSelectedSoftware] = useState<string[]>([]);
  const [selectedHardware, setSelectedHardware] = useState<Array<{
    hardwareId: string;
    quantity: number;
    customizations?: string;
  }>>([]);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown>({
    capex: { hardware: 0, software: 0, setup: 0, contingency: 0, total: 0 },
    opex: { monthlyFees: 0, maintenance: 0, licenses: 0, total: 0 },
    total: 0
  });

  const roleConfig = getRoleConfig(currentRole || 'admin');

  // Only allow admin access
  if (currentRole !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access the Platform Configuration. Please contact an administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  useEffect(() => {
    fetchConfigurationData();
  }, []);

  const fetchConfigurationData = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration - replace with actual API calls
      const mockSoftwareModules: SoftwareModule[] = [
        {
          id: '1',
          name: 'POS System',
          description: 'Point of sale system for cafeteria operations',
          category: 'Payment Processing',
          status: 'active',
          version: '2.1.0',
          monthlyFee: 25,
          setupFee: 150,
          licenseType: 'per_site',
          hardwareRequirements: ['pos_terminal', 'printer', 'cash_drawer'],
          dependencies: [],
          created_at: '2024-01-01',
          updated_at: '2024-01-15'
        },
        {
          id: '2',
          name: 'Inventory Management',
          description: 'Real-time inventory tracking and management',
          category: 'Inventory',
          status: 'active',
          version: '1.5.2',
          monthlyFee: 15,
          setupFee: 75,
          licenseType: 'per_site',
          hardwareRequirements: ['tablet', 'barcode_scanner'],
          dependencies: [],
          created_at: '2024-01-05',
          updated_at: '2024-01-12'
        },
        {
          id: '3',
          name: 'Kitchen Display System',
          description: 'Digital order management for kitchen staff',
          category: 'Kitchen Management',
          status: 'active',
          version: '1.8.0',
          monthlyFee: 20,
          setupFee: 100,
          licenseType: 'per_device',
          hardwareRequirements: ['kitchen_display', 'printer'],
          dependencies: ['pos_system'],
          created_at: '2024-01-10',
          updated_at: '2024-01-18'
        }
      ];

      const mockHardwareItems: HardwareItem[] = [
        {
          id: '1',
          name: 'POS Terminal',
          description: 'Ingenico Telium 2 POS terminal',
          category: 'Payment Processing',
          model: 'Telium 2',
          manufacturer: 'Ingenico',
          unitCost: 2500,
          status: 'available',
          softwareCompatibility: ['pos_system'],
          outletTypeCompatibility: ['cafeteria', 'restaurant', 'retail'],
          created_at: '2024-01-01',
          updated_at: '2024-01-15'
        },
        {
          id: '2',
          name: 'Thermal Printer',
          description: 'Receipt and kitchen order printer',
          category: 'Printing',
          model: 'TM-T88VI',
          manufacturer: 'Epson',
          unitCost: 350,
          status: 'available',
          softwareCompatibility: ['pos_system', 'kitchen_display'],
          outletTypeCompatibility: ['cafeteria', 'restaurant', 'retail'],
          created_at: '2024-01-05',
          updated_at: '2024-01-12'
        },
        {
          id: '3',
          name: 'Tablet',
          description: 'iPad for inventory and order management',
          category: 'Mobile Device',
          model: 'iPad Air',
          manufacturer: 'Apple',
          unitCost: 800,
          status: 'available',
          softwareCompatibility: ['inventory_management', 'pos_system'],
          outletTypeCompatibility: ['cafeteria', 'restaurant', 'retail'],
          created_at: '2024-01-08',
          updated_at: '2024-01-16'
        },
        {
          id: '4',
          name: 'Kitchen Display',
          description: 'Digital display for kitchen orders',
          category: 'Display',
          model: 'KD-55X80K',
          manufacturer: 'Sony',
          unitCost: 1200,
          status: 'available',
          softwareCompatibility: ['kitchen_display'],
          outletTypeCompatibility: ['cafeteria', 'restaurant'],
          created_at: '2024-01-12',
          updated_at: '2024-01-20'
        }
      ];

      const mockOutletTypes: OutletType[] = [
        {
          id: '1',
          name: 'Cafeteria',
          description: 'Staff cafeteria with multiple food stations',
          defaultHardware: ['pos_terminal', 'printer', 'tablet'],
          defaultSoftware: ['pos_system', 'inventory_management'],
          businessRules: ['peak_hours_11_14', 'staff_only', 'pre_order_available']
        },
        {
          id: '2',
          name: 'Restaurant',
          description: 'Full-service restaurant with kitchen',
          defaultHardware: ['pos_terminal', 'printer', 'kitchen_display'],
          defaultSoftware: ['pos_system', 'kitchen_display'],
          businessRules: ['dinner_service', 'reservations', 'kitchen_orders']
        },
        {
          id: '3',
          name: 'Retail Kiosk',
          description: 'Small retail food kiosk',
          defaultHardware: ['pos_terminal', 'printer'],
          defaultSoftware: ['pos_system'],
          businessRules: ['quick_service', 'limited_menu', 'self_service']
        }
      ];

      setSoftwareModules(mockSoftwareModules);
      setHardwareItems(mockHardwareItems);
      setOutletTypes(mockOutletTypes);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching configuration data:', error);
      setLoading(false);
    }
  };

  // Smart scoping logic
  const getRecommendedHardware = (softwareIds: string[], outletType: string) => {
    const recommendations: Array<{
      hardwareId: string;
      quantity: number;
      isRequired: boolean;
      reason: string;
    }> = [];

    // Get hardware requirements from selected software
    softwareIds.forEach(softwareId => {
      const software = softwareModules.find(s => s.id === softwareId);
      if (software) {
        software.hardwareRequirements.forEach(hardwareReq => {
          const hardware = hardwareItems.find(h => h.id === hardwareReq);
          if (hardware) {
            const existing = recommendations.find(r => r.hardwareId === hardware.id);
            if (existing) {
              existing.quantity += 1;
            } else {
              recommendations.push({
                hardwareId: hardware.id,
                quantity: 1,
                isRequired: true,
                reason: `Required by ${software.name}`
              });
            }
          }
        });
      }
    });

    // Add outlet-specific recommendations
    const outletTypeData = outletTypes.find(o => o.id === outletType);
    if (outletTypeData) {
      outletTypeData.defaultHardware.forEach(hardwareId => {
        const existing = recommendations.find(r => r.hardwareId === hardwareId);
        if (!existing) {
          const hardware = hardwareItems.find(h => h.id === hardwareId);
          if (hardware) {
            recommendations.push({
              hardwareId: hardware.id,
              quantity: 1,
              isRequired: false,
              reason: `Recommended for ${outletTypeData.name}`
            });
          }
        }
      });
    }

    return recommendations;
  };

  // Real-time cost calculation
  const calculateCosts = (softwareIds: string[], selectedHardwareItems: Array<{hardwareId: string, quantity: number}>) => {
    let capex = { hardware: 0, software: 0, setup: 0, contingency: 0, total: 0 };
    let opex = { monthlyFees: 0, maintenance: 0, licenses: 0, total: 0 };

    // Calculate hardware costs (CAPEX)
    selectedHardwareItems.forEach(item => {
      const hardware = hardwareItems.find(h => h.id === item.hardwareId);
      if (hardware) {
        capex.hardware += hardware.unitCost * item.quantity;
      }
    });

    // Calculate software costs
    softwareIds.forEach(softwareId => {
      const software = softwareModules.find(s => s.id === softwareId);
      if (software) {
        capex.software += software.setupFee;
        opex.monthlyFees += software.monthlyFee;
      }
    });

    // Calculate setup costs (estimated)
    capex.setup = capex.hardware * 0.1; // 10% of hardware cost

    // Calculate contingency (15% of total CAPEX)
    capex.contingency = (capex.hardware + capex.software + capex.setup) * 0.15;

    // Calculate totals
    capex.total = capex.hardware + capex.software + capex.setup + capex.contingency;
    opex.total = opex.monthlyFees + opex.maintenance + opex.licenses;

    return { capex, opex, total: capex.total + opex.total };
  };

  // Handle outlet type selection
  const handleOutletTypeChange = (outletTypeId: string) => {
    setSelectedOutletType(outletTypeId);
    
    // Auto-select default software for this outlet type
    const outletType = outletTypes.find(o => o.id === outletTypeId);
    if (outletType) {
      const defaultSoftwareIds = softwareModules
        .filter(s => outletType.defaultSoftware.includes(s.id))
        .map(s => s.id);
      setSelectedSoftware(defaultSoftwareIds);
      
      // Get hardware recommendations
      const recommendations = getRecommendedHardware(defaultSoftwareIds, outletTypeId);
      const recommendedHardware = recommendations.map(r => ({
        hardwareId: r.hardwareId,
        quantity: r.quantity,
        customizations: undefined
      }));
      setSelectedHardware(recommendedHardware);
      
      // Calculate costs
      const costs = calculateCosts(defaultSoftwareIds, recommendedHardware);
      setCostBreakdown(costs);
    }
  };

  // Handle software selection
  const handleSoftwareChange = (softwareIds: string[]) => {
    setSelectedSoftware(softwareIds);
    
    // Update hardware recommendations
    if (selectedOutletType) {
      const recommendations = getRecommendedHardware(softwareIds, selectedOutletType);
      const recommendedHardware = recommendations.map(r => ({
        hardwareId: r.hardwareId,
        quantity: r.quantity,
        customizations: undefined
      }));
      setSelectedHardware(recommendedHardware);
      
      // Recalculate costs
      const costs = calculateCosts(softwareIds, recommendedHardware);
      setCostBreakdown(costs);
    }
  };

  // Handle hardware quantity changes
  const handleHardwareQuantityChange = (hardwareId: string, quantity: number) => {
    const updatedHardware = selectedHardware.map(item => 
      item.hardwareId === hardwareId 
        ? { ...item, quantity: Math.max(0, quantity) }
        : item
    ).filter(item => item.quantity > 0);
    
    setSelectedHardware(updatedHardware);
    
    // Recalculate costs
    const costs = calculateCosts(selectedSoftware, updatedHardware);
    setCostBreakdown(costs);
  };

  // Save configuration
  const saveConfiguration = () => {
    const newConfiguration: ScopingConfiguration = {
      id: crypto.randomUUID(),
      siteId: 'demo-site-1',
      outletType: selectedOutletType,
      selectedSoftware,
      selectedHardware,
      costBreakdown,
      approvalStatus: 'draft',
      createdBy: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setScopingConfigurations(prev => [...prev, newConfiguration]);
    
    // Navigate to approval workflow
    navigate('/approvals-procurement/hardware-approvals', { 
      state: { configuration: newConfiguration }
    });
  };

  if (loading) {
    return <ContentLoader />;
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/dashboard" className="flex items-center space-x-1 hover:text-gray-900">
          <Home className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Platform Configuration</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Software & Hardware Configuration</h1>
          <p className="text-gray-600 mt-1">
            Unified configuration system with smart scoping and real-time cost calculations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <roleConfig.icon className="h-3 w-3" />
            <span>{roleConfig.displayName}</span>
          </Badge>
        </div>
      </div>

      {/* Main Configuration Interface */}
      <div className="w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="configuration" className="flex items-center space-x-2">
              <Cog className="h-4 w-4" />
              <span>Smart Configuration</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Configuration Templates</span>
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Business Rules</span>
            </TabsTrigger>
          </TabsList>

          {/* Smart Configuration Tab */}
          <TabsContent value="configuration" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Configuration Panel */}
              <div className="lg:col-span-2 space-y-6">
                {/* Outlet Type Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building className="h-4 w-4" />
                      <span>1. Select Outlet Type</span>
                    </CardTitle>
                    <CardDescription>
                      Choose the outlet type to get smart recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select value={selectedOutletType} onValueChange={handleOutletTypeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select outlet type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {outletTypes.map(outlet => (
                          <SelectItem key={outlet.id} value={outlet.id}>
                            <div className="flex items-center space-x-2">
                              <Building className="h-4 w-4" />
                              <span>{outlet.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Software Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Database className="h-4 w-4" />
                      <span>2. Select Software Modules</span>
                    </CardTitle>
                    <CardDescription>
                      Choose software modules for your outlet
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {softwareModules.map(software => (
                        <div key={software.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Checkbox
                            id={software.id}
                            checked={selectedSoftware.includes(software.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleSoftwareChange([...selectedSoftware, software.id]);
                              } else {
                                handleSoftwareChange(selectedSoftware.filter(id => id !== software.id));
                              }
                            }}
                          />
                          <div className="flex-1">
                            <Label htmlFor={software.id} className="font-medium cursor-pointer">
                              {software.name}
                            </Label>
                            <p className="text-sm text-gray-600">{software.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm">
                              <span className="text-green-600">£{software.monthlyFee}/month</span>
                              <span className="text-blue-600">£{software.setupFee} setup</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Hardware Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Package className="h-4 w-4" />
                      <span>3. Hardware Requirements</span>
                    </CardTitle>
                    <CardDescription>
                      Automatically recommended based on your selections
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedHardware.length > 0 ? (
                      <div className="space-y-3">
                        {selectedHardware.map(item => {
                          const hardware = hardwareItems.find(h => h.id === item.hardwareId);
                          if (!hardware) return null;
                          
                          return (
                            <div key={item.hardwareId} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <h4 className="font-medium">{hardware.name}</h4>
                                <p className="text-sm text-gray-600">{hardware.description}</p>
                                <p className="text-sm text-gray-500">{hardware.manufacturer} {hardware.model}</p>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleHardwareQuantityChange(item.hardwareId, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                  >
                                    -
                                  </Button>
                                  <span className="w-8 text-center">{item.quantity}</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleHardwareQuantityChange(item.hardwareId, item.quantity + 1)}
                                  >
                                    +
                                  </Button>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">£{(hardware.unitCost * item.quantity).toLocaleString()}</div>
                                  <div className="text-sm text-gray-500">£{hardware.unitCost} each</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Select software modules to see hardware recommendations
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Cost Summary Panel */}
              <div className="space-y-6">
                {/* Cost Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calculator className="h-4 w-4" />
                      <span>Cost Summary</span>
                    </CardTitle>
                    <CardDescription>
                      Real-time cost calculations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* CAPEX */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Capital Expenditure (CAPEX)</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Hardware</span>
                          <span>£{costBreakdown.capex.hardware.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Software Setup</span>
                          <span>£{costBreakdown.capex.software.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Installation</span>
                          <span>£{costBreakdown.capex.setup.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Contingency (15%)</span>
                          <span>£{costBreakdown.capex.contingency.toLocaleString()}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-medium">
                          <span>Total CAPEX</span>
                          <span>£{costBreakdown.capex.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* OPEX */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Operating Expenditure (OPEX)</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Monthly Software Fees</span>
                          <span>£{costBreakdown.opex.monthlyFees.toLocaleString()}/month</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Maintenance</span>
                          <span>£{costBreakdown.opex.maintenance.toLocaleString()}/month</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Licenses</span>
                          <span>£{costBreakdown.opex.licenses.toLocaleString()}/month</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-medium">
                          <span>Total Monthly OPEX</span>
                          <span>£{costBreakdown.opex.total.toLocaleString()}/month</span>
                        </div>
                      </div>
                    </div>

                    {/* Total */}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Investment</span>
                      <span>£{costBreakdown.total.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                  <CardContent className="pt-6">
                    <Button 
                      onClick={saveConfiguration}
                      disabled={!selectedOutletType || selectedSoftware.length === 0}
                      className="w-full"
                      size="lg"
                    >
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Save & Submit for Approval
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Configuration Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuration Templates</CardTitle>
                <CardDescription>
                  Pre-configured setups for common outlet types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {outletTypes.map(outlet => (
                    <Card key={outlet.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Building className="h-5 w-5 text-blue-600" />
                          <h3 className="font-medium">{outlet.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{outlet.description}</p>
                        <div className="space-y-1 text-xs text-gray-500">
                          <div>Software: {outlet.defaultSoftware.length} modules</div>
                          <div>Hardware: {outlet.defaultHardware.length} items</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Rules Tab */}
          <TabsContent value="rules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Rules & Dependencies</CardTitle>
                <CardDescription>
                  Rules that govern software and hardware compatibility
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {softwareModules.map(software => (
                    <div key={software.id} className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">{software.name}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Hardware Requirements:</span>
                          <ul className="list-disc list-inside mt-1">
                            {software.hardwareRequirements.map(req => (
                              <li key={req} className="text-gray-600">{req}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="font-medium">Dependencies:</span>
                          <ul className="list-disc list-inside mt-1">
                            {software.dependencies.length > 0 ? (
                              software.dependencies.map(dep => (
                                <li key={dep} className="text-gray-600">{dep}</li>
                              ))
                            ) : (
                              <li className="text-gray-500">None</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 