import { supabase } from '@/integrations/supabase/client';
import { SiteStudy, Stakeholder } from '@/types/siteStudy';

export class SiteStudyService {
  // Get site study by site ID
  static async getSiteStudyBySiteId(siteId: string): Promise<SiteStudy | null> {
    try {
      const { data, error } = await supabase
        .from('site_studies')
        .select('*')
        .eq('site_id', siteId)
        .single();

      if (error) {
        console.error('Error fetching site study:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getSiteStudyBySiteId:', error);
      return null;
    }
  }

  // Create or update site study
  static async upsertSiteStudy(siteStudyData: Partial<SiteStudy>): Promise<SiteStudy | null> {
    try {
      const { data, error } = await supabase
        .from('site_studies')
        .upsert(siteStudyData, {
          onConflict: 'site_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting site study:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in upsertSiteStudy:', error);
      return null;
    }
  }

  // Update site study notes
  static async updateSiteNotes(siteId: string, notes: string, additionalDetails: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('site_studies')
        .update({
          site_notes: notes,
          additional_site_details: additionalDetails,
          updated_at: new Date().toISOString()
        })
        .eq('site_id', siteId);

      if (error) {
        console.error('Error updating site notes:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateSiteNotes:', error);
      return false;
    }
  }

  // Update stakeholders
  static async updateStakeholders(siteId: string, stakeholders: Stakeholder[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('site_studies')
        .update({
          stakeholders: stakeholders,
          updated_at: new Date().toISOString()
        })
        .eq('site_id', siteId);

      if (error) {
        console.error('Error updating stakeholders:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateStakeholders:', error);
      return false;
    }
  }

  // Add a single stakeholder
  static async addStakeholder(siteId: string, stakeholder: Stakeholder): Promise<boolean> {
    try {
      // First get current stakeholders
      const currentStudy = await this.getSiteStudyBySiteId(siteId);
      if (!currentStudy) {
        return false;
      }

      const currentStakeholders = currentStudy.stakeholders || [];
      const updatedStakeholders = [...currentStakeholders, stakeholder];

      return await this.updateStakeholders(siteId, updatedStakeholders);
    } catch (error) {
      console.error('Error in addStakeholder:', error);
      return false;
    }
  }

  // Remove a stakeholder by index
  static async removeStakeholder(siteId: string, index: number): Promise<boolean> {
    try {
      const currentStudy = await this.getSiteStudyBySiteId(siteId);
      if (!currentStudy) {
        return false;
      }

      const currentStakeholders = currentStudy.stakeholders || [];
      if (index < 0 || index >= currentStakeholders.length) {
        return false;
      }

      const updatedStakeholders = currentStakeholders.filter((_, i) => i !== index);
      return await this.updateStakeholders(siteId, updatedStakeholders);
    } catch (error) {
      console.error('Error in removeStakeholder:', error);
      return false;
    }
  }

  // Update a stakeholder by index
  static async updateStakeholder(siteId: string, index: number, stakeholder: Stakeholder): Promise<boolean> {
    try {
      const currentStudy = await this.getSiteStudyBySiteId(siteId);
      if (!currentStudy) {
        return false;
      }

      const currentStakeholders = currentStudy.stakeholders || [];
      if (index < 0 || index >= currentStakeholders.length) {
        return false;
      }

      const updatedStakeholders = [...currentStakeholders];
      updatedStakeholders[index] = stakeholder;

      return await this.updateStakeholders(siteId, updatedStakeholders);
    } catch (error) {
      console.error('Error in updateStakeholder:', error);
      return false;
    }
  }

  // Validate stakeholder data
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
