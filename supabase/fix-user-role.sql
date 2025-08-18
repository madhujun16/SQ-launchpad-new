-- Fix User Role Assignment Script
-- This script will create a user profile and assign admin role if they don't exist

-- First, create a profile for the current user (replace with your actual email)
-- You can change this email to match what you're using to log in
DO $$
DECLARE
    user_email TEXT := 'shivanshu.singh@thesmartq.com'; -- Change this to your email
    user_profile_id UUID;
    user_auth_id UUID;
BEGIN
    -- Check if profile already exists
    SELECT id INTO user_profile_id FROM public.profiles WHERE email = user_email;
    
    IF user_profile_id IS NULL THEN
        -- Create a new profile
        INSERT INTO public.profiles (id, user_id, email, full_name, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            gen_random_uuid(), -- This will be replaced when you actually sign up
            user_email,
            'Shivanshu Singh',
            now(),
            now()
        )
        RETURNING id INTO user_profile_id;
        
        RAISE NOTICE 'Created new profile with ID: %', user_profile_id;
    ELSE
        RAISE NOTICE 'Profile already exists with ID: %', user_profile_id;
    END IF;
    
    -- Check if user role already exists
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = user_profile_id AND role = 'admin') THEN
        -- Assign admin role
        INSERT INTO public.user_roles (id, user_id, role, assigned_by, assigned_at, created_at)
        VALUES (
            gen_random_uuid(),
            user_profile_id,
            'admin',
            NULL,
            now(),
            now()
        );
        
        RAISE NOTICE 'Assigned admin role to user: %', user_email;
    ELSE
        RAISE NOTICE 'Admin role already assigned to user: %', user_email;
    END IF;
    
    -- Also assign other roles for testing
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = user_profile_id AND role = 'ops_manager') THEN
        INSERT INTO public.user_roles (id, user_id, role, assigned_by, assigned_at, created_at)
        VALUES (
            gen_random_uuid(),
            user_profile_id,
            'ops_manager',
            NULL,
            now(),
            now()
        );
        RAISE NOTICE 'Assigned ops_manager role to user: %', user_email;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = user_profile_id AND role = 'deployment_engineer') THEN
        INSERT INTO public.user_roles (id, user_id, role, assigned_by, assigned_at, created_at)
        VALUES (
            gen_random_uuid(),
            user_profile_id,
            'deployment_engineer',
            NULL,
            now(),
            now()
        );
        RAISE NOTICE 'Assigned deployment_engineer role to user: %', user_email;
    END IF;
    
END $$;

-- Show current user roles
SELECT 
    p.email,
    p.full_name,
    ur.role,
    ur.assigned_at
FROM public.profiles p
JOIN public.user_roles ur ON p.id = ur.user_id
WHERE p.email = 'shivanshu.singh@thesmartq.com' -- Change this to your email
ORDER BY ur.assigned_at;
