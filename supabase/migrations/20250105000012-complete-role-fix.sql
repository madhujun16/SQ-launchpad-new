-- Complete migration to fix role enum and RLS policies
-- Handles both enum update and infinite recursion fix

-- Step 1: Drop app_role_new if it exists (from previous attempts)
DROP TYPE IF EXISTS public.app_role_new;

-- Step 2: Create a new enum without 'user' role
CREATE TYPE public.app_role_new AS ENUM ('admin', 'ops_manager', 'deployment_engineer');

-- Step 3: Drop ALL RLS policies that might cause conflicts
-- Drop user_roles policies
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Drop licenses policies
DROP POLICY IF EXISTS "Admins can manage licenses" ON public.licenses;
DROP POLICY IF EXISTS "Anyone can view licenses" ON public.licenses;

-- Step 4: Temporarily disable RLS on tables
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 5: Change the column type
ALTER TABLE public.user_roles 
  ALTER COLUMN role TYPE app_role_new 
  USING CASE 
    WHEN role::text = 'admin' THEN 'admin'::app_role_new
    WHEN role::text = 'ops_manager' THEN 'ops_manager'::app_role_new
    WHEN role::text = 'deployment_engineer' THEN 'deployment_engineer'::app_role_new
    ELSE 'admin'::app_role_new
  END;

-- Step 6: Drop the old enum
DROP TYPE public.app_role;

-- Step 7: Rename the new enum to the original name
ALTER TYPE public.app_role_new RENAME TO app_role;

-- Step 8: Re-enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 9: Update the has_role function to use the new enum
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Step 10: Update the get_current_user_roles function
CREATE OR REPLACE FUNCTION public.get_current_user_roles()
RETURNS app_role[]
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT ARRAY_AGG(role) 
  FROM public.user_roles 
  WHERE user_id = auth.uid()
$$;

-- Step 11: Update the is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- Step 12: Create new, simplified policies that avoid infinite recursion
-- Policy for users to view their own roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy for admins to view all roles
CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Policy for admins to insert roles
CREATE POLICY "Admins can insert roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policy for admins to update roles
CREATE POLICY "Admins can update roles" 
ON public.user_roles 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Policy for admins to delete roles
CREATE POLICY "Admins can delete roles" 
ON public.user_roles 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- Step 13: Recreate the RLS policies for licenses
CREATE POLICY "Anyone can view licenses" ON public.licenses FOR SELECT USING (true);
CREATE POLICY "Admins can manage licenses" ON public.licenses FOR ALL USING (public.is_admin()); 