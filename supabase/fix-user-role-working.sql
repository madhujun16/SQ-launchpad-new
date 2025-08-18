-- Working User Role Fix Script
-- This script will create the necessary profile and role assignments

-- Step 1: First, let's see what users exist in the auth.users table
-- (You'll need to run this in Supabase SQL Editor)

-- Check existing auth users
SELECT id, email, created_at FROM auth.users;

-- Step 2: Create a profile for your user (replace 'your-email@example.com' with your actual email)
-- Run this AFTER you've signed up/logged in at least once

DO $$
DECLARE
    user_email TEXT := 'shivanshu.singh@thesmartq.com'; -- CHANGE THIS TO YOUR ACTUAL EMAIL
    auth_user_id UUID;
    profile_exists BOOLEAN;
BEGIN
    -- Get the auth user ID
    SELECT id INTO auth_user_id FROM auth.users WHERE email = user_email;
    
    IF auth_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found in auth.users. Please sign up first or check the email address.', user_email;
    END IF;
    
    -- Check if profile already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE user_id = auth_user_id) INTO profile_exists;
    
    IF NOT profile_exists THEN
        -- Create profile
        INSERT INTO public.profiles (id, user_id, email, full_name, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            auth_user_id,
            user_email,
            'Shivanshu Singh',
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Profile created for user %', user_email;
    ELSE
        RAISE NOTICE 'Profile already exists for user %', user_email;
    END IF;
    
    -- Step 3: Assign admin role (this is the key part)
    -- Check if user already has roles
    IF NOT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = auth_user_id) THEN
        -- Insert admin role
        INSERT INTO public.user_roles (id, user_id, role, created_at)
        VALUES (
            gen_random_uuid(),
            auth_user_id,
            'admin',
            NOW()
        );
        RAISE NOTICE 'Admin role assigned to user %', user_email;
    ELSE
        RAISE NOTICE 'User % already has roles assigned', user_email;
    END IF;
    
END $$;

-- Step 4: Verify the setup
-- Run this to check if everything worked
SELECT 
    p.email,
    p.full_name,
    ur.role,
    p.created_at
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
WHERE p.email = 'shivanshu.singh@thesmartq.com'; -- CHANGE THIS TO YOUR EMAIL
