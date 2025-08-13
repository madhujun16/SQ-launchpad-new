-- Fix Security Vulnerabilities - Phase 2: Clean existing policies first
-- Drop any existing overly permissive policies that might conflict

-- Step 1: Clean existing problematic policies
DROP POLICY IF EXISTS "Restricted profile access" ON public.profiles;
DROP POLICY IF EXISTS "Users can view assigned sites" ON public.profiles;
DROP POLICY IF EXISTS "Users can view assigned inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Authenticated users can view sites" ON public.sites;
DROP POLICY IF EXISTS "Authenticated users can view site assignments" ON public.site_assignments;
DROP POLICY IF EXISTS "Authenticated users can view site studies" ON public.site_studies;
DROP POLICY IF EXISTS "Authenticated users can view inventory items" ON public.inventory_items;
DROP POLICY IF EXISTS "Authenticated users can view licenses" ON public.licenses;
DROP POLICY IF EXISTS "Authenticated users can view sectors" ON public.sectors;
DROP POLICY IF EXISTS "Authenticated users can view cities" ON public.cities;

-- Step 2: Apply the comprehensive security fix
-- Create a secure policy that only allows authenticated users to see their own profile
CREATE POLICY "Restricted profile access" ON public.profiles FOR SELECT USING (
  (auth.role() = 'authenticated' AND auth.uid() = user_id) OR
  (auth.role() = 'authenticated' AND public.is_admin())
);

-- Secure all business-critical tables
CREATE POLICY "Authenticated users can view sites" ON public.sites FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view site assignments" ON public.site_assignments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view site studies" ON public.site_studies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view inventory items" ON public.inventory_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view licenses" ON public.licenses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view sectors" ON public.sectors FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view cities" ON public.cities FOR SELECT USING (auth.role() = 'authenticated');