// Procurement Service - Handles procurement data and completion

import { apiClient } from './apiClient';

export interface ProcurementData {
  id?: string;
  site_id: string;
  delivery_date?: string;
  delivery_receipt_url?: string;
  summary?: string;
  status: 'draft' | 'completed';
  completed_at?: string;
  completed_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProcurementCompletionData {
  delivery_date: string;
  delivery_receipt_url: string;
  summary: string;
}

export const ProcurementService = {
  /**
   * Get procurement data for a site
   * Backend endpoint: GET /api/site/{site_id}/procurement
   */
  async getProcurementData(siteId: string): Promise<ProcurementData | null> {
    try {
      const response = await apiClient.get<{
        message: string;
        data: ProcurementData;
      }>(`/site/${siteId}/procurement`);

      if (response.success && response.data?.data) {
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      console.error('❌ ProcurementService.getProcurementData: Error fetching procurement data:', error);
      // Return null if not found (404) - this is expected for new sites
      if (error?.statusCode === 404 || error?.error?.statusCode === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Update procurement data (save as draft)
   * Backend endpoint: PUT /api/site/{site_id}/procurement
   */
  async updateProcurementData(
    siteId: string,
    data: Partial<ProcurementData>
  ): Promise<ProcurementData | null> {
    try {
      const response = await apiClient.put<{
        message: string;
        data: ProcurementData;
      }>(`/site/${siteId}/procurement`, {
        delivery_date: data.delivery_date,
        delivery_receipt_url: data.delivery_receipt_url,
        summary: data.summary,
        status: data.status || 'draft',
      });

      if (response.success && response.data?.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('❌ ProcurementService.updateProcurementData: Error updating procurement data:', error);
      throw error;
    }
  },

  /**
   * Mark procurement as complete
   * Backend endpoint: POST /api/site/{site_id}/procurement/complete
   */
  async markProcurementComplete(
    siteId: string,
    data: ProcurementCompletionData
  ): Promise<ProcurementData | null> {
    try {
      const response = await apiClient.post<{
        message: string;
        data: ProcurementData;
      }>(`/site/${siteId}/procurement/complete`, {
        delivery_date: data.delivery_date,
        delivery_receipt_url: data.delivery_receipt_url,
        summary: data.summary,
      });

      if (response.success && response.data?.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('❌ ProcurementService.markProcurementComplete: Error marking procurement complete:', error);
      throw error;
    }
  },
};

