-- Simple Fix for Organizations and Sites
-- Run this directly in your Supabase SQL editor

-- Step 1: Create missing organizations (let database generate UUIDs)
INSERT INTO public.organizations (name, description, sector, unit_code, created_at, updated_at) VALUES
('ASDA Stores Limited', 'British supermarket chain owned by Walmart', 'Retail', 'ASDA', NOW(), NOW()),
('Tesco PLC', 'British multinational grocery and general merchandise retailer', 'Retail', 'TESCO', NOW(), NOW()),
('J Sainsbury PLC', 'British supermarket chain', 'Retail', 'SAINS', NOW(), NOW()),
('Wm Morrison Supermarkets PLC', 'British supermarket chain', 'Retail', 'MORR', NOW(), NOW()),
('Waitrose & Partners', 'British supermarket chain owned by John Lewis Partnership', 'Retail', 'WAIT', NOW(), NOW()),
('Marks & Spencer Group PLC', 'British multinational retailer', 'Retail', 'M&S', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Step 2: Link sites to organizations
UPDATE public.sites 
SET organization_id = (SELECT id FROM public.organizations WHERE name = 'ASDA Stores Limited' LIMIT 1),
    updated_at = NOW()
WHERE organization_name = 'ASDA' AND organization_id IS NULL;

UPDATE public.sites 
SET organization_id = (SELECT id FROM public.organizations WHERE name = 'Tesco PLC' LIMIT 1),
    updated_at = NOW()
WHERE organization_name = 'Tesco' AND organization_id IS NULL;

UPDATE public.sites 
SET organization_id = (SELECT id FROM public.organizations WHERE name = 'J Sainsbury PLC' LIMIT 1),
    updated_at = NOW()
WHERE organization_name = 'Sainsbury' AND organization_id IS NULL;

UPDATE public.sites 
SET organization_id = (SELECT id FROM public.organizations WHERE name = 'Wm Morrison Supermarkets PLC' LIMIT 1),
    updated_at = NOW()
WHERE organization_name = 'Morrisons' AND organization_id IS NULL;

UPDATE public.sites 
SET organization_id = (SELECT id FROM public.organizations WHERE name = 'Waitrose & Partners' LIMIT 1),
    updated_at = NOW()
WHERE organization_name = 'Waitrose' AND organization_id IS NULL;

UPDATE public.sites 
SET organization_id = (SELECT id FROM public.organizations WHERE name = 'Marks & Spencer Group PLC' LIMIT 1),
    updated_at = NOW()
WHERE organization_name = 'Marks & Spencer' AND organization_id IS NULL;

-- Step 3: Verify results
SELECT 
    s.name as site_name,
    s.organization_id,
    s.organization_name,
    o.name as org_name_from_table,
    o.sector,
    o.unit_code
FROM public.sites s
LEFT JOIN public.organizations o ON s.organization_id = o.id
WHERE s.is_archived = false
ORDER BY s.name;
