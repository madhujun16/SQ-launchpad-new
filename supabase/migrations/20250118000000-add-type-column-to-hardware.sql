-- Add type column to hardware_items table only
-- This migration adds a comprehensive type column for better categorization

-- Create enum for hardware/support types
CREATE TYPE public.hardware_support_type AS ENUM (
  'Display Screen',
  'Touch Screen',
  'Support',
  'POS Terminal',
  'Scanner',
  'Printer',
  'Tablet',
  'Accessories',
  'Connectivity',
  'Other'
);

-- Add type column to hardware_items table
ALTER TABLE public.hardware_items 
ADD COLUMN IF NOT EXISTS type public.hardware_support_type DEFAULT 'Other';

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_hardware_items_type ON public.hardware_items(type);

-- Add comment for documentation
COMMENT ON COLUMN public.hardware_items.type IS 'Type of hardware or support service';

-- Update existing hardware records to have appropriate types based on their category
UPDATE public.hardware_items 
SET type = CASE 
  WHEN category::text ILIKE '%kiosk%' THEN 'POS Terminal'::public.hardware_support_type
  WHEN category::text ILIKE '%kds%' OR category::text ILIKE '%kitchen%' THEN 'Display Screen'::public.hardware_support_type
  WHEN category::text ILIKE '%tds%' OR category::text ILIKE '%customer%' THEN 'Display Screen'::public.hardware_support_type
  WHEN category::text ILIKE '%pos%' OR category::text ILIKE '%terminal%' THEN 'POS Terminal'::public.hardware_support_type
  WHEN category::text ILIKE '%tablet%' OR category::text ILIKE '%ort%' THEN 'Tablet'::public.hardware_support_type
  WHEN category::text ILIKE '%accessories%' THEN 'Accessories'::public.hardware_support_type
  WHEN category::text ILIKE '%support%' THEN 'Support'::public.hardware_support_type
  WHEN category::text ILIKE '%connectivity%' THEN 'Connectivity'::public.hardware_support_type
  WHEN category::text ILIKE '%scanner%' THEN 'Scanner'::public.hardware_support_type
  WHEN category::text ILIKE '%printer%' THEN 'Printer'::public.hardware_support_type
  ELSE 'Other'::public.hardware_support_type
END
WHERE type IS NULL OR type = 'Other';
