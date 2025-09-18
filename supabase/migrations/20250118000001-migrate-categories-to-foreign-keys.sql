-- Migrate hardware_items and software_modules to use category_id foreign keys
-- This migration changes from enum-based categories to foreign key relationships

-- Step 1: Add category_id columns to both tables
ALTER TABLE public.hardware_items 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id);

ALTER TABLE public.software_modules 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id);

-- Step 2: Update hardware_items to map enum values to category_id
-- Using existing categories from the categories table
UPDATE public.hardware_items 
SET category_id = (
  SELECT id FROM public.categories 
  WHERE name = CASE 
    WHEN category::text = 'Kiosk' THEN 'Kiosk'
    WHEN category::text = 'Kitchen Display System (KDS)' THEN 'Kitchen Display (KDS)'
    WHEN category::text = 'Customer Display Screen (TDS)' THEN 'Kitchen Display (KDS)'
    WHEN category::text = 'POS Terminal' THEN 'POS'
    WHEN category::text = 'ORT Tablet' THEN 'Kitchen Display (KDS)'
    WHEN category::text = 'Accessories' THEN 'Inventory'
    WHEN category::text = 'Support & Sundries' THEN 'Inventory'
    WHEN category::text = 'Connectivity' THEN 'Inventory'
    WHEN category::text = 'Deployment' THEN 'Inventory'
    WHEN category::text = 'License Fees' THEN 'Food Ordering App'
    ELSE 'Inventory' -- Default fallback to Inventory
  END
);

-- Step 3: Update software_modules to map category strings to category_id
UPDATE public.software_modules 
SET category_id = (
  SELECT id FROM public.categories 
  WHERE name = CASE 
    WHEN category = 'Kiosk' THEN 'Kiosk'
    WHEN category = 'Kitchen Display System (KDS)' THEN 'Kitchen Display (KDS)'
    WHEN category = 'Customer Display Screen (TDS)' THEN 'Kitchen Display (KDS)'
    WHEN category = 'POS Terminal' THEN 'POS'
    WHEN category = 'ORT Tablet' THEN 'Kitchen Display (KDS)'
    WHEN category = 'Accessories' THEN 'Inventory'
    WHEN category = 'Support & Sundries' THEN 'Inventory'
    WHEN category = 'Connectivity' THEN 'Inventory'
    WHEN category = 'Deployment' THEN 'Inventory'
    WHEN category = 'License Fees' THEN 'Food Ordering App'
    ELSE 'Inventory' -- Default fallback to Inventory
  END
);

-- Step 4: Make category_id NOT NULL and drop old category columns
ALTER TABLE public.hardware_items 
ALTER COLUMN category_id SET NOT NULL;

ALTER TABLE public.software_modules 
ALTER COLUMN category_id SET NOT NULL;

-- Drop the old category columns
ALTER TABLE public.hardware_items 
DROP COLUMN IF EXISTS category;

ALTER TABLE public.software_modules 
DROP COLUMN IF EXISTS category;

-- Step 5: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hardware_items_category_id ON public.hardware_items(category_id);
CREATE INDEX IF NOT EXISTS idx_software_modules_category_id ON public.software_modules(category_id);

-- Step 6: Add comments for documentation
COMMENT ON COLUMN public.hardware_items.category_id IS 'Foreign key reference to categories table';
COMMENT ON COLUMN public.software_modules.category_id IS 'Foreign key reference to categories table';

-- Step 7: Update RLS policies if needed (they should still work with the new structure)
-- The existing policies should continue to work since we're just changing the column structure
