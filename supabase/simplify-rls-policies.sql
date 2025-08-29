-- Simplify RLS Policies to Fix Authentication Context Issues
-- This script creates simplified, working RLS policies that don't rely on complex functions

-- 1. Simplify profiles table RLS policies
DROP POLICY IF EXISTS "profiles_secure_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_secure_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_secure_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_secure_delete" ON public.profiles;

-- Create simplified policies that work without complex functions
CREATE POLICY "profiles_simple_select" ON public.profiles
FOR SELECT TO authenticated
USING (
  user_id = auth.uid() 
  OR 
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "profiles_simple_update" ON public.profiles
FOR UPDATE TO authenticated
USING (
  user_id = auth.uid() 
  OR 
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  user_id = auth.uid() 
  OR 
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "profiles_simple_insert" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  OR 
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "profiles_simple_delete" ON public.profiles
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 2. Simplify licenses table RLS policies
DROP POLICY IF EXISTS "licenses_secure_admin_full_access" ON public.licenses;
DROP POLICY IF EXISTS "licenses_ops_basic_metadata_only" ON public.licenses;
DROP POLICY IF EXISTS "licenses_deployment_basic_metadata_only" ON public.licenses;

-- Create simplified policies
CREATE POLICY "licenses_simple_select" ON public.licenses
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'ops_manager', 'deployment_engineer')
  )
);

CREATE POLICY "licenses_simple_insert" ON public.licenses
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "licenses_simple_update" ON public.licenses
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "licenses_simple_delete" ON public.licenses
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 3. Simplify sites table RLS policies (if they exist)
DROP POLICY IF EXISTS "sites_admin_full_access" ON public.sites;
DROP POLICY IF EXISTS "sites_ops_manager_access" ON public.sites;
DROP POLICY IF EXISTS "sites_deployment_engineer_access" ON public.sites;

-- Create simplified sites policies
CREATE POLICY "sites_simple_select" ON public.sites
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'ops_manager', 'deployment_engineer')
  )
);

CREATE POLICY "sites_simple_insert" ON public.sites
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'ops_manager')
  )
);

CREATE POLICY "sites_simple_update" ON public.sites
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'ops_manager')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'ops_manager')
  )
);

-- 4. Simplify inventory_items table RLS policies (if they exist)
DROP POLICY IF EXISTS "inventory_admin_full_access" ON public.inventory_items;
DROP POLICY IF EXISTS "inventory_ops_manager_access" ON public.inventory_items;
DROP POLICY IF EXISTS "inventory_deployment_engineer_access" ON public.inventory_items;

-- Create simplified inventory policies
CREATE POLICY "inventory_simple_select" ON public.inventory_items
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'ops_manager', 'deployment_engineer')
  )
);

CREATE POLICY "inventory_simple_insert" ON public.inventory_items
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'ops_manager')
  )
);

CREATE POLICY "inventory_simple_update" ON public.inventory_items
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'ops_manager', 'deployment_engineer')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'ops_manager', 'deployment_engineer')
  )
);

-- 5. Ensure user_roles table has basic data
INSERT INTO public.user_roles (user_id, role, created_by)
SELECT 
  p.user_id,
  COALESCE(p.role, 'user')::TEXT,
  p.user_id
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.user_id
)
ON CONFLICT (user_id, role) DO NOTHING;

-- 6. Create a simple role check function that doesn't fail
CREATE OR REPLACE FUNCTION public.get_user_role_simple(user_uuid UUID DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Use provided UUID or current user
  IF user_uuid IS NULL THEN
    user_uuid := auth.uid();
  END IF;
  
  -- Get role from user_roles table
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = user_uuid
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Return role or default to 'user'
  RETURN COALESCE(user_role, 'user');
EXCEPTION
  WHEN OTHERS THEN
    -- Return default role if anything goes wrong
    RETURN 'user';
END;
$$;

-- 7. Grant permissions
GRANT EXECUTE ON FUNCTION public.get_user_role_simple(UUID) TO authenticated;

-- 8. Verify policies are created
SELECT 
  'RLS policies simplified successfully' as status,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'licenses', 'sites', 'inventory_items');
