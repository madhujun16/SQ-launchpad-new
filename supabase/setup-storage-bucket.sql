-- Setup Storage Bucket for Organization Logos
-- This script creates the storage bucket and sets up proper policies

-- Step 1: Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'organization-logos', 
    'organization-logos', 
    true, 
    5242880, -- 5MB file size limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Step 2: Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload organization logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view organization logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update organization logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete organization logos" ON storage.objects;

-- Step 3: Create storage policies for organization-logos bucket

-- Policy for inserting logos (upload)
CREATE POLICY "Allow authenticated users to upload organization logos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'organization-logos' 
        AND auth.role() = 'authenticated'
    );

-- Policy for viewing logos (public access)
CREATE POLICY "Allow public to view organization logos" ON storage.objects
    FOR SELECT USING (bucket_id = 'organization-logos');

-- Policy for updating logos
CREATE POLICY "Allow authenticated users to update organization logos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'organization-logos' 
        AND auth.role() = 'authenticated'
    );

-- Policy for deleting logos
CREATE POLICY "Allow authenticated users to delete organization logos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'organization-logos' 
        AND auth.role() = 'authenticated'
    );

-- Step 4: Verify bucket creation
SELECT 
    'Storage Bucket Status' as check_type,
    id,
    name,
    public,
    file_size_limit,
    CASE 
        WHEN id IS NOT NULL THEN '✅ Bucket created successfully'
        ELSE '❌ Bucket creation failed'
    END as status
FROM storage.buckets 
WHERE id = 'organization-logos';

-- Step 5: Verify policies
SELECT 
    'Storage Policies Status' as check_type,
    policy_name,
    table_name,
    CASE 
        WHEN policy_name IS NOT NULL THEN '✅ Policy created'
        ELSE '❌ Policy missing'
    END as status
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%organization logos%'
ORDER BY policy_name;

-- Step 6: Test bucket access
SELECT 
    'Bucket Access Test' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM storage.buckets 
            WHERE id = 'organization-logos'
        ) THEN '✅ Bucket accessible'
        ELSE '❌ Bucket not accessible'
    END as status;
