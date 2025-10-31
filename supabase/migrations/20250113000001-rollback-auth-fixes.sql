-- Rollback authentication fixes that are causing issues
-- This migration reverts the problematic changes

-- Drop the new OTP verification trigger that might be causing issues
DROP TRIGGER IF EXISTS on_auth_user_signin ON auth.users;
DROP FUNCTION IF EXISTS public.handle_otp_verification();

-- Revert to a simpler version of handle_new_user that doesn't interfere with existing users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a minimal, non-interfering version
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple insert without complex error handling that might interfere
  INSERT INTO public.profiles (
    user_id, 
    email, 
    full_name,
    created_at,
    updated_at,
    is_active,
    welcome_email_sent
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    now(),
    now(),
    true,
    false
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If profile already exists, just return NEW without error
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail
    RAISE WARNING 'Profile creation failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Clean up any problematic profiles that might be causing issues
-- This will fix any incomplete profiles without breaking existing ones
UPDATE public.profiles 
SET 
  full_name = COALESCE(full_name, split_part(email, '@', 1)),
  is_active = COALESCE(is_active, true),
  welcome_email_sent = COALESCE(welcome_email_sent, false),
  updated_at = now()
WHERE 
  full_name IS NULL 
  OR is_active IS NULL 
  OR welcome_email_sent IS NULL;

-- Ensure all existing users have proper profiles
INSERT INTO public.profiles (
  user_id,
  email,
  full_name,
  created_at,
  updated_at,
  is_active,
  welcome_email_sent
)
SELECT 
  au.id,
  au.email,
  split_part(au.email, '@', 1),
  now(),
  now(),
  true,
  false
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id
WHERE p.user_id IS NULL
  AND au.email_confirmed_at IS NOT NULL;
