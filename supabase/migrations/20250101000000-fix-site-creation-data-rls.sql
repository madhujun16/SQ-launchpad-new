-- Fix RLS policies for site_creation_data table to allow INSERT and UPDATE operations
-- This resolves the 403 Forbidden error when saving site creation data

-- Drop existing policies that might be causing conflicts
DROP POLICY IF EXISTS "Allow authenticated users to insert site creation data" ON public.site_creation_data;
DROP POLICY IF EXISTS "Allow authenticated users to update site creation data" ON public.site_creation_data;
DROP POLICY IF EXISTS "workflow_admin_all" ON public.site_creation_data;
DROP POLICY IF EXISTS "workflow_role_based_select" ON public.site_creation_data;

-- Add comprehensive policies for site_creation_data
-- Allow authenticated users to insert site creation data
CREATE POLICY "Allow authenticated users to insert site creation data" ON public.site_creation_data
FOR INSERT 
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update site creation data
CREATE POLICY "Allow authenticated users to update site creation data" ON public.site_creation_data
FOR UPDATE 
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to select site creation data
CREATE POLICY "Allow authenticated users to select site creation data" ON public.site_creation_data
FOR SELECT 
TO authenticated
USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete site creation data (for cleanup)
CREATE POLICY "Allow authenticated users to delete site creation data" ON public.site_creation_data
FOR DELETE 
TO authenticated
USING (auth.role() = 'authenticated');

-- Ensure the table has RLS enabled
ALTER TABLE public.site_creation_data ENABLE ROW LEVEL SECURITY;
