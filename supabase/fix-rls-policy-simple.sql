-- Simple fix for the RLS policy issue on configuration_audit_log table
-- Run this in your Supabase SQL editor

-- Add INSERT policy for configuration_audit_log table
-- This allows authenticated users to insert audit log entries (needed for audit triggers)
CREATE POLICY IF NOT EXISTS "Authenticated users can insert audit logs" ON public.configuration_audit_log
    FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.role() = 'authenticated');

-- Verify the policy was created
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'configuration_audit_log'
ORDER BY policyname;

-- Success message
SELECT 'RLS policy fixed! You should now be able to delete software modules.' as message;
