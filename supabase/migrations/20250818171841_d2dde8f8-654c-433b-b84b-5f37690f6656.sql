-- Drop existing function first to avoid type conflicts
DROP FUNCTION IF EXISTS public.audit_rls_policies();

-- Recreate with correct signature and search path protection
CREATE OR REPLACE FUNCTION public.audit_rls_policies()
RETURNS TABLE(
  table_name TEXT,
  policy_name TEXT,
  policy_definition TEXT,
  security_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only admin users can run security audits
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required for security audit';
  END IF;

  RETURN QUERY
  SELECT 
    pol.tablename::TEXT,
    pol.policyname::TEXT,
    pol.qual::TEXT,
    CASE 
      WHEN pol.qual ILIKE '%true%' THEN 'WARNING: Overly permissive'
      WHEN pol.qual ILIKE '%auth.uid()%' THEN 'SECURE: User-based access'
      ELSE 'REVIEW: Custom policy'
    END::TEXT
  FROM pg_policies pol
  WHERE pol.schemaname = 'public'
  ORDER BY pol.tablename, pol.policyname;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.audit_rls_policies() TO authenticated;