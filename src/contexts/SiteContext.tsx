import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  goLiveDate: string;
  priority: 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high';
  status: 'draft' | 'in_study' | 'hardware_scoped' | 'live';
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
    smartQSolutions?: string[];
    autoPulledHardware?: any[];
    additionalHardware?: any[];
    costBreakdown?: any;
    approvalStatus?: 'pending' | 'approved' | 'rejected';
  };
  // Deployment specific fields
  deployment?: {
    deliveryStatus?: 'pending' | 'dispatched' | 'delivered';
    installationStatus?: 'pending' | 'in_progress' | 'completed';
    engineerTasks?: any[];
    checklist?: any[];
  };
  // Forecast specific fields
  forecast?: {
    projectedTimeline?: any;
    milestones?: any[];
    dependencies?: any[];
  };
}

interface SiteContextType {
  selectedSite: Site | null;
  setSelectedSite: (site: Site | null) => void;
  sites: Site[];
  setSites: (sites: Site[]) => void;
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

export const SiteProvider: React.FC<SiteProviderProps> = ({ children }) => {
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [sites, setSites] = useState<Site[]>([]);

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
      status: 'draft'
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