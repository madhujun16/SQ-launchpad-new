-- Fix the search path for the normalize_email function
DROP FUNCTION IF EXISTS public.normalize_email();

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