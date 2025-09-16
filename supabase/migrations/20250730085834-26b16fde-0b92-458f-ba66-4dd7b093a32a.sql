-- Allow unauthenticated users to check if emails exist for login purposes
-- This is needed for the magic link login flow
CREATE POLICY "Allow email existence check for login" 
ON public.profiles 
FOR SELECT 
TO anon
USING (true);