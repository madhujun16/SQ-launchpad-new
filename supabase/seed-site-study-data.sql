-- Seed data for sites where Site Study step is completed
-- This script populates the sites table with comprehensive site study data

-- Update existing sites with status 'site_study_done' to include comprehensive site study data
UPDATE sites 
SET 
  -- Infrastructure Assessment data
  counters = CASE 
    WHEN name LIKE '%JLR%' THEN 4
    WHEN name LIKE '%Peabody%' THEN 6
    WHEN name LIKE '%Baxter%' THEN 3
    ELSE 4
  END,
  
  floor_plan = CASE 
    WHEN name LIKE '%JLR%' THEN 'yes'
    WHEN name LIKE '%Peabody%' THEN 'yes'
    WHEN name LIKE '%Baxter%' THEN 'pending'
    ELSE 'yes'
  END,
  
  meal_sessions = CASE 
    WHEN name LIKE '%JLR%' THEN '["Breakfast", "Lunch", "Dinner"]'
    WHEN name LIKE '%Peabody%' THEN '["Breakfast", "Lunch", "Dinner", "Evening"]'
    WHEN name LIKE '%Baxter%' THEN '["Breakfast", "Lunch"]'
    ELSE '["Breakfast", "Lunch", "Dinner"]'
  END,
  
  -- Software Scoping data
  smartq_solutions = CASE 
    WHEN name LIKE '%JLR%' THEN '["Order Management", "Payment Processing", "Inventory Tracking", "Analytics Dashboard"]'
    WHEN name LIKE '%Peabody%' THEN '["Order Management", "Payment Processing", "Kitchen Display", "Customer Feedback"]'
    WHEN name LIKE '%Baxter%' THEN '["Order Management", "Payment Processing", "Inventory Tracking"]'
    ELSE '["Order Management", "Payment Processing"]'
  END,
  
  network_requirements = CASE 
    WHEN name LIKE '%JLR%' THEN 'High-speed internet connection required, minimum 100Mbps bandwidth, secure network with VLAN segmentation'
    WHEN name LIKE '%Peabody%' THEN 'High-speed internet connection required, minimum 200Mbps bandwidth, redundant connections for business continuity'
    WHEN name LIKE '%Baxter%' THEN 'Standard internet connection required, minimum 50Mbps bandwidth, basic security measures'
    ELSE 'High-speed internet connection required, minimum 100Mbps bandwidth'
  END,
  
  -- Hardware Scoping data
  additional_hardware = CASE 
    WHEN name LIKE '%JLR%' THEN '["POS Terminals", "Receipt Printers", "Barcode Scanners", "Cash Drawers", "Kitchen Display Screens"]'
    WHEN name LIKE '%Peabody%' THEN '["POS Terminals", "Receipt Printers", "Barcode Scanners", "Self-Service Kiosks", "Digital Menu Boards"]'
    WHEN name LIKE '%Baxter%' THEN '["POS Terminals", "Receipt Printers", "Barcode Scanners"]'
    ELSE '["POS Terminals", "Receipt Printers", "Barcode Scanners"]'
  END,
  
  power_requirements = CASE 
    WHEN name LIKE '%JLR%' THEN 'Standard 230V power outlets, backup power recommended, surge protection for all equipment'
    WHEN name LIKE '%Peabody%' THEN 'Standard 230V power outlets, backup power required, dedicated circuits for kitchen equipment'
    WHEN name LIKE '%Baxter%' THEN 'Standard 230V power outlets, basic surge protection recommended'
    ELSE 'Standard 230V power outlets, backup power recommended'
  END,
  
  -- Site Notes and Analysis
  notes = CASE 
    WHEN name LIKE '%JLR%' THEN 'Site is ready for deployment. All infrastructure requirements have been assessed. High-traffic location with modern facilities.'
    WHEN name LIKE '%Peabody%' THEN 'Site requires some infrastructure upgrades before deployment. Kitchen area needs electrical work. High potential for digital transformation.'
    WHEN name LIKE '%Baxter%' THEN 'Site is suitable for basic deployment. Limited space for additional equipment. Standard setup recommended.'
    ELSE 'Site assessment completed. Standard deployment package recommended.'
  END,
  
  description = CASE 
    WHEN name LIKE '%JLR%' THEN 'Proceed with hardware procurement and software installation. Site has excellent infrastructure and is ready for advanced SmartQ solutions.'
    WHEN name LIKE '%Peabody%' THEN 'Infrastructure upgrades required before deployment. Focus on kitchen electrical work and digital signage installation.'
    WHEN name LIKE '%Baxter%' THEN 'Proceed with standard deployment package. Site suitable for basic SmartQ solutions with potential for future expansion.'
    ELSE 'Standard deployment recommended. Site assessment completed successfully.'
  END,
  
  -- Update timestamp
  updated_at = NOW()
WHERE status = 'site_study_done';

-- Insert sample stakeholders for sites with completed site studies
INSERT INTO site_stakeholders (site_id, name, role, email, phone, organization, created_at, updated_at)
SELECT 
  s.id,
  CASE 
    WHEN s.name LIKE '%JLR%' THEN 'Sarah Johnson'
    WHEN s.name LIKE '%Peabody%' THEN 'Mike Thompson'
    WHEN s.name LIKE '%Baxter%' THEN 'Emma Wilson'
    ELSE 'John Smith'
  END,
  'Site Manager',
  CASE 
    WHEN s.name LIKE '%JLR%' THEN 'sarah.johnson@company.com'
    WHEN s.name LIKE '%Peabody%' THEN 'mike.thompson@company.com'
    WHEN s.name LIKE '%Baxter%' THEN 'emma.wilson@company.com'
    ELSE 'john.smith@company.com'
  END,
  CASE 
    WHEN s.name LIKE '%JLR%' THEN '+44 20 7123 4567'
    WHEN s.name LIKE '%Peabody%' THEN '+44 20 7123 4568'
    WHEN s.name LIKE '%Baxter%' THEN '+44 20 7123 4569'
    ELSE '+44 20 7123 4570'
  END,
  CASE 
    WHEN s.name LIKE '%JLR%' THEN 'JLR Group'
    WHEN s.name LIKE '%Peabody%' THEN 'Peabody Trust'
    WHEN s.name LIKE '%Baxter%' THEN 'Baxter Health'
    ELSE 'Company Ltd'
  END,
  NOW(),
  NOW()
FROM sites s
WHERE s.status = 'site_study_done'
AND NOT EXISTS (
  SELECT 1 FROM site_stakeholders ss WHERE ss.site_id = s.id
);

-- Insert additional stakeholders for larger sites
INSERT INTO site_stakeholders (site_id, name, role, email, phone, organization, created_at, updated_at)
SELECT 
  s.id,
  CASE 
    WHEN s.name LIKE '%JLR%' THEN 'David Brown'
    WHEN s.name LIKE '%Peabody%' THEN 'Lisa Chen'
    WHEN s.name LIKE '%Baxter%' THEN 'Alex Rodriguez'
    ELSE 'Jane Doe'
  END,
  'Operations Coordinator',
  CASE 
    WHEN s.name LIKE '%JLR%' THEN 'david.brown@company.com'
    WHEN s.name LIKE '%Peabody%' THEN 'lisa.chen@company.com'
    WHEN s.name LIKE '%Baxter%' THEN 'alex.rodriguez@company.com'
    ELSE 'jane.doe@company.com'
  END,
  CASE 
    WHEN s.name LIKE '%JLR%' THEN '+44 20 7123 4571'
    WHEN s.name LIKE '%Peabody%' THEN '+44 20 7123 4572'
    WHEN s.name LIKE '%Baxter%' THEN '+44 20 7123 4573'
    ELSE '+44 20 7123 4574'
  END,
  CASE 
    WHEN s.name LIKE '%JLR%' THEN 'JLR Group'
    WHEN s.name LIKE '%Peabody%' THEN 'Peabody Trust'
    WHEN s.name LIKE '%Baxter%' THEN 'Baxter Health'
    ELSE 'Company Ltd'
  END,
  NOW(),
  NOW()
FROM sites s
WHERE s.status = 'site_study_done'
AND s.name IN ('JLR Whitley', 'Peabody Trust - Central London', 'Baxter Health - Manchester')
AND NOT EXISTS (
  SELECT 1 FROM site_stakeholders ss2 
  WHERE ss2.site_id = s.id 
  AND ss2.role = 'Operations Coordinator'
);

-- Update site study completion dates
UPDATE sites 
SET 
  site_study_date = CASE 
    WHEN name LIKE '%JLR%' THEN '2025-01-15'
    WHEN name LIKE '%Peabody%' THEN '2025-01-20'
    WHEN name LIKE '%Baxter%' THEN '2025-01-25'
    ELSE '2025-01-30'
  END
WHERE status = 'site_study_done';

-- Verify the updates
SELECT 
  id,
  name,
  status,
  counters,
  floor_plan,
  meal_sessions,
  smartq_solutions,
  network_requirements,
  additional_hardware,
  power_requirements,
  notes,
  description,
  site_study_date,
  updated_at
FROM sites 
WHERE status = 'site_study_done'
ORDER BY name;
