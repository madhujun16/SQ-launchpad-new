-- Fix RLS policies for Platform Config tables (without inserting duplicate data)
-- This migration only fixes the security policies that might be blocking access

-- ==============================================
-- 1. FIX CATEGORIES TABLE RLS POLICIES
-- ==============================================

-- Enable RLS on categories table if not already enabled
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to read categories" ON public.categories;
DROP POLICY IF EXISTS "Allow admin users to insert categories" ON public.categories;
DROP POLICY IF EXISTS "Allow admin users to update categories" ON public.categories;
DROP POLICY IF EXISTS "Allow admin users to delete categories" ON public.categories;
DROP POLICY IF EXISTS "categories_read_active" ON public.categories;
DROP POLICY IF EXISTS "categories_admin_all" ON public.categories;

-- Create new secure policies for categories
-- Allow all authenticated users to read active categories
CREATE POLICY "categories_read_active" ON public.categories
FOR SELECT 
TO authenticated
USING (is_active = true);

-- Allow admins to manage all categories
CREATE POLICY "categories_admin_all" ON public.categories
FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================
-- 2. FIX SOFTWARE_MODULES TABLE RLS POLICIES
-- ==============================================

-- Enable RLS on software_modules table if not already enabled
ALTER TABLE public.software_modules ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage software modules" ON public.software_modules;
DROP POLICY IF EXISTS "Users can view active software modules" ON public.software_modules;
DROP POLICY IF EXISTS "Allow admin users to insert software modules" ON public.software_modules;
DROP POLICY IF EXISTS "Allow admin users to update software modules" ON public.software_modules;
DROP POLICY IF EXISTS "Allow admin users to delete software modules" ON public.software_modules;
DROP POLICY IF EXISTS "software_modules_read_active" ON public.software_modules;
DROP POLICY IF EXISTS "software_modules_admin_all" ON public.software_modules;

-- Create new secure policies for software_modules
-- Allow all authenticated users to read active software modules
CREATE POLICY "software_modules_read_active" ON public.software_modules
FOR SELECT 
TO authenticated
USING (is_active = true);

-- Allow admins to manage all software modules
CREATE POLICY "software_modules_admin_all" ON public.software_modules
FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================
-- 3. FIX HARDWARE_ITEMS TABLE RLS POLICIES
-- ==============================================

-- Enable RLS on hardware_items table if not already enabled
ALTER TABLE public.hardware_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage hardware items" ON public.hardware_items;
DROP POLICY IF EXISTS "Users can view available hardware items" ON public.hardware_items;
DROP POLICY IF EXISTS "Allow admin users to insert hardware items" ON public.hardware_items;
DROP POLICY IF EXISTS "Allow admin users to update hardware items" ON public.hardware_items;
DROP POLICY IF EXISTS "Allow admin users to delete hardware items" ON public.hardware_items;
DROP POLICY IF EXISTS "hardware_items_read_active" ON public.hardware_items;
DROP POLICY IF EXISTS "hardware_items_admin_all" ON public.hardware_items;

-- Create new secure policies for hardware_items
-- Allow all authenticated users to read active hardware items
CREATE POLICY "hardware_items_read_active" ON public.hardware_items
FOR SELECT 
TO authenticated
USING (is_active = true);

-- Allow admins to manage all hardware items
CREATE POLICY "hardware_items_admin_all" ON public.hardware_items
FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================
-- 4. VERIFICATION
-- ==============================================

-- Check that RLS is enabled on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('categories', 'software_modules', 'hardware_items')
ORDER BY tablename;

-- Check that policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename IN ('categories', 'software_modules', 'hardware_items')
ORDER BY tablename, policyname;

-- Test that categories can be read by authenticated users
SELECT 'Categories table accessible' as test_result, COUNT(*) as category_count
FROM public.categories 
WHERE is_active = true;
