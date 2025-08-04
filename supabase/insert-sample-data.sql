-- Sample Data Insertion Script for SmartQ Launchpad CG
-- This script inserts realistic sample data into all tables

-- Clear existing data (optional - uncomment if you want to start fresh)
-- DELETE FROM public.licenses;
-- DELETE FROM public.inventory_items;
-- DELETE FROM public.site_status_tracking;
-- DELETE FROM public.site_studies;
-- DELETE FROM public.site_assignments;
-- DELETE FROM public.sites;
-- DELETE FROM public.cities;
-- DELETE FROM public.sectors;
-- DELETE FROM public.user_roles;
-- DELETE FROM public.profiles;

-- Insert Sample Sectors
INSERT INTO public.sectors (id, name, description) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Healthcare', 'Hospitals, clinics, and medical facilities'),
('550e8400-e29b-41d4-a716-446655440002', 'Education', 'Schools, universities, and training centers'),
('550e8400-e29b-41d4-a716-446655440003', 'Corporate', 'Office buildings and business centers'),
('550e8400-e29b-41d4-a716-446655440004', 'Retail', 'Shopping centers and retail stores'),
('550e8400-e29b-41d4-a716-446655440005', 'Transportation', 'Airports, train stations, and transit hubs')
ON CONFLICT (name) DO NOTHING;

-- Insert Sample Cities
INSERT INTO public.cities (id, name, region) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'London', 'Greater London'),
('660e8400-e29b-41d4-a716-446655440002', 'Manchester', 'North West'),
('660e8400-e29b-41d4-a716-446655440003', 'Birmingham', 'West Midlands'),
('660e8400-e29b-41d4-a716-446655440004', 'Leeds', 'Yorkshire and the Humber'),
('660e8400-e29b-41d4-a716-446655440005', 'Liverpool', 'North West'),
('660e8400-e29b-41d4-a716-446655440006', 'Newcastle', 'North East'),
('660e8400-e29b-41d4-a716-446655440007', 'Sheffield', 'Yorkshire and the Humber'),
('660e8400-e29b-41d4-a716-446655440008', 'Glasgow', 'Scotland'),
('660e8400-e29b-41d4-a716-446655440009', 'Edinburgh', 'Scotland'),
('660e8400-e29b-41d4-a716-446655440010', 'Cardiff', 'Wales')
ON CONFLICT (name) DO NOTHING;

-- Insert Sample Profiles (Users)
INSERT INTO public.profiles (id, user_id, email, full_name, created_at, updated_at) VALUES
('770e8400-e29b-41d4-a716-446655440001', gen_random_uuid(), 'admin@smartq.com', 'Admin User', now(), now()),
('770e8400-e29b-41d4-a716-446655440002', gen_random_uuid(), 'ops.manager@smartq.com', 'Sarah Johnson', now(), now()),
('770e8400-e29b-41d4-a716-446655440003', gen_random_uuid(), 'deployment.engineer@smartq.com', 'Mike Chen', now(), now()),
('770e8400-e29b-41d4-a716-446655440004', gen_random_uuid(), 'john.doe@smartq.com', 'John Doe', now(), now()),
('770e8400-e29b-41d4-a716-446655440005', gen_random_uuid(), 'jane.smith@smartq.com', 'Jane Smith', now(), now()),
('770e8400-e29b-41d4-a716-446655440006', gen_random_uuid(), 'david.wilson@smartq.com', 'David Wilson', now(), now()),
('770e8400-e29b-41d4-a716-446655440007', gen_random_uuid(), 'emma.brown@smartq.com', 'Emma Brown', now(), now()),
('770e8400-e29b-41d4-a716-446655440008', gen_random_uuid(), 'alex.taylor@smartq.com', 'Alex Taylor', now(), now()),
('770e8400-e29b-41d4-a716-446655440009', gen_random_uuid(), 'lisa.garcia@smartq.com', 'Lisa Garcia', now(), now()),
('770e8400-e29b-41d4-a716-446655440010', gen_random_uuid(), 'tom.anderson@smartq.com', 'Tom Anderson', now(), now())
ON CONFLICT (email) DO NOTHING;

-- Insert Sample User Roles
INSERT INTO public.user_roles (id, user_id, role, assigned_by, assigned_at, created_at) VALUES
(gen_random_uuid(), (SELECT user_id FROM public.profiles WHERE email = 'admin@smartq.com'), 'admin', NULL, now(), now()),
(gen_random_uuid(), (SELECT user_id FROM public.profiles WHERE email = 'ops.manager@smartq.com'), 'ops_manager', (SELECT user_id FROM public.profiles WHERE email = 'admin@smartq.com'), now(), now()),
(gen_random_uuid(), (SELECT user_id FROM public.profiles WHERE email = 'deployment.engineer@smartq.com'), 'deployment_engineer', (SELECT user_id FROM public.profiles WHERE email = 'admin@smartq.com'), now(), now()),
(gen_random_uuid(), (SELECT user_id FROM public.profiles WHERE email = 'john.doe@smartq.com'), 'ops_manager', (SELECT user_id FROM public.profiles WHERE email = 'admin@smartq.com'), now(), now()),
(gen_random_uuid(), (SELECT user_id FROM public.profiles WHERE email = 'jane.smith@smartq.com'), 'deployment_engineer', (SELECT user_id FROM public.profiles WHERE email = 'admin@smartq.com'), now(), now()),
(gen_random_uuid(), (SELECT user_id FROM public.profiles WHERE email = 'david.wilson@smartq.com'), 'ops_manager', (SELECT user_id FROM public.profiles WHERE email = 'admin@smartq.com'), now(), now()),
(gen_random_uuid(), (SELECT user_id FROM public.profiles WHERE email = 'emma.brown@smartq.com'), 'deployment_engineer', (SELECT user_id FROM public.profiles WHERE email = 'admin@smartq.com'), now(), now()),
(gen_random_uuid(), (SELECT user_id FROM public.profiles WHERE email = 'alex.taylor@smartq.com'), 'ops_manager', (SELECT user_id FROM public.profiles WHERE email = 'admin@smartq.com'), now(), now()),
(gen_random_uuid(), (SELECT user_id FROM public.profiles WHERE email = 'lisa.garcia@smartq.com'), 'deployment_engineer', (SELECT user_id FROM public.profiles WHERE email = 'admin@smartq.com'), now(), now()),
(gen_random_uuid(), (SELECT user_id FROM public.profiles WHERE email = 'tom.anderson@smartq.com'), 'ops_manager', (SELECT user_id FROM public.profiles WHERE email = 'admin@smartq.com'), now(), now())
ON CONFLICT DO NOTHING;

-- Insert Sample Sites
INSERT INTO public.sites (id, name, food_court_unit, address, postcode, cafeteria_type, capacity, expected_footfall, description, status, sector_id, city_id, created_at, updated_at, created_by) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'St. Thomas Hospital', 'Main Cafeteria', 'Westminster Bridge Road, London', 'SE1 7EH', 'mixed', 200, 500, 'Main hospital cafeteria serving staff and visitors', 'active', 
 (SELECT id FROM public.sectors WHERE name = 'Healthcare'), 
 (SELECT id FROM public.cities WHERE name = 'London'), 
 now(), now(), 
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com')),

('880e8400-e29b-41d4-a716-446655440002', 'Manchester University', 'Student Union', 'Oxford Road, Manchester', 'M13 9PL', 'mixed', 150, 300, 'University student union cafeteria', 'active',
 (SELECT id FROM public.sectors WHERE name = 'Education'),
 (SELECT id FROM public.cities WHERE name = 'Manchester'),
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com')),

('880e8400-e29b-41d4-a716-446655440003', 'Birmingham Airport', 'Terminal 1', 'Birmingham Airport, Birmingham', 'B26 3QJ', 'mixed', 100, 250, 'Airport terminal cafeteria', 'active',
 (SELECT id FROM public.sectors WHERE name = 'Transportation'),
 (SELECT id FROM public.cities WHERE name = 'Birmingham'),
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com')),

('880e8400-e29b-41d4-a716-446655440004', 'Leeds Shopping Centre', 'Food Court', 'Briggate, Leeds', 'LS1 6LX', 'mixed', 300, 800, 'Shopping center food court', 'active',
 (SELECT id FROM public.sectors WHERE name = 'Retail'),
 (SELECT id FROM public.cities WHERE name = 'Leeds'),
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com')),

('880e8400-e29b-41d4-a716-446655440005', 'Liverpool Office Complex', 'Staff Canteen', 'Water Street, Liverpool', 'L2 8TD', 'staff', 80, 120, 'Corporate office staff canteen', 'active',
 (SELECT id FROM public.sectors WHERE name = 'Corporate'),
 (SELECT id FROM public.cities WHERE name = 'Liverpool'),
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com'))
ON CONFLICT DO NOTHING;

-- Insert Sample Site Assignments
INSERT INTO public.site_assignments (id, site_id, ops_manager_id, deployment_engineer_id, assigned_at, assigned_by, created_at, updated_at) VALUES
(gen_random_uuid(), 
 (SELECT id FROM public.sites WHERE name = 'St. Thomas Hospital'),
 (SELECT id FROM public.profiles WHERE email = 'ops.manager@smartq.com'),
 (SELECT id FROM public.profiles WHERE email = 'deployment.engineer@smartq.com'),
 now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com'),
 now(), now()),

(gen_random_uuid(),
 (SELECT id FROM public.sites WHERE name = 'Manchester University'),
 (SELECT id FROM public.profiles WHERE email = 'john.doe@smartq.com'),
 (SELECT id FROM public.profiles WHERE email = 'jane.smith@smartq.com'),
 now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com'),
 now(), now()),

(gen_random_uuid(),
 (SELECT id FROM public.sites WHERE name = 'Birmingham Airport'),
 (SELECT id FROM public.profiles WHERE email = 'david.wilson@smartq.com'),
 (SELECT id FROM public.profiles WHERE email = 'emma.brown@smartq.com'),
 now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com'),
 now(), now()),

(gen_random_uuid(),
 (SELECT id FROM public.sites WHERE name = 'Leeds Shopping Centre'),
 (SELECT id FROM public.profiles WHERE email = 'alex.taylor@smartq.com'),
 (SELECT id FROM public.profiles WHERE email = 'lisa.garcia@smartq.com'),
 now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com'),
 now(), now()),

(gen_random_uuid(),
 (SELECT id FROM public.sites WHERE name = 'Liverpool Office Complex'),
 (SELECT id FROM public.profiles WHERE email = 'tom.anderson@smartq.com'),
 (SELECT id FROM public.profiles WHERE email = 'deployment.engineer@smartq.com'),
 now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com'),
 now(), now())
ON CONFLICT DO NOTHING;

-- Insert Sample Site Studies
INSERT INTO public.site_studies (id, site_id, conducted_by, study_date, findings, site_map_url, counter_count, hardware_requirements, geolocation_lat, geolocation_lng, status, created_at, updated_at) VALUES
(gen_random_uuid(),
 (SELECT id FROM public.sites WHERE name = 'St. Thomas Hospital'),
 (SELECT id FROM public.profiles WHERE email = 'deployment.engineer@smartq.com'),
 '2024-01-15',
 'Site requires 4 POS counters, 2 tablets for mobile ordering, and 1 router for network connectivity. Space is limited but well-organized.',
 'https://maps.example.com/st-thomas-hospital',
 4,
 '{"pos_counters": 4, "tablets": 2, "routers": 1, "cables": 8}',
 51.4994, -0.1181,
 'completed',
 now(), now()),

(gen_random_uuid(),
 (SELECT id FROM public.sites WHERE name = 'Manchester University'),
 (SELECT id FROM public.profiles WHERE email = 'jane.smith@smartq.com'),
 '2024-01-20',
 'Large open space with high foot traffic. Requires 6 POS counters, 4 tablets, and 2 routers for optimal coverage.',
 'https://maps.example.com/manchester-university',
 6,
 '{"pos_counters": 6, "tablets": 4, "routers": 2, "cables": 12}',
 53.4668, -2.2339,
 'completed',
 now(), now()),

(gen_random_uuid(),
 (SELECT id FROM public.sites WHERE name = 'Birmingham Airport'),
 (SELECT id FROM public.profiles WHERE email = 'emma.brown@smartq.com'),
 '2024-01-25',
 'Airport terminal space with security considerations. Requires 3 POS counters, 2 tablets, and 1 router.',
 'https://maps.example.com/birmingham-airport',
 3,
 '{"pos_counters": 3, "tablets": 2, "routers": 1, "cables": 6}',
 52.4539, -1.7480,
 'completed',
 now(), now()),

(gen_random_uuid(),
 (SELECT id FROM public.sites WHERE name = 'Leeds Shopping Centre'),
 (SELECT id FROM public.profiles WHERE email = 'lisa.garcia@smartq.com'),
 '2024-02-01',
 'Large food court with multiple vendors. Requires 8 POS counters, 6 tablets, and 3 routers for comprehensive coverage.',
 'https://maps.example.com/leeds-shopping-centre',
 8,
 '{"pos_counters": 8, "tablets": 6, "routers": 3, "cables": 16}',
 53.8008, -1.5491,
 'completed',
 now(), now()),

(gen_random_uuid(),
 (SELECT id FROM public.sites WHERE name = 'Liverpool Office Complex'),
 (SELECT id FROM public.profiles WHERE email = 'deployment.engineer@smartq.com'),
 '2024-02-05',
 'Corporate environment with moderate traffic. Requires 2 POS counters, 1 tablet, and 1 router.',
 'https://maps.example.com/liverpool-office',
 2,
 '{"pos_counters": 2, "tablets": 1, "routers": 1, "cables": 4}',
 53.4084, -2.9916,
 'completed',
 now(), now())
ON CONFLICT DO NOTHING;

-- Insert Sample Site Status Tracking
INSERT INTO public.site_status_tracking (id, site_id, study_status, cost_approval_status, inventory_status, products_status, deployment_status, overall_status, updated_at, updated_by) VALUES
(gen_random_uuid(),
 (SELECT id FROM public.sites WHERE name = 'St. Thomas Hospital'),
 'completed',
 'approved',
 'in_progress',
 'completed',
 'scheduled',
 'in-progress',
 now(),
 (SELECT id FROM public.profiles WHERE email = 'ops.manager@smartq.com')),

(gen_random_uuid(),
 (SELECT id FROM public.sites WHERE name = 'Manchester University'),
 'completed',
 'approved',
 'completed',
 'completed',
 'completed',
 'deployed',
 now(),
 (SELECT id FROM public.profiles WHERE email = 'john.doe@smartq.com')),

(gen_random_uuid(),
 (SELECT id FROM public.sites WHERE name = 'Birmingham Airport'),
 'completed',
 'pending',
 'pending',
 'in_progress',
 'pending',
 'in-progress',
 now(),
 (SELECT id FROM public.profiles WHERE email = 'david.wilson@smartq.com')),

(gen_random_uuid(),
 (SELECT id FROM public.sites WHERE name = 'Leeds Shopping Centre'),
 'completed',
 'approved',
 'completed',
 'completed',
 'in_progress',
 'active',
 now(),
 (SELECT id FROM public.profiles WHERE email = 'alex.taylor@smartq.com')),

(gen_random_uuid(),
 (SELECT id FROM public.sites WHERE name = 'Liverpool Office Complex'),
 'completed',
 'approved',
 'completed',
 'completed',
 'completed',
 'deployed',
 now(),
 (SELECT id FROM public.profiles WHERE email = 'tom.anderson@smartq.com'))
ON CONFLICT DO NOTHING;

-- Insert Sample Inventory Items
INSERT INTO public.inventory_items (id, serial_number, model, inventory_type, group_type, status, site_id, assigned_to, notes, purchase_date, warranty_expiry, created_at, updated_at, created_by) VALUES
-- POS Counters
(gen_random_uuid(), 'POS-001-2024', 'Ingenico iSC250', 'counter', 'hardware', 'deployed',
 (SELECT id FROM public.sites WHERE name = 'St. Thomas Hospital'),
 (SELECT id FROM public.profiles WHERE email = 'deployment.engineer@smartq.com'),
 'Main counter for hospital cafeteria',
 '2024-01-01', '2027-01-01',
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com')),

(gen_random_uuid(), 'POS-002-2024', 'Ingenico iSC250', 'counter', 'hardware', 'deployed',
 (SELECT id FROM public.sites WHERE name = 'St. Thomas Hospital'),
 (SELECT id FROM public.profiles WHERE email = 'deployment.engineer@smartq.com'),
 'Secondary counter for hospital cafeteria',
 '2024-01-01', '2027-01-01',
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com')),

(gen_random_uuid(), 'POS-003-2024', 'Verifone VX520', 'counter', 'hardware', 'deployed',
 (SELECT id FROM public.sites WHERE name = 'Manchester University'),
 (SELECT id FROM public.profiles WHERE email = 'jane.smith@smartq.com'),
 'Student union main counter',
 '2024-01-15', '2027-01-15',
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com')),

(gen_random_uuid(), 'POS-004-2024', 'Verifone VX520', 'counter', 'hardware', 'deployed',
 (SELECT id FROM public.sites WHERE name = 'Manchester University'),
 (SELECT id FROM public.profiles WHERE email = 'jane.smith@smartq.com'),
 'Student union secondary counter',
 '2024-01-15', '2027-01-15',
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com')),

(gen_random_uuid(), 'POS-005-2024', 'PAX A920', 'counter', 'hardware', 'deployed',
 (SELECT id FROM public.sites WHERE name = 'Birmingham Airport'),
 (SELECT id FROM public.profiles WHERE email = 'emma.brown@smartq.com'),
 'Airport terminal counter',
 '2024-01-20', '2027-01-20',
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com')),

-- Tablets
(gen_random_uuid(), 'TAB-001-2024', 'iPad Pro 12.9"', 'tablet', 'hardware', 'deployed',
 (SELECT id FROM public.sites WHERE name = 'St. Thomas Hospital'),
 (SELECT id FROM public.profiles WHERE email = 'deployment.engineer@smartq.com'),
 'Mobile ordering tablet for hospital',
 '2024-01-01', '2026-01-01',
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com')),

(gen_random_uuid(), 'TAB-002-2024', 'iPad Pro 12.9"', 'tablet', 'hardware', 'deployed',
 (SELECT id FROM public.sites WHERE name = 'Manchester University'),
 (SELECT id FROM public.profiles WHERE email = 'jane.smith@smartq.com'),
 'Mobile ordering tablet for university',
 '2024-01-15', '2026-01-15',
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com')),

(gen_random_uuid(), 'TAB-003-2024', 'Samsung Galaxy Tab S9', 'tablet', 'hardware', 'deployed',
 (SELECT id FROM public.sites WHERE name = 'Birmingham Airport'),
 (SELECT id FROM public.profiles WHERE email = 'emma.brown@smartq.com'),
 'Mobile ordering tablet for airport',
 '2024-01-20', '2026-01-20',
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com')),

-- Routers
(gen_random_uuid(), 'ROU-001-2024', 'Cisco RV340', 'router', 'network', 'deployed',
 (SELECT id FROM public.sites WHERE name = 'St. Thomas Hospital'),
 (SELECT id FROM public.profiles WHERE email = 'deployment.engineer@smartq.com'),
 'Network router for hospital site',
 '2024-01-01', '2028-01-01',
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com')),

(gen_random_uuid(), 'ROU-002-2024', 'Cisco RV340', 'router', 'network', 'deployed',
 (SELECT id FROM public.sites WHERE name = 'Manchester University'),
 (SELECT id FROM public.profiles WHERE email = 'jane.smith@smartq.com'),
 'Network router for university site',
 '2024-01-15', '2028-01-15',
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com')),

-- Cables
(gen_random_uuid(), 'CAB-001-2024', 'Cat6 Ethernet Cable', 'cable', 'accessories', 'deployed',
 (SELECT id FROM public.sites WHERE name = 'St. Thomas Hospital'),
 (SELECT id FROM public.profiles WHERE email = 'deployment.engineer@smartq.com'),
 'Network cable for POS connection',
 '2024-01-01', '2029-01-01',
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com')),

(gen_random_uuid(), 'CAB-002-2024', 'Cat6 Ethernet Cable', 'cable', 'accessories', 'deployed',
 (SELECT id FROM public.sites WHERE name = 'Manchester University'),
 (SELECT id FROM public.profiles WHERE email = 'jane.smith@smartq.com'),
 'Network cable for POS connection',
 '2024-01-15', '2029-01-15',
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com')),

-- Available Items
(gen_random_uuid(), 'POS-006-2024', 'Ingenico iSC250', 'counter', 'hardware', 'available',
 NULL, NULL,
 'Spare POS counter for future deployment',
 '2024-01-01', '2027-01-01',
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com')),

(gen_random_uuid(), 'TAB-004-2024', 'iPad Pro 12.9"', 'tablet', 'hardware', 'available',
 NULL, NULL,
 'Spare tablet for future deployment',
 '2024-01-01', '2026-01-01',
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com')),

(gen_random_uuid(), 'ROU-003-2024', 'Cisco RV340', 'router', 'network', 'available',
 NULL, NULL,
 'Spare router for future deployment',
 '2024-01-01', '2028-01-01',
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com')),

-- Maintenance Items
(gen_random_uuid(), 'POS-007-2024', 'Verifone VX520', 'counter', 'hardware', 'maintenance',
 NULL, NULL,
 'Counter under repair - faulty card reader',
 '2024-01-01', '2027-01-01',
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com')),

-- Retired Items
(gen_random_uuid(), 'POS-OLD-001', 'Ingenico iSC220', 'counter', 'hardware', 'retired',
 NULL, NULL,
 'Retired POS counter - replaced with newer model',
 '2020-01-01', '2023-01-01',
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com'))
ON CONFLICT (serial_number) DO NOTHING;

-- Insert Sample Licenses
INSERT INTO public.licenses (id, name, license_key, license_type, vendor, cost, purchase_date, expiry_date, status, notes, created_at, updated_at, created_by) VALUES
-- Software Licenses
(gen_random_uuid(), 'SmartQ POS Software', 'SMARTQ-POS-2024-001', 'software', 'SmartQ Technologies', 2500.00,
 '2024-01-01', '2025-01-01', 'active',
 'Main POS software license for St. Thomas Hospital',
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com')),

(gen_random_uuid(), 'SmartQ POS Software', 'SMARTQ-POS-2024-002', 'software', 'SmartQ Technologies', 2500.00,
 '2024-01-15', '2025-01-15', 'active',
 'Main POS software license for Manchester University',
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com')),

(gen_random_uuid(), 'SmartQ POS Software', 'SMARTQ-POS-2024-003', 'software', 'SmartQ Technologies', 2500.00,
 '2024-01-20', '2025-01-20', 'active',
 'Main POS software license for Birmingham Airport',
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com')),

-- Hardware Warranties
(gen_random_uuid(), 'Ingenico iSC250 Warranty', 'ING-WARR-2024-001', 'hardware', 'Ingenico', 500.00,
 '2024-01-01', '2027-01-01', 'active',
 'Extended warranty for POS counters',
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com')),

(gen_random_uuid(), 'Verifone VX520 Warranty', 'VER-WARR-2024-001', 'hardware', 'Verifone', 400.00,
 '2024-01-15', '2027-01-15', 'active',
 'Extended warranty for POS counters',
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com')),

-- Network Licenses
(gen_random_uuid(), 'Cisco Router License', 'CISCO-ROUTER-2024-001', 'network', 'Cisco', 300.00,
 '2024-01-01', '2028-01-01', 'active',
 'Router management license',
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com')),

-- Service Licenses
(gen_random_uuid(), '24/7 Support Service', 'SUPPORT-2024-001', 'service', 'SmartQ Technologies', 1200.00,
 '2024-01-01', '2025-01-01', 'active',
 '24/7 technical support service for all sites',
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com')),

-- Expired Licenses
(gen_random_uuid(), 'Legacy POS Software', 'LEGACY-POS-2020-001', 'software', 'Legacy Systems', 1500.00,
 '2020-01-01', '2023-01-01', 'expired',
 'Expired legacy POS software license',
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com')),

-- Pending Licenses
(gen_random_uuid(), 'New Site License', 'NEW-SITE-2024-001', 'software', 'SmartQ Technologies', 2500.00,
 '2024-02-01', '2025-02-01', 'pending',
 'License for new site deployment',
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'admin@smartq.com'))
ON CONFLICT DO NOTHING;

-- Display summary of inserted data
SELECT 'Sample Data Insertion Complete' as status;

-- Show summary counts
SELECT 
  'Profiles' as table_name, COUNT(*) as count FROM public.profiles
UNION ALL
SELECT 'User Roles', COUNT(*) FROM public.user_roles
UNION ALL
SELECT 'Sectors', COUNT(*) FROM public.sectors
UNION ALL
SELECT 'Cities', COUNT(*) FROM public.cities
UNION ALL
SELECT 'Sites', COUNT(*) FROM public.sites
UNION ALL
SELECT 'Site Assignments', COUNT(*) FROM public.site_assignments
UNION ALL
SELECT 'Site Studies', COUNT(*) FROM public.site_studies
UNION ALL
SELECT 'Site Status Tracking', COUNT(*) FROM public.site_status_tracking
UNION ALL
SELECT 'Inventory Items', COUNT(*) FROM public.inventory_items
UNION ALL
SELECT 'Licenses', COUNT(*) FROM public.licenses; 