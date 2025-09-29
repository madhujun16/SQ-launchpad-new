-- Clean up orphaned custom types and enums after table removal
-- This migration removes enums that are no longer referenced

-- ⚠️  BACKUP YOUR DATABASE BEFORE RUNNING THIS MIGRATION

-- Remove orphaned enums that were related to dropped tables
-- Only remove if they're not used by remaining tables

-- Costing approval status enum (if not used elsewhere)
DO $$ 
BEGIN
    -- Check if costing_approval_status enum is used anywhere
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND data_type LIKE '%costing_approval_status%'
    ) THEN
        DROP TYPE IF EXISTS public.costing_approval_status CASCADE;
    END IF;
END $$;

-- Procurement status enum (if not used elsewhere)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND data_type LIKE '%procurement_status%'
    ) THEN
        DROP TYPE IF EXISTS public.procurement_status CASCADE;
    END IF;
END $$;

-- Inventory status enum (if not used elsewhere)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND data_type LIKE '%inventory_status%'
    ) THEN
        DROP TYPE IF EXISTS public.inventory_status CASCADE;
    END IF;
END $$;

-- Inventory type enum (if not used elsewhere)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND data_type LIKE '%inventory_type%'
    ) THEN
        DROP TYPE IF EXISTS public.inventory_type CASCADE;
    END IF;
END $$;

-- Group type enum (if not used elsewhere)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND data_type LIKE '%inventory_group_type%'
    ) THEN
        DROP TYPE IF EXISTS public.inventory_group_type CASCADE;
    END IF;
END $$;

-- Site status enum (if exists and not used)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND data_type LIKE '%site_status%'
        AND table_name IN ('sites', 'site_status_tracking')
    ) THEN
        DROP TYPE IF EXISTS public.site_status CASCADE;
    END IF;
END $$;

-- Keep support_type and hardware_support_type as they may be used by hardware_items
-- Keep app_role as it's actively used by user_roles

-- Add comment for this migration
COMMENT ON DATABASE postgres IS 'Custom types cleaned up on 2025-01-25';
