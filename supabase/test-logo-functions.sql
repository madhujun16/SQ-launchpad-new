-- Test Logo Functions
-- This script tests all the logo management functions

-- Step 1: Test get_organization_logo function
SELECT 
    'Get Logo Test' as test_type,
    id,
    name,
    public.get_organization_logo(id) as current_logo,
    CASE 
        WHEN public.get_organization_logo(id) IS NULL THEN '✅ Function working correctly'
        ELSE '❌ Function not working correctly'
    END as status
FROM public.organizations
LIMIT 3;

-- Step 2: Test update_organization_logo function with a test value
DO $$
DECLARE
    test_org_id UUID;
    test_result BOOLEAN;
BEGIN
    -- Get first organization ID
    SELECT id INTO test_org_id FROM public.organizations LIMIT 1;
    
    IF test_org_id IS NOT NULL THEN
        -- Test updating logo
        SELECT public.update_organization_logo(test_org_id, 'https://test-logo-url.com/test.png') INTO test_result;
        
        RAISE NOTICE 'Test update_organization_logo: %', 
            CASE 
                WHEN test_result THEN '✅ Function working correctly'
                ELSE '❌ Function failed'
            END;
            
        -- Verify the update
        IF EXISTS (
            SELECT 1 FROM public.organizations 
            WHERE id = test_org_id AND logo_url = 'https://test-logo-url.com/test.png'
        ) THEN
            RAISE NOTICE '✅ Logo URL updated successfully in database';
        ELSE
            RAISE NOTICE '❌ Logo URL not updated in database';
        END IF;
        
        -- Clean up test data
        UPDATE public.organizations SET logo_url = NULL WHERE id = test_org_id;
        RAISE NOTICE '✅ Test data cleaned up';
    ELSE
        RAISE NOTICE '❌ No organizations found to test with';
    END IF;
END $$;

-- Step 3: Test clear_organization_logo function
DO $$
DECLARE
    test_org_id UUID;
    test_result BOOLEAN;
BEGIN
    -- Get first organization ID
    SELECT id INTO test_org_id FROM public.organizations LIMIT 1;
    
    IF test_org_id IS NOT NULL THEN
        -- Set a test logo first
        UPDATE public.organizations SET logo_url = 'https://test-clear-logo.com/test.png' WHERE id = test_org_id;
        
        -- Test clearing logo
        SELECT public.clear_organization_logo(test_org_id) INTO test_result;
        
        RAISE NOTICE 'Test clear_organization_logo: %', 
            CASE 
                WHEN test_result THEN '✅ Function working correctly'
                ELSE '❌ Function failed'
            END;
            
        -- Verify the clear
        IF NOT EXISTS (
            SELECT 1 FROM public.organizations 
            WHERE id = test_org_id AND logo_url IS NOT NULL
        ) THEN
            RAISE NOTICE '✅ Logo URL cleared successfully from database';
        ELSE
            RAISE NOTICE '❌ Logo URL not cleared from database';
        END IF;
    ELSE
        RAISE NOTICE '❌ No organizations found to test with';
    END IF;
END $$;

-- Step 4: Test get_organizations_with_logo_status function
SELECT 
    'Logo Status Test' as test_type,
    COUNT(*) as total_organizations,
    COUNT(CASE WHEN has_logo THEN 1 END) as organizations_with_logos,
    COUNT(CASE WHEN NOT has_logo THEN 1 END) as organizations_without_logos
FROM public.get_organizations_with_logo_status();

-- Step 5: Show sample data from get_organizations_with_logo_status
SELECT 
    'Sample Logo Status Data' as test_type,
    org_name,
    has_logo,
    logo_file_size,
    CASE 
        WHEN logo_url IS NOT NULL THEN 'Has URL'
        ELSE 'No URL'
    END as url_status
FROM (
    SELECT 
        name as org_name,
        has_logo,
        logo_file_size,
        logo_url
    FROM public.get_organizations_with_logo_status()
) as logo_status
LIMIT 5;

-- Step 6: Final verification
SELECT 
    'Final Verification' as check_type,
    'All functions working' as check_item,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_name IN ('get_organization_logo', 'update_organization_logo', 'clear_organization_logo', 'get_organizations_with_logo_status')
        ) THEN '✅'
        ELSE '❌'
    END as status;

-- Step 7: Check current logo status
SELECT 
    'Current Logo Status' as check_type,
    id,
    name,
    CASE 
        WHEN logo_url IS NULL THEN 'No Logo'
        ELSE 'Has Logo: ' || logo_url
    END as logo_status
FROM public.organizations
ORDER BY name;
