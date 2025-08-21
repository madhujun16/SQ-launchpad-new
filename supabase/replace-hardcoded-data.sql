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
('org-chartswell-group', 'Chartswell Group', 'Business & Industry', 'https://via.placeholder.com/150x50/2563eb/ffffff?text=Chartswell', 'Leading food service provider for business and industry sector', NOW(), NOW()),
('org-ra-systems', 'RA Systems', 'Business & Industry', 'https://via.placeholder.com/150x50/dc2626/ffffff?text=RA+Systems', 'Restaurant Associates - premium dining solutions', NOW(), NOW()),
('org-levy-restaurants', 'Levy Restaurants', 'Business & Industry', 'https://via.placeholder.com/150x50/059669/ffffff?text=Levy', 'Premium sports and entertainment hospitality', NOW(), NOW()),
('org-bi-corporate', 'B&I Corporate', 'Business & Industry', 'https://via.placeholder.com/150x50/7c3aed/ffffff?text=B%26I', 'Business and Industry food services', NOW(), NOW()),
('org-compass-one', 'Compass One', 'Business & Industry', 'https://via.placeholder.com/150x50/ea580c/ffffff?text=Compass+One', 'Specialized food service solutions', NOW(), NOW()),
('org-hsbc', 'HSBC', 'Business & Industry', NULL, 'Global banking and financial services', NOW(), NOW()),
('org-jlr-whitley', 'JLR - Whitley', 'Business & Industry', NULL, 'Jaguar Land Rover manufacturing', NOW(), NOW()),
('org-sse', 'SSE', 'Business & Industry', NULL, 'Energy and utilities sector', NOW(), NOW()),
('org-next', 'NEXT', 'Business & Industry', NULL, 'Retail and fashion sector', NOW(), NOW()),
('org-porsche', 'Porsche', 'Business & Industry', NULL, 'Automotive luxury brand', NOW(), NOW()),

-- Education Sector
('org-chartwells', 'Chartwells', 'Education', 'https://via.placeholder.com/150x50/0891b2/ffffff?text=Chartwells', 'Leading food service provider for education sector', NOW(), NOW()),

-- Healthcare & Senior Living Sector
('org-baxter-health', 'Baxter Health', 'Healthcare & Senior Living', 'https://via.placeholder.com/150x50/be185d/ffffff?text=Baxter', 'Healthcare and medical services', NOW(), NOW()),

-- Sports & Leisure Sector
('org-levy', 'Levy', 'Sports & Leisure', 'https://via.placeholder.com/150x50/059669/ffffff?text=Levy', 'Premium sports and entertainment hospitality', NOW(), NOW()),

-- Defence Sector
('org-minley-station', 'Minley Station', 'Defence', 'https://via.placeholder.com/150x50/7c2d12/ffffff?text=Minley', 'Defence sector food services', NOW(), NOW()),

-- Other Sectors
('org-peabody', 'Peabody', 'Business & Industry', NULL, 'Housing and community services', NOW(), NOW()),
('org-ra', 'RA', 'Business & Industry', NULL, 'Restaurant Associates - premium dining', NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET
    sector = EXCLUDED.sector,
    logo_url = EXCLUDED.logo_url,
    description = EXCLUDED.description,
    updated_at = NOW();

-- 3. INSERT/UPDATE SITES with proper structure
INSERT INTO public.sites (id, name, organization_id, organization_name, food_court_unit, address, postcode, status, location, target_live_date, latitude, longitude, created_at, updated_at) VALUES
-- Chartswell Group Sites
('site-chartswell-london', 'Chartswell London HQ', 'org-chartswell-group', 'Chartswell Group', 'Main Cafeteria', '123 Canary Wharf, London', 'E14 5AB', 'site_created', 'London', '2024-03-15', 51.5074, -0.1278, NOW(), NOW()),
('site-chartswell-manchester', 'Chartswell Manchester', 'org-chartswell-group', 'Chartswell Group', 'Staff Canteen', '45 Deansgate, Manchester', 'M3 2FW', 'site_created', 'Manchester', '2024-04-20', 53.4808, -2.2426, NOW(), NOW()),
('site-chartswell-birmingham', 'Chartswell Birmingham', 'org-chartswell-group', 'Chartswell Group', 'Executive Dining', '78 New Street, Birmingham', 'B2 4TU', 'site_study_done', 'Birmingham', '2024-05-01', 52.4862, -1.8904, NOW(), NOW()),

-- RA Systems Sites
('site-ra-singapore', 'RA Systems Singapore', 'org-ra-systems', 'RA Systems', 'Tech Hub Cafeteria', '10 Marina Boulevard', '018983', 'site_created', 'Singapore', '2024-06-01', 1.2905, 103.8520, NOW(), NOW()),
('site-ra-london', 'RA Systems London', 'org-ra-systems', 'RA Systems', 'Corporate Dining', '25 Old Street, London', 'EC1V 9HL', 'scoping_done', 'London', '2024-07-15', 51.5275, -0.0876, NOW(), NOW()),

-- Levy Restaurants Sites
('site-levy-wembley', 'Levy Wembley Stadium', 'org-levy-restaurants', 'Levy Restaurants', 'VIP Hospitality', 'Wembley Stadium, London', 'HA9 0WS', 'approved', 'London', '2024-08-01', 51.5560, -0.2795, NOW(), NOW()),
('site-levy-tottenham', 'Levy Tottenham Hotspur', 'org-levy-restaurants', 'Levy Restaurants', 'Premium Dining', 'Tottenham Hotspur Stadium', 'N17 0AP', 'procurement_done', 'London', '2024-09-01', 51.6042, -0.0665, NOW(), NOW()),

-- B&I Corporate Sites
('site-bi-hsbc', 'HSBC Canary Wharf', 'org-hsbc', 'HSBC', 'Staff Restaurant', '8 Canada Square, London', 'E14 5HQ', 'deployed', 'London', '2024-02-01', 51.5074, -0.0177, NOW(), NOW()),
('site-bi-jlr', 'JLR Whitley', 'org-jlr-whitley', 'JLR - Whitley', 'Employee Canteen', 'Whitley, Coventry', 'CV3 4LF', 'live', 'Coventry', '2024-01-15', 52.4068, -1.5197, NOW(), NOW()),

-- Compass One Sites
('site-compass-sse', 'SSE Perth', 'org-sse', 'SSE', 'Energy Hub Cafeteria', 'SSE Campus, Perth', 'PH1 3AQ', 'live', 'Perth', '2024-01-01', 56.3950, -3.4308, NOW(), NOW()),
('site-compass-next', 'NEXT Distribution', 'org-next', 'NEXT', 'Distribution Center', 'South Elmsall, West Yorkshire', 'WF9 2TN', 'activated', 'West Yorkshire', '2024-02-15', 53.5945, -1.2833, NOW(), NOW()),

-- Chartwells Education Sites
('site-chartwells-university', 'University of Birmingham', 'org-chartwells', 'Chartwells', 'Main Campus Dining', 'Edgbaston, Birmingham', 'B15 2TT', 'live', 'Birmingham', '2024-01-01', 52.4508, -1.9305, NOW(), NOW()),
('site-chartwells-school', 'King Edward School', 'org-chartwells', 'Chartwells', 'School Canteen', 'Edgbaston Park Road', 'B15 2UD', 'deployed', 'Birmingham', '2024-03-01', 52.4518, -1.9298, NOW(), NOW()),

-- Healthcare Sites
('site-baxter-hospital', 'Baxter General Hospital', 'org-baxter-health', 'Baxter Health', 'Hospital Cafeteria', '123 Medical Center Drive', 'B1 1AA', 'live', 'Birmingham', '2024-01-01', 52.4862, -1.8904, NOW(), NOW()),

-- Defence Sites
('site-minley-barracks', 'Minley Barracks', 'org-minley-station', 'Minley Station', 'Military Dining', 'Minley, Hampshire', 'GU17 9LP', 'deployed', 'Hampshire', '2024-02-01', 51.3235, -0.8476, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    organization_id = EXCLUDED.organization_id,
    organization_name = EXCLUDED.organization_name,
    food_court_unit = EXCLUDED.food_court_unit,
    address = EXCLUDED.address,
    postcode = EXCLUDED.postcode,
    status = EXCLUDED.status,
    location = EXCLUDED.location,
    target_live_date = EXCLUDED.target_live_date,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();

-- 4. INSERT/UPDATE SITE ASSIGNMENTS
INSERT INTO public.site_assignments (id, site_id, deployment_engineer_id, ops_manager_id, assigned_at, created_at, assigned_by, status) VALUES
-- Get user IDs from profiles table
('assignment-1', 'site-chartswell-london', 
 (SELECT id FROM public.profiles WHERE email = 'deployment.engineer@smartq.com' LIMIT 1),
 (SELECT id FROM public.profiles WHERE email = 'madhujun16@gmail.com' LIMIT 1),
 NOW(), NOW(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com' LIMIT 1),
 'active'),

('assignment-2', 'site-ra-singapore',
 (SELECT id FROM public.profiles WHERE email = 'deployment.engineer@smartq.com' LIMIT 1),
 (SELECT id FROM public.profiles WHERE email = 'madhujun16@gmail.com' LIMIT 1),
 NOW(), NOW(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com' LIMIT 1),
 'active'),

('assignment-3', 'site-levy-wembley',
 (SELECT id FROM public.profiles WHERE email = 'deployment.engineer@smartq.com' LIMIT 1),
 (SELECT id FROM public.profiles WHERE email = 'madhujun16@gmail.com' LIMIT 1),
 NOW(), NOW(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com' LIMIT 1),
 'active'),

('assignment-4', 'site-bi-hsbc',
 (SELECT id FROM public.profiles WHERE email = 'deployment.engineer@smartq.com' LIMIT 1),
 (SELECT id FROM public.profiles WHERE email = 'madhujun16@gmail.com' LIMIT 1),
 NOW(), NOW(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com' LIMIT 1),
 'active'),

('assignment-5', 'site-compass-sse',
 (SELECT id FROM public.profiles WHERE email = 'deployment.engineer@smartq.com' LIMIT 1),
 (SELECT id FROM public.profiles WHERE email = 'madhujun16@gmail.com' LIMIT 1),
 NOW(), NOW(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com' LIMIT 1),
 'active')
ON CONFLICT (id) DO UPDATE SET
    deployment_engineer_id = EXCLUDED.deployment_engineer_id,
    ops_manager_id = EXCLUDED.ops_manager_id,
    assigned_at = EXCLUDED.assigned_at,
    assigned_by = EXCLUDED.assigned_by,
    status = EXCLUDED.status,
    created_at = NOW();

-- 5. INSERT/UPDATE SITE STATUS TRACKING
INSERT INTO public.site_status_tracking (id, site_id, overall_status, notes, updated_at, updated_by) VALUES
('status-1', 'site-chartswell-london', 'new', 'Site created and initial assessment completed', NOW(), 
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com' LIMIT 1)),

('status-2', 'site-ra-singapore', 'new', 'Site created and awaiting site study', NOW(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com' LIMIT 1)),

('status-3', 'site-levy-wembley', 'in_progress', 'Approval stage - awaiting procurement', NOW(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com' LIMIT 1)),

('status-4', 'site-bi-hsbc', 'deployed', 'Successfully deployed and operational', NOW(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com' LIMIT 1)),

('status-5', 'site-compass-sse', 'active', 'Fully operational and maintained', NOW(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com' LIMIT 1))
ON CONFLICT (id) DO UPDATE SET
    overall_status = EXCLUDED.overall_status,
    notes = EXCLUDED.notes,
    updated_at = EXCLUDED.updated_at,
    updated_by = EXCLUDED.updated_by;

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
