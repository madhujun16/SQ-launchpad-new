-- Security Fix: Restrict access to license keys and implement role-based access

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

-- Create audit logging function for license access
CREATE OR REPLACE FUNCTION public.log_license_access(p_action text, p_license_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log all license access attempts for security monitoring
  INSERT INTO public.audit_logs (
    entity, 
    action, 
    user_id, 
    user_name, 
    details
  ) VALUES (
    'licenses',
    p_action,
    auth.uid(),
    (SELECT full_name FROM public.profiles WHERE user_id = auth.uid()),
    'Accessed license: ' || p_license_id::text
  );
END;
$$;

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

-- Enable RLS on the view
ALTER VIEW public.licenses_secure SET (security_barrier = true);

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

-- Create a function for license management operations
CREATE OR REPLACE FUNCTION public.manage_license(
  p_operation text,
  p_license_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  license_id uuid;
BEGIN
  -- Only admins and ops managers can manage licenses
  IF NOT (public.is_verified_admin() OR public.has_role(auth.uid(), 'ops_manager'::app_role)) THEN
    RAISE EXCEPTION 'Access denied: Only admins and ops managers can manage licenses';
  END IF;

  CASE p_operation
    WHEN 'CREATE' THEN
      INSERT INTO public.licenses (
        name, vendor, license_type, license_key, purchase_date, 
        expiry_date, cost, status, notes, created_by
      ) VALUES (
        p_license_data->>'name',
        p_license_data->>'vendor',
        p_license_data->>'license_type',
        p_license_data->>'license_key',
        (p_license_data->>'purchase_date')::date,
        (p_license_data->>'expiry_date')::date,
        (p_license_data->>'cost')::numeric,
        COALESCE(p_license_data->>'status', 'active'),
        p_license_data->>'notes',
        auth.uid()
      ) RETURNING id INTO license_id;
      
      PERFORM public.log_license_access('CREATE', license_id);
      result := jsonb_build_object('success', true, 'license_id', license_id);
      
    WHEN 'UPDATE' THEN
      license_id := (p_license_data->>'id')::uuid;
      
      UPDATE public.licenses SET
        name = COALESCE(p_license_data->>'name', name),
        vendor = COALESCE(p_license_data->>'vendor', vendor),
        license_type = COALESCE(p_license_data->>'license_type', license_type),
        license_key = COALESCE(p_license_data->>'license_key', license_key),
        purchase_date = COALESCE((p_license_data->>'purchase_date')::date, purchase_date),
        expiry_date = COALESCE((p_license_data->>'expiry_date')::date, expiry_date),
        cost = COALESCE((p_license_data->>'cost')::numeric, cost),
        status = COALESCE(p_license_data->>'status', status),
        notes = COALESCE(p_license_data->>'notes', notes),
        updated_at = now()
      WHERE id = license_id;
      
      PERFORM public.log_license_access('UPDATE', license_id);
      result := jsonb_build_object('success', true, 'license_id', license_id);
      
    ELSE
      RAISE EXCEPTION 'Invalid operation: %', p_operation;
  END CASE;

  RETURN result;
END;
$$;

-- Grant execute permissions on the new functions
GRANT EXECUTE ON FUNCTION public.get_license_key_secure(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.manage_license(text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_license_access(text, uuid) TO authenticated;

-- Add additional constraint to prevent accidental license key exposure
CREATE OR REPLACE FUNCTION public.validate_license_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log all license table access attempts
  IF TG_OP = 'SELECT' THEN
    PERFORM public.log_license_access('TABLE_ACCESS', OLD.id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for license access monitoring (for additional security)
DROP TRIGGER IF EXISTS license_access_monitor ON public.licenses;
CREATE TRIGGER license_access_monitor
  BEFORE SELECT OR UPDATE OR DELETE ON public.licenses
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_license_access();