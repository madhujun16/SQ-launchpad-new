-- Fix Missing Helper Functions for Authentication Context
-- This script creates the missing functions that are referenced in RLS policies

-- 1. Create is_verified_admin function
CREATE OR REPLACE FUNCTION public.is_verified_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user has admin role in user_roles table
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
    AND created_at IS NOT NULL
  );
END;
$$;

-- 2. Create has_role function
CREATE OR REPLACE FUNCTION public.has_role(user_uuid UUID, role_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user has the specified role
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = user_uuid 
    AND role = role_name
    AND created_at IS NOT NULL
  );
END;
$$;

-- 3. Create log_admin_profile_access function
CREATE OR REPLACE FUNCTION public.log_admin_profile_access(action TEXT, target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log admin access to profiles for audit purposes
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    metadata
  ) VALUES (
    auth.uid(),
    'ADMIN_PROFILE_' || action,
    'profiles',
    target_user_id,
    jsonb_build_object(
      'target_user_id', target_user_id,
      'admin_user_id', auth.uid(),
      'timestamp', now(),
      'action_type', action
    )
  );
END;
$$;

-- 4. Create log_license_access function
CREATE OR REPLACE FUNCTION public.log_license_access(action TEXT, license_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log license access for audit purposes
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    metadata
  ) VALUES (
    auth.uid(),
    'LICENSE_' || action,
    'licenses',
    license_id,
    jsonb_build_object(
      'license_id', license_id,
      'accessing_user_id', auth.uid(),
      'timestamp', now(),
      'action_type', action
    )
  );
END;
$$;

-- 5. Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policy for audit_logs (only admins can view)
CREATE POLICY "audit_logs_admin_only" ON public.audit_logs
FOR SELECT TO authenticated
USING (public.is_verified_admin());

-- 8. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.is_verified_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_admin_profile_access(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_license_access(TEXT, UUID) TO authenticated;

-- 9. Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'ops_manager', 'deployment_engineer', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- 10. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 11. Create RLS policy for user_roles
CREATE POLICY "user_roles_secure" ON public.user_roles
FOR SELECT TO authenticated
USING (
  user_id = auth.uid() 
  OR public.is_verified_admin()
);

-- 12. Grant permissions on user_roles
GRANT SELECT ON public.user_roles TO authenticated;

-- 13. Insert default admin role for existing users if needed
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

-- 14. Verify functions are created
SELECT 
  'Functions created successfully' as status,
  COUNT(*) as function_count
FROM pg_proc 
WHERE proname IN ('is_verified_admin', 'has_role', 'log_admin_profile_access', 'log_license_access')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
