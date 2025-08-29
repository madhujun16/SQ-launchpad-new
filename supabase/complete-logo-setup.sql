-- Complete Organization Logo Setup
-- This script sets up everything needed for organization logo management

-- Step 1: Ensure logo_url column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'organizations' 
        AND column_name = 'logo_url'
    ) THEN
        ALTER TABLE public.organizations ADD COLUMN logo_url TEXT;
        RAISE NOTICE 'Added logo_url column to organizations table';
    ELSE
        RAISE NOTICE 'logo_url column already exists';
    END IF;
END $$;

-- Step 2: Create storage bucket
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

-- Step 3: Set up storage policies
-- Drop existing policies first
DROP POLICY IF EXISTS "Allow authenticated users to upload organization logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view organization logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update organization logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete organization logos" ON storage.objects;

-- Create new policies
CREATE POLICY "Allow authenticated users to upload organization logos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'organization-logos' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Allow public to view organization logos" ON storage.objects
    FOR SELECT USING (bucket_id = 'organization-logos');

CREATE POLICY "Allow authenticated users to update organization logos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'organization-logos' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Allow authenticated users to delete organization logos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'organization-logos' 
        AND auth.role() = 'authenticated'
    );

-- Step 4: Create logo management functions

-- Function to get organization logo
CREATE OR REPLACE FUNCTION public.get_organization_logo(org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (SELECT logo_url FROM public.organizations WHERE id = org_id);
END;
$$;

-- Function to update organization logo
CREATE OR REPLACE FUNCTION public.update_organization_logo(org_id UUID, new_logo_url TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.organizations 
    SET logo_url = new_logo_url, updated_at = NOW()
    WHERE id = org_id;
    
    RETURN FOUND;
END;
$$;

-- Function to clear organization logo
CREATE OR REPLACE FUNCTION public.clear_organization_logo(org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.organizations 
    SET logo_url = NULL, updated_at = NOW()
    WHERE id = org_id;
    
    RETURN FOUND;
END;
$$;

-- Function to get organizations with logo status
CREATE OR REPLACE FUNCTION public.get_organizations_with_logo_status()
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    description TEXT,
    sector VARCHAR(255),
    unit_code TEXT,
    logo_url TEXT,
    has_logo BOOLEAN,
    logo_file_size BIGINT,
    created_by TEXT,
    created_on TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.name,
        o.description,
        o.sector,
        o.unit_code,
        o.logo_url,
        CASE WHEN o.logo_url IS NOT NULL THEN true ELSE false END as has_logo,
        CASE 
            WHEN o.logo_url IS NOT NULL THEN 
                (SELECT COALESCE(metadata->>'size', '0')::BIGINT
                 FROM storage.objects 
                 WHERE bucket_id = 'organization-logos'
                 AND storage.objects.name = split_part(o.logo_url, '/', -1))
            ELSE 0 
        END as logo_file_size,
        o.created_by,
        o.created_on,
        o.updated_at
    FROM public.organizations o
    ORDER BY o.name;
END;
$$;

-- Step 5: Grant permissions
GRANT EXECUTE ON FUNCTION public.get_organization_logo(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_organization_logo(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.clear_organization_logo(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_organizations_with_logo_status() TO authenticated;

-- Step 6: Verification
SELECT 
    'Setup Complete' as status,
    'All components created successfully' as message;

-- Verify bucket exists
SELECT 
    'Storage Bucket' as component,
    CASE 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'organization-logos') 
        THEN '✅ Created' 
        ELSE '❌ Missing' 
    END as status;

-- Verify functions exist
SELECT 
    'Logo Functions' as component,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_name IN ('get_organization_logo', 'update_organization_logo', 'clear_organization_logo', 'get_organizations_with_logo_status')
        ) 
        THEN '✅ Created' 
        ELSE '❌ Missing' 
    END as status;

-- Verify policies exist
SELECT 
    'Storage Policies' as component,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'objects' 
            AND schemaname = 'storage'
            AND policyname LIKE '%organization logos%'
        ) 
        THEN '✅ Created' 
        ELSE '❌ Missing' 
    END as status;
