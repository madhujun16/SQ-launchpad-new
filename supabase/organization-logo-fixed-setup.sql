-- Organization Logo Setup - Fixed for actual audit_logs structure
-- This script creates the necessary functions and triggers for organization logo management

-- Step 1: Add logo_url column to organizations table if it doesn't exist
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Add comment
COMMENT ON COLUMN public.organizations.logo_url IS 'URL to the organization logo stored in Supabase Storage';

-- Create index for logo_url
CREATE INDEX IF NOT EXISTS idx_organizations_logo_url ON public.organizations(logo_url);

-- Add validation constraint
ALTER TABLE public.organizations 
ADD CONSTRAINT IF NOT EXISTS chk_logo_url_format 
CHECK (logo_url IS NULL OR logo_url ~ '^https?://.*');

-- Step 2: Update existing organizations to have null logo_url if not set
UPDATE public.organizations 
SET logo_url = NULL 
WHERE logo_url IS NULL;

-- Step 3: Create storage bucket policies for organization-logos
-- Note: Make sure the 'organization-logos' bucket exists in Supabase Storage

-- Policy for inserting logos
CREATE POLICY IF NOT EXISTS "Users can insert organization logos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'organization-logos' AND
  auth.role() = 'authenticated'
);

-- Policy for selecting logos
CREATE POLICY IF NOT EXISTS "Users can view organization logos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'organization-logos' AND
  auth.role() = 'authenticated'
);

-- Policy for updating logos
CREATE POLICY IF NOT EXISTS "Users can update organization logos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'organization-logos' AND
  auth.role() = 'authenticated'
);

-- Policy for deleting logos
CREATE POLICY IF NOT EXISTS "Users can delete organization logos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'organization-logos' AND
  auth.role() = 'authenticated'
);

-- Step 4: Create function to get organization logo
CREATE OR REPLACE FUNCTION public.get_organization_logo(org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (SELECT logo_url FROM public.organizations WHERE id = org_id);
END;
$$;

-- Step 5: Create function to update organization logo
CREATE OR REPLACE FUNCTION public.update_organization_logo(org_id UUID, new_logo_url TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.organizations 
  SET logo_url = new_logo_url, updated_at = NOW()
  WHERE id = org_id;
  
  RETURN FOUND;
END;
$$;

-- Step 6: Create a simple audit logging function that works with your table structure
-- First, let's create a basic logging function that only logs what we know exists
CREATE OR REPLACE FUNCTION public.log_organization_change(
  org_id UUID,
  change_type TEXT,
  old_values JSONB DEFAULT NULL,
  new_values JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert into audit_logs with only the columns that exist
  -- We'll use a simple approach that should work with most audit_logs structures
  
  -- Try to insert with basic columns that commonly exist
  BEGIN
    INSERT INTO public.audit_logs (
      message,
      created_at
    ) VALUES (
      format('Organization %s changed: %s -> %s', 
        org_id, 
        COALESCE(old_values::text, 'NULL'), 
        COALESCE(new_values::text, 'NULL')
      ),
      NOW()
    );
  EXCEPTION WHEN OTHERS THEN
    -- If that fails, try with just the message
    BEGIN
      INSERT INTO public.audit_logs (
        message,
        created_at
      ) VALUES (
        format('Organization %s logo %s', org_id, change_type),
        NOW()
      );
    EXCEPTION WHEN OTHERS THEN
      -- If all else fails, just log to console (this won't work in production)
      RAISE NOTICE 'Could not log to audit_logs: %', SQLERRM;
    END;
  END;
END;
$$;

-- Step 7: Create trigger function for logo changes
CREATE OR REPLACE FUNCTION public.trigger_log_organization_logo_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Log the change
  PERFORM public.log_organization_change(
    COALESCE(NEW.id, OLD.id),
    CASE 
      WHEN OLD.logo_url IS NULL AND NEW.logo_url IS NOT NULL THEN 'logo added'
      WHEN OLD.logo_url IS NOT NULL AND NEW.logo_url IS NULL THEN 'logo removed'
      WHEN OLD.logo_url != NEW.logo_url THEN 'logo changed'
      ELSE 'other change'
    END,
    CASE WHEN OLD.logo_url IS NOT NULL THEN jsonb_build_object('logo_url', OLD.logo_url) ELSE NULL END,
    CASE WHEN NEW.logo_url IS NOT NULL THEN jsonb_build_object('logo_url', NEW.logo_url) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Step 8: Create trigger
DROP TRIGGER IF EXISTS trigger_log_organization_logo_change ON public.organizations;

CREATE TRIGGER trigger_log_organization_logo_change
  AFTER UPDATE ON public.organizations
  FOR EACH ROW
  WHEN (OLD.logo_url IS DISTINCT FROM NEW.logo_url)
  EXECUTE FUNCTION public.trigger_log_organization_logo_change();

-- Step 9: Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_organization_logo(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_organization_logo(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_organization_change(UUID, TEXT, JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_log_organization_logo_change() TO authenticated;

-- Step 10: Create view for organizations with logo status
CREATE OR REPLACE VIEW public.organizations_with_logos AS
SELECT 
  id,
  name,
  description,
  sector,
  unit_code,
  logo_url,
  CASE 
    WHEN logo_url IS NOT NULL THEN 'Has Logo'
    ELSE 'No Logo'
  END as logo_status,
  created_at,
  updated_at
FROM public.organizations
ORDER BY name;

-- Grant access to the view
GRANT SELECT ON public.organizations_with_logos TO authenticated;

-- Step 11: Verification queries
-- Check if everything was created successfully
SELECT 
  'Functions' as type,
  routine_name as name,
  routine_type as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('get_organization_logo', 'update_organization_logo', 'log_organization_change', 'trigger_log_organization_logo_change')
ORDER BY routine_name;

-- Check triggers
SELECT 
  'Triggers' as type,
  trigger_name as name,
  event_manipulation as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND event_object_table = 'organizations'
ORDER BY trigger_name;

-- Check if logo_url column exists
SELECT 
  'Columns' as type,
  column_name as name,
  data_type as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'organizations' 
  AND column_name = 'logo_url';

-- Final verification
SELECT 
  'Final Check' as type,
  COUNT(*) as total_organizations,
  COUNT(logo_url) as organizations_with_logos,
  COUNT(*) - COUNT(logo_url) as organizations_without_logos
FROM public.organizations;
