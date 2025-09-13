-- Fix user profile creation to handle edge cases and prevent errors
-- This migration addresses the "Database error saving new user" issue

-- Drop the existing function and recreate it with better error handling
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a more robust user profile creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Use INSERT ... ON CONFLICT to handle duplicate user_id cases
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
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = now(),
    last_login_at = now();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add a function to manually fix existing problematic users
CREATE OR REPLACE FUNCTION public.fix_user_profile(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  auth_user_id UUID;
  profile_exists BOOLEAN;
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO auth_user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF auth_user_id IS NULL THEN
    RAISE WARNING 'User with email % not found in auth.users', user_email;
    RETURN FALSE;
  END IF;
  
  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE user_id = auth_user_id) INTO profile_exists;
  
  IF NOT profile_exists THEN
    -- Create the missing profile
    INSERT INTO public.profiles (
      user_id,
      email,
      full_name,
      created_at,
      updated_at,
      is_active,
      welcome_email_sent
    ) VALUES (
      auth_user_id,
      user_email,
      split_part(user_email, '@', 1),
      now(),
      now(),
      true,
      false
    );
    
    RAISE NOTICE 'Created missing profile for user %', user_email;
    RETURN TRUE;
  ELSE
    RAISE NOTICE 'Profile already exists for user %', user_email;
    RETURN TRUE;
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to fix profile for user %: %', user_email, SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix the specific problematic user
SELECT public.fix_user_profile('Fluck.Alwa@thesmartq.com');

-- Add better error handling for OTP verification
CREATE OR REPLACE FUNCTION public.handle_otp_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last_login_at when user signs in
  UPDATE public.profiles 
  SET 
    last_login_at = now(),
    updated_at = now()
  WHERE user_id = NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail the OTP verification if profile update fails
    RAISE WARNING 'Failed to update login time for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create trigger for OTP verification
DROP TRIGGER IF EXISTS on_auth_user_signin ON auth.users;
CREATE TRIGGER on_auth_user_signin
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW 
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_otp_verification();
