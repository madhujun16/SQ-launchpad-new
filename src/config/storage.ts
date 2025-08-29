// Storage Configuration
// Update this file with the correct bucket ID from your Supabase project

export const STORAGE_CONFIG = {
  // Organization logos bucket
  // Update this ID based on what you find in your Supabase storage
  ORGANIZATION_LOGOS_BUCKET: 'organization-logos', // Change this to the actual bucket ID
  
  // File size limits (in bytes)
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  
  // Allowed file types
  ALLOWED_IMAGE_TYPES: [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ],
  
  // Cache control
  CACHE_CONTROL: '3600', // 1 hour
  
  // File naming pattern
  FILE_NAME_PATTERN: '{organizationId}/{timestamp}-{random}.{extension}'
};

// Helper function to get bucket name
export const getBucketName = (bucketType: 'organization-logos'): string => {
  switch (bucketType) {
    case 'organization-logos':
      return STORAGE_CONFIG.ORGANIZATION_LOGOS_BUCKET;
    default:
      throw new Error(`Unknown bucket type: ${bucketType}`);
  }
};

// Helper function to validate file type
export const isValidImageFile = (file: File): boolean => {
  return STORAGE_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type);
};

// Helper function to validate file size
export const isValidFileSize = (file: File): boolean => {
  return file.size <= STORAGE_CONFIG.MAX_FILE_SIZE;
};
