import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Monitor, Package, Loader2, Trash2, Plus, Minus, AlertTriangle, X, CheckCircle, Clock } from 'lucide-react';
import { PlatformConfigService, SoftwareModule, HardwareItem } from '@/services/platformConfigService';
import { Site } from '@/types/siteTypes';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ScopingStepProps {
  site: Site | null;
  onUpdate: (updates: Partial<Site>) => void;
  isEditing: boolean;
}

interface SelectedHardware {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit_cost: number;
  installation_cost?: number;
  maintenance_cost?: number;
}

export default function ScopingStep({ site, onUpdate, isEditing }: ScopingStepProps) {
  const [availableSoftwareModules, setAvailableSoftwareModules] = useState<SoftwareModule[]>([]);
  const [availableHardwareItems, setAvailableHardwareItems] = useState<HardwareItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSoftwareIds, setSelectedSoftwareIds] = useState<string[]>([]);
  const [selectedHardware, setSelectedHardware] = useState<SelectedHardware[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Initialize from site data
  useEffect(() => {
    if (site?.scoping) {
      setSelectedSoftwareIds(site.scoping.selectedSoftware || []);
      setSelectedHardware(site.scoping.selectedHardware || []);
    }
  }, [site]);

  // Fetch all software modules and hardware items
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching scoping data...');
        
        const [softwareModules, hardwareItems] = await Promise.all([
          PlatformConfigService.getAllActiveSoftwareModules(),
          PlatformConfigService.getAllActiveHardwareItems()
        ]);
        
        console.log('📦 Software modules fetched:', softwareModules);
        console.log('🔧 Hardware items fetched:', hardwareItems);
        
        setAvailableSoftwareModules(softwareModules);
        setAvailableHardwareItems(hardwareItems);
      } catch (error) {
        console.error('❌ Error fetching scoping data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Group software modules by category
  const groupedSoftwareModules = useMemo(() => {
    console.log('🔄 Grouping software modules:', availableSoftwareModules);
    const grouped = availableSoftwareModules.reduce((acc, software) => {
      const categoryName = software.category?.name || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(software);
      return acc;
    }, {} as Record<string, SoftwareModule[]>);
    
    console.log('📊 Grouped software modules:', grouped);
    return grouped;
  }, [availableSoftwareModules]);

  // Get filtered hardware items based on selected software categories
  const filteredHardwareItems = useMemo(() => {
    if (selectedSoftwareIds.length === 0) return [];
    
    // Get categories of selected software
    const selectedSoftwareCategories = selectedSoftwareIds.map(id => {
      const software = availableSoftwareModules.find(s => s.id === id);
      return software?.category?.name;
    }).filter(Boolean);
    
    // Filter hardware items that match these categories
    return availableHardwareItems.filter(hardware => 
      selectedSoftwareCategories.includes(hardware.category?.name)
    );
  }, [selectedSoftwareIds, availableSoftwareModules, availableHardwareItems]);

  // Group filtered hardware items by category
  const groupedHardwareItems = useMemo(() => {
    const grouped = filteredHardwareItems.reduce((acc, hardware) => {
      const categoryName = hardware.category?.name || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(hardware);
      return acc;
    }, {} as Record<string, HardwareItem[]>);
    
    return grouped;
  }, [filteredHardwareItems]);

  // Handle software selection
<<<<<<< HEAD
  const handleSoftwareToggle = (softwareId: string) => {
    setSelectedSoftwareIds(prev => {
      if (prev.includes(softwareId)) {
        // Remove software and clear related hardware
        const newSoftwareIds = prev.filter(id => id !== softwareId);
        const software = availableSoftwareModules.find(s => s.id === softwareId);
        const categoryName = software?.category?.name;
        
        // Remove hardware items from the same category
        const newHardware = selectedHardware.filter(hw => {
          const hardware = availableHardwareItems.find(h => h.id === hw.id);
          return hardware?.category?.name !== categoryName;
        });
        
        setSelectedHardware(newHardware);
        return newSoftwareIds;
      } else {
        return [...prev, softwareId];
      }
    });
=======
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
        name: hardware.hardware_name,
        category: hardware.category,
        quantity: 1,
        unit_cost: hardware.unit_cost,
        installation_cost: 0,
        maintenance_cost: 0
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
>>>>>>> 17f67812a11b1e16fe2dd0e7a777d9d18f3e2c84
  };

  // Handle hardware quantity change
  const handleHardwareQuantityChange = (hardwareId: string, quantity: number) => {
    if (!isEditing) return;
    
<<<<<<< HEAD
    const currentHardware = selectedHardware || [];
    const existingIndex = currentHardware.findIndex(hw => hw.id === hardwareId);
    
    let newHardware;
    if (existingIndex >= 0) {
      newHardware = [...currentHardware];
      newHardware[existingIndex] = { ...newHardware[existingIndex], quantity };
    } else {
      const hardware = availableHardwareItems.find(h => h.id === hardwareId);
      if (hardware) {
        newHardware = [...currentHardware, { 
          id: hardwareId, 
          name: hardware.name,
          category: hardware.category?.name || 'Uncategorized',
          quantity,
          unit_cost: hardware.unit_cost || 0,
          installation_cost: 0,
          maintenance_cost: 0
        }];
      } else {
        newHardware = currentHardware;
=======
    const hardwareCosts = selectedHardware.reduce((sum, h) => sum + (h.unit_cost * h.quantity), 0);
    const installationCosts = selectedHardware.reduce((sum, h) => sum + ((h.installation_cost || 0) * h.quantity), 0);
    const maintenanceCosts = selectedHardware.reduce((sum, h) => sum + ((h.maintenance_cost || 0) * h.quantity), 0);
    
    const totalHardware = hardwareCosts + installationCosts;
    const contingency = totalHardware * 0.15;
    const totalCAPEX = totalHardware + softwareSetupCosts + contingency;
    const totalOPEX = softwareMonthlyCosts + maintenanceCosts;
    
    return {
      hardwareCost: hardwareCosts,
      softwareSetupCost: softwareSetupCosts,
      installationCost: installationCosts,
      contingencyCost: contingency,
      totalCapex: totalCAPEX,
      monthlySoftwareFees: softwareMonthlyCosts,
      maintenanceCost: maintenanceCosts,
      totalMonthlyOpex: totalOPEX,
      totalInvestment: totalCAPEX + (totalOPEX * 12) // Annual projection
    };
  }, [selectedSoftware, selectedHardware]);

  // Save changes
  const handleSave = () => {
    onUpdate({
      scoping: {
        selectedSoftware: selectedSoftware.map(s => s.id), // Convert back to string[] for compatibility
        selectedHardware: selectedHardware.map(h => ({ id: h.id, quantity: h.quantity })),
        costSummary,
        lastUpdated: new Date().toISOString()
>>>>>>> 17f67812a11b1e16fe2dd0e7a777d9d18f3e2c84
      }
    }
    
    setSelectedHardware(newHardware);
  };

  // Handle scoping submission
  const handleSubmitScoping = async () => {
    if (selectedSoftwareIds.length === 0) {
      toast.error('Please select at least one software module');
      return;
    }

    try {
      setSubmitting(true);
      
      // Save scoping data to database
      const { error } = await supabase
        .from('site_scoping')
        .upsert({
          site_id: site?.id,
          selected_software: selectedSoftwareIds,
          selected_hardware: selectedHardware,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error submitting scoping:', error);
        toast.error('Failed to submit scoping');
        return;
      }

      // Update site status
      onUpdate({
        scoping: {
          selectedSoftware: selectedSoftwareIds,
          selectedHardware: selectedHardware,
          status: 'submitted',
          submittedAt: new Date().toISOString()
        },
        status: 'scoping_done'
      });

      toast.success('Scoping submitted successfully for approval');
    } catch (err) {
      console.error('Error submitting scoping:', err);
      toast.error('Failed to submit scoping');
    } finally {
      setSubmitting(false);
    }
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Monitor className="mr-2 h-5 w-5 text-blue-600" />
            Software Selection
          </CardTitle>
          <CardDescription>
            Select the software modules you need for this site. Hardware recommendations will appear based on your selections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(groupedSoftwareModules).map(([categoryName, softwareModules]) => (
              <div key={categoryName}>
                <h4 className="font-medium text-gray-900 mb-3">{categoryName}</h4>
                <div className="space-y-3">
                  {softwareModules.map((software) => (
                    <div key={software.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={software.id}
                        checked={selectedSoftwareIds.includes(software.id)}
                        onCheckedChange={() => handleSoftwareToggle(software.id)}
                        disabled={!isEditing}
                      />
                      <div className="flex-1">
                        <Label htmlFor={software.id} className="font-medium cursor-pointer">
                          {software.name}
                        </Label>
                        {software.description && (
                          <p className="text-sm text-gray-600 mt-1">{software.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>License Fee: £{software.license_fee?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hardware Selection - Only show if software is selected */}
      {selectedSoftwareIds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5 text-green-600" />
              Hardware Selection
            </CardTitle>
            <CardDescription>
              Hardware items recommended based on your software selection. Adjust quantities as needed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(groupedHardwareItems).map(([categoryName, hardwareItems]) => (
                <div key={categoryName}>
                  <h4 className="font-medium text-gray-900 mb-3">{categoryName}</h4>
                  <div className="space-y-3">
                    {hardwareItems.map((hardware) => {
                      const selectedHardwareItem = selectedHardware.find(h => h.id === hardware.id);
                      const quantity = selectedHardwareItem?.quantity || 0;
                      
                      return (
                        <div key={hardware.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{hardware.name}</div>
                            {hardware.description && (
                              <p className="text-sm text-gray-600 mt-1">{hardware.description}</p>
                            )}
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>Cost: £{hardware.unit_cost?.toLocaleString() || 0}</span>
                              {hardware.manufacturer && <span>Manufacturer: {hardware.manufacturer}</span>}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleHardwareQuantityChange(hardware.id, Math.max(0, quantity - 1))}
                              disabled={!isEditing || quantity <= 0}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleHardwareQuantityChange(hardware.id, quantity + 1)}
                              disabled={!isEditing}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      {isEditing && selectedSoftwareIds.length > 0 && (
        <div className="flex justify-end">
          <Button 
            onClick={handleSubmitScoping}
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit for Approval
              </>
            )}
          </Button>
        </div>
      )}

      {/* Status Display */}
      {site?.scoping?.status === 'submitted' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="text-blue-800 font-medium">Scoping submitted for approval</span>
            </div>
            <p className="text-blue-700 text-sm mt-1">
              Submitted on {site.scoping.submittedAt ? new Date(site.scoping.submittedAt).toLocaleDateString() : 'Unknown date'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}