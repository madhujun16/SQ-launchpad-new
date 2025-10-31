-- Fix sites table schema to match what the application expects
-- The application is trying to insert fields that don't exist in the current schema

-- Add missing columns to sites table
DO $$
BEGIN
    -- Add organization_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sites' 
        AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE public.sites ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
        RAISE NOTICE 'Added organization_id column to sites table';
    END IF;

    -- Add location column if it doesn't exist (TEXT field for address/location)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sites' 
        AND column_name = 'location'
    ) THEN
        ALTER TABLE public.sites ADD COLUMN location TEXT;
        RAISE NOTICE 'Added location column to sites table';
    END IF;

    -- Add target_live_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sites' 
        AND column_name = 'target_live_date'
    ) THEN
        ALTER TABLE public.sites ADD COLUMN target_live_date DATE;
        RAISE NOTICE 'Added target_live_date column to sites table';
    END IF;

    -- Add sector column if it doesn't exist (TEXT field for sector name)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sites' 
        AND column_name = 'sector'
    ) THEN
        ALTER TABLE public.sites ADD COLUMN sector TEXT;
        RAISE NOTICE 'Added sector column to sites table';
    END IF;

    -- Add unit_code column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sites' 
        AND column_name = 'unit_code'
    ) THEN
        ALTER TABLE public.sites ADD COLUMN unit_code VARCHAR(100);
        RAISE NOTICE 'Added unit_code column to sites table';
    END IF;

    -- Add criticality_level column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sites' 
        AND column_name = 'criticality_level'
    ) THEN
        ALTER TABLE public.sites ADD COLUMN criticality_level VARCHAR(20) CHECK (criticality_level IN ('low', 'medium', 'high'));
        RAISE NOTICE 'Added criticality_level column to sites table';
    END IF;

    -- Add team_assignment column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sites' 
        AND column_name = 'team_assignment'
    ) THEN
        ALTER TABLE public.sites ADD COLUMN team_assignment TEXT;
        RAISE NOTICE 'Added team_assignment column to sites table';
    END IF;

    -- Add stakeholders column if it doesn't exist (JSONB for array of stakeholders)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sites' 
        AND column_name = 'stakeholders'
    ) THEN
        ALTER TABLE public.sites ADD COLUMN stakeholders JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Added stakeholders column to sites table';
    END IF;

END $$;

-- Add indexes for performance on the new columns
CREATE INDEX IF NOT EXISTS idx_sites_organization_id_new ON public.sites(organization_id);
CREATE INDEX IF NOT EXISTS idx_sites_target_live_date ON public.sites(target_live_date);
CREATE INDEX IF NOT EXISTS idx_sites_sector ON public.sites(sector);
CREATE INDEX IF NOT EXISTS idx_sites_criticality_level ON public.sites(criticality_level);

-- Add comments to document the new columns
COMMENT ON COLUMN public.sites.organization_id IS 'Reference to the organization this site belongs to';
COMMENT ON COLUMN public.sites.location IS 'Physical location/address of the site';
COMMENT ON COLUMN public.sites.target_live_date IS 'Target date for the site to go live';
COMMENT ON COLUMN public.sites.sector IS 'Business sector of the site (e.g., Retail, Healthcare)';
COMMENT ON COLUMN public.sites.unit_code IS 'Unique unit code for the site';
COMMENT ON COLUMN public.sites.criticality_level IS 'Priority level: low, medium, or high';
COMMENT ON COLUMN public.sites.team_assignment IS 'Team assignment information';
COMMENT ON COLUMN public.sites.stakeholders IS 'JSON array of stakeholder information';

-- Update existing sites to have default values for new required fields
UPDATE public.sites SET 
    criticality_level = 'medium',
    stakeholders = '[]'::jsonb
WHERE criticality_level IS NULL OR stakeholders IS NULL;

RAISE NOTICE 'Sites table schema has been updated to match application expectations';
