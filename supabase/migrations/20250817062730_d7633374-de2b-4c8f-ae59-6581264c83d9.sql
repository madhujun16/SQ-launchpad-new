-- Fix Security Issue: Clean up conflicting RLS policies on profiles table
-- Remove all existing policies and create a clean, secure set

-- Drop all existing conflicting policies on profiles table
DROP POLICY IF EXISTS "Admin only profile deletion with audit" ON public.profiles;
DROP POLICY IF EXISTS "Block direct profile access for non-admins" ON public.profiles;
DROP POLICY IF EXISTS "Highly secure profile access with mandatory audit" ON public.profiles;
DROP POLICY IF EXISTS "Secure profile creation" ON public.profiles;
DROP POLICY IF EXISTS "Secure profile updates with audit" ON public.profiles;
DROP POLICY IF EXISTS "profiles: admin can delete" ON public.profiles;
DROP POLICY IF EXISTS "profiles: admin can delete (auth)" ON public.profiles;
DROP POLICY IF EXISTS "profiles: admin can read all" ON public.profiles;
DROP POLICY IF EXISTS "profiles: admin can read all (auth)" ON public.profiles;
DROP POLICY IF EXISTS "profiles: user can insert self" ON public.profiles;
DROP POLICY IF EXISTS "profiles: user can insert self (auth)" ON public.profiles;
DROP POLICY IF EXISTS "profiles: user can read own" ON public.profiles;
DROP POLICY IF EXISTS "profiles: user can read own (auth)" ON public.profiles;
DROP POLICY IF EXISTS "profiles: user/admin can update" ON public.profiles;
DROP POLICY IF EXISTS "profiles: user/admin can update (auth)" ON public.profiles;

-- Create secure, consolidated RLS policies for profiles table
-- Policy 1: Users can only view their own profile, admins can view all with audit logging
CREATE POLICY "profiles_secure_select" ON public.profiles
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() 
  OR 
  (is_verified_admin() AND log_admin_profile_access('SELECT', user_id) IS NULL)
);

-- Policy 2: Users can only update their own profile, admins can update any with audit logging  
CREATE POLICY "profiles_secure_update" ON public.profiles
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() 
  OR 
  (is_verified_admin() AND log_admin_profile_access('UPDATE', user_id) IS NULL)
)
WITH CHECK (
  user_id = auth.uid() 
  OR 
  is_verified_admin()
);

-- Policy 3: Users can insert their own profile, admins can insert any profile
CREATE POLICY "profiles_secure_insert" ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  OR 
  is_verified_admin()
);

-- Policy 4: Only verified admins can delete profiles with mandatory audit logging
CREATE POLICY "profiles_secure_delete" ON public.profiles
FOR DELETE
TO authenticated
USING (
  is_verified_admin() 
  AND 
  log_admin_profile_access('DELETE', user_id) IS NULL
);

-- Ensure RLS is enabled on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create a helper function to validate profile access for extra security
CREATE OR REPLACE FUNCTION public.validate_profile_access(target_user_id UUID, action TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log all profile access attempts for security monitoring
  INSERT INTO public.audit_logs (
    user_id, 
    action, 
    table_name, 
    record_id, 
    metadata
  ) VALUES (
    auth.uid(),
    action || '_PROFILE_ACCESS',
    'profiles',
    target_user_id,
    jsonb_build_object(
      'target_user_id', target_user_id,
      'requesting_user_id', auth.uid(),
      'timestamp', now(),
      'is_admin', is_verified_admin()
    )
  );

  -- Only allow access to own profile or if verified admin
  RETURN target_user_id = auth.uid() OR is_verified_admin();
END;
$$;

-- Add additional security constraint to ensure user_id cannot be null
-- This prevents potential RLS bypass through NULL values
ALTER TABLE public.profiles 
ALTER COLUMN user_id SET NOT NULL;

-- Success message
SELECT 'Profiles table RLS policies have been consolidated and secured. Users can only access their own data, verified admins can access all data with audit logging.' as message;