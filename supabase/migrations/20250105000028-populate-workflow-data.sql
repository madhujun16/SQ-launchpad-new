-- Populate workflow tables with sample data based on existing sites
-- This script creates realistic workflow data for testing

-- Insert scoping data for sites with status 'scoping_done' and beyond
INSERT INTO public.site_scoping (site_id, selected_software, selected_hardware, status, submitted_at, approved_at, approved_by, cost_summary, created_at, updated_at)
SELECT 
  s.id,
  COALESCE(
    (
      SELECT jsonb_agg(sm.id)
      FROM site_software_scoping sss
      JOIN software_modules sm ON sss.software_module_id = sm.id
      WHERE sss.site_id = s.id AND sss.is_selected = true
    ),
    '[]'::jsonb
  ),
  COALESCE(
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
    '[]'::jsonb
  ),
  CASE 
    WHEN s.status IN ('approved', 'procurement_done', 'deployed', 'live') THEN 'approved'
    WHEN s.status = 'scoping_done' THEN 'submitted'
    ELSE 'draft'
  END,
  CASE 
    WHEN s.status IN ('scoping_done', 'approved', 'procurement_done', 'deployed', 'live') THEN NOW() - INTERVAL '7 days'
    ELSE NULL
  END,
  CASE 
    WHEN s.status IN ('approved', 'procurement_done', 'deployed', 'live') THEN NOW() - INTERVAL '5 days'
    ELSE NULL
  END,
  NULL, -- approved_by (would be a real user ID in production)
  jsonb_build_object(
    'hardwareCost', COALESCE((
      SELECT SUM(hi.unit_cost * shs.quantity)
      FROM site_hardware_scoping shs
      JOIN hardware_items hi ON shs.hardware_item_id = hi.id
      WHERE shs.site_id = s.id
    ), 0),
    'softwareCost', COALESCE((
      SELECT SUM(sm.license_fee)
      FROM site_software_scoping sss
      JOIN software_modules sm ON sss.software_module_id = sm.id
      WHERE sss.site_id = s.id AND sss.is_selected = true
    ), 0),
    'totalCost', COALESCE((
      SELECT SUM(hi.unit_cost * shs.quantity)
      FROM site_hardware_scoping shs
      JOIN hardware_items hi ON shs.hardware_item_id = hi.id
      WHERE shs.site_id = s.id
    ), 0) + COALESCE((
      SELECT SUM(sm.license_fee)
      FROM site_software_scoping sss
      JOIN software_modules sm ON sss.software_module_id = sm.id
      WHERE sss.site_id = s.id AND sss.is_selected = true
    ), 0)
  ),
  NOW(),
  NOW()
FROM public.sites s
WHERE s.status IN ('scoping_done', 'approved', 'procurement_done', 'deployed', 'live')
  AND NOT EXISTS (SELECT 1 FROM site_scoping sc WHERE sc.site_id = s.id)
  -- Only include sites that have at least some scoping data
  AND (
    EXISTS (SELECT 1 FROM site_software_scoping sss WHERE sss.site_id = s.id AND sss.is_selected = true)
    OR EXISTS (SELECT 1 FROM site_hardware_scoping shs WHERE shs.site_id = s.id)
  );

-- Insert approval records for approved scoping
INSERT INTO public.site_approvals (site_id, scoping_id, approval_type, status, requested_by, requested_at, approved_by, approved_at, comments, approver_details, created_at, updated_at)
SELECT 
  s.id,
  sc.id,
  'scoping',
  'approved',
  NULL, -- requested_by (would be a real user ID in production)
  sc.submitted_at,
  NULL, -- approved_by (would be a real user ID in production)
  sc.approved_at,
  'Scoping approved for procurement',
  '{"name": "System Admin", "role": "Administrator", "department": "Operations"}'::jsonb,
  NOW(),
  NOW()
FROM public.sites s
JOIN site_scoping sc ON s.id = sc.site_id
WHERE s.status IN ('approved', 'procurement_done', 'deployed', 'live')
  AND sc.status = 'approved'
  AND NOT EXISTS (SELECT 1 FROM site_approvals sa WHERE sa.site_id = s.id);

-- Insert procurement items for sites with status 'procurement_done' and beyond
INSERT INTO public.site_procurement_items (site_id, hardware_item_id, item_type, item_name, quantity, unit_cost, total_cost, status, order_date, delivery_date, supplier, order_reference, created_at, updated_at)
SELECT 
  s.id,
  shs.hardware_item_id,
  'hardware',
  hi.name,
  shs.quantity,
  hi.unit_cost,
  hi.unit_cost * shs.quantity,
  CASE 
    WHEN s.status IN ('deployed', 'live') THEN 'installed'
    WHEN s.status = 'procurement_done' THEN 'delivered'
    ELSE 'ordered'
  END,
  CASE 
    WHEN s.status IN ('procurement_done', 'deployed', 'live') THEN NOW()::date - INTERVAL '10 days'
    ELSE NULL
  END,
  CASE 
    WHEN s.status IN ('procurement_done', 'deployed', 'live') THEN NOW()::date - INTERVAL '5 days'
    ELSE NULL
  END,
  CASE 
    WHEN hi.manufacturer = 'SmartQ Technologies' THEN 'SmartQ Supply Chain'
    WHEN hi.manufacturer = 'DisplayTech' THEN 'Display Solutions Ltd'
    WHEN hi.manufacturer = 'ScanTech' THEN 'Scanning Systems Inc'
    WHEN hi.manufacturer = 'PrintTech' THEN 'Print Solutions Co'
    WHEN hi.manufacturer = 'NetTech' THEN 'Network Equipment Ltd'
    ELSE 'General Hardware Supplier'
  END,
  'ORD-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(EXTRACT(DOY FROM NOW())::text, 3, '0') || '-' || LPAD((ROW_NUMBER() OVER (ORDER BY s.id, shs.hardware_item_id))::text, 4, '0'),
  NOW(),
  NOW()
FROM public.sites s
JOIN site_hardware_scoping shs ON s.id = shs.site_id
JOIN hardware_items hi ON shs.hardware_item_id = hi.id
WHERE s.status IN ('procurement_done', 'deployed', 'live')
  AND NOT EXISTS (
    SELECT 1 FROM site_procurement_items spi 
    WHERE spi.site_id = s.id AND spi.hardware_item_id = shs.hardware_item_id
  );

-- Insert software procurement items
INSERT INTO public.site_procurement_items (site_id, software_module_id, item_type, item_name, quantity, unit_cost, total_cost, status, order_date, delivery_date, supplier, order_reference, created_at, updated_at)
SELECT 
  s.id,
  sss.software_module_id,
  'software',
  sm.name,
  sss.quantity,
  sm.license_fee,
  sm.license_fee * sss.quantity,
  CASE 
    WHEN s.status IN ('deployed', 'live') THEN 'installed'
    WHEN s.status = 'procurement_done' THEN 'delivered'
    ELSE 'ordered'
  END,
  CASE 
    WHEN s.status IN ('procurement_done', 'deployed', 'live') THEN NOW()::date - INTERVAL '8 days'
    ELSE NULL
  END,
  CASE 
    WHEN s.status IN ('procurement_done', 'deployed', 'live') THEN NOW()::date - INTERVAL '3 days'
    ELSE NULL
  END,
  'SmartQ Software Licensing',
  'SW-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(EXTRACT(DOY FROM NOW())::text, 3, '0') || '-' || LPAD((ROW_NUMBER() OVER (ORDER BY s.id, sss.software_module_id))::text, 4, '0'),
  NOW(),
  NOW()
FROM public.sites s
JOIN site_software_scoping sss ON s.id = sss.site_id
JOIN software_modules sm ON sss.software_module_id = sm.id
WHERE s.status IN ('procurement_done', 'deployed', 'live')
  AND sss.is_selected = true
  AND NOT EXISTS (
    SELECT 1 FROM site_procurement_items spi 
    WHERE spi.site_id = s.id AND spi.software_module_id = sss.software_module_id
  );

-- Update assets table with sample assets based on procurement items
INSERT INTO public.assets (
  name, 
  type, 
  serial_number, 
  site_id, 
  site_name, 
  status, 
  location, 
  purchase_date, 
  warranty_expiry, 
  cost, 
  manufacturer, 
  model, 
  model_number, 
  service_cycle_months, 
  hardware_item_id, 
  created_at, 
  updated_at
)
SELECT 
  hi.name,
  COALESCE(hi.type::text, 'Hardware'),
  'SN-' || LPAD((ROW_NUMBER() OVER (PARTITION BY spi.site_id, spi.hardware_item_id ORDER BY spi.id))::text, 6, '0'),
  spi.site_id,
  s.name,
  CASE 
    WHEN s.status = 'live' THEN 'active'
    WHEN s.status = 'deployed' THEN 'installed'
    ELSE 'pending'
  END,
  s.location,
  CASE 
    WHEN s.status IN ('deployed', 'live') THEN NOW()::date - INTERVAL '10 days'
    ELSE NULL
  END,
  CASE 
    WHEN s.status IN ('deployed', 'live') THEN NOW()::date + INTERVAL '2 years'
    ELSE NULL
  END,
  spi.unit_cost,
  hi.manufacturer,
  hi.model,
  CASE 
    WHEN hi.name LIKE '%POS Terminal%' THEN 'SQ-POS-' || LPAD((ROW_NUMBER() OVER (PARTITION BY spi.site_id, spi.hardware_item_id ORDER BY spi.id))::text, 3, '0')
    WHEN hi.name LIKE '%Display Screen%' THEN 'SQ-DISP-' || LPAD((ROW_NUMBER() OVER (PARTITION BY spi.site_id, spi.hardware_item_id ORDER BY spi.id))::text, 3, '0')
    WHEN hi.name LIKE '%Scanner%' THEN 'SQ-SCAN-' || LPAD((ROW_NUMBER() OVER (PARTITION BY spi.site_id, spi.hardware_item_id ORDER BY spi.id))::text, 3, '0')
    WHEN hi.name LIKE '%Printer%' THEN 'SQ-PRINT-' || LPAD((ROW_NUMBER() OVER (PARTITION BY spi.site_id, spi.hardware_item_id ORDER BY spi.id))::text, 3, '0')
    WHEN hi.name LIKE '%Switch%' THEN 'SQ-NET-' || LPAD((ROW_NUMBER() OVER (PARTITION BY spi.site_id, spi.hardware_item_id ORDER BY spi.id))::text, 3, '0')
    ELSE 'SQ-HW-' || LPAD((ROW_NUMBER() OVER (PARTITION BY spi.site_id, spi.hardware_item_id ORDER BY spi.id))::text, 3, '0')
  END,
  CASE 
    WHEN hi.name LIKE '%POS Terminal%' THEN 24
    WHEN hi.name LIKE '%Display Screen%' THEN 36
    WHEN hi.name LIKE '%Scanner%' THEN 18
    WHEN hi.name LIKE '%Printer%' THEN 12
    WHEN hi.name LIKE '%Switch%' THEN 60
    ELSE 24
  END,
  spi.hardware_item_id,
  NOW(),
  NOW()
FROM public.site_procurement_items spi
JOIN hardware_items hi ON spi.hardware_item_id = hi.id
JOIN public.sites s ON spi.site_id = s.id
WHERE spi.item_type = 'hardware'
  AND spi.status IN ('delivered', 'installed')
  AND NOT EXISTS (
    SELECT 1 FROM assets a 
    WHERE a.site_id = spi.site_id AND a.hardware_item_id = spi.hardware_item_id
  );

-- Add comments
COMMENT ON TABLE public.site_scoping IS 'Site scoping data including selected software and hardware';
COMMENT ON TABLE public.site_approvals IS 'Approval workflow tracking for site operations';
COMMENT ON TABLE public.site_procurement_items IS 'Detailed procurement items tracking for sites';
COMMENT ON TABLE public.assets IS 'Individual hardware assets deployed at sites with tracking information';
