-- Check the current structure of the audit_logs table
-- This will help us understand what columns actually exist

-- Show table structure
\d public.audit_logs

-- Alternative: Check columns using information_schema
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'audit_logs'
ORDER BY ordinal_position;

-- Check if specific columns exist
SELECT 
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'audit_logs' 
      AND column_name = 'record_id'
  ) THEN 'record_id exists' ELSE 'record_id does NOT exist' END as record_id_status,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'audit_logs' 
      AND column_name = 'user_id'
  ) THEN 'user_id exists' ELSE 'user_id does NOT exist' END as user_id_status,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'audit_logs' 
      AND column_name = 'action'
  ) THEN 'action exists' ELSE 'action does NOT exist' END as action_status,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'audit_logs' 
      AND column_name = 'table_name'
  ) THEN 'table_name exists' ELSE 'table_name does NOT exist' END as table_name_status;

-- Show a few sample rows to understand the data structure
SELECT * FROM public.audit_logs LIMIT 3;
