// File Upload Service - Using signed URLs from backend API

import { AuthService } from './authService';

// API URL - configured via environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sqlaunchpad.com/api';

export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploaded_at: string;
}

export interface FileUploadResult {
  success: boolean;
  file?: UploadedFile;
  publicUrl?: string;
  error?: string;
}

export interface SignedUrlResponse {
  success: boolean;
  upload_url?: string;
  public_url?: string;
  error?: string;
}

// Helper to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = AuthService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export class FileUploadService {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
  private static readonly MAX_FILES = 3;

  /**
   * Generate a signed upload URL
   * @param dataIdentifier - Identifier for the upload (e.g., org_id for org logos)
   */
  static async generateUploadUrl(dataIdentifier: string): Promise<SignedUrlResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/generate-upload-url`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ Data_identifier: dataIdentifier }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || 'Failed to generate upload URL',
        };
      }

      return {
        success: true,
        upload_url: data.upload_url,
        public_url: data.public_url,
      };
    } catch (error) {
      console.error('generateUploadUrl error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate upload URL',
      };
    }
  }

  /**
   * Upload a file using a signed URL
   * @param file - The file to upload
   * @param dataIdentifier - Identifier for the upload (e.g., org_id)
   * @param onProgress - Optional progress callback
   */
  static async uploadFile(
    file: File,
    dataIdentifier: string,
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResult> {
    // Validate file first
    const validationResult = this.validateFile(file);
    if (!validationResult.valid) {
      return { success: false, error: validationResult.error };
    }

    try {
      // Step 1: Get signed upload URL
      const urlResult = await this.generateUploadUrl(dataIdentifier);
      if (!urlResult.success || !urlResult.upload_url) {
        return { success: false, error: urlResult.error || 'Failed to get upload URL' };
      }

      // Step 2: Upload file directly to the signed URL
      const uploadResponse = await fetch(urlResult.upload_url, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        return { 
          success: false, 
          error: `Upload failed with status ${uploadResponse.status}` 
        };
      }

      // Call progress callback with 100% on success
      if (onProgress) {
        onProgress(100);
      }

      return {
        success: true,
        publicUrl: urlResult.public_url,
        file: {
          id: dataIdentifier,
          name: file.name,
          url: urlResult.public_url || '',
          size: file.size,
          type: file.type,
          uploaded_at: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('uploadFile error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload file',
      };
    }
  }

  /**
   * Upload organization logo
   * @param file - The logo image file
   * @param orgId - The organization ID
   */
  static async uploadOrgLogo(
    file: File,
    orgId: string,
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResult> {
    // Validate it's an image
    if (!this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        success: false,
        error: `Invalid image type. Allowed: ${this.ALLOWED_IMAGE_TYPES.join(', ')}`,
      };
    }

    return this.uploadFile(file, orgId, onProgress);
  }

  /**
   * Upload multiple files
   */
  static async uploadMultipleFiles(
    files: File[],
    dataIdentifier: string,
    onProgress?: (fileIndex: number, progress: number) => void
  ): Promise<{ success: boolean; files?: UploadedFile[]; publicUrls?: string[]; errors?: string[] }> {
    if (files.length > this.MAX_FILES) {
      return {
        success: false,
        errors: [`Maximum ${this.MAX_FILES} files allowed`],
      };
    }

    const uploadedFiles: UploadedFile[] = [];
    const publicUrls: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await this.uploadFile(
        file,
        `${dataIdentifier}_${i}`,
        (progress) => onProgress?.(i, progress)
      );

      if (result.success && result.file) {
        uploadedFiles.push(result.file);
        if (result.publicUrl) {
          publicUrls.push(result.publicUrl);
        }
      } else {
        errors.push(result.error || `Failed to upload ${file.name}`);
      }
    }

    return {
      success: errors.length === 0,
      files: uploadedFiles,
      publicUrls,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Validate file before upload
   */
  private static validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size must be less than ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`,
      };
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `File type not allowed. Allowed types: ${this.ALLOWED_TYPES.join(', ')}`,
      };
    }

    return { valid: true };
  }

  /**
   * Validate image file
   */
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `Image size must be less than ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`,
      };
    }

    if (!this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Image type not allowed. Allowed types: ${this.ALLOWED_IMAGE_TYPES.join(', ')}`,
      };
    }

    return { valid: true };
  }

  /**
   * Delete a file (if API supports it)
   */
  static async deleteFile(filePath: string): Promise<{ success: boolean; error?: string }> {
    // TODO: Implement when API endpoint is available
    console.warn('deleteFile not implemented - need backend API endpoint');
    return { success: false, error: 'Delete file API not implemented' };
  }

  /**
   * Get files for a site (if API supports it)
   */
  static async getSiteFiles(siteId: string): Promise<{ success: boolean; files?: UploadedFile[]; error?: string }> {
    // TODO: Implement when API endpoint is available
    console.warn('getSiteFiles not implemented - need backend API endpoint');
    return { success: true, files: [] };
  }
}

export default FileUploadService;
