-- Update database schema to match the latest provided schema
-- This migration ensures all tables match the current application requirements

-- First, let's ensure we have the required custom types
DO $$
BEGIN
    -- Create support_type enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'support_type') THEN
        CREATE TYPE public.support_type AS ENUM ('None', 'Basic', 'Premium', 'Enterprise');
    END IF;
    
    -- Create hardware_support_type enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hardware_support_type') THEN
        CREATE TYPE public.hardware_support_type AS ENUM ('POS', 'KMS', 'KIOSK', 'Other');
    END IF;
    
    -- Create role enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
        CREATE TYPE public.role AS ENUM ('admin', 'ops_manager', 'deployment_engineer', 'viewer');
    END IF;
END $$;

-- Update sites table to match the latest schema
DO $$
BEGIN
    -- Add missing columns to sites table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sites' 
        AND column_name = 'organization_logo'
    ) THEN
        ALTER TABLE public.sites ADD COLUMN organization_logo text;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sites' 
        AND column_name = 'food_court_unit'
    ) THEN
        ALTER TABLE public.sites ADD COLUMN food_court_unit text;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sites' 
        AND column_name = 'latitude'
    ) THEN
        ALTER TABLE public.sites ADD COLUMN latitude numeric;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sites' 
        AND column_name = 'longitude'
    ) THEN
        ALTER TABLE public.sites ADD COLUMN longitude numeric;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sites' 
        AND column_name = 'unit_manager_name'
    ) THEN
        ALTER TABLE public.sites ADD COLUMN unit_manager_name character varying;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sites' 
        AND column_name = 'job_title'
    ) THEN
        ALTER TABLE public.sites ADD COLUMN job_title character varying;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sites' 
        AND column_name = 'unit_manager_email'
    ) THEN
        ALTER TABLE public.sites ADD COLUMN unit_manager_email character varying;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sites' 
        AND column_name = 'unit_manager_mobile'
    ) THEN
        ALTER TABLE public.sites ADD COLUMN unit_manager_mobile character varying;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sites' 
        AND column_name = 'additional_contact_name'
    ) THEN
        ALTER TABLE public.sites ADD COLUMN additional_contact_name character varying;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sites' 
        AND column_name = 'additional_contact_email'
    ) THEN
        ALTER TABLE public.sites ADD COLUMN additional_contact_email character varying;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sites' 
        AND column_name = 'region'
    ) THEN
        ALTER TABLE public.sites ADD COLUMN region character varying;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sites' 
        AND column_name = 'country'
    ) THEN
        ALTER TABLE public.sites ADD COLUMN country character varying;
    END IF;
    
    -- Update criticality_level constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sites' 
        AND column_name = 'criticality_level'
    ) THEN
        -- Drop existing constraint if it exists
        ALTER TABLE public.sites DROP CONSTRAINT IF EXISTS sites_criticality_level_check;
        -- Add new constraint
        ALTER TABLE public.sites ADD CONSTRAINT sites_criticality_level_check 
            CHECK (criticality_level = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]));
    END IF;
    
    -- Update stakeholders default value
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sites' 
        AND column_name = 'stakeholders'
    ) THEN
        ALTER TABLE public.sites ALTER COLUMN stakeholders SET DEFAULT '[]'::jsonb;
    END IF;
    
END $$;

-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_name_unique UNIQUE (name)
);

-- Create general_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.general_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  date_format character varying DEFAULT 'dd-mmm-yyyy'::character varying,
  currency character varying DEFAULT 'GBP'::character varying,
  fy_budget numeric DEFAULT 500000,
  site_targets integer DEFAULT 1000,
  approval_response_time integer DEFAULT 24,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT general_settings_pkey PRIMARY KEY (id)
);

-- Create notification_preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email_enabled boolean DEFAULT true,
  push_enabled boolean DEFAULT true,
  scoping_notifications boolean DEFAULT true,
  approval_notifications boolean DEFAULT true,
  deployment_notifications boolean DEFAULT true,
  maintenance_notifications boolean DEFAULT true,
  forecast_notifications boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notification_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT notification_preferences_user_id_unique UNIQUE (user_id),
  CONSTRAINT notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Update notifications table to match latest schema
DO $$
BEGIN
    -- Add missing columns to notifications table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications' 
        AND column_name = 'entity_type'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN entity_type text NOT NULL DEFAULT 'site';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications' 
        AND column_name = 'entity_id'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN entity_id uuid NOT NULL DEFAULT gen_random_uuid();
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications' 
        AND column_name = 'action_url'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN action_url text;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications' 
        AND column_name = 'created_by'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN created_by uuid NOT NULL DEFAULT gen_random_uuid();
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications' 
        AND column_name = 'priority'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN priority text DEFAULT 'normal'::text;
    END IF;
    
    -- Add constraints
    ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
    ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
        CHECK (type = ANY (ARRAY['scoping_submitted'::text, 'approval_decision'::text, 'resubmission'::text, 'procurement_update'::text, 'deployment_milestone'::text, 'maintenance_due'::text, 'forecast_risk'::text, 'system_alert'::text]));
    
    ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_entity_type_check;
    ALTER TABLE public.notifications ADD CONSTRAINT notifications_entity_type_check 
        CHECK (entity_type = ANY (ARRAY['site'::text, 'scoping_approval'::text, 'costing_approval'::text, 'deployment'::text, 'asset'::text]));
    
    ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_priority_check;
    ALTER TABLE public.notifications ADD CONSTRAINT notifications_priority_check 
        CHECK (priority = ANY (ARRAY['low'::text, 'normal'::text, 'high'::text, 'urgent'::text]));
    
    -- Add foreign key constraints
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'notifications_created_by_fkey'
    ) THEN
        ALTER TABLE public.notifications ADD CONSTRAINT notifications_created_by_fkey 
            FOREIGN KEY (created_by) REFERENCES auth.users(id);
    END IF;
    
END $$;

-- Create recommendation_rules table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.recommendation_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  software_module_id uuid NOT NULL,
  hardware_item_id uuid NOT NULL,
  default_quantity integer DEFAULT 1,
  is_required boolean DEFAULT true,
  reason text,
  cost_multiplier numeric DEFAULT 1.00,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  CONSTRAINT recommendation_rules_pkey PRIMARY KEY (id),
  CONSTRAINT recommendation_rules_default_quantity_check CHECK (default_quantity > 0),
  CONSTRAINT recommendation_rules_software_module_id_fkey FOREIGN KEY (software_module_id) REFERENCES public.software_modules(id),
  CONSTRAINT recommendation_rules_hardware_item_id_fkey FOREIGN KEY (hardware_item_id) REFERENCES public.hardware_items(id),
  CONSTRAINT recommendation_rules_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT recommendation_rules_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id)
);

-- Update site_approvals table to match latest schema
DO $$
BEGIN
    -- Add missing columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'site_approvals' 
        AND column_name = 'approval_type'
    ) THEN
        ALTER TABLE public.site_approvals ADD COLUMN approval_type text;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'site_approvals' 
        AND column_name = 'scoping_id'
    ) THEN
        ALTER TABLE public.site_approvals ADD COLUMN scoping_id uuid;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'site_approvals' 
        AND column_name = 'requested_by'
    ) THEN
        ALTER TABLE public.site_approvals ADD COLUMN requested_by uuid;
    END IF;
    
    -- Update constraints
    ALTER TABLE public.site_approvals DROP CONSTRAINT IF EXISTS site_approvals_status_check;
    ALTER TABLE public.site_approvals ADD CONSTRAINT site_approvals_status_check 
        CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'changes_requested'::text]));
    
END $$;

-- Update site_assignments table to match latest schema
DO $$
BEGIN
    -- Add missing columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'site_assignments' 
        AND column_name = 'assigned_by'
    ) THEN
        ALTER TABLE public.site_assignments ADD COLUMN assigned_by uuid NOT NULL DEFAULT gen_random_uuid();
    END IF;
    
    -- Update foreign key constraints
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'site_assignments_assigned_by_fkey'
    ) THEN
        ALTER TABLE public.site_assignments ADD CONSTRAINT site_assignments_assigned_by_fkey 
            FOREIGN KEY (assigned_by) REFERENCES public.profiles(id);
    END IF;
    
END $$;

-- Create site_creation_data table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.site_creation_data (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL,
  unit_manager_name text,
  job_title text,
  unit_manager_email text,
  unit_manager_mobile text,
  additional_contact_name text,
  additional_contact_email text,
  location text,
  postcode text,
  region text,
  country text DEFAULT 'United Kingdom'::text,
  latitude numeric,
  longitude numeric,
  additional_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT site_creation_data_pkey PRIMARY KEY (id),
  CONSTRAINT site_creation_data_site_id_unique UNIQUE (site_id),
  CONSTRAINT site_creation_data_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id)
);

-- Update site_deployments table to match latest schema
DO $$
BEGIN
    -- Add missing columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'site_deployments' 
        AND column_name = 'assigned_engineer'
    ) THEN
        ALTER TABLE public.site_deployments ADD COLUMN assigned_engineer uuid;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'site_deployments' 
        AND column_name = 'progress'
    ) THEN
        ALTER TABLE public.site_deployments ADD COLUMN progress jsonb DEFAULT '{"testing": "pending", "installation": "pending", "overallProgress": 0, "hardwareDelivered": "pending"}'::jsonb;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'site_deployments' 
        AND column_name = 'timeline'
    ) THEN
        ALTER TABLE public.site_deployments ADD COLUMN timeline jsonb DEFAULT '{"goLiveDate": "", "testingEnd": "", "testingStart": "", "installationEnd": "", "hardwareDelivery": "", "installationStart": ""}'::jsonb;
    END IF;
    
    -- Update constraints
    ALTER TABLE public.site_deployments DROP CONSTRAINT IF EXISTS site_deployments_status_check;
    ALTER TABLE public.site_deployments ADD CONSTRAINT site_deployments_status_check 
        CHECK (status = ANY (ARRAY['scheduled'::text, 'in_progress'::text, 'completed'::text, 'on_hold'::text]));
    
    -- Add foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'site_deployments_assigned_engineer_fkey'
    ) THEN
        ALTER TABLE public.site_deployments ADD CONSTRAINT site_deployments_assigned_engineer_fkey 
            FOREIGN KEY (assigned_engineer) REFERENCES auth.users(id);
    END IF;
    
END $$;

-- Create site_go_live table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.site_go_live (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL,
  status text DEFAULT 'pending'::text,
  date date,
  signed_off_by text,
  notes text,
  checklist jsonb DEFAULT '{"finalTesting": "pending", "staffTraining": "pending", "hardwareInstallationComplete": "pending", "softwareConfigurationComplete": "pending"}'::jsonb,
  timeline jsonb DEFAULT '{"finalTesting": "", "staffTraining": "", "systemHandover": "", "targetGoLiveDate": ""}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT site_go_live_pkey PRIMARY KEY (id),
  CONSTRAINT site_go_live_site_id_unique UNIQUE (site_id),
  CONSTRAINT site_go_live_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id),
  CONSTRAINT site_go_live_status_check CHECK (status = ANY (ARRAY['pending'::text, 'live'::text, 'postponed'::text]))
);

-- Update site_procurement table to match latest schema
DO $$
BEGIN
    -- Add missing columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'site_procurement' 
        AND column_name = 'summary'
    ) THEN
        ALTER TABLE public.site_procurement ADD COLUMN summary jsonb DEFAULT '{"completed": 0, "inProgress": 0, "totalHardwareItems": 0, "totalSoftwareModules": 0}'::jsonb;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'site_procurement' 
        AND column_name = 'last_updated'
    ) THEN
        ALTER TABLE public.site_procurement ADD COLUMN last_updated timestamp with time zone DEFAULT now();
    END IF;
    
    -- Update constraints
    ALTER TABLE public.site_procurement DROP CONSTRAINT IF EXISTS site_procurement_status_check;
    ALTER TABLE public.site_procurement ADD CONSTRAINT site_procurement_status_check 
        CHECK (status = ANY (ARRAY['pending'::text, 'ordered'::text, 'delivered'::text, 'partially_delivered'::text]));
    
END $$;

-- Update site_scoping_data table to match latest schema
DO $$
BEGIN
    -- Add missing columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'site_scoping_data' 
        AND column_name = 'cost_summary'
    ) THEN
        ALTER TABLE public.site_scoping_data ADD COLUMN cost_summary jsonb DEFAULT '{"totalCapex": 0, "hardwareCost": 0, "contingencyCost": 0, "maintenanceCost": 0, "totalInvestment": 0, "installationCost": 0, "totalMonthlyOpex": 0, "softwareSetupCost": 0, "monthlySoftwareFees": 0}'::jsonb;
    END IF;
    
    -- Update constraints
    ALTER TABLE public.site_scoping_data DROP CONSTRAINT IF EXISTS site_scoping_data_status_check;
    ALTER TABLE public.site_scoping_data ADD CONSTRAINT site_scoping_data_status_check 
        CHECK (status = ANY (ARRAY['pending'::text, 'submitted'::text, 'approved'::text, 'rejected'::text, 'changes_requested'::text]));
    
END $$;

-- Update site_study_data table to match latest schema
DO $$
BEGIN
    -- Add missing columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'site_study_data' 
        AND column_name = 'selected_solutions'
    ) THEN
        ALTER TABLE public.site_study_data ADD COLUMN selected_solutions jsonb DEFAULT '[]'::jsonb;
    END IF;
    
END $$;

-- Update software_modules table to match latest schema
DO $$
BEGIN
    -- Add missing columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'software_modules' 
        AND column_name = 'category_id'
    ) THEN
        ALTER TABLE public.software_modules ADD COLUMN category_id uuid NOT NULL DEFAULT gen_random_uuid();
    END IF;
    
    -- Add foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'software_modules_category_id_fkey'
    ) THEN
        ALTER TABLE public.software_modules ADD CONSTRAINT software_modules_category_id_fkey 
            FOREIGN KEY (category_id) REFERENCES public.categories(id);
    END IF;
    
END $$;

-- Update hardware_items table to match latest schema
DO $$
BEGIN
    -- Add missing columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hardware_items' 
        AND column_name = 'category_id'
    ) THEN
        ALTER TABLE public.hardware_items ADD COLUMN category_id uuid NOT NULL DEFAULT gen_random_uuid();
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hardware_items' 
        AND column_name = 'support_type'
    ) THEN
        ALTER TABLE public.hardware_items ADD COLUMN support_type support_type DEFAULT 'None'::support_type;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hardware_items' 
        AND column_name = 'type'
    ) THEN
        ALTER TABLE public.hardware_items ADD COLUMN type hardware_support_type DEFAULT 'Other'::hardware_support_type;
    END IF;
    
    -- Add foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'hardware_items_category_id_fkey'
    ) THEN
        ALTER TABLE public.hardware_items ADD CONSTRAINT hardware_items_category_id_fkey 
            FOREIGN KEY (category_id) REFERENCES public.categories(id);
    END IF;
    
END $$;

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role role NOT NULL,
  assigned_by uuid,
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT fk_user_roles_user_id FOREIGN KEY (user_id) REFERENCES public.profiles(user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sites_organization_id ON public.sites(organization_id);
CREATE INDEX IF NOT EXISTS idx_sites_status ON public.sites(status);
CREATE INDEX IF NOT EXISTS idx_sites_assigned_ops_manager_id ON public.sites(assigned_ops_manager_id);
CREATE INDEX IF NOT EXISTS idx_sites_assigned_deployment_engineer_id ON public.sites(assigned_deployment_engineer_id);
CREATE INDEX IF NOT EXISTS idx_sites_criticality_level ON public.sites(criticality_level);
CREATE INDEX IF NOT EXISTS idx_sites_is_archived ON public.sites(is_archived);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_entity_type ON public.notifications(entity_type);
CREATE INDEX IF NOT EXISTS idx_notifications_entity_id ON public.notifications(entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_site_approvals_site_id ON public.site_approvals(site_id);
CREATE INDEX IF NOT EXISTS idx_site_approvals_status ON public.site_approvals(status);

CREATE INDEX IF NOT EXISTS idx_site_assignments_site_id ON public.site_assignments(site_id);
CREATE INDEX IF NOT EXISTS idx_site_assignments_ops_manager_id ON public.site_assignments(ops_manager_id);
CREATE INDEX IF NOT EXISTS idx_site_assignments_deployment_engineer_id ON public.site_assignments(deployment_engineer_id);

CREATE INDEX IF NOT EXISTS idx_hardware_items_category_id ON public.hardware_items(category_id);
CREATE INDEX IF NOT EXISTS idx_software_modules_category_id ON public.software_modules(category_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Add comments to document the schema
COMMENT ON TABLE public.sites IS 'Main sites table with all site information and workflow data';
COMMENT ON TABLE public.categories IS 'Categories for hardware and software items';
COMMENT ON TABLE public.general_settings IS 'Application-wide settings and configuration';
COMMENT ON TABLE public.notification_preferences IS 'User notification preferences';
COMMENT ON TABLE public.notifications IS 'System notifications for users';
COMMENT ON TABLE public.recommendation_rules IS 'Rules for recommending hardware/software combinations';
COMMENT ON TABLE public.site_creation_data IS 'Additional site creation data and contact information';
COMMENT ON TABLE public.user_roles IS 'User role assignments and permissions';

RAISE NOTICE 'Database schema has been updated to match the latest requirements';
