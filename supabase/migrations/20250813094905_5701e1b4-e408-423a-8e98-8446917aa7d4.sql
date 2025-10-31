-- Fix Overlapping Policies and Security Issues
-- This migration removes conflicting policies and ensures proper security

-- =====================================================
-- STEP 1: Clean up overlapping policies on all tables
-- =====================================================

-- Cities table - Remove conflicting policies
DROP POLICY IF EXISTS "Anyone can view cities" ON public.cities;

-- Sectors table - Remove conflicting policies  
DROP POLICY IF EXISTS "Anyone can view sectors" ON public.sectors;

-- Inventory items table - Remove conflicting policies
DROP POLICY IF EXISTS "Anyone can view inventory items" ON public.inventory_items;

-- Profiles table - Keep only the most restrictive policy
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- =====================================================
-- STEP 2: Create RLS policies for tables without any
-- =====================================================

-- Hardware request items table
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'hardware_request_items') THEN
    EXECUTE 'ALTER TABLE public.hardware_request_items ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY "Authenticated users can view hardware request items" ON public.hardware_request_items FOR SELECT USING (auth.role() = ''authenticated'')';
  END IF;
END $$;

-- Deployment checklist items table
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'deployment_checklist_items') THEN
    EXECUTE 'ALTER TABLE public.deployment_checklist_items ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY "Authenticated users can view deployment checklist items" ON public.deployment_checklist_items FOR SELECT USING (auth.role() = ''authenticated'')';
  END IF;
END $$;

-- Maintenance logs table
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'maintenance_logs') THEN
    EXECUTE 'ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY "Authenticated users can view maintenance logs" ON public.maintenance_logs FOR SELECT USING (auth.role() = ''authenticated'')';
  END IF;
END $$;

-- =====================================================
-- STEP 3: Remove policies that allow anonymous access
-- =====================================================

-- Update business rules policy to remove anonymous access
DROP POLICY IF EXISTS "Users can view business rules" ON public.business_rules;
CREATE POLICY "Authenticated users can view business rules" ON public.business_rules FOR SELECT USING (auth.role() = 'authenticated');

-- Update recommendation rules policy to remove anonymous access
DROP POLICY IF EXISTS "Users can view recommendation rules" ON public.recommendation_rules;
CREATE POLICY "Authenticated users can view recommendation rules" ON public.recommendation_rules FOR SELECT USING (auth.role() = 'authenticated');

-- Update hardware items policy to remove anonymous access
DROP POLICY IF EXISTS "Users can view active hardware items" ON public.hardware_items;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.hardware_items;
CREATE POLICY "Authenticated users can view hardware items" ON public.hardware_items FOR SELECT USING (auth.role() = 'authenticated');

-- Update software modules policy to remove anonymous access
DROP POLICY IF EXISTS "Users can view active software modules" ON public.software_modules;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.software_modules;
CREATE POLICY "Authenticated users can view software modules" ON public.software_modules FOR SELECT USING (auth.role() = 'authenticated');

-- Update software hardware mapping policy to remove anonymous access
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.software_hardware_mapping;
CREATE POLICY "Authenticated users can view software hardware mapping" ON public.software_hardware_mapping FOR SELECT USING (auth.role() = 'authenticated');