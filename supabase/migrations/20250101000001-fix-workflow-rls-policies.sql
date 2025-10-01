-- Fix RLS policies for workflow tables to use site_assignments table
-- This resolves the 406 Not Acceptable errors when accessing workflow data

-- Drop existing policies that reference sites table columns
DROP POLICY IF EXISTS "workflow_role_based_select" ON public.site_study_data;
DROP POLICY IF EXISTS "workflow_role_based_select" ON public.site_scoping_data;
DROP POLICY IF EXISTS "workflow_role_based_select" ON public.site_approvals;
DROP POLICY IF EXISTS "workflow_role_based_select" ON public.site_procurement;
DROP POLICY IF EXISTS "workflow_role_based_select" ON public.site_deployments;

-- Drop other existing policies
DROP POLICY IF EXISTS "Users can view site procurement for assigned sites" ON public.site_procurement;
DROP POLICY IF EXISTS "Users can manage site procurement for assigned sites" ON public.site_procurement;
DROP POLICY IF EXISTS "Users can view site deployments for assigned sites" ON public.site_deployments;
DROP POLICY IF EXISTS "Deployment engineers and admins can manage site deployments" ON public.site_deployments;
DROP POLICY IF EXISTS "Users can view site go-live for assigned sites" ON public.site_go_live;

-- Create new policies that use site_assignments table
CREATE POLICY "workflow_role_based_select" ON public.site_study_data
FOR SELECT 
TO authenticated
USING (
  public.is_admin() OR
  (public.is_ops_manager() AND EXISTS (
    SELECT 1 FROM public.site_assignments sa
    WHERE sa.site_id = site_study_data.site_id 
    AND sa.ops_manager_id = auth.uid()
  )) OR
  (public.is_deployment_engineer() AND EXISTS (
    SELECT 1 FROM public.site_assignments sa
    WHERE sa.site_id = site_study_data.site_id 
    AND sa.deployment_engineer_id = auth.uid()
  ))
);

CREATE POLICY "workflow_role_based_select" ON public.site_scoping_data
FOR SELECT 
TO authenticated
USING (
  public.is_admin() OR
  (public.is_ops_manager() AND EXISTS (
    SELECT 1 FROM public.site_assignments sa
    WHERE sa.site_id = site_scoping_data.site_id 
    AND sa.ops_manager_id = auth.uid()
  )) OR
  (public.is_deployment_engineer() AND EXISTS (
    SELECT 1 FROM public.site_assignments sa
    WHERE sa.site_id = site_scoping_data.site_id 
    AND sa.deployment_engineer_id = auth.uid()
  ))
);

CREATE POLICY "workflow_role_based_select" ON public.site_approvals
FOR SELECT 
TO authenticated
USING (
  public.is_admin() OR
  (public.is_ops_manager() AND EXISTS (
    SELECT 1 FROM public.site_assignments sa
    WHERE sa.site_id = site_approvals.site_id 
    AND sa.ops_manager_id = auth.uid()
  )) OR
  (public.is_deployment_engineer() AND EXISTS (
    SELECT 1 FROM public.site_assignments sa
    WHERE sa.site_id = site_approvals.site_id 
    AND sa.deployment_engineer_id = auth.uid()
  ))
);

CREATE POLICY "workflow_role_based_select" ON public.site_procurement
FOR SELECT 
TO authenticated
USING (
  public.is_admin() OR
  (public.is_ops_manager() AND EXISTS (
    SELECT 1 FROM public.site_assignments sa
    WHERE sa.site_id = site_procurement.site_id 
    AND sa.ops_manager_id = auth.uid()
  )) OR
  (public.is_deployment_engineer() AND EXISTS (
    SELECT 1 FROM public.site_assignments sa
    WHERE sa.site_id = site_procurement.site_id 
    AND sa.deployment_engineer_id = auth.uid()
  ))
);

CREATE POLICY "workflow_role_based_select" ON public.site_deployments
FOR SELECT 
TO authenticated
USING (
  public.is_admin() OR
  (public.is_ops_manager() AND EXISTS (
    SELECT 1 FROM public.site_assignments sa
    WHERE sa.site_id = site_deployments.site_id 
    AND sa.ops_manager_id = auth.uid()
  )) OR
  (public.is_deployment_engineer() AND EXISTS (
    SELECT 1 FROM public.site_assignments sa
    WHERE sa.site_id = site_deployments.site_id 
    AND sa.deployment_engineer_id = auth.uid()
  ))
);

-- Add policies for site_go_live table
CREATE POLICY "workflow_role_based_select" ON public.site_go_live
FOR SELECT 
TO authenticated
USING (
  public.is_admin() OR
  (public.is_ops_manager() AND EXISTS (
    SELECT 1 FROM public.site_assignments sa
    WHERE sa.site_id = site_go_live.site_id 
    AND sa.ops_manager_id = auth.uid()
  )) OR
  (public.is_deployment_engineer() AND EXISTS (
    SELECT 1 FROM public.site_assignments sa
    WHERE sa.site_id = site_go_live.site_id 
    AND sa.deployment_engineer_id = auth.uid()
  ))
);

-- Add INSERT, UPDATE, DELETE policies for workflow tables
CREATE POLICY "workflow_role_based_insert" ON public.site_study_data
FOR INSERT 
TO authenticated
WITH CHECK (
  public.is_admin() OR
  (public.is_ops_manager() AND EXISTS (
    SELECT 1 FROM public.site_assignments sa
    WHERE sa.site_id = site_study_data.site_id 
    AND sa.ops_manager_id = auth.uid()
  )) OR
  (public.is_deployment_engineer() AND EXISTS (
    SELECT 1 FROM public.site_assignments sa
    WHERE sa.site_id = site_study_data.site_id 
    AND sa.deployment_engineer_id = auth.uid()
  ))
);

CREATE POLICY "workflow_role_based_update" ON public.site_study_data
FOR UPDATE 
TO authenticated
USING (
  public.is_admin() OR
  (public.is_ops_manager() AND EXISTS (
    SELECT 1 FROM public.site_assignments sa
    WHERE sa.site_id = site_study_data.site_id 
    AND sa.ops_manager_id = auth.uid()
  )) OR
  (public.is_deployment_engineer() AND EXISTS (
    SELECT 1 FROM public.site_assignments sa
    WHERE sa.site_id = site_study_data.site_id 
    AND sa.deployment_engineer_id = auth.uid()
  ))
);

CREATE POLICY "workflow_role_based_delete" ON public.site_study_data
FOR DELETE 
TO authenticated
USING (
  public.is_admin() OR
  (public.is_ops_manager() AND EXISTS (
    SELECT 1 FROM public.site_assignments sa
    WHERE sa.site_id = site_study_data.site_id 
    AND sa.ops_manager_id = auth.uid()
  )) OR
  (public.is_deployment_engineer() AND EXISTS (
    SELECT 1 FROM public.site_assignments sa
    WHERE sa.site_id = site_study_data.site_id 
    AND sa.deployment_engineer_id = auth.uid()
  ))
);

-- Similar policies for other workflow tables
CREATE POLICY "workflow_role_based_insert" ON public.site_procurement
FOR INSERT 
TO authenticated
WITH CHECK (
  public.is_admin() OR
  (public.is_ops_manager() AND EXISTS (
    SELECT 1 FROM public.site_assignments sa
    WHERE sa.site_id = site_procurement.site_id 
    AND sa.ops_manager_id = auth.uid()
  )) OR
  (public.is_deployment_engineer() AND EXISTS (
    SELECT 1 FROM public.site_assignments sa
    WHERE sa.site_id = site_procurement.site_id 
    AND sa.deployment_engineer_id = auth.uid()
  ))
);

CREATE POLICY "workflow_role_based_update" ON public.site_procurement
FOR UPDATE 
TO authenticated
USING (
  public.is_admin() OR
  (public.is_ops_manager() AND EXISTS (
    SELECT 1 FROM public.site_assignments sa
    WHERE sa.site_id = site_procurement.site_id 
    AND sa.ops_manager_id = auth.uid()
  )) OR
  (public.is_deployment_engineer() AND EXISTS (
    SELECT 1 FROM public.site_assignments sa
    WHERE sa.site_id = site_procurement.site_id 
    AND sa.deployment_engineer_id = auth.uid()
  ))
);

CREATE POLICY "workflow_role_based_delete" ON public.site_procurement
FOR DELETE 
TO authenticated
USING (
  public.is_admin() OR
  (public.is_ops_manager() AND EXISTS (
    SELECT 1 FROM public.site_assignments sa
    WHERE sa.site_id = site_procurement.site_id 
    AND sa.ops_manager_id = auth.uid()
  )) OR
  (public.is_deployment_engineer() AND EXISTS (
    SELECT 1 FROM public.site_assignments sa
    WHERE sa.site_id = site_procurement.site_id 
    AND sa.deployment_engineer_id = auth.uid()
  ))
);

CREATE POLICY "workflow_role_based_insert" ON public.site_deployments
FOR INSERT 
TO authenticated
WITH CHECK (
  public.is_admin() OR
  (public.is_ops_manager() AND EXISTS (
    SELECT 1 FROM public.site_assignments sa
    WHERE sa.site_id = site_deployments.site_id 
    AND sa.ops_manager_id = auth.uid()
  )) OR
  (public.is_deployment_engineer() AND EXISTS (
    SELECT 1 FROM public.site_assignments sa
    WHERE sa.site_id = site_deployments.site_id 
    AND sa.deployment_engineer_id = auth.uid()
  ))
);

CREATE POLICY "workflow_role_based_update" ON public.site_deployments
FOR UPDATE 
TO authenticated
USING (
  public.is_admin() OR
  (public.is_ops_manager() AND EXISTS (
    SELECT 1 FROM public.site_assignments sa
    WHERE sa.site_id = site_deployments.site_id 
    AND sa.ops_manager_id = auth.uid()
  )) OR
  (public.is_deployment_engineer() AND EXISTS (
    SELECT 1 FROM public.site_assignments sa
    WHERE sa.site_id = site_deployments.site_id 
    AND sa.deployment_engineer_id = auth.uid()
  ))
);

CREATE POLICY "workflow_role_based_delete" ON public.site_deployments
FOR DELETE 
TO authenticated
USING (
  public.is_admin() OR
  (public.is_ops_manager() AND EXISTS (
    SELECT 1 FROM public.site_assignments sa
    WHERE sa.site_id = site_deployments.site_id 
    AND sa.ops_manager_id = auth.uid()
  )) OR
  (public.is_deployment_engineer() AND EXISTS (
    SELECT 1 FROM public.site_assignments sa
    WHERE sa.site_id = site_deployments.site_id 
    AND sa.deployment_engineer_id = auth.uid()
  ))
);
