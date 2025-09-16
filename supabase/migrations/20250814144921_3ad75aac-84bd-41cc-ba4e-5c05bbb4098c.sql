-- Fix Employee Personal Information Security Issue
-- This migration implements stricter RLS policies for the profiles table
-- to prevent unauthorized access to employee personal information

-- First, drop the existing permissive policies
DROP POLICY IF EXISTS "Restricted profile access" ON public.profiles;
DROP POLICY IF EXISTS "Users can only insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can only update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Only admins can delete profiles" ON public.profiles;

-- Create a more secure function to check admin access
-- This function ensures only users with explicit admin role can access all profiles
CREATE OR REPLACE FUNCTION public.is_verified_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'::app_role
  );
$$;

-- Create strict RLS policies that only allow:
-- 1. Users to view/edit ONLY their own profile (no exceptions)
-- 2. Verified admins to manage all profiles (with explicit role check)

-- Policy for SELECT: Users can only see their own profile, admins can see all
CREATE POLICY "Secure profile access" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  (auth.uid() = user_id) OR 
  public.is_verified_admin()
);

-- Policy for INSERT: Users can only create their own profile, admins can create any
CREATE POLICY "Secure profile creation" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (
  (auth.uid() = user_id) OR 
  public.is_verified_admin()
);

-- Policy for UPDATE: Users can only update their own profile, admins can update any
CREATE POLICY "Secure profile updates" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (
  (auth.uid() = user_id) OR 
  public.is_verified_admin()
)
WITH CHECK (
  (auth.uid() = user_id) OR 
  public.is_verified_admin()
);

-- Policy for DELETE: Only verified admins can delete profiles
CREATE POLICY "Admin only profile deletion" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (public.is_verified_admin());

-- Add audit logging for profile access (security monitoring)
CREATE OR REPLACE FUNCTION public.log_profile_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log when admins access other users' profiles
  IF public.is_verified_admin() AND auth.uid() != NEW.user_id THEN
    INSERT INTO public.audit_logs (
      entity, 
      action, 
      user_id, 
      user_name, 
      details
    ) VALUES (
      'profiles',
      TG_OP,
      auth.uid(),
      (SELECT full_name FROM public.profiles WHERE user_id = auth.uid()),
      'Admin accessed profile for user: ' || NEW.user_id::text
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for audit logging
CREATE TRIGGER profile_access_audit_trigger
  AFTER SELECT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_profile_access();

CREATE TRIGGER profile_update_audit_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_profile_access();