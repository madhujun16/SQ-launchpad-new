-- Comprehensive cleanup of all placeholder and malformed logo URLs
-- This script removes all problematic logo URLs that are causing console errors

-- 1. Clean up via.placeholder.com URLs
UPDATE public.organizations 
SET logo_url = NULL 
WHERE logo_url LIKE '%via.placeholder.com%';

-- 2. Clean up any other placeholder.com URLs
UPDATE public.organizations 
SET logo_url = NULL 
WHERE logo_url LIKE '%placeholder.com%';

-- 3. Clean up malformed URLs that contain FFFFFFF?text=
UPDATE public.organizations 
SET logo_url = NULL 
WHERE logo_url LIKE '%FFFFFF?text=%';

-- 4. Clean up any URLs that don't start with http://, https://, or data:
UPDATE public.organizations 
SET logo_url = NULL 
WHERE logo_url IS NOT NULL 
  AND logo_url NOT LIKE 'http://%' 
  AND logo_url NOT LIKE 'https://%' 
  AND logo_url NOT LIKE 'data:%';

-- 5. Clean up empty or whitespace-only URLs
UPDATE public.organizations 
SET logo_url = NULL 
WHERE logo_url IS NOT NULL 
  AND TRIM(logo_url) = '';

-- 6. Also clean up any sites table that might have organization_logo issues
UPDATE public.sites 
SET organization_logo = NULL 
WHERE organization_logo LIKE '%via.placeholder.com%'
   OR organization_logo LIKE '%placeholder.com%'
   OR organization_logo LIKE '%FFFFFF?text=%'
   OR (organization_logo IS NOT NULL 
       AND organization_logo NOT LIKE 'http://%' 
       AND organization_logo NOT LIKE 'https://%' 
       AND organization_logo NOT LIKE 'data:%'
       AND TRIM(organization_logo) = '');

-- Add comments to document the cleanup
COMMENT ON COLUMN public.organizations.logo_url IS 'URL for organization logo. Must be a valid HTTP/HTTPS URL or data URL. NULL if no logo.';
COMMENT ON COLUMN public.sites.organization_logo IS 'URL for organization logo (from joined organizations table). Must be a valid HTTP/HTTPS URL or data URL. NULL if no logo.';
