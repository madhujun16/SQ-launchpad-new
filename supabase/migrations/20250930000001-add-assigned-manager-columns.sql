-- Add assigned manager columns to sites table
-- These columns are needed to store foreign keys to profiles table for assigned team members

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
END $$;
