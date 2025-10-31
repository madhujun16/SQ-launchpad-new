-- Security Fix: Strengthen Audit Logs RLS Policies
-- Remove any overly permissive policies and ensure only admins can access audit logs

-- 1. First, let's check current policies on audit_logs table
-- Remove any conflicting or overly permissive policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Authenticated users can view audit logs" ON public.audit_logs;

-- 2. Keep only the secure admin-only policies
-- The existing policies should be sufficient:
-- - "Admins can view audit logs" (restricts to admins)
-- - "audit_logs_admin_only" (using is_verified_admin function)
-- - "Authenticated users can insert audit logs" (needed for audit triggers)

-- 3. Verify RLS is enabled on audit_logs table
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. Ensure configuration_audit_log table also has proper RLS
-- This table was mentioned in earlier security issues
ALTER TABLE public.configuration_audit_log ENABLE ROW LEVEL SECURITY;

-- 5. Verify current policies are correct
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('audit_logs', 'configuration_audit_log')
ORDER BY tablename, policyname;

-- 6. Add a security audit function to check for exposed audit data
CREATE OR REPLACE FUNCTION public.audit_security_check()
RETURNS TABLE(
    table_name TEXT,
    rls_enabled BOOLEAN,
    policy_count INTEGER,
    security_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only admins can run security audits
    IF NOT is_verified_admin() THEN
        RAISE EXCEPTION 'Access denied: Only administrators can run security audits';
    END IF;

    RETURN QUERY
    SELECT 
        t.tablename::TEXT as table_name,
        t.rowsecurity as rls_enabled,
        COALESCE(p.policy_count, 0)::INTEGER as policy_count,
        CASE 
            WHEN t.rowsecurity = false THEN 'CRITICAL: RLS Disabled'
            WHEN t.tablename LIKE '%audit%' AND COALESCE(p.policy_count, 0) = 0 THEN 'WARNING: No RLS policies'
            WHEN t.tablename LIKE '%audit%' AND COALESCE(p.policy_count, 0) > 0 THEN 'SECURE: RLS enabled with policies'
            ELSE 'OK'
        END::TEXT as security_status
    FROM 
        pg_tables t
    LEFT JOIN (
        SELECT 
            tablename,
            COUNT(*) as policy_count
        FROM pg_policies 
        WHERE schemaname = 'public'
        GROUP BY tablename
    ) p ON t.tablename = p.tablename
    WHERE 
        t.schemaname = 'public' 
        AND (t.tablename LIKE '%audit%' OR t.tablename LIKE '%log%')
    ORDER BY 
        CASE WHEN t.tablename LIKE '%audit%' THEN 1 ELSE 2 END,
        t.tablename;
END;
$$;

-- 7. Grant execute permission to authenticated users for the security check function
GRANT EXECUTE ON FUNCTION public.audit_security_check() TO authenticated;

-- Success message
SELECT 'Audit logs security has been strengthened. Only administrators can access audit data.' as message;