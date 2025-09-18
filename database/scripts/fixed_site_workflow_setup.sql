-- Fixed Site Workflow Setup Script
-- This script works with your current database structure

-- ==============================================
-- 1. INSERT SAMPLE ORGANIZATIONS (if not exists)
-- ==============================================

INSERT INTO public.organizations (id, name, sector, unit_code, description) VALUES
('ac159a69-361d-451f-a2a9-8f8d6416f188', 'ASDA', 'Retail', 'ASDA', 'ASDA Stores Limited'),
('3b42dfca-93dc-46ff-9571-bbc2965bfbbc', 'Tesco', 'Retail', 'TESCO', 'Tesco PLC'),
('dc8b5afe-29d0-449b-8122-5a7ec59848d5', 'Morrisons', 'Retail', 'MORR', 'Wm Morrison Supermarkets PLC'),
('679221af-e2de-49ff-a16b-e545f23a96f8', 'Sainsbury', 'Retail', 'SAINS', 'J Sainsbury PLC')
ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- 2. INSERT SAMPLE SOFTWARE MODULES
-- ==============================================

-- Insert software modules using category_id (assuming categories exist)
INSERT INTO public.software_modules (id, name, description, category_id, monthly_fee, setup_fee, hardware_requirements) VALUES
('pos-system', 'POS System', 'Point of Sale system for transactions', 
 (SELECT id FROM public.categories WHERE name = 'POS' LIMIT 1), 25.00, 150.00, '["pos-terminal", "printer", "cash-drawer"]'),
('kiosk-software', 'Kiosk Software', 'Self-service kiosk software', 
 (SELECT id FROM public.categories WHERE name = 'Kiosk' LIMIT 1), 20.00, 100.00, '["kiosk-display", "touch-screen", "printer"]'),
('kitchen-display', 'Kitchen Display', 'Kitchen display system for orders', 
 (SELECT id FROM public.categories WHERE name = 'Kitchen Display (KDS)' LIMIT 1), 20.00, 100.00, '["kitchen-display", "printer"]'),
('inventory-management', 'Inventory Management', 'Inventory tracking and management', 
 (SELECT id FROM public.categories WHERE name = 'Inventory' LIMIT 1), 15.00, 75.00, '["tablet", "barcode-scanner"]')
ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- 3. INSERT SAMPLE HARDWARE ITEMS
-- ==============================================

INSERT INTO public.hardware_items (id, name, description, manufacturer, model, category_id, unit_cost) VALUES
('pos-terminal', 'POS Terminal', 'Ingenico Telium 2 POS terminal', 'Ingenico', 'Telium 2', 
 (SELECT id FROM public.categories WHERE name = 'POS' LIMIT 1), 2500.00),
('printer', 'Thermal Printer', 'Receipt and kitchen order printer', 'Epson', 'TM-T88VI', 
 (SELECT id FROM public.categories WHERE name = 'Inventory' LIMIT 1), 350.00),
('cash-drawer', 'Cash Drawer', 'Electronic cash drawer', 'APG', 'CashDrawer-2000', 
 (SELECT id FROM public.categories WHERE name = 'Inventory' LIMIT 1), 200.00),
('kiosk-display', 'Kiosk Display', 'Touch screen display for kiosk', 'Elo', 'TouchScreen-22', 
 (SELECT id FROM public.categories WHERE name = 'Kiosk' LIMIT 1), 800.00),
('touch-screen', 'Touch Screen', 'Touch screen interface', 'Elo', 'TouchScreen-15', 
 (SELECT id FROM public.categories WHERE name = 'Kiosk' LIMIT 1), 600.00),
('kitchen-display', 'Kitchen Display', 'Digital display for kitchen orders', 'Sony', 'KD-55X80K', 
 (SELECT id FROM public.categories WHERE name = 'Kitchen Display (KDS)' LIMIT 1), 1200.00),
('tablet', 'Tablet', 'iPad for inventory management', 'Apple', 'iPad Air', 
 (SELECT id FROM public.categories WHERE name = 'Inventory' LIMIT 1), 800.00),
('barcode-scanner', 'Barcode Scanner', 'USB barcode scanner', 'Honeywell', 'Scanner-1900', 
 (SELECT id FROM public.categories WHERE name = 'Inventory' LIMIT 1), 150.00)
ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- 4. INSERT SAMPLE SITE WITH ORGANIZATION_NAME
-- ==============================================

INSERT INTO public.sites (
  id, 
  name, 
  organization_id, 
  organization_name, 
  location, 
  address, 
  postcode, 
  sector, 
  unit_code, 
  criticality_level, 
  status, 
  target_live_date, 
  assigned_ops_manager, 
  assigned_deployment_engineer
) VALUES (
  '5805e4ec-adce-43c7-a001-d93b70f7ab3e', 
  'Morrisons Leeds', 
  'dc8b5afe-29d0-449b-8122-5a7ec59848d5', 
  'Morrisons', 
  'Leeds', 
  'Briggate, Leeds', 
  'LS1 6HB', 
  'Retail', 
  'MORR-LD-004', 
  'medium', 
  'approved', 
  '2025-11-30', 
  'David Lee', 
  'Sophie Clark'
)
ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- 5. CREATE WORKFLOW STEP TABLES (if they don't exist)
-- ==============================================

-- Site Creation Step Data
CREATE TABLE IF NOT EXISTS public.site_creation_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    unit_manager_name TEXT,
    job_title TEXT,
    unit_manager_email TEXT,
    unit_manager_mobile TEXT,
    additional_contact_name TEXT,
    additional_contact_email TEXT,
    location TEXT,
    postcode TEXT,
    region TEXT,
    country TEXT DEFAULT 'United Kingdom',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    additional_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(site_id)
);

-- Site Study Step Data
CREATE TABLE IF NOT EXISTS public.site_study_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    primary_contact_name TEXT,
    primary_contact_job_title TEXT,
    primary_contact_email TEXT,
    primary_contact_mobile TEXT,
    additional_contact_name TEXT,
    additional_contact_email TEXT,
    site_address TEXT,
    postcode TEXT,
    region TEXT,
    country TEXT DEFAULT 'United Kingdom',
    number_of_counters INTEGER DEFAULT 0,
    floor_plan_available BOOLEAN DEFAULT false,
    meal_sessions JSONB DEFAULT '[]'::jsonb,
    floor TEXT,
    lift_access TEXT,
    security_restrictions TEXT,
    delivery_window TEXT,
    employee_strength INTEGER DEFAULT 0,
    operating_hours TEXT,
    expected_footfall INTEGER DEFAULT 0,
    peak_hours TEXT,
    seating_capacity INTEGER DEFAULT 0,
    kitchen_staff INTEGER DEFAULT 0,
    operating_days TEXT,
    service_staff INTEGER DEFAULT 0,
    management INTEGER DEFAULT 0,
    lan_points INTEGER DEFAULT 0,
    ups_power_pos TEXT,
    wifi_available TEXT,
    ups_power_ceiling TEXT,
    bandwidth TEXT,
    static_ip TEXT,
    selected_solutions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(site_id)
);

-- Scoping Step Data
CREATE TABLE IF NOT EXISTS public.site_scoping_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    selected_software JSONB DEFAULT '[]'::jsonb,
    selected_hardware JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected', 'changes_requested')),
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id),
    cost_summary JSONB DEFAULT '{
        "hardwareCost": 0,
        "softwareSetupCost": 0,
        "installationCost": 0,
        "contingencyCost": 0,
        "totalCapex": 0,
        "monthlySoftwareFees": 0,
        "maintenanceCost": 0,
        "totalMonthlyOpex": 0,
        "totalInvestment": 0
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(site_id)
);

-- Approval Step Data
CREATE TABLE IF NOT EXISTS public.site_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested')),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id),
    comments TEXT,
    approver_details JSONB DEFAULT '{
        "name": "",
        "role": "",
        "department": ""
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(site_id)
);

-- Procurement Step Data
CREATE TABLE IF NOT EXISTS public.site_procurement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'ordered', 'delivered', 'partially_delivered')),
    software_modules JSONB DEFAULT '[]'::jsonb,
    hardware_items JSONB DEFAULT '[]'::jsonb,
    summary JSONB DEFAULT '{
        "totalSoftwareModules": 0,
        "totalHardwareItems": 0,
        "inProgress": 0,
        "completed": 0
    }'::jsonb,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(site_id)
);

-- Deployment Step Data
CREATE TABLE IF NOT EXISTS public.site_deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'on_hold')),
    start_date DATE,
    end_date DATE,
    assigned_engineer UUID REFERENCES auth.users(id),
    notes TEXT,
    progress JSONB DEFAULT '{
        "overallProgress": 0,
        "hardwareDelivered": "pending",
        "installation": "pending",
        "testing": "pending"
    }'::jsonb,
    timeline JSONB DEFAULT '{
        "hardwareDelivery": "",
        "installationStart": "",
        "installationEnd": "",
        "testingStart": "",
        "testingEnd": "",
        "goLiveDate": ""
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(site_id)
);

-- Go Live Step Data
CREATE TABLE IF NOT EXISTS public.site_go_live (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'live', 'postponed')),
    date DATE,
    signed_off_by TEXT,
    notes TEXT,
    checklist JSONB DEFAULT '{
        "hardwareInstallationComplete": "pending",
        "softwareConfigurationComplete": "pending",
        "staffTraining": "pending",
        "finalTesting": "pending"
    }'::jsonb,
    timeline JSONB DEFAULT '{
        "targetGoLiveDate": "",
        "finalTesting": "",
        "staffTraining": "",
        "systemHandover": ""
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(site_id)
);

-- ==============================================
-- 6. INSERT SAMPLE WORKFLOW DATA
-- ==============================================

-- Insert site creation data
INSERT INTO public.site_creation_data (
    site_id, unit_manager_name, job_title, unit_manager_email, unit_manager_mobile, 
    additional_contact_name, additional_contact_email, location, postcode, region, 
    country, latitude, longitude, additional_notes
) VALUES (
    '5805e4ec-adce-43c7-a001-d93b70f7ab3e', 
    'John Smith', 'Store Manager', 'john.smith@morrisons.com', '+44 113 123 4567', 
    'Sarah Wilson', 'sarah.wilson@morrisons.com', 'Morrisons Leeds', 'LS1 6HB', 
    'West Yorkshire', 'United Kingdom', 53.8008, -1.5491, 
    'Kitchen area needs additional power outlets for POS terminals. Storage area available for hardware installation.'
)
ON CONFLICT (site_id) DO NOTHING;

-- Insert site study data
INSERT INTO public.site_study_data (
    site_id, primary_contact_name, primary_contact_job_title, primary_contact_email, 
    primary_contact_mobile, additional_contact_name, additional_contact_email, 
    site_address, postcode, region, country, number_of_counters, floor_plan_available, 
    meal_sessions, floor, lift_access, security_restrictions, delivery_window, 
    employee_strength, operating_hours, expected_footfall, peak_hours, seating_capacity, 
    kitchen_staff, operating_days, service_staff, management, lan_points, ups_power_pos, 
    wifi_available, ups_power_ceiling, bandwidth, static_ip, selected_solutions
) VALUES (
    '5805e4ec-adce-43c7-a001-d93b70f7ab3e', 
    'John Smith', 'Store Manager', 'john.smith@morrisons.com', '+44 113 123 4567', 
    'Sarah Wilson', 'sarah.wilson@morrisons.com', 'Morrisons Leeds, Briggate, Leeds', 
    'LS1 6HB', 'West Yorkshire', 'United Kingdom', 4, true, 
    '["Breakfast", "Lunch", "Dinner"]', 'Ground Floor', 'Available', 
    'Security pass required for all visitors', '10:00 AM - 2:00 PM', 45, 
    '7:00 AM - 6:00 PM', 800, '12:00 PM - 2:00 PM', 300, 15, 'Monday - Friday', 
    8, 3, 8, 'Available', 'Yes', 'Not Available', '6 Mbps', 'Provided', 
    '["pos-system", "kiosk-software", "kitchen-display", "inventory-management"]'
)
ON CONFLICT (site_id) DO NOTHING;

-- Insert site scoping data
INSERT INTO public.site_scoping_data (
    site_id, selected_software, selected_hardware, status, submitted_at, approved_at, cost_summary
) VALUES (
    '5805e4ec-adce-43c7-a001-d93b70f7ab3e', 
    '["pos-system", "kiosk-software", "kitchen-display", "inventory-management"]', 
    '[{"id": "pos-terminal", "quantity": 4}, {"id": "kiosk-display", "quantity": 2}, {"id": "printer", "quantity": 4}, {"id": "cash-drawer", "quantity": 2}, {"id": "kitchen-display", "quantity": 1}, {"id": "tablet", "quantity": 2}, {"id": "barcode-scanner", "quantity": 2}]', 
    'approved', '2024-12-10T10:00:00Z', '2024-12-12T14:30:00Z', 
    '{"hardwareCost": 12500, "softwareSetupCost": 425, "installationCost": 2000, "contingencyCost": 2239, "totalCapex": 17164, "monthlySoftwareFees": 80, "maintenanceCost": 50, "totalMonthlyOpex": 130, "totalInvestment": 17294}'
)
ON CONFLICT (site_id) DO NOTHING;

-- Insert site approval data
INSERT INTO public.site_approvals (
    site_id, status, requested_at, approved_at, comments, approver_details
) VALUES (
    '5805e4ec-adce-43c7-a001-d93b70f7ab3e', 
    'approved', '2024-12-15T09:00:00Z', '2024-12-18T11:00:00Z', 
    'All requirements met. Budget approved. Proceed with procurement.', 
    '{"name": "Sarah Johnson", "role": "Operations Director", "department": "Operations"}'
)
ON CONFLICT (site_id) DO NOTHING;

-- Insert site procurement data
INSERT INTO public.site_procurement (
    site_id, status, software_modules, hardware_items, summary, last_updated
) VALUES (
    '5805e4ec-adce-43c7-a001-d93b70f7ab3e', 
    'ordered', 
    '[{"name": "POS System", "status": "ordered", "orderDate": "2024-12-20"}, {"name": "Kiosk Software", "status": "ordered", "orderDate": "2024-12-20"}]', 
    '[{"name": "POS Terminals", "quantity": 4, "status": "ordered", "orderDate": "2024-12-20", "deliveryDate": "2025-01-10"}, {"name": "Kiosk Displays", "quantity": 2, "status": "ordered", "orderDate": "2024-12-20", "deliveryDate": "2025-01-10"}]', 
    '{"totalSoftwareModules": 2, "totalHardwareItems": 2, "inProgress": 4, "completed": 0}', 
    '2025-01-01T10:00:00Z'
)
ON CONFLICT (site_id) DO NOTHING;

-- Insert site deployment data
INSERT INTO public.site_deployments (
    site_id, status, start_date, end_date, notes, progress, timeline
) VALUES (
    '5805e4ec-adce-43c7-a001-d93b70f7ab3e', 
    'scheduled', '2025-11-08', '2025-11-12', 
    'Deployment scheduled for November 2025', 
    '{"overallProgress": 0, "hardwareDelivered": "pending", "installation": "pending", "testing": "pending"}', 
    '{"hardwareDelivery": "2025-11-05", "installationStart": "2025-11-08", "installationEnd": "2025-11-10", "testingStart": "2025-11-11", "testingEnd": "2025-11-12", "goLiveDate": "2025-11-15"}'
)
ON CONFLICT (site_id) DO NOTHING;

-- Insert site go live data
INSERT INTO public.site_go_live (
    site_id, status, date, notes, checklist, timeline
) VALUES (
    '5805e4ec-adce-43c7-a001-d93b70f7ab3e', 
    'pending', '2025-11-30', 'Go live scheduled for November 30, 2025', 
    '{"hardwareInstallationComplete": "pending", "softwareConfigurationComplete": "pending", "staffTraining": "pending", "finalTesting": "pending"}', 
    '{"targetGoLiveDate": "2025-11-30", "finalTesting": "2 days before", "staffTraining": "1 week before", "systemHandover": "Go-Live day"}'
)
ON CONFLICT (site_id) DO NOTHING;

-- ==============================================
-- 7. VERIFICATION
-- ==============================================

SELECT 
    'Setup Complete' as status,
    (SELECT COUNT(*) FROM public.sites WHERE id = '5805e4ec-adce-43c7-a001-d93b70f7ab3e') as site_exists,
    (SELECT COUNT(*) FROM public.site_creation_data WHERE site_id = '5805e4ec-adce-43c7-a001-d93b70f7ab3e') as creation_data_exists,
    (SELECT COUNT(*) FROM public.site_study_data WHERE site_id = '5805e4ec-adce-43c7-a001-d93b70f7ab3e') as study_data_exists,
    (SELECT COUNT(*) FROM public.site_scoping_data WHERE site_id = '5805e4ec-adce-43c7-a001-d93b70f7ab3e') as scoping_data_exists,
    (SELECT COUNT(*) FROM public.site_approvals WHERE site_id = '5805e4ec-adce-43c7-a001-d93b70f7ab3e') as approval_data_exists,
    (SELECT COUNT(*) FROM public.site_procurement WHERE site_id = '5805e4ec-adce-43c7-a001-d93b70f7ab3e') as procurement_data_exists,
    (SELECT COUNT(*) FROM public.site_deployments WHERE site_id = '5805e4ec-adce-43c7-a001-d93b70f7ab3e') as deployment_data_exists,
    (SELECT COUNT(*) FROM public.site_go_live WHERE site_id = '5805e4ec-adce-43c7-a001-d93b70f7ab3e') as go_live_data_exists;
