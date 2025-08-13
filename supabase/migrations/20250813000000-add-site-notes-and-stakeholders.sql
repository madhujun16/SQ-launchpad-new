-- Migration: Add site notes and stakeholders to site_studies table
-- Date: 2025-08-13

-- Add new columns to site_studies table
ALTER TABLE public.site_studies 
ADD COLUMN IF NOT EXISTS site_notes TEXT,
ADD COLUMN IF NOT EXISTS additional_site_details TEXT,
ADD COLUMN IF NOT EXISTS stakeholders JSONB DEFAULT '[]';

-- Add comment to explain the stakeholders JSONB structure
COMMENT ON COLUMN public.site_studies.stakeholders IS 'Array of stakeholder objects with name, role, email, and phone fields';

-- Create a function to validate stakeholder data structure
CREATE OR REPLACE FUNCTION public.validate_stakeholder_data(stakeholders_data JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if stakeholders_data is an array
  IF NOT (jsonb_typeof(stakeholders_data) = 'array') THEN
    RETURN FALSE;
  END IF;
  
  -- Validate each stakeholder object
  FOR i IN 0..jsonb_array_length(stakeholders_data) - 1 LOOP
    DECLARE
      stakeholder JSONB;
      required_fields TEXT[] := ARRAY['name', 'role', 'email', 'phone'];
      field TEXT;
    BEGIN
      stakeholder := stakeholders_data->i;
      
      -- Check if all required fields exist
      FOREACH field IN ARRAY required_fields LOOP
        IF NOT (stakeholder ? field) THEN
          RETURN FALSE;
        END IF;
        
        -- Check if field values are not null or empty
        IF stakeholder->>field IS NULL OR stakeholder->>field = '' THEN
          RETURN FALSE;
        END IF;
      END LOOP;
      
      -- Validate email format (basic validation)
      IF stakeholder->>'email' !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RETURN FALSE;
      END IF;
      
      -- Validate phone format (basic validation - allows various formats)
      IF stakeholder->>'phone' !~ '^[\+]?[0-9\s\-\(\)]{7,}$' THEN
        RETURN FALSE;
      END IF;
    END;
  END LOOP;
  
  RETURN TRUE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.validate_stakeholder_data(JSONB) TO authenticated;

-- Create a trigger to validate stakeholder data before insert/update
CREATE OR REPLACE FUNCTION public.validate_stakeholders_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only validate if stakeholders column is being updated
  IF NEW.stakeholders IS NOT NULL AND NEW.stakeholders != OLD.stakeholders THEN
    IF NOT public.validate_stakeholder_data(NEW.stakeholders) THEN
      RAISE EXCEPTION 'Invalid stakeholder data format. Each stakeholder must have name, role, email, and phone fields with valid values.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS validate_stakeholders_trigger ON public.site_studies;
CREATE TRIGGER validate_stakeholders_trigger
  BEFORE INSERT OR UPDATE ON public.site_studies
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_stakeholders_trigger();

-- Update the existing RLS policies to include the new fields
-- (The existing policies will automatically apply to the new columns)

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
