-- CRITICAL SECURITY FIX: Remove Profile Data Harvesting Vulnerability
-- This migration fixes the "Employee Email Addresses Could Be Harvested by Attackers" issue
-- by ensuring only the most restrictive profile access policy remains active

-- =====================================================
-- STEP 1: Remove ALL policies that might allow broader profile access
-- =====================================================

-- Remove the problematic "Enable insert access for authenticated users" policy
-- This policy might be allowing broader access than intended
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.profiles;

-- Remove any other potentially permissive policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profile access" ON public.profiles;

-- =====================================================
-- STEP 2: Ensure ONLY the most restrictive policies remain
-- =====================================================

-- The "Restricted profile access" policy should be the ONLY SELECT policy
-- It already exists and correctly restricts access to:
-- 1. Users can only see their own profile (auth.uid() = user_id)
-- 2. Admins can see all profiles (is_admin())

-- Create a more restrictive INSERT policy for profiles
-- Only allow users to create their own profile OR admins to create any profile
CREATE POLICY "Users can only insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  (auth.role() = 'authenticated' AND auth.uid() = user_id) OR 
  (auth.role() = 'authenticated' AND is_admin())
);

-- Create a more restrictive UPDATE policy for profiles
-- Only allow users to update their own profile OR admins to update any profile
DROP POLICY IF EXISTS "Users can only update their own profile" ON public.profiles;
CREATE POLICY "Users can only update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (
  (auth.role() = 'authenticated' AND auth.uid() = user_id) OR 
  (auth.role() = 'authenticated' AND is_admin())
);

-- Create a more restrictive DELETE policy for profiles
-- Only allow admins to delete profiles
CREATE POLICY "Only admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (auth.role() = 'authenticated' AND is_admin());

-- =====================================================
-- STEP 3: Verify no other policies allow broader access
-- =====================================================

-- Remove the existing admin update policy as we've replaced it with a more specific one
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;

-- Remove the existing admin insert policy as we've replaced it with a more specific one  
DROP POLICY IF EXISTS "Admins can insert new profiles" ON public.profiles;

-- =====================================================
-- VERIFICATION: After this migration, the ONLY policies should be:
-- 1. "Restricted profile access" (SELECT) - Users see own, admins see all
-- 2. "Users can only insert their own profile" (INSERT) - Users create own, admins create any
-- 3. "Users can only update their own profile" (UPDATE) - Users update own, admins update any
-- 4. "Only admins can delete profiles" (DELETE) - Only admins can delete
-- =====================================================