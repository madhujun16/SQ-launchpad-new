-- Test Bucket Access
-- This script tests if the bucket is accessible and has proper permissions

-- Step 1: Check bucket exists
SELECT 
    'Bucket Existence' as test_type,
    id,
    name,
    public,
    CASE 
        WHEN id IS NOT NULL THEN '✅ Bucket exists'
        ELSE '❌ Bucket missing'
    END as status
FROM storage.buckets 
WHERE id = 'organization-logos';

-- Step 2: Check storage policies
SELECT 
    'Storage Policies' as test_type,
    policyname,
    cmd,
    CASE 
        WHEN policyname IS NOT NULL THEN '✅ Policy exists'
        ELSE '❌ Policy missing'
    END as status
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%organization%'
ORDER BY policyname;

-- Step 3: Test if we can insert into storage.objects
DO $$
DECLARE
    test_result BOOLEAN;
BEGIN
    -- Try to insert a test record (this will fail due to constraints, but we can see if policies allow it)
    BEGIN
        INSERT INTO storage.objects (bucket_id, name, owner, metadata)
        VALUES ('organization-logos', 'test-file.txt', auth.uid(), '{"size": 100}'::jsonb);
        
        RAISE NOTICE '✅ INSERT policy working - test record created';
        
        -- Clean up test record
        DELETE FROM storage.objects WHERE bucket_id = 'organization-logos' AND name = 'test-file.txt';
        RAISE NOTICE '✅ Test record cleaned up';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ INSERT policy issue: %', SQLERRM;
    END;
END $$;

-- Step 4: Check current user authentication
SELECT 
    'Authentication Status' as test_type,
    CASE 
        WHEN auth.role() = 'authenticated' THEN '✅ User authenticated'
        ELSE '❌ User not authenticated: ' || auth.role()
    END as status;

-- Step 5: Check bucket permissions
SELECT 
    'Bucket Permissions' as test_type,
    has_table_privilege('authenticated', 'storage.objects', 'INSERT') as can_insert,
    has_table_privilege('authenticated', 'storage.objects', 'SELECT') as can_select,
    has_table_privilege('authenticated', 'storage.objects', 'UPDATE') as can_update,
    has_table_privilege('authenticated', 'storage.objects', 'DELETE') as can_delete;
