-- Safe Sample Data Insertion Script for SmartQ Launchpad CG
-- This script checks for existing data and only inserts what's missing

-- Insert Sample Sectors (only if they don't exist)
INSERT INTO public.sectors (id, name, description) 
SELECT '550e8400-e29b-41d4-a716-446655440001', 'Healthcare', 'Hospitals, clinics, and medical facilities'
WHERE NOT EXISTS (SELECT 1 FROM public.sectors WHERE name = 'Healthcare');

INSERT INTO public.sectors (id, name, description) 
SELECT '550e8400-e29b-41d4-a716-446655440002', 'Education', 'Schools, universities, and training centers'
WHERE NOT EXISTS (SELECT 1 FROM public.sectors WHERE name = 'Education');

INSERT INTO public.sectors (id, name, description) 
SELECT '550e8400-e29b-41d4-a716-446655440003', 'Corporate', 'Office buildings and business centers'
WHERE NOT EXISTS (SELECT 1 FROM public.sectors WHERE name = 'Corporate');

INSERT INTO public.sectors (id, name, description) 
SELECT '550e8400-e29b-41d4-a716-446655440004', 'Retail', 'Shopping centers and retail stores'
WHERE NOT EXISTS (SELECT 1 FROM public.sectors WHERE name = 'Retail');

INSERT INTO public.sectors (id, name, description) 
SELECT '550e8400-e29b-41d4-a716-446655440005', 'Transportation', 'Airports, train stations, and transit hubs'
WHERE NOT EXISTS (SELECT 1 FROM public.sectors WHERE name = 'Transportation');

-- Insert Sample Cities (only if they don't exist)
INSERT INTO public.cities (id, name, region) 
SELECT '660e8400-e29b-41d4-a716-446655440001', 'London', 'Greater London'
WHERE NOT EXISTS (SELECT 1 FROM public.cities WHERE name = 'London');

INSERT INTO public.cities (id, name, region) 
SELECT '660e8400-e29b-41d4-a716-446655440002', 'Manchester', 'North West'
WHERE NOT EXISTS (SELECT 1 FROM public.cities WHERE name = 'Manchester');

INSERT INTO public.cities (id, name, region) 
SELECT '660e8400-e29b-41d4-a716-446655440003', 'Birmingham', 'West Midlands'
WHERE NOT EXISTS (SELECT 1 FROM public.cities WHERE name = 'Birmingham');

INSERT INTO public.cities (id, name, region) 
SELECT '660e8400-e29b-41d4-a716-446655440004', 'Leeds', 'Yorkshire and the Humber'
WHERE NOT EXISTS (SELECT 1 FROM public.cities WHERE name = 'Leeds');

INSERT INTO public.cities (id, name, region) 
SELECT '660e8400-e29b-41d4-a716-446655440005', 'Liverpool', 'North West'
WHERE NOT EXISTS (SELECT 1 FROM public.cities WHERE name = 'Liverpool');

-- Insert Sample Profiles (Users) - Only new ones, skip existing
INSERT INTO public.profiles (id, user_id, email, full_name, created_at, updated_at) 
SELECT '770e8400-e29b-41d4-a716-446655440003', gen_random_uuid(), 'deployment.engineer@smartq.com', 'Deployment Engineer', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'deployment.engineer@smartq.com');

INSERT INTO public.profiles (id, user_id, email, full_name, created_at, updated_at) 
SELECT '770e8400-e29b-41d4-a716-446655440004', gen_random_uuid(), 'john.doe@smartq.com', 'John Doe', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'john.doe@smartq.com');

INSERT INTO public.profiles (id, user_id, email, full_name, created_at, updated_at) 
SELECT '770e8400-e29b-41d4-a716-446655440005', gen_random_uuid(), 'jane.smith@smartq.com', 'Jane Smith', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'jane.smith@smartq.com');

INSERT INTO public.profiles (id, user_id, email, full_name, created_at, updated_at) 
SELECT '770e8400-e29b-41d4-a716-446655440006', gen_random_uuid(), 'david.wilson@smartq.com', 'David Wilson', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'david.wilson@smartq.com');

INSERT INTO public.profiles (id, user_id, email, full_name, created_at, updated_at) 
SELECT '770e8400-e29b-41d4-a716-446655440007', gen_random_uuid(), 'emma.brown@smartq.com', 'Emma Brown', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'emma.brown@smartq.com');

INSERT INTO public.profiles (id, user_id, email, full_name, created_at, updated_at) 
SELECT '770e8400-e29b-41d4-a716-446655440008', gen_random_uuid(), 'alex.taylor@smartq.com', 'Alex Taylor', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'alex.taylor@smartq.com');

INSERT INTO public.profiles (id, user_id, email, full_name, created_at, updated_at) 
SELECT '770e8400-e29b-41d4-a716-446655440009', gen_random_uuid(), 'lisa.garcia@smartq.com', 'Lisa Garcia', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'lisa.garcia@smartq.com');

INSERT INTO public.profiles (id, user_id, email, full_name, created_at, updated_at) 
SELECT '770e8400-e29b-41d4-a716-446655440010', gen_random_uuid(), 'tom.anderson@smartq.com', 'Tom Anderson', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'tom.anderson@smartq.com');

-- Insert Sample User Roles (using existing users for admin roles)
INSERT INTO public.user_roles (id, user_id, role, assigned_by, assigned_at, created_at) 
SELECT gen_random_uuid(), (SELECT user_id FROM public.profiles WHERE email = 'shivanshu.singh@thesmartq.com'), 'admin', NULL, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT user_id FROM public.profiles WHERE email = 'shivanshu.singh@thesmartq.com') AND role = 'admin');

INSERT INTO public.user_roles (id, user_id, role, assigned_by, assigned_at, created_at) 
SELECT gen_random_uuid(), (SELECT user_id FROM public.profiles WHERE email = 'madhujun16@gmail.com'), 'admin', NULL, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT user_id FROM public.profiles WHERE email = 'madhujun16@gmail.com') AND role = 'admin');

-- Add roles for new users
INSERT INTO public.user_roles (id, user_id, role, assigned_by, assigned_at, created_at) 
SELECT gen_random_uuid(), (SELECT user_id FROM public.profiles WHERE email = 'deployment.engineer@smartq.com'), 'deployment_engineer', (SELECT user_id FROM public.profiles WHERE email = 'shivanshu.singh@thesmartq.com'), now(), now()
WHERE EXISTS (SELECT 1 FROM public.profiles WHERE email = 'deployment.engineer@smartq.com')
AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT user_id FROM public.profiles WHERE email = 'deployment.engineer@smartq.com'));

INSERT INTO public.user_roles (id, user_id, role, assigned_by, assigned_at, created_at) 
SELECT gen_random_uuid(), (SELECT user_id FROM public.profiles WHERE email = 'john.doe@smartq.com'), 'ops_manager', (SELECT user_id FROM public.profiles WHERE email = 'shivanshu.singh@thesmartq.com'), now(), now()
WHERE EXISTS (SELECT 1 FROM public.profiles WHERE email = 'john.doe@smartq.com')
AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT user_id FROM public.profiles WHERE email = 'john.doe@smartq.com'));

INSERT INTO public.user_roles (id, user_id, role, assigned_by, assigned_at, created_at) 
SELECT gen_random_uuid(), (SELECT user_id FROM public.profiles WHERE email = 'jane.smith@smartq.com'), 'deployment_engineer', (SELECT user_id FROM public.profiles WHERE email = 'shivanshu.singh@thesmartq.com'), now(), now()
WHERE EXISTS (SELECT 1 FROM public.profiles WHERE email = 'jane.smith@smartq.com')
AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT user_id FROM public.profiles WHERE email = 'jane.smith@smartq.com'));

INSERT INTO public.user_roles (id, user_id, role, assigned_by, assigned_at, created_at) 
SELECT gen_random_uuid(), (SELECT user_id FROM public.profiles WHERE email = 'david.wilson@smartq.com'), 'ops_manager', (SELECT user_id FROM public.profiles WHERE email = 'shivanshu.singh@thesmartq.com'), now(), now()
WHERE EXISTS (SELECT 1 FROM public.profiles WHERE email = 'david.wilson@smartq.com')
AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT user_id FROM public.profiles WHERE email = 'david.wilson@smartq.com'));

INSERT INTO public.user_roles (id, user_id, role, assigned_by, assigned_at, created_at) 
SELECT gen_random_uuid(), (SELECT user_id FROM public.profiles WHERE email = 'emma.brown@smartq.com'), 'deployment_engineer', (SELECT user_id FROM public.profiles WHERE email = 'shivanshu.singh@thesmartq.com'), now(), now()
WHERE EXISTS (SELECT 1 FROM public.profiles WHERE email = 'emma.brown@smartq.com')
AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT user_id FROM public.profiles WHERE email = 'emma.brown@smartq.com'));

INSERT INTO public.user_roles (id, user_id, role, assigned_by, assigned_at, created_at) 
SELECT gen_random_uuid(), (SELECT user_id FROM public.profiles WHERE email = 'alex.taylor@smartq.com'), 'ops_manager', (SELECT user_id FROM public.profiles WHERE email = 'shivanshu.singh@thesmartq.com'), now(), now()
WHERE EXISTS (SELECT 1 FROM public.profiles WHERE email = 'alex.taylor@smartq.com')
AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT user_id FROM public.profiles WHERE email = 'alex.taylor@smartq.com'));

INSERT INTO public.user_roles (id, user_id, role, assigned_by, assigned_at, created_at) 
SELECT gen_random_uuid(), (SELECT user_id FROM public.profiles WHERE email = 'lisa.garcia@smartq.com'), 'deployment_engineer', (SELECT user_id FROM public.profiles WHERE email = 'shivanshu.singh@thesmartq.com'), now(), now()
WHERE EXISTS (SELECT 1 FROM public.profiles WHERE email = 'lisa.garcia@smartq.com')
AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT user_id FROM public.profiles WHERE email = 'lisa.garcia@smartq.com'));

INSERT INTO public.user_roles (id, user_id, role, assigned_by, assigned_at, created_at) 
SELECT gen_random_uuid(), (SELECT user_id FROM public.profiles WHERE email = 'tom.anderson@smartq.com'), 'ops_manager', (SELECT user_id FROM public.profiles WHERE email = 'shivanshu.singh@thesmartq.com'), now(), now()
WHERE EXISTS (SELECT 1 FROM public.profiles WHERE email = 'tom.anderson@smartq.com')
AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT user_id FROM public.profiles WHERE email = 'tom.anderson@smartq.com'));

-- Insert Sample Sites
INSERT INTO public.sites (id, name, food_court_unit, address, postcode, cafeteria_type, capacity, expected_footfall, description, status, sector_id, city_id, created_at, updated_at, created_by) 
SELECT '880e8400-e29b-41d4-a716-446655440001', 'St. Thomas Hospital', 'Main Cafeteria', 'Westminster Bridge Road, London', 'SE1 7EH', 'mixed', 200, 500, 'Main hospital cafeteria serving staff and visitors', 'active', 
 (SELECT id FROM public.sectors WHERE name = 'Healthcare'), 
 (SELECT id FROM public.cities WHERE name = 'London'), 
 now(), now(), 
 (SELECT id FROM public.profiles WHERE email = 'shivanshu.singh@thesmartq.com')
WHERE NOT EXISTS (SELECT 1 FROM public.sites WHERE name = 'St. Thomas Hospital');

INSERT INTO public.sites (id, name, food_court_unit, address, postcode, cafeteria_type, capacity, expected_footfall, description, status, sector_id, city_id, created_at, updated_at, created_by) 
SELECT '880e8400-e29b-41d4-a716-446655440002', 'Manchester University', 'Student Union', 'Oxford Road, Manchester', 'M13 9PL', 'mixed', 150, 300, 'University student union cafeteria', 'active',
 (SELECT id FROM public.sectors WHERE name = 'Education'),
 (SELECT id FROM public.cities WHERE name = 'Manchester'),
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'shivanshu.singh@thesmartq.com')
WHERE NOT EXISTS (SELECT 1 FROM public.sites WHERE name = 'Manchester University');

INSERT INTO public.sites (id, name, food_court_unit, address, postcode, cafeteria_type, capacity, expected_footfall, description, status, sector_id, city_id, created_at, updated_at, created_by) 
SELECT '880e8400-e29b-41d4-a716-446655440003', 'Birmingham Airport', 'Terminal 1', 'Birmingham Airport, Birmingham', 'B26 3QJ', 'mixed', 100, 250, 'Airport terminal cafeteria', 'active',
 (SELECT id FROM public.sectors WHERE name = 'Transportation'),
 (SELECT id FROM public.cities WHERE name = 'Birmingham'),
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'shivanshu.singh@thesmartq.com')
WHERE NOT EXISTS (SELECT 1 FROM public.sites WHERE name = 'Birmingham Airport');

INSERT INTO public.sites (id, name, food_court_unit, address, postcode, cafeteria_type, capacity, expected_footfall, description, status, sector_id, city_id, created_at, updated_at, created_by) 
SELECT '880e8400-e29b-41d4-a716-446655440004', 'Leeds Shopping Centre', 'Food Court', 'Briggate, Leeds', 'LS1 6LX', 'mixed', 300, 800, 'Shopping center food court', 'active',
 (SELECT id FROM public.sectors WHERE name = 'Retail'),
 (SELECT id FROM public.cities WHERE name = 'Leeds'),
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'shivanshu.singh@thesmartq.com')
WHERE NOT EXISTS (SELECT 1 FROM public.sites WHERE name = 'Leeds Shopping Centre');

INSERT INTO public.sites (id, name, food_court_unit, address, postcode, cafeteria_type, capacity, expected_footfall, description, status, sector_id, city_id, created_at, updated_at, created_by) 
SELECT '880e8400-e29b-41d4-a716-446655440005', 'Liverpool Office Complex', 'Staff Canteen', 'Water Street, Liverpool', 'L2 8TD', 'staff', 80, 120, 'Corporate office staff canteen', 'active',
 (SELECT id FROM public.sectors WHERE name = 'Corporate'),
 (SELECT id FROM public.cities WHERE name = 'Liverpool'),
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'shivanshu.singh@thesmartq.com')
WHERE NOT EXISTS (SELECT 1 FROM public.sites WHERE name = 'Liverpool Office Complex');

-- Insert Sample Site Assignments
INSERT INTO public.site_assignments (id, site_id, ops_manager_id, deployment_engineer_id, assigned_at, assigned_by, created_at, updated_at) 
SELECT gen_random_uuid(), 
 (SELECT id FROM public.sites WHERE name = 'St. Thomas Hospital'),
 (SELECT id FROM public.profiles WHERE email = 'ops.manager@smartq.com'),
 (SELECT id FROM public.profiles WHERE email = 'deployment.engineer@smartq.com'),
 now(),
 (SELECT id FROM public.profiles WHERE email = 'shivanshu.singh@thesmartq.com'),
 now(), now()
WHERE EXISTS (SELECT 1 FROM public.sites WHERE name = 'St. Thomas Hospital')
AND NOT EXISTS (SELECT 1 FROM public.site_assignments WHERE site_id = (SELECT id FROM public.sites WHERE name = 'St. Thomas Hospital'));

-- Insert Sample Inventory Items (only if they don't exist)
INSERT INTO public.inventory_items (id, serial_number, model, inventory_type, group_type, status, site_id, assigned_to, notes, purchase_date, warranty_expiry, created_at, updated_at, created_by) 
SELECT gen_random_uuid(), 'POS-001-2024', 'Ingenico iSC250', 'counter', 'hardware', 'deployed',
 (SELECT id FROM public.sites WHERE name = 'St. Thomas Hospital'),
 (SELECT id FROM public.profiles WHERE email = 'deployment.engineer@smartq.com'),
 'Main counter for hospital cafeteria',
 '2024-01-01', '2027-01-01',
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'shivanshu.singh@thesmartq.com')
WHERE NOT EXISTS (SELECT 1 FROM public.inventory_items WHERE serial_number = 'POS-001-2024');

-- Insert Sample Licenses (only if they don't exist)
INSERT INTO public.licenses (id, name, license_key, license_type, vendor, cost, purchase_date, expiry_date, status, notes, created_at, updated_at, created_by) 
SELECT gen_random_uuid(), 'SmartQ POS Software', 'SMARTQ-POS-2024-001', 'software', 'SmartQ Technologies', 2500.00,
 '2024-01-01', '2025-01-01', 'active',
 'Main POS software license for St. Thomas Hospital',
 now(), now(),
 (SELECT id FROM public.profiles WHERE email = 'shivanshu.singh@thesmartq.com')
WHERE NOT EXISTS (SELECT 1 FROM public.licenses WHERE license_key = 'SMARTQ-POS-2024-001');

-- Display summary
SELECT 'Safe Sample Data Insertion Complete' as status;

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
SELECT 'Inventory Items', COUNT(*) FROM public.inventory_items
UNION ALL
SELECT 'Licenses', COUNT(*) FROM public.licenses; 