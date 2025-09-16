import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Progress } from './progress';
import { X, Upload, FileText, Image, File } from 'lucide-react';
import { toast } from 'sonner';

export interface FileUploadProps {
  multiple?: boolean;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedTypes?: string[];
  onFilesSelected?: (files: File[]) => void;
  onFilesUploaded?: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  showPreview?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  multiple = false,
  maxFiles = 3,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  acceptedTypes = ['image/*', 'application/pdf'],
  onFilesSelected,
  onFilesUploaded,
  disabled = false,
  className,
  placeholder = "Drop files here or click to browse",
  showPreview = true
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [disabled]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, []);

  const handleFiles = useCallback((files: File[]) => {
    // Validate file count
    if (multiple && files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      // Check file size
      if (file.size > maxFileSize) {
        toast.error(`${file.name} is too large. Maximum size is ${Math.round(maxFileSize / (1024 * 1024))}MB`);
        return false;
      }

      // Check file type
      const isValidType = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });

      if (!isValidType) {
        toast.error(`${file.name} has an unsupported file type`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    // Update selected files
    const newFiles = multiple ? [...selectedFiles, ...validFiles] : validFiles;
    
    // Limit to maxFiles if multiple
    const limitedFiles = multiple ? newFiles.slice(0, maxFiles) : newFiles;
    
    setSelectedFiles(limitedFiles);
    
    if (onFilesSelected) {
      onFilesSelected(limitedFiles);
    }
  }, [multiple, maxFiles, maxFileSize, acceptedTypes, selectedFiles, onFilesSelected]);

  const removeFile = useCallback((index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    
    if (onFilesSelected) {
      onFilesSelected(newFiles);
    }
  }, [selectedFiles, onFilesSelected]);

  const clearFiles = useCallback(() => {
    setSelectedFiles([]);
    if (onFilesSelected) {
      onFilesSelected([]);
    }
  }, [onFilesSelected]);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragOver && !disabled
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-4">
          <Upload className={cn(
            "h-12 w-12",
            isDragOver && !disabled ? "text-primary" : "text-gray-400"
          )} />
          
          <div>
            <p className="text-lg font-medium text-gray-700">
              {isDragOver && !disabled ? "Drop files here" : "Upload Files"}
            </p>
            <p className="text-sm text-gray-500">
              {placeholder}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {multiple ? `Up to ${maxFiles} files` : "Single file"} • Max {Math.round(maxFileSize / (1024 * 1024))}MB each
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleBrowseClick}
            disabled={disabled}
            className="mt-2"
          >
            Choose Files
          </Button>
        </div>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              Selected Files ({selectedFiles.length})
            </h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFiles}
              disabled={disabled}
            >
              Clear All
            </Button>
          </div>

          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIcon(file)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={disabled}
                  className="ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={`progress-${index}`} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{file.name}</span>
                    <span className="text-gray-500">
                      {uploadProgress[file.name] || 0}%
                    </span>
                  </div>
                  <Progress value={uploadProgress[file.name] || 0} className="h-2" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
