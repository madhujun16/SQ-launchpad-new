-- Add archive fields to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS archive_reason TEXT;

-- Add index for better performance when filtering archived organizations
CREATE INDEX IF NOT EXISTS idx_organizations_is_archived ON public.organizations(is_archived);

-- Add comment to document the new fields
COMMENT ON COLUMN public.organizations.is_archived IS 'Whether the organization is archived';
COMMENT ON COLUMN public.organizations.archived_at IS 'Timestamp when the organization was archived';
COMMENT ON COLUMN public.organizations.archive_reason IS 'Reason for archiving the organization';
