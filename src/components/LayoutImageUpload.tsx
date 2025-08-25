import React, { useState, useEffect, useCallback } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { X, Download, Edit, Trash2, Image as ImageIcon, FileText, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { FileUploadService, type UploadedFile } from '@/services/fileUploadService';
import { supabase } from '@/integrations/supabase/client';
import { Loader } from './ui/loader';

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showFilePicker, setShowFilePicker] = useState(false);

  // Load existing image on component mount
  useEffect(() => {
    if (siteId) {
      loadExistingImage();
    }
  }, [siteId]);

  const loadExistingImage = async () => {
    try {
      setIsLoading(true);
      
      // First, ensure the storage bucket exists
      const bucketResult = await FileUploadService.ensureBucketExists();
      
      if (!bucketResult.success) {
        console.warn('Storage bucket not available:', bucketResult.error);
        return;
      }
      
      // Get existing images from storage
      const result = await FileUploadService.getSiteFiles(siteId);
      
      if (result.success && result.files && result.files.length > 0) {
        // Only take the first image since we're limiting to 1
        setExistingImage(result.files[0]);
      }
    } catch (error) {
      console.error('Error loading existing image:', error);
      toast.error('Failed to load existing image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]); // Only take the first file
      setShowFilePicker(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Check if bucket exists before attempting upload
      const bucketResult = await FileUploadService.ensureBucketExists();
      if (!bucketResult.success) {
        toast.error(`Cannot upload image: ${bucketResult.error}`);
        return;
      }

      // Delete existing image if it exists
      if (existingImage) {
        await FileUploadService.deleteFile(existingImage.id);
      }

      // Upload new file with progress tracking
      const result = await FileUploadService.uploadFile(
        selectedFile,
        siteId,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      if (result.success && result.file) {
        // Set the new image
        setExistingImage(result.file);
        
        // Update database
        await updateSiteLayoutImage([result.file]);
        
        // Notify parent component
        if (onImagesUpdated) {
          onImagesUpdated([result.file]);
        }

        toast.success('Image uploaded successfully');
        
        // Clear selected file after successful upload
        setSelectedFile(null);
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
        toast.error('Failed to save image reference to database');
      }
    } catch (error) {
      console.error('Database update error:', error);
      toast.error('Failed to save image reference');
    }
  };

  const handleDeleteImage = async () => {
    if (!existingImage) return;

    try {
      // Delete from storage
      const deleteResult = await FileUploadService.deleteFile(existingImage.id);
      
      if (deleteResult.success) {
        // Remove from local state
        setExistingImage(null);
        
        // Update database
        await updateSiteLayoutImage([]);
        
        // Notify parent component
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

  const handleEditImage = () => {
    setShowFilePicker(true);
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

  const renderThumbnail = (image: UploadedFile) => {
    if (image.type.startsWith('image/')) {
      return (
        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <img
            src={image.url}
            alt={image.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-200">
            <ImageIcon className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      );
    } else if (image.type === 'application/pdf') {
      return (
        <div className="w-24 h-24 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
          <FileText className="h-12 w-12 text-red-600" />
        </div>
      );
    }
    return (
      <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <FileText className="h-12 w-12 text-gray-400" />
      </div>
    );
  };

  const renderSelectedFileThumbnail = (file: File) => {
    if (file.type.startsWith('image/')) {
      return (
        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <img
            src={URL.createObjectURL(file)}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        </div>
      );
    } else if (file.type === 'application/pdf') {
      return (
        <div className="w-24 h-24 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
          <FileText className="h-12 w-12 text-red-600" />
        </div>
      );
    }
    return (
      <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <FileText className="h-12 w-12 text-gray-400" />
      </div>
    );
  };

  // If editing, show file picker
  if (showFilePicker) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium text-gray-900">Upload Layout Image</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilePicker(false)}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <FileUpload
          multiple={false}
          maxFiles={1}
          maxFileSize={10 * 1024 * 1024} // 10MB
          acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']}
          onFilesSelected={handleFileSelected}
          disabled={disabled || isUploading}
          placeholder="Select a layout image or drag & drop it here"
        />

        {selectedFile && (
          <div className="space-y-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  {renderSelectedFileThumbnail(selectedFile)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {selectedFile.type}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    disabled={disabled || isUploading}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleUpload}
              disabled={disabled || isUploading}
              className="w-full"
              size="lg"
            >
              {isUploading ? 'Uploading...' : 'Upload Image'}
            </Button>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Upload Progress</span>
              <span className="text-gray-500">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Button - shown when no image exists */}
      {!existingImage && !isLoading && (
        <div className="text-center">
          <Button
            onClick={() => setShowFilePicker(true)}
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
      )}

      {/* Existing Image Preview */}
      {existingImage && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-gray-900">Layout Image</h4>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEditImage}
                disabled={disabled}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleViewImage(existingImage)}
                disabled={disabled}
              >
                <Download className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDeleteImage}
                disabled={disabled}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                {renderThumbnail(existingImage)}
                <div className="flex-1 min-w-0">
                  <h5 className="text-lg font-medium text-gray-900 mb-2">
                    {existingImage.name}
                  </h5>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Size:</span> {formatFileSize(existingImage.size)}</p>
                    <p><span className="font-medium">Type:</span> {existingImage.type}</p>
                    <p><span className="font-medium">Uploaded:</span> {new Date(existingImage.uploaded_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <Loader size="md" />
          <p className="text-sm text-gray-500 mt-2">Loading existing image...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !existingImage && !showFilePicker && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">No layout image uploaded</p>
          <p className="text-sm">Upload a single image or PDF file to get started</p>
        </div>
      )}
    </div>
  );
};
