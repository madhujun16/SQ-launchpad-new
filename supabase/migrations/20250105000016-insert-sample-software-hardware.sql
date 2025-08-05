-- Insert sample software modules
INSERT INTO public.software_modules (name, description, category) VALUES
('SmartQ App', 'Mobile application for order management and customer interaction', 'Mobile'),
('POS System', 'Point of Sale system for transaction processing', 'POS'),
('KMS (Kitchen Management System)', 'Digital display system for kitchen order management', 'Kitchen'),
('QR Ordering', 'QR code-based ordering system', 'Ordering'),
('Kiosk System', 'Self-service ordering kiosk', 'Self-Service'),
('Allergen Display', 'Digital menu display with allergen information', 'Display'),
('Control Desk', 'Central management and monitoring system', 'Management'),
('Inventory Management', 'Stock and inventory tracking system', 'Management'),
('Analytics Dashboard', 'Business intelligence and reporting system', 'Analytics'),
('Customer Feedback', 'Customer satisfaction and feedback collection', 'Customer');

-- Insert sample hardware items
INSERT INTO public.hardware_items (name, description, category, model, manufacturer, estimated_cost) VALUES
('Android Tablet', '10-inch Android tablet for SmartQ App', 'Mobile', 'Galaxy Tab A', 'Samsung', 299.99),
('QR Reader', 'Barcode and QR code scanner', 'Scanner', 'Honeywell 1900', 'Honeywell', 199.99),
('Wi-Fi Router', 'High-speed wireless router', 'Network', 'TP-Link Archer C7', 'TP-Link', 89.99),
('POS Terminal', 'Touch-screen POS terminal', 'POS', 'Ingenico iSC250', 'Ingenico', 599.99),
('Barcode Printer', 'Thermal barcode label printer', 'Printer', 'Zebra ZD220', 'Zebra', 299.99),
('22" KMS Screen', 'Kitchen display screen', 'Display', 'LG 22ML600', 'LG', 199.99),
('QR Scanner Mount', 'Wall mount for QR scanner', 'Mount', 'VESA Mount', 'Generic', 29.99),
('22" Touch Kiosk', 'Self-service ordering kiosk', 'Kiosk', 'Elo 22" Touch', 'Elo', 899.99),
('43" Menu Screen', 'Large display for menu and allergen info', 'Display', 'Samsung 43" Smart TV', 'Samsung', 399.99),
('Network Switch', 'Ethernet network switch', 'Network', 'Cisco SG200', 'Cisco', 149.99),
('UPS Battery Backup', 'Uninterruptible power supply', 'Power', 'APC 1500VA', 'APC', 199.99),
('Security Camera', 'IP security camera', 'Security', 'Hikvision Dome', 'Hikvision', 89.99),
('Receipt Printer', 'Thermal receipt printer', 'Printer', 'Star TSP100', 'Star', 199.99),
('Cash Drawer', 'Electronic cash drawer', 'POS', 'M-S Cash Drawer', 'M-S', 149.99),
('Card Reader', 'Contactless payment terminal', 'POS', 'Verifone VX520', 'Verifone', 299.99);

-- Create software-hardware mappings
INSERT INTO public.software_hardware_mapping (software_module_id, hardware_item_id, is_required, quantity) 
SELECT 
  sm.id as software_module_id,
  hi.id as hardware_item_id,
  CASE 
    WHEN sm.name = 'SmartQ App' AND hi.name IN ('Android Tablet', 'QR Reader', 'Wi-Fi Router') THEN true
    WHEN sm.name = 'POS System' AND hi.name IN ('POS Terminal', 'Barcode Printer', 'Receipt Printer', 'Cash Drawer', 'Card Reader') THEN true
    WHEN sm.name = 'KMS (Kitchen Management System)' AND hi.name = '22" KMS Screen' THEN true
    WHEN sm.name = 'QR Ordering' AND hi.name IN ('QR Scanner Mount', 'Android Tablet') THEN true
    WHEN sm.name = 'Kiosk System' AND hi.name = '22" Touch Kiosk' THEN true
    WHEN sm.name = 'Allergen Display' AND hi.name = '43" Menu Screen' THEN true
    ELSE false
  END as is_required,
  CASE 
    WHEN sm.name = 'SmartQ App' AND hi.name = 'Android Tablet' THEN 2
    WHEN sm.name = 'SmartQ App' AND hi.name = 'QR Reader' THEN 1
    WHEN sm.name = 'SmartQ App' AND hi.name = 'Wi-Fi Router' THEN 1
    WHEN sm.name = 'POS System' AND hi.name = 'POS Terminal' THEN 1
    WHEN sm.name = 'POS System' AND hi.name = 'Barcode Printer' THEN 1
    WHEN sm.name = 'POS System' AND hi.name = 'Receipt Printer' THEN 1
    WHEN sm.name = 'POS System' AND hi.name = 'Cash Drawer' THEN 1
    WHEN sm.name = 'POS System' AND hi.name = 'Card Reader' THEN 1
    WHEN sm.name = 'KMS (Kitchen Management System)' AND hi.name = '22" KMS Screen' THEN 1
    WHEN sm.name = 'QR Ordering' AND hi.name = 'QR Scanner Mount' THEN 1
    WHEN sm.name = 'QR Ordering' AND hi.name = 'Android Tablet' THEN 1
    WHEN sm.name = 'Kiosk System' AND hi.name = '22" Touch Kiosk' THEN 1
    WHEN sm.name = 'Allergen Display' AND hi.name = '43" Menu Screen' THEN 1
    ELSE 1
  END as quantity
FROM public.software_modules sm
CROSS JOIN public.hardware_items hi
WHERE (
  (sm.name = 'SmartQ App' AND hi.name IN ('Android Tablet', 'QR Reader', 'Wi-Fi Router')) OR
  (sm.name = 'POS System' AND hi.name IN ('POS Terminal', 'Barcode Printer', 'Receipt Printer', 'Cash Drawer', 'Card Reader')) OR
  (sm.name = 'KMS (Kitchen Management System)' AND hi.name = '22" KMS Screen') OR
  (sm.name = 'QR Ordering' AND hi.name IN ('QR Scanner Mount', 'Android Tablet')) OR
  (sm.name = 'Kiosk System' AND hi.name = '22" Touch Kiosk') OR
  (sm.name = 'Allergen Display' AND hi.name = '43" Menu Screen')
); 