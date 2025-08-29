-- Fix RLS Policy for configuration_audit_log table
-- This script adds the missing INSERT policy that allows audit log entries to be created

-- Add INSERT policy for configuration_audit_log
-- This allows authenticated users to insert audit log entries (which is needed for the audit triggers)
CREATE POLICY "Authenticated users can insert audit logs" ON public.configuration_audit_log
    FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.role() = 'authenticated');

-- Verify the current policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'configuration_audit_log'
ORDER BY policyname;

-- Success message
SELECT 'Configuration audit log RLS policies have been fixed. INSERT policy added for authenticated users.' as message;
