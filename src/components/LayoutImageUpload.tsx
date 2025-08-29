import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader } from '@/components/ui/loader';
import { Upload, Edit, Trash2, Image as ImageIcon, FileText, X, Download } from 'lucide-react';
import { toast } from 'sonner';
import { FileUploadService, type UploadedFile } from '@/services/fileUploadService';
import { supabase } from '@/integrations/supabase/client';

interface LayoutImageUploadProps {
  siteId: string;
  disabled?: boolean;
  onImagesUpdated?: (images: UploadedFile[]) => void;
}

export const LayoutImageUpload: React.FC<LayoutImageUploadProps> = ({
  siteId,
  disabled = false,
  onImagesUpdated
}) => {
  const [existingImage, setExistingImage] = useState<UploadedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showFileInput, setShowFileInput] = useState(false);

  const loadExistingImage = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Loading timeout')), 10000)
      );
      
      const result = await Promise.race([
        FileUploadService.getSiteFiles(siteId),
        timeoutPromise
      ]) as { success: boolean; files?: UploadedFile[] };
      
      if (result.success && result.files && result.files.length > 0) {
        setExistingImage(result.files[0]);
      }
    } catch (error) {
      console.error('Error loading existing image:', error);
      // Set loading to false even on error to prevent infinite loading
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    if (siteId) {
      loadExistingImage();
    }
  }, [siteId, loadExistingImage]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Delete existing image if it exists
      if (existingImage) {
        await FileUploadService.deleteFile(existingImage.id);
      }

      // Upload new file
      const result = await FileUploadService.uploadFile(
        file,
        siteId,
        (progress) => setUploadProgress(progress)
      );

      if (result.success && result.file) {
        setExistingImage(result.file);
        await updateSiteLayoutImage([result.file]);
        
        if (onImagesUpdated) {
          onImagesUpdated([result.file]);
        }

        toast.success('Image uploaded successfully');
        setShowFileInput(false);
      } else {
        toast.error(result.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const updateSiteLayoutImage = async (images: UploadedFile[]) => {
    try {
      const { error } = await supabase
        .from('sites')
        .update({
          layout_images: JSON.stringify(images.map(img => img.url)),
          layout_images_metadata: JSON.stringify(images.map(img => ({
            id: img.id,
            name: img.name,
            size: img.size,
            type: img.type,
            uploaded_at: img.uploaded_at
          })))
        })
        .eq('id', siteId);

      if (error) {
        console.error('Error updating site layout image:', error);
      }
    } catch (error) {
      console.error('Database update error:', error);
    }
  };

  const handleDelete = async () => {
    if (!existingImage) return;

    try {
      const deleteResult = await FileUploadService.deleteFile(existingImage.id);
      
      if (deleteResult.success) {
        setExistingImage(null);
        await updateSiteLayoutImage([]);
        
        if (onImagesUpdated) {
          onImagesUpdated([]);
        }

        toast.success('Image deleted successfully');
      } else {
        toast.error(deleteResult.error || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete image');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderThumbnail = (image: UploadedFile) => {
    if (image.type.startsWith('image/')) {
      return (
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <img
            src={image.url}
            alt={image.name}
            className="w-full h-full object-cover"
          />
        </div>
      );
    } else {
      return (
        <div className="w-20 h-20 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
          <FileText className="h-10 w-10 text-red-600" />
        </div>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <Loader size="md" />
        <p className="text-sm text-gray-500 mt-2">Loading...</p>
      </div>
    );
  }

  if (showFileInput) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium">Upload Layout Image</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFileInput(false)}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            disabled={isUploading || disabled}
            className="hidden"
            id="layout-image-upload"
          />
          <label
            htmlFor="layout-image-upload"
            className="cursor-pointer block"
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Click to select or drag & drop
            </p>
            <p className="text-sm text-gray-500">
              PNG, JPG, PDF up to 10MB
            </p>
          </label>
        </div>

        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
      </div>
    );
  }

  if (existingImage) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFileInput(true)}
            disabled={disabled}
            className="h-8 w-8 p-0"
            title="Replace Image"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(existingImage.url, '_blank')}
            disabled={disabled}
            className="h-8 w-8 p-0"
            title="View Image"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={disabled}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            title="Delete Image"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              {renderThumbnail(existingImage)}
              <div className="flex-1 min-w-0">
                <h5 className="font-medium text-gray-900 mb-1">
                  {existingImage.name}
                </h5>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Size: {formatFileSize(existingImage.size)}</p>
                  <p>Type: {existingImage.type}</p>
                  <p>Uploaded: {new Date(existingImage.uploaded_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="text-center">
      <Button
        onClick={() => setShowFileInput(true)}
        disabled={disabled}
        className="w-full max-w-md"
        size="lg"
      >
        <Upload className="h-5 w-5 mr-2" />
        Upload Layout Image
      </Button>
      <p className="text-sm text-gray-500 mt-2">
        Upload a single image or PDF file (Max 10MB)
      </p>
    </div>
  );
};
