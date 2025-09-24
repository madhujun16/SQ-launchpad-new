-- Add sample software and hardware scoping data for existing sites
-- This script adds realistic scoping data for sites based on their status

-- First, ensure we have some software modules and hardware items
-- Insert sample software modules if they don't exist
INSERT INTO public.software_modules (id, name, description, category_id, license_fee, is_active, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'SmartQ POS System',
  'Core point-of-sale system for retail operations',
  (SELECT id FROM categories WHERE name = 'POS Systems' LIMIT 1),
  500.00,
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM software_modules WHERE name = 'SmartQ POS System');

INSERT INTO public.software_modules (id, name, description, category_id, license_fee, is_active, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Inventory Management',
  'Real-time inventory tracking and management',
  (SELECT id FROM categories WHERE name = 'Inventory' LIMIT 1),
  300.00,
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM software_modules WHERE name = 'Inventory Management');

INSERT INTO public.software_modules (id, name, description, category_id, license_fee, is_active, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Customer Analytics',
  'Customer behavior and sales analytics',
  (SELECT id FROM categories WHERE name = 'Analytics' LIMIT 1),
  200.00,
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM software_modules WHERE name = 'Customer Analytics');

-- Insert sample hardware items if they don't exist
INSERT INTO public.hardware_items (id, name, description, category_id, manufacturer, unit_cost, type, is_active, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'SmartQ POS Terminal',
  'Main POS terminal with touch screen',
  (SELECT id FROM categories WHERE name = 'POS Hardware' LIMIT 1),
  'SmartQ Technologies',
  1200.00,
  'POS Terminal',
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM hardware_items WHERE name = 'SmartQ POS Terminal');

INSERT INTO public.hardware_items (id, name, description, category_id, manufacturer, unit_cost, type, is_active, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Customer Display Screen',
  'Customer-facing display for transaction details',
  (SELECT id FROM categories WHERE name = 'Display Hardware' LIMIT 1),
  'DisplayTech',
  400.00,
  'Display Screen',
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM hardware_items WHERE name = 'Customer Display Screen');

INSERT INTO public.hardware_items (id, name, description, category_id, manufacturer, unit_cost, type, is_active, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Barcode Scanner',
  'Handheld barcode scanner for product scanning',
  (SELECT id FROM categories WHERE name = 'Scanning Hardware' LIMIT 1),
  'ScanTech',
  150.00,
  'Scanner',
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM hardware_items WHERE name = 'Barcode Scanner');

INSERT INTO public.hardware_items (id, name, description, category_id, manufacturer, unit_cost, type, is_active, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Receipt Printer',
  'Thermal receipt printer for transaction receipts',
  (SELECT id FROM categories WHERE name = 'Printing Hardware' LIMIT 1),
  'PrintTech',
  250.00,
  'Printer',
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM hardware_items WHERE name = 'Receipt Printer');

INSERT INTO public.hardware_items (id, name, description, category_id, manufacturer, unit_cost, type, is_active, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Network Switch',
  'Network connectivity switch for POS systems',
  (SELECT id FROM categories WHERE name = 'Network Hardware' LIMIT 1),
  'NetTech',
  300.00,
  'Connectivity',
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM hardware_items WHERE name = 'Network Switch');

-- Add software scoping for sites based on their status
-- Sites with status 'scoping_done' and beyond should have software scoping
INSERT INTO public.site_software_scoping (id, site_id, software_module_id, is_selected, quantity, notes, scoped_by, scoped_at, is_frozen, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  s.id,
  sm.id,
  true,
  1,
  'Core POS system required for all sites',
  NULL,
  NOW(),
  false,
  NOW(),
  NOW()
FROM public.sites s
CROSS JOIN public.software_modules sm
WHERE s.status IN ('scoping_done', 'approved', 'procurement_done', 'deployed', 'live')
  AND sm.name = 'SmartQ POS System'
  AND NOT EXISTS (
    SELECT 1 FROM site_software_scoping sss 
    WHERE sss.site_id = s.id AND sss.software_module_id = sm.id
  );

INSERT INTO public.site_software_scoping (id, site_id, software_module_id, is_selected, quantity, notes, scoped_by, scoped_at, is_frozen, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  s.id,
  sm.id,
  true,
  1,
  'Inventory management for retail operations',
  NULL,
  NOW(),
  false,
  NOW(),
  NOW()
FROM public.sites s
CROSS JOIN public.software_modules sm
WHERE s.status IN ('scoping_done', 'approved', 'procurement_done', 'deployed', 'live')
  AND sm.name = 'Inventory Management'
  AND NOT EXISTS (
    SELECT 1 FROM site_software_scoping sss 
    WHERE sss.site_id = s.id AND sss.software_module_id = sm.id
  );

INSERT INTO public.site_software_scoping (id, site_id, software_module_id, is_selected, quantity, notes, scoped_by, scoped_at, is_frozen, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  s.id,
  sm.id,
  CASE 
    WHEN s.criticality_level = 'high' THEN true
    ELSE false
  END,
  1,
  CASE 
    WHEN s.criticality_level = 'high' THEN 'Analytics required for high-criticality sites'
    ELSE 'Analytics optional for this site'
  END,
  NULL,
  NOW(),
  false,
  NOW(),
  NOW()
FROM public.sites s
CROSS JOIN public.software_modules sm
WHERE s.status IN ('scoping_done', 'approved', 'procurement_done', 'deployed', 'live')
  AND sm.name = 'Customer Analytics'
  AND NOT EXISTS (
    SELECT 1 FROM site_software_scoping sss 
    WHERE sss.site_id = s.id AND sss.software_module_id = sm.id
  );

-- Add hardware scoping for sites based on their status
-- Sites with status 'scoping_done' and beyond should have hardware scoping
INSERT INTO public.site_hardware_scoping (id, site_id, hardware_item_id, software_module_id, quantity, is_auto_suggested, is_custom, custom_name, notes, scoped_by, scoped_at, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  s.id,
  hi.id,
  sm.id,
  CASE 
    WHEN s.name LIKE '%ASDA%' THEN 3  -- ASDA sites get 3 terminals
    WHEN s.name LIKE '%Tesco%' THEN 2  -- Tesco sites get 2 terminals
    ELSE 2  -- Default to 2 terminals
  END,
  true,
  false,
  NULL,
  'Main POS terminals for site operations',
  NULL,
  NOW(),
  NOW(),
  NOW()
FROM public.sites s
CROSS JOIN public.hardware_items hi
CROSS JOIN public.software_modules sm
WHERE s.status IN ('scoping_done', 'approved', 'procurement_done', 'deployed', 'live')
  AND hi.name = 'SmartQ POS Terminal'
  AND sm.name = 'SmartQ POS System'
  AND NOT EXISTS (
    SELECT 1 FROM site_hardware_scoping shs 
    WHERE shs.site_id = s.id AND shs.hardware_item_id = hi.id
  );

INSERT INTO public.site_hardware_scoping (id, site_id, hardware_item_id, software_module_id, quantity, is_auto_suggested, is_custom, custom_name, notes, scoped_by, scoped_at, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  s.id,
  hi.id,
  sm.id,
  CASE 
    WHEN s.name LIKE '%ASDA%' THEN 3  -- ASDA sites get 3 displays
    WHEN s.name LIKE '%Tesco%' THEN 2  -- Tesco sites get 2 displays
    ELSE 2  -- Default to 2 displays
  END,
  true,
  false,
  NULL,
  'Customer display screens for transaction visibility',
  NULL,
  NOW(),
  NOW(),
  NOW()
FROM public.sites s
CROSS JOIN public.hardware_items hi
CROSS JOIN public.software_modules sm
WHERE s.status IN ('scoping_done', 'approved', 'procurement_done', 'deployed', 'live')
  AND hi.name = 'Customer Display Screen'
  AND sm.name = 'SmartQ POS System'
  AND NOT EXISTS (
    SELECT 1 FROM site_hardware_scoping shs 
    WHERE shs.site_id = s.id AND shs.hardware_item_id = hi.id
  );

INSERT INTO public.site_hardware_scoping (id, site_id, hardware_item_id, software_module_id, quantity, is_auto_suggested, is_custom, custom_name, notes, scoped_by, scoped_at, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  s.id,
  hi.id,
  sm.id,
  2,  -- 2 scanners per site
  true,
  false,
  NULL,
  'Barcode scanners for product scanning',
  NULL,
  NOW(),
  NOW(),
  NOW()
FROM public.sites s
CROSS JOIN public.hardware_items hi
CROSS JOIN public.software_modules sm
WHERE s.status IN ('scoping_done', 'approved', 'procurement_done', 'deployed', 'live')
  AND hi.name = 'Barcode Scanner'
  AND sm.name = 'Inventory Management'
  AND NOT EXISTS (
    SELECT 1 FROM site_hardware_scoping shs 
    WHERE shs.site_id = s.id AND shs.hardware_item_id = hi.id
  );

INSERT INTO public.site_hardware_scoping (id, site_id, hardware_item_id, software_module_id, quantity, is_auto_suggested, is_custom, custom_name, notes, scoped_by, scoped_at, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  s.id,
  hi.id,
  sm.id,
  CASE 
    WHEN s.name LIKE '%ASDA%' THEN 3  -- ASDA sites get 3 printers
    WHEN s.name LIKE '%Tesco%' THEN 2  -- Tesco sites get 2 printers
    ELSE 2  -- Default to 2 printers
  END,
  true,
  false,
  NULL,
  'Receipt printers for transaction receipts',
  NULL,
  NOW(),
  NOW(),
  NOW()
FROM public.sites s
CROSS JOIN public.hardware_items hi
CROSS JOIN public.software_modules sm
WHERE s.status IN ('scoping_done', 'approved', 'procurement_done', 'deployed', 'live')
  AND hi.name = 'Receipt Printer'
  AND sm.name = 'SmartQ POS System'
  AND NOT EXISTS (
    SELECT 1 FROM site_hardware_scoping shs 
    WHERE shs.site_id = s.id AND shs.hardware_item_id = hi.id
  );

INSERT INTO public.site_hardware_scoping (id, site_id, hardware_item_id, software_module_id, quantity, is_auto_suggested, is_custom, custom_name, notes, scoped_by, scoped_at, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  s.id,
  hi.id,
  sm.id,
  1,  -- 1 network switch per site
  true,
  false,
  NULL,
  'Network switch for POS system connectivity',
  NULL,
  NOW(),
  NOW(),
  NOW()
FROM public.sites s
CROSS JOIN public.hardware_items hi
CROSS JOIN public.software_modules sm
WHERE s.status IN ('scoping_done', 'approved', 'procurement_done', 'deployed', 'live')
  AND hi.name = 'Network Switch'
  AND sm.name = 'SmartQ POS System'
  AND NOT EXISTS (
    SELECT 1 FROM site_hardware_scoping shs 
    WHERE shs.site_id = s.id AND shs.hardware_item_id = hi.id
  );

-- Add procurement data for sites with status 'procurement_done' and beyond
INSERT INTO public.site_procurement (id, site_id, status, software_modules, hardware_items, summary, last_updated, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  s.id,
  CASE 
    WHEN s.status = 'procurement_done' THEN 'delivered'
    WHEN s.status IN ('deployed', 'live') THEN 'delivered'
    ELSE 'ordered'
  END,
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', sss.software_module_id,
        'name', sm.name,
        'quantity', sss.quantity,
        'license_fee', sm.license_fee
      )
    )
    FROM site_software_scoping sss
    JOIN software_modules sm ON sss.software_module_id = sm.id
    WHERE sss.site_id = s.id AND sss.is_selected = true
  ),
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', shs.hardware_item_id,
        'name', hi.name,
        'quantity', shs.quantity,
        'unit_cost', hi.unit_cost,
        'total_cost', hi.unit_cost * shs.quantity
      )
    )
    FROM site_hardware_scoping shs
    JOIN hardware_items hi ON shs.hardware_item_id = hi.id
    WHERE shs.site_id = s.id
  ),
  jsonb_build_object(
    'totalSoftwareModules', (
      SELECT COUNT(*) FROM site_software_scoping sss 
      WHERE sss.site_id = s.id AND sss.is_selected = true
    ),
    'totalHardwareItems', (
      SELECT COUNT(*) FROM site_hardware_scoping shs 
      WHERE shs.site_id = s.id
    ),
    'inProgress', 0,
    'completed', CASE 
      WHEN s.status IN ('procurement_done', 'deployed', 'live') THEN (
        SELECT COUNT(*) FROM site_hardware_scoping shs 
        WHERE shs.site_id = s.id
      )
      ELSE 0
    END
  ),
  NOW(),
  NOW(),
  NOW()
FROM public.sites s
WHERE s.status IN ('approved', 'procurement_done', 'deployed', 'live')
  AND NOT EXISTS (
    SELECT 1 FROM site_procurement sp WHERE sp.site_id = s.id
  );

-- Add deployment data for sites with status 'deployed' and 'live'
INSERT INTO public.site_deployments (id, site_id, status, start_date, end_date, assigned_engineer, notes, progress, timeline, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  s.id,
  CASE 
    WHEN s.status = 'live' THEN 'completed'
    WHEN s.status = 'deployed' THEN 'completed'
    ELSE 'scheduled'
  END,
  CASE 
    WHEN s.status IN ('deployed', 'live') THEN s.target_live_date::date - INTERVAL '7 days'
    ELSE s.target_live_date::date - INTERVAL '14 days'
  END,
  CASE 
    WHEN s.status IN ('deployed', 'live') THEN s.target_live_date::date
    ELSE s.target_live_date::date - INTERVAL '7 days'
  END,
  NULL, -- assigned_engineer
  CASE 
    WHEN s.status = 'live' THEN 'Deployment completed successfully. Site is now live.'
    WHEN s.status = 'deployed' THEN 'Hardware installed and tested. Ready for go-live.'
    ELSE 'Deployment scheduled based on procurement timeline.'
  END,
  jsonb_build_object(
    'overallProgress', CASE 
      WHEN s.status = 'live' THEN 100
      WHEN s.status = 'deployed' THEN 90
      ELSE 0
    END,
    'hardwareDelivered', CASE 
      WHEN s.status IN ('deployed', 'live') THEN 'completed'
      ELSE 'pending'
    END,
    'installation', CASE 
      WHEN s.status = 'live' THEN 'completed'
      WHEN s.status = 'deployed' THEN 'completed'
      ELSE 'pending'
    END,
    'testing', CASE 
      WHEN s.status = 'live' THEN 'completed'
      WHEN s.status = 'deployed' THEN 'completed'
      ELSE 'pending'
    END
  ),
  jsonb_build_object(
    'hardwareDelivery', CASE 
      WHEN s.status IN ('deployed', 'live') THEN (s.target_live_date::date - INTERVAL '10 days')::text
      ELSE ''
    END,
    'installationStart', CASE 
      WHEN s.status IN ('deployed', 'live') THEN (s.target_live_date::date - INTERVAL '7 days')::text
      ELSE ''
    END,
    'installationEnd', CASE 
      WHEN s.status IN ('deployed', 'live') THEN (s.target_live_date::date - INTERVAL '3 days')::text
      ELSE ''
    END,
    'testingStart', CASE 
      WHEN s.status IN ('deployed', 'live') THEN (s.target_live_date::date - INTERVAL '2 days')::text
      ELSE ''
    END,
    'testingEnd', CASE 
      WHEN s.status IN ('deployed', 'live') THEN (s.target_live_date::date - INTERVAL '1 day')::text
      ELSE ''
    END,
    'goLiveDate', CASE 
      WHEN s.status IN ('deployed', 'live') THEN s.target_live_date::text
      ELSE ''
    END
  ),
  NOW(),
  NOW()
FROM public.sites s
WHERE s.status IN ('procurement_done', 'deployed', 'live')
  AND NOT EXISTS (
    SELECT 1 FROM site_deployments sd WHERE sd.site_id = s.id
  );

-- Add comments
COMMENT ON TABLE public.site_software_scoping IS 'Software modules selected for each site during scoping phase';
COMMENT ON TABLE public.site_hardware_scoping IS 'Hardware items scoped for each site during scoping phase';
COMMENT ON TABLE public.site_procurement IS 'Procurement data for sites including software and hardware orders';
COMMENT ON TABLE public.site_deployments IS 'Deployment tracking for sites including progress and timeline';
