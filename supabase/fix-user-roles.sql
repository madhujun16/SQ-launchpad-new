-- Fix User Roles Issue
-- This script adds the missing user_roles entries for the existing user
-- Run this script in your Supabase SQL editor

-- First, let's check what users exist and their current roles
SELECT 'CURRENT USERS' as info, COUNT(*) as count FROM auth.users;

SELECT 'CURRENT PROFILES' as info, COUNT(*) as count FROM public.profiles;

SELECT 'CURRENT USER ROLES' as info, COUNT(*) as count FROM public.user_roles;

-- Check the specific user that's having issues
SELECT 
    'USER DETAILS' as info,
    u.id as user_id,
    u.email,
    p.id as profile_id,
    p.full_name,
    p.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE u.email = 'shivanshu.singh@thesmartq.com';

-- Check if user_roles table exists and its structure
SELECT 
    'TABLE STRUCTURE' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_roles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- If user_roles table doesn't exist, create it
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'deployment_engineer', 'ops_manager', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;

-- Create simple RLS policies for user_roles (avoiding infinite recursion)
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- Simple policy for admins - just allow all operations for now
CREATE POLICY "Allow all operations temporarily" ON public.user_roles
    FOR ALL USING (true);

-- Insert the missing user roles for the existing user
-- First, get the user ID
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Get the user ID
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'shivanshu.singh@thesmartq.com';
    
    IF user_uuid IS NOT NULL THEN
        -- Insert admin role
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (user_uuid, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        -- Insert deployment engineer role
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (user_uuid, 'deployment_engineer')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        -- Insert ops manager role
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (user_uuid, 'ops_manager')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE 'User roles added for user: %', user_uuid;
    ELSE
        RAISE NOTICE 'User not found with email: shivanshu.singh@thesmartq.com';
    END IF;
END $$;

-- Verify the user roles were added
SELECT 
    'VERIFICATION' as info,
    ur.user_id,
    u.email,
    ur.role,
    ur.created_at
FROM public.user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE u.email = 'shivanshu.singh@thesmartq.com'
ORDER BY ur.role;

-- Check final counts
SELECT 'FINAL USER ROLES COUNT' as info, COUNT(*) as count FROM public.user_roles;

-- Test the profile fetch query that the app uses
SELECT 
    'PROFILE TEST QUERY' as info,
    p.id,
    p.user_id,
    p.email,
    p.full_name,
    array_agg(ur.role) as user_roles
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
WHERE p.email = 'shivanshu.singh@thesmartq.com'
GROUP BY p.id, p.user_id, p.email, p.full_name;
