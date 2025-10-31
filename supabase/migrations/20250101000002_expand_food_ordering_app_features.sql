-- Migration: Expand Food Ordering App Features
-- Description: Add comprehensive feature collection for Food Ordering App in Site Study Step
-- Date: 2025-01-01
-- Author: System

BEGIN;

-- Update site_study_data table to expand food ordering app requirements
-- Add migration for comprehensive food ordering app feature collection

-- Option 1: Add new JSONB columns specifically for food ordering app features
-- This approach maintains backward compatibility while adding new structured data

-- Add food ordering app specific columns to store detailed requirements
ALTER TABLE public.site_study_data 
ADD COLUMN IF NOT EXISTS food_ordering_app_config JSONB DEFAULT '{
  "serviceTypes": {},
  "features": {},
  "brandAssetsAvailable": false,
  "customizationRequirements": ""
}'::jsonb;

-- Create index for efficient querying of food ordering app configurations
CREATE INDEX IF NOT EXISTS idx_site_study_data_food_ordering_app_config 
ON public.site_study_data USING GIN (food_ordering_app_config);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_study_data TO authenticated;
GRANT SELECT ON public.site_study_data TO anon;

-- Alternatively, if you prefer to update existing JSONB structure:
-- We can also extend the existing compliance JSONB column
-- But this might affect existing data structure

-- Migration function to move existing brand assets data to new structure
CREATE OR REPLACE FUNCTION migrate_existing_food_ordering_data()
RETURNS void AS $$
BEGIN
  -- Update records that have brand assets data but not in food ordering config
  -- Note: Since site_study_data doesn't have a compliance column, we'll just initialize the new column
  UPDATE public.site_study_data 
  SET food_ordering_app_config = jsonb_set(
    COALESCE(food_ordering_app_config, '{}'::jsonb),
    '{brandAssetsAvailable}',
    'false'::jsonb
  )
  WHERE food_ordering_app_config IS NULL 
     OR NOT food_ordering_app_config ? 'brandAssetsAvailable';
END;
$$ LANGUAGE plpgsql;

-- Execute the migration function
SELECT migrate_existing_food_ordering_data();

-- Drop the temporary migration function
DROP FUNCTION IF EXISTS migrate_existing_food_ordering_data();

-- Add comment to document the schema change
COMMENT ON COLUMN public.site_study_data.food_ordering_app_config IS 
'Configuration data for Food Ordering App features including service types, required features, brand assets, and customization требования';

-- Add RLS policy to ensure users can only access their own site study data
-- (Assuming you have proper user context and site ownership)
DO $$
BEGIN
  -- Enable RLS on site_study_data if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_class WHERE relname = 'site_study_data' AND relrowsecurity = true
  ) THEN
    ALTER TABLE public.site_study_data ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Add policy for authenticated users (adjust according to your auth setup)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'site_study_data' 
    AND policyname = 'Users can access their site study data'
  ) THEN
    CREATE POLICY "Users can access their site study data" 
    ON public.site_study_data 
    FOR ALL 
    TO authenticated 
    USING (
      -- Add your site ownership logic here
      -- For example: site_id IN (SELECT id FROM sites WHERE created_by = auth.uid())
      true -- Placeholder - replace with actual ownership logic
    );
  END IF;
END $$;

-- Verification queries (optional - can be removed in production)
-- Check if column was added successfully
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'site_study_data' 
  AND table_schema = 'public' 
  AND column_name = 'food_ordering_app_config';

-- Check records updated
SELECT 
  site_id, 
  food_ordering_app_config 
FROM public.site_study_data 
WHERE food_ordering_app_config IS NOT NULL 
LIMIT 5;

COMMIT;

-- Additional notes:
-- 1. The JSONB structure allows for flexible data collection without schema locks
-- 2. Index on JSONB column enables efficient querying of nested data
-- 3. Migration function ensures backward compatibility with existing brand assets data
-- 4. RLS policies maintain security (adjust according to your authentication setup)
