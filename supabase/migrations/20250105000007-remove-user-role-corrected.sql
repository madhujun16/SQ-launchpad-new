-- Corrected migration to remove 'user' role from app_role enum
-- Changes column type first, then updates data

-- Step 1: Drop app_role_new if it exists (from previous attempts)
DROP TYPE IF EXISTS public.app_role_new;

-- Step 2: Create a new enum without 'user' role
CREATE TYPE public.app_role_new AS ENUM ('admin', 'ops_manager', 'deployment_engineer');

-- Step 3: Temporarily disable RLS on user_roles to avoid policy conflicts
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Step 4: Change the column type first
ALTER TABLE public.user_roles 
  ALTER COLUMN role TYPE app_role_new 
  USING CASE 
    WHEN role::text = 'admin' THEN 'admin'::app_role_new
    WHEN role::text = 'ops_manager' THEN 'ops_manager'::app_role_new
    WHEN role::text = 'deployment_engineer' THEN 'deployment_engineer'::app_role_new
    ELSE 'admin'::app_role_new
  END;

-- Step 5: Drop the old enum
DROP TYPE public.app_role;

-- Step 6: Rename the new enum to the original name
ALTER TYPE public.app_role_new RENAME TO app_role;

-- Step 7: Re-enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 8: Update the has_role function to use the new enum
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

-- Step 9: Update the get_current_user_roles function
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

-- Step 10: Update the is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$; 