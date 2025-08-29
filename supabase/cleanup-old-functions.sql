-- Cleanup Old Functions and Triggers
-- This script removes the old problematic functions before creating new ones

-- Step 1: Drop old triggers first
DROP TRIGGER IF EXISTS trigger_log_logo_change ON public.organizations;

-- Step 2: Drop old functions
DROP FUNCTION IF EXISTS public.log_logo_change(UUID, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.trigger_log_logo_change();

-- Step 3: Verify cleanup
SELECT 
  'Old Functions Cleanup' as status,
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_schema = 'public' 
        AND routine_name IN ('log_logo_change', 'trigger_log_logo_change')
    ) THEN '✅ Old functions removed successfully'
    ELSE '❌ Some old functions still exist'
  END as result;

-- Step 4: Check what triggers exist on organizations table
SELECT 
  'Current Triggers' as check_type,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND event_object_table = 'organizations';

-- Step 5: Check what functions exist
SELECT 
  'Current Functions' as check_type,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%logo%'
ORDER BY routine_name;
