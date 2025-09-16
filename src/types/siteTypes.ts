// Shared Site interface and related types
export type UnifiedSiteStatus = 
  | 'Created'
  | 'site_study_done'
  | 'scoping_done'
  | 'approved'
  | 'procurement_done'
  | 'deployed'
  | 'live'
  | 'archived';

export interface Site {
  id: string;
  name: string;
  organization: string;
  foodCourt?: string;
  unitCode: string;
  sector: string;
  goLiveDate: string;
  priority: 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high';
  criticality: 'low' | 'medium' | 'high';
  status: UnifiedSiteStatus;
  assignedOpsManager?: string;
  assignedDeploymentEngineer?: string;
  stakeholders?: Stakeholder[];
  notes?: string;
  lastUpdated?: string;
  description?: string;
  
  // Site Creation data
  siteCreation?: {
    contactInfo: {
      unitManagerName: string;
      jobTitle: string;
      unitManagerEmail: string;
      unitManagerMobile: string;
      additionalContactName: string;
      additionalContactEmail: string;
    };
    locationInfo: {
      location: string;
      postcode: string;
      region: string;
      country: string;
      latitude: number;
      longitude: number;
    };
    additionalNotes: string;
  };
  
  // Site Study data
  siteStudy?: {
    // Site Details - Identity
    siteDetails: {
      clientName: string;
      siteAddress: string;
      siteContact: {
        name: string;
        role: string;
        email: string;
        phone: string;
      }[];
    };
    
    // Schedule
    schedule: {
      targetGoLiveDate: string;
      operatingHours: {
        day: string;
        open: string;
        close: string;
      }[];
    };
    
    // Environment
    environment: {
      spaceType: 'Front-of-house' | 'Back-of-house' | 'Reception' | 'Cafeteria' | 'Grab & Go' | 'Other';
      isListedBuilding: boolean;
      permitRequired: boolean;
    };
    
    // Infrastructure - Power
    powerInfrastructure: {
      availablePower: ('UK 13A socket' | 'Spur' | 'PoE' | 'UPS' | 'Other')[];
      distanceFromPower: number;
    };
    
    // Infrastructure - Data
    dataInfrastructure: {
      networkConnectivity: 'Ethernet' | 'Dual-band Wi‑Fi' | '4G/5G SIM' | 'Not available';
      ethernetPorts: number;
      wifiSSIDs: string;
      vlanIPPlan: string;
      proxyWebFiltering: boolean;
      firewallEgress: boolean;
      mobileSignal: 'Excellent' | 'Good' | 'Poor' | 'No signal';
    };
    
    // Physical - Mounting
    mounting: {
      mountType: 'Wall' | 'Desk/Counter' | 'Floor-standing' | 'Free-standing' | 'Table' | 'To be confirmed';
      surfaceMaterial: 'Drywall' | 'Brick' | 'Concrete' | 'Steel' | 'Wood' | 'Composite' | 'Unknown';
      drillingRestrictions: boolean;
    };
    
    // Physical - Layout
    layout: {
      clearanceAvailable: string;
      distanceToTill: number;
      accessibilityCompliance: boolean;
    };
    
    // Devices
    devices: {
      kiosk: {
        numberOfKiosks: number;
        screenSize: '15"' | '22"' | 'Other';
        cardPaymentDevice: 'Verifone' | 'Ingenico' | 'PAX' | 'Adyen' | 'Other' | 'Not required';
        receiptPrinter: boolean;
        grabGoShelf: boolean;
      };
      pos: {
        numberOfTerminals: number;
        cashDrawer: boolean;
      };
      kitchen: {
        numberOfKDSScreens: number;
        kitchenPrinter: boolean;
      };
      other: {
        scanners: boolean;
        nfc: boolean;
        customerDisplay: boolean;
      };
    };
    
    // Software - Modules
    softwareModules: {
      modulesRequired: ('POS' | 'Kiosk' | 'Kitchen Display (KDS)' | 'Inventory' | 'Subscriptions' | 'Loyalty')[];
      userRoles: {
        role: string;
        count: number;
        notes: string;
      }[];
    };
    
    // Compliance
    compliance: {
      pciResponsibilities: string;
      brandAssetsAvailable: boolean;
    };
    
    // Payments
    payments: {
      gateway: {
        paymentProvider: string;
        p2peRequired: 'Required' | 'Preferred' | 'Not required';
        settlementCurrency: string;
      };
      ped: {
        commsMethod: 'Ethernet' | 'Wi‑Fi' | 'Bluetooth' | 'Serial' | 'USB';
        mountingType: 'Integrated' | 'Stanchion' | 'Counter cradle' | 'Wall bracket' | 'None';
      };
    };
    
    // Security & HSE
    securityHSE: {
      device: {
        mdmRequired: 'SOTI' | 'Intune' | 'Nubis' | 'Other' | 'No';
        assetTagging: boolean;
      };
      hse: {
        ramsApproval: boolean;
        workingConstraints: string;
      };
    };
  };
  
  // Scoping data
  scoping?: {
    selectedSoftware: string[];
    selectedHardware: { id: string; quantity: number; customizations?: string }[];
    status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'changes_requested';
    submittedAt?: string;
    approvedAt?: string;
    approvedBy?: string;
    costSummary: {
      hardwareCost: number;
      softwareSetupCost: number;
      installationCost: number;
      contingencyCost: number;
      totalCapex: number;
      monthlySoftwareFees: number;
      maintenanceCost: number;
      totalMonthlyOpex: number;
      totalInvestment: number;
    };
  };
  
  // Approval data
  approval?: {
    status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
    requestedAt?: string;
    approvedAt?: string;
    approvedBy?: string;
    comments?: string;
    approverDetails: {
      name: string;
      role: string;
      department: string;
    };
  };
  
  // Procurement data
  procurement?: {
    status: 'pending' | 'ordered' | 'delivered' | 'partially_delivered';
    lastUpdated?: string;
    softwareModules: {
      name: string;
      status: 'pending' | 'ordered' | 'delivered';
      orderDate?: string;
      deliveryDate?: string;
      licenseKey?: string;
    }[];
    hardwareItems: {
      name: string;
      quantity: number;
      status: 'pending' | 'ordered' | 'delivered';
      orderDate?: string;
      deliveryDate?: string;
      trackingNumber?: string;
    }[];
    summary: {
      totalSoftwareModules: number;
      totalHardwareItems: number;
      inProgress: number;
      completed: number;
    };
  };
  
  // Deployment data
  deployment?: {
    status: 'scheduled' | 'in_progress' | 'completed' | 'on_hold';
    startDate?: string;
    endDate?: string;
    assignedEngineer?: string;
    notes?: string;
    progress: {
      overallProgress: number;
      hardwareDelivered: 'completed' | 'in_progress' | 'pending';
      installation: 'completed' | 'in_progress' | 'pending';
      testing: 'completed' | 'in_progress' | 'pending';
    };
    timeline: {
      hardwareDelivery: string;
      installationStart: string;
      installationEnd: string;
      testingStart: string;
      testingEnd: string;
      goLiveDate: string;
    };
  };
  
  // Go Live data
  goLive?: {
    status: 'pending' | 'live' | 'postponed';
    date?: string;
    signedOffBy?: string;
    notes?: string;
    checklist: {
      hardwareInstallationComplete: 'completed' | 'in_progress' | 'pending';
      softwareConfigurationComplete: 'completed' | 'in_progress' | 'pending';
      staffTraining: 'completed' | 'in_progress' | 'pending';
      finalTesting: 'completed' | 'in_progress' | 'pending';
    };
    timeline: {
      targetGoLiveDate: string;
      finalTesting: string;
      staffTraining: string;
      systemHandover: string;
    };
  };
}

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  organization: string;
}

export interface SoftwareModule {
  id: string;
  name: string;
  description: string;
  monthlyFee: number;
  setupFee: number;
  hardwareRequirements: string[];
}

export interface HardwareItem {
  id: string;
  name: string;
  description: string;
  manufacturer: string;
  unitCost: number;
  category: string;
}
