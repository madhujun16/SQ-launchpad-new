-- Alternative approach to remove 'user' role from app_role enum
-- This approach is more conservative and should work even if there are constraints

-- First, delete any existing user_roles with 'user' role
DELETE FROM public.user_roles WHERE role = 'user';

-- Temporarily disable any foreign key constraints that might reference the enum
-- (This step might not be necessary but ensures compatibility)

-- Create a new enum without 'user' role
CREATE TYPE public.app_role_new AS ENUM ('admin', 'ops_manager', 'deployment_engineer');

-- Update the user_roles table to use the new enum with explicit casting
UPDATE public.user_roles SET role = 'admin'::app_role_new WHERE role::text = 'admin';
UPDATE public.user_roles SET role = 'ops_manager'::app_role_new WHERE role::text = 'ops_manager';
UPDATE public.user_roles SET role = 'deployment_engineer'::app_role_new WHERE role::text = 'deployment_engineer';

-- Now alter the column type
ALTER TABLE public.user_roles 
  ALTER COLUMN role TYPE app_role_new 
  USING role::app_role_new;

-- Drop the old enum
DROP TYPE public.app_role;

-- Rename the new enum to the original name
ALTER TYPE public.app_role_new RENAME TO app_role; 