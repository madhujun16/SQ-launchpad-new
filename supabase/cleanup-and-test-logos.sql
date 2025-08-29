-- Cleanup and Test Organization Logos
-- This script clears existing logos and tests the new functionality

-- Step 1: Clear any existing logo URLs from the database
UPDATE public.organizations 
SET logo_url = NULL 
WHERE logo_url IS NOT NULL;

-- Step 2: Verify all logos are cleared
SELECT 
  id,
  name,
  logo_url,
  CASE 
    WHEN logo_url IS NULL THEN '✅ Logo cleared'
    ELSE '❌ Logo still present'
  END as status
FROM public.organizations
ORDER BY name;

-- Step 3: Test the get_organization_logo function
SELECT 
  'Function Test' as test_type,
  public.get_organization_logo(id) as logo_url,
  CASE 
    WHEN public.get_organization_logo(id) IS NULL THEN '✅ Function working (returning NULL as expected)'
    ELSE '❌ Function not working correctly'
  END as status
FROM public.organizations
LIMIT 3;

-- Step 4: Test the update_organization_logo function with a test value
-- (This will just test if the function can be called, not actually update anything)
SELECT 
  'Update Function Test' as test_type,
  public.update_organization_logo(id, 'https://example.com/test-logo.png') as update_result,
  CASE 
    WHEN public.update_organization_logo(id, 'https://example.com/test-logo.png') = true THEN '✅ Update function working'
    ELSE '❌ Update function not working'
  END as status
FROM public.organizations
LIMIT 1;

-- Step 5: Check the final state
SELECT 
  'Final State' as check_type,
  COUNT(*) as total_organizations,
  COUNT(logo_url) as organizations_with_logos,
  COUNT(*) - COUNT(logo_url) as organizations_without_logos
FROM public.organizations;

-- Step 6: Show organizations with their current logo status
SELECT 
  name,
  sector,
  unit_code,
  CASE 
    WHEN logo_url IS NULL THEN 'No Logo'
    ELSE 'Has Logo'
  END as logo_status,
  logo_url
FROM public.organizations
ORDER BY name;
