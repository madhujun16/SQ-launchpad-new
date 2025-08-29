-- Simple Organization Logo Setup
-- This script provides basic logo management without audit logging

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

-- Step 2: Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('organization-logos', 'organization-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Set up storage policies for organization-logos bucket
-- Allow authenticated users to upload logos
CREATE POLICY "Allow authenticated users to upload organization logos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'organization-logos' 
        AND auth.role() = 'authenticated'
    );

-- Allow public to view logos
CREATE POLICY "Allow public to view organization logos" ON storage.objects
    FOR SELECT USING (bucket_id = 'organization-logos');

-- Allow authenticated users to update their logos
CREATE POLICY "Allow authenticated users to update organization logos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'organization-logos' 
        AND auth.role() = 'authenticated'
    );

-- Allow authenticated users to delete their logos
CREATE POLICY "Allow authenticated users to delete organization logos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'organization-logos' 
        AND auth.role() = 'authenticated'
    );

-- Step 4: Create simple logo management functions

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

-- Step 5: Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_organization_logo(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_organization_logo(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.clear_organization_logo(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_organizations_with_logo_status() TO authenticated;

-- Step 6: Verify setup
SELECT 
    'Setup Verification' as check_type,
    'logo_url column exists' as check_item,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'organizations' 
            AND column_name = 'logo_url'
        ) THEN '✅'
        ELSE '❌'
    END as status;

SELECT 
    'Storage bucket exists' as check_item,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM storage.buckets 
            WHERE id = 'organization-logos'
        ) THEN '✅'
        ELSE '❌'
    END as status;

SELECT 
    'Logo functions created' as check_item,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_name IN ('get_organization_logo', 'update_organization_logo', 'clear_organization_logo', 'get_organizations_with_logo_status')
        ) THEN '✅'
        ELSE '❌'
    END as status;
