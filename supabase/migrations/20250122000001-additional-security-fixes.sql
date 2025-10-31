-- Additional Security Fixes for Lovable.dev Issues
-- Addresses specific warnings and configuration issues

-- ==============================================
-- 1. FIX FUNCTION SEARCH PATH MUTABLE WARNING
-- ==============================================

-- Set search_path for security definer functions
ALTER FUNCTION public.is_admin() SET search_path = public;
ALTER FUNCTION public.is_ops_manager() SET search_path = public;
ALTER FUNCTION public.is_deployment_engineer() SET search_path = public;
ALTER FUNCTION public.has_any_role() SET search_path = public;

-- ==============================================
-- 2. FIX AUTH OTP LONG EXPIRY WARNING
-- ==============================================

-- Update auth configuration to reduce OTP expiry time
-- This should be done in Supabase Dashboard > Authentication > Settings
-- But we can set it programmatically:
UPDATE auth.config 
SET 
    otp_expiry = 300, -- 5 minutes instead of default 60 minutes
    email_otp_expiry = 300
WHERE true;

-- ==============================================
-- 3. ENABLE PASSWORD PROTECTION
-- ==============================================

-- Enable password protection features
UPDATE auth.config 
SET 
    password_min_length = 8,
    password_require_uppercase = true,
    password_require_lowercase = true,
    password_require_numbers = true,
    password_require_symbols = true
WHERE true;

-- ==============================================
-- 4. CREATE SECURE VIEWS FOR PUBLIC DATA
-- ==============================================

-- Create a secure view for public organization data (if needed)
CREATE OR REPLACE VIEW public.organizations_public AS
SELECT 
    id,
    name,
    type,
    created_at
FROM public.organizations
WHERE is_public = true; -- Add this column if you want public organizations

-- Enable RLS on the view
ALTER VIEW public.organizations_public SET (security_invoker = true);

-- ==============================================
-- 5. AUDIT LOGGING FUNCTIONS
-- ==============================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(user_id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "audit_logs_admin_only" ON public.audit_logs
FOR SELECT 
TO authenticated
USING (public.is_admin());

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
    _action TEXT,
    _table_name TEXT,
    _record_id UUID DEFAULT NULL,
    _old_values JSONB DEFAULT NULL,
    _new_values JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.audit_logs (
        user_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        ip_address
    ) VALUES (
        auth.uid(),
        _action,
        _table_name,
        _record_id,
        _old_values,
        _new_values,
        inet_client_addr()
    );
END;
$$;

-- ==============================================
-- 6. SECURE DEFAULT PERMISSIONS
-- ==============================================

-- Revoke default permissions from public schema
REVOKE ALL ON SCHEMA public FROM public;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM public;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM public;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM public;

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ==============================================
-- 7. ADDITIONAL SECURITY MEASURES
-- ==============================================

-- Create function to check if user can access site
CREATE OR REPLACE FUNCTION public.can_access_site(_site_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.sites
    WHERE id = _site_id
    AND (
      public.is_admin() OR
      (public.is_ops_manager() AND assigned_ops_manager = auth.uid()) OR
      (public.is_deployment_engineer() AND assigned_deployment_engineer = auth.uid())
    )
  )
$$;

-- Create function to check if user can access organization
CREATE OR REPLACE FUNCTION public.can_access_organization(_org_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organizations
    WHERE id = _org_id
    AND (
      public.is_admin() OR
      EXISTS (
        SELECT 1 FROM public.sites
        WHERE organization_id = _org_id
        AND (
          (public.is_ops_manager() AND assigned_ops_manager = auth.uid()) OR
          (public.is_deployment_engineer() AND assigned_deployment_engineer = auth.uid())
        )
      )
    )
  )
$$;

-- ==============================================
-- 8. FINAL SECURITY VERIFICATION
-- ==============================================

-- Check that no tables have overly permissive policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive,
    roles,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
    AND (
        qual LIKE '%true%' OR 
        qual LIKE '%anon%' OR
        roles LIKE '%anon%'
    )
ORDER BY tablename, policyname;

-- Verify all tables have RLS enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND rowsecurity = false
ORDER BY tablename;
