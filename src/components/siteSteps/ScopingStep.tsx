import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Monitor, Package, Loader2, Trash2, Plus, Minus, AlertTriangle, X, CheckCircle, Clock, Calculator, DollarSign, Edit, Save } from 'lucide-react';
import { PlatformConfigService, SoftwareModule, HardwareItem, RecommendationRule } from '@/services/platformConfigService';
import { Site } from '@/types/siteTypes';
import { toast } from 'sonner';
import { ScopingApprovalService } from '@/services/scopingApprovalService';
import { useAuth } from '@/hooks/useAuth';

// TODO: Replace with GCP API calls

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
  const { profile } = useAuth();
  const [availableSoftwareModules, setAvailableSoftwareModules] = useState<SoftwareModule[]>([]);
  const [availableHardwareItems, setAvailableHardwareItems] = useState<HardwareItem[]>([]);
  const [recommendationRules, setRecommendationRules] = useState<RecommendationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSoftwareIds, setSelectedSoftwareIds] = useState<string[]>([]);
  const [selectedHardware, setSelectedHardware] = useState<SelectedHardware[]>([]);
  const [softwareQuantities, setSoftwareQuantities] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [rejectionMessage, setRejectionMessage] = useState<string | null>(null);

  // Fetch approval status
  useEffect(() => {
    const fetchApprovalStatus = async () => {
      if (!site?.id) return;
      
      try {
        const approval = await ScopingApprovalService.getApprovalBySiteId(site.id);
        if (approval) {
          setApprovalStatus(approval.status);
          if (approval.status === 'rejected') {
            setRejectionMessage(approval.rejectionReason || approval.reviewComment || 'Scoping was rejected. Please review and resubmit.');
          } else if (approval.status === 'approved') {
            setRejectionMessage(null);
          }
        }
      } catch (error) {
        console.error('Error fetching approval status:', error);
      }
    };

    fetchApprovalStatus();
  }, [site?.id]);

  // Initialize from site data
  useEffect(() => {
    if (site?.scoping) {
      // Handle both old format (array of strings) and new format (array of objects)
      const softwareData = site.scoping.selectedSoftware || [];
      const softwareIds = softwareData.map(item => 
        typeof item === 'string' ? item : (item as any).id
      );
      setSelectedSoftwareIds(softwareIds);
      
      // Initialize software quantities
      const initialSoftwareQuantities: Record<string, number> = {};
      softwareData.forEach(item => {
        if (typeof item === 'object' && item && (item as any).id) {
          initialSoftwareQuantities[(item as any).id] = (item as any).quantity || 1;
        } else if (typeof item === 'string') {
          initialSoftwareQuantities[item] = 1;
        }
      });
      setSoftwareQuantities(initialSoftwareQuantities);
      
      // Convert the site's hardware format to SelectedHardware format
      const convertedHardware = (site.scoping.selectedHardware || []).map(hw => {
        const hardware = availableHardwareItems.find(h => h.id === hw.id);
        const categoryName = typeof hardware?.category === 'string' 
          ? hardware.category 
          : hardware?.category?.name || 'Uncategorized';
        return {
          id: hw.id,
          name: hardware?.name || 'Unknown',
          category: categoryName,
          quantity: hw.quantity,
          unit_cost: hardware?.unit_cost || 0,
          installation_cost: 0,
          maintenance_cost: 0
        };
      });
      setSelectedHardware(convertedHardware);
    }
  }, [site, availableHardwareItems]);

  // Fetch all software modules, hardware items, and recommendation rules
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
        
        // Fetch recommendation rules for all software categories
        const softwareCategoryIds = [...new Set(softwareModules.map(sm => sm.category_id).filter(Boolean))];
        console.log('🔍 Software category IDs for recommendation rules:', softwareCategoryIds);
        
        if (softwareCategoryIds.length > 0) {
          try {
            const rules = await PlatformConfigService.getRecommendationRules(softwareCategoryIds);
            console.log('📋 Recommendation rules fetched:', rules);
            console.log('📊 Number of rules:', rules.length);
            if (rules.length === 0) {
              console.warn('⚠️ No recommendation rules found for categories:', softwareCategoryIds);
              console.warn('💡 Make sure the backend endpoint /api/platform/recommendation-rules is implemented');
            }
            setRecommendationRules(rules);
          } catch (error) {
            console.error('❌ Error fetching recommendation rules:', error);
            console.warn('⚠️ Could not fetch recommendation rules. Hardware filtering may not work correctly.');
            console.warn('💡 Make sure the backend endpoint /api/platform/recommendation-rules is implemented');
            setRecommendationRules([]);
          }
        } else {
          console.warn('⚠️ No software category IDs found. Cannot fetch recommendation rules.');
        }
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

  // Get recommended quantity for a hardware item based on recommendation rules
  const getRecommendedQuantity = (hardwareId: string): number => {
    const hardware = availableHardwareItems.find(h => h.id === hardwareId);
    if (!hardware?.category_id) return 0;
    
    // Get software category IDs from selected software
    const selectedSoftwareCategoryIds = selectedSoftwareIds
      .map(id => {
        const software = availableSoftwareModules.find(s => s.id === id);
        return software?.category_id;
      })
      .filter(Boolean) as string[];
    
    if (selectedSoftwareCategoryIds.length === 0) return 0;
    
    // Find recommendation rules that match selected software categories and this hardware category
    const relevantRules = recommendationRules.filter(rule =>
      selectedSoftwareCategoryIds.includes(rule.software_category) &&
      rule.hardware_category === hardware.category_id
    );
    
    // Sum up recommended quantities from all matching rules
    const totalRecommendedQuantity = relevantRules.reduce((sum, rule) => sum + (rule.quantity || 0), 0);
    
    return totalRecommendedQuantity;
  };

  // Get filtered hardware items based on selected software and recommendation rules
  const filteredHardwareItems = useMemo(() => {
    if (selectedSoftwareIds.length === 0) return [];
    
    // Get software category IDs from selected software
    const selectedSoftwareCategoryIds = selectedSoftwareIds
      .map(id => {
        const software = availableSoftwareModules.find(s => s.id === id);
        return software?.category_id;
      })
      .filter(Boolean) as string[];
    
    if (selectedSoftwareCategoryIds.length === 0) return [];
    
    // Find recommendation rules that match selected software categories
    const relevantRules = recommendationRules.filter(rule =>
      selectedSoftwareCategoryIds.includes(rule.software_category)
    );
    
    // Get hardware category IDs from recommendation rules
    const recommendedHardwareCategoryIds = new Set(
      relevantRules.map(rule => rule.hardware_category)
    );
    
    // Filter hardware items that belong to recommended hardware categories
    const filtered = availableHardwareItems.filter(hardware =>
      hardware.category_id && recommendedHardwareCategoryIds.has(hardware.category_id)
    );
    
    console.log('🔍 Filtered hardware items:', {
      selectedSoftwareIds,
      selectedSoftwareCategoryIds,
      relevantRulesCount: relevantRules.length,
      relevantRules,
      recommendedHardwareCategoryIds: Array.from(recommendedHardwareCategoryIds),
      availableHardwareCount: availableHardwareItems.length,
      filteredCount: filtered.length,
      filteredItems: filtered.map(h => ({ id: h.id, name: h.name, category_id: h.category_id }))
    });
    
    if (selectedSoftwareIds.length > 0 && filtered.length === 0) {
      console.warn('⚠️ No hardware items found for selected software!');
      console.warn('💡 Check:');
      console.warn('   1. Are recommendation rules in the database?');
      console.warn('   2. Is the backend endpoint /api/platform/recommendation-rules implemented?');
      console.warn('   3. Do the recommendation rules link the correct category IDs?');
    }
    
    return filtered;
  }, [selectedSoftwareIds, availableSoftwareModules, availableHardwareItems, recommendationRules]);

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

  // Auto-populate hardware items with recommended quantities when software is selected
  useEffect(() => {
    if (!isEditing || selectedSoftwareIds.length === 0 || filteredHardwareItems.length === 0) return;
    
    setSelectedHardware(prev => {
      // Get currently selected hardware IDs
      const currentHardwareIds = new Set(prev.map(h => h.id));
      
      // For each filtered hardware item, if not already selected, add it with recommended quantity
      const newHardwareItems: SelectedHardware[] = [];
      
      filteredHardwareItems.forEach(hardware => {
        if (!currentHardwareIds.has(hardware.id)) {
          // Calculate recommended quantity inline to avoid dependency issues
          const hardwareCategoryId = hardware.category_id;
          if (!hardwareCategoryId) return;
          
          // Get software category IDs from selected software
          const selectedSoftwareCategoryIds = selectedSoftwareIds
            .map(id => {
              const software = availableSoftwareModules.find(s => s.id === id);
              return software?.category_id;
            })
            .filter(Boolean) as string[];
          
          if (selectedSoftwareCategoryIds.length === 0) return;
          
          // Find recommendation rules that match selected software categories and this hardware category
          const relevantRules = recommendationRules.filter(rule =>
            selectedSoftwareCategoryIds.includes(rule.software_category) &&
            rule.hardware_category === hardwareCategoryId
          );
          
          // Sum up recommended quantities from all matching rules
          const recommendedQty = relevantRules.reduce((sum, rule) => sum + (rule.quantity || 0), 0);
          
          if (recommendedQty > 0) {
            newHardwareItems.push({
              id: hardware.id,
              name: hardware.name,
              category: hardware.category?.name || 'Uncategorized',
              quantity: recommendedQty,
              unit_cost: hardware.unit_cost || 0,
              installation_cost: 0,
              maintenance_cost: 0
            });
          }
        }
      });
      
      // Only update if there are new items to add
      if (newHardwareItems.length > 0) {
        return [...prev, ...newHardwareItems];
      }
      
      return prev;
    });
  }, [selectedSoftwareIds, filteredHardwareItems, isEditing, availableHardwareItems, availableSoftwareModules, recommendationRules]);

  // Handle software selection
  const handleSoftwareToggle = (softwareId: string) => {
    setSelectedSoftwareIds(prev => {
      if (prev.includes(softwareId)) {
        // Remove software and clear related hardware
        const newSoftwareIds = prev.filter(id => id !== softwareId);
        
        // Get hardware categories that are no longer needed
        const remainingSoftwareCategoryIds = newSoftwareIds
          .map(id => {
            const software = availableSoftwareModules.find(s => s.id === id);
            return software?.category_id;
          })
          .filter(Boolean) as string[];
        
        // Find recommendation rules for remaining software
        const remainingRules = recommendationRules.filter(rule =>
          remainingSoftwareCategoryIds.includes(rule.software_category)
        );
        const remainingHardwareCategoryIds = new Set(
          remainingRules.map(rule => rule.hardware_category)
        );
        
        // Remove hardware items that are no longer recommended
        const newHardware = selectedHardware.filter(hw => {
          const hardware = availableHardwareItems.find(h => h.id === hw.id);
          return hardware?.category_id && remainingHardwareCategoryIds.has(hardware.category_id);
        });
        
        setSelectedHardware(newHardware);
        return newSoftwareIds;
      } else {
        return [...prev, softwareId];
      }
    });
  };

  // Handle hardware quantity change
  const handleHardwareQuantityChange = (hardwareId: string, quantity: number) => {
    if (!isEditing) return;
    
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
      }
    }
    
    setSelectedHardware(newHardware);
  };

  // Handle software quantity change
  const handleSoftwareQuantityChange = (softwareId: string, quantity: number) => {
    if (!isEditing) return;
    
    setSoftwareQuantities(prev => ({
      ...prev,
      [softwareId]: Math.max(1, quantity)
    }));
  };

  // Calculate cost summary
  const calculateCostSummary = () => {
    const hardwareCosts = selectedHardware.reduce((sum, h) => sum + (h.unit_cost * h.quantity), 0);
    const installationCosts = selectedHardware.reduce((sum, h) => sum + ((h.installation_cost || 0) * h.quantity), 0);
    const maintenanceCosts = selectedHardware.reduce((sum, h) => sum + ((h.maintenance_cost || 0) * h.quantity), 0);
    
    const softwareSetupCosts = selectedSoftwareIds.reduce((sum, id) => {
      const software = availableSoftwareModules.find(s => s.id === id);
      const quantity = softwareQuantities[id] || 1;
      return sum + ((software?.license_fee || 0) * quantity);
    }, 0);
    
    const softwareMonthlyCosts = selectedSoftwareIds.reduce((sum, id) => {
      const software = availableSoftwareModules.find(s => s.id === id);
      const quantity = softwareQuantities[id] || 1;
      return sum + ((software?.license_fee || 0) * quantity);
    }, 0);
    
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
  };

  // Handle scoping submission
  const handleSubmitScoping = async () => {
    if (selectedSoftwareIds.length === 0) {
      toast.error('Please select at least one software module');
      return;
    }

    if (!site?.id || !site?.name) {
      toast.error('Site information is missing');
      return;
    }

    try {
      setSubmitting(true);
      
      const costSummary = calculateCostSummary();
      
      // Check if this is a resubmission
      const existingApproval = await ScopingApprovalService.getApprovalBySiteId(site.id);
      const isResubmission = existingApproval && existingApproval.status === 'rejected';

      let approval;
      if (isResubmission && existingApproval) {
        // Resubmit after rejection
        approval = await ScopingApprovalService.resubmitScoping(
          {
            siteId: site.id,
            siteName: site.name,
            selectedSoftware: selectedSoftwareIds.map(id => ({
              id,
              quantity: softwareQuantities[id] || 1
            })),
            selectedHardware: selectedHardware.map(h => ({ id: h.id, quantity: h.quantity })),
            costSummary
          },
          existingApproval.id
        );
      } else {
        // New submission
        approval = await ScopingApprovalService.submitScopingForApproval({
          siteId: site.id,
          siteName: site.name,
          selectedSoftware: selectedSoftwareIds.map(id => ({
            id,
            quantity: softwareQuantities[id] || 1
          })),
          selectedHardware: selectedHardware.map(h => ({ id: h.id, quantity: h.quantity })),
          costSummary
        });
      }

      if (approval) {
        setApprovalStatus(approval.status);
        setRejectionMessage(null);

        // Update site status
        onUpdate({
          scoping: {
            selectedSoftware: selectedSoftwareIds.map(id => ({
              id,
              quantity: softwareQuantities[id] || 1
            })) as any,
            selectedHardware: selectedHardware.map(h => ({ id: h.id, quantity: h.quantity })),
            status: 'submitted',
            submittedAt: new Date().toISOString(),
            costSummary
          },
          status: 'approval'
        });

        toast.success(isResubmission ? 'Scoping resubmitted successfully for approval' : 'Scoping submitted successfully for approval');
      } else {
        throw new Error('Failed to submit scoping');
      }
    } catch (err: any) {
      console.error('Error submitting scoping:', err);
      toast.error(err?.message || 'Failed to submit scoping for approval');
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

  // Cost Summary Component
  const CostSummarySection = () => {
    const costSummary = calculateCostSummary();
    
    return (
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="mr-2 h-5 w-5 text-green-600" />
            Cost Summary
          </CardTitle>
          <CardDescription>
            Real-time cost calculation based on your selections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* CAPEX Section */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <DollarSign className="h-4 w-4 mr-1 text-blue-600" />
              CAPEX (One-time Costs)
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Hardware:</span>
                <span>£{costSummary.hardwareCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Software Setup:</span>
                <span>£{costSummary.softwareSetupCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Installation:</span>
                <span>£{costSummary.installationCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Contingency (15%):</span>
                <span>£{costSummary.contingencyCost.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total CAPEX:</span>
                <span className="text-blue-600">£{costSummary.totalCapex.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* OPEX Section */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <DollarSign className="h-4 w-4 mr-1 text-green-600" />
              OPEX (Monthly Costs)
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Software Licenses:</span>
                <span>£{costSummary.monthlySoftwareFees.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Maintenance:</span>
                <span>£{costSummary.maintenanceCost.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total OPEX (Monthly):</span>
                <span className="text-green-600">£{costSummary.totalMonthlyOpex.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total OPEX (Annual):</span>
                <span className="text-green-600">£{(costSummary.totalMonthlyOpex * 12).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Total Investment */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">Total Investment (Year 1):</span>
              <span className="text-lg font-bold text-gray-900">£{costSummary.totalInvestment.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Includes CAPEX + 12 months OPEX
            </p>
          </div>

          {/* Submit Button in Cost Summary */}
          {isEditing && selectedSoftwareIds.length > 0 && (
            <Button 
              onClick={handleSubmitScoping}
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700"
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
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Scoping</h2>
          <p className="text-gray-600 mt-1">Define software and hardware requirements</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Software and Hardware Selection (67%) */}
        <div className="lg:col-span-2 space-y-6">
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
                    {softwareModules.map((software) => {
                      const isSelected = selectedSoftwareIds.includes(software.id);
                      const quantity = softwareQuantities[software.id] || 1;
                      
                      return (
                        <div key={software.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Checkbox
                            id={software.id}
                            checked={isSelected}
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
                          
                          {/* Quantity Controls - Only show if software is selected */}
                          {isSelected && isEditing && (
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSoftwareQuantityChange(software.id, Math.max(1, quantity - 1))}
                                disabled={quantity <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center font-medium">{quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSoftwareQuantityChange(software.id, quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          
                          {/* Show quantity if selected but not editing */}
                          {isSelected && !isEditing && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Qty: {quantity}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
                        const recommendedQty = getRecommendedQuantity(hardware.id);
                        const quantity = selectedHardwareItem?.quantity || recommendedQty || 0;
                        const isRecommended = recommendedQty > 0;
                        
                        return (
                          <div key={hardware.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="font-medium">{hardware.name}</div>
                                {isRecommended && quantity === recommendedQty && (
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                    Recommended
                                  </Badge>
                                )}
                              </div>
                              {hardware.description && (
                                <p className="text-sm text-gray-600 mt-1">{hardware.description}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span>Cost: £{hardware.unit_cost?.toLocaleString() || 0}</span>
                                {hardware.manufacturer && <span>Manufacturer: {hardware.manufacturer}</span>}
                                {isRecommended && (
                                  <span className="text-blue-600">
                                    Recommended: {recommendedQty}
                                  </span>
                                )}
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
                              <span className="w-8 text-center font-medium">{quantity}</span>
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

        {/* Status Display */}
        {approvalStatus === 'pending' && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800 font-medium">Scoping submitted for approval</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                Submitted on {site?.scoping?.submittedAt ? new Date(site.scoping.submittedAt).toLocaleDateString() : 'Unknown date'}
              </p>
              <p className="text-blue-600 text-xs mt-2">
                Waiting for Admin or Operations Manager approval
              </p>
            </CardContent>
          </Card>
        )}

        {approvalStatus === 'approved' && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">Scoping approved</span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Your scoping has been approved and is ready for procurement
              </p>
            </CardContent>
          </Card>
        )}

        {approvalStatus === 'rejected' && rejectionMessage && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-2">
                <X className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <span className="text-red-800 font-medium block">Scoping rejected</span>
                  <p className="text-red-700 text-sm mt-2 bg-red-100 p-3 rounded border border-red-200">
                    {rejectionMessage}
                  </p>
                  <p className="text-red-600 text-xs mt-2">
                    Please review the feedback, make necessary changes, and resubmit for approval.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

        {/* Right Column - Cost Summary (33%) */}
        <div className="lg:col-span-1">
          <CostSummarySection />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        {!isEditing ? (
          <Button
            variant="outline"
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save as Draft
            </Button>
            <Button
              onClick={handleSubmitScoping}
              disabled={submitting || approvalStatus === 'approved'}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : approvalStatus === 'rejected' ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Resubmit for Approval
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Submit for Approval
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}