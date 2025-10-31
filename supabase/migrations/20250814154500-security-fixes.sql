-- Security hardening: profiles RLS tightening, licenses lock-down, and safe security definer settings

-- PROFILES: restrict access to owner and admins only
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    RAISE NOTICE 'profiles table not found; skipping profiles policy setup';
  ELSE
    -- enable RLS
    EXECUTE 'ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY';

    -- drop any permissive policies that may exist
    EXECUTE 'DROP POLICY IF EXISTS profiles_select_all ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Enable delete for users based on id" ON public.profiles';

    -- self can read own profile
    EXECUTE $$
      CREATE POLICY "profiles: user can read own"
      ON public.profiles
      FOR SELECT
      USING (id = auth.uid());
    $$;

    -- admins can read all profiles
    EXECUTE $$
      CREATE POLICY "profiles: admin can read all"
      ON public.profiles
      FOR SELECT
      USING (public.has_role(auth.uid(), 'admin'));
    $$;

    -- self can insert own profile (id must equal auth.uid())
    EXECUTE $$
      CREATE POLICY "profiles: user can insert self"
      ON public.profiles
      FOR INSERT
      WITH CHECK (id = auth.uid());
    $$;

    -- self can update own profile; admins can update all
    EXECUTE $$
      CREATE POLICY "profiles: user/admin can update"
      ON public.profiles
      FOR UPDATE
      USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
      WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
    $$;

    -- optional: prevent deletes by non-admins
    EXECUTE $$
      CREATE POLICY "profiles: admin can delete"
      ON public.profiles
      FOR DELETE
      USING (public.has_role(auth.uid(), 'admin'));
    $$;
  END IF;
END$$;

-- LICENSES: lock down license keys to admins only
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='licenses'
  ) THEN
    RAISE NOTICE 'licenses table not found; skipping licenses policy setup';
  ELSE
    EXECUTE 'ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS "licenses: anyone select" ON public.licenses';
    EXECUTE 'DROP POLICY IF EXISTS "licenses: de read" ON public.licenses';
    EXECUTE 'DROP POLICY IF EXISTS "licenses: authenticated read" ON public.licenses';
    EXECUTE 'DROP POLICY IF EXISTS "licenses: manage" ON public.licenses';

    -- Only admins can read/insert/update/delete direct license records
    EXECUTE $$
      CREATE POLICY "licenses: admin manage"
      ON public.licenses
      FOR ALL
      USING (public.has_role(auth.uid(), 'admin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
    $$;
  END IF;
END$$;

-- Optional redacted helper view (no SECURITY DEFINER) for future, selecting without key
-- Note: underlying RLS on licenses will block non-admins entirely; enable if metadata-only exposure is desired later
-- CREATE OR REPLACE VIEW public.licenses_redacted AS
--   SELECT id, product, owner_id, created_at, updated_at, left(license_key, 0) AS license_key
--   FROM public.licenses;

-- HARDEN SECURITY DEFINER FUNCTIONS: set fixed search_path to avoid hijack
DO $$
DECLARE rec RECORD;
BEGIN
  FOR rec IN
    SELECT n.nspname, p.proname
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.prosecdef = true -- SECURITY DEFINER
      AND n.nspname = 'public'
  LOOP
    EXECUTE format('ALTER FUNCTION %I.%I() SECURITY DEFINER SET search_path = public', rec.nspname, rec.proname)
    ;
  END LOOP;
END$$;

-- Explicitly replace common helper functions with SET search_path where arity known
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_roles()
RETURNS app_role[]
LANGUAGE SQL
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT ARRAY_AGG(role) FROM public.user_roles WHERE user_id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;


