-- Add archiving fields to sites table to match organizations table structure
-- This allows sites to be archived independently of their organizations

-- Add archiving columns to sites table
ALTER TABLE public.sites 
ADD COLUMN is_archived boolean DEFAULT false,
ADD COLUMN archived_at timestamp with time zone,
ADD COLUMN archive_reason text;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_sites_is_archived ON public.sites USING btree (is_archived);

-- Add comment to document the new columns
COMMENT ON COLUMN public.sites.is_archived IS 'Whether the site has been archived';
COMMENT ON COLUMN public.sites.archived_at IS 'Timestamp when the site was archived';
COMMENT ON COLUMN public.sites.archive_reason IS 'Reason for archiving the site';

-- Update existing sites to have is_archived = false (active)
UPDATE public.sites SET is_archived = false WHERE is_archived IS NULL;
