-- Seed data for platform configuration to fix missing data issues

-- Insert default organizations if none exist
INSERT INTO public.organizations (name, description, sector) 
SELECT 'SmartQ Limited', 'Primary service provider for hospitality technology solutions', 'Business & Industry'
WHERE NOT EXISTS (SELECT 1 FROM public.organizations LIMIT 1);

INSERT INTO public.organizations (name, description, sector) 
SELECT 'Healthcare Partners', 'Healthcare technology solutions provider', 'Healthcare & Senior Living'
WHERE NOT EXISTS (SELECT 1 FROM public.organizations WHERE name = 'Healthcare Partners');

-- Insert default software modules if none exist (using existing schema)
INSERT INTO public.software_modules (name, description, category, is_active)
SELECT * FROM (VALUES
  ('SmartQ POS Pro', 'Advanced point-of-sale system with inventory management', 'POS', true),
  ('Self-Service Kiosk Suite', 'Touch-screen kiosk software for customer interactions', 'Kiosk', true),
  ('Kitchen Display System', 'Real-time order management for kitchen staff', 'Kitchen', true),
  ('Inventory Management Pro', 'Comprehensive inventory tracking and forecasting', 'Inventory', true),
  ('Payment Gateway', 'Secure payment processing integration', 'Payment', true),
  ('Analytics Dashboard', 'Business intelligence and reporting platform', 'Analytics', true)
) AS t(name, description, category, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.software_modules LIMIT 1);

-- Insert default hardware items if none exist
INSERT INTO public.hardware_items (name, description, category, model, manufacturer, estimated_cost, is_active)
SELECT * FROM (VALUES
  ('SmartQ POS Terminal', 'Touch-screen POS terminal with receipt printer', 'POS Hardware', 'SmartQ-POS-2024', 'SmartQ', 899.99, true),
  ('Wireless Barcode Scanner', 'High-speed wireless barcode scanner', 'Scanner', 'SmartQ-Scan-Pro', 'SmartQ', 199.99, true),
  ('Electronic Cash Drawer', 'Secure electronic cash drawer with lock', 'Cash Management', 'SmartQ-Cash-2000', 'SmartQ', 299.99, true),
  ('Touch Screen Display 22"', 'Large touch screen display for kiosk applications', 'Display', 'TouchScreen-22', 'Elo', 800.00, true),
  ('Touch Screen Display 15"', 'Compact touch screen for countertop use', 'Display', 'TouchScreen-15', 'Elo', 600.00, true),
  ('Kitchen Display Monitor', 'Digital display optimized for kitchen environments', 'Display', 'KitchenDisplay-15', 'KitchenTech', 450.00, true),
  ('Receipt Printer', 'High-speed thermal receipt printer', 'Printer', 'ThermalPrint-80', 'Epson', 250.00, true),
  ('Card Reader', 'EMV chip and contactless card reader', 'Payment', 'CardReader-Pro', 'Ingenico', 180.00, true),
  ('Network Router', 'Enterprise-grade wireless router', 'Networking', 'Router-Enterprise', 'Cisco', 350.00, true),
  ('Security Camera', 'IP security camera with night vision', 'Security', 'SecureCam-Pro', 'Hikvision', 120.00, true)
) AS t(name, description, category, model, manufacturer, estimated_cost, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.hardware_items LIMIT 1);

-- Insert default cities if none exist (UK cities)
INSERT INTO public.cities (name, region)
SELECT * FROM (VALUES
  ('London', 'Greater London'),
  ('Birmingham', 'West Midlands'),
  ('Manchester', 'Greater Manchester'),
  ('Leeds', 'West Yorkshire'),
  ('Liverpool', 'Merseyside'),
  ('Sheffield', 'South Yorkshire'),
  ('Bristol', 'South West England'),
  ('Newcastle', 'North East England'),
  ('Nottingham', 'East Midlands'),
  ('Leicester', 'East Midlands')
) AS t(name, region)
WHERE NOT EXISTS (SELECT 1 FROM public.cities LIMIT 1);

-- Insert default sectors if none exist
INSERT INTO public.sectors (name, description)
SELECT * FROM (VALUES
  ('Business & Industry', 'Corporate offices, manufacturing, and industrial facilities'),
  ('Healthcare & Senior Living', 'Hospitals, clinics, care homes, and medical facilities'),
  ('Education', 'Schools, universities, and educational institutions'),
  ('Sports & Leisure', 'Gyms, sports centers, entertainment venues'),
  ('Defence', 'Military and government facilities'),
  ('Offshore & Remote', 'Remote locations and offshore installations')
) AS t(name, description)
WHERE NOT EXISTS (SELECT 1 FROM public.sectors LIMIT 1);

-- Create function to get user stats for platform configuration
CREATE OR REPLACE FUNCTION public.get_user_management_stats()
RETURNS TABLE(
    total_users bigint,
    admin_count bigint,
    ops_manager_count bigint,
    deployment_engineer_count bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        COUNT(DISTINCT p.user_id) as total_users,
        COUNT(DISTINCT CASE WHEN ur.role = 'admin' THEN p.user_id END) as admin_count,
        COUNT(DISTINCT CASE WHEN ur.role = 'ops_manager' THEN p.user_id END) as ops_manager_count,
        COUNT(DISTINCT CASE WHEN ur.role = 'deployment_engineer' THEN p.user_id END) as deployment_engineer_count
    FROM public.profiles p
    LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id;
$$;