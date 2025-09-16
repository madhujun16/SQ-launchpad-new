-- Drop the trigger first, then the function, and recreate both with proper search path
DROP TRIGGER IF EXISTS normalize_profile_email ON profiles;
DROP FUNCTION IF EXISTS public.normalize_email() CASCADE;

-- Recreate the function with proper search path
CREATE OR REPLACE FUNCTION public.normalize_email()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.email = LOWER(NEW.email);
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER normalize_profile_email
  BEFORE INSERT OR UPDATE OF email ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_email();