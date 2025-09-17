-- Fix Organizations and Sites Data Migration
-- This script creates proper organizations and links existing sites to them

-- Step 1: Create the missing organizations that sites reference
-- First, let's create the organizations and get their IDs
INSERT INTO public.organizations (name, description, sector, unit_code, created_at, updated_at) VALUES
-- ASDA organization
('ASDA Stores Limited', 'British supermarket chain owned by Walmart', 'Retail', 'ASDA', NOW(), NOW()),
-- Tesco organization  
('Tesco PLC', 'British multinational grocery and general merchandise retailer', 'Retail', 'TESCO', NOW(), NOW()),
-- Sainsbury organization
('J Sainsbury PLC', 'British supermarket chain', 'Retail', 'SAINS', NOW(), NOW()),
-- Morrisons organization
('Wm Morrison Supermarkets PLC', 'British supermarket chain', 'Retail', 'MORR', NOW(), NOW()),
-- Waitrose organization
('Waitrose & Partners', 'British supermarket chain owned by John Lewis Partnership', 'Retail', 'WAIT', NOW(), NOW()),
-- Marks & Spencer organization
('Marks & Spencer Group PLC', 'British multinational retailer', 'Retail', 'M&S', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Step 2: Update sites to link them to proper organizations
-- Update ASDA sites
UPDATE public.sites 
SET organization_id = (SELECT id FROM public.organizations WHERE name = 'ASDA Stores Limited' LIMIT 1),
    updated_at = NOW()
WHERE organization_name = 'ASDA' AND organization_id IS NULL;

-- Update Tesco sites  
UPDATE public.sites 
SET organization_id = (SELECT id FROM public.organizations WHERE name = 'Tesco PLC' LIMIT 1),
    updated_at = NOW()
WHERE organization_name = 'Tesco' AND organization_id IS NULL;

-- Update Sainsbury sites
UPDATE public.sites 
SET organization_id = (SELECT id FROM public.organizations WHERE name = 'J Sainsbury PLC' LIMIT 1),
    updated_at = NOW()
WHERE organization_name = 'Sainsbury' AND organization_id IS NULL;

-- Update Morrisons sites
UPDATE public.sites 
SET organization_id = (SELECT id FROM public.organizations WHERE name = 'Wm Morrison Supermarkets PLC' LIMIT 1),
    updated_at = NOW()
WHERE organization_name = 'Morrisons' AND organization_id IS NULL;

-- Update Waitrose sites
UPDATE public.sites 
SET organization_id = (SELECT id FROM public.organizations WHERE name = 'Waitrose & Partners' LIMIT 1),
    updated_at = NOW()
WHERE organization_name = 'Waitrose' AND organization_id IS NULL;

-- Update Marks & Spencer sites
UPDATE public.sites 
SET organization_id = (SELECT id FROM public.organizations WHERE name = 'Marks & Spencer Group PLC' LIMIT 1),
    updated_at = NOW()
WHERE organization_name = 'Marks & Spencer' AND organization_id IS NULL;

-- Step 3: Verify the updates
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

-- Step 4: Show organization statistics
SELECT 
    o.name as organization_name,
    o.sector,
    COUNT(s.id) as site_count
FROM public.organizations o
LEFT JOIN public.sites s ON o.id = s.organization_id AND s.is_archived = false
GROUP BY o.id, o.name, o.sector
ORDER BY site_count DESC, o.name;
