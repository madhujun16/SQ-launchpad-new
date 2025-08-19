-- Fix User Profile Script
-- This script will check and fix the user profile for the current user

-- First, let's check what's in the profiles table
SELECT * FROM profiles WHERE user_id = 'e6aa5481-08d8-443a-9c7b-b836d4ff9391';

-- Check if the profile exists
DO $$
BEGIN
    -- Check if profile exists
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = 'e6aa5481-08d8-443a-9c7b-b836d4ff9391') THEN
        -- Insert a new profile
        INSERT INTO profiles (
            id,
            user_id,
            full_name,
            email,
            created_at,
            updated_at,
            invited_at,
            invited_by,
            last_login_at,
            welcome_email_sent
        ) VALUES (
            'e6aa5481-08d8-443a-9c7b-b836d4ff9391',
            'e6aa5481-08d8-443a-9c7b-b836d4ff9391',
            'shivanshu.singh@thesmartq.com',
            'shivanshu.singh@thesmartq.com',
            NOW(),
            NOW(),
            NOW(),
            'system',
            NOW(),
            false
        );
        RAISE NOTICE 'Profile created for user e6aa5481-08d8-443a-9c7b-b836d4ff9391';
    ELSE
        -- Update existing profile
        UPDATE profiles 
        SET 
            full_name = 'shivanshu.singh@thesmartq.com',
            email = 'shivanshu.singh@thesmartq.com',
            updated_at = NOW()
        WHERE user_id = 'e6aa5481-08d8-443a-9c7b-b836d4ff9391';
        RAISE NOTICE 'Profile updated for user e6aa5481-08d8-443a-9c7b-b836d4ff9391';
    END IF;
END $$;

-- Verify the profile was created/updated
SELECT * FROM profiles WHERE user_id = 'e6aa5481-08d8-443a-9c7b-b836d4ff9391';

-- Also check user_roles table
SELECT * FROM user_roles WHERE user_id = 'e6aa5481-08d8-443a-9c7b-b836d4ff9391';

-- Make sure user has admin role
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = 'e6aa5481-08d8-443a-9c7b-b836d4ff9391' AND role = 'admin') THEN
        INSERT INTO user_roles (user_id, role) VALUES ('e6aa5481-08d8-443a-9c7b-b836d4ff9391', 'admin');
        RAISE NOTICE 'Admin role assigned to user e6aa5481-08d8-443a-9c7b-b836d4ff9391';
    END IF;
END $$;

-- Final verification
SELECT 
    p.id,
    p.user_id,
    p.full_name,
    p.email,
    ur.role
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
WHERE p.user_id = 'e6aa5481-08d8-443a-9c7b-b836d4ff9391';
