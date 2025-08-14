import { supabase } from '@/integrations/supabase/client';

// Enhanced interfaces for scoping integration
export interface ScopingSoftwareModule {
  id: string;
  name: string;
  description: string | null;
  category: string;
  monthly_fee: number;
  setup_fee: number;
  license_fee: number;
  is_active: boolean;
}

export interface ScopingHardwareItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  model: string | null;
  manufacturer: string | null;
  unit_cost: number;
  installation_cost: number;
  maintenance_cost: number;
  is_active: boolean;
}

export interface ScopingRecommendationRule {
  id: string;
  softwareModuleId: string;
  hardwareItemId: string;
  defaultQuantity: number;
  isRequired: boolean;
  reason: string;
  costMultiplier: number;
  minQuantity: number;
  maxQuantity: number;
}

export interface ScopingBusinessRule {
  id: string;
  name: string;
  description: string;
  ruleType: 'dependency' | 'exclusion' | 'quantity' | 'cost' | 'bundle';
  softwareModuleIds: string[];
  hardwareItemIds: string[];
  ruleValue: string;
  priority: number;
  costImpact: number | null;
}

export interface ScopingSelection {
  softwareModules: string[];
  hardwareItems: Array<{
    id: string;
    quantity: number;
    isRequired: boolean;
  }>;
}

export interface ScopingCostBreakdown {
  software: {
    monthlyFees: number;
    setupFees: number;
    licenseFees: number;
  };
  hardware: {
    unitCosts: number;
    installationCosts: number;
    maintenanceCosts: number;
  };
  total: {
    oneTime: number;
    monthly: number;
    annual: number;
  };
}

export interface ScopingRecommendation {
  softwareModule: ScopingSoftwareModule;
  recommendedHardware: Array<{
    hardwareItem: ScopingHardwareItem;
    rule: ScopingRecommendationRule;
    suggestedQuantity: number;
  }>;
  businessRules: ScopingBusinessRule[];
}

// Service functions
export const getScopingRecommendations = async (): Promise<ScopingRecommendation[]> => {
  try {
    // Get software modules
    const { data: softwareData, error: softwareError } = await supabase
      .from('software_modules')
      .select('*')
      .eq('is_active', true);

    if (softwareError) throw softwareError;

    // Get hardware items
    const { data: hardwareData, error: hardwareError } = await supabase
      .from('hardware_items')
      .select('*')
      .eq('is_active', true);

    if (hardwareError) throw hardwareError;

    // Get recommendation rules
    const { data: rulesData, error: rulesError } = await supabase
      .from('recommendation_rules')
      .select('*');

    if (rulesError) throw rulesError;

    // Get business rules
    const { data: businessRulesData, error: businessRulesError } = await supabase
      .from('business_rules')
      .select('*');

    if (businessRulesError) throw businessRulesError;

    // Build recommendations
    const recommendations: ScopingRecommendation[] = (softwareData || []).map(software => {
      const softwareRules = (rulesData || []).filter(rule => rule.software_module_id === software.id);
      const softwareBusinessRules = (businessRulesData || []).filter(rule => 
        rule.software_module_ids?.includes(software.id)
      );

      const recommendedHardware = softwareRules.map(rule => {
        const hardware = (hardwareData || []).find(h => h.id === rule.hardware_item_id);
        if (!hardware) return null;

        return {
          hardwareItem: {
            id: hardware.id,
            name: hardware.name,
            description: hardware.description,
            category: hardware.category,
            model: hardware.model,
            manufacturer: hardware.manufacturer,
            unit_cost: hardware.unit_cost || hardware.estimated_cost || 0,
            installation_cost: hardware.installation_cost || 0,
            maintenance_cost: hardware.maintenance_cost || 0,
            is_active: hardware.is_active
          },
          rule: {
            id: rule.id,
            softwareModuleId: rule.software_module_id,
            hardwareItemId: rule.hardware_item_id,
            defaultQuantity: rule.default_quantity || 1,
            isRequired: rule.is_required || false,
            reason: rule.reason || '',
            costMultiplier: rule.cost_multiplier || 1.0,
            minQuantity: rule.min_quantity || 1,
            maxQuantity: rule.max_quantity || 5
          },
          suggestedQuantity: rule.default_quantity || 1
        };
      }).filter(Boolean);

      return {
        softwareModule: {
          id: software.id,
          name: software.name,
          description: software.description,
          category: software.category,
          monthly_fee: software.monthly_fee || 0,
          setup_fee: software.setup_fee || 0,
          license_fee: software.license_fee || 0,
          is_active: software.is_active
        },
        recommendedHardware,
        businessRules: softwareBusinessRules.map(rule => ({
          id: rule.id,
          name: rule.name,
          description: rule.description,
          ruleType: rule.rule_type as any,
          softwareModuleIds: rule.software_module_ids || [],
          hardwareItemIds: rule.hardware_item_ids || [],
          ruleValue: rule.rule_value,
          priority: rule.priority,
          costImpact: rule.cost_impact
        }))
      };
    });

    return recommendations;
  } catch (error) {
    console.error('Error getting scoping recommendations:', error);
    throw error;
  }
};

export const calculateScopingCosts = (
  selection: ScopingSelection,
  recommendations: ScopingRecommendation[]
): ScopingCostBreakdown => {
  const softwareCosts = { monthlyFees: 0, setupFees: 0, licenseFees: 0 };
  const hardwareCosts = { unitCosts: 0, installationCosts: 0, maintenanceCosts: 0 };

  // Calculate software costs
  recommendations.forEach(rec => {
    if (selection.softwareModules.includes(rec.softwareModule.id)) {
      softwareCosts.monthlyFees += rec.softwareModule.monthly_fee;
      softwareCosts.setupFees += rec.softwareModule.setup_fee;
      softwareCosts.licenseFees += rec.softwareModule.license_fee;
    }
  });

  // Calculate hardware costs
  selection.hardwareItems.forEach(item => {
    const recommendation = recommendations.find(rec => 
      rec.recommendedHardware.some(h => h.hardwareItem.id === item.id)
    );
    
    if (recommendation) {
      const hardware = recommendation.recommendedHardware.find(h => h.hardwareItem.id === item.id);
      if (hardware) {
        hardwareCosts.unitCosts += hardware.hardwareItem.unit_cost * item.quantity;
        hardwareCosts.installationCosts += hardware.hardwareItem.installation_cost * item.quantity;
        hardwareCosts.maintenanceCosts += hardware.hardwareItem.maintenance_cost * item.quantity;
      }
    }
  });

  const totalOneTime = softwareCosts.setupFees + softwareCosts.licenseFees + hardwareCosts.unitCosts + hardwareCosts.installationCosts;
  const totalMonthly = softwareCosts.monthlyFees + hardwareCosts.maintenanceCosts;
  const totalAnnual = totalMonthly * 12;

  return {
    software: softwareCosts,
    hardware: hardwareCosts,
    total: {
      oneTime: totalOneTime,
      monthly: totalMonthly,
      annual: totalAnnual
    }
  };
};

export const validateScopingSelection = (
  selection: ScopingSelection,
  recommendations: ScopingRecommendation[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check if required hardware is selected for selected software
  selection.softwareModules.forEach(softwareId => {
    const recommendation = recommendations.find(rec => rec.softwareModule.id === softwareId);
    if (recommendation) {
      const requiredHardware = recommendation.recommendedHardware.filter(h => h.rule.isRequired);
      requiredHardware.forEach(h => {
        const isSelected = selection.hardwareItems.some(item => item.id === h.hardwareItem.id);
        if (!isSelected) {
          errors.push(`${h.hardwareItem.name} is required for ${recommendation.softwareModule.name}`);
        }
      });
    }
  });

  // Check quantity constraints
  selection.hardwareItems.forEach(item => {
    const recommendation = recommendations.find(rec => 
      rec.recommendedHardware.some(h => h.hardwareItem.id === item.id)
    );
    
    if (recommendation) {
      const hardware = recommendation.recommendedHardware.find(h => h.hardwareItem.id === item.id);
      if (hardware) {
        if (item.quantity < hardware.rule.minQuantity) {
          errors.push(`${hardware.hardwareItem.name} minimum quantity is ${hardware.rule.minQuantity}`);
        }
        if (item.quantity > hardware.rule.maxQuantity) {
          errors.push(`${hardware.hardwareItem.name} maximum quantity is ${hardware.rule.maxQuantity}`);
        }
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};
