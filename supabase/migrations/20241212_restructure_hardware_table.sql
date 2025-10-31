-- Hardware Management Table Restructure Migration
-- This migration updates the hardware_items table to match the new form structure

-- First, create new enums for the dropdown options
CREATE TYPE public.hardware_category_new AS ENUM (
  'Kiosk',
  'Kitchen Display System (KDS)',
  'Customer Display Screen (TDS)',
  'POS Terminal',
  'ORT Tablet',
  'Accessories',
  'Support & Sundries',
  'Connectivity',
  'Deployment',
  'License Fees'
);

CREATE TYPE public.hardware_subcategory AS ENUM (
  'Wall Mounted',
  'Floor Mounted',
  'Desk Mounted',
  'Free Standing',
  'Fixed',
  'Remote Support',
  'On-site Support',
  'Other'
);

CREATE TYPE public.support_type AS ENUM (
  'None',
  'On-site',
  'Remote'
);

-- Create a backup of existing data
CREATE TABLE public.hardware_items_backup AS 
SELECT * FROM public.hardware_items;

-- Drop existing foreign key constraints that reference hardware_items
ALTER TABLE public.software_hardware_mapping 
DROP CONSTRAINT IF EXISTS software_hardware_mapping_hardware_item_id_fkey;

ALTER TABLE public.site_hardware_scoping 
DROP CONSTRAINT IF EXISTS site_hardware_scoping_hardware_item_id_fkey;

ALTER TABLE public.hardware_request_items 
DROP CONSTRAINT IF EXISTS hardware_request_items_hardware_item_id_fkey;

-- Drop the existing hardware_items table
DROP TABLE IF EXISTS public.hardware_items CASCADE;

-- Create the new hardware_items table with updated structure
CREATE TABLE public.hardware_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hardware_name TEXT NOT NULL,
  category public.hardware_category_new NOT NULL,
  subcategory public.hardware_subcategory,
  manufacturer TEXT,
  configuration_notes TEXT,
  unit_cost DECIMAL(10,2),
  quantity INTEGER DEFAULT 1,
  total_cost DECIMAL(10,2),
  support_type public.support_type DEFAULT 'None',
  support_cost DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES public.profiles(user_id),
  updated_by UUID REFERENCES public.profiles(user_id)
);

-- Enable RLS
ALTER TABLE public.hardware_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view hardware items" 
ON public.hardware_items 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Admins can insert hardware items" 
ON public.hardware_items 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update hardware items" 
ON public.hardware_items 
FOR UPDATE 
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can delete hardware items" 
ON public.hardware_items 
FOR DELETE 
TO authenticated
USING (public.is_admin());

-- Recreate foreign key constraints
ALTER TABLE public.software_hardware_mapping 
ADD CONSTRAINT software_hardware_mapping_hardware_item_id_fkey 
FOREIGN KEY (hardware_item_id) REFERENCES public.hardware_items(id) ON DELETE CASCADE;

ALTER TABLE public.site_hardware_scoping 
ADD CONSTRAINT site_hardware_scoping_hardware_item_id_fkey 
FOREIGN KEY (hardware_item_id) REFERENCES public.hardware_items(id) ON DELETE CASCADE;

ALTER TABLE public.hardware_request_items 
ADD CONSTRAINT hardware_request_items_hardware_item_id_fkey 
FOREIGN KEY (hardware_item_id) REFERENCES public.hardware_items(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_hardware_items_category ON public.hardware_items(category);
CREATE INDEX idx_hardware_items_subcategory ON public.hardware_items(subcategory);
CREATE INDEX idx_hardware_items_manufacturer ON public.hardware_items(manufacturer);
CREATE INDEX idx_hardware_items_is_active ON public.hardware_items(is_active);

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_hardware_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_hardware_items_updated_at
BEFORE UPDATE ON public.hardware_items
FOR EACH ROW
EXECUTE FUNCTION public.update_hardware_items_updated_at();

-- Migrate data from backup (if any exists)
-- This will attempt to map old data to new structure
INSERT INTO public.hardware_items (
  hardware_name,
  category,
  subcategory,
  manufacturer,
  configuration_notes,
  unit_cost,
  quantity,
  total_cost,
  support_type,
  support_cost,
  is_active,
  created_at,
  updated_at
)
SELECT 
  COALESCE(name, 'Unknown Hardware') as hardware_name,
  CASE 
    WHEN LOWER(COALESCE(category, '')) LIKE '%kiosk%' THEN 'Kiosk'::public.hardware_category_new
    WHEN LOWER(COALESCE(category, '')) LIKE '%kds%' OR LOWER(COALESCE(category, '')) LIKE '%kitchen%' THEN 'Kitchen Display System (KDS)'::public.hardware_category_new
    WHEN LOWER(COALESCE(category, '')) LIKE '%tds%' OR LOWER(COALESCE(category, '')) LIKE '%customer%' THEN 'Customer Display Screen (TDS)'::public.hardware_category_new
    WHEN LOWER(COALESCE(category, '')) LIKE '%pos%' OR LOWER(COALESCE(category, '')) LIKE '%till%' THEN 'POS Terminal'::public.hardware_category_new
    WHEN LOWER(COALESCE(category, '')) LIKE '%tablet%' OR LOWER(COALESCE(category, '')) LIKE '%ort%' THEN 'ORT Tablet'::public.hardware_category_new
    WHEN LOWER(COALESCE(category, '')) LIKE '%accessor%' THEN 'Accessories'::public.hardware_category_new
    WHEN LOWER(COALESCE(category, '')) LIKE '%support%' THEN 'Support & Sundries'::public.hardware_category_new
    WHEN LOWER(COALESCE(category, '')) LIKE '%connect%' THEN 'Connectivity'::public.hardware_category_new
    WHEN LOWER(COALESCE(category, '')) LIKE '%deploy%' THEN 'Deployment'::public.hardware_category_new
    WHEN LOWER(COALESCE(category, '')) LIKE '%license%' THEN 'License Fees'::public.hardware_category_new
    ELSE 'Accessories'::public.hardware_category_new
  END as category,
  'Other'::public.hardware_subcategory as subcategory,
  manufacturer,
  description as configuration_notes,
  COALESCE(unit_cost, 0) as unit_cost,
  1 as quantity,
  COALESCE(unit_cost, 0) as total_cost,
  'None'::public.support_type as support_type,
  0 as support_cost,
  COALESCE(is_active, true) as is_active,
  COALESCE(created_at, now()) as created_at,
  COALESCE(updated_at, now()) as updated_at
FROM public.hardware_items_backup
WHERE EXISTS (SELECT 1 FROM public.hardware_items_backup);

-- Drop the backup table
DROP TABLE public.hardware_items_backup;

-- Drop old enum types
DROP TYPE IF EXISTS public.hardware_category CASCADE;

-- Add comments for documentation
COMMENT ON TABLE public.hardware_items IS 'Hardware items with detailed categorization and cost tracking';
COMMENT ON COLUMN public.hardware_items.hardware_name IS 'Name of the hardware item';
COMMENT ON COLUMN public.hardware_items.category IS 'Primary category of the hardware';
COMMENT ON COLUMN public.hardware_items.subcategory IS 'Subcategory for mounting/support type';
COMMENT ON COLUMN public.hardware_items.manufacturer IS 'Hardware manufacturer';
COMMENT ON COLUMN public.hardware_items.configuration_notes IS 'Configuration and setup notes';
COMMENT ON COLUMN public.hardware_items.unit_cost IS 'Cost per unit in GBP';
COMMENT ON COLUMN public.hardware_items.quantity IS 'Default quantity';
COMMENT ON COLUMN public.hardware_items.total_cost IS 'Total cost (unit_cost * quantity)';
COMMENT ON COLUMN public.hardware_items.support_type IS 'Type of support provided';
COMMENT ON COLUMN public.hardware_items.support_cost IS 'Cost of support in GBP';
