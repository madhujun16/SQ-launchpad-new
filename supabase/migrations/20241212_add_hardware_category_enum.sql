-- Create hardware category enum
CREATE TYPE public.hardware_category AS ENUM (
  'KIOSKS',
  'KDS_SCREENS',
  'POS_TILLS', 
  'TDS_SCREENS',
  'TABLETS_DBFB'
);

-- Add a new column with the enum type
ALTER TABLE public.hardware_items 
ADD COLUMN category_enum public.hardware_category;

-- Update existing records based on current category values
UPDATE public.hardware_items 
SET category_enum = CASE 
  WHEN LOWER(category) LIKE '%kiosk%' THEN 'KIOSKS'::public.hardware_category
  WHEN LOWER(category) LIKE '%kds%' OR LOWER(category) LIKE '%screen%' THEN 'KDS_SCREENS'::public.hardware_category
  WHEN LOWER(category) LIKE '%pos%' OR LOWER(category) LIKE '%till%' THEN 'POS_TILLS'::public.hardware_category
  WHEN LOWER(category) LIKE '%tds%' THEN 'TDS_SCREENS'::public.hardware_category
  WHEN LOWER(category) LIKE '%tablet%' OR LOWER(category) LIKE '%dbfb%' THEN 'TABLETS_DBFB'::public.hardware_category
  ELSE 'KIOSKS'::public.hardware_category
END;

-- Make the new column NOT NULL
ALTER TABLE public.hardware_items 
ALTER COLUMN category_enum SET NOT NULL;

-- Drop the old category column
ALTER TABLE public.hardware_items 
DROP COLUMN category;

-- Rename the new column to category
ALTER TABLE public.hardware_items 
RENAME COLUMN category_enum TO category;

-- Add a comment to document the enum values
COMMENT ON TYPE public.hardware_category IS 'Hardware categories: KIOSKS, KDS_SCREENS (KDS Screens), POS_TILLS (POS Tills), TDS_SCREENS (TDS Screens), TABLETS_DBFB (Tablets DBFB)';
