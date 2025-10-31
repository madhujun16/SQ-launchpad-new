-- Fix RLS policies for Platform Config tables
-- This migration ensures that the security fixes don't break platform config functionality

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
-- 4. ENSURE TABLES EXIST WITH PROPER STRUCTURE
-- ==============================================

-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create software_modules table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.software_modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  monthly_fee DECIMAL(10,2) DEFAULT 0,
  setup_fee DECIMAL(10,2) DEFAULT 0,
  license_fee DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hardware_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.hardware_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  manufacturer VARCHAR(255),
  model VARCHAR(255),
  unit_cost DECIMAL(10,2) DEFAULT 0,
  installation_cost DECIMAL(10,2) DEFAULT 0,
  maintenance_cost DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 5. INSERT DEFAULT DATA IF TABLES ARE EMPTY
-- ==============================================

-- Insert default categories if none exist
INSERT INTO public.categories (name, description) VALUES
  ('POS', 'Point of Sale systems for transactions'),
  ('Kiosk', 'Self-service kiosk interfaces'),
  ('Kitchen Display (KDS)', 'Kitchen order management systems'),
  ('Inventory', 'Stock tracking and management systems'),
  ('Customer Management', 'Customer data and loyalty programs'),
  ('Analytics', 'Business intelligence and reporting'),
  ('Integration', 'Third-party system connections'),
  ('Security', 'Data protection and compliance tools')
ON CONFLICT (name) DO NOTHING;

-- Insert default software modules if none exist
INSERT INTO public.software_modules (name, description, category, monthly_fee, setup_fee) VALUES
  ('POS System', 'Point of Sale system for transactions', 'POS', 25, 150),
  ('Kiosk Software', 'Self-service kiosk interface', 'Kiosk', 15, 100),
  ('Kitchen Display', 'Kitchen order management system', 'Kitchen Display (KDS)', 20, 120),
  ('Inventory Management', 'Stock tracking and management', 'Inventory', 30, 200),
  ('Customer Portal', 'Customer management and loyalty', 'Customer Management', 20, 150),
  ('Analytics Dashboard', 'Business intelligence and reporting', 'Analytics', 35, 250),
  ('API Integration', 'Third-party system connections', 'Integration', 40, 300),
  ('Security Suite', 'Data protection and compliance', 'Security', 45, 350)
ON CONFLICT (name) DO NOTHING;

-- Insert default hardware items if none exist
INSERT INTO public.hardware_items (name, description, category, manufacturer, unit_cost) VALUES
  ('POS Terminal', 'Ingenico Telium 2 POS terminal', 'POS', 'Ingenico', 450),
  ('Barcode Scanner', 'Wireless barcode scanner', 'POS', 'Honeywell', 120),
  ('Cash Drawer', 'Electronic cash drawer for POS', 'POS', 'APG', 180),
  ('Kiosk Terminal', 'Self-service kiosk with touch screen', 'Kiosk', 'Elo', 800),
  ('Touch Screen Display', '15-inch touch screen display', 'Kiosk', 'Elo', 300),
  ('Kitchen Display', '15-inch kitchen display system', 'Kitchen Display (KDS)', 'Elo', 400),
  ('Thermal Printer', 'Thermal receipt printer', 'POS', 'Epson', 150),
  ('Tablet', '10-inch Android tablet', 'Inventory', 'Samsung', 250)
ON CONFLICT (name) DO NOTHING;

-- ==============================================
-- 6. VERIFICATION
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
