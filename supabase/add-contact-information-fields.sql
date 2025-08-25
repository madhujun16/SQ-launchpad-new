-- Add contact information fields to sites table
-- This script should be run in Supabase SQL editor

-- Add contact information fields
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS unit_manager_name VARCHAR(255);
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS job_title VARCHAR(255);
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS unit_manager_email VARCHAR(255);
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS unit_manager_mobile VARCHAR(50);
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS additional_contact_name VARCHAR(255);
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS additional_contact_email VARCHAR(255);

-- Add location fields
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS postcode VARCHAR(20);
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS region VARCHAR(100);
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS country VARCHAR(100);

-- Add comments for documentation
COMMENT ON COLUMN public.sites.unit_manager_name IS 'Name of the unit manager';
COMMENT ON COLUMN public.sites.job_title IS 'Job title of the unit manager';
COMMENT ON COLUMN public.sites.unit_manager_email IS 'Email of the unit manager';
COMMENT ON COLUMN public.sites.unit_manager_mobile IS 'Mobile number of the unit manager';
COMMENT ON COLUMN public.sites.additional_contact_name IS 'Name of additional contact person';
COMMENT ON COLUMN public.sites.additional_contact_email IS 'Email of additional contact person';
COMMENT ON COLUMN public.sites.latitude IS 'Latitude coordinate of the site';
COMMENT ON COLUMN public.sites.longitude IS 'Longitude coordinate of the site';
COMMENT ON COLUMN public.sites.postcode IS 'Postcode of the site';
COMMENT ON COLUMN public.sites.region IS 'Region of the site';
COMMENT ON COLUMN public.sites.country IS 'Country of the site';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sites_unit_manager_email ON public.sites(unit_manager_email);
CREATE INDEX IF NOT EXISTS idx_sites_postcode ON public.sites(postcode);
CREATE INDEX IF NOT EXISTS idx_sites_region ON public.sites(region);

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'sites' 
  AND column_name IN (
    'unit_manager_name', 'job_title', 'unit_manager_email', 'unit_manager_mobile',
    'additional_contact_name', 'additional_contact_email',
    'latitude', 'longitude', 'postcode', 'region', 'country'
  )
ORDER BY column_name;
