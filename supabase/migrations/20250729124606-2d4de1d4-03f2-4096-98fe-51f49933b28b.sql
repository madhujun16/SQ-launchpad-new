-- Make emails case-insensitive by adding a unique constraint on lowercase email
-- First, update existing emails to lowercase to avoid conflicts
UPDATE profiles SET email = LOWER(email);

-- Add a unique constraint on lowercase email to prevent duplicates regardless of case
CREATE UNIQUE INDEX profiles_email_lower_unique ON profiles (LOWER(email));

-- Create a function to ensure emails are always stored in lowercase
CREATE OR REPLACE FUNCTION public.normalize_email()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email = LOWER(NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically normalize emails before insert/update
CREATE TRIGGER normalize_profile_email
  BEFORE INSERT OR UPDATE OF email ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_email();