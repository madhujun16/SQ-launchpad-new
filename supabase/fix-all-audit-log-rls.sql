-- Fix RLS Policies for All Audit Log Tables
-- This script ensures that all audit log tables can be inserted into by authenticated users

-- 1. Fix configuration_audit_log table
-- Add INSERT policy for configuration_audit_log
CREATE POLICY IF NOT EXISTS "Authenticated users can insert audit logs" ON public.configuration_audit_log
    FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.role() = 'authenticated');

-- 2. Fix audit_logs table (if it exists and needs INSERT policy)
-- Check if audit_logs table exists and add INSERT policy if needed
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs' AND table_schema = 'public') THEN
        -- Add INSERT policy for audit_logs if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'audit_logs' 
            AND policyname = 'Authenticated users can insert audit logs'
        ) THEN
            CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_logs
                FOR INSERT 
                TO authenticated 
                WITH CHECK (auth.role() = 'authenticated');
        END IF;
    END IF;
END $$;

-- 3. Fix workflow_audit_logs table (if it exists)
-- This table already has an INSERT policy, but let's verify
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflow_audit_logs' AND table_schema = 'public') THEN
        -- Verify the INSERT policy exists
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'workflow_audit_logs' 
            AND policyname = 'Authenticated users can insert workflow audit logs'
        ) THEN
            CREATE POLICY "Authenticated users can insert workflow audit logs" ON workflow_audit_logs
                FOR INSERT 
                TO authenticated 
                WITH CHECK (auth.role() = 'authenticated');
        END IF;
    END IF;
END $$;

-- 4. Fix costing_approval_audit_log table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'costing_approval_audit_log' AND table_schema = 'public') THEN
        -- Add INSERT policy for costing_approval_audit_log if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'costing_approval_audit_log' 
            AND policyname = 'Authenticated users can insert audit logs'
        ) THEN
            CREATE POLICY "Authenticated users can insert audit logs" ON public.costing_approval_audit_log
                FOR INSERT 
                TO authenticated 
                WITH CHECK (auth.role() = 'authenticated');
        END IF;
    END IF;
END $$;

-- 5. Verify all policies are in place
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
WHERE tablename IN ('configuration_audit_log', 'audit_logs', 'workflow_audit_logs', 'costing_approval_audit_log')
ORDER BY tablename, policyname;

-- Success message
SELECT 'All audit log table RLS policies have been fixed. INSERT policies added for authenticated users.' as message;
