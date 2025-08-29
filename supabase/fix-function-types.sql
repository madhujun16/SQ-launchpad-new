-- Fix Function Types
-- This script fixes the data type mismatch in get_organizations_with_logo_status function

-- Drop the existing function first
DROP FUNCTION IF EXISTS public.get_organizations_with_logo_status();

-- Recreate the function with correct data types
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_organizations_with_logo_status() TO authenticated;

-- Test the function
SELECT 
    'Function Fixed' as status,
    COUNT(*) as total_organizations
FROM public.get_organizations_with_logo_status();
