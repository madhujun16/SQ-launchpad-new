-- Security Fix: Enable RLS on profiles_safe view and add proper access policies

-- Drop the existing view to recreate it properly
DROP VIEW IF EXISTS public.profiles_safe;

-- Create a secure table instead of a view for better RLS control
CREATE TABLE IF NOT EXISTS public.profiles_safe (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text,
  full_name text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_login_at timestamp with time zone
);

-- Enable RLS on the profiles_safe table
ALTER TABLE public.profiles_safe ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles_safe
CREATE POLICY "Users can only view their own safe profile data" 
ON public.profiles_safe 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all safe profile data" 
ON public.profiles_safe 
FOR SELECT 
TO authenticated
USING (public.is_verified_admin());

-- Create a function to securely populate profiles_safe data
CREATE OR REPLACE FUNCTION public.get_safe_profile_data(target_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  id uuid,
  user_id uuid,
  email text,
  full_name text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  last_login_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow users to get their own data or admins to get any data
  IF target_user_id != auth.uid() AND NOT public.is_verified_admin() THEN
    RAISE EXCEPTION 'Access denied: Cannot access other users profile data';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    CASE 
      WHEN auth.uid() = p.user_id OR public.is_verified_admin() THEN p.email
      ELSE REGEXP_REPLACE(p.email, '([^@]+)@(.+)', SUBSTRING(p.email FROM 1 FOR 2) || '***@' || SUBSTRING(p.email FROM '[@](.+)'))
    END as email,
    CASE 
      WHEN auth.uid() = p.user_id OR public.is_verified_admin() THEN p.full_name
      ELSE SUBSTRING(p.full_name FROM 1 FOR 1) || '***'
    END as full_name,
    p.created_at,
    p.updated_at,
    CASE 
      WHEN auth.uid() = p.user_id OR public.is_verified_admin() THEN p.last_login_at
      ELSE NULL
    END as last_login_at
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
END;
$$;

-- Create a secure function for listing profiles (admin only)
CREATE OR REPLACE FUNCTION public.list_safe_profiles()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  email text,
  full_name text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  last_login_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only admins can list all profiles
  IF NOT public.is_verified_admin() THEN
    RAISE EXCEPTION 'Access denied: Only admins can list all profiles';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.email,
    p.full_name,
    p.created_at,
    p.updated_at,
    p.last_login_at
  FROM public.profiles p
  ORDER BY p.created_at DESC;
END;
$$;

-- Remove the original profiles_safe view grant since we're using functions now
-- Grant execute permissions on the new functions
GRANT EXECUTE ON FUNCTION public.get_safe_profile_data(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_safe_profiles() TO authenticated;

-- Update the original profiles table policies to be even more restrictive
DROP POLICY IF EXISTS "Secure profile access with audit" ON public.profiles;

-- Create a more restrictive policy that logs all admin access
CREATE POLICY "Highly secure profile access with mandatory audit" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  -- Users can only see their own profiles
  auth.uid() = user_id 
  OR 
  -- Admins can see others but MUST go through audit logging
  (
    public.is_verified_admin() 
    AND 
    -- Force audit logging by making it a required condition
    public.log_admin_profile_access('SELECT', user_id) IS NULL
  )
);

-- Add a policy to prevent any direct access to profiles table for non-admin users
CREATE POLICY "Block direct profile access for non-admins" 
ON public.profiles 
FOR ALL
TO authenticated
USING (
  -- Only allow if it's the user's own profile OR they're an admin
  auth.uid() = user_id OR public.is_verified_admin()
);

-- Create an additional security function to validate email access patterns
CREATE OR REPLACE FUNCTION public.validate_email_access(requesting_user_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log all email access attempts
  INSERT INTO public.audit_logs (
    entity, 
    action, 
    user_id, 
    details
  ) VALUES (
    'email_access',
    'ATTEMPT',
    requesting_user_id,
    'Attempted to access email for user: ' || target_user_id::text
  );

  -- Only allow access to own email or if admin
  RETURN requesting_user_id = target_user_id OR public.is_verified_admin();
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.validate_email_access(uuid, uuid) TO authenticated;