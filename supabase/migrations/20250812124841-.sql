-- Fix the overly permissive "Allow email existence check for login" policy
-- This policy currently allows anyone to read ALL profile data, which is a security vulnerability

-- First, drop the existing overly permissive policy
DROP POLICY IF EXISTS "Allow email existence check for login" ON public.profiles;

-- Create a more secure policy that only allows checking email existence
-- without exposing other personal data
CREATE POLICY "Allow email existence check only" 
ON public.profiles 
FOR SELECT 
USING (
  -- Only allow unauthenticated users to check if an email exists
  -- by restricting the query to only return a boolean result
  -- This prevents exposure of actual profile data
  auth.role() = 'anon' AND 
  -- This will be used in conjunction with a security definer function
  -- that only returns whether an email exists without exposing data
  false -- Temporarily block until we create the secure function
);

-- Create a security definer function to safely check email existence
-- without exposing personal data
CREATE OR REPLACE FUNCTION public.check_email_exists(email_to_check text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE email = LOWER(email_to_check)
  );
$$;

-- Update the policy to use the secure function approach
-- Remove the previous policy and create a properly restricted one
DROP POLICY IF EXISTS "Allow email existence check only" ON public.profiles;

-- Create a policy that only allows authenticated users to see profiles
-- and admins to see all profiles
CREATE POLICY "Restricted profile access" 
ON public.profiles 
FOR SELECT 
USING (
  -- Users can only see their own profile
  (auth.role() = 'authenticated' AND auth.uid() = user_id) OR
  -- Admins can see all profiles
  (auth.role() = 'authenticated' AND is_admin())
);

-- Grant execute permission on the email check function to anonymous users
GRANT EXECUTE ON FUNCTION public.check_email_exists(text) TO anon;
GRANT EXECUTE ON FUNCTION public.check_email_exists(text) TO authenticated;