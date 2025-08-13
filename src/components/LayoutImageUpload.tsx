import React, { useState, useEffect } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { X, Download, Eye, Trash2 } from 'lucide-react';
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
  const [existingImages, setExistingImages] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load existing images on component mount
  useEffect(() => {
    if (siteId) {
      loadExistingImages();
    }
  }, [siteId]);

  const loadExistingImages = async () => {
    try {
      setIsLoading(true);
      
      // First, ensure the storage bucket exists
      await FileUploadService.ensureBucketExists();
      
      // Get existing images from storage
      const result = await FileUploadService.getSiteFiles(siteId);
      
      if (result.success && result.files) {
        setExistingImages(result.files);
      }
    } catch (error) {
      console.error('Error loading existing images:', error);
      toast.error('Failed to load existing images');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;

    try {
      setIsUploading(true);
      setUploadProgress({});

      // Upload files with progress tracking
      const result = await FileUploadService.uploadMultipleFiles(
        files,
        siteId,
        (fileIndex, progress) => {
          const fileName = files[fileIndex].name;
          setUploadProgress(prev => ({
            ...prev,
            [fileName]: progress
          }));
        }
      );

      if (result.success && result.files) {
        // Add new images to existing ones
        const updatedImages = [...existingImages, ...result.files];
        setExistingImages(updatedImages);
        
        // Update database
        await updateSiteLayoutImages(updatedImages);
        
        // Notify parent component
        if (onImagesUpdated) {
          onImagesUpdated(updatedImages);
        }

        toast.success(`Successfully uploaded ${result.files.length} image(s)`);
        
        // Show any errors that occurred during upload
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach(error => toast.error(error));
        }
      } else if (result.errors) {
        result.errors.forEach(error => toast.error(error));
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const updateSiteLayoutImages = async (images: UploadedFile[]) => {
    try {
      const { error } = await supabase
        .from('sites')
        .update({
          layout_images: images.map(img => img.url),
          layout_images_metadata: images.map(img => ({
            id: img.id,
            name: img.name,
            size: img.size,
            type: img.type,
            uploaded_at: img.uploaded_at
          }))
        })
        .eq('id', siteId);

      if (error) {
        console.error('Error updating site layout images:', error);
        toast.error('Failed to save image references to database');
      }
    } catch (error) {
      console.error('Database update error:', error);
      toast.error('Failed to save image references');
    }
  };

  const handleDeleteImage = async (imageIndex: number) => {
    const image = existingImages[imageIndex];
    if (!image) return;

    try {
      // Delete from storage
      const deleteResult = await FileUploadService.deleteFile(image.id);
      
      if (deleteResult.success) {
        // Remove from local state
        const updatedImages = existingImages.filter((_, index) => index !== imageIndex);
        setExistingImages(updatedImages);
        
        // Update database
        await updateSiteLayoutImages(updatedImages);
        
        // Notify parent component
        if (onImagesUpdated) {
          onImagesUpdated(updatedImages);
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

  const handleViewImage = (image: UploadedFile) => {
    window.open(image.url, '_blank');
  };

  const handleDownloadImage = (image: UploadedFile) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return '🖼️';
    } else if (fileType === 'application/pdf') {
      return '📄';
    }
    return '📁';
  };

  return (
    <div className="space-y-4">
      {/* File Upload Component */}
      <FileUpload
        multiple={true}
        maxFiles={3}
        maxFileSize={10 * 1024 * 1024} // 10MB
        acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']}
        onFilesSelected={handleFilesSelected}
        disabled={disabled || isUploading}
        placeholder="Select up to 3 layout images or drag & drop them here"
      />

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-gray-700">
            Uploaded Images ({existingImages.length}/3)
          </h5>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {existingImages.map((image, index) => (
              <Card key={image.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <span className="text-2xl">{getFileIcon(image.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {image.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(image.size)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(image.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewImage(image)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadImage(image)}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteImage(index)}
                        disabled={disabled}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-gray-700">Upload Progress</h5>
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{fileName}</span>
                <span className="text-gray-500">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ))}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading existing images...</p>
        </div>
      )}
    </div>
  );
};
