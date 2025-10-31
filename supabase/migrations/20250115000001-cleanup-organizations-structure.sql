-- Clean up organizations table structure
-- Remove redundant columns and ensure proper structure

-- Drop the redundant view if it exists
DROP VIEW IF EXISTS public.organizations_with_logos;

-- Clean up the organizations table structure
-- Remove redundant columns that are not needed
ALTER TABLE public.organizations 
DROP COLUMN IF EXISTS org_name;

-- Ensure proper constraints and indexes
-- The table should have these columns:
-- id, name, sector, logo_url, description, created_at, updated_at, 
-- unit_code, created_on, created_by, is_archived, archived_at, archive_reason

-- Add any missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_organizations_name ON public.organizations(name);
CREATE INDEX IF NOT EXISTS idx_organizations_unit_code ON public.organizations(unit_code);

-- Ensure the logo_url constraint is properly formatted
-- The existing constraint should already handle this, but let's make sure
ALTER TABLE public.organizations 
DROP CONSTRAINT IF EXISTS check_logo_url_format;

ALTER TABLE public.organizations 
ADD CONSTRAINT check_logo_url_format 
CHECK (
  logo_url IS NULL OR 
  logo_url ~ '^https?://.*' OR
  logo_url ~ '^data:image/.*'
);

-- Add comment to document the table structure
COMMENT ON TABLE public.organizations IS 'Main organizations table with logo support';
COMMENT ON COLUMN public.organizations.logo_url IS 'URL or data URL for organization logo';
COMMENT ON COLUMN public.organizations.is_archived IS 'Whether the organization is archived';
COMMENT ON COLUMN public.organizations.archived_at IS 'Timestamp when organization was archived';
COMMENT ON COLUMN public.organizations.archive_reason IS 'Reason for archiving the organization';
