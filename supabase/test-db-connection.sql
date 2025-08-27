-- Test Database Connection and Permissions
-- This script helps diagnose database connection issues

-- Test 1: Check if we can read from profiles table
SELECT COUNT(*) as profiles_count FROM profiles LIMIT 1;

-- Test 2: Check if we can read from user_roles table  
SELECT COUNT(*) as user_roles_count FROM user_roles LIMIT 1;

-- Test 3: Check current database state
SELECT 
  current_setting('transaction_read_only') as is_readonly,
  current_setting('transaction_isolation') as isolation_level,
  current_setting('default_transaction_read_only') as default_readonly;

-- Test 4: Check if we can see the foreign key relationship
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'user_roles';

-- Test 5: Check RLS policies
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
WHERE tablename IN ('profiles', 'user_roles');
