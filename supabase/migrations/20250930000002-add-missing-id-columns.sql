-- Add missing assigned_ops_manager_id and assigned_deployment_engineer_id columns
-- These columns are needed for the foreign key relationships in the queries

DO $$
BEGIN
    -- Add assigned_ops_manager_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sites' 
        AND column_name = 'assigned_ops_manager_id'
    ) THEN
        ALTER TABLE public.sites ADD COLUMN assigned_ops_manager_id uuid REFERENCES public.profiles(user_id);
        COMMENT ON COLUMN public.sites.assigned_ops_manager_id IS 'Foreign key to profiles table for assigned ops manager';
    END IF;
    
    -- Add assigned_deployment_engineer_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sites' 
        AND column_name = 'assigned_deployment_engineer_id'
    ) THEN
        ALTER TABLE public.sites ADD COLUMN assigned_deployment_engineer_id uuid REFERENCES public.profiles(user_id);
        COMMENT ON COLUMN public.sites.assigned_deployment_engineer_id IS 'Foreign key to profiles table for assigned deployment engineer';
    END IF;
    
    -- Copy data from old columns to new columns if they exist
    -- Note: Only copy if the old columns contain valid UUIDs
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sites' 
        AND column_name = 'assigned_ops_manager'
    ) THEN
        UPDATE public.sites 
        SET assigned_ops_manager_id = assigned_ops_manager::uuid 
        WHERE assigned_ops_manager_id IS NULL 
        AND assigned_ops_manager IS NOT NULL 
        AND assigned_ops_manager ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sites' 
        AND column_name = 'assigned_deployment_engineer'
    ) THEN
        UPDATE public.sites 
        SET assigned_deployment_engineer_id = assigned_deployment_engineer::uuid 
        WHERE assigned_deployment_engineer_id IS NULL 
        AND assigned_deployment_engineer IS NOT NULL 
        AND assigned_deployment_engineer ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    END IF;
END $$;
