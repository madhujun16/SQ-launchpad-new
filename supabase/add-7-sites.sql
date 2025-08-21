-- Add 7 New Sites to Supabase Database
-- This script adds new sites without removing existing data
-- Run this script in your Supabase SQL editor

-- First, ensure we have the required organizations
INSERT INTO public.organizations (id, name, sector, logo_url, created_at, updated_at) VALUES
('org-chartswell', 'Chartswell Group', 'Business & Industry', 'https://via.placeholder.com/150x50/2563eb/ffffff?text=Chartswell', NOW(), NOW()),
('org-ra-systems', 'RA Systems', 'Business & Industry', 'https://via.placeholder.com/150x50/dc2626/ffffff?text=RA+Systems', NOW(), NOW()),
('org-levy-restaurants', 'Levy Restaurants', 'Business & Industry', 'https://via.placeholder.com/150x50/059669/ffffff?text=Levy', NOW(), NOW()),
('org-bi-corporate', 'B&I Corporate', 'Business & Industry', 'https://via.placeholder.com/150x50/7c3aed/ffffff?text=B%26I', NOW(), NOW()),
('org-compass-one', 'Compass One', 'Business & Industry', 'https://via.placeholder.com/150x50/ea580c/ffffff?text=Compass+One', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add 7 new sites with realistic data
INSERT INTO public.sites (id, name, organization_id, food_court_unit, address, postcode, cafeteria_type, capacity, expected_footfall, description, status, sector, criticality, priority, risk_level, go_live_date, created_at, updated_at) VALUES
-- Chartswell Group Sites
('site-chartswell-001', 'Chartswell London HQ', 'org-chartswell', 'Main Cafeteria', '123 Canary Wharf, London', 'E14 5AB', 'mixed', 180, 400, 'Corporate headquarters cafeteria serving staff and visitors', 'site_created', 'Business & Industry', 'high', 'high', 'medium', '2024-03-15', NOW(), NOW()),
('site-chartswell-002', 'Chartswell Manchester', 'org-chartswell', 'Staff Canteen', '45 Deansgate, Manchester', 'M3 2FW', 'staff', 120, 250, 'Manchester office staff canteen', 'site_created', 'Business & Industry', 'medium', 'medium', 'low', '2024-04-20', NOW(), NOW()),

-- RA Systems Sites
('site-ra-001', 'RA Systems Birmingham', 'org-ra-systems', 'Tech Hub Cafe', '78 Broad Street, Birmingham', 'B1 2HF', 'mixed', 150, 300, 'Technology hub cafeteria for staff and clients', 'site_created', 'Business & Industry', 'high', 'high', 'medium', '2024-05-10', NOW(), NOW()),

-- Levy Restaurants Sites
('site-levy-001', 'Levy Stadium London', 'org-levy-restaurants', 'Stadium Food Court', 'Olympic Way, Wembley, London', 'HA9 0WS', 'mixed', 500, 1200, 'Stadium food court serving event attendees', 'site_created', 'Business & Industry', 'high', 'high', 'high', '2024-06-01', NOW(), NOW()),

-- B&I Corporate Sites
('site-bi-001', 'B&I Leeds Office', 'org-bi-corporate', 'Executive Dining', '25 Park Row, Leeds', 'LS1 5HD', 'executive', 80, 150, 'Executive dining facility for senior staff', 'site_created', 'Business & Industry', 'medium', 'medium', 'low', '2024-07-15', NOW(), NOW()),

-- Compass One Sites
('site-compass-001', 'Compass One Edinburgh', 'org-compass-one', 'University Cafe', '10 George Square, Edinburgh', 'EH8 9JX', 'mixed', 200, 450, 'University campus cafe serving students and staff', 'site_created', 'Business & Industry', 'medium', 'medium', 'low', '2024-08-30', NOW(), NOW()),
('site-compass-002', 'Compass One Glasgow', 'org-compass-one', 'Shopping Center Food Court', 'Buchanan Street, Glasgow', 'G1 2FF', 'mixed', 350, 800, 'Shopping center food court in Glasgow city center', 'site_created', 'Business & Industry', 'high', 'high', 'medium', '2024-09-15', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add site assignments for these new sites
INSERT INTO public.site_assignments (id, site_id, user_id, role, assigned_at, created_at) VALUES
-- Assign deployment engineers
(gen_random_uuid(), 'site-chartswell-001', (SELECT id FROM public.profiles WHERE email = 'deployment.engineer@smartq.com' LIMIT 1), 'deployment_engineer', NOW(), NOW()),
(gen_random_uuid(), 'site-chartswell-002', (SELECT id FROM public.profiles WHERE email = 'deployment.engineer@smartq.com' LIMIT 1), 'deployment_engineer', NOW(), NOW()),
(gen_random_uuid(), 'site-ra-001', (SELECT id FROM public.profiles WHERE email = 'deployment.engineer@smartq.com' LIMIT 1), 'deployment_engineer', NOW(), NOW()),
(gen_random_uuid(), 'site-levy-001', (SELECT id FROM public.profiles WHERE email = 'deployment.engineer@smartq.com' LIMIT 1), 'deployment_engineer', NOW(), NOW()),
(gen_random_uuid(), 'site-bi-001', (SELECT id FROM public.profiles WHERE email = 'deployment.engineer@smartq.com' LIMIT 1), 'deployment_engineer', NOW(), NOW()),
(gen_random_uuid(), 'site-compass-001', (SELECT id FROM public.profiles WHERE email = 'deployment.engineer@smartq.com' LIMIT 1), 'deployment_engineer', NOW(), NOW()),
(gen_random_uuid(), 'site-compass-002', (SELECT id FROM public.profiles WHERE email = 'deployment.engineer@smartq.com' LIMIT 1), 'deployment_engineer', NOW(), NOW()),

-- Assign ops managers
(gen_random_uuid(), 'site-chartswell-001', (SELECT id FROM public.profiles WHERE email = 'ops.manager@smartq.com' LIMIT 1), 'ops_manager', NOW(), NOW()),
(gen_random_uuid(), 'site-chartswell-002', (SELECT id FROM public.profiles WHERE email = 'ops.manager@smartq.com' LIMIT 1), 'ops_manager', NOW(), NOW()),
(gen_random_uuid(), 'site-ra-001', (SELECT id FROM public.profiles WHERE email = 'ops.manager@smartq.com' LIMIT 1), 'ops_manager', NOW(), NOW()),
(gen_random_uuid(), 'site-levy-001', (SELECT id FROM public.profiles WHERE email = 'ops.manager@smartq.com' LIMIT 1), 'ops_manager', NOW(), NOW()),
(gen_random_uuid(), 'site-bi-001', (SELECT id FROM public.profiles WHERE email = 'ops.manager@smartq.com' LIMIT 1), 'ops_manager', NOW(), NOW()),
(gen_random_uuid(), 'site-compass-001', (SELECT id FROM public.profiles WHERE email = 'ops.manager@smartq.com' LIMIT 1), 'ops_manager', NOW(), NOW()),
(gen_random_uuid(), 'site-compass-002', (SELECT id FROM public.profiles WHERE email = 'ops.manager@smartq.com' LIMIT 1), 'ops_manager', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Add site status tracking for workflow management
INSERT INTO public.site_status_tracking (id, site_id, status, previous_status, changed_by, changed_at, notes) VALUES
(gen_random_uuid(), 'site-chartswell-001', 'site_created', NULL, (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com' LIMIT 1), NOW(), 'Site created and assigned to deployment engineer'),
(gen_random_uuid(), 'site-chartswell-002', 'site_created', NULL, (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com' LIMIT 1), NOW(), 'Site created and assigned to deployment engineer'),
(gen_random_uuid(), 'site-ra-001', 'site_created', NULL, (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com' LIMIT 1), NOW(), 'Site created and assigned to deployment engineer'),
(gen_random_uuid(), 'site-levy-001', 'site_created', NULL, (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com' LIMIT 1), NOW(), 'Site created and assigned to deployment engineer'),
(gen_random_uuid(), 'site-bi-001', 'site_created', NULL, (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com' LIMIT 1), NOW(), 'Site created and assigned to deployment engineer'),
(gen_random_uuid(), 'site-compass-001', 'site_created', NULL, (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com' LIMIT 1), NOW(), 'Site created and assigned to deployment engineer'),
(gen_random_uuid(), 'site-compass-002', 'site_created', NULL, (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com' LIMIT 1), NOW(), 'Site created and assigned to deployment engineer')
ON CONFLICT DO NOTHING;

-- Verify the data was inserted
SELECT 
    s.name as site_name,
    o.name as organization_name,
    s.status,
    s.sector,
    s.criticality,
    s.priority,
    s.risk_level,
    s.go_live_date
FROM public.sites s
JOIN public.organizations o ON s.organization_id = o.id
WHERE s.id IN (
    'site-chartswell-001', 'site-chartswell-002', 'site-ra-001', 
    'site-levy-001', 'site-bi-001', 'site-compass-001', 'site-compass-002'
)
ORDER BY o.name, s.name;
