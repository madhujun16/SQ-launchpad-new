-- =====================================================
-- Enhanced Site Assignments Data Migration Script
-- =====================================================

-- Disable triggers and foreign key checks for bulk operations
SET session_replication_role = 'replica';

-- Step 1: Prepare Organizations Table
DO $$
BEGIN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT column_name 
                   FROM information_schema.columns 
                   WHERE table_name='organizations' 
                   AND column_name='org_name') THEN
        ALTER TABLE public.organizations 
        ADD COLUMN org_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT column_name 
                   FROM information_schema.columns 
                   WHERE table_name='organizations' 
                   AND column_name='sector') THEN
        ALTER TABLE public.organizations 
        ADD COLUMN sector TEXT;
    END IF;

    IF NOT EXISTS (SELECT column_name 
                   FROM information_schema.columns 
                   WHERE table_name='organizations' 
                   AND column_name='unit_code') THEN
        ALTER TABLE public.organizations 
        ADD COLUMN unit_code TEXT;
    END IF;

    IF NOT EXISTS (SELECT column_name 
                   FROM information_schema.columns 
                   WHERE table_name='organizations' 
                   AND column_name='created_on') THEN
        ALTER TABLE public.organizations 
        ADD COLUMN created_on TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;

    IF NOT EXISTS (SELECT column_name 
                   FROM information_schema.columns 
                   WHERE table_name='organizations' 
                   AND column_name='created_by') THEN
        ALTER TABLE public.organizations 
        ADD COLUMN created_by TEXT DEFAULT 'system';
    END IF;
END $$;

-- Update existing organizations with default values
UPDATE public.organizations 
SET 
  org_name = COALESCE(org_name, name),
  sector = COALESCE(sector, 'Business & Industry'),
  unit_code = COALESCE(unit_code, SUBSTRING(UPPER(name), 1, 3)),
  created_on = COALESCE(created_on, created_at),
  created_by = COALESCE(created_by, 'system')
WHERE org_name IS NULL OR sector IS NULL OR unit_code IS NULL OR created_on IS NULL OR created_by IS NULL;

-- Step 2: Prepare Sites Table
DO $$
BEGIN
    IF NOT EXISTS (SELECT column_name 
                   FROM information_schema.columns 
                   WHERE table_name='sites' 
                   AND column_name='assigned_ops_manager_id') THEN
        ALTER TABLE public.sites 
        ADD COLUMN assigned_ops_manager_id UUID REFERENCES public.profiles(user_id);
    END IF;

    IF NOT EXISTS (SELECT column_name 
                   FROM information_schema.columns 
                   WHERE table_name='sites' 
                   AND column_name='assigned_deployment_engineer_id') THEN
        ALTER TABLE public.sites 
        ADD COLUMN assigned_deployment_engineer_id UUID REFERENCES public.profiles(user_id);
    END IF;
END $$;

-- Step 3: Create Site Assignments Table
CREATE TABLE IF NOT EXISTS public.site_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  ops_manager_id UUID REFERENCES public.profiles(user_id),
  deployment_engineer_id UUID REFERENCES public.profiles(user_id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(site_id)
);

-- Step 4: Prepare Profiles for Site Assignments
WITH missing_profiles(email, full_name) AS (
  VALUES 
    ('ops.manager1@smartq.com', 'Ops Manager 1'),
    ('deployment.engineer@smartq.com', 'Deployment Engineer 1'),
    ('shivanshu.singh@thesmartq.com', 'Shivanshu Singh'),
    ('ops.manager2@smartq.com', 'Ops Manager 2'),
    ('deployment.engineer1@smartq.com', 'Deployment Engineer 2'),
    ('john.doe@smartq.com', 'John Doe'),
    ('jane.smith@smartq.com', 'Jane Smith'),
    ('alex.taylor@smartq.com', 'Alex Taylor'),
    ('emma.brown@smartq.com', 'Emma Brown'),
    ('ops.manager3@smartq.com', 'Ops Manager 3'),
    ('deployment.engineer2@smartq.com', 'Deployment Engineer 3')
)
INSERT INTO public.profiles (
  email, 
  full_name, 
  user_id
)
SELECT 
  email, 
  full_name, 
  gen_random_uuid()
FROM missing_profiles
WHERE email NOT IN (SELECT email FROM public.profiles)
ON CONFLICT (email) DO NOTHING;

-- Step 5: Prepare Site Assignments Data
-- Delete existing entries first to prevent conflict
DELETE FROM public.site_assignments 
WHERE site_id IN (
  SELECT s.id
  FROM (
    VALUES 
      ('250 ER Restaurant', 'ops.manager1@smartq.com', 'deployment.engineer@smartq.com', 'shivanshu.singh@thesmartq.com'),
      ('Baxter Health Restaurant', 'ops.manager2@smartq.com', 'deployment.engineer1@smartq.com', 'shivanshu.singh@thesmartq.com'),
      ('BP Pulse Arena', 'ops.manager3@smartq.com', 'deployment.engineer2@smartq.com', 'shivanshu.singh@thesmartq.com'),
      ('Chartswell London HQ', 'john.doe@smartq.com', 'jane.smith@smartq.com', 'shivanshu.singh@thesmartq.com'),
      ('Chartswell Manchester', 'alex.taylor@smartq.com', 'emma.brown@smartq.com', 'shivanshu.singh@thesmartq.com')
  ) AS sad(site_name, ops_manager_email, deployment_engineer_email, assigned_by_email)
  JOIN public.sites s ON s.name = sad.site_name
);

-- Then insert
INSERT INTO public.site_assignments (
  site_id, 
  ops_manager_id, 
  deployment_engineer_id, 
  assigned_by
)
SELECT 
  s.id, 
  ops.user_id, 
  de.user_id, 
  assigned.user_id
FROM (
  VALUES 
    ('250 ER Restaurant', 'ops.manager1@smartq.com', 'deployment.engineer@smartq.com', 'shivanshu.singh@thesmartq.com'),
    ('Baxter Health Restaurant', 'ops.manager2@smartq.com', 'deployment.engineer1@smartq.com', 'shivanshu.singh@thesmartq.com'),
    ('BP Pulse Arena', 'ops.manager3@smartq.com', 'deployment.engineer2@smartq.com', 'shivanshu.singh@thesmartq.com'),
    ('Chartswell London HQ', 'john.doe@smartq.com', 'jane.smith@smartq.com', 'shivanshu.singh@thesmartq.com'),
    ('Chartswell Manchester', 'alex.taylor@smartq.com', 'emma.brown@smartq.com', 'shivanshu.singh@thesmartq.com')
) AS sad(site_name, ops_manager_email, deployment_engineer_email, assigned_by_email)
JOIN public.sites s ON s.name = sad.site_name
JOIN public.profiles ops ON ops.email = sad.ops_manager_email
JOIN public.profiles de ON de.email = sad.deployment_engineer_email
JOIN public.profiles assigned ON assigned.email = sad.assigned_by_email
ON CONFLICT DO NOTHING;

-- Step 6: Update Sites with Assignment IDs
UPDATE public.sites s
SET 
  assigned_ops_manager_id = sa.ops_manager_id,
  assigned_deployment_engineer_id = sa.deployment_engineer_id
FROM public.site_assignments sa
WHERE s.id = sa.site_id;

-- Step 7: Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_sites_assigned_ops_manager ON public.sites(assigned_ops_manager_id);
CREATE INDEX IF NOT EXISTS idx_sites_assigned_deployment_engineer ON public.sites(assigned_deployment_engineer_id);
CREATE INDEX IF NOT EXISTS idx_site_assignments_site_id ON public.site_assignments(site_id);

-- Step 8: Enable and Configure RLS
ALTER TABLE public.site_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'site_assignments' 
        AND schemaname = 'public'
    ) THEN
        DROP POLICY IF EXISTS "Users can view site assignments for sites they have access to" ON public.site_assignments;
    END IF;
END $$;

-- Create RLS Policy
CREATE POLICY "Users can view site assignments for sites they have access to" 
ON public.site_assignments 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.sites s 
    WHERE s.id = site_assignments.site_id 
    AND (
      s.assigned_ops_manager_id = auth.uid() 
      OR s.assigned_deployment_engineer_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.role = 'admin'
      )
    )
  )
);

-- Step 9: Re-enable triggers and foreign key checks
SET session_replication_role = 'origin';

-- Validation Queries
-- View Site Assignments
WITH site_assignments_view AS (
  SELECT 
    s.name as site_name,
    s.status,
    ops.full_name as ops_manager,
    de.full_name as deployment_engineer
  FROM public.sites s
  LEFT JOIN public.profiles ops ON s.assigned_ops_manager_id = ops.user_id
  LEFT JOIN public.profiles de ON s.assigned_deployment_engineer_id = de.user_id
)
SELECT * FROM site_assignments_view
ORDER BY site_name;

-- View User Roles
WITH user_roles_view AS (
  SELECT 
    p.full_name,
    p.email,
    ur.role,
    p.created_at
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
)
SELECT * FROM user_roles_view
ORDER BY full_name, role;

-- View Organizations
WITH organizations_view AS (
  SELECT 
    id,
    org_name,
    sector,
    unit_code,
    created_on,
    created_by
  FROM public.organizations
)
SELECT * FROM organizations_view
ORDER BY org_name;
