import React, { useState, useEffect, useCallback } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { X, Download, Eye, Trash2, Image as ImageIcon, FileText } from 'lucide-react';
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
  const [existingImages, setExistingImages] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

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

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setIsUploading(true);
      setUploadProgress({});

      // Upload files with progress tracking
      const result = await FileUploadService.uploadMultipleFiles(
        selectedFiles,
        siteId,
        (fileIndex, progress) => {
          const fileName = selectedFiles[fileIndex].name;
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
        
        // Clear selected files after successful upload
        setSelectedFiles([]);
        
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
      return <ImageIcon className="h-4 w-4" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const renderThumbnail = (image: UploadedFile) => {
    if (image.type.startsWith('image/')) {
      return (
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
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
            <ImageIcon className="h-6 w-6 text-gray-400" />
          </div>
        </div>
      );
    } else if (image.type === 'application/pdf') {
      return (
        <div className="w-16 h-16 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
          <FileText className="h-8 w-8 text-red-600" />
        </div>
      );
    }
    return (
      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <FileText className="h-8 w-8 text-gray-400" />
      </div>
    );
  };

  const renderSelectedFileThumbnail = (file: File) => {
    if (file.type.startsWith('image/')) {
      return (
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <img
            src={URL.createObjectURL(file)}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        </div>
      );
    } else if (file.type === 'application/pdf') {
      return (
        <div className="w-16 h-16 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
          <FileText className="h-8 w-8 text-red-600" />
        </div>
      );
    }
    return (
      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <FileText className="h-8 w-8 text-gray-400" />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* File Upload Component */}
      <div className="space-y-4">
        <FileUpload
          multiple={true}
          maxFiles={3}
          maxFileSize={10 * 1024 * 1024} // 10MB
          acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']}
          onFilesSelected={handleFilesSelected}
          disabled={disabled || isUploading}
          placeholder="Select up to 3 layout images or drag & drop them here"
        />

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-medium text-gray-700">
                Selected Files ({selectedFiles.length}/3)
              </h5>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  {selectedFiles.reduce((total, file) => total + file.size, 0) > 10 * 1024 * 1024 
                    ? '⚠️ Total size exceeds 10MB limit' 
                    : `${Math.round(selectedFiles.reduce((total, file) => total + file.size, 0) / (1024 * 1024) * 100) / 100}MB total`
                  }
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFiles([])}
                  disabled={disabled || isUploading}
                  className="text-red-600 hover:text-red-700"
                >
                  Clear All
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedFiles.map((file, index) => (
                <Card key={`${file.name}-${index}`} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      {renderSelectedFileThumbnail(file)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {file.type}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newFiles = selectedFiles.filter((_, i) => i !== index);
                          setSelectedFiles(newFiles);
                        }}
                        disabled={disabled || isUploading}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={disabled || isUploading}
              className="w-full"
              size="lg"
            >
              {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        )}
      </div>

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium text-gray-700">
              Uploaded Images ({existingImages.length}/3)
            </h5>
            <p className="text-xs text-gray-500">
              Drag to reorder • First image will be the primary layout
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {existingImages.map((image, index) => (
              <Card key={image.id} className="overflow-hidden group hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      {renderThumbnail(image)}
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          Primary
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {image.name}
                        </p>
                        {index === 0 && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Primary Layout
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(image.size)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(image.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewImage(image)}
                        className="h-8 w-8 p-0"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadImage(image)}
                        className="h-8 w-8 p-0"
                        title="Download"
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
                        title="Delete"
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
        <div className="text-center py-8">
          <Loader size="md" />
          <p className="text-sm text-gray-500 mt-2">Loading existing images...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && existingImages.length === 0 && selectedFiles.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No layout images uploaded yet</p>
          <p className="text-xs">Upload up to 3 layout images to get started</p>
        </div>
      )}
    </div>
  );
};
