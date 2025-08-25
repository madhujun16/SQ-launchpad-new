-- Add missing fields to sites table for site creation form
-- This script should be run in Supabase SQL editor

-- Add sector field
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS sector VARCHAR(100);

-- Add unit_code field
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS unit_code VARCHAR(50);

-- Add criticality_level field
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS criticality_level TEXT DEFAULT 'medium' CHECK (criticality_level IN ('low', 'medium', 'high'));

-- Add team_assignment field
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS team_assignment VARCHAR(255);

-- Add stakeholders field (store as JSONB for flexibility)
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS stakeholders JSONB DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN public.sites.sector IS 'Business sector of the site (e.g., RA, Healthcare, Manufacturing)';
COMMENT ON COLUMN public.sites.unit_code IS 'Unique unit code for the site (e.g., PB001)';
COMMENT ON COLUMN public.sites.criticality_level IS 'Criticality level of the site (low, medium, high)';
COMMENT ON COLUMN public.sites.team_assignment IS 'Team assigned to the site';
COMMENT ON COLUMN public.sites.stakeholders IS 'JSON array of stakeholder information';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sites_sector ON public.sites(sector);
CREATE INDEX IF NOT EXISTS idx_sites_unit_code ON public.sites(unit_code);
CREATE INDEX IF NOT EXISTS idx_sites_criticality_level ON public.sites(criticality_level);

-- Update RLS policies if needed (assuming you have RLS enabled)
-- This ensures the new fields are accessible according to your existing policies

-- Example: If you need to update existing sites with default values
-- UPDATE public.sites SET 
--   sector = 'Unknown' WHERE sector IS NULL,
--   unit_code = 'UC' || id::text WHERE unit_code IS NULL,
--   criticality_level = 'medium' WHERE criticality_level IS NULL,
--   team_assignment = 'Unassigned' WHERE team_assignment IS NULL;

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'sites' 
  AND column_name IN ('sector', 'unit_code', 'criticality_level', 'team_assignment', 'stakeholders')
ORDER BY column_name;
