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
      status: 'site_created'
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