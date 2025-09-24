-- Add missing columns to assets table to support workflow functionality
-- This script adds the necessary columns for the site workflow

-- Add service_cycle_months column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assets' 
        AND column_name = 'service_cycle_months'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.assets ADD COLUMN service_cycle_months INTEGER DEFAULT 12;
    END IF;
END $$;

-- Add model_number column if it doesn't exist (using 'model' as base)
-- Note: The existing 'model' column can be used, but we'll add model_number for consistency
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assets' 
        AND column_name = 'model_number'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.assets ADD COLUMN model_number TEXT;
    END IF;
END $$;

-- Update the status constraint to include workflow statuses
DO $$ 
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'assets_status_check' 
        AND table_name = 'assets'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.assets DROP CONSTRAINT assets_status_check;
    END IF;
    
    -- Add new constraint with workflow statuses
    ALTER TABLE public.assets ADD CONSTRAINT assets_status_check CHECK (
        status = ANY (ARRAY[
            'in_stock'::text,
            'assigned'::text,
            'deployed'::text,
            'in_maintenance'::text,
            'retired'::text,
            'pending'::text,
            'installed'::text,
            'active'::text
        ])
    );
END $$;

-- Add comments for new columns
COMMENT ON COLUMN public.assets.service_cycle_months IS 'Service interval in months for maintenance scheduling';
COMMENT ON COLUMN public.assets.model_number IS 'Unique model number for the asset (e.g., SQ-POS-001)';

-- Create index on service_cycle_months for better performance
CREATE INDEX IF NOT EXISTS idx_assets_service_cycle_months ON public.assets(service_cycle_months);

-- Create index on model_number for better performance
CREATE INDEX IF NOT EXISTS idx_assets_model_number ON public.assets(model_number);
