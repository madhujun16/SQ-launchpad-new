-- Phase 1: Critical Security Fix - Database Functions Search Path
-- This migration fixes database function security vulnerabilities by adding proper search path restrictions

-- Function: check_email_exists - Add search path protection
CREATE OR REPLACE FUNCTION public.check_email_exists(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE email = email_to_check
  );
END;
$$;

-- Function: get_user_role - Add search path protection
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = user_uuid
  ORDER BY created_at DESC
  LIMIT 1;
  
  RETURN COALESCE(user_role, 'user');
END;
$$;

-- Function: audit_rls_policies - Add search path protection
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

-- Add comprehensive comments for security documentation
COMMENT ON FUNCTION public.check_email_exists(TEXT) IS 'Secure email verification function with restricted search path';
COMMENT ON FUNCTION public.get_user_role(UUID) IS 'Secure user role retrieval with search path protection';
COMMENT ON FUNCTION public.audit_rls_policies() IS 'Admin-only security audit function with search path protection';

-- Grant appropriate permissions
GRANT EXECUTE ON FUNCTION public.check_email_exists(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.audit_rls_policies() TO authenticated;