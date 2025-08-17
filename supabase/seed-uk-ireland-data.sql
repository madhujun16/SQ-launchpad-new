-- Seed UK and Ireland Test Data for SmartQ Launchpad
-- This script creates realistic test data for the notifications system

-- 1. Organizations (UK and Ireland based)
INSERT INTO public.organizations (id, name, sector, country, region, created_at) VALUES
('org-uk-london', 'London Retail Group', 'Retail', 'United Kingdom', 'London', NOW()),
('org-uk-manchester', 'Manchester Hospitality Ltd', 'Hospitality', 'United Kingdom', 'North West', NOW()),
('org-uk-birmingham', 'Birmingham Tech Solutions', 'Technology', 'United Kingdom', 'West Midlands', NOW()),
('org-ie-dublin', 'Dublin Financial Services', 'Financial Services', 'Ireland', 'Dublin', NOW()),
('org-ie-cork', 'Cork Manufacturing Co', 'Manufacturing', 'Ireland', 'Cork', NOW()),
('org-uk-edinburgh', 'Edinburgh Healthcare', 'Healthcare', 'United Kingdom', 'Scotland', NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Sites for each organization
INSERT INTO public.sites (id, name, organization_id, address, city, postcode, country, status, created_at) VALUES
-- London Retail Group sites
('site-london-oxford-street', 'Oxford Street Store', 'org-uk-london', '123 Oxford Street', 'London', 'W1D 1BS', 'United Kingdom', 'active', NOW()),
('site-london-canary-wharf', 'Canary Wharf Branch', 'org-uk-london', '45 Canary Wharf', 'London', 'E14 5AB', 'United Kingdom', 'active', NOW()),

-- Manchester Hospitality sites
('site-manchester-city-centre', 'City Centre Hotel', 'org-uk-manchester', '78 Deansgate', 'Manchester', 'M3 2FW', 'United Kingdom', 'active', NOW()),
('site-manchester-airport', 'Airport Restaurant', 'org-uk-manchester', 'Terminal 2, Airport Road', 'Manchester', 'M90 1QX', 'United Kingdom', 'planning', NOW()),

-- Birmingham Tech sites
('site-birmingham-bullring', 'Bullring Office', 'org-uk-birmingham', '1 Bullring', 'Birmingham', 'B5 4BU', 'United Kingdom', 'active', NOW()),

-- Dublin Financial sites
('site-dublin-docklands', 'Docklands HQ', 'org-ie-dublin', '25 Custom House Quay', 'Dublin', 'D01 X4X0', 'Ireland', 'active', NOW()),
('site-dublin-grafton', 'Grafton Street Branch', 'org-ie-dublin', '15 Grafton Street', 'Dublin', 'D02 W8X8', 'Ireland', 'planning', NOW()),

-- Cork Manufacturing sites
('site-cork-city', 'City Factory', 'org-ie-cork', 'Industrial Estate, Cork', 'Cork', 'T12 XXXX', 'Ireland', 'active', NOW()),

-- Edinburgh Healthcare sites
('site-edinburgh-royal-mile', 'Royal Mile Clinic', 'org-uk-edinburgh', '100 Royal Mile', 'Edinburgh', 'EH1 1RE', 'United Kingdom', 'active', NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. Users with realistic UK/Ireland names and emails
INSERT INTO public.profiles (id, email, full_name, organization_id, phone, created_at) VALUES
-- Admin users
('admin-uk-main', 'admin@londonretail.co.uk', 'Sarah Thompson', 'org-uk-london', '+44 20 7123 4567', NOW()),
('admin-ie-main', 'admin@dublinfinancial.ie', 'Michael O\'Connor', 'org-ie-dublin', '+353 1 234 5678', NOW()),

-- Deployment Engineers
('de-uk-james', 'james.wilson@londonretail.co.uk', 'James Wilson', 'org-uk-london', '+44 20 7123 4568', NOW()),
('de-uk-emma', 'emma.davies@manchesterhosp.co.uk', 'Emma Davies', 'org-uk-manchester', '+44 161 234 5678', NOW()),
('de-uk-ahmed', 'ahmed.khan@birminghamtech.co.uk', 'Ahmed Khan', 'org-uk-birmingham', '+44 121 234 5678', NOW()),
('de-ie-sean', 'sean.murphy@corkmanufacturing.ie', 'Sean Murphy', 'org-ie-cork', '+353 21 234 5678', NOW()),

-- Ops Managers
('om-uk-rebecca', 'rebecca.brown@londonretail.co.uk', 'Rebecca Brown', 'org-uk-london', '+44 20 7123 4569', NOW()),
('om-uk-david', 'david.jones@manchesterhosp.co.uk', 'David Jones', 'org-uk-manchester', '+44 161 234 5679', NOW()),
('om-ie-aoife', 'aoife.ryan@dublinfinancial.ie', 'Aoife Ryan', 'org-ie-dublin', '+353 1 234 5679', NOW()),
('om-uk-angus', 'angus.macdonald@edinburghhealth.co.uk', 'Angus MacDonald', 'org-uk-edinburgh', '+44 131 234 5678', NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. User roles assignment
INSERT INTO public.user_roles (user_id, role, created_at) VALUES
-- Admin roles
('admin-uk-main', 'admin', NOW()),
('admin-ie-main', 'admin', NOW()),

-- Deployment Engineer roles
('de-uk-james', 'deployment_engineer', NOW()),
('de-uk-emma', 'deployment_engineer', NOW()),
('de-uk-ahmed', 'deployment_engineer', NOW()),
('de-ie-sean', 'deployment_engineer', NOW()),

-- Ops Manager roles
('om-uk-rebecca', 'ops_manager', NOW()),
('om-uk-david', 'ops_manager', NOW()),
('om-ie-aoife', 'ops_manager', NOW()),
('om-uk-angus', 'ops_manager', NOW())
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. Hardware requests (scoping) for testing notifications
INSERT INTO public.hardware_requests (id, site_id, organization_id, site_name, status, total_cost, created_by, created_at) VALUES
('hr-london-oxford-001', 'site-london-oxford-street', 'org-uk-london', 'Oxford Street Store', 'pending', 45000.00, 'de-uk-james', NOW()),
('hr-manchester-city-001', 'site-manchester-city-centre', 'org-uk-manchester', 'City Centre Hotel', 'approved', 67000.00, 'de-uk-emma', NOW()),
('hr-birmingham-bull-001', 'site-birmingham-bullring', 'org-uk-birmingham', 'Bullring Office', 'rejected', 32000.00, 'de-uk-ahmed', NOW()),
('hr-dublin-dock-001', 'site-dublin-docklands', 'org-ie-dublin', 'Docklands HQ', 'pending', 89000.00, 'de-ie-sean', NOW()),
('hr-cork-city-001', 'site-cork-city', 'org-ie-cork', 'City Factory', 'approved', 54000.00, 'de-ie-sean', NOW())
ON CONFLICT (id) DO NOTHING;

-- 6. Sample notifications for testing
INSERT INTO public.notifications (id, user_id, type, title, message, entity_type, entity_id, action_url, is_read, created_by, priority, created_at) VALUES
-- Pending scoping notifications for Ops Managers
(gen_random_uuid(), 'om-uk-rebecca', 'scoping_submitted', 'New Scoping Submitted', 'Site "Oxford Street Store" has submitted scoping for approval', 'scoping_approval', 'hr-london-oxford-001', '/approvals/hr-london-oxford-001', false, 'de-uk-james', 'high', NOW()),
(gen_random_uuid(), 'om-ie-aoife', 'scoping_submitted', 'New Scoping Submitted', 'Site "Docklands HQ" has submitted scoping for approval', 'scoping_approval', 'hr-dublin-dock-001', '/approvals/hr-dublin-dock-001', false, 'de-ie-sean', 'high', NOW()),

-- Approval decision notifications for Deployment Engineers
(gen_random_uuid(), 'de-uk-emma', 'approval_decision', 'Scope Approved', 'Your scoping for site "City Centre Hotel" has been approved', 'scoping_approval', 'hr-manchester-city-001', '/approvals/hr-manchester-city-001', false, 'om-uk-david', 'normal', NOW()),
(gen_random_uuid(), 'de-uk-ahmed', 'approval_decision', 'Scope Rejected', 'Your scoping for site "Bullring Office" has been rejected. Please review and resubmit.', 'scoping_approval', 'hr-birmingham-bull-001', '/approvals/hr-birmingham-bull-001', false, 'om-uk-david', 'high', NOW()),
(gen_random_uuid(), 'de-ie-sean', 'approval_decision', 'Scope Approved', 'Your scoping for site "City Factory" has been approved', 'scoping_approval', 'hr-cork-city-001', '/approvals/hr-cork-city-001', false, 'om-ie-aoife', 'normal', NOW())
ON CONFLICT (id) DO NOTHING;

-- 7. Sample audit logs
INSERT INTO public.audit_logs (id, user_id, action, table_name, record_id, metadata, created_at) VALUES
(gen_random_uuid(), 'de-uk-james', 'CREATE', 'hardware_requests', 'hr-london-oxford-001', '{"site_name": "Oxford Street Store", "total_cost": 45000.00}', NOW()),
(gen_random_uuid(), 'om-uk-david', 'UPDATE', 'hardware_requests', 'hr-manchester-city-001', '{"status": "approved", "previous_status": "pending"}', NOW()),
(gen_random_uuid(), 'om-uk-david', 'UPDATE', 'hardware_requests', 'hr-birmingham-bull-001', '{"status": "rejected", "previous_status": "pending", "reason": "Hardware specifications need revision"}', NOW()),
(gen_random_uuid(), 'de-ie-sean', 'CREATE', 'hardware_requests', 'hr-dublin-dock-001', '{"site_name": "Docklands HQ", "total_cost": 89000.00}', NOW()),
(gen_random_uuid(), 'om-ie-aoife', 'UPDATE', 'hardware_requests', 'hr-cork-city-001', '{"status": "approved", "previous_status": "pending"}', NOW())
ON CONFLICT (id) DO NOTHING;

-- 8. Notification preferences for all users
INSERT INTO public.notification_preferences (user_id, email_enabled, push_enabled, scoping_notifications, approval_notifications, deployment_notifications, maintenance_notifications, forecast_notifications, created_at, updated_at) VALUES
('admin-uk-main', true, true, true, true, true, true, true, NOW(), NOW()),
('admin-ie-main', true, true, true, true, true, true, true, NOW(), NOW()),
('de-uk-james', true, true, true, true, true, true, true, NOW(), NOW()),
('de-uk-emma', true, true, true, true, true, true, true, NOW(), NOW()),
('de-uk-ahmed', true, true, true, true, true, true, true, NOW(), NOW()),
('de-ie-sean', true, true, true, true, true, true, true, NOW(), NOW()),
('om-uk-rebecca', true, true, true, true, true, true, true, NOW(), NOW()),
('om-uk-david', true, true, true, true, true, true, true, NOW(), NOW()),
('om-ie-aoife', true, true, true, true, true, true, true, NOW(), NOW()),
('om-uk-angus', true, true, true, true, true, true, true, NOW(), NOW())
ON CONFLICT (user_id) DO NOTHING;

-- 9. Site assignments for users
INSERT INTO public.site_assignments (id, site_id, user_id, role, assigned_at) VALUES
-- London Retail Group assignments
(gen_random_uuid(), 'site-london-oxford-street', 'de-uk-james', 'deployment_engineer', NOW()),
(gen_random_uuid(), 'site-london-canary-wharf', 'de-uk-james', 'deployment_engineer', NOW()),
(gen_random_uuid(), 'site-london-oxford-street', 'om-uk-rebecca', 'ops_manager', NOW()),
(gen_random_uuid(), 'site-london-canary-wharf', 'om-uk-rebecca', 'ops_manager', NOW()),

-- Manchester Hospitality assignments
(gen_random_uuid(), 'site-manchester-city-centre', 'de-uk-emma', 'deployment_engineer', NOW()),
(gen_random_uuid(), 'site-manchester-airport', 'de-uk-emma', 'deployment_engineer', NOW()),
(gen_random_uuid(), 'site-manchester-city-centre', 'om-uk-david', 'ops_manager', NOW()),
(gen_random_uuid(), 'site-manchester-airport', 'om-uk-david', 'ops_manager', NOW()),

-- Birmingham Tech assignments
(gen_random_uuid(), 'site-birmingham-bullring', 'de-uk-ahmed', 'deployment_engineer', NOW()),
(gen_random_uuid(), 'site-birmingham-bullring', 'om-uk-david', 'ops_manager', NOW()),

-- Dublin Financial assignments
(gen_random_uuid(), 'site-dublin-docklands', 'de-ie-sean', 'deployment_engineer', NOW()),
(gen_random_uuid(), 'site-dublin-grafton', 'de-ie-sean', 'deployment_engineer', NOW()),
(gen_random_uuid(), 'site-dublin-docklands', 'om-ie-aoife', 'ops_manager', NOW()),
(gen_random_uuid(), 'site-dublin-grafton', 'om-ie-aoife', 'ops_manager', NOW()),

-- Cork Manufacturing assignments
(gen_random_uuid(), 'site-cork-city', 'de-ie-sean', 'deployment_engineer', NOW()),
(gen_random_uuid(), 'site-cork-city', 'om-ie-aoife', 'ops_manager', NOW()),

-- Edinburgh Healthcare assignments
(gen_random_uuid(), 'site-edinburgh-royal-mile', 'om-uk-angus', 'ops_manager', NOW())
ON CONFLICT (id) DO NOTHING;

-- 10. Sample software and hardware items
INSERT INTO public.software_modules (id, name, description, category, cost_per_license, created_at) VALUES
('sw-pos-system', 'SmartQ POS Pro', 'Advanced point-of-sale system with inventory management', 'POS', 299.99, NOW()),
('sw-kiosk-software', 'Self-Service Kiosk Suite', 'Touch-screen kiosk software for customer interactions', 'Kiosk', 199.99, NOW()),
('sw-kitchen-display', 'Kitchen Display System', 'Real-time order management for kitchen staff', 'Kitchen', 149.99, NOW()),
('sw-inventory-mgmt', 'Inventory Management Pro', 'Comprehensive inventory tracking and forecasting', 'Inventory', 399.99, NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hardware_items (id, name, description, category, unit_cost, created_at) VALUES
('hw-pos-terminal', 'SmartQ POS Terminal', 'Touch-screen POS terminal with receipt printer', 'POS Hardware', 899.99, NOW()),
('hw-barcode-scanner', 'Wireless Barcode Scanner', 'High-speed wireless barcode scanner', 'Scanner', 199.99, NOW()),
('hw-cash-drawer', 'Electronic Cash Drawer', 'Secure electronic cash drawer with lock', 'Cash Management', 299.99, NOW()),
('hw-receipt-printer', 'Thermal Receipt Printer', 'Fast thermal receipt printer for POS', 'Printer', 399.99, NOW()),
('hw-kiosk-display', 'Interactive Kiosk Display', '55" touch-screen kiosk display', 'Display', 1299.99, NOW())
ON CONFLICT (id) DO NOTHING;

-- 11. Sample scoping items for hardware requests
INSERT INTO public.scoping_items (id, hardware_request_id, item_type, item_id, quantity, unit_cost, total_cost, created_at) VALUES
-- London Oxford Street Store
(gen_random_uuid(), 'hr-london-oxford-001', 'hardware', 'hw-pos-terminal', 4, 899.99, 3599.96, NOW()),
(gen_random_uuid(), 'hr-london-oxford-001', 'hardware', 'hw-barcode-scanner', 4, 199.99, 799.96, NOW()),
(gen_random_uuid(), 'hr-london-oxford-001', 'hardware', 'hw-cash-drawer', 4, 299.99, 1199.96, NOW()),
(gen_random_uuid(), 'hr-london-oxford-001', 'software', 'sw-pos-system', 4, 299.99, 1199.96, NOW()),
(gen_random_uuid(), 'hr-london-oxford-001', 'software', 'sw-inventory-mgmt', 1, 399.99, 399.99, NOW()),

-- Manchester City Centre Hotel
(gen_random_uuid(), 'hr-manchester-city-001', 'hardware', 'hw-pos-terminal', 6, 899.99, 5399.94, NOW()),
(gen_random_uuid(), 'hr-manchester-city-001', 'hardware', 'hw-kiosk-display', 2, 1299.99, 2599.98, NOW()),
(gen_random_uuid(), 'hr-manchester-city-001', 'software', 'sw-pos-system', 6, 299.99, 1799.94, NOW()),
(gen_random_uuid(), 'hr-manchester-city-001', 'software', 'sw-kiosk-software', 2, 199.99, 399.98, NOW()),
(gen_random_uuid(), 'hr-manchester-city-001', 'software', 'sw-kitchen-display', 1, 149.99, 149.99, NOW()),

-- Birmingham Bullring Office
(gen_random_uuid(), 'hr-birmingham-bull-001', 'hardware', 'hw-pos-terminal', 2, 899.99, 1799.98, NOW()),
(gen_random_uuid(), 'hr-birmingham-bull-001', 'hardware', 'hw-barcode-scanner', 2, 199.99, 399.98, NOW()),
(gen_random_uuid(), 'hr-birmingham-bull-001', 'software', 'sw-pos-system', 2, 299.99, 599.98, NOW()),

-- Dublin Docklands HQ
(gen_random_uuid(), 'hr-dublin-dock-001', 'hardware', 'hw-pos-terminal', 8, 899.99, 7199.92, NOW()),
(gen_random_uuid(), 'hr-dublin-dock-001', 'hardware', 'hw-kiosk-display', 4, 1299.99, 5199.96, NOW()),
(gen_random_uuid(), 'hr-dublin-dock-001', 'software', 'sw-pos-system', 8, 299.99, 2399.92, NOW()),
(gen_random_uuid(), 'hr-dublin-dock-001', 'software', 'sw-kiosk-software', 4, 199.99, 799.96, NOW()),
(gen_random_uuid(), 'hr-dublin-dock-001', 'software', 'sw-inventory-mgmt', 1, 399.99, 399.99, NOW()),

-- Cork City Factory
(gen_random_uuid(), 'hr-cork-city-001', 'hardware', 'hw-pos-terminal', 3, 899.99, 2699.97, NOW()),
(gen_random_uuid(), 'hr-cork-city-001', 'hardware', 'hw-barcode-scanner', 3, 199.99, 599.97, NOW()),
(gen_random_uuid(), 'hr-cork-city-001', 'software', 'sw-pos-system', 3, 299.99, 899.97, NOW()),
(gen_random_uuid(), 'hr-cork-city-001', 'software', 'sw-inventory-mgmt', 1, 399.99, 399.99, NOW())
ON CONFLICT (id) DO NOTHING;

-- 12. Update hardware request totals based on scoping items
UPDATE public.hardware_requests 
SET total_cost = (
  SELECT COALESCE(SUM(total_cost), 0) 
  FROM public.scoping_items 
  WHERE hardware_request_id = public.hardware_requests.id
)
WHERE id IN (
  'hr-london-oxford-001', 'hr-manchester-city-001', 'hr-birmingham-bull-001', 
  'hr-dublin-dock-001', 'hr-cork-city-001'
);

-- Success message
SELECT 'UK and Ireland test data seeded successfully!' as message;
