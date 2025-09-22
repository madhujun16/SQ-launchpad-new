import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Monitor, Package, Loader2, Trash2, Plus, Minus } from 'lucide-react';
import { PlatformConfigService, SoftwareModule, HardwareItem } from '@/services/platformConfigService';
import { Site } from '@/types/siteTypes';

interface ScopingStepProps {
  site: Site | null;
  onUpdate: (updates: Partial<Site>) => void;
  isEditing: boolean;
}

interface SelectedSoftware {
  id: string;
  name: string;
  category: string;
  quantity: number;
  monthly_fee: number;
  setup_fee: number;
}

interface SelectedHardware {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit_cost: number;
  installation_cost: number;
  maintenance_cost: number;
}

export default function ScopingStep({ site, onUpdate, isEditing }: ScopingStepProps) {
  const [availableSoftwareModules, setAvailableSoftwareModules] = useState<SoftwareModule[]>([]);
  const [availableHardwareItems, setAvailableHardwareItems] = useState<HardwareItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSoftware, setSelectedSoftware] = useState<SelectedSoftware[]>([]);
  const [selectedHardware, setSelectedHardware] = useState<SelectedHardware[]>([]);

  // Initialize from site data
  useEffect(() => {
    if (site?.scoping) {
      setSelectedSoftware(site.scoping.selectedSoftware || []);
      setSelectedHardware(site.scoping.selectedHardware || []);
    }
  }, [site]);

  // Fetch all software modules and hardware items
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [softwareModules, hardwareItems] = await Promise.all([
          PlatformConfigService.getAllActiveSoftwareModules(),
          PlatformConfigService.getAllActiveHardwareItems()
        ]);
        
        setAvailableSoftwareModules(softwareModules);
        setAvailableHardwareItems(hardwareItems);
      } catch (error) {
        console.error('Error fetching scoping data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Group software modules by category
  const groupedSoftwareModules = useMemo(() => {
    const grouped = availableSoftwareModules.reduce((acc, software) => {
      if (!acc[software.category]) {
        acc[software.category] = [];
      }
      acc[software.category].push(software);
      return acc;
    }, {} as Record<string, SoftwareModule[]>);
    
    return grouped;
  }, [availableSoftwareModules]);

  // Group hardware items by category
  const groupedHardwareItems = useMemo(() => {
    const grouped = availableHardwareItems.reduce((acc, hardware) => {
      if (!acc[hardware.category]) {
        acc[hardware.category] = [];
      }
      acc[hardware.category].push(hardware);
      return acc;
    }, {} as Record<string, HardwareItem[]>);
    
    return grouped;
  }, [availableHardwareItems]);

  // Handle software selection
  const handleSoftwareToggle = (software: SoftwareModule) => {
    const isSelected = selectedSoftware.some(s => s.id === software.id);
    
    if (isSelected) {
      // Remove software
      const updated = selectedSoftware.filter(s => s.id !== software.id);
      setSelectedSoftware(updated);
      
      // Remove related hardware recommendations
      const updatedHardware = selectedHardware.filter(h => 
        !availableHardwareItems.some(ah => 
          ah.id === h.id && ah.category === software.category
        )
      );
      setSelectedHardware(updatedHardware);
    } else {
      // Add software
      const newSoftware: SelectedSoftware = {
        id: software.id,
        name: software.name,
        category: software.category,
        quantity: 1,
        monthly_fee: software.monthly_fee,
        setup_fee: software.setup_fee
      };
      setSelectedSoftware([...selectedSoftware, newSoftware]);
      
      // Auto-add hardware recommendations for this category
      const categoryHardware = availableHardwareItems.filter(h => h.category === software.category);
      const newHardware = categoryHardware.map(hardware => ({
        id: hardware.id,
        name: hardware.name,
        category: hardware.category,
        quantity: 1,
        unit_cost: hardware.unit_cost,
        installation_cost: hardware.installation_cost,
        maintenance_cost: hardware.maintenance_cost
      }));
      
      // Only add hardware that's not already selected
      const existingHardwareIds = selectedHardware.map(h => h.id);
      const hardwareToAdd = newHardware.filter(h => !existingHardwareIds.includes(h.id));
      setSelectedHardware([...selectedHardware, ...hardwareToAdd]);
    }
  };

  // Handle software quantity change
  const handleSoftwareQuantityChange = (softwareId: string, quantity: number) => {
    setSelectedSoftware(prev => 
      prev.map(s => s.id === softwareId ? { ...s, quantity: Math.max(1, quantity) } : s)
    );
  };

  // Handle hardware quantity change
  const handleHardwareQuantityChange = (hardwareId: string, quantity: number) => {
    setSelectedHardware(prev => 
      prev.map(h => h.id === hardwareId ? { ...h, quantity: Math.max(0, quantity) } : h)
    );
  };

  // Remove hardware item
  const removeHardwareItem = (hardwareId: string) => {
    setSelectedHardware(prev => prev.filter(h => h.id !== hardwareId));
  };

  // Calculate costs
  const costSummary = useMemo(() => {
    const softwareSetupCosts = selectedSoftware.reduce((sum, s) => sum + (s.setup_fee * s.quantity), 0);
    const softwareMonthlyCosts = selectedSoftware.reduce((sum, s) => sum + (s.monthly_fee * s.quantity), 0);
    
    const hardwareCosts = selectedHardware.reduce((sum, h) => sum + (h.unit_cost * h.quantity), 0);
    const installationCosts = selectedHardware.reduce((sum, h) => sum + (h.installation_cost * h.quantity), 0);
    const maintenanceCosts = selectedHardware.reduce((sum, h) => sum + (h.maintenance_cost * h.quantity), 0);
    
    const totalHardware = hardwareCosts + installationCosts;
    const contingency = totalHardware * 0.15;
    const totalCAPEX = totalHardware + softwareSetupCosts + contingency;
    const totalOPEX = softwareMonthlyCosts + maintenanceCosts;
    
    return {
      hardware: hardwareCosts,
      installation: installationCosts,
      softwareSetup: softwareSetupCosts,
      contingency,
      totalCAPEX,
      softwareMonthly: softwareMonthlyCosts,
      maintenance: maintenanceCosts,
      totalOPEX,
      totalInvestment: totalCAPEX + (totalOPEX * 12) // Annual projection
    };
  }, [selectedSoftware, selectedHardware]);

  // Save changes
  const handleSave = () => {
    onUpdate({
      scoping: {
        selectedSoftware,
        selectedHardware,
        costSummary,
        lastUpdated: new Date().toISOString()
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-3 text-gray-600">Loading software and hardware options...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Software Selection */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Monitor className="mr-2 h-5 w-5 text-green-600" />
            Software Selection
          </CardTitle>
          <CardDescription className="text-gray-600">
            Select software modules from all available categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(groupedSoftwareModules).map(([category, softwareModules]) => (
              <div key={category} className="space-y-3">
                {/* Category Header */}
                <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700">{category}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {softwareModules.length} module{softwareModules.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                
                {/* Software Modules in this Category */}
                {softwareModules.map((software) => {
                  const isSelected = selectedSoftware.some(s => s.id === software.id);
                  const selectedSoftwareItem = selectedSoftware.find(s => s.id === software.id);
                  
                  return (
                    <div key={software.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id={software.id} 
                          checked={isSelected}
                          onCheckedChange={() => handleSoftwareToggle(software)}
                          disabled={!isEditing}
                        />
                        <div>
                          <Label htmlFor={software.id} className="text-sm font-medium">
                            {software.name}
                          </Label>
                          <p className="text-xs text-gray-500">{software.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {/* Software Quantity */}
                        {isSelected && (
                          <div className="flex items-center space-x-2">
                            <Label htmlFor={`qty-${software.id}`} className="text-xs text-gray-600">
                              Qty:
                            </Label>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSoftwareQuantityChange(software.id, (selectedSoftwareItem?.quantity || 1) - 1)}
                                disabled={!isEditing || (selectedSoftwareItem?.quantity || 1) <= 1}
                                className="h-6 w-6 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input
                                id={`qty-${software.id}`}
                                type="number"
                                min="1"
                                value={selectedSoftwareItem?.quantity || 1}
                                onChange={(e) => handleSoftwareQuantityChange(software.id, parseInt(e.target.value) || 1)}
                                className="w-16 h-8 text-xs text-center"
                                disabled={!isEditing}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSoftwareQuantityChange(software.id, (selectedSoftwareItem?.quantity || 1) + 1)}
                                disabled={!isEditing}
                                className="h-6 w-6 p-0"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                        <div className="text-right">
                          <p className="text-sm font-medium">£{software.monthly_fee}/month</p>
                          <p className="text-xs text-gray-500">£{software.setup_fee} setup</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
            Automatically recommended based on your software selections. You can modify quantities or remove items.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(groupedHardwareItems).map(([category, hardwareItems]) => {
              const categorySelectedHardware = selectedHardware.filter(h => h.category === category);
              
              if (categorySelectedHardware.length === 0) return null;
              
              return (
                <div key={category} className="space-y-3">
                  {/* Category Header */}
                  <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700">{category}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {categorySelectedHardware.length} item{categorySelectedHardware.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  {/* Hardware Items in this Category */}
                  {categorySelectedHardware.map((hardware) => (
                    <div key={hardware.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium">{hardware.name}</p>
                          <p className="text-sm text-gray-600">{availableHardwareItems.find(h => h.id === hardware.id)?.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {/* Hardware Quantity */}
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`qty-${hardware.id}`} className="text-xs text-gray-600">
                            Qty:
                          </Label>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleHardwareQuantityChange(hardware.id, hardware.quantity - 1)}
                              disabled={!isEditing || hardware.quantity <= 0}
                              className="h-6 w-6 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              id={`qty-${hardware.id}`}
                              type="number"
                              min="0"
                              value={hardware.quantity}
                              onChange={(e) => handleHardwareQuantityChange(hardware.id, parseInt(e.target.value) || 0)}
                              className="w-16 h-8 text-xs text-center"
                              disabled={!isEditing}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleHardwareQuantityChange(hardware.id, hardware.quantity + 1)}
                              disabled={!isEditing}
                              className="h-6 w-6 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">£{hardware.unit_cost} each</p>
                          <p className="text-xs text-gray-500">£{hardware.installation_cost} install</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeHardwareItem(hardware.id)}
                          disabled={!isEditing}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
            
            {selectedHardware.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No hardware items selected</p>
                <p className="text-xs text-gray-400 mt-1">Select software modules to see hardware recommendations</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cost Summary */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5 text-blue-600" />
            Cost Summary
          </CardTitle>
          <CardDescription className="text-gray-600">
            Real-time cost calculations based on your selections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* CAPEX */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Capital Expenditure (CAPEX)</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Hardware</span>
                  <span>£{costSummary.hardware.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Installation</span>
                  <span>£{costSummary.installation.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Software Setup</span>
                  <span>£{costSummary.softwareSetup.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Contingency (15%)</span>
                  <span>£{costSummary.contingency.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total CAPEX</span>
                  <span>£{costSummary.totalCAPEX.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* OPEX */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Operating Expenditure (OPEX)</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Monthly Software Fees</span>
                  <span>£{costSummary.softwareMonthly.toFixed(2)}/month</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Maintenance</span>
                  <span>£{costSummary.maintenance.toFixed(2)}/month</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total Monthly OPEX</span>
                  <span>£{costSummary.totalOPEX.toFixed(2)}/month</span>
                </div>
              </div>
            </div>

            {/* Total Investment */}
            <div className="pt-4 border-t">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Investment (Annual)</span>
                <span>£{costSummary.totalInvestment.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={handleSave} disabled={!isEditing}>
          Save Changes
        </Button>
        <Button onClick={handleSave} disabled={!isEditing}>
          Mark Complete
        </Button>
      </div>
    </div>
  );
}