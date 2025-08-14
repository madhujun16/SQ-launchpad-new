-- Security Fix: Restrict access to license keys - Step 1: Create functions first

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

-- Grant execute permissions on the logging function
GRANT EXECUTE ON FUNCTION public.log_license_access(text, uuid) TO authenticated;