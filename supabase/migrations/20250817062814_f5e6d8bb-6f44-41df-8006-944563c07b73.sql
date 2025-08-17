-- Check current policies on profiles table before cleanup
SELECT policyname, cmd, permissive, roles, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;

-- Fix Security Issue: Clean up ALL policies and recreate properly
-- First, disable RLS temporarily to ensure clean state
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies on profiles table (including any that might exist)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_record.policyname);
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create new secure, consolidated policies
-- Policy 1: Users can only view their own profile, verified admins can view all with audit
CREATE POLICY "profiles_secure_select" ON public.profiles
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() 
  OR 
  (is_verified_admin() AND log_admin_profile_access('SELECT', user_id) IS NULL)
);

-- Policy 2: Users can only update their own profile, verified admins can update any with audit  
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

-- Policy 3: Users can insert their own profile, verified admins can insert any
CREATE POLICY "profiles_secure_insert" ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  OR 
  is_verified_admin()
);

-- Policy 4: Only verified admins can delete profiles with mandatory audit
CREATE POLICY "profiles_secure_delete" ON public.profiles
FOR DELETE
TO authenticated
USING (
  is_verified_admin() 
  AND 
  log_admin_profile_access('DELETE', user_id) IS NULL
);

-- Ensure user_id cannot be null to prevent RLS bypass
ALTER TABLE public.profiles 
ALTER COLUMN user_id SET NOT NULL;

-- Verify the new policies
SELECT 'Security fix applied: Profiles table now has 4 consolidated, secure RLS policies' as status,
       COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles';