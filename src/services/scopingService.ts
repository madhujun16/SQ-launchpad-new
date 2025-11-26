// TODO: Connect to GCP backend APIs
// TODO: All methods need to be reimplemented with GCP APIs

const API_NOT_IMPLEMENTED = 'API not implemented - connect to GCP backend';

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

export const getScopingRecommendations = async (): Promise<ScopingRecommendation[]> => {
  throw new Error(API_NOT_IMPLEMENTED);
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
