-- Clean up placeholder logo URLs from organizations table
-- This removes via.placeholder.com URLs that are causing console errors

UPDATE public.organizations 
SET logo_url = NULL 
WHERE logo_url LIKE 'https://via.placeholder.com%';

-- Also clean up any other broken placeholder URLs
UPDATE public.organizations 
SET logo_url = NULL 
WHERE logo_url LIKE '%placeholder.com%';

-- Add comment to document the cleanup
COMMENT ON COLUMN public.organizations.logo_url IS 'URL for organization logo. Should be a valid image URL or NULL.';
