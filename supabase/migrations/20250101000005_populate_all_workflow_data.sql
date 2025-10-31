-- Migration: Populate All Workflow Tables with Data
-- Description: Populate ALL workflow tables based on current site statuses
-- Date: 2025-01-01
-- Author: System

BEGIN;

-- Helper functions removed - using direct CASE statements instead

-- 1. Populate site_scoping_data if it doesn't exist or is empty
INSERT INTO public.site_scoping_data (site_id, selected_software, selected_hardware, status, submitted_at, approved_at, cost_summary, created_at, updated_at)
SELECT 
    s.id,
    CASE WHEN s.status IN ('scoping_done', 'approved', 'procurement_done', 'deployed', 'live') THEN
        '[{"id": "pos-system", "name": "POS System", "quantity": 1}, {"id": "kiosk-software", "name": "Kiosk Software", "quantity": 1}, {"id": "inventory-management", "name": "Inventory Management", "quantity": 1}]'::jsonb
    ELSE '[]'::jsonb END,
    CASE WHEN s.status IN ('scoping_done', 'approved', 'procurement_done', 'deployed', 'live') THEN
        '[{"id": "tablet", "name": "POS Tablet", "quantity": 2}, {"id": "card-reader", "name": "Card Payment Terminal", "quantity": 1}, {"id": "printer", "name": "Receipt Printer", "quantity": 1}]'::jsonb
    ELSE '[]'::jsonb END,
    CASE WHEN s.status IN ('approved', 'procurement_done', 'deployed', 'live') THEN 'approved'
         WHEN s.status = 'scoping_done' THEN 'submitted'
         ELSE 'pending' END,
    CASE WHEN s.status IN ('scoping_done', 'approved', 'procurement_done', 'deployed', 'live') THEN s.updated_at ELSE NULL END,
    CASE WHEN s.status IN ('approved', 'procurement_done', 'deployed', 'live') THEN s.updated_at ELSE NULL END,
    CASE WHEN s.status IN ('scoping_done', 'approved', 'procurement_done', 'deployed', 'live') THEN
        '{"hardwareCost": 1500, "softwareSetupCost": 500, "installationCost": 300, "contingencyCost": 345, "totalCapex": 2645, "monthlySoftwareFees": 200, "maintenanceCost": 100, "totalMonthlyOpex": 300, "totalInvestment": 6245}'::jsonb
    ELSE '{"hardwareCost": 0, "softwareSetupCost": 0, "installationCost": 0, "contingencyCost": 0, "totalCapex": 0, "monthlySoftwareFees": 0, "maintenanceCost": 0, "totalMonthlyOpex": 0, "totalInvestment": 0}'::jsonb END,
    s.created_at,
    s.updated_at
FROM public.sites s
WHERE NOT EXISTS (SELECT 1 FROM public.site_scoping_data ssd WHERE ssd.site_id = s.id);

-- 2. Populate site_procurement_items with realistic hardware
INSERT INTO public.site_procurement_items (site_id, item_type, category, item_name, description, quantity, unit_cost, total_cost, supplier, procurement_status, order_date, delivery_date, installation_date)
SELECT 
    s.id,
    'hardware',
    'tablet',
    'Samsung Galaxy Tab A8 POS Tablet',
    'Professional POS tablet with touchscreen, case, and stand',
    CASE WHEN s.criticality_level = 'high' THEN 3 ELSE 2 END,
    CASE WHEN s.organization_name = 'ASDA' THEN 299.99 
         WHEN s.organization_name = 'Tesco' THEN 279.99 
         WHEN s.organization_name = 'Sainsbury' THEN 319.99 
         WHEN s.organization_name = 'Morrisons' THEN 295.99
         ELSE 299.99 END,
    (CASE WHEN s.criticality_level = 'high' THEN 3 ELSE 2 END) * 
    (CASE WHEN s.organization_name = 'ASDA' THEN 299.99 
          WHEN s.organization_name = 'Tesco' THEN 279.99 
          WHEN s.organization_name = 'Sainsbury' THEN 319.99 
          WHEN s.organization_name = 'Morrisons' THEN 295.99
          ELSE 299.99 END),
    'Samsung Business Solutions',
    CASE s.status
        WHEN 'procurement_done' THEN 'installed'
        WHEN 'deployed' THEN 'installed'
        WHEN 'live' THEN 'installed'
        WHEN 'approved' THEN 'ordered'
        WHEN 'scoping_done' THEN 'ordered'
        ELSE 'pending'
    END,
    CASE WHEN s.status IN ('approved', 'procurement_done', 'deployed', 'live', 'scoping_done') 
         THEN (s.created_at::date + interval '7 days') ELSE NULL END,
    CASE WHEN s.status IN ('procurement_done', 'deployed', 'live') THEN (s.created_at::date + interval '21 days') ELSE NULL END,
    CASE WHEN s.status IN ('deployed', 'live') THEN (s.created_at::date + interval '28 days') ELSE NULL END
FROM public.sites s
WHERE s.status NOT IN ('site_created', 'Created') 
  AND NOT EXISTS (
    SELECT 1 FROM public.site_procurement_items spi 
    WHERE spi.site_id = s.id AND spi.item_name = 'Samsung Galaxy Tab A8 POS Tablet'
  );

-- Add Card Payment Terminals
INSERT INTO public.site_procurement_items (site_id, item_type, category, item_name, description, quantity, unit_cost, total_cost, supplier, procurement_status, order_date, delivery_date, installation_date)
SELECT 
    s.id,
    'hardware',
    'payment_device',
    'Verifone V240M Card Payment Terminal',
    'EMV compliant contactless and chip card payment terminal',
    1,
    149.99,
    149.99,
    'Verifone Europe',
    CASE s.status
        WHEN 'procurement_done' THEN 'installed'
        WHEN 'deployed' THEN 'installed'
        WHEN 'live' THEN 'installed'
        WHEN 'approved' THEN 'ordered'
        WHEN 'scoping_done' THEN 'ordered'
        ELSE 'pending'
    END,
    CASE WHEN s.status IN ('approved', 'procurement_done', 'deployed', 'live', 'scoping_done') 
         THEN (s.created_at::date + interval '7 days') ELSE NULL END,
    CASE WHEN s.status IN ('procurement_done', 'deployed', 'live') THEN (s.created_at::date + interval '21 days') ELSE NULL END,
    CASE WHEN s.status IN ('deployed', 'live') THEN (s.created_at::date + interval '28 days') ELSE NULL END
FROM public.sites s
WHERE s.status NOT IN ('site_created', 'Created') 
  AND NOT EXISTS (
    SELECT 1 FROM public.site_procurement_items spi 
    WHERE spi.site_id = s.id AND spi.item_name = 'Verifone V240M Card Payment Terminal'
  );

-- Add Receipt Printers
INSERT INTO public.site_procurement_items (site_id, item_type, category, item_name, description, quantity, unit_cost, total_cost, supplier, procurement_status, order_date, delivery_date, installation_date)
SELECT 
    s.id,
    'hardware',
    'printer',
    'Epson TM-T88VI Receipt Printer',
    'Thermal receipt printer with USB and Ethernet connectivity',
    CASE WHEN s.organization_name = 'Sainsbury' THEN 2 ELSE 1 END,
    249.99,
    249.99 * (CASE WHEN s.organization_name = 'Sainsbury' THEN 2 ELSE 1 END),
    'Epson UK',
    CASE s.status
        WHEN 'procurement_done' THEN 'installed'
        WHEN 'deployed' THEN 'installed'
        WHEN 'live' THEN 'installed'
        WHEN 'approved' THEN 'ordered'
        WHEN 'scoping_done' THEN 'ordered'
        ELSE 'pending'
    END,
    CASE WHEN s.status IN ('approved', 'procurement_done', 'deployed', 'live', 'scoping_done') 
         THEN (s.created_at::date + interval '7 days') ELSE NULL END,
    CASE WHEN s.status IN ('procurement_done', 'deployed', 'live') THEN (s.created_at::date + interval '21 days') ELSE NULL END,
    CASE WHEN s.status IN ('deployed', 'live') THEN (s.created_at::date + interval '28 days') ELSE NULL END
FROM public.sites s
WHERE s.status NOT IN ('site_created', 'Created') 
  AND NOT EXISTS (
    SELECT 1 FROM public.site_procurement_items spi 
    WHERE spi.site_id = s.id AND spi.item_name = 'Epson TM-T88VI Receipt Printer'
  );

-- Add Software Licenses
INSERT INTO public.site_procurement_items (site_id, item_type, category, item_name, description, quantity, unit_cost, total_cost, supplier, procurement_status, order_date, delivery_date, installation_date)
SELECT 
    s.id,
    'software',
    'pos_license',
    'SmartQ POS System License',
    'Annual software license for POS system including updates and support',
    1,
    1200.00,
    1200.00,
    'SmartQ Technologies',
    CASE s.status
        WHEN 'procurement_done' THEN 'installed'
        WHEN 'deployed' THEN 'installed'
        WHEN 'live' THEN 'installed'
        WHEN 'approved' THEN 'ordered'
        WHEN 'scoping_done' THEN 'ordered'
        ELSE 'pending'
    END,
    CASE WHEN s.status IN ('approved', 'procurement_done', 'deployed', 'live', 'scoping_done') 
         THEN (s.created_at::date + interval '3 days') ELSE NULL END,
    NULL, -- Software is virtual delivery
    CASE WHEN s.status IN ('approved', 'procurement_done', 'deployed', 'live', 'scoping_done') THEN (s.created_at::date + interval '14 days') ELSE NULL END
FROM public.sites s
WHERE s.status NOT IN ('site_created', 'Created') 
  AND NOT EXISTS (
    SELECT 1 FROM public.site_procurement_items spi 
    WHERE spi.site_id = s.id AND spi.item_name = 'SmartQ POS System License'
  );

-- 3. Populate site_deployment_status
INSERT INTO public.site_deployment_status (
    site_id, 
    deployment_status, 
    deployment_start_date, 
    deployment_end_date, 
    deployment_team,
    equipment_delivered, 
    equipment_installed, 
    equipment_tested, 
    equipment_live,
    connectivity_tested,
    performance_tested,
    security_tested,
    user_acceptance_completed,
    installation_checklist_completed,
    handover_documentation_completed,
    deployment_notes
)
SELECT 
    s.id,
    CASE s.status
        WHEN 'deployed' THEN 'completed'
        WHEN 'live' THEN 'completed'
        WHEN 'procurement_done' THEN 'scheduled'
        WHEN 'approved' THEN 'scheduled'
        ELSE 'scheduled'
    END,
    CASE WHEN s.status IN ('deployed', 'live') THEN (s.created_at::date + interval '21 days') ELSE NULL END,
    CASE WHEN s.status IN ('deployed', 'live') THEN (s.created_at::date + interval '28 days') ELSE NULL END,
    CASE WHEN s.status IN ('deployed', 'live') THEN 
        ('[{"name": "' || s.assigned_deployment_engineer || '", "role": "Lead Engineer"}, {"name": "Technician", "role": "Installation Specialist"}]')::jsonb
    ELSE '[]'::jsonb END,
    CASE WHEN s.status IN ('procurement_done', 'deployed', 'live') THEN true ELSE false END,
    CASE WHEN s.status IN ('deployed', 'live') THEN true ELSE false END,
    CASE WHEN s.status IN ('deployed', 'live') THEN true ELSE false END,
    s.status = 'live',
    CASE WHEN s.status IN ('deployed', 'live') THEN true ELSE false END,
    CASE WHEN s.status IN ('deployed', 'live') THEN true ELSE false END,
    CASE WHEN s.status IN ('deployed', 'live') THEN true ELSE false END,
    CASE WHEN s.status = 'live' THEN true ELSE false END,
    CASE WHEN s.status IN ('deployed', 'live') THEN true ELSE false END,
    CASE WHEN s.status IN ('deployed', 'live') THEN true ELSE false END,
    CASE WHEN s.status IN ('deployed', 'live') THEN 
        'Deployment completed successfully. All equipment installed, tested, and operational.'
    ELSE 'Deployment scheduled for ' || s.target_live_date::text END
FROM public.sites s
WHERE NOT EXISTS (SELECT 1 FROM public.site_deployment_status sds WHERE sds.site_id = s.id);

-- 4. Populate site_golive_status
INSERT INTO public.site_golive_status (
    site_id,
    go_live_status,
    go_live_date,
    actual_go_live_date,
    system_performance,
    support_mode,
    support_team_assigned,
    monitoring_enabled,
    alerting_configured,
    training_completed,
    handover_completed,
    go_live_notes
)
SELECT 
    s.id,
    CASE s.status
        WHEN 'live' THEN 'completed'
        WHEN 'deployed' THEN 'scheduled'
        ELSE 'scheduled'
    END,
    CASE WHEN s.status IN ('deployed', 'live') THEN s.target_live_date ELSE NULL END,
    CASE WHEN s.status = 'live' THEN s.target_live_date ELSE NULL END,
    CASE WHEN s.status = 'live' THEN 
        '{"responseTime": "120ms", "uptime": "99.9%", "transactionSuccessRate": "98.5%"}'::jsonb
    ELSE '{}'::jsonb END,
    CASE WHEN s.criticality_level = 'high' THEN 'dedicated'
         WHEN s.criticality_level = 'medium' THEN 'enhanced' 
         ELSE 'standard' END,
    CASE WHEN s.status IN ('deployed', 'live') THEN 
        ('[{"name": "' || s.assigned_ops_manager || '", "role": "Operations Manager"}, {"name": "Support Technician", "role": "Technical Support"}]')::jsonb
    ELSE '[]'::jsonb END,
    CASE WHEN s.status = 'live' THEN true ELSE false END,
    CASE WHEN s.status = 'live' THEN true ELSE false END,
    CASE WHEN s.status IN ('deployed', 'live') THEN true ELSE false END,
    CASE WHEN s.status = 'live' THEN true ELSE false END,
    CASE WHEN s.status = 'live' THEN 
        'Site successfully went live on ' || s.target_live_date::text || '. All systems operational and monitored.'
    ELSE 'Go live scheduled for ' || s.target_live_date::text END
FROM public.sites s
WHERE NOT EXISTS (SELECT 1 FROM public.site_golive_status sgs WHERE sgs.site_id = s.id);

-- Functions removed - using direct CASE statements instead

COMMIT;

-- Verification queries (optional - can be removed in production)
-- Check data population
/*
SELECT 
    'site_scoping_data' as table_name, 
    COUNT(*) as record_count 
FROM public.site_scoping_data
UNION ALL
SELECT 'site_procurement_items', COUNT(*)
FROM public.site_procurement_items  
UNION ALL
SELECT 'site_deployment_status', COUNT(*)
FROM public.site_deployment_status
UNION ALL
SELECT 'site_golive_status', COUNT(*)
FROM public.site_golive_status;

-- Check sample procurement data
SELECT 
    site_id,
    item_name,
    procurement_status,
    order_date,
    delivery_date
FROM public.site_procurement_items 
WHERE site_id IN (SELECT id FROM sites WHERE status = 'approved' LIMIT 3);
*/
