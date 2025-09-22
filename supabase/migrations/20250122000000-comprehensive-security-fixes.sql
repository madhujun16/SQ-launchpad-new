-- Comprehensive Security Fixes for SmartQ LaunchPad
-- This migration addresses all the security issues identified by Lovable.dev

-- ==============================================
-- 1. ENABLE RLS ON ALL TABLES
-- ==============================================

-- Enable RLS on all main tables
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on workflow tables
ALTER TABLE public.site_creation_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_study_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_scoping_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_procurement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_go_live ENABLE ROW LEVEL SECURITY;

-- Enable RLS on inventory tables
ALTER TABLE public.software_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hardware_items ENABLE ROW LEVEL SECURITY;

-- Enable RLS on assignment tables
ALTER TABLE public.site_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_studies ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 2. DROP ALL EXISTING POLICIES
-- ==============================================

-- Drop all existing policies to start fresh
DO $$
DECLARE
    policy_record RECORD;
    table_name TEXT;
BEGIN
    -- List of tables to clean up
    FOR table_name IN 
        SELECT unnest(ARRAY[
            'sites', 'organizations', 'profiles', 'user_roles',
            'site_creation_data', 'site_study_data', 'site_scoping_data',
            'site_approvals', 'site_procurement', 'site_deployments', 'site_go_live',
            'software_modules', 'hardware_items', 'site_assignments', 'site_studies'
        ])
    LOOP
        -- Drop all policies for each table
        FOR policy_record IN 
            SELECT policyname 
            FROM pg_policies 
            WHERE schemaname = 'public' AND tablename = table_name
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_record.policyname, table_name);
        END LOOP;
    END LOOP;
END $$;

-- ==============================================
-- 3. CREATE SECURE HELPER FUNCTIONS
-- ==============================================

-- Drop existing functions first to avoid conflicts
DROP FUNCTION IF EXISTS public.is_admin(UUID);
DROP FUNCTION IF EXISTS public.is_ops_manager(UUID);
DROP FUNCTION IF EXISTS public.is_deployment_engineer(UUID);
DROP FUNCTION IF EXISTS public.has_any_role(UUID);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id::UUID
      AND role = 'admin'::app_role
  )
$$;

-- Function to check if user is ops_manager
CREATE OR REPLACE FUNCTION public.is_ops_manager(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id::UUID
      AND role = 'ops_manager'::app_role
  )
$$;

-- Function to check if user is deployment_engineer
CREATE OR REPLACE FUNCTION public.is_deployment_engineer(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id::UUID
      AND role = 'deployment_engineer'::app_role
  )
$$;

-- Function to check if user has any role
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id::UUID
  )
$$;

-- ==============================================
-- 4. CREATE SECURE RLS POLICIES
-- ==============================================

-- PROFILES TABLE POLICIES
-- Users can only view their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can insert their own profile
CREATE POLICY "profiles_insert_own" ON public.profiles
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "profiles_admin_select" ON public.profiles
FOR SELECT 
TO authenticated
USING (public.is_admin());

-- Admins can update all profiles
CREATE POLICY "profiles_admin_update" ON public.profiles
FOR UPDATE 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Admins can insert profiles
CREATE POLICY "profiles_admin_insert" ON public.profiles
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin());

-- Admins can delete profiles
CREATE POLICY "profiles_admin_delete" ON public.profiles
FOR DELETE 
TO authenticated
USING (public.is_admin());

-- USER_ROLES TABLE POLICIES
-- Users can view their own roles
CREATE POLICY "user_roles_select_own" ON public.user_roles
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Admins can view all roles
CREATE POLICY "user_roles_admin_select" ON public.user_roles
FOR SELECT 
TO authenticated
USING (public.is_admin());

-- Admins can manage all roles
CREATE POLICY "user_roles_admin_all" ON public.user_roles
FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- SITES TABLE POLICIES
-- Admins can view all sites
CREATE POLICY "sites_admin_select" ON public.sites
FOR SELECT 
TO authenticated
USING (public.is_admin());

-- Ops managers can view assigned sites
CREATE POLICY "sites_ops_manager_select" ON public.sites
FOR SELECT 
TO authenticated
USING (
  public.is_ops_manager() AND 
  assigned_ops_manager = auth.uid()
);

-- Deployment engineers can view assigned sites
CREATE POLICY "sites_deployment_engineer_select" ON public.sites
FOR SELECT 
TO authenticated
USING (
  public.is_deployment_engineer() AND 
  assigned_deployment_engineer = auth.uid()
);

-- Admins can manage all sites
CREATE POLICY "sites_admin_all" ON public.sites
FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Ops managers can update assigned sites
CREATE POLICY "sites_ops_manager_update" ON public.sites
FOR UPDATE 
TO authenticated
USING (
  public.is_ops_manager() AND 
  assigned_ops_manager = auth.uid()
)
WITH CHECK (
  public.is_ops_manager() AND 
  assigned_ops_manager = auth.uid()
);

-- Deployment engineers can update assigned sites
CREATE POLICY "sites_deployment_engineer_update" ON public.sites
FOR UPDATE 
TO authenticated
USING (
  public.is_deployment_engineer() AND 
  assigned_deployment_engineer = auth.uid()
)
WITH CHECK (
  public.is_deployment_engineer() AND 
  assigned_deployment_engineer = auth.uid()
);

-- ORGANIZATIONS TABLE POLICIES
-- Admins can view all organizations
CREATE POLICY "organizations_admin_select" ON public.organizations
FOR SELECT 
TO authenticated
USING (public.is_admin());

-- Admins can manage all organizations
CREATE POLICY "organizations_admin_all" ON public.organizations
FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- WORKFLOW TABLES POLICIES (site_creation_data, site_study_data, etc.)
-- Admins can access all workflow data
CREATE POLICY "workflow_admin_all" ON public.site_creation_data
FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "workflow_admin_all" ON public.site_study_data
FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "workflow_admin_all" ON public.site_scoping_data
FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "workflow_admin_all" ON public.site_approvals
FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "workflow_admin_all" ON public.site_procurement
FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "workflow_admin_all" ON public.site_deployments
FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "workflow_admin_all" ON public.site_go_live
FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Role-based access for workflow data
CREATE POLICY "workflow_role_based_select" ON public.site_creation_data
FOR SELECT 
TO authenticated
USING (
  public.is_admin() OR
  (public.is_ops_manager() AND EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = site_creation_data.site_id 
    AND sites.assigned_ops_manager = auth.uid()
  )) OR
  (public.is_deployment_engineer() AND EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = site_creation_data.site_id 
    AND sites.assigned_deployment_engineer = auth.uid()
  ))
);

-- Apply same pattern to other workflow tables
CREATE POLICY "workflow_role_based_select" ON public.site_study_data
FOR SELECT 
TO authenticated
USING (
  public.is_admin() OR
  (public.is_ops_manager() AND EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = site_study_data.site_id 
    AND sites.assigned_ops_manager = auth.uid()
  )) OR
  (public.is_deployment_engineer() AND EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = site_study_data.site_id 
    AND sites.assigned_deployment_engineer = auth.uid()
  ))
);

CREATE POLICY "workflow_role_based_select" ON public.site_scoping_data
FOR SELECT 
TO authenticated
USING (
  public.is_admin() OR
  (public.is_ops_manager() AND EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = site_scoping_data.site_id 
    AND sites.assigned_ops_manager = auth.uid()
  )) OR
  (public.is_deployment_engineer() AND EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = site_scoping_data.site_id 
    AND sites.assigned_deployment_engineer = auth.uid()
  ))
);

CREATE POLICY "workflow_role_based_select" ON public.site_approvals
FOR SELECT 
TO authenticated
USING (
  public.is_admin() OR
  (public.is_ops_manager() AND EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = site_approvals.site_id 
    AND sites.assigned_ops_manager = auth.uid()
  )) OR
  (public.is_deployment_engineer() AND EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = site_approvals.site_id 
    AND sites.assigned_deployment_engineer = auth.uid()
  ))
);

CREATE POLICY "workflow_role_based_select" ON public.site_procurement
FOR SELECT 
TO authenticated
USING (
  public.is_admin() OR
  (public.is_ops_manager() AND EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = site_procurement.site_id 
    AND sites.assigned_ops_manager = auth.uid()
  )) OR
  (public.is_deployment_engineer() AND EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = site_procurement.site_id 
    AND sites.assigned_deployment_engineer = auth.uid()
  ))
);

CREATE POLICY "workflow_role_based_select" ON public.site_deployments
FOR SELECT 
TO authenticated
USING (
  public.is_admin() OR
  (public.is_ops_manager() AND EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = site_deployments.site_id 
    AND sites.assigned_ops_manager = auth.uid()
  )) OR
  (public.is_deployment_engineer() AND EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = site_deployments.site_id 
    AND sites.assigned_deployment_engineer = auth.uid()
  ))
);

CREATE POLICY "workflow_role_based_select" ON public.site_go_live
FOR SELECT 
TO authenticated
USING (
  public.is_admin() OR
  (public.is_ops_manager() AND EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = site_go_live.site_id 
    AND sites.assigned_ops_manager = auth.uid()
  )) OR
  (public.is_deployment_engineer() AND EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = site_go_live.site_id 
    AND sites.assigned_deployment_engineer = auth.uid()
  ))
);

-- INVENTORY TABLES POLICIES
-- Admins can manage all inventory
CREATE POLICY "inventory_admin_all" ON public.software_modules
FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "inventory_admin_all" ON public.hardware_items
FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================
-- 5. SECURITY CONFIGURATION
-- ==============================================

-- Disable anonymous access to sensitive functions
REVOKE EXECUTE ON FUNCTION public.is_admin FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_ops_manager FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_deployment_engineer FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_any_role FROM anon;

-- Grant execute permissions to authenticated users only
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_ops_manager TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_deployment_engineer TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_role TO authenticated;

-- ==============================================
-- 6. VERIFICATION QUERIES
-- ==============================================

-- Verify RLS is enabled on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'sites', 'organizations', 'profiles', 'user_roles',
        'site_creation_data', 'site_study_data', 'site_scoping_data',
        'site_approvals', 'site_procurement', 'site_deployments', 'site_go_live',
        'software_modules', 'hardware_items'
    )
ORDER BY tablename;

-- Verify policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
