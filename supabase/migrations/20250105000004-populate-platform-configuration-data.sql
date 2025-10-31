-- Populate platform configuration tables with initial data
-- This migration inserts the base software modules, hardware items, and recommendation rules

-- Insert software modules
INSERT INTO public.software_modules (id, name, description, monthly_fee, setup_fee, category, status, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'POS System', 'Point of Sale system for transactions', 25.00, 150.00, 'Payment Processing', 'active', (SELECT id FROM auth.users WHERE email = 'admin@smartq.com' LIMIT 1)),
('550e8400-e29b-41d4-a716-446655440002', 'Kiosk Software', 'Self-service kiosk software', 20.00, 100.00, 'Self-Service', 'active', (SELECT id FROM auth.users WHERE email = 'admin@smartq.com' LIMIT 1)),
('550e8400-e29b-41d4-a716-446655440003', 'Kitchen Display', 'Kitchen display system for orders', 20.00, 100.00, 'Kitchen Management', 'active', (SELECT id FROM auth.users WHERE email = 'admin@smartq.com' LIMIT 1)),
('550e8400-e29b-41d4-a716-446655440004', 'Inventory Management', 'Inventory tracking and management', 15.00, 75.00, 'Inventory', 'active', (SELECT id FROM auth.users WHERE email = 'admin@smartq.com' LIMIT 1))
ON CONFLICT (name) DO NOTHING;

-- Insert hardware items
INSERT INTO public.hardware_items (id, name, description, manufacturer, model, unit_cost, category, status, created_by) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'POS Terminal', 'Ingenico Telium 2 POS terminal', 'Ingenico', 'Telium 2', 2500.00, 'Payment Processing', 'available', (SELECT id FROM auth.users WHERE email = 'admin@smartq.com' LIMIT 1)),
('660e8400-e29b-41d4-a716-446655440002', 'Thermal Printer', 'Receipt and kitchen order printer', 'Epson', 'TM-T88VI', 350.00, 'Printing', 'available', (SELECT id FROM auth.users WHERE email = 'admin@smartq.com' LIMIT 1)),
('660e8400-e29b-41d4-a716-446655440003', 'Cash Drawer', 'Electronic cash drawer', 'APG', 'CashDrawer-2000', 200.00, 'Payment Processing', 'available', (SELECT id FROM auth.users WHERE email = 'admin@smartq.com' LIMIT 1)),
('660e8400-e29b-41d4-a716-446655440004', 'Kiosk Display', 'Touch screen display for kiosk', 'Elo', 'TouchScreen-22', 800.00, 'Display', 'available', (SELECT id FROM auth.users WHERE email = 'admin@smartq.com' LIMIT 1)),
('660e8400-e29b-41d4-a716-446655440005', 'Touch Screen', 'Touch screen interface', 'Elo', 'TouchScreen-15', 600.00, 'Display', 'available', (SELECT id FROM auth.users WHERE email = 'admin@smartq.com' LIMIT 1)),
('660e8400-e29b-41d4-a716-446655440006', 'Kitchen Display', 'Digital display for kitchen orders', 'Sony', 'KD-55X80K', 1200.00, 'Display', 'available', (SELECT id FROM auth.users WHERE email = 'admin@smartq.com' LIMIT 1)),
('660e8400-e29b-41d4-a716-446655440007', 'Tablet', 'iPad for inventory management', 'Apple', 'iPad Air', 800.00, 'Mobile Device', 'available', (SELECT id FROM auth.users WHERE email = 'admin@smartq.com' LIMIT 1)),
('660e8400-e29b-41d4-a716-446655440008', 'Barcode Scanner', 'USB barcode scanner', 'Honeywell', 'Scanner-1900', 150.00, 'Input Device', 'available', (SELECT id FROM auth.users WHERE email = 'admin@smartq.com' LIMIT 1))
ON CONFLICT (name) DO NOTHING;

-- Insert recommendation rules
INSERT INTO public.recommendation_rules (software_module_id, hardware_item_id, default_quantity, is_required, reason, cost_multiplier, created_by) VALUES
-- POS System requirements
((SELECT id FROM public.software_modules WHERE name = 'POS System'), (SELECT id FROM public.hardware_items WHERE name = 'POS Terminal'), 1, true, 'Core POS functionality', 1.00, (SELECT id FROM auth.users WHERE email = 'admin@smartq.com' LIMIT 1)),
((SELECT id FROM public.software_modules WHERE name = 'POS System'), (SELECT id FROM public.hardware_items WHERE name = 'Thermal Printer'), 1, true, 'Receipt printing', 1.00, (SELECT id FROM auth.users WHERE email = 'admin@smartq.com' LIMIT 1)),
((SELECT id FROM public.software_modules WHERE name = 'POS System'), (SELECT id FROM public.hardware_items WHERE name = 'Cash Drawer'), 1, true, 'Cash management', 1.00, (SELECT id FROM auth.users WHERE email = 'admin@smartq.com' LIMIT 1)),

-- Kiosk Software requirements
((SELECT id FROM public.software_modules WHERE name = 'Kiosk Software'), (SELECT id FROM public.hardware_items WHERE name = 'Kiosk Display'), 1, true, 'Kiosk interface', 1.00, (SELECT id FROM auth.users WHERE email = 'admin@smartq.com' LIMIT 1)),
((SELECT id FROM public.software_modules WHERE name = 'Kiosk Software'), (SELECT id FROM public.hardware_items WHERE name = 'Touch Screen'), 1, true, 'Touch interaction', 1.00, (SELECT id FROM auth.users WHERE email = 'admin@smartq.com' LIMIT 1)),

-- Kitchen Display requirements
((SELECT id FROM public.software_modules WHERE name = 'Kitchen Display'), (SELECT id FROM public.hardware_items WHERE name = 'Kitchen Display'), 1, true, 'Kitchen order display', 1.00, (SELECT id FROM auth.users WHERE email = 'admin@smartq.com' LIMIT 1)),

-- Inventory Management requirements
((SELECT id FROM public.software_modules WHERE name = 'Inventory Management'), (SELECT id FROM public.hardware_items WHERE name = 'Tablet'), 1, true, 'Mobile inventory management', 1.00, (SELECT id FROM auth.users WHERE email = 'admin@smartq.com' LIMIT 1)),
((SELECT id FROM public.software_modules WHERE name = 'Inventory Management'), (SELECT id FROM public.hardware_items WHERE name = 'Barcode Scanner'), 1, true, 'Barcode scanning', 1.00, (SELECT id FROM auth.users WHERE email = 'admin@smartq.com' LIMIT 1))
ON CONFLICT (software_module_id, hardware_item_id) DO NOTHING;

-- Insert business rules
INSERT INTO public.business_rules (name, description, rule_type, software_module_ids, hardware_item_ids, rule_value, priority, created_by) VALUES
('POS Hardware Dependency', 'POS System requires POS Terminal, Printer, and Cash Drawer', 'dependency', 
 ARRAY[(SELECT id FROM public.software_modules WHERE name = 'POS System')], 
 ARRAY[(SELECT id FROM public.hardware_items WHERE name = 'POS Terminal'), (SELECT id FROM public.hardware_items WHERE name = 'Thermal Printer'), (SELECT id FROM public.hardware_items WHERE name = 'Cash Drawer')], 
 'required', 1, (SELECT id FROM auth.users WHERE email = 'admin@smartq.com' LIMIT 1)),

('Kiosk Display Requirement', 'Kiosk Software requires touch screen display', 'dependency', 
 ARRAY[(SELECT id FROM public.software_modules WHERE name = 'Kiosk Software')], 
 ARRAY[(SELECT id FROM public.hardware_items WHERE name = 'Kiosk Display'), (SELECT id FROM public.hardware_items WHERE name = 'Touch Screen')], 
 'required', 2, (SELECT id FROM auth.users WHERE email = 'admin@smartq.com' LIMIT 1)),

('Kitchen Display Quantity', 'Kitchen Display software requires exactly one display unit', 'quantity', 
 ARRAY[(SELECT id FROM public.software_modules WHERE name = 'Kitchen Display')], 
 ARRAY[(SELECT id FROM public.hardware_items WHERE name = 'Kitchen Display')], 
 '1', 3, (SELECT id FROM auth.users WHERE email = 'admin@smartq.com' LIMIT 1))
ON CONFLICT DO NOTHING;
