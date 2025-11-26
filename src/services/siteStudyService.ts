// TODO: Connect to GCP backend APIs
// TODO: All methods need to be reimplemented with GCP APIs

import { SiteStudy, Stakeholder } from '@/types/siteStudy';

const API_NOT_IMPLEMENTED = 'API not implemented - connect to GCP backend';

export class SiteStudyService {
  static async getSiteStudyBySiteId(siteId: string): Promise<SiteStudy | null> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static async upsertSiteStudy(siteStudyData: Partial<SiteStudy>): Promise<SiteStudy | null> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static async updateSiteNotes(siteId: string, notes: string, additionalDetails: string): Promise<boolean> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static async updateStakeholders(siteId: string, stakeholders: Stakeholder[]): Promise<boolean> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static async addStakeholder(siteId: string, stakeholder: Stakeholder): Promise<boolean> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static async removeStakeholder(siteId: string, index: number): Promise<boolean> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static async updateStakeholder(siteId: string, index: number, stakeholder: Stakeholder): Promise<boolean> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static validateStakeholder(stakeholder: Stakeholder): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!stakeholder.name || stakeholder.name.trim() === '') {
      errors.push('Name is required');
    }

    if (!stakeholder.role || stakeholder.role.trim() === '') {
      errors.push('Role is required');
    }

    if (!stakeholder.email || stakeholder.email.trim() === '') {
      errors.push('Email is required');
    } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(stakeholder.email)) {
      errors.push('Invalid email format');
    }

    if (!stakeholder.phone || stakeholder.phone.trim() === '') {
      errors.push('Phone is required');
    } else if (!/^[\+]?[0-9\s\-\(\)]{7,}$/.test(stakeholder.phone)) {
      errors.push('Invalid phone format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
