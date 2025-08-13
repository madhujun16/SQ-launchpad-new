export interface Stakeholder {
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface SiteStudy {
  id: string;
  site_id: string;
  conducted_by: string;
  study_date: string;
  findings?: string;
  site_map_url?: string;
  counter_count?: number;
  hardware_requirements?: any;
  geolocation_lat?: number;
  geolocation_lng?: number;
  status: string;
  created_at: string;
  updated_at: string;
  // New fields
  site_notes?: string;
  additional_site_details?: string;
  stakeholders: Stakeholder[];
}

export interface SiteStudyFormData {
  generalInfo: {
    sector: string;
    foodCourtName: string;
    unitManagerName: string;
    jobTitle: string;
    unitManagerEmail: string;
    unitManagerMobile: string;
    additionalContactName: string;
    additionalContactEmail: string;
    siteStudyDate: string;
  };
  location: {
    address: string;
    postcode: string;
    region: string;
    country: string;
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  infrastructure: {
    floorPlan: string;
    photos: string[];
    counters: number;
    mealSessions: string[];
  };
  hardware: {
    smartQSolutions: string[];
    additionalHardware: string[];
    networkRequirements: string;
    powerRequirements: string;
  };
  review: {
    notes: string;
    recommendations: string;
  };
  // New fields
  siteNotes: {
    notes: string;
    additionalSiteDetails: string;
  };
  stakeholders: Stakeholder[];
}
