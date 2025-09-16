-- Fixed migration to remove 'user' role from app_role enum
-- This handles RLS policy dependencies properly

-- Step 1: First, let's check if 'user' role exists and delete any references
-- (This will fail if 'user' doesn't exist, which is fine)
DO $$
BEGIN
  -- Try to delete any user_roles with 'user' role (will fail silently if role doesn't exist)
  DELETE FROM public.user_roles WHERE role = 'user'::app_role;
EXCEPTION
  WHEN invalid_parameter_value THEN
    -- Role doesn't exist, which is fine
    NULL;
END $$;

-- Step 2: Create a new enum without 'user' role
CREATE TYPE public.app_role_new AS ENUM ('admin', 'ops_manager', 'deployment_engineer');

-- Step 3: Temporarily disable RLS on user_roles to avoid policy conflicts
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Step 4: Update existing records with explicit casting
UPDATE public.user_roles SET role = 'admin'::app_role_new WHERE role::text = 'admin';
UPDATE public.user_roles SET role = 'ops_manager'::app_role_new WHERE role::text = 'ops_manager';
UPDATE public.user_roles SET role = 'deployment_engineer'::app_role_new WHERE role::text = 'deployment_engineer';

-- Step 5: Now alter the column type
ALTER TABLE public.user_roles 
  ALTER COLUMN role TYPE app_role_new 
  USING role::app_role_new;

-- Step 6: Drop the old enum
DROP TYPE public.app_role;

-- Step 7: Rename the new enum to the original name
ALTER TYPE public.app_role_new RENAME TO app_role;

-- Step 8: Re-enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

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