-- =====================================================
-- SmartQ Launchpad CG - Seed Users Data Script
-- This script adds sample users with different roles for testing
-- Run this in your Supabase SQL Editor
-- =====================================================

-- First, let's check if we have any existing users
SELECT 'CURRENT USERS' as info, COUNT(*) as count FROM auth.users;
SELECT 'CURRENT PROFILES' as info, COUNT(*) as count FROM public.profiles;
SELECT 'CURRENT USER ROLES' as info, COUNT(*) as count FROM public.user_roles;

-- Insert sample users into auth.users (if they don't exist)
-- Note: In a real scenario, these users would be created through Supabase Auth
-- For testing purposes, we'll assume they exist or create them manually

-- Insert profiles for the sample users
INSERT INTO public.profiles (user_id, email, full_name, invited_at, invited_by)
VALUES 
  -- Admin users
  (
    gen_random_uuid(),
    'admin@smartq.com',
    'System Administrator',
    now(),
    NULL
  ),
  (
    gen_random_uuid(),
    'shivanshu.admin@smartq.com',
    'Shivanshu Singh (Admin)',
    now(),
    NULL
  ),
  
  -- Ops Manager users
  (
    gen_random_uuid(),
    'ops.manager1@smartq.com',
    'Jessica Cleaver',
    now(),
    NULL
  ),
  (
    gen_random_uuid(),
    'ops.manager2@smartq.com',
    'Mike Thompson',
    now(),
    NULL
  ),
  (
    gen_random_uuid(),
    'ops.manager3@smartq.com',
    'Sarah Johnson',
    now(),
    NULL
  ),
  (
    gen_random_uuid(),
    'madhusudhan.ops@smartq.com',
    'Madhusudhan (Ops Manager)',
    now(),
    NULL
  ),
  
  -- Deployment Engineer users
  (
    gen_random_uuid(),
    'deployment.engineer1@smartq.com',
    'John Smith',
    now(),
    NULL
  ),
  (
    gen_random_uuid(),
    'deployment.engineer2@smartq.com',
    'Emma Wilson',
    now(),
    NULL
  ),
  (
    gen_random_uuid(),
    'deployment.engineer3@smartq.com',
    'David Brown',
    now(),
    NULL
  ),
  (
    gen_random_uuid(),
    'madhusudhan.deployment@smartq.com',
    'Madhusudhan (Deployment Engineer)',
    now(),
    NULL
  )
ON CONFLICT (email) DO NOTHING;

-- Get the user IDs we just created to assign roles
WITH new_users AS (
  SELECT user_id, email, full_name
  FROM public.profiles 
  WHERE email IN (
    'admin@smartq.com',
    'shivanshu.admin@smartq.com',
    'ops.manager1@smartq.com',
    'ops.manager2@smartq.com',
    'ops.manager3@smartq.com',
    'madhusudhan.ops@smartq.com',
    'deployment.engineer1@smartq.com',
    'deployment.engineer2@smartq.com',
    'deployment.engineer3@smartq.com',
    'madhusudhan.deployment@smartq.com'
  )
)
-- Insert roles for the users
INSERT INTO public.user_roles (user_id, role, assigned_at)
SELECT 
  user_id,
  CASE 
    WHEN email LIKE '%admin%' THEN 'admin'::app_role
    WHEN email LIKE '%ops%' THEN 'ops_manager'::app_role
    WHEN email LIKE '%deployment%' THEN 'deployment_engineer'::app_role
    ELSE 'admin'::app_role
  END,
  now()
FROM new_users
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify the data was inserted correctly
SELECT 
  'USERS WITH ROLES' as info,
  p.email,
  p.full_name,
  ur.role,
  ur.assigned_at
FROM public.profiles p
JOIN public.user_roles ur ON p.user_id = ur.user_id
WHERE p.email IN (
  'admin@smartq.com',
  'shivanshu.admin@smartq.com',
  'ops.manager1@smartq.com',
  'ops.manager2@smartq.com',
  'ops.manager3@smartq.com',
  'madhusudhan.ops@smartq.com',
  'deployment.engineer1@smartq.com',
  'deployment.engineer2@smartq.com',
  'deployment.engineer3@smartq.com',
  'madhusudhan.deployment@smartq.com'
)
ORDER BY p.email;

-- Show summary counts
SELECT 
  'FINAL COUNTS' as info,
  COUNT(DISTINCT p.user_id) as total_users,
  COUNT(CASE WHEN ur.role = 'admin' THEN 1 END) as admin_users,
  COUNT(CASE WHEN ur.role = 'ops_manager' THEN 1 END) as ops_manager_users,
  COUNT(CASE WHEN ur.role = 'deployment_engineer' THEN 1 END) as deployment_engineer_users
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id;
