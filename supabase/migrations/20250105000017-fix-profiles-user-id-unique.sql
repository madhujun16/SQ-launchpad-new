-- Add unique constraint on user_id in profiles table
-- This is required for foreign key references to work properly
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

-- Add index for better performance
CREATE INDEX profiles_user_id_idx ON public.profiles (user_id); 