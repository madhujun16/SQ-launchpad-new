// Platform Configuration Service
// This service handles all platform-level configuration data including recommendation rules

export interface SoftwareModule {
  id: string;
  name: string;
  description: string;
  category: string;
  is_active: boolean;
  monthly_fee: number;
  setup_fee: number;
  license_fee: number;
  created_at: string;
  updated_at: string;
}

export interface HardwareItem {
  id: string;
  name: string;
  description: string;
  category: string;
  model: string;
  manufacturer: string;
  unit_cost: number;
  installation_cost: number;
  maintenance_cost: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecommendationRule {
  id: string;
  softwareModuleId: string;
  hardwareItemId: string;
  defaultQuantity: number;
  isRequired: boolean;
  reason: string;
  costMultiplier: number;
}

export interface BusinessRule {
  id: string;
  name: string;
  description: string;
  ruleType: 'dependency' | 'exclusion' | 'quantity' | 'cost';
  softwareModuleIds: string[];
  hardwareItemIds: string[];
  ruleValue: string;
  priority: number;
  costImpact: number;
  conditionalLogic: any; // Placeholder for more complex logic
}

export interface PlatformConfiguration {
  softwareModules: SoftwareModule[];
  hardwareItems: HardwareItem[];
  recommendationRules: RecommendationRule[];
  businessRules: BusinessRule[];
  updatedAt: string;
  updatedBy: string;
}

// Default software modules to seed if none exist
const defaultSoftwareModules: SoftwareModule[] = [
  {
    id: 'sw-pos-system',
    name: 'SmartQ POS Pro',
    description: 'Advanced point-of-sale system with inventory management',
    category: 'POS',
    is_active: true,
    monthly_fee: 25,
    setup_fee: 150,
    license_fee: 50,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sw-kiosk-software',
    name: 'Self-Service Kiosk Suite',
    description: 'Touch-screen kiosk software for customer interactions',
    category: 'Kiosk',
    is_active: true,
    monthly_fee: 20,
    setup_fee: 100,
    license_fee: 30,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sw-kitchen-display',
    name: 'Kitchen Display System',
    description: 'Real-time order management for kitchen staff',
    category: 'Kitchen',
    is_active: true,
    monthly_fee: 20,
    setup_fee: 100,
    license_fee: 25,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sw-inventory-mgmt',
    name: 'Inventory Management Pro',
    description: 'Comprehensive inventory tracking and forecasting',
    category: 'Inventory',
    is_active: true,
    monthly_fee: 15,
    setup_fee: 75,
    license_fee: 20,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const defaultHardwareItems: HardwareItem[] = [
  {
    id: 'hw-pos-terminal',
    name: 'SmartQ POS Terminal',
    description: 'Touch-screen POS terminal with receipt printer',
    category: 'POS Hardware',
    model: 'SmartQ-POS-2024',
    manufacturer: 'SmartQ',
    unit_cost: 899.99,
    installation_cost: 100,
    maintenance_cost: 25,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'hw-barcode-scanner',
    name: 'Wireless Barcode Scanner',
    description: 'High-speed wireless barcode scanner',
    category: 'Scanner',
    model: 'SmartQ-Scan-Pro',
    manufacturer: 'SmartQ',
    unit_cost: 199.99,
    installation_cost: 50,
    maintenance_cost: 15,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'hw-cash-drawer',
    name: 'Electronic Cash Drawer',
    description: 'Secure electronic cash drawer with lock',
    category: 'Cash Management',
    model: 'SmartQ-Cash-2000',
    manufacturer: 'SmartQ',
    unit_cost: 299.99,
    installation_cost: 30,
    maintenance_cost: 10,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'kiosk-display',
    name: 'Kiosk Display',
    description: 'Touch screen display for kiosk',
    category: 'Display',
    model: 'TouchScreen-22',
    manufacturer: 'Elo',
    unit_cost: 800,
    installation_cost: 150,
    maintenance_cost: 20,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'touch-screen',
    name: 'Touch Screen',
    description: 'Touch screen interface',
    category: 'Display',
    model: 'TouchScreen-15',
    manufacturer: 'Elo',
    unit_cost: 600,
    installation_cost: 100,
    maintenance_cost: 15,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'kitchen-display',
    name: 'Kitchen Display',
    description: 'Digital display for kitchen orders',
    category: 'Display',
    model: 'KitchenDisplay-15',
    manufacturer: 'KitchenTech',
    unit_cost: 450,
    installation_cost: 75,
    maintenance_cost: 12,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockRecommendationRules: RecommendationRule[] = [
  {
    id: '1',
    softwareModuleId: 'pos-system',
    hardwareItemId: 'pos-terminal',
    defaultQuantity: 1,
    isRequired: true,
    reason: 'Core POS functionality',
    costMultiplier: 1.0,
    // minQuantity: 1,
    // // maxQuantity: 5,
    // conditionalLogic: null
  },
  {
    id: '2',
    softwareModuleId: 'pos-system',
    hardwareItemId: 'printer',
    defaultQuantity: 1,
    isRequired: true,
    reason: 'Receipt printing',
    costMultiplier: 1.0,
    // minQuantity: 1,
    // maxQuantity: 3,
    // conditionalLogic: null
  },
  {
    id: '3',
    softwareModuleId: 'pos-system',
    hardwareItemId: 'cash-drawer',
    defaultQuantity: 1,
    isRequired: true,
    reason: 'Cash management',
    costMultiplier: 1.0,
    // minQuantity: 1,
    // maxQuantity: 2,
    // conditionalLogic: null
  },
  {
    id: '4',
    softwareModuleId: 'kiosk-software',
    hardwareItemId: 'kiosk-display',
    defaultQuantity: 1,
    isRequired: true,
    reason: 'Kiosk interface',
    costMultiplier: 1.0,
    // minQuantity: 1,
    // maxQuantity: 4,
    // conditionalLogic: null
  },
  {
    id: '5',
    softwareModuleId: 'kiosk-software',
    hardwareItemId: 'touch-screen',
    defaultQuantity: 1,
    isRequired: true,
    reason: 'Touch interaction',
    costMultiplier: 1.0,
    // minQuantity: 1,
    // maxQuantity: 4,
    // conditionalLogic: null
  },
  {
    id: '6',
    softwareModuleId: 'kitchen-display',
    hardwareItemId: 'kitchen-display',
    defaultQuantity: 1,
    isRequired: true,
    reason: 'Kitchen order display',
    costMultiplier: 1.0,
    // minQuantity: 1,
    // maxQuantity: 3,
    // conditionalLogic: null
  },
  {
    id: '7',
    softwareModuleId: 'inventory-management',
    hardwareItemId: 'touch-screen',
    defaultQuantity: 1,
    isRequired: true,
    reason: 'Mobile inventory management',
    costMultiplier: 1.0,
    // minQuantity: 1,
    // maxQuantity: 2,
    // conditionalLogic: null
  }
];

const mockBusinessRules: BusinessRule[] = [
  {
    id: '1',
    name: 'POS Hardware Dependency',
    description: 'POS System requires POS Terminal, Printer, and Cash Drawer',
    ruleType: 'dependency',
    softwareModuleIds: ['pos-system'],
    hardwareItemIds: ['pos-terminal', 'printer', 'cash-drawer'],
    ruleValue: 'required',
    priority: 1,
    costImpact: 2849,
    conditionalLogic: null
  },
  {
    id: '2',
    name: 'Kiosk Display Requirement',
    description: 'Kiosk Software requires touch screen display',
    ruleType: 'dependency',
    softwareModuleIds: ['kiosk-software'],
    hardwareItemIds: ['kiosk-display', 'touch-screen'],
    ruleValue: 'required',
    priority: 2,
    costImpact: 1400,
    conditionalLogic: null
  },
  {
    id: '3',
    name: 'Kitchen Display Quantity',
    description: 'Kitchen Display software requires exactly one display unit',
    ruleType: 'quantity',
    softwareModuleIds: ['kitchen-display'],
    hardwareItemIds: ['kitchen-display'],
    ruleValue: '1',
    priority: 3,
    costImpact: 450,
    conditionalLogic: null
  }
];

// API Functions
export const getPlatformConfiguration = async (): Promise<PlatformConfiguration> => {
  // TODO: Replace with actual API call
  // const response = await fetch('/api/platform-configuration');
  // return response.json();
  
  return {
            softwareModules: defaultSoftwareModules,
          hardwareItems: defaultHardwareItems,
    recommendationRules: mockRecommendationRules,
    businessRules: mockBusinessRules,
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin'
  };
};

export const getRecommendationRules = async (): Promise<RecommendationRule[]> => {
  // TODO: Replace with actual API call
  // const response = await fetch('/api/platform-configuration/recommendation-rules');
  // return response.json();
  
  return mockRecommendationRules;
};

export const getSoftwareModules = async (): Promise<SoftwareModule[]> => {
  // TODO: Replace with actual API call
  // const response = await fetch('/api/platform-configuration/software-modules');
  // return response.json();
  
        return defaultSoftwareModules;
};

export const getHardwareItems = async (): Promise<HardwareItem[]> => {
  // TODO: Replace with actual API call
  // const response = await fetch('/api/platform-configuration/hardware-items');
  // return response.json();
  
      return defaultHardwareItems;
};

export const saveRecommendationRule = async (rule: RecommendationRule): Promise<void> => {
  // TODO: Replace with actual API call
  // await fetch('/api/platform-configuration/recommendation-rules', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(rule)
  // });
  
  // Log to audit system instead of console in production
  if (import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true') {
    console.log('Saving recommendation rule:', rule);
  }
};

export const deleteRecommendationRule = async (ruleId: string): Promise<void> => {
  // TODO: Replace with actual API call
  // await fetch(`/api/platform-configuration/recommendation-rules/${ruleId}`, {
  //   method: 'DELETE'
  // });
  
  // Log to audit system instead of console in production
  if (import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true') {
    console.log('Deleting recommendation rule:', ruleId);
  }
};

export const saveBusinessRule = async (rule: BusinessRule): Promise<void> => {
  // TODO: Replace with actual API call
  // await fetch('/api/platform-configuration/business-rules', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(rule)
  // });
  
  // Log to audit system instead of console in production
  if (import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true') {
    console.log('Saving business rule:', rule);
  }
};

export const deleteBusinessRule = async (ruleId: string): Promise<void> => {
  // TODO: Replace with actual API call
  // await fetch(`/api/platform-configuration/business-rules/${ruleId}`, {
  //   method: 'DELETE'
  // });
  
  // Log to audit system instead of console in production
  if (import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true') {
    console.log('Deleting business rule:', ruleId);
  }
};

// Helper function to get hardware recommendations based on selected software
export const getHardwareRecommendations = (selectedSoftware: string[]): RecommendationRule[] => {
  return mockRecommendationRules.filter(rule => 
    selectedSoftware.includes(rule.softwareModuleId)
  );
};
