-- Fix Customer Site Information Security Issue
-- This migration implements strict access controls for the sites table
-- to prevent unauthorized access to customer site information

-- Remove overly permissive policies that allow any authenticated user to view sites
DROP POLICY IF EXISTS "Authenticated users can view sites" ON public.sites;
DROP POLICY IF EXISTS "Authenticated users can view site assignments" ON public.site_assignments;

-- Create a secure function to check if user is assigned to a specific site
CREATE OR REPLACE FUNCTION public.is_assigned_to_site(site_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.site_assignments sa
    WHERE sa.site_id = site_uuid
      AND (sa.ops_manager_id = auth.uid() OR sa.deployment_engineer_id = auth.uid())
  ) OR EXISTS (
    SELECT 1
    FROM public.sites s
    WHERE s.id = site_uuid
      AND (s.assigned_ops_manager = auth.uid() OR s.assigned_deployment_engineer = auth.uid())
  );
$$;

-- Create a secure function to check if user can access any sites
CREATE OR REPLACE FUNCTION public.can_access_sites()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT public.is_verified_admin() OR EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('ops_manager', 'deployment_engineer')
  );
$$;

-- Replace with secure site access policy - users can only see sites they're assigned to
CREATE POLICY "Secure site access based on assignments" 
ON public.sites 
FOR SELECT 
TO authenticated
USING (
  public.is_verified_admin() OR 
  public.is_assigned_to_site(id)
);

-- Secure site assignments - users can only see assignments they're part of
CREATE POLICY "Secure site assignment access" 
ON public.site_assignments 
FOR SELECT 
TO authenticated
USING (
  public.is_verified_admin() OR 
  (ops_manager_id = auth.uid()) OR 
  (deployment_engineer_id = auth.uid())
);

-- Update the site creation policy to be more explicit
DROP POLICY IF EXISTS "Admins can create sites" ON public.sites;
DROP POLICY IF EXISTS "Ops managers and admins can create sites" ON public.sites;

CREATE POLICY "Authorized site creation" 
ON public.sites 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'ops_manager')
  )
);

-- Secure site updates - only assigned users or admins
DROP POLICY IF EXISTS "Users can update sites based on role and assignment" ON public.sites;
DROP POLICY IF EXISTS "Ops managers and admins can update sites" ON public.sites;

CREATE POLICY "Secure site updates" 
ON public.sites 
FOR UPDATE 
TO authenticated
USING (
  public.is_verified_admin() OR 
  public.is_assigned_to_site(id)
)
WITH CHECK (
  public.is_verified_admin() OR 
  public.is_assigned_to_site(id)
);

-- Fix the layout images policy to use proper assignment checking
DROP POLICY IF EXISTS "Users can view layout images for accessible sites" ON public.sites;

CREATE POLICY "Secure layout image access" 
ON public.sites 
FOR SELECT 
TO authenticated
USING (
  public.is_verified_admin() OR 
  public.is_assigned_to_site(id)
);