-- Fix Storage Bucket Policies for site-layout-images
-- Run this in your Supabase Dashboard SQL Editor

-- First, let's check if the bucket exists and get its ID
SELECT id, name, public, file_size_limit, created_at 
FROM storage.buckets 
WHERE name = 'site-layout-images';

-- If the bucket exists, we need to create the proper storage policies
-- Note: These policies must be created manually as they're storage-specific

-- 1. Policy for authenticated users to upload files
CREATE POLICY "Allow authenticated uploads to site-layout-images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'site-layout-images' 
  AND auth.role() = 'authenticated'
);

-- 2. Policy for public viewing of files
CREATE POLICY "Allow public viewing of site-layout-images" ON storage.objects
FOR SELECT USING (bucket_id = 'site-layout-images');

-- 3. Policy for authenticated users to delete files
CREATE POLICY "Allow authenticated deletes from site-layout-images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'site-layout-images'
  AND auth.role() = 'authenticated'
);

-- 4. Policy for authenticated users to update files (optional)
CREATE POLICY "Allow authenticated updates to site-layout-images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'site-layout-images'
  AND auth.role() = 'authenticated'
);

-- Verify the policies were created
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
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%site-layout-images%';

-- If you get any errors about policies already existing, you can drop them first:
-- DROP POLICY IF EXISTS "Allow authenticated uploads to site-layout-images" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow public viewing of site-layout-images" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow authenticated deletes from site-layout-images" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow authenticated updates to site-layout-images" ON storage.objects;
