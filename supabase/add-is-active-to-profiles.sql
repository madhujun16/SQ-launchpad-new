-- Add is_active column to profiles table
-- This will enable proper user archiving functionality

-- Add the is_active column with a default value of true
ALTER TABLE public.profiles 
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- Add a comment to document the column purpose
COMMENT ON COLUMN public.profiles.is_active IS 'Indicates whether the user account is active (true) or archived (false)';

-- Create an index on is_active for better query performance
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active);

-- Update existing RLS policies to consider the is_active column
-- This ensures archived users cannot access the system

-- Example policy update (adjust based on your existing policies):
-- ALTER POLICY profiles_secure_select ON public.profiles 
-- USING ((user_id = auth.uid() OR (is_verified_admin() AND log_admin_profile_access('SELECT'::text, user_id) IS NULL)) AND is_active = true);

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'is_active';
