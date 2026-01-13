-- Sample Data for Software and Hardware Tables
-- Run this after creating the categories

-- ============================================
-- SOFTWARE MODULES
-- ============================================

-- POS Systems Software Modules
INSERT INTO software_modules (name, description, category_id, license_fee, is_active) VALUES
('SmartQ POS Pro', 'Advanced POS system with inventory integration', 
 (SELECT id FROM software_categories WHERE name = 'POS Systems' LIMIT 1), 
 299.99, TRUE),
('QuickPOS Lite', 'Lightweight POS solution for small businesses', 
 (SELECT id FROM software_categories WHERE name = 'POS Systems' LIMIT 1), 
 149.99, TRUE),
('Enterprise POS Suite', 'Full-featured POS for large operations', 
 (SELECT id FROM software_categories WHERE name = 'POS Systems' LIMIT 1), 
 599.99, TRUE),
('Mobile POS App', 'Mobile point of sale application', 
 (SELECT id FROM software_categories WHERE name = 'POS Systems' LIMIT 1), 
 99.99, TRUE)
ON DUPLICATE KEY UPDATE name=name;

-- Inventory Management Software Modules
INSERT INTO software_modules (name, description, category_id, license_fee, is_active) VALUES
('StockMaster Pro', 'Comprehensive inventory management system', 
 (SELECT id FROM software_categories WHERE name = 'Inventory Management' LIMIT 1), 
 199.99, TRUE),
('Inventory Tracker', 'Real-time inventory tracking solution', 
 (SELECT id FROM software_categories WHERE name = 'Inventory Management' LIMIT 1), 
 129.99, TRUE),
('Warehouse Manager', 'Advanced warehouse and stock management', 
 (SELECT id FROM software_categories WHERE name = 'Inventory Management' LIMIT 1), 
 349.99, TRUE),
('Stock Alert System', 'Automated inventory alerts and notifications', 
 (SELECT id FROM software_categories WHERE name = 'Inventory Management' LIMIT 1), 
 79.99, TRUE)
ON DUPLICATE KEY UPDATE name=name;

-- Payment Processing Software Modules
INSERT INTO software_modules (name, description, category_id, license_fee, is_active) VALUES
('PayGateway Pro', 'Secure payment processing gateway', 
 (SELECT id FROM software_categories WHERE name = 'Payment Processing' LIMIT 1), 
 149.99, TRUE),
('MultiPay Processor', 'Multi-payment method processor', 
 (SELECT id FROM software_categories WHERE name = 'Payment Processing' LIMIT 1), 
 199.99, TRUE),
('Contactless Pay', 'NFC and contactless payment solution', 
 (SELECT id FROM software_categories WHERE name = 'Payment Processing' LIMIT 1), 
 179.99, TRUE),
('Payment Analytics', 'Payment processing analytics and reporting', 
 (SELECT id FROM software_categories WHERE name = 'Payment Processing' LIMIT 1), 
 99.99, TRUE)
ON DUPLICATE KEY UPDATE name=name;

-- ============================================
-- HARDWARE ITEMS
-- ============================================

-- Tablet Hardware Items
INSERT INTO hardware_items (name, description, category_id, subcategory, manufacturer, configuration_notes, unit_cost, support_type, support_cost, is_active) VALUES
('iPad Pro 12.9" 256GB', 'Apple iPad Pro for kiosk and POS use', 
 (SELECT id FROM hardware_categories WHERE name = 'Tablets' LIMIT 1),
 'iPad', 'Apple', 'Requires protective case and mounting bracket', 
 1099.99, 'Warranty', 99.99, TRUE),
('iPad Air 10.9" 256GB', 'Apple iPad Air for mobile POS', 
 (SELECT id FROM hardware_categories WHERE name = 'Tablets' LIMIT 1),
 'iPad', 'Apple', 'Includes screen protector', 
 749.99, 'Warranty', 79.99, TRUE),
('Samsung Galaxy Tab S9', 'Android tablet for kiosk displays', 
 (SELECT id FROM hardware_categories WHERE name = 'Tablets' LIMIT 1),
 'Android Tablet', 'Samsung', 'Requires custom kiosk software', 
 899.99, 'Extended Warranty', 89.99, TRUE),
('Microsoft Surface Pro 9', 'Windows tablet for POS systems', 
 (SELECT id FROM hardware_categories WHERE name = 'Tablets' LIMIT 1),
 'Windows Tablet', 'Microsoft', 'Includes keyboard and pen', 
 1299.99, 'Warranty', 149.99, TRUE),
('Fire HD 10 Tablet', 'Budget tablet for basic kiosk use', 
 (SELECT id FROM hardware_categories WHERE name = 'Tablets' LIMIT 1),
 'Budget Tablet', 'Amazon', 'Limited functionality, basic display only', 
 149.99, 'Basic Support', 29.99, TRUE)
ON DUPLICATE KEY UPDATE name=name;

-- Printer Hardware Items
INSERT INTO hardware_items (name, description, category_id, subcategory, manufacturer, configuration_notes, unit_cost, support_type, support_cost, is_active) VALUES
('Epson TM-T20III Receipt Printer', 'Thermal receipt printer for POS', 
 (SELECT id FROM hardware_categories WHERE name = 'Printers' LIMIT 1),
 'Receipt Printer', 'Epson', 'Requires USB or Ethernet connection', 
 249.99, 'Warranty', 39.99, TRUE),
('Star TSP143III Thermal Printer', 'Compact thermal receipt printer', 
 (SELECT id FROM hardware_categories WHERE name = 'Printers' LIMIT 1),
 'Receipt Printer', 'Star Micronics', 'USB and Bluetooth compatible', 
 199.99, 'Warranty', 34.99, TRUE),
('Zebra ZD420 Label Printer', 'Industrial label printer for inventory', 
 (SELECT id FROM hardware_categories WHERE name = 'Printers' LIMIT 1),
 'Label Printer', 'Zebra', 'Requires label stock and ribbon', 
 449.99, 'Extended Warranty', 59.99, TRUE),
('Brother QL-800 Label Printer', 'Desktop label printer', 
 (SELECT id FROM hardware_categories WHERE name = 'Printers' LIMIT 1),
 'Label Printer', 'Brother', 'Compact design for small spaces', 
 179.99, 'Warranty', 29.99, TRUE),
('HP LaserJet Pro M404dn', 'Network laser printer for reports', 
 (SELECT id FROM hardware_categories WHERE name = 'Printers' LIMIT 1),
 'Laser Printer', 'HP', 'Network-ready, high volume printing', 
 299.99, 'Warranty', 49.99, TRUE)
ON DUPLICATE KEY UPDATE name=name;

-- Scanner Hardware Items
INSERT INTO hardware_items (name, description, category_id, subcategory, manufacturer, configuration_notes, unit_cost, support_type, support_cost, is_active) VALUES
('Honeywell Voyager 1202g Barcode Scanner', '2D barcode scanner with USB', 
 (SELECT id FROM hardware_categories WHERE name = 'Scanners' LIMIT 1),
 'Barcode Scanner', 'Honeywell', 'USB and Bluetooth connectivity', 
 199.99, 'Warranty', 34.99, TRUE),
('Zebra DS2208 Barcode Scanner', 'Rugged handheld barcode scanner', 
 (SELECT id FROM hardware_categories WHERE name = 'Scanners' LIMIT 1),
 'Barcode Scanner', 'Zebra', 'Drop-resistant, IP54 rated', 
 249.99, 'Extended Warranty', 39.99, TRUE),
('Symbol LS2208 Barcode Scanner', 'Entry-level barcode scanner', 
 (SELECT id FROM hardware_categories WHERE name = 'Scanners' LIMIT 1),
 'Barcode Scanner', 'Symbol', 'Basic scanning functionality', 
 129.99, 'Warranty', 24.99, TRUE),
('Datalogic QuickScan QD2430', 'Presentation barcode scanner', 
 (SELECT id FROM hardware_categories WHERE name = 'Scanners' LIMIT 1),
 'Barcode Scanner', 'Datalogic', 'Hands-free scanning option', 
 179.99, 'Warranty', 29.99, TRUE),
('QR Code Scanner Module', 'Integrated QR code scanning module', 
 (SELECT id FROM hardware_categories WHERE name = 'Scanners' LIMIT 1),
 'QR Scanner', 'Generic', 'For integration into kiosk systems', 
 89.99, 'Basic Support', 19.99, TRUE)
ON DUPLICATE KEY UPDATE name=name;

-- ============================================
-- RECOMMENDATION RULES
-- ============================================
-- Links software categories to hardware categories
-- Defines which hardware is recommended/mandatory for each software category

-- POS Systems Recommendations
INSERT INTO recommendation_rules (software_category_id, hardware_category_id, is_mandatory, quantity) VALUES
-- POS Systems require Tablets (for POS terminals/kiosks)
((SELECT id FROM software_categories WHERE name = 'POS Systems' LIMIT 1),
 (SELECT id FROM hardware_categories WHERE name = 'Tablets' LIMIT 1),
 TRUE, 2),
-- POS Systems require Printers (for receipts)
((SELECT id FROM software_categories WHERE name = 'POS Systems' LIMIT 1),
 (SELECT id FROM hardware_categories WHERE name = 'Printers' LIMIT 1),
 TRUE, 1),
-- POS Systems recommend Scanners (for barcode scanning)
((SELECT id FROM software_categories WHERE name = 'POS Systems' LIMIT 1),
 (SELECT id FROM hardware_categories WHERE name = 'Scanners' LIMIT 1),
 FALSE, 1)
ON DUPLICATE KEY UPDATE quantity=quantity;

-- Inventory Management Recommendations
INSERT INTO recommendation_rules (software_category_id, hardware_category_id, is_mandatory, quantity) VALUES
-- Inventory Management requires Scanners (for inventory tracking)
((SELECT id FROM software_categories WHERE name = 'Inventory Management' LIMIT 1),
 (SELECT id FROM hardware_categories WHERE name = 'Scanners' LIMIT 1),
 TRUE, 2),
-- Inventory Management requires Printers (for labels)
((SELECT id FROM software_categories WHERE name = 'Inventory Management' LIMIT 1),
 (SELECT id FROM hardware_categories WHERE name = 'Printers' LIMIT 1),
 TRUE, 1),
-- Inventory Management can use Tablets (for mobile inventory management)
((SELECT id FROM software_categories WHERE name = 'Inventory Management' LIMIT 1),
 (SELECT id FROM hardware_categories WHERE name = 'Tablets' LIMIT 1),
 FALSE, 1)
ON DUPLICATE KEY UPDATE quantity=quantity;

-- Payment Processing Recommendations
INSERT INTO recommendation_rules (software_category_id, hardware_category_id, is_mandatory, quantity) VALUES
-- Payment Processing requires Tablets (for payment terminals)
((SELECT id FROM software_categories WHERE name = 'Payment Processing' LIMIT 1),
 (SELECT id FROM hardware_categories WHERE name = 'Tablets' LIMIT 1),
 TRUE, 1),
-- Payment Processing recommends Printers (for payment receipts)
((SELECT id FROM software_categories WHERE name = 'Payment Processing' LIMIT 1),
 (SELECT id FROM hardware_categories WHERE name = 'Printers' LIMIT 1),
 FALSE, 1)
ON DUPLICATE KEY UPDATE quantity=quantity;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check software modules count
SELECT 
    sc.name AS category_name,
    COUNT(sm.id) AS module_count
FROM software_categories sc
LEFT JOIN software_modules sm ON sc.id = sm.category_id
GROUP BY sc.id, sc.name
ORDER BY sc.name;

-- Check hardware items count
SELECT 
    hc.name AS category_name,
    COUNT(hi.id) AS item_count
FROM hardware_categories hc
LEFT JOIN hardware_items hi ON hc.id = hi.category_id
GROUP BY hc.id, hc.name
ORDER BY hc.name;

-- View all software modules with categories
SELECT 
    sm.id,
    sm.name AS module_name,
    sc.name AS category_name,
    sm.license_fee,
    sm.is_active
FROM software_modules sm
JOIN software_categories sc ON sm.category_id = sc.id
ORDER BY sc.name, sm.name;

-- View all hardware items with categories
SELECT 
    hi.id,
    hi.name AS item_name,
    hc.name AS category_name,
    hi.manufacturer,
    hi.unit_cost,
    hi.is_active
FROM hardware_items hi
JOIN hardware_categories hc ON hi.category_id = hc.id
ORDER BY hc.name, hi.name;

-- View all recommendation rules with category names
SELECT 
    rr.id,
    sc.name AS software_category,
    hc.name AS hardware_category,
    rr.is_mandatory,
    rr.quantity,
    CASE 
        WHEN rr.is_mandatory = TRUE THEN 'Required'
        ELSE 'Recommended'
    END AS requirement_type
FROM recommendation_rules rr
JOIN software_categories sc ON rr.software_category_id = sc.id
JOIN hardware_categories hc ON rr.hardware_category_id = hc.id
ORDER BY sc.name, rr.is_mandatory DESC, hc.name;

-- Summary of recommendation rules by software category
SELECT 
    sc.name AS software_category,
    COUNT(rr.id) AS total_recommendations,
    SUM(CASE WHEN rr.is_mandatory = TRUE THEN 1 ELSE 0 END) AS mandatory_count,
    SUM(CASE WHEN rr.is_mandatory = FALSE THEN 1 ELSE 0 END) AS optional_count
FROM software_categories sc
LEFT JOIN recommendation_rules rr ON sc.id = rr.software_category_id
GROUP BY sc.id, sc.name
ORDER BY sc.name;

