// Platform Configuration Service
// This service handles all platform-level configuration data including recommendation rules

export interface SoftwareModule {
  id: string;
  name: string;
  description: string;
  monthlyFee: number;
  setupFee: number;
  category: string;
  status: 'active' | 'inactive';
}

export interface HardwareItem {
  id: string;
  name: string;
  description: string;
  manufacturer: string;
  model: string;
  unitCost: number;
  category: string;
  status: 'available' | 'discontinued';
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
}

export interface PlatformConfiguration {
  softwareModules: SoftwareModule[];
  hardwareItems: HardwareItem[];
  recommendationRules: RecommendationRule[];
  businessRules: BusinessRule[];
  updatedAt: string;
  updatedBy: string;
}

// Mock data - replace with actual API calls
const mockSoftwareModules: SoftwareModule[] = [
  {
    id: 'pos-system',
    name: 'POS System',
    description: 'Point of Sale system for transactions',
    monthlyFee: 25,
    setupFee: 150,
    category: 'Payment Processing',
    status: 'active'
  },
  {
    id: 'kiosk-software',
    name: 'Kiosk Software',
    description: 'Self-service kiosk software',
    monthlyFee: 20,
    setupFee: 100,
    category: 'Self-Service',
    status: 'active'
  },
  {
    id: 'kitchen-display',
    name: 'Kitchen Display',
    description: 'Kitchen display system for orders',
    monthlyFee: 20,
    setupFee: 100,
    category: 'Kitchen Management',
    status: 'active'
  },
  {
    id: 'inventory-management',
    name: 'Inventory Management',
    description: 'Inventory tracking and management',
    monthlyFee: 15,
    setupFee: 75,
    category: 'Inventory',
    status: 'active'
  }
];

const mockHardwareItems: HardwareItem[] = [
  {
    id: 'pos-terminal',
    name: 'POS Terminal',
    description: 'Ingenico Telium 2 POS terminal',
    manufacturer: 'Ingenico',
    model: 'Telium 2',
    unitCost: 2500,
    category: 'Payment Processing',
    status: 'available'
  },
  {
    id: 'printer',
    name: 'Thermal Printer',
    description: 'Receipt and kitchen order printer',
    manufacturer: 'Epson',
    model: 'TM-T88VI',
    unitCost: 350,
    category: 'Printing',
    status: 'available'
  },
  {
    id: 'cash-drawer',
    name: 'Cash Drawer',
    description: 'Electronic cash drawer',
    manufacturer: 'APG',
    model: 'CashDrawer-2000',
    unitCost: 200,
    category: 'Payment Processing',
    status: 'available'
  },
  {
    id: 'kiosk-display',
    name: 'Kiosk Display',
    description: 'Touch screen display for kiosk',
    manufacturer: 'Elo',
    model: 'TouchScreen-22',
    unitCost: 800,
    category: 'Display',
    status: 'available'
  },
  {
    id: 'touch-screen',
    name: 'Touch Screen',
    description: 'Touch screen interface',
    manufacturer: 'Elo',
    model: 'TouchScreen-15',
    unitCost: 600,
    category: 'Display',
    status: 'available'
  },
  {
    id: 'kitchen-display',
    name: 'Kitchen Display',
    description: 'Digital display for kitchen orders',
    manufacturer: 'Sony',
    model: 'KD-55X80K',
    unitCost: 1200,
    category: 'Display',
    status: 'available'
  },
  {
    id: 'tablet',
    name: 'Tablet',
    description: 'iPad for inventory management',
    manufacturer: 'Apple',
    model: 'iPad Air',
    unitCost: 800,
    category: 'Mobile Device',
    status: 'available'
  },
  {
    id: 'barcode-scanner',
    name: 'Barcode Scanner',
    description: 'USB barcode scanner',
    manufacturer: 'Honeywell',
    model: 'Scanner-1900',
    unitCost: 150,
    category: 'Input Device',
    status: 'available'
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
    costMultiplier: 1.0
  },
  {
    id: '2',
    softwareModuleId: 'pos-system',
    hardwareItemId: 'printer',
    defaultQuantity: 1,
    isRequired: true,
    reason: 'Receipt printing',
    costMultiplier: 1.0
  },
  {
    id: '3',
    softwareModuleId: 'pos-system',
    hardwareItemId: 'cash-drawer',
    defaultQuantity: 1,
    isRequired: true,
    reason: 'Cash management',
    costMultiplier: 1.0
  },
  {
    id: '4',
    softwareModuleId: 'kiosk-software',
    hardwareItemId: 'kiosk-display',
    defaultQuantity: 1,
    isRequired: true,
    reason: 'Kiosk interface',
    costMultiplier: 1.0
  },
  {
    id: '5',
    softwareModuleId: 'kiosk-software',
    hardwareItemId: 'touch-screen',
    defaultQuantity: 1,
    isRequired: true,
    reason: 'Touch interaction',
    costMultiplier: 1.0
  },
  {
    id: '6',
    softwareModuleId: 'kitchen-display',
    hardwareItemId: 'kitchen-display',
    defaultQuantity: 1,
    isRequired: true,
    reason: 'Kitchen order display',
    costMultiplier: 1.0
  },
  {
    id: '7',
    softwareModuleId: 'inventory-management',
    hardwareItemId: 'tablet',
    defaultQuantity: 1,
    isRequired: true,
    reason: 'Mobile inventory management',
    costMultiplier: 1.0
  },
  {
    id: '8',
    softwareModuleId: 'inventory-management',
    hardwareItemId: 'barcode-scanner',
    defaultQuantity: 1,
    isRequired: true,
    reason: 'Barcode scanning',
    costMultiplier: 1.0
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
    priority: 1
  },
  {
    id: '2',
    name: 'Kiosk Display Requirement',
    description: 'Kiosk Software requires touch screen display',
    ruleType: 'dependency',
    softwareModuleIds: ['kiosk-software'],
    hardwareItemIds: ['kiosk-display', 'touch-screen'],
    ruleValue: 'required',
    priority: 2
  },
  {
    id: '3',
    name: 'Kitchen Display Quantity',
    description: 'Kitchen Display software requires exactly one display unit',
    ruleType: 'quantity',
    softwareModuleIds: ['kitchen-display'],
    hardwareItemIds: ['kitchen-display'],
    ruleValue: '1',
    priority: 3
  }
];

// API Functions
export const getPlatformConfiguration = async (): Promise<PlatformConfiguration> => {
  // TODO: Replace with actual API call
  // const response = await fetch('/api/platform-configuration');
  // return response.json();
  
  return {
    softwareModules: mockSoftwareModules,
    hardwareItems: mockHardwareItems,
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
  
  return mockSoftwareModules;
};

export const getHardwareItems = async (): Promise<HardwareItem[]> => {
  // TODO: Replace with actual API call
  // const response = await fetch('/api/platform-configuration/hardware-items');
  // return response.json();
  
  return mockHardwareItems;
};

export const saveRecommendationRule = async (rule: RecommendationRule): Promise<void> => {
  // TODO: Replace with actual API call
  // await fetch('/api/platform-configuration/recommendation-rules', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(rule)
  // });
  
  console.log('Saving recommendation rule:', rule);
};

export const deleteRecommendationRule = async (ruleId: string): Promise<void> => {
  // TODO: Replace with actual API call
  // await fetch(`/api/platform-configuration/recommendation-rules/${ruleId}`, {
  //   method: 'DELETE'
  // });
  
  console.log('Deleting recommendation rule:', ruleId);
};

export const saveBusinessRule = async (rule: BusinessRule): Promise<void> => {
  // TODO: Replace with actual API call
  // await fetch('/api/platform-configuration/business-rules', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(rule)
  // });
  
  console.log('Saving business rule:', rule);
};

export const deleteBusinessRule = async (ruleId: string): Promise<void> => {
  // TODO: Replace with actual API call
  // await fetch(`/api/platform-configuration/business-rules/${ruleId}`, {
  //   method: 'DELETE'
  // });
  
  console.log('Deleting business rule:', ruleId);
};

// Helper function to get hardware recommendations based on selected software
export const getHardwareRecommendations = (selectedSoftware: string[]): RecommendationRule[] => {
  return mockRecommendationRules.filter(rule => 
    selectedSoftware.includes(rule.softwareModuleId)
  );
};
