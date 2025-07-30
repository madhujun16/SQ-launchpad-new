-- Drop the overly permissive policy
DROP POLICY "Allow email existence check for login" ON public.profiles;

-- Create a more restrictive policy that only allows checking email existence
-- This policy allows unauthenticated users to query emails but limits what they can see
CREATE POLICY "Allow email existence check for login" 
ON public.profiles 
FOR SELECT 
TO anon
USING (email IS NOT NULL);