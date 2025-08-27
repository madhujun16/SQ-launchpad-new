-- Fix Foreign Key Relationship Issue
-- This script ensures the proper foreign key relationship exists between profiles and user_roles

-- Step 1: Verify current foreign key constraints
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

-- Step 2: Drop existing constraint if it exists (to recreate it properly)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_user_roles_user_id' 
    AND table_name = 'user_roles'
  ) THEN
    ALTER TABLE public.user_roles DROP CONSTRAINT fk_user_roles_user_id;
  END IF;
END $$;

-- Step 3: Recreate the foreign key constraint
ALTER TABLE public.user_roles 
ADD CONSTRAINT fk_user_roles_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Step 4: Verify the constraint was created
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

-- Step 5: Check for any orphaned data
SELECT COUNT(*) as orphaned_user_roles
FROM user_roles ur
LEFT JOIN profiles p ON ur.user_id = p.user_id
WHERE p.user_id IS NULL;

-- Step 6: If there are orphaned records, clean them up
DELETE FROM user_roles 
WHERE user_id NOT IN (SELECT user_id FROM profiles);

-- Step 7: Verify data integrity
SELECT 
  'profiles' as table_name,
  COUNT(*) as record_count
FROM profiles
UNION ALL
SELECT 
  'user_roles' as table_name,
  COUNT(*) as record_count
FROM user_roles;

-- Step 8: Test the relationship with a simple query
SELECT 
  p.email,
  p.full_name,
  ur.role
FROM profiles p
JOIN user_roles ur ON p.user_id = ur.user_id
LIMIT 5;
