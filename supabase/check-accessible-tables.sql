-- Check which tables are accessible via REST API
-- This will help identify the correct table names for users

-- Check if profiles table exists and is accessible
SELECT 
  schemaname,
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('profiles', 'user_roles', 'users', 'auth_users', 'public_users')
ORDER BY tablename;

-- Check if there are any views that might contain user data
SELECT 
  schemaname,
  viewname,
  viewowner
FROM pg_views 
WHERE viewname LIKE '%user%' OR viewname LIKE '%profile%'
ORDER BY viewname;

-- Check RLS policies on profiles table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- Check if profiles table has any triggers that might be causing issues
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'profiles';

-- Check current user permissions
SELECT 
  current_user as current_user,
  session_user as session_user,
  current_database() as current_database;

-- Check if there are any other user-related tables
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE '%user%' OR table_name LIKE '%profile%' OR table_name LIKE '%auth%')
ORDER BY table_name;
