import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
    hardwareRequirements: ['pos-terminal', 'barcode-scanner']
  },
  {
    id: 'kiosk-software',
    name: 'Kiosk Software',
    description: 'Self-service kiosk interface',
    monthlyFee: 15,
    setupFee: 100,
    hardwareRequirements: ['kiosk-terminal', 'touch-screen']
  },
  {
    id: 'kitchen-display',
    name: 'Kitchen Display',
    description: 'Kitchen order management system',
    monthlyFee: 20,
    setupFee: 120,
    hardwareRequirements: ['kitchen-display', 'printer']
  },
  {
    id: 'inventory-management',
    name: 'Inventory Management',
    description: 'Stock tracking and management',
    monthlyFee: 30,
    setupFee: 200,
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
        totalCost += software.setupFee;
      }
    });
    return totalCost;
  };

  const calculateTotalCAPEX = () => {
    return calculateHardwareCosts() + calculateSoftwareSetupCosts();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Scoping</h2>
          <p className="text-gray-600 mt-1">Select software and hardware requirements for the site</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-1" />
            Edit Scoping
          </Button>
          <Button size="sm">
            <CheckCircle className="h-4 w-4 mr-1" />
            Mark as Completed
          </Button>
        </div>
      </div>
      
      <div className="space-y-6">
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
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Available Software Modules</h4>
                <div className="space-y-4">
                  {softwareModules.map((software) => (
                    <div key={software.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id={software.id} 
                          checked={site?.scoping?.selectedSoftware?.includes(software.id)}
                          disabled
                        />
                        <div>
                          <Label htmlFor={software.id} className="text-sm font-medium">
                            {software.name}
                          </Label>
                          <p className="text-xs text-gray-500">{software.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">£{software.monthlyFee}/month</p>
                        <p className="text-xs text-gray-500">£{software.setupFee} setup</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Recommended Hardware</h4>
                {site?.scoping?.selectedHardware && site.scoping.selectedHardware.length > 0 ? (
                  <div className="space-y-3">
                    {site.scoping.selectedHardware.map((item) => {
                      const hardware = hardwareItems.find(h => h.id === item.id);
                      return (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{hardware?.name}</p>
                            <p className="text-sm text-gray-600">{hardware?.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">Qty: {item.quantity}</p>
                            <p className="text-sm text-gray-600">£{hardware?.unitCost?.toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Select software modules to see hardware recommendations</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Summary */}
        <Card className="shadow-sm border border-gray-200">
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
                    <span>£{site?.scoping?.costSummary?.monthlySoftwareFees?.toLocaleString() || '0'}/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maintenance</span>
                    <span>£{site?.scoping?.costSummary?.maintenanceCost?.toLocaleString() || '0'}/month</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total Monthly OPEX</span>
                    <span>£{site?.scoping?.costSummary?.totalMonthlyOpex?.toLocaleString() || '0'}/month</span>
                  </div>
                </div>
              </div>

              {/* Total Investment */}
              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Total Investment</h4>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Investment</span>
                  <span>£{site?.scoping?.costSummary?.totalInvestment?.toLocaleString() || '0'}</span>
                </div>
              </div>

              <Button className="w-full mt-4">
                <FileCheck className="h-4 w-4 mr-1" />
                Save & Submit for Approval
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScopingStep;
