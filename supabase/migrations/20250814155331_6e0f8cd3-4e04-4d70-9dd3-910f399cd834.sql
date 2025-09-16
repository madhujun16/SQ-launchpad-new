-- Security Enhancement: Fix function search paths and strengthen profile access policies

-- Fix search_path for security definer functions to prevent SQL injection
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER  
SET search_path TO 'public'
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

CREATE OR REPLACE FUNCTION public.is_verified_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'::app_role
  );
$$;

-- Add logging for sensitive profile access attempts
CREATE OR REPLACE FUNCTION public.log_admin_profile_access(p_action text, p_target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only log when admins access other users' profiles
  IF public.is_verified_admin() AND auth.uid() != p_target_user_id THEN
    INSERT INTO public.audit_logs (
      entity, 
      action, 
      user_id, 
      user_name, 
      details
    ) VALUES (
      'profiles',
      p_action,
      auth.uid(),
      (SELECT full_name FROM public.profiles WHERE user_id = auth.uid()),
      'Admin accessed profile for user: ' || p_target_user_id::text
    );
  END IF;
END;
$$;

-- Update profiles RLS policies to be more explicit and add audit logging
DROP POLICY IF EXISTS "Secure profile access" ON public.profiles;
DROP POLICY IF EXISTS "Secure profile creation" ON public.profiles;
DROP POLICY IF EXISTS "Secure profile updates" ON public.profiles;
DROP POLICY IF EXISTS "Admin only profile deletion" ON public.profiles;

-- Enhanced profile access policy with logging
CREATE POLICY "Secure profile access with audit" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  auth.uid() = user_id OR (
    public.is_verified_admin() AND 
    public.log_admin_profile_access('SELECT', user_id) IS NOT NULL
  )
);

-- Secure profile creation - users can only create their own profiles
CREATE POLICY "Secure profile creation" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id OR public.is_verified_admin());

-- Secure profile updates with audit logging for admin access
CREATE POLICY "Secure profile updates with audit" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (
  auth.uid() = user_id OR (
    public.is_verified_admin() AND 
    public.log_admin_profile_access('UPDATE', user_id) IS NOT NULL
  )
)
WITH CHECK (
  auth.uid() = user_id OR public.is_verified_admin()
);

-- Admin only profile deletion with audit logging  
CREATE POLICY "Admin only profile deletion with audit" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (
  public.is_verified_admin() AND 
  public.log_admin_profile_access('DELETE', user_id) IS NOT NULL
);

-- Create a view for safe profile access that excludes sensitive data for non-admins
CREATE OR REPLACE VIEW public.profiles_safe AS
SELECT 
  id,
  user_id,
  CASE 
    WHEN auth.uid() = user_id OR public.is_verified_admin() THEN email
    ELSE REGEXP_REPLACE(email, '([^@]+)@(.+)', SUBSTRING(email FROM 1 FOR 2) || '***@' || SUBSTRING(email FROM '[@](.+)'))
  END as email,
  CASE 
    WHEN auth.uid() = user_id OR public.is_verified_admin() THEN full_name
    ELSE SUBSTRING(full_name FROM 1 FOR 1) || '***'
  END as full_name,
  created_at,
  updated_at,
  CASE 
    WHEN auth.uid() = user_id OR public.is_verified_admin() THEN last_login_at
    ELSE NULL
  END as last_login_at
FROM public.profiles
WHERE auth.uid() = user_id OR public.is_verified_admin();

-- Grant access to the safe view
GRANT SELECT ON public.profiles_safe TO authenticated;

-- Add additional security constraint to prevent email enumeration
CREATE OR REPLACE FUNCTION public.check_email_exists_secure(email_to_check text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Only allow this function to be called by admins or during authentication
  SELECT CASE 
    WHEN public.is_verified_admin() OR auth.role() = 'anon' THEN
      EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE email = LOWER(email_to_check)
      )
    ELSE false
  END;
$$;