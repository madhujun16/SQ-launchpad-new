// Section Service - Manages sections within pages

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api';

export interface Section {
  section_id?: number;
  section_name: string;
  page_id: number;
  fields?: Array<{
    field_id?: number;
    field_name: string;
    field_value: any;
  }>;
}

export interface SectionResponse {
  success: boolean;
  section?: Section;
  sections?: Section[];
  message?: string;
  error?: string;
}

export class SectionService {
  /**
   * Get sections for a page
   * @param pageId - Page ID
   * @param sectionName - Optional: filter by section name
   */
  static async getSections(
    pageId: number | string,
    sectionName?: string
  ): Promise<Section[]> {
    try {
      const response = await apiClient.get<{
        message: string;
        data: Section[];
      }>(API_ENDPOINTS.SECTIONS.GET(pageId, sectionName));

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch sections');
      }

      return response.data.data || [];
    } catch (error) {
      console.error('getSections error:', error);
      return [];
    }
  }

  /**
   * Create a new section
   * @param pageId - Page ID
   * @param sectionName - Section name
   * @param fields - Optional: initial fields
   */
  static async createSection(
    pageId: number | string,
    sectionName: string,
    fields: Array<{ field_name: string; field_value: any }> = []
  ): Promise<SectionResponse> {
    try {
      const response = await apiClient.post<{
        message: string;
        data: Section;
      }>(API_ENDPOINTS.SECTIONS.CREATE, {
        page_id: Number(pageId),
        section_name: sectionName,
        fields: fields,
      });

      if (!response.success) {
        return {
          success: false,
          error: response.error?.message || 'Failed to create section',
        };
      }

      return {
        success: true,
        section: response.data?.data,
        message: response.data?.message || 'Section created successfully',
      };
    } catch (error) {
      console.error('createSection error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create section',
      };
    }
  }
}

export default SectionService;

