-- Organization Logo Setup Script
-- This script adds logo support to organizations and creates the necessary storage bucket

-- 1. Add logo_url column to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 2. Add comment to the column
COMMENT ON COLUMN public.organizations.logo_url IS 'URL to the organization logo image stored in Supabase Storage';

-- 3. Create organization-logos storage bucket (if it doesn't exist)
-- Note: This needs to be run in Supabase Dashboard > Storage > Create bucket
-- Bucket name: organization-logos
-- Public bucket: true
-- File size limit: 2MB
-- Allowed MIME types: image/*

-- 4. Create storage policy for organization logos
-- This allows authenticated users to upload logos for organizations they can access
CREATE POLICY "Allow authenticated users to upload organization logos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'organization-logos' AND
  auth.uid() IS NOT NULL
);

-- 5. Create storage policy for viewing organization logos
-- This allows public access to view organization logos
CREATE POLICY "Allow public access to view organization logos" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'organization-logos');

-- 6. Create storage policy for updating organization logos
-- This allows authenticated users to update logos for organizations they can access
CREATE POLICY "Allow authenticated users to update organization logos" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'organization-logos' AND auth.uid() IS NOT NULL)
WITH CHECK (bucket_id = 'organization-logos' AND auth.uid() IS NOT NULL);

-- 7. Create storage policy for deleting organization logos
-- This allows authenticated users to delete logos for organizations they can access
CREATE POLICY "Allow authenticated users to delete organization logos" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'organization-logos' AND auth.uid() IS NOT NULL);

-- 8. Update existing organizations to have null logo_url (if not already set)
UPDATE public.organizations 
SET logo_url = NULL 
WHERE logo_url IS NULL;

-- 9. Add RLS policy for organizations table to ensure users can only modify their own organizations
-- (This assumes you have appropriate RLS policies already in place)

-- 10. Create function to get organization logo URL
CREATE OR REPLACE FUNCTION public.get_organization_logo(org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Return the logo URL for the given organization
  RETURN (SELECT logo_url FROM public.organizations WHERE id = org_id);
END;
$$;

-- 11. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_organization_logo(UUID) TO authenticated;

-- 12. Create index on logo_url for better performance
CREATE INDEX IF NOT EXISTS idx_organizations_logo_url ON public.organizations(logo_url);

-- 13. Add validation constraint to ensure logo_url is a valid URL format
ALTER TABLE public.organizations 
ADD CONSTRAINT check_logo_url_format 
CHECK (logo_url IS NULL OR logo_url ~ '^https?://.*');

-- 14. Create a view for organizations with logo information
CREATE OR REPLACE VIEW public.organizations_with_logos AS
SELECT 
  id,
  name,
  description,
  sector,
  unit_code,
  logo_url,
  created_by,
  created_on,
  updated_at,
  CASE 
    WHEN logo_url IS NOT NULL THEN true 
    ELSE false 
  END as has_logo
FROM public.organizations;

-- 15. Grant select permission on the view
GRANT SELECT ON public.organizations_with_logos TO authenticated;

-- 16. Create function to update organization logo
CREATE OR REPLACE FUNCTION public.update_organization_logo(
  org_id UUID,
  new_logo_url TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the organization logo
  UPDATE public.organizations 
  SET logo_url = new_logo_url, updated_at = NOW()
  WHERE id = org_id;
  
  -- Return true if update was successful
  RETURN FOUND;
END;
$$;

-- 17. Grant execute permission on the update function
GRANT EXECUTE ON FUNCTION public.update_organization_logo(UUID, TEXT) TO authenticated;

-- 18. Create audit log entry for logo changes
CREATE OR REPLACE FUNCTION public.log_logo_change(
  org_id UUID,
  action TEXT,
  old_logo_url TEXT DEFAULT NULL,
  new_logo_url TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    type,
    message,
    actor,
    created_at
  ) VALUES (
    'update',
    format('Organization logo %s for organization %s', action, org_id),
    auth.uid(),
    NOW()
  );
END;
$$;

-- 19. Grant execute permission on the audit function
GRANT EXECUTE ON FUNCTION public.log_logo_change(UUID, TEXT, TEXT, TEXT) TO authenticated;

-- 20. Create trigger to log logo changes
CREATE OR REPLACE FUNCTION public.trigger_log_logo_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Log the logo change
  IF OLD.logo_url IS DISTINCT FROM NEW.logo_url THEN
    IF OLD.logo_url IS NULL AND NEW.logo_url IS NOT NULL THEN
      PERFORM public.log_logo_change(NEW.id, 'added', OLD.logo_url, NEW.logo_url);
    ELSIF OLD.logo_url IS NOT NULL AND NEW.logo_url IS NULL THEN
      PERFORM public.log_logo_change(NEW.id, 'removed', OLD.logo_url, NEW.logo_url);
    ELSE
      PERFORM public.log_logo_change(NEW.id, 'updated', OLD.logo_url, NEW.logo_url);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 21. Create the trigger
DROP TRIGGER IF EXISTS trigger_organization_logo_change ON public.organizations;
CREATE TRIGGER trigger_organization_logo_change
  AFTER UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_log_logo_change();

-- 22. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.organizations TO authenticated;
GRANT ALL ON public.audit_logs TO authenticated;

-- 23. Create a function to get all organizations with their logo status
CREATE OR REPLACE FUNCTION public.get_organizations_with_logo_status()
RETURNS TABLE(
  id UUID,
  name TEXT,
  description TEXT,
  sector TEXT,
  unit_code TEXT,
  logo_url TEXT,
  has_logo BOOLEAN,
  logo_file_size BIGINT,
  created_by TEXT,
  created_on TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.name,
    o.description,
    o.sector,
    o.unit_code,
    o.logo_url,
    CASE WHEN o.logo_url IS NOT NULL THEN true ELSE false END as has_logo,
    CASE 
      WHEN o.logo_url IS NOT NULL THEN 
        (SELECT COALESCE(metadata->>'size', '0')::BIGINT 
         FROM storage.objects 
         WHERE bucket_id = 'organization-logos' 
         AND name = split_part(o.logo_url, '/', -1))
      ELSE 0 
    END as logo_file_size,
    o.created_by,
    o.created_on,
    o.updated_at
  FROM public.organizations o
  ORDER BY o.name;
END;
$$;

-- 24. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_organizations_with_logo_status() TO authenticated;

-- 25. Final verification query
-- Run this to verify the setup is complete
SELECT 
  'Setup Complete' as status,
  COUNT(*) as organizations_count,
  COUNT(logo_url) as organizations_with_logos,
  COUNT(*) - COUNT(logo_url) as organizations_without_logos
FROM public.organizations;
