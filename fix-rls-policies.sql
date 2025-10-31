-- Fix RLS policies for workflow tables
-- Run this directly in Supabase SQL Editor

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "workflow_role_based_select" ON public.site_study_data;
DROP POLICY IF EXISTS "workflow_role_based_select" ON public.site_scoping_data;
DROP POLICY IF EXISTS "workflow_role_based_select" ON public.site_approvals;
DROP POLICY IF EXISTS "workflow_role_based_select" ON public.site_procurement;
DROP POLICY IF EXISTS "workflow_role_based_select" ON public.site_deployments;
DROP POLICY IF EXISTS "workflow_role_based_select" ON public.site_go_live;

-- Drop other conflicting policies
DROP POLICY IF EXISTS "Users can view site procurement for assigned sites" ON public.site_procurement;
DROP POLICY IF EXISTS "Users can manage site procurement for assigned sites" ON public.site_procurement;
DROP POLICY IF EXISTS "Users can view site deployments for assigned sites" ON public.site_deployments;
DROP POLICY IF EXISTS "Deployment engineers and admins can manage site deployments" ON public.site_deployments;
DROP POLICY IF EXISTS "Users can view site go-live for assigned sites" ON public.site_go_live;

-- Drop any INSERT/UPDATE/DELETE policies that might conflict
DROP POLICY IF EXISTS "workflow_role_based_insert" ON public.site_study_data;
DROP POLICY IF EXISTS "workflow_role_based_update" ON public.site_study_data;
DROP POLICY IF EXISTS "workflow_role_based_delete" ON public.site_study_data;
DROP POLICY IF EXISTS "workflow_role_based_insert" ON public.site_procurement;
DROP POLICY IF EXISTS "workflow_role_based_update" ON public.site_procurement;
DROP POLICY IF EXISTS "workflow_role_based_delete" ON public.site_procurement;
DROP POLICY IF EXISTS "workflow_role_based_insert" ON public.site_deployments;
DROP POLICY IF EXISTS "workflow_role_based_update" ON public.site_deployments;
DROP POLICY IF EXISTS "workflow_role_based_delete" ON public.site_deployments;

-- Create simplified RLS policies that allow authenticated users to access workflow data
-- This is a temporary fix to get the system working

-- Site study data policies
CREATE POLICY "Allow authenticated users to access site study data" ON public.site_study_data
FOR ALL 
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Site scoping data policies
CREATE POLICY "Allow authenticated users to access site scoping data" ON public.site_scoping_data
FOR ALL 
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Site approvals policies
CREATE POLICY "Allow authenticated users to access site approvals" ON public.site_approvals
FOR ALL 
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Site procurement policies
CREATE POLICY "Allow authenticated users to access site procurement" ON public.site_procurement
FOR ALL 
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Site deployments policies
CREATE POLICY "Allow authenticated users to access site deployments" ON public.site_deployments
FOR ALL 
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Site go-live policies
CREATE POLICY "Allow authenticated users to access site go-live" ON public.site_go_live
FOR ALL 
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Ensure RLS is enabled on all workflow tables
ALTER TABLE public.site_study_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_scoping_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_procurement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_go_live ENABLE ROW LEVEL SECURITY;

-- Also fix site_creation_data table
CREATE POLICY "Allow authenticated users to access site creation data" ON public.site_creation_data
FOR ALL 
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

ALTER TABLE public.site_creation_data ENABLE ROW LEVEL SECURITY;
