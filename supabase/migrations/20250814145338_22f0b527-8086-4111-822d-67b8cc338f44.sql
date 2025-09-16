-- Remove remaining permissive site access policy
DROP POLICY IF EXISTS "Users can view sites based on role and assignment" ON public.sites;

-- Ensure only the secure assignment-based policy exists for site access
-- The "Secure site access based on assignments" policy is already in place and provides proper security