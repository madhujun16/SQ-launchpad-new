-- Fix RLS policies for site_creation_data table to allow INSERT and UPDATE operations
-- This resolves the 403 Forbidden error when saving site creation data

-- Add INSERT policy for site_creation_data
CREATE POLICY "Allow authenticated users to insert site creation data" ON public.site_creation_data
FOR INSERT 
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

-- Add UPDATE policy for site_creation_data
CREATE POLICY "Allow authenticated users to update site creation data" ON public.site_creation_data
FOR UPDATE 
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Add INSERT policy for site_study_data
CREATE POLICY "Allow authenticated users to insert site study data" ON public.site_study_data
FOR INSERT 
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

-- Add UPDATE policy for site_study_data
CREATE POLICY "Allow authenticated users to update site study data" ON public.site_study_data
FOR UPDATE 
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Add INSERT policy for site_scoping_data
CREATE POLICY "Allow authenticated users to insert site scoping data" ON public.site_scoping_data
FOR INSERT 
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

-- Add UPDATE policy for site_scoping_data
CREATE POLICY "Allow authenticated users to update site scoping data" ON public.site_scoping_data
FOR UPDATE 
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Add INSERT policy for site_approvals
CREATE POLICY "Allow authenticated users to insert site approvals" ON public.site_approvals
FOR INSERT 
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

-- Add UPDATE policy for site_approvals
CREATE POLICY "Allow authenticated users to update site approvals" ON public.site_approvals
FOR UPDATE 
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Add INSERT policy for site_procurement
CREATE POLICY "Allow authenticated users to insert site procurement" ON public.site_procurement
FOR INSERT 
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

-- Add UPDATE policy for site_procurement
CREATE POLICY "Allow authenticated users to update site procurement" ON public.site_procurement
FOR UPDATE 
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Add INSERT policy for site_deployments
CREATE POLICY "Allow authenticated users to insert site deployments" ON public.site_deployments
FOR INSERT 
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

-- Add UPDATE policy for site_deployments
CREATE POLICY "Allow authenticated users to update site deployments" ON public.site_deployments
FOR UPDATE 
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Add INSERT policy for site_go_live
CREATE POLICY "Allow authenticated users to insert site go live" ON public.site_go_live
FOR INSERT 
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

-- Add UPDATE policy for site_go_live
CREATE POLICY "Allow authenticated users to update site go live" ON public.site_go_live
FOR UPDATE 
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
