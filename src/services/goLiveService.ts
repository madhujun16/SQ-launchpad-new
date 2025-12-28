// Go Live Service - Handles go live status toggle

import { apiClient } from './apiClient';

export interface GoLiveData {
  id?: string;
  site_id: string;
  status: 'live' | 'offline' | 'postponed';
  go_live_date?: string;
  signed_off_by?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GoLiveToggleData {
  notes: string;
}

export const GoLiveService = {
  /**
   * Get go live data for a site
   * Backend endpoint: GET /api/site/{site_id}/go-live
   */
  async getGoLiveData(siteId: string): Promise<GoLiveData | null> {
    try {
      const response = await apiClient.get<{
        message: string;
        data: GoLiveData;
      }>(`/site/${siteId}/go-live`);

      if (response.success && response.data?.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('❌ GoLiveService.getGoLiveData: Error fetching go live data:', error);
      // Return null if not found (404) - this is expected for sites not yet live
      if ((error as any)?.statusCode === 404 || (error as any)?.error?.statusCode === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Mark site as live
   * Backend endpoint: POST /api/site/{site_id}/go-live/activate
   */
  async markSiteLive(
    siteId: string,
    data: GoLiveToggleData
  ): Promise<GoLiveData | null> {
    try {
      const response = await apiClient.post<{
        message: string;
        data: GoLiveData;
      }>(`/site/${siteId}/go-live/activate`, {
        notes: data.notes,
      });

      if (response.success && response.data?.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('❌ GoLiveService.markSiteLive: Error marking site live:', error);
      throw error;
    }
  },

  /**
   * Mark site as offline
   * Backend endpoint: POST /api/site/{site_id}/go-live/deactivate
   */
  async markSiteOffline(
    siteId: string,
    data: GoLiveToggleData
  ): Promise<GoLiveData | null> {
    try {
      const response = await apiClient.post<{
        message: string;
        data: GoLiveData;
      }>(`/site/${siteId}/go-live/deactivate`, {
        notes: data.notes,
      });

      if (response.success && response.data?.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('❌ GoLiveService.markSiteOffline: Error marking site offline:', error);
      throw error;
    }
  },
};

