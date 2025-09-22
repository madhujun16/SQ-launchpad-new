-- Safe Security Fix - Handles existing policy dependencies
-- This migration safely updates the is_admin function without breaking existing policies

-- ==============================================
-- 1. CREATE NEW FUNCTIONS WITH DIFFERENT NAMES FIRST
-- ==============================================

-- Create new secure functions with different names to avoid conflicts
CREATE OR REPLACE FUNCTION public.is_admin_secure(_user_id UUID DEFAULT auth.uid())
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

CREATE OR REPLACE FUNCTION public.is_ops_manager_secure(_user_id UUID DEFAULT auth.uid())
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

CREATE OR REPLACE FUNCTION public.is_deployment_engineer_secure(_user_id UUID DEFAULT auth.uid())
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

CREATE OR REPLACE FUNCTION public.has_any_role_secure(_user_id UUID DEFAULT auth.uid())
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
-- 2. UPDATE EXISTING FUNCTION DEFINITIONS SAFELY
-- ==============================================

-- Update the existing is_admin function to use the secure version
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

-- Update other existing functions if they exist
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

-- Enable RLS on main tables (safe to run multiple times)
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 4. ADD MISSING POLICIES FOR CORE TABLES
-- ==============================================

-- PROFILES TABLE POLICIES (only add if they don't exist)
DO $$
BEGIN
    -- Users can only view their own profile
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'profiles_select_own'
    ) THEN
        CREATE POLICY "profiles_select_own" ON public.profiles
        FOR SELECT 
        TO authenticated
        USING (user_id = auth.uid());
    END IF;

    -- Users can update their own profile
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'profiles_update_own'
    ) THEN
        CREATE POLICY "profiles_update_own" ON public.profiles
        FOR UPDATE 
        TO authenticated
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());
    END IF;

    -- Users can insert their own profile
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'profiles_insert_own'
    ) THEN
        CREATE POLICY "profiles_insert_own" ON public.profiles
        FOR INSERT 
        TO authenticated
        WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

-- USER_ROLES TABLE POLICIES (only add if they don't exist)
DO $$
BEGIN
    -- Users can view their own roles
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_roles' 
        AND policyname = 'user_roles_select_own'
    ) THEN
        CREATE POLICY "user_roles_select_own" ON public.user_roles
        FOR SELECT 
        TO authenticated
        USING (user_id = auth.uid());
    END IF;

    -- Admins can view all roles
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_roles' 
        AND policyname = 'user_roles_admin_select'
    ) THEN
        CREATE POLICY "user_roles_admin_select" ON public.user_roles
        FOR SELECT 
        TO authenticated
        USING (public.is_admin());
    END IF;

    -- Admins can manage all roles
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_roles' 
        AND policyname = 'user_roles_admin_all'
    ) THEN
        CREATE POLICY "user_roles_admin_all" ON public.user_roles
        FOR ALL 
        TO authenticated
        USING (public.is_admin())
        WITH CHECK (public.is_admin());
    END IF;
END $$;

-- SITES TABLE POLICIES (only add if they don't exist)
DO $$
BEGIN
    -- Admins can view all sites
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'sites' 
        AND policyname = 'sites_admin_select'
    ) THEN
        CREATE POLICY "sites_admin_select" ON public.sites
        FOR SELECT 
        TO authenticated
        USING (public.is_admin());
    END IF;

    -- Ops managers can view assigned sites
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'sites' 
        AND policyname = 'sites_ops_manager_select'
    ) THEN
        CREATE POLICY "sites_ops_manager_select" ON public.sites
        FOR SELECT 
        TO authenticated
        USING (
          public.is_ops_manager() AND 
          assigned_ops_manager = auth.uid()
        );
    END IF;

    -- Deployment engineers can view assigned sites
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'sites' 
        AND policyname = 'sites_deployment_engineer_select'
    ) THEN
        CREATE POLICY "sites_deployment_engineer_select" ON public.sites
        FOR SELECT 
        TO authenticated
        USING (
          public.is_deployment_engineer() AND 
          assigned_deployment_engineer = auth.uid()
        );
    END IF;
END $$;

-- ORGANIZATIONS TABLE POLICIES (only add if they don't exist)
DO $$
BEGIN
    -- Admins can view all organizations
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'organizations' 
        AND policyname = 'organizations_admin_select'
    ) THEN
        CREATE POLICY "organizations_admin_select" ON public.organizations
        FOR SELECT 
        TO authenticated
        USING (public.is_admin());
    END IF;

    -- Admins can manage all organizations
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'organizations' 
        AND policyname = 'organizations_admin_all'
    ) THEN
        CREATE POLICY "organizations_admin_all" ON public.organizations
        FOR ALL 
        TO authenticated
        USING (public.is_admin())
        WITH CHECK (public.is_admin());
    END IF;
END $$;

-- ==============================================
-- 5. CLEAN UP TEMPORARY FUNCTIONS
-- ==============================================

-- Drop the temporary secure functions since we've updated the main ones
DROP FUNCTION IF EXISTS public.is_admin_secure(UUID);
DROP FUNCTION IF EXISTS public.is_ops_manager_secure(UUID);
DROP FUNCTION IF EXISTS public.is_deployment_engineer_secure(UUID);
DROP FUNCTION IF EXISTS public.has_any_role_secure(UUID);

-- ==============================================
-- 6. VERIFICATION
-- ==============================================

-- Test the functions work
SELECT 'Functions updated successfully' as status;

-- Check RLS is enabled on key tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('sites', 'organizations', 'profiles', 'user_roles')
ORDER BY tablename;

-- Check that policies exist
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename IN ('sites', 'organizations', 'profiles', 'user_roles')
ORDER BY tablename, policyname;
