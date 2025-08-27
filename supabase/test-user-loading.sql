-- Test User Loading and Identify Transaction Issues
-- This script helps diagnose why user loading is failing

-- Test 1: Check if we can read from profiles table
SELECT COUNT(*) as profiles_count FROM profiles;

-- Test 2: Check if we can read from user_roles table  
SELECT COUNT(*) as user_roles_count FROM user_roles;

-- Test 3: Check current database state
SELECT 
  current_setting('transaction_read_only') as is_readonly,
  current_setting('transaction_isolation') as isolation_level,
  current_setting('default_transaction_read_only') as default_readonly;

-- Test 4: Check if there are any active transactions
SELECT 
  pid,
  usename,
  application_name,
  client_addr,
  backend_start,
  state,
  query
FROM pg_stat_activity 
WHERE state = 'active' 
  AND query NOT LIKE '%pg_stat_activity%';

-- Test 5: Check if there are any locks
SELECT 
  l.pid,
  l.mode,
  l.granted,
  a.usename,
  a.query
FROM pg_locks l
JOIN pg_stat_activity a ON l.pid = a.pid
WHERE l.pid <> pg_backend_pid();

-- Test 6: Check RLS policies for profiles table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- Test 7: Check if the current user has proper permissions
SELECT 
  current_user as current_user,
  session_user as session_user,
  current_database() as current_database;
