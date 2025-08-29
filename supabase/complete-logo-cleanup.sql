-- Complete Logo Cleanup Script
-- This script removes ALL problematic logo-related functions and triggers

-- Step 1: Drop all problematic triggers
DROP TRIGGER IF EXISTS trigger_log_logo_change ON public.organizations;
DROP TRIGGER IF EXISTS trigger_log_organization_logo_change ON public.organizations;
DROP TRIGGER IF EXISTS trigger_organization_logo_change ON public.organizations;

-- Step 2: Drop all problematic functions
DROP FUNCTION IF EXISTS public.log_logo_change(uuid, text, text, text);
DROP FUNCTION IF EXISTS public.log_logo_change(uuid, text, text);
DROP FUNCTION IF EXISTS public.log_logo_change(uuid, text);
DROP FUNCTION IF EXISTS public.log_organization_change(uuid, text, jsonb, jsonb);
DROP FUNCTION IF EXISTS public.log_organization_change(uuid, text);
DROP FUNCTION IF EXISTS public.trigger_log_logo_change();
DROP FUNCTION IF EXISTS public.trigger_log_organization_logo_change();
DROP FUNCTION IF EXISTS public.trigger_organization_logo_change();

-- Step 3: Clean up any remaining logo-related functions (catch-all)
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT routine_name 
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name LIKE '%logo%'
        AND routine_name NOT IN ('get_organization_logo', 'update_organization_logo', 'clear_organization_logo', 'get_organizations_with_logo_status')
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || func_record.routine_name || ' CASCADE';
        RAISE NOTICE 'Dropped function: %', func_record.routine_name;
    END LOOP;
END $$;

-- Step 4: Verify cleanup
SELECT 
    'Remaining Logo Functions' as check_type,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%logo%'
ORDER BY routine_name;

SELECT 
    'Remaining Triggers on Organizations' as check_type,
    trigger_name,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND event_object_table = 'organizations'
ORDER BY trigger_name;

-- Step 5: Clear all placeholder logo URLs
UPDATE public.organizations 
SET logo_url = NULL 
WHERE logo_url LIKE 'https://via.placeholder.com%';

-- Step 6: Verify organizations table structure
SELECT 
    'Organizations Table Structure' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'organizations'
ORDER BY ordinal_position;

-- Step 7: Show current logo status
SELECT 
    'Current Logo Status' as check_type,
    id,
    name,
    CASE 
        WHEN logo_url IS NULL THEN 'No Logo'
        ELSE 'Has Logo: ' || logo_url
    END as logo_status
FROM public.organizations
ORDER BY name;
