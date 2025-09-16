import React, { createContext, useContext, useState, ReactNode } from 'react';
import { type UnifiedSiteStatus } from '@/lib/siteTypes';

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  organization: string;
}

export interface Site {
  id: string;
  name: string;
  organization: string;
  foodCourt: string;
  unitCode: string;
  sector: string;
  goLiveDate: string;
  priority: 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high';
  criticality: 'low' | 'medium' | 'high';
  status: UnifiedSiteStatus;
  assignedOpsManager: string;
  assignedDeploymentEngineer: string;
  stakeholders: Stakeholder[];
  notes: string;
  description: string;
  lastUpdated: string;
  // Site Study specific fields
  siteStudy?: {
    infrastructureMapping?: string;
    mealSessions?: string[];
    counters?: number;
    networkRequirements?: string;
    powerRequirements?: string;
    floorPlan?: string;
    photos?: string[];
  };
  // Hardware Scoping specific fields
  hardwareScope?: {
    approvalStatus: 'pending' | 'approved' | 'rejected';
    submittedAt?: string;
    approvedAt?: string;
    approvedBy?: string;
    comments?: string;
  };
  scoping?: {
    selectedSoftware: string[];
    selectedHardware: Array<{
      id: string;
      quantity: number;
      customizations?: string;
    }>;
    status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
    submittedAt?: string;
    approvedAt?: string;
    approvedBy?: string;
    comments?: string;
  };
  // Deployment specific fields
  deployment?: {
    deliveryStatus?: 'pending' | 'dispatched' | 'delivered';
    installationStatus?: 'pending' | 'in_progress' | 'completed';
    engineerTasks?: string[];
    checklist?: string[];
  };
  // Forecast specific fields
  forecast?: {
    projectedTimeline?: string;
    milestones?: string[];
    dependencies?: string[];
  };
  // Layout images
  layout_images?: string[];
  layout_images_metadata?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    uploaded_at: string;
  }>;
}

interface SiteContextType {
  selectedSite: Site | null;
  setSelectedSite: (site: Site | null) => void;
  sites: Site[];
  setSites: React.Dispatch<React.SetStateAction<Site[]>>;
  updateSite: (siteId: string, updates: Partial<Site>) => void;
  createSite: (siteData: Omit<Site, 'id' | 'lastUpdated'>) => string;
  deleteSite: (siteId: string) => void;
  getSiteById: (siteId: string) => Site | undefined;
  clearSelectedSite: () => void;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const useSiteContext = () => {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error('useSiteContext must be used within a SiteProvider');
  }
  return context;
};

interface SiteProviderProps {
  children: ReactNode;
}

const mockSites: Site[] = [
  {
    id: '1',
    name: 'ASDA Redditch',
    organization: 'ASDA',
    foodCourt: 'Main Food Court',
    unitCode: 'ASDA-RD-001',
    sector: 'Retail',
    goLiveDate: '2025-11-15',
    priority: 'high',
    riskLevel: 'medium',
    criticality: 'high',
    status: 'Created',
    assignedOpsManager: 'Sarah Johnson',
    assignedDeploymentEngineer: 'Mike Wilson',
    stakeholders: [],
    notes: 'New site creation',
    description: 'Primary ASDA location in Redditch',
    lastUpdated: '2025-09-01'
  },
  {
    id: '2',
    name: 'Tesco Birmingham',
    organization: 'Tesco',
    foodCourt: 'Central Food Hub',
    unitCode: 'TESCO-BM-002',
    sector: 'Retail',
    goLiveDate: '2025-12-01',
    priority: 'medium',
    riskLevel: 'low',
    criticality: 'medium',
    status: 'site_study_done',
    assignedOpsManager: 'John Smith',
    assignedDeploymentEngineer: 'Emma Davis',
    stakeholders: [],
    notes: 'Site study completed',
    description: 'Major Tesco store in Birmingham',
    lastUpdated: '2025-09-05'
  },
  {
    id: '3',
    name: 'Sainsbury Manchester',
    organization: 'Sainsbury',
    foodCourt: 'Express Food Zone',
    unitCode: 'SAINS-MC-003',
    sector: 'Retail',
    goLiveDate: '2025-10-20',
    priority: 'high',
    riskLevel: 'high',
    criticality: 'high',
    status: 'scoping_done',
    assignedOpsManager: 'Alice Brown',
    assignedDeploymentEngineer: 'Tom Wilson',
    stakeholders: [],
    notes: 'Hardware scoping completed',
    description: 'Sainsbury superstore in Manchester',
    lastUpdated: '2025-09-10'
  },
  {
    id: '4',
    name: 'Morrisons Leeds',
    organization: 'Morrisons',
    foodCourt: 'Market Street Food Court',
    unitCode: 'MORR-LD-004',
    sector: 'Retail',
    goLiveDate: '2025-11-30',
    priority: 'medium',
    riskLevel: 'medium',
    criticality: 'medium',
    status: 'approved',
    assignedOpsManager: 'David Lee',
    assignedDeploymentEngineer: 'Sophie Clark',
    stakeholders: [],
    notes: 'Project approved by stakeholders',
    description: 'Morrisons supermarket in Leeds',
    lastUpdated: '2025-09-12'
  },
  {
    id: '5',
    name: 'ASDA Liverpool',
    organization: 'ASDA',
    foodCourt: 'Riverside Food Court',
    unitCode: 'ASDA-LV-005',
    sector: 'Retail',
    goLiveDate: '2025-10-15',
    priority: 'high',
    riskLevel: 'low',
    criticality: 'high',
    status: 'procurement_done',
    assignedOpsManager: 'Rachel Green',
    assignedDeploymentEngineer: 'Chris Martin',
    stakeholders: [],
    notes: 'Hardware procurement completed',
    description: 'ASDA superstore in Liverpool',
    lastUpdated: '2025-09-15'
  },
  {
    id: '6',
    name: 'Tesco London Central',
    organization: 'Tesco',
    foodCourt: 'Metro Food Station',
    unitCode: 'TESCO-LC-006',
    sector: 'Retail',
    goLiveDate: '2025-10-05',
    priority: 'high',
    riskLevel: 'high',
    criticality: 'high',
    status: 'deployed',
    assignedOpsManager: 'Mark Thompson',
    assignedDeploymentEngineer: 'Lisa Anderson',
    stakeholders: [],
    notes: 'Deployment completed, awaiting go-live',
    description: 'Central London Tesco Metro',
    lastUpdated: '2025-09-18'
  },
  {
    id: '7',
    name: 'Sainsbury Bristol',
    organization: 'Sainsbury',
    foodCourt: 'West End Food Court',
    unitCode: 'SAINS-BR-007',
    sector: 'Retail',
    goLiveDate: '2025-09-25',
    priority: 'medium',
    riskLevel: 'low',
    criticality: 'medium',
    status: 'live',
    assignedOpsManager: 'Jennifer White',
    assignedDeploymentEngineer: 'Robert Taylor',
    stakeholders: [],
    notes: 'Site is now live and operational',
    description: 'Sainsbury store in Bristol',
    lastUpdated: '2025-09-20'
  }
];

export const SiteProvider: React.FC<SiteProviderProps> = ({ children }) => {
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [sites, setSites] = useState<Site[]>(mockSites);

  const updateSite = (siteId: string, updates: Partial<Site>) => {
    setSites(prevSites => 
      prevSites.map(site => 
        site.id === siteId 
          ? { ...site, ...updates, lastUpdated: new Date().toISOString().split('T')[0] }
          : site
      )
    );
    
    // Update selected site if it's the one being updated
    if (selectedSite?.id === siteId) {
      setSelectedSite(prev => prev ? { ...prev, ...updates, lastUpdated: new Date().toISOString().split('T')[0] } : null);
    }
  };

  const createSite = (siteData: Omit<Site, 'id' | 'lastUpdated'>): string => {
    const newSite: Site = {
      ...siteData,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString().split('T')[0],
      status: 'Created'
    };
    
    setSites(prevSites => [...prevSites, newSite]);
    return newSite.id;
  };

  const deleteSite = (siteId: string) => {
    setSites(prevSites => prevSites.filter(site => site.id !== siteId));
    
    // Clear selected site if it's the one being deleted
    if (selectedSite?.id === siteId) {
      setSelectedSite(null);
    }
  };

  const getSiteById = (siteId: string): Site | undefined => {
    return sites.find(site => site.id === siteId);
  };

  const clearSelectedSite = () => {
    setSelectedSite(null);
  };

  const value: SiteContextType = {
    selectedSite,
    setSelectedSite,
    sites,
    setSites,
    updateSite,
    createSite,
    deleteSite,
    getSiteById,
    clearSelectedSite
  };

  return (
    <SiteContext.Provider value={value}>
      {children}
    </SiteContext.Provider>
  );
}; 