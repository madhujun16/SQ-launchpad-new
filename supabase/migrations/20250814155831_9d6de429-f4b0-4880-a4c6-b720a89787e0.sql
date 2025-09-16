-- Security Fix: Restrict access to license keys - Step 2: Apply policies and create secure access

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view licenses" ON public.licenses;

-- Create role-based access policies for licenses
CREATE POLICY "Admins can manage all licenses" 
ON public.licenses 
FOR ALL
TO authenticated
USING (public.is_verified_admin())
WITH CHECK (public.is_verified_admin());

-- Ops managers can view and update licenses but with audit logging
CREATE POLICY "Ops managers can view licenses with audit" 
ON public.licenses 
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'ops_manager'::app_role) AND
  public.log_license_access('SELECT', id) IS NULL
);

CREATE POLICY "Ops managers can update licenses with audit" 
ON public.licenses 
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'ops_manager'::app_role) AND
  public.log_license_access('UPDATE', id) IS NULL
)
WITH CHECK (public.has_role(auth.uid(), 'ops_manager'::app_role));

-- Deployment engineers can only view basic license info (no keys) for assigned sites
CREATE POLICY "Deployment engineers can view basic license info" 
ON public.licenses 
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'deployment_engineer'::app_role) AND
  public.log_license_access('SELECT_LIMITED', id) IS NULL
);

-- Create a secure view for license data that masks sensitive information
CREATE OR REPLACE VIEW public.licenses_secure AS
SELECT 
  l.id,
  l.name,
  l.vendor,
  l.license_type,
  -- Only show full license key to admins and ops managers
  CASE 
    WHEN public.is_verified_admin() OR public.has_role(auth.uid(), 'ops_manager'::app_role) 
    THEN l.license_key
    WHEN public.has_role(auth.uid(), 'deployment_engineer'::app_role)
    THEN CASE 
      WHEN l.license_key IS NOT NULL 
      THEN SUBSTRING(l.license_key FROM 1 FOR 4) || '****' || SUBSTRING(l.license_key FROM LENGTH(l.license_key) - 3)
      ELSE NULL
    END
    ELSE '[RESTRICTED]'
  END as license_key,
  l.purchase_date,
  l.expiry_date,
  -- Only show cost to admins and ops managers
  CASE 
    WHEN public.is_verified_admin() OR public.has_role(auth.uid(), 'ops_manager'::app_role) 
    THEN l.cost
    ELSE NULL
  END as cost,
  l.status,
  l.notes,
  l.created_at,
  l.updated_at,
  l.created_by
FROM public.licenses l
WHERE 
  -- Only allow access based on role
  public.is_verified_admin() 
  OR public.has_role(auth.uid(), 'ops_manager'::app_role)
  OR public.has_role(auth.uid(), 'deployment_engineer'::app_role);

-- Grant access to the secure view
GRANT SELECT ON public.licenses_secure TO authenticated;

-- Create a function for secure license key access with additional validation
CREATE OR REPLACE FUNCTION public.get_license_key_secure(p_license_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  license_key_value text;
  user_role app_role;
BEGIN
  -- Get user's role
  SELECT role INTO user_role 
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
  LIMIT 1;

  -- Only admins and ops managers can access full license keys
  IF user_role NOT IN ('admin', 'ops_manager') THEN
    RAISE EXCEPTION 'Access denied: Insufficient privileges to access license keys';
  END IF;

  -- Log the access attempt
  PERFORM public.log_license_access('GET_LICENSE_KEY', p_license_id);

  -- Get the license key
  SELECT license_key INTO license_key_value
  FROM public.licenses
  WHERE id = p_license_id;

  RETURN license_key_value;
END;
$$;

-- Grant execute permissions on the secure access function
GRANT EXECUTE ON FUNCTION public.get_license_key_secure(uuid) TO authenticated;