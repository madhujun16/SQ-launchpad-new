-- =====================================================
-- COMPLETE SOFTWARE & HARDWARE MANAGEMENT RESTRUCTURE
-- =====================================================
-- This migration removes the mapping table and updates both tables
-- to support dynamic category-based associations

-- Step 1: Check if software_hardware_mapping table exists and handle accordingly
DO $$ 
BEGIN
    -- Only drop constraints if the mapping table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'software_hardware_mapping') THEN
        -- Drop foreign key constraints that reference software_hardware_mapping
        ALTER TABLE public.site_hardware_scoping 
        DROP CONSTRAINT IF EXISTS site_hardware_scoping_hardware_item_id_fkey;

        ALTER TABLE public.hardware_request_items 
        DROP CONSTRAINT IF EXISTS hardware_request_items_hardware_item_id_fkey;

        -- Drop the software_hardware_mapping table completely
        DROP TABLE public.software_hardware_mapping CASCADE;
        
        RAISE NOTICE 'software_hardware_mapping table found and removed';
    ELSE
        RAISE NOTICE 'software_hardware_mapping table does not exist, skipping removal';
    END IF;
END $$;

-- Step 2: Recreate foreign key constraints
ALTER TABLE public.site_hardware_scoping 
ADD CONSTRAINT site_hardware_scoping_hardware_item_id_fkey 
FOREIGN KEY (hardware_item_id) REFERENCES public.hardware_items(id) ON DELETE CASCADE;

ALTER TABLE public.hardware_request_items 
ADD CONSTRAINT hardware_request_items_hardware_item_id_fkey 
FOREIGN KEY (hardware_item_id) REFERENCES public.hardware_items(id) ON DELETE CASCADE;

-- Step 3: Update RLS policies (remove mapping table policies if they exist)
DO $$ 
BEGIN
    -- Only drop policies if the mapping table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'software_hardware_mapping') THEN
        DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.software_hardware_mapping;
        DROP POLICY IF EXISTS "Enable insert for admins" ON public.software_hardware_mapping;
        DROP POLICY IF EXISTS "Enable update for admins" ON public.software_hardware_mapping;
        DROP POLICY IF EXISTS "Enable delete for admins" ON public.software_hardware_mapping;
        RAISE NOTICE 'Mapping table policies removed';
    ELSE
        RAISE NOTICE 'Mapping table policies do not exist, skipping removal';
    END IF;
END $$;

-- Step 4: Add comments for documentation
COMMENT ON TABLE public.hardware_items IS 'Platform-level hardware items for dynamic scoping based on software categories';
COMMENT ON TABLE public.software_modules IS 'Platform-level software modules that drive hardware category suggestions';

COMMENT ON COLUMN public.hardware_items.name IS 'Name of the hardware item';
COMMENT ON COLUMN public.hardware_items.category IS 'Category that matches software module categories for dynamic association';

COMMENT ON COLUMN public.software_modules.name IS 'Name of the software module';
COMMENT ON COLUMN public.software_modules.category IS 'Category used to dynamically suggest hardware items';

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hardware_items_category ON public.hardware_items(category);
CREATE INDEX IF NOT EXISTS idx_software_modules_category ON public.software_modules(category);

-- =====================================================
-- INSERT HARDWARE ITEMS DATA
-- =====================================================
INSERT INTO public.hardware_items (
    name,
    category,
    description,
    manufacturer,
    unit_cost,
    is_active
) VALUES 
    ('15.6" Kitchen Screen', 'Kitchen Display System (KDS)', 'High-resolution kitchen display screen for order management', 'ELO', 839.00, true),
    ('Printer with Cable', 'Kitchen Display System (KDS)', 'Thermal printer with connecting cable for kitchen orders', '', 199.00, true),
    ('Wall Mounting Kit (Fixed)', 'Kitchen Display System (KDS)', 'Fixed wall mounting kit for kitchen displays', '', 136.00, true),
    ('ELO Remote Support', 'Support & Sundries', 'Remote support service for ELO hardware', 'ELO', 259.00, true),
    ('Installation Engineer - Weekday', 'Support & Sundries', 'On-site installation service during weekdays', '', 500.00, true);

-- =====================================================
-- INSERT SOFTWARE MODULES DATA
-- =====================================================
INSERT INTO public.software_modules (
    name,
    category,
    description,
    license_fee,
    is_active
) VALUES 
    ('App Fee - Per Outlet', 'Kiosk', 'Application fee for each outlet using kiosk functionality', 720.00, true),
    ('Kiosk License (Per Kiosk)', 'Kiosk', 'License fee per kiosk installation', 360.00, true),
    ('POS License (Per Till)', 'POS Terminal', 'License fee per POS terminal/till', 350.00, true),
    ('KMS License (Per Tablet/Screen)', 'Kitchen Display System (KDS)', 'License fee per kitchen display screen', 300.00, true),
    ('TDS License (Per Screen)', 'Customer Display Screen (TDS)', 'License fee per customer-facing display screen', 120.00, true);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Check hardware_items table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'hardware_items' 
ORDER BY ordinal_position;

-- Check software_modules table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'software_modules' 
ORDER BY ordinal_position;

-- Verify data was inserted correctly
SELECT COUNT(*) as hardware_count FROM public.hardware_items;
SELECT COUNT(*) as software_count FROM public.software_modules;

-- Check that software_hardware_mapping table was removed
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'software_hardware_mapping'
) as mapping_table_exists;
