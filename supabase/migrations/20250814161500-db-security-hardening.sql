-- Database Security Hardening
-- 1) Add SET search_path = public to SECURITY DEFINER functions and common helpers
DO $$
DECLARE rec RECORD;
BEGIN
  FOR rec IN
    SELECT n.nspname, p.proname, oidvectortypes(p.proargtypes) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
  LOOP
    BEGIN
      EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path = public', rec.nspname, rec.proname, rec.args);
    EXCEPTION WHEN OTHERS THEN
      -- ignore functions we cannot alter (e.g., built-ins or extension-owned)
      NULL;
    END;
  END LOOP;
END$$;

-- Ensure our helpers explicitly set search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_roles()
RETURNS app_role[]
LANGUAGE SQL STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT ARRAY_AGG(role) FROM public.user_roles WHERE user_id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- 2) Tighten RLS policies to require authenticated role where appropriate
-- Profiles
DROP POLICY IF EXISTS "profiles: user can read own (auth)" ON public.profiles;
CREATE POLICY "profiles: user can read own (auth)"
ON public.profiles FOR SELECT
USING (auth.role() = 'authenticated' AND id = auth.uid());

DROP POLICY IF EXISTS "profiles: admin can read all (auth)" ON public.profiles;
CREATE POLICY "profiles: admin can read all (auth)"
ON public.profiles FOR SELECT
USING (auth.role() = 'authenticated' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "profiles: user can insert self (auth)" ON public.profiles;
CREATE POLICY "profiles: user can insert self (auth)"
ON public.profiles FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND id = auth.uid());

DROP POLICY IF EXISTS "profiles: user/admin can update (auth)" ON public.profiles;
CREATE POLICY "profiles: user/admin can update (auth)"
ON public.profiles FOR UPDATE
USING (auth.role() = 'authenticated' AND (id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
WITH CHECK (auth.role() = 'authenticated' AND (id = auth.uid() OR public.has_role(auth.uid(), 'admin')));

DROP POLICY IF EXISTS "profiles: admin can delete (auth)" ON public.profiles;
CREATE POLICY "profiles: admin can delete (auth)"
ON public.profiles FOR DELETE
USING (auth.role() = 'authenticated' AND public.has_role(auth.uid(), 'admin'));

-- Licenses
DROP POLICY IF EXISTS "licenses: admin manage (auth)" ON public.licenses;
CREATE POLICY "licenses: admin manage (auth)"
ON public.licenses FOR ALL
USING (auth.role() = 'authenticated' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.role() = 'authenticated' AND public.has_role(auth.uid(), 'admin'));

-- Licenses_secure table (if present)
ALTER TABLE IF EXISTS public.licenses_secure ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "licenses_secure: admin manage (auth)" ON public.licenses_secure;
CREATE POLICY "licenses_secure: admin manage (auth)"
ON public.licenses_secure FOR ALL
USING (auth.role() = 'authenticated' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.role() = 'authenticated' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "licenses_secure: meta read (auth)" ON public.licenses_secure;
CREATE POLICY "licenses_secure: meta read (auth)"
ON public.licenses_secure FOR SELECT
USING (
  auth.role() = 'authenticated' AND
  (public.has_role(auth.uid(), 'deployment_engineer') OR public.has_role(auth.uid(), 'ops_manager')) AND
  (license_key IS NULL OR license_key = '' OR license_key = '[REDACTED]')
);


