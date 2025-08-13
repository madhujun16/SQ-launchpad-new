-- Add site notes and stakeholders to site_studies table
-- Run this script manually in your Supabase SQL editor

-- Add new columns to site_studies table
ALTER TABLE public.site_studies 
ADD COLUMN IF NOT EXISTS site_notes TEXT,
ADD COLUMN IF NOT EXISTS additional_site_details TEXT,
ADD COLUMN IF NOT EXISTS stakeholders JSONB DEFAULT '[]';

-- Add comment to explain the stakeholders JSONB structure
COMMENT ON COLUMN public.site_studies.stakeholders IS 'Array of stakeholder objects with name, role, email, and phone fields';

-- Create an index on stakeholders for better query performance
CREATE INDEX IF NOT EXISTS idx_site_studies_stakeholders ON public.site_studies USING GIN (stakeholders);

-- Add some sample data for existing site studies (optional)
-- This will populate the new columns with default values for existing records
UPDATE public.site_studies 
SET 
  site_notes = 'Site study completed. Additional notes to be added.',
  additional_site_details = 'Standard site setup with typical requirements.',
  stakeholders = '[]'::jsonb
WHERE site_notes IS NULL;

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'site_studies' 
  AND column_name IN ('site_notes', 'additional_site_details', 'stakeholders')
ORDER BY column_name;
