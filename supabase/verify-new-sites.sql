-- Verify New Sites and Organizations
-- Run this to confirm the data was inserted correctly

-- Check new organizations
SELECT 
    'ORGANIZATIONS' as table_name,
    id,
    name,
    sector,
    logo_url,
    created_at
FROM public.organizations 
WHERE name IN ('Chartswell Group', 'RA Systems', 'Levy Restaurants', 'B&I Corporate', 'Compass One')
ORDER BY name;

-- Check new sites
SELECT 
    'SITES' as table_name,
    s.id,
    s.name,
    s.organization_name,
    s.status,
    s.location,
    s.target_live_date,
    s.created_at
FROM public.sites s
WHERE s.organization_name IN ('Chartswell Group', 'RA Systems', 'Levy Restaurants', 'B&I Corporate', 'Compass One')
ORDER BY s.organization_name, s.name;

-- Check site assignments
SELECT 
    'SITE_ASSIGNMENTS' as table_name,
    sa.site_id,
    s.name as site_name,
    s.organization_name,
    p1.full_name as deployment_engineer,
    p2.full_name as ops_manager,
    sa.assigned_at
FROM public.site_assignments sa
JOIN public.sites s ON sa.site_id = s.id
JOIN public.profiles p1 ON sa.deployment_engineer_id = p1.id
JOIN public.profiles p2 ON sa.ops_manager_id = p2.id
WHERE s.organization_name IN ('Chartswell Group', 'RA Systems', 'Levy Restaurants', 'B&I Corporate', 'Compass One')
ORDER BY s.organization_name, s.name;

-- Check site status tracking
SELECT 
    'SITE_STATUS_TRACKING' as table_name,
    sst.site_id,
    s.name as site_name,
    s.organization_name,
    sst.overall_status,
    sst.updated_at,
    p.full_name as updated_by
FROM public.site_status_tracking sst
JOIN public.sites s ON sst.site_id = s.id
JOIN public.profiles p ON sst.updated_by = p.id
WHERE s.organization_name IN ('Chartswell Group', 'RA Systems', 'Levy Restaurants', 'B&I Corporate', 'Compass One')
ORDER BY s.organization_name, s.name;

-- Count total records
SELECT 
    'COUNTS' as table_name,
    (SELECT COUNT(*) FROM public.organizations WHERE name IN ('Chartswell Group', 'RA Systems', 'Levy Restaurants', 'B&I Corporate', 'Compass One')) as org_count,
    (SELECT COUNT(*) FROM public.sites WHERE organization_name IN ('Chartswell Group', 'RA Systems', 'Levy Restaurants', 'B&I Corporate', 'Compass One')) as site_count,
    (SELECT COUNT(*) FROM public.site_assignments sa JOIN public.sites s ON sa.site_id = s.id WHERE s.organization_name IN ('Chartswell Group', 'RA Systems', 'Levy Restaurants', 'B&I Corporate', 'Compass One')) as assignment_count,
    (SELECT COUNT(*) FROM public.site_status_tracking sst JOIN public.sites s ON sst.site_id = s.id WHERE s.organization_name IN ('Chartswell Group', 'RA Systems', 'Levy Restaurants', 'B&I Corporate', 'Compass One')) as status_count;
