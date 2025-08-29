-- Clear existing organization logos
-- This script removes any existing logo URLs from the organizations table

-- Update all organizations to have null logo_url
UPDATE public.organizations 
SET logo_url = NULL 
WHERE logo_url IS NOT NULL;

-- Verify the update
SELECT 
  id,
  name,
  logo_url,
  CASE 
    WHEN logo_url IS NULL THEN 'Logo cleared'
    ELSE 'Logo still present'
  END as status
FROM public.organizations
ORDER BY name;

-- Count organizations with and without logos
SELECT 
  COUNT(*) as total_organizations,
  COUNT(logo_url) as organizations_with_logos,
  COUNT(*) - COUNT(logo_url) as organizations_without_logos
FROM public.organizations;
