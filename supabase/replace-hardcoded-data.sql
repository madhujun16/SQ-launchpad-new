-- Replace Hardcoded Data and Ensure Proper Data Structure
-- This script replaces any mock/hardcoded data with proper database-driven data
-- Run this script in your Supabase SQL editor

-- First, let's check what data currently exists
DO $$
BEGIN
    RAISE NOTICE 'Checking current data structure...';
END $$;

-- 1. CLEAN UP EXISTING DATA (if needed)
-- Uncomment the following lines if you want to start fresh
-- DELETE FROM public.site_status_tracking;
-- DELETE FROM public.site_assignments;
-- DELETE FROM public.sites;
-- DELETE FROM public.organizations;

-- 2. INSERT/UPDATE ORGANIZATIONS with proper structure
INSERT INTO public.organizations (id, name, sector, logo_url, description, created_at, updated_at) VALUES
-- Business & Industry Sector
(gen_random_uuid(), 'Chartswell Group', 'Business & Industry', 'https://via.placeholder.com/150x50/2563eb/ffffff?text=Chartswell', 'Leading food service provider for business and industry sector', NOW(), NOW()),
(gen_random_uuid(), 'RA Systems', 'Business & Industry', 'https://via.placeholder.com/150x50/dc2626/ffffff?text=RA+Systems', 'Restaurant Associates - premium dining solutions', NOW(), NOW()),
(gen_random_uuid(), 'Levy Restaurants', 'Business & Industry', 'https://via.placeholder.com/150x50/059669/ffffff?text=Levy', 'Premium sports and entertainment hospitality', NOW(), NOW()),
(gen_random_uuid(), 'B&I Corporate', 'Business & Industry', 'https://via.placeholder.com/150x50/7c3aed/ffffff?text=B%26I', 'Business and Industry food services', NOW(), NOW()),
(gen_random_uuid(), 'Compass One', 'Business & Industry', 'https://via.placeholder.com/150x50/ea580c/ffffff?text=Compass+One', 'Specialized food service solutions', NOW(), NOW()),
(gen_random_uuid(), 'HSBC', 'Business & Industry', NULL, 'Global banking and financial services', NOW(), NOW()),
(gen_random_uuid(), 'JLR - Whitley', 'Business & Industry', NULL, 'Jaguar Land Rover manufacturing', NOW(), NOW()),
(gen_random_uuid(), 'SSE', 'Business & Industry', NULL, 'Energy and utilities sector', NOW(), NOW()),
(gen_random_uuid(), 'NEXT', 'Business & Industry', NULL, 'Retail and fashion sector', NOW(), NOW()),
(gen_random_uuid(), 'Porsche', 'Business & Industry', NULL, 'Automotive luxury brand', NOW(), NOW()),

-- Education Sector
(gen_random_uuid(), 'Chartwells', 'Education', 'https://via.placeholder.com/150x50/0891b2/ffffff?text=Chartwells', 'Leading food service provider for education sector', NOW(), NOW()),

-- Healthcare & Senior Living Sector
(gen_random_uuid(), 'Baxter Health', 'Healthcare & Senior Living', 'https://via.placeholder.com/150x50/be185d/ffffff?text=Baxter', 'Healthcare and medical services', NOW(), NOW()),

-- Sports & Leisure Sector
(gen_random_uuid(), 'Levy', 'Sports & Leisure', 'https://via.placeholder.com/150x50/059669/ffffff?text=Levy', 'Premium sports and entertainment hospitality', NOW(), NOW()),

-- Defence Sector
(gen_random_uuid(), 'Minley Station', 'Defence', 'https://via.placeholder.com/150x50/7c2d12/ffffff?text=Minley', 'Defence sector food services', NOW(), NOW()),

-- Other Sectors
(gen_random_uuid(), 'Peabody', 'Business & Industry', NULL, 'Housing and community services', NOW(), NOW()),
(gen_random_uuid(), 'RA', 'Business & Industry', NULL, 'Restaurant Associates - premium dining', NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET
    sector = EXCLUDED.sector,
    logo_url = EXCLUDED.logo_url,
    description = EXCLUDED.description,
    updated_at = NOW();

-- 3. INSERT/UPDATE SITES with proper structure
-- First, let's get the organization IDs we just created
WITH org_ids AS (
    SELECT id, name FROM public.organizations 
    WHERE name IN ('Chartswell Group', 'RA Systems', 'Levy Restaurants', 'B&I Corporate', 'Compass One', 'HSBC', 'JLR - Whitley', 'SSE', 'NEXT', 'Chartwells', 'Baxter Health', 'Levy', 'Minley Station', 'Peabody', 'RA')
)
INSERT INTO public.sites (id, name, organization_id, organization_name, food_court_unit, address, postcode, status, location, target_live_date, latitude, longitude, created_at, updated_at) 
SELECT 
    gen_random_uuid(),
    'Chartswell London HQ',
    o.id,
    'Chartswell Group',
    'Main Cafeteria',
    '123 Canary Wharf, London',
    'E14 5AB',
    'site_created',
    'London',
    '2024-03-15',
    51.5074,
    -0.1278,
    NOW(),
    NOW()
FROM org_ids o WHERE o.name = 'Chartswell Group'

UNION ALL

SELECT 
    gen_random_uuid(),
    'Chartswell Manchester',
    o.id,
    'Chartswell Group',
    'Staff Canteen',
    '45 Deansgate, Manchester',
    'M3 2FW',
    'site_created',
    'Manchester',
    '2024-04-20',
    53.4808,
    -2.2426,
    NOW(),
    NOW()
FROM org_ids o WHERE o.name = 'Chartswell Group'

UNION ALL

SELECT 
    gen_random_uuid(),
    'Chartswell Birmingham',
    o.id,
    'Chartswell Group',
    'Executive Dining',
    '78 New Street, Birmingham',
    'B2 4TU',
    'site_study_done',
    'Birmingham',
    '2024-05-01',
    52.4862,
    -1.8904,
    NOW(),
    NOW()
FROM org_ids o WHERE o.name = 'Chartswell Group'

UNION ALL

SELECT 
    gen_random_uuid(),
    'RA Systems Singapore',
    o.id,
    'RA Systems',
    'Tech Hub Cafeteria',
    '10 Marina Boulevard',
    '018983',
    'site_created',
    'Singapore',
    '2024-06-01',
    1.2905,
    103.8520,
    NOW(),
    NOW()
FROM org_ids o WHERE o.name = 'RA Systems'

UNION ALL

SELECT 
    gen_random_uuid(),
    'RA Systems London',
    o.id,
    'RA Systems',
    'Corporate Dining',
    '25 Old Street, London',
    'EC1V 9HL',
    'scoping_done',
    'London',
    '2024-07-15',
    51.5275,
    -0.0876,
    NOW(),
    NOW()
FROM org_ids o WHERE o.name = 'RA Systems'

UNION ALL

SELECT 
    gen_random_uuid(),
    'Levy Wembley Stadium',
    o.id,
    'Levy Restaurants',
    'VIP Hospitality',
    'Wembley Stadium, London',
    'HA9 0WS',
    'approved',
    'London',
    '2024-08-01',
    51.5560,
    -0.2795,
    NOW(),
    NOW()
FROM org_ids o WHERE o.name = 'Levy Restaurants'

UNION ALL

SELECT 
    gen_random_uuid(),
    'Levy Tottenham Hotspur',
    o.id,
    'Levy Restaurants',
    'Premium Dining',
    'Tottenham Hotspur Stadium',
    'N17 0AP',
    'procurement_done',
    'London',
    '2024-09-01',
    51.6042,
    -0.0665,
    NOW(),
    NOW()
FROM org_ids o WHERE o.name = 'Levy Restaurants'

UNION ALL

SELECT 
    gen_random_uuid(),
    'HSBC Canary Wharf',
    o.id,
    'HSBC',
    'Staff Restaurant',
    '8 Canada Square, London',
    'E14 5HQ',
    'deployed',
    'London',
    '2024-02-01',
    51.5074,
    -0.0177,
    NOW(),
    NOW()
FROM org_ids o WHERE o.name = 'HSBC'

UNION ALL

SELECT 
    gen_random_uuid(),
    'JLR Whitley',
    o.id,
    'JLR - Whitley',
    'Employee Canteen',
    'Whitley, Coventry',
    'CV3 4LF',
    'live',
    'Coventry',
    '2024-01-15',
    52.4068,
    -1.5197,
    NOW(),
    NOW()
FROM org_ids o WHERE o.name = 'JLR - Whitley'

UNION ALL

SELECT 
    gen_random_uuid(),
    'SSE Perth',
    o.id,
    'SSE',
    'Energy Hub Cafeteria',
    'SSE Campus, Perth',
    'PH1 3AQ',
    'live',
    'Perth',
    '2024-01-01',
    56.3950,
    -3.4308,
    NOW(),
    NOW()
FROM org_ids o WHERE o.name = 'SSE'

UNION ALL

SELECT 
    gen_random_uuid(),
    'NEXT Distribution',
    o.id,
    'NEXT',
    'Distribution Center',
    'South Elmsall, West Yorkshire',
    'WF9 2TN',
    'activated',
    'West Yorkshire',
    '2024-02-15',
    53.5945,
    -1.2833,
    NOW(),
    NOW()
FROM org_ids o WHERE o.name = 'NEXT'

UNION ALL

SELECT 
    gen_random_uuid(),
    'University of Birmingham',
    o.id,
    'Chartwells',
    'Main Campus Dining',
    'Edgbaston, Birmingham',
    'B15 2TT',
    'live',
    'Birmingham',
    '2024-01-01',
    52.4508,
    -1.9305,
    NOW(),
    NOW()
FROM org_ids o WHERE o.name = 'Chartwells'

UNION ALL

SELECT 
    gen_random_uuid(),
    'King Edward School',
    o.id,
    'Chartwells',
    'School Canteen',
    'Edgbaston Park Road',
    'B15 2UD',
    'deployed',
    'Birmingham',
    '2024-03-01',
    52.4518,
    -1.9298,
    NOW(),
    NOW()
FROM org_ids o WHERE o.name = 'Chartwells'

UNION ALL

SELECT 
    gen_random_uuid(),
    'Baxter General Hospital',
    o.id,
    'Baxter Health',
    'Hospital Cafeteria',
    '123 Medical Center Drive',
    'B1 1AA',
    'live',
    'Birmingham',
    '2024-01-01',
    52.4862,
    -1.8904,
    NOW(),
    NOW()
FROM org_ids o WHERE o.name = 'Baxter Health'

UNION ALL

SELECT 
    gen_random_uuid(),
    'Minley Barracks',
    o.id,
    'Minley Station',
    'Military Dining',
    'Minley, Hampshire',
    'GU17 9LP',
    'deployed',
    'Hampshire',
    '2024-02-01',
    51.3235,
    -0.8476,
    NOW(),
    NOW()
FROM org_ids o WHERE o.name = 'Minley Station';

-- 4. INSERT/UPDATE SITE ASSIGNMENTS
-- First, let's get the site IDs and user IDs
WITH site_ids AS (
    SELECT id, name FROM public.sites 
    WHERE name IN ('Chartswell London HQ', 'RA Systems Singapore', 'Levy Wembley Stadium', 'HSBC Canary Wharf', 'SSE Perth')
),
user_ids AS (
    SELECT 
        (SELECT id FROM public.profiles WHERE email = 'deployment.engineer@smartq.com' LIMIT 1) as deployment_engineer_id,
        (SELECT id FROM public.profiles WHERE email = 'madhujun16@gmail.com' LIMIT 1) as ops_manager_id,
        (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com' LIMIT 1) as admin_id
)
INSERT INTO public.site_assignments (id, site_id, deployment_engineer_id, ops_manager_id, assigned_at, created_at, assigned_by, status)
SELECT 
    gen_random_uuid(),
    s.id,
    u.deployment_engineer_id,
    u.ops_manager_id,
    NOW(),
    NOW(),
    u.admin_id,
    'active'
FROM site_ids s, user_ids u;

-- 5. INSERT/UPDATE SITE STATUS TRACKING
-- Get the site IDs for status tracking
WITH site_ids AS (
    SELECT id, name FROM public.sites 
    WHERE name IN ('Chartswell London HQ', 'RA Systems Singapore', 'Levy Wembley Stadium', 'HSBC Canary Wharf', 'SSE Perth')
),
admin_id AS (
    SELECT id FROM public.profiles WHERE email = 'admin@smartq.com' LIMIT 1
)
INSERT INTO public.site_status_tracking (id, site_id, overall_status, notes, updated_at, updated_by)
SELECT 
    gen_random_uuid(),
    s.id,
    CASE 
        WHEN s.name = 'Chartswell London HQ' THEN 'new'
        WHEN s.name = 'RA Systems Singapore' THEN 'new'
        WHEN s.name = 'Levy Wembley Stadium' THEN 'in_progress'
        WHEN s.name = 'HSBC Canary Wharf' THEN 'deployed'
        WHEN s.name = 'SSE Perth' THEN 'active'
        ELSE 'new'
    END as overall_status,
    CASE 
        WHEN s.name = 'Chartswell London HQ' THEN 'Site created and initial assessment completed'
        WHEN s.name = 'RA Systems Singapore' THEN 'Site created and awaiting site study'
        WHEN s.name = 'Levy Wembley Stadium' THEN 'Approval stage - awaiting procurement'
        WHEN s.name = 'HSBC Canary Wharf' THEN 'Successfully deployed and operational'
        WHEN s.name = 'SSE Perth' THEN 'Fully operational and maintained'
        ELSE 'Site created'
    END as notes,
    NOW(),
    a.id
FROM site_ids s, admin_id a;

-- 6. VERIFICATION QUERIES
-- Check organizations
SELECT 'ORGANIZATIONS' as table_name, COUNT(*) as count FROM public.organizations;

-- Check sites
SELECT 'SITES' as table_name, COUNT(*) as count FROM public.sites;

-- Check site assignments
SELECT 'SITE_ASSIGNMENTS' as table_name, COUNT(*) as count FROM public.site_assignments;

-- Check site status tracking
SELECT 'SITE_STATUS_TRACKING' as table_name, COUNT(*) as count FROM public.site_status_tracking;

-- Check sites with organization details
SELECT 
    s.name as site_name,
    s.organization_name,
    o.logo_url,
    s.status,
    s.location,
    s.target_live_date
FROM public.sites s
LEFT JOIN public.organizations o ON s.organization_id = o.id
ORDER BY s.organization_name, s.name;

-- Check organizations with logo status
SELECT 
    name,
    sector,
    CASE 
        WHEN logo_url IS NULL THEN 'No Logo'
        WHEN logo_url = '' THEN 'Empty Logo URL'
        ELSE 'Has Logo'
    END as logo_status,
    logo_url
FROM public.organizations
ORDER BY sector, name;
