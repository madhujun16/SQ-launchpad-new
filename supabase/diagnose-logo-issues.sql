-- Diagnose Logo Issues
-- This script shows what's currently in the database

-- Step 1: Check all triggers on organizations table
SELECT 
  'Triggers on Organizations' as check_type,
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND event_object_table = 'organizations'
ORDER BY trigger_name;

-- Step 2: Check all functions with 'logo' in the name
SELECT 
  'Logo Functions' as check_type,
  routine_name,
  routine_type,
  data_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%logo%'
ORDER BY routine_name;

-- Step 3: Check all functions with 'log' and 'change' in the name
SELECT 
  'Log Change Functions' as check_type,
  routine_name,
  routine_type,
  data_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%log%'
  AND routine_name LIKE '%change%'
ORDER BY routine_name;

-- Step 4: Check the organizations table structure
SELECT 
  'Organizations Table' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'organizations'
ORDER BY ordinal_position;

-- Step 5: Check current logo data
SELECT 
  'Current Logo Data' as check_type,
  id,
  name,
  logo_url,
  CASE 
    WHEN logo_url IS NULL THEN 'No Logo'
    ELSE 'Has Logo'
  END as logo_status
FROM public.organizations
ORDER BY name;
