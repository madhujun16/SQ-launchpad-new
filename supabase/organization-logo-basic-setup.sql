-- Basic Organization Logo Setup Script
-- This script adds minimal logo support to organizations

-- 1. Add logo_url column to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 2. Add comment to the column
COMMENT ON COLUMN public.organizations.logo_url IS 'URL to the organization logo image stored in Supabase Storage';

-- 3. Update existing organizations to have null logo_url (if not already set)
UPDATE public.organizations 
SET logo_url = NULL 
WHERE logo_url IS NULL;

-- 4. Create index on logo_url for better performance
CREATE INDEX IF NOT EXISTS idx_organizations_logo_url ON public.organizations(logo_url);

-- 5. Add validation constraint to ensure logo_url is a valid URL format
ALTER TABLE public.organizations 
ADD CONSTRAINT IF NOT EXISTS check_logo_url_format 
CHECK (logo_url IS NULL OR logo_url ~ '^https?://.*');

-- 6. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.organizations TO authenticated;

-- 7. Verification query
SELECT 
  'Basic Setup Complete' as status,
  COUNT(*) as organizations_count,
  COUNT(logo_url) as organizations_with_logos,
  COUNT(*) - COUNT(logo_url) as organizations_without_logos
FROM public.organizations;
