-- Security Fix: Protect sensitive license data from unauthorized access
-- This migration creates a secure license architecture with proper data separation

-- First, create a view for non-sensitive license data
CREATE OR REPLACE VIEW public.licenses_public AS
SELECT 
  id,
  name,
  license_type,
  status,
  vendor,
  purchase_date,
  expiry_date,
  created_at,
  updated_at,
  created_by,
  '[REDACTED]' as license_key,  -- Mask the license key
  '[REDACTED]' as cost          -- Mask the cost
FROM public.licenses;

-- Create secure functions for accessing sensitive license data
CREATE OR REPLACE FUNCTION public.get_license_with_sensitive_data(license_id UUID)
RETURNS TABLE(
  id UUID,
  name VARCHAR,
  license_key VARCHAR,
  license_type VARCHAR,
  status VARCHAR,
  cost NUMERIC,
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
  -- Only admins can access sensitive license data
  IF NOT is_verified_admin() THEN
    RAISE EXCEPTION 'Access denied: Only administrators can access sensitive license data';
  END IF;

  -- Log sensitive data access
  PERFORM log_license_access('ACCESS_SENSITIVE_DATA', license_id);

  RETURN QUERY
  SELECT 
    l.id,
    l.name,
    l.license_key,
    l.license_type,
    l.status,
    l.cost,
    l.vendor,
    l.purchase_date,
    l.expiry_date,
    l.created_at,
    l.updated_at,
    l.created_by,
    l.notes
  FROM public.licenses l
  WHERE l.id = license_id;
END;
$$;

-- Create function for license summary without sensitive data
CREATE OR REPLACE FUNCTION public.get_license_summary()
RETURNS TABLE(
  total_licenses BIGINT,
  active_licenses BIGINT,
  expiring_soon BIGINT,
  expired_licenses BIGINT,
  by_type JSONB
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    COUNT(*) as total_licenses,
    COUNT(*) FILTER (WHERE status = 'active') as active_licenses,
    COUNT(*) FILTER (WHERE expiry_date <= CURRENT_DATE + INTERVAL '30 days' AND status = 'active') as expiring_soon,
    COUNT(*) FILTER (WHERE expiry_date < CURRENT_DATE OR status = 'expired') as expired_licenses,
    jsonb_object_agg(
      COALESCE(license_type, 'unknown'),
      type_count
    ) as by_type
  FROM public.licenses
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as type_count
    FROM public.licenses l2
    WHERE l2.license_type = licenses.license_type
  ) counts ON true
  GROUP BY ()
$$;

-- Update RLS policies to be more restrictive
DROP POLICY IF EXISTS "Deployment engineers can view basic license info" ON public.licenses;
DROP POLICY IF EXISTS "Ops managers can view licenses with audit" ON public.licenses;
DROP POLICY IF EXISTS "Ops managers can update licenses with audit" ON public.licenses;
DROP POLICY IF EXISTS "licenses: admin manage" ON public.licenses;
DROP POLICY IF EXISTS "licenses: admin manage (auth)" ON public.licenses;
DROP POLICY IF EXISTS "Admins can manage all licenses" ON public.licenses;

-- Create new restrictive RLS policies
CREATE POLICY "licenses_secure_admin_full_access" 
ON public.licenses 
FOR ALL 
TO authenticated
USING (is_verified_admin() AND log_license_access('ADMIN_ACCESS', id) IS NULL)
WITH CHECK (is_verified_admin());

CREATE POLICY "licenses_ops_basic_metadata_only" 
ON public.licenses 
FOR SELECT 
TO authenticated
USING (
  has_role(auth.uid(), 'ops_manager') 
  AND log_license_access('OPS_METADATA_VIEW', id) IS NULL
);

CREATE POLICY "licenses_deployment_basic_metadata_only" 
ON public.licenses 
FOR SELECT 
TO authenticated
USING (
  has_role(auth.uid(), 'deployment_engineer') 
  AND log_license_access('DEPLOYMENT_METADATA_VIEW', id) IS NULL
);

-- Grant permissions on the public view
GRANT SELECT ON public.licenses_public TO authenticated;

-- Grant execute permissions on secure functions
GRANT EXECUTE ON FUNCTION public.get_license_with_sensitive_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_license_summary() TO authenticated;