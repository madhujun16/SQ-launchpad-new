-- Remove 'user' role from app_role enum
-- First, delete any existing user_roles with 'user' role
DELETE FROM public.user_roles WHERE role = 'user';

-- Create a new enum without 'user' role
CREATE TYPE public.app_role_new AS ENUM ('admin', 'ops_manager', 'deployment_engineer');

-- Update the user_roles table to use the new enum
-- Use a more explicit cast to ensure the type conversion works
ALTER TABLE public.user_roles 
  ALTER COLUMN role TYPE app_role_new 
  USING CASE 
    WHEN role::text = 'admin' THEN 'admin'::app_role_new
    WHEN role::text = 'ops_manager' THEN 'ops_manager'::app_role_new
    WHEN role::text = 'deployment_engineer' THEN 'deployment_engineer'::app_role_new
    ELSE 'admin'::app_role_new  -- fallback for any unexpected values
  END;

-- Drop the old enum
DROP TYPE public.app_role;

-- Rename the new enum to the original name
ALTER TYPE public.app_role_new RENAME TO app_role; 