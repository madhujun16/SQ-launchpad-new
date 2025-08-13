import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  error?: string;
}

export class FileUploadService {
  private static readonly BUCKET_NAME = 'site-layout-images';
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  private static readonly MAX_FILES = 3;

  /**
   * Upload a single file to Supabase Storage
   */
  static async uploadFile(
    file: File, 
    siteId: string, 
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResult> {
    try {
      // Validate file
      const validationResult = this.validateFile(file);
      if (!validationResult.valid) {
        return { success: false, error: validationResult.error };
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${siteId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            if (onProgress && progress.total) {
              const percentage = Math.round((progress.loaded / progress.total) * 100);
              onProgress(percentage);
            }
          }
        });

      if (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      const uploadedFile: UploadedFile = {
        id: data.path,
        name: file.name,
        url: urlData.publicUrl,
        size: file.size,
        type: file.type,
        uploaded_at: new Date().toISOString()
      };

      return { success: true, file: uploadedFile };
    } catch (error) {
      console.error('File upload error:', error);
      return { success: false, error: 'Failed to upload file' };
    }
  }

  /**
   * Upload multiple files to Supabase Storage
   */
  static async uploadMultipleFiles(
    files: File[], 
    siteId: string,
    onProgress?: (fileIndex: number, progress: number) => void
  ): Promise<{ success: boolean; files?: UploadedFile[]; errors?: string[] }> {
    if (files.length > this.MAX_FILES) {
      return { 
        success: false, 
        errors: [`Maximum ${this.MAX_FILES} files allowed`] 
      };
    }

    const results: UploadedFile[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await this.uploadFile(file, siteId, (progress) => {
        if (onProgress) {
          onProgress(i, progress);
        }
      });

      if (result.success && result.file) {
        results.push(result.file);
      } else if (result.error) {
        errors.push(`${file.name}: ${result.error}`);
      }
    }

    if (results.length === 0) {
      return { success: false, errors };
    }

    return { 
      success: true, 
      files: results,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Delete a file from Supabase Storage
   */
  static async deleteFile(filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('File deletion error:', error);
      return { success: false, error: 'Failed to delete file' };
    }
  }

  /**
   * Get files for a specific site
   */
  static async getSiteFiles(siteId: string): Promise<{ success: boolean; files?: UploadedFile[]; error?: string }> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(siteId);

      if (error) {
        console.error('List files error:', error);
        return { success: false, error: error.message };
      }

      const files: UploadedFile[] = data
        .filter(item => !item.name.endsWith('/')) // Filter out directories
        .map(item => ({
          id: item.id || item.name,
          name: item.name,
          url: supabase.storage.from(this.BUCKET_NAME).getPublicUrl(`${siteId}/${item.name}`).data.publicUrl,
          size: item.metadata?.size || 0,
          type: item.metadata?.mimetype || 'application/octet-stream',
          uploaded_at: item.updated_at || new Date().toISOString()
        }));

      return { success: true, files };
    } catch (error) {
      console.error('Get files error:', error);
      return { success: false, error: 'Failed to get files' };
    }
  }

  /**
   * Validate file before upload
   */
  private static validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return { 
        valid: false, 
        error: `File size must be less than ${this.MAX_FILE_SIZE / (1024 * 1024)}MB` 
      };
    }

    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return { 
        valid: false, 
        error: `File type not allowed. Allowed types: ${this.ALLOWED_TYPES.join(', ')}` 
      };
    }

    return { valid: true };
  }

  /**
   * Check if storage bucket exists, create if not
   */
  static async ensureBucketExists(): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error('List buckets error:', listError);
        return { success: false, error: listError.message };
      }

      const bucketExists = buckets.some(bucket => bucket.name === this.BUCKET_NAME);
      
      if (!bucketExists) {
        // Create bucket
        const { error: createError } = await supabase.storage.createBucket(this.BUCKET_NAME, {
          public: true,
          fileSizeLimit: this.MAX_FILE_SIZE,
          allowedMimeTypes: this.ALLOWED_TYPES
        });

        if (createError) {
          console.error('Create bucket error:', createError);
          return { success: false, error: createError.message };
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Ensure bucket exists error:', error);
      return { success: false, error: 'Failed to ensure bucket exists' };
    }
  }
}
