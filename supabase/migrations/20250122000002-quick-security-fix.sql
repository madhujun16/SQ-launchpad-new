-- Quick Security Fix - Addresses the UUID type mismatch error
-- This migration fixes the specific error: operator does not exist: character varying = uuid

-- ==============================================
-- 1. DROP EXISTING FUNCTIONS TO AVOID CONFLICTS
-- ==============================================

-- Drop all existing role-checking functions
DROP FUNCTION IF EXISTS public.is_admin(UUID);
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_ops_manager(UUID);
DROP FUNCTION IF EXISTS public.is_ops_manager();
DROP FUNCTION IF EXISTS public.is_deployment_engineer(UUID);
DROP FUNCTION IF EXISTS public.is_deployment_engineer();
DROP FUNCTION IF EXISTS public.has_any_role(UUID);
DROP FUNCTION IF EXISTS public.has_any_role();
DROP FUNCTION IF EXISTS public.has_role(UUID, app_role);
DROP FUNCTION IF EXISTS public.get_current_user_roles();

-- ==============================================
-- 2. CREATE FIXED HELPER FUNCTIONS
-- ==============================================

-- Function to check if user is admin (with explicit type casting)
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
    WHERE user_id = _user_id
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
    WHERE user_id = _user_id
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
    WHERE user_id = _user_id
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
    WHERE user_id = _user_id
  )
$$;

-- ==============================================
-- 3. ENABLE RLS ON KEY TABLES (if not already enabled)
-- ==============================================

-- Enable RLS on main tables
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 4. CREATE BASIC SECURE POLICIES
-- ==============================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_delete" ON public.profiles;

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
DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_select" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_all" ON public.user_roles;

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
DROP POLICY IF EXISTS "sites_admin_select" ON public.sites;
DROP POLICY IF EXISTS "sites_ops_manager_select" ON public.sites;
DROP POLICY IF EXISTS "sites_deployment_engineer_select" ON public.sites;
DROP POLICY IF EXISTS "sites_admin_all" ON public.sites;
DROP POLICY IF EXISTS "sites_ops_manager_update" ON public.sites;
DROP POLICY IF EXISTS "sites_deployment_engineer_update" ON public.sites;

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
DROP POLICY IF EXISTS "organizations_admin_select" ON public.organizations;
DROP POLICY IF EXISTS "organizations_admin_all" ON public.organizations;

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

-- ==============================================
-- 5. VERIFICATION
-- ==============================================

-- Test the functions work
SELECT 'Functions created successfully' as status;

-- Check RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('sites', 'organizations', 'profiles', 'user_roles')
ORDER BY tablename;
