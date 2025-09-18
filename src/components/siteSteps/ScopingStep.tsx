import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Edit, 
  CheckCircle, 
  Monitor, 
  Package, 
  BarChart3, 
  FileCheck
} from 'lucide-react';
import { Site, SoftwareModule, HardwareItem } from '@/types/siteTypes';

interface ScopingStepProps {
  site: Site;
  onSiteUpdate: (updatedSite: Site) => void;
}

// Mock data for software modules and hardware items
const softwareModules: SoftwareModule[] = [
  {
    id: 'pos-system',
    name: 'POS System',
    description: 'Point of Sale system for transactions',
    monthlyFee: 25,
    setupFee: 150,
    category: 'POS',
    hardwareRequirements: ['pos-terminal', 'barcode-scanner', 'cash-drawer']
  },
  {
    id: 'kiosk-software',
    name: 'Kiosk Software',
    description: 'Self-service kiosk interface',
    monthlyFee: 15,
    setupFee: 100,
    category: 'Kiosk',
    hardwareRequirements: ['kiosk-terminal', 'touch-screen']
  },
  {
    id: 'kitchen-display',
    name: 'Kitchen Display',
    description: 'Kitchen order management system',
    monthlyFee: 20,
    setupFee: 120,
    category: 'Kitchen Display (KDS)',
    hardwareRequirements: ['kitchen-display', 'printer']
  },
  {
    id: 'inventory-management',
    name: 'Inventory Management',
    description: 'Stock tracking and management',
    monthlyFee: 30,
    setupFee: 200,
    category: 'Inventory',
    hardwareRequirements: ['tablet', 'barcode-scanner']
  }
];

const hardwareItems: HardwareItem[] = [
  {
    id: 'pos-terminal',
    name: 'POS Terminal',
    description: 'Ingenico Telium 2 POS terminal',
    manufacturer: 'Ingenico',
    unitCost: 450,
    category: 'POS'
  },
  {
    id: 'barcode-scanner',
    name: 'Barcode Scanner',
    description: 'Wireless barcode scanner',
    manufacturer: 'Honeywell',
    unitCost: 120,
    category: 'Accessories'
  },
  {
    id: 'cash-drawer',
    name: 'Cash Drawer',
    description: 'Electronic cash drawer for POS',
    manufacturer: 'APG',
    unitCost: 180,
    category: 'POS'
  },
  {
    id: 'kiosk-terminal',
    name: 'Kiosk Terminal',
    description: 'Self-service kiosk with touch screen',
    manufacturer: 'Elo',
    unitCost: 800,
    category: 'Kiosk'
  },
  {
    id: 'touch-screen',
    name: 'Touch Screen Display',
    description: '15-inch touch screen display',
    manufacturer: 'Elo',
    unitCost: 300,
    category: 'Display'
  },
  {
    id: 'kitchen-display',
    name: 'Kitchen Display',
    description: 'Kitchen order display system',
    manufacturer: 'Kitchen Display Systems',
    unitCost: 250,
    category: 'Kitchen'
  },
  {
    id: 'printer',
    name: 'Thermal Printer',
    description: 'Thermal receipt printer',
    manufacturer: 'Star Micronics',
    unitCost: 80,
    category: 'Printer'
  },
  {
    id: 'tablet',
    name: 'Tablet',
    description: 'Android tablet for inventory management',
    manufacturer: 'Samsung',
    unitCost: 200,
    category: 'Tablet'
  }
];

const ScopingStep: React.FC<ScopingStepProps> = ({ site, onSiteUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [softwareQuantities, setSoftwareQuantities] = useState<Record<string, number>>({});

  // Get recommended hardware based on selected software
  const recommendedHardware = useMemo(() => {
    if (!site?.scoping?.selectedSoftware) return [];
    
    const hardwareIds = new Set<string>();
    site.scoping.selectedSoftware.forEach(softwareId => {
      const software = softwareModules.find(sm => sm.id === softwareId);
      if (software) {
        software.hardwareRequirements.forEach(hwId => hardwareIds.add(hwId));
      }
    });
    
    return Array.from(hardwareIds).map(hwId => {
      const hardware = hardwareItems.find(hw => hw.id === hwId);
      const quantity = site?.scoping?.selectedHardware?.find(sh => sh.id === hwId)?.quantity || 1;
      return hardware ? { ...hardware, quantity } : null;
    }).filter(Boolean);
  }, [site?.scoping?.selectedSoftware, site?.scoping?.selectedHardware]);

  // Calculate costs for Scoping step
  const calculateHardwareCosts = () => {
    let totalCost = 0;
    site?.scoping?.selectedHardware?.forEach(item => {
      const hardware = hardwareItems.find(h => h.id === item.id);
      if (hardware) {
        totalCost += hardware.unitCost * item.quantity;
      }
    });
    return totalCost;
  };

  const calculateSoftwareSetupCosts = () => {
    let totalCost = 0;
    site?.scoping?.selectedSoftware?.forEach(softwareId => {
      const software = softwareModules.find(s => s.id === softwareId);
      if (software) {
        const quantity = getSoftwareQuantity(softwareId);
        totalCost += software.setupFee * quantity;
      }
    });
    return totalCost;
  };

  const calculateSoftwareMonthlyCosts = () => {
    let totalCost = 0;
    site?.scoping?.selectedSoftware?.forEach(softwareId => {
      const software = softwareModules.find(s => s.id === softwareId);
      if (software) {
        const quantity = getSoftwareQuantity(softwareId);
        totalCost += software.monthlyFee * quantity;
      }
    });
    return totalCost;
  };

  const calculateTotalCAPEX = () => {
    return calculateHardwareCosts() + calculateSoftwareSetupCosts();
  };

  const handleSoftwareToggle = (softwareId: string) => {
    if (!isEditing) return;
    
    const currentSelected = site?.scoping?.selectedSoftware || [];
    const newSelected = currentSelected.includes(softwareId)
      ? currentSelected.filter(id => id !== softwareId)
      : [...currentSelected, softwareId];
    
    onSiteUpdate({
      ...site,
      scoping: {
        ...site?.scoping,
        selectedSoftware: newSelected,
        costSummary: {
          ...site?.scoping?.costSummary,
          hardwareCost: calculateHardwareCosts(),
          softwareSetupCost: calculateSoftwareSetupCosts(),
          monthlySoftwareFees: calculateSoftwareMonthlyCosts(),
          totalCapex: calculateTotalCAPEX(),
          totalInvestment: calculateTotalCAPEX() + (site?.scoping?.costSummary?.totalMonthlyOpex || 0)
        }
      }
    });
  };

  const handleQuantityChange = (softwareId: string, quantity: number) => {
    setSoftwareQuantities(prev => ({
      ...prev,
      [softwareId]: Math.max(1, quantity)
    }));
    
    // Update site with new cost calculations
    if (site?.scoping?.selectedSoftware?.includes(softwareId)) {
      onSiteUpdate({
        ...site,
        scoping: {
          ...site?.scoping,
          costSummary: {
            ...site?.scoping?.costSummary,
            hardwareCost: calculateHardwareCosts(),
            softwareSetupCost: calculateSoftwareSetupCosts(),
            monthlySoftwareFees: calculateSoftwareMonthlyCosts(),
            totalCapex: calculateTotalCAPEX(),
            totalInvestment: calculateTotalCAPEX() + (site?.scoping?.costSummary?.totalMonthlyOpex || 0)
          }
        }
      });
    }
  };

  const getSoftwareQuantity = (softwareId: string) => {
    return softwareQuantities[softwareId] || 1;
  };

  const handleHardwareQuantityChange = (hardwareId: string, quantity: number) => {
    if (!isEditing) return;
    
    const currentHardware = site?.scoping?.selectedHardware || [];
    const existingIndex = currentHardware.findIndex(hw => hw.id === hardwareId);
    
    let newHardware;
    if (existingIndex >= 0) {
      newHardware = [...currentHardware];
      newHardware[existingIndex] = { ...newHardware[existingIndex], quantity };
    } else {
      newHardware = [...currentHardware, { id: hardwareId, quantity }];
    }
    
    onSiteUpdate({
      ...site,
      scoping: {
        ...site?.scoping,
        selectedHardware: newHardware,
        costSummary: {
          ...site?.scoping?.costSummary,
          hardwareCost: calculateHardwareCosts(),
          totalCapex: calculateTotalCAPEX(),
          totalInvestment: calculateTotalCAPEX() + (site?.scoping?.costSummary?.totalMonthlyOpex || 0)
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Scoping</h2>
          <p className="text-gray-600 mt-1">Select software and hardware requirements for the site</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="h-4 w-4 mr-1" />
            {isEditing ? 'Done Editing' : 'Edit Scoping'}
          </Button>
          <Button size="sm">
            <CheckCircle className="h-4 w-4 mr-1" />
            Mark Complete
          </Button>
        </div>
      </div>
      
      {/* Main Content - Side by Side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Software Selection */}
        <div className="lg:col-span-2 space-y-6">

          {/* Software Selection */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Monitor className="mr-2 h-5 w-5 text-blue-600" />
                Software Selection
              </CardTitle>
              <CardDescription className="text-gray-600">
                Choose software modules to automatically get hardware recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {softwareModules.map((software) => (
                  <div key={software.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        id={software.id} 
                        checked={site?.scoping?.selectedSoftware?.includes(software.id) || false}
                        onCheckedChange={() => handleSoftwareToggle(software.id)}
                        disabled={!isEditing}
                      />
                      <div>
                        <Label htmlFor={software.id} className="text-sm font-medium">
                          {software.name}
                        </Label>
                        <p className="text-xs text-gray-500">{software.description}</p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {software.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {/* Software License Qty */}
                      {site?.scoping?.selectedSoftware?.includes(software.id) && (
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`qty-${software.id}`} className="text-xs text-gray-600">
                            Qty:
                          </Label>
                          <Input
                            id={`qty-${software.id}`}
                            type="number"
                            min="1"
                            value={getSoftwareQuantity(software.id)}
                            onChange={(e) => handleQuantityChange(software.id, parseInt(e.target.value) || 1)}
                            className="w-16 h-8 text-xs"
                            disabled={!isEditing}
                          />
                        </div>
                      )}
                      <div className="text-right">
                        <p className="text-sm font-medium">£{software.monthlyFee}/month</p>
                        <p className="text-xs text-gray-500">£{software.setupFee} setup</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hardware Requirements */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5 text-orange-600" />
                Hardware Requirements
              </CardTitle>
              <CardDescription className="text-gray-600">
                Automatically recommended based on your software selections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendedHardware.length > 0 ? (
                  recommendedHardware.map((hardware) => (
                    <div key={hardware.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium">{hardware.name}</p>
                          <p className="text-sm text-gray-600">{hardware.description}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {hardware.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="font-medium">£{hardware.unitCost.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{hardware.manufacturer}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleHardwareQuantityChange(hardware.id, Math.max(0, hardware.quantity - 1))}
                            disabled={!isEditing || hardware.quantity <= 1}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{hardware.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleHardwareQuantityChange(hardware.id, hardware.quantity + 1)}
                            disabled={!isEditing}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Select software modules to see hardware recommendations</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Cost Summary */}
        <div className="lg:col-span-1">
          <Card className="shadow-sm border border-gray-200 sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-green-600" />
                Cost Summary
              </CardTitle>
              <CardDescription className="text-gray-600">
                Real-time cost calculations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Capital Expenditure (CAPEX) */}
                <div>
                  <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Capital Expenditure (CAPEX)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Hardware</span>
                      <span>£{calculateHardwareCosts().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Software Setup</span>
                      <span>£{calculateSoftwareSetupCosts().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Installation</span>
                      <span>£{site?.scoping?.costSummary?.installationCost?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contingency (15%)</span>
                      <span>£{site?.scoping?.costSummary?.contingencyCost?.toLocaleString() || '0'}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total CAPEX</span>
                      <span>£{site?.scoping?.costSummary?.totalCapex?.toLocaleString() || calculateTotalCAPEX().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Operating Expenditure (OPEX) */}
                <div>
                  <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Operating Expenditure (OPEX)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Monthly Software Fees</span>
                      <span>£{site?.scoping?.costSummary?.monthlySoftwareFees?.toLocaleString() || calculateSoftwareMonthlyCosts().toLocaleString()}/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Maintenance</span>
                      <span>£{site?.scoping?.costSummary?.maintenanceCost?.toLocaleString() || '0'}/month</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total Monthly OPEX</span>
                      <span>£{site?.scoping?.costSummary?.totalMonthlyOpex?.toLocaleString() || (calculateSoftwareMonthlyCosts() + (site?.scoping?.costSummary?.maintenanceCost || 0)).toLocaleString()}/month</span>
                    </div>
                  </div>
                </div>

                {/* Total Investment */}
                <div>
                  <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Total Investment</h4>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Investment</span>
                    <span>£{site?.scoping?.costSummary?.totalInvestment?.toLocaleString() || (calculateTotalCAPEX() + (site?.scoping?.costSummary?.totalMonthlyOpex || 0)).toLocaleString()}</span>
                  </div>
                </div>

                <Button className="w-full mt-4" disabled={!isEditing}>
                  <FileCheck className="h-4 w-4 mr-1" />
                  Save & Submit for Approval
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ScopingStep;
