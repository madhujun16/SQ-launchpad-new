-- Find Storage Buckets
-- This script helps identify the correct storage bucket configuration

-- Step 1: List all available storage buckets
SELECT 
    'Available Buckets' as info_type,
    id as bucket_id, 
    name as bucket_name, 
    public,
    file_size_limit,
    created_at
FROM storage.buckets
ORDER BY created_at;

-- Step 2: Check bucket details
SELECT 
    'Bucket Details' as info_type,
    id as bucket_id,
    name as bucket_name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at,
    updated_at
FROM storage.buckets
WHERE id = 'organization-logos' OR name LIKE '%logo%' OR name LIKE '%organization%';

-- Step 3: Check if organization-logos bucket exists
SELECT 
    'Bucket Existence Check' as info_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'organization-logos') 
        THEN '✅ organization-logos bucket exists'
        ELSE '❌ organization-logos bucket does NOT exist'
    END as status;

-- Step 4: Check storage policies
SELECT 
    'Storage Policies' as info_type,
    policyname,
    tablename,
    cmd,
    CASE 
        WHEN policyname IS NOT NULL THEN '✅ Policy exists'
        ELSE '❌ No policies found'
    END as status
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%logo%'
ORDER BY policyname;

-- Step 5: Test bucket access
DO $$
DECLARE
    bucket_count INTEGER;
    bucket_id TEXT;
    bucket_name TEXT;
BEGIN
    -- Count total buckets
    SELECT COUNT(*) INTO bucket_count FROM storage.buckets;
    
    -- Get first bucket info
    SELECT id, name INTO bucket_id, bucket_name FROM storage.buckets LIMIT 1;
    
    RAISE NOTICE 'Total storage buckets: %', bucket_count;
    RAISE NOTICE 'First bucket - ID: %, Name: %', bucket_id, bucket_name;
    
    -- Check specific bucket
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'organization-logos') THEN
        RAISE NOTICE '✅ organization-logos bucket found';
    ELSE
        RAISE NOTICE '❌ organization-logos bucket NOT found';
        
        -- Suggest alternative bucket names
        RAISE NOTICE 'Available buckets:';
        FOR bucket_record IN SELECT id, name FROM storage.buckets LOOP
            RAISE NOTICE '  - ID: %, Name: %', bucket_record.id, bucket_record.name;
        END LOOP;
    END IF;
END $$;
