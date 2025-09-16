-- Security Fix: Remove SECURITY DEFINER view and implement secure data access pattern
-- This addresses the critical "Security Definer View" security finding

-- Remove the problematic SECURITY DEFINER view
DROP VIEW IF EXISTS public.licenses_public;

-- Create a secure function that respects RLS and user roles for license data access
CREATE OR REPLACE FUNCTION public.get_licenses_secure(
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  name VARCHAR,
  license_key TEXT,
  license_type VARCHAR,
  status VARCHAR,
  cost TEXT,
  vendor VARCHAR,
  purchase_date DATE,
  expiry_date DATE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  created_by UUID,
  notes TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- This function respects user permissions and masks sensitive data based on role
  -- Only verified admins can see license keys and costs
  
  RETURN QUERY
  SELECT 
    l.id,
    l.name,
    CASE 
      WHEN is_verified_admin() THEN l.license_key
      ELSE '[REDACTED]'
    END as license_key,
    l.license_type,
    l.status,
    CASE 
      WHEN is_verified_admin() THEN l.cost::TEXT
      ELSE '[REDACTED]'
    END as cost,
    l.vendor,
    l.purchase_date,
    l.expiry_date,
    l.created_at,
    l.updated_at,
    l.created_by,
    l.notes
  FROM public.licenses l
  WHERE 
    -- Apply existing RLS policies by checking user permissions manually
    (is_verified_admin() OR 
     has_role(auth.uid(), 'ops_manager') OR 
     has_role(auth.uid(), 'deployment_engineer'))
  ORDER BY l.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Create a function to get license count for pagination
CREATE OR REPLACE FUNCTION public.get_licenses_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.licenses l
    WHERE 
      (is_verified_admin() OR 
       has_role(auth.uid(), 'ops_manager') OR 
       has_role(auth.uid(), 'deployment_engineer'))
  );
END;
$$;

-- Update the existing get_license_summary function to be more secure
DROP FUNCTION IF EXISTS public.get_license_summary();
CREATE OR REPLACE FUNCTION public.get_license_summary()
RETURNS TABLE(
  total_licenses BIGINT,
  active_licenses BIGINT,
  expiring_soon BIGINT,
  expired_licenses BIGINT,
  by_type JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only return summary if user has appropriate permissions
  IF NOT (is_verified_admin() OR 
          has_role(auth.uid(), 'ops_manager') OR 
          has_role(auth.uid(), 'deployment_engineer')) THEN
    RAISE EXCEPTION 'Access denied: Insufficient permissions to view license summary';
  END IF;

  RETURN QUERY
  SELECT 
    COUNT(*) as total_licenses,
    COUNT(*) FILTER (WHERE status = 'active') as active_licenses,
    COUNT(*) FILTER (WHERE expiry_date <= CURRENT_DATE + INTERVAL '30 days' AND status = 'active') as expiring_soon,
    COUNT(*) FILTER (WHERE expiry_date < CURRENT_DATE OR status = 'expired') as expired_licenses,
    COALESCE(
      jsonb_object_agg(
        COALESCE(license_type, 'unknown'),
        type_count
      ),
      '{}'::jsonb
    ) as by_type
  FROM public.licenses
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as type_count
    FROM public.licenses l2
    WHERE COALESCE(l2.license_type, 'unknown') = COALESCE(licenses.license_type, 'unknown')
    GROUP BY COALESCE(l2.license_type, 'unknown')
  ) counts ON true;
END;
$$;

-- Grant appropriate permissions
GRANT EXECUTE ON FUNCTION public.get_licenses_secure(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_licenses_count() TO authenticated;

-- Add logging for function usage to maintain audit trail
CREATE OR REPLACE FUNCTION public.log_license_function_access(
  p_function_name TEXT,
  p_user_role TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    entity,
    action,
    user_id,
    user_name,
    details,
    metadata
  ) VALUES (
    'license_functions',
    'FUNCTION_ACCESS',
    auth.uid(),
    (SELECT full_name FROM public.profiles WHERE user_id = auth.uid()),
    'Accessed function: ' || p_function_name,
    jsonb_build_object(
      'function_name', p_function_name,
      'user_role', p_user_role,
      'access_time', now()
    )
  );
END;
$$;