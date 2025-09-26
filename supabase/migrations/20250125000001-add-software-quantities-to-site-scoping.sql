-- Add software_quantities column to site_scoping table
ALTER TABLE public.site_scoping 
ADD COLUMN IF NOT EXISTS software_quantities JSONB DEFAULT '{}'::jsonb;

-- Add comment to explain the column
COMMENT ON COLUMN public.site_scoping.software_quantities IS 'Stores quantities for each selected software module as JSONB object with software_id as key and quantity as value';
