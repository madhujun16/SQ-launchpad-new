-- Final cleanup for Customer Site Information Security
-- Remove any remaining potentially permissive policies

-- Remove the old role-based policy that might allow broader access
DROP POLICY IF EXISTS "Users can view sites based on role and assignment" ON public.sites;

-- Remove redundant admin policies (the "Admins can manage sites" ALL policy covers everything)
DROP POLICY IF EXISTS "Admins can update layout images" ON public.sites;

-- Ensure we have the secure functions in place
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

-- Verify site assignments table security
DROP POLICY IF EXISTS "Authenticated users can view site assignments" ON public.site_assignments;

CREATE POLICY "Secure site assignment access" 
ON public.site_assignments 
FOR SELECT 
TO authenticated
USING (
  public.is_verified_admin() OR 
  (ops_manager_id = auth.uid()) OR 
  (deployment_engineer_id = auth.uid())
);