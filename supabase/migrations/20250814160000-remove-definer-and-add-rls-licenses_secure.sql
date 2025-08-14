-- Remove SECURITY DEFINER view/function and protect licenses_secure with RLS

-- 1) Drop definer function and view if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname='public' AND p.proname='get_license_key_secure'
  ) THEN
    EXECUTE 'DROP FUNCTION public.get_license_key_secure(uuid)';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_views WHERE schemaname='public' AND viewname='licenses_secure'
  ) THEN
    EXECUTE 'DROP VIEW public.licenses_secure';
  END IF;
END$$;

-- 2) Ensure a physical table licenses_secure exists with necessary columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='licenses_secure'
  ) THEN
    EXECUTE $$
      CREATE TABLE public.licenses_secure (
        id uuid PRIMARY KEY,
        product text,
        vendor text,
        license_key text,
        owner_id uuid REFERENCES public.profiles(id),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      )
    $$;
  END IF;
END$$;

-- 3) Enable RLS and add strict policies (admin only)
ALTER TABLE public.licenses_secure ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "licenses_secure: admin manage" ON public.licenses_secure;
CREATE POLICY "licenses_secure: admin manage"
ON public.licenses_secure FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Optional: provide metadata-only read for DE/OM without keys
DROP POLICY IF EXISTS "licenses_secure: meta read" ON public.licenses_secure;
CREATE POLICY "licenses_secure: meta read"
ON public.licenses_secure FOR SELECT
USING (
  (public.has_role(auth.uid(), 'deployment_engineer') OR public.has_role(auth.uid(), 'ops_manager'))
  AND (license_key IS NULL OR license_key = '' OR license_key = '[REDACTED]')
);


