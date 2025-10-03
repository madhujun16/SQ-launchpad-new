-- Migration: Populate Workflow Tables for All Sites
-- Description: Create and populate all necessary workflow tables based on current site statuses
-- Date: 2025-01-01
-- Author: System

BEGIN;

-- Create site_scoping table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.site_scoping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    
    -- Software Selection
    selected_software JSONB DEFAULT '[]'::jsonb,
    
    -- Hardware Selection
    selected_hardware JSONB DEFAULT '[]'::jsonb,
    
    -- Status and metadata
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
    created_by UUID REFERENCES auth.users(id),
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    -- Additional configuration
    configuration_entries JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(site_id)
);

-- Create site_approvals table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.site_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    
    -- Approval Details
    approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    approver_id UUID REFERENCES auth.users(id),
    approver_name TEXT,
    approver_email TEXT,
    approved_date TIMESTAMPTZ,
    
    -- Comments and notes
    approver_comments TEXT,
    internal_notes TEXT,
    
    -- Approval Requirements
    requires_hardware_budget BOOLEAN DEFAULT false,
    requires_software_licenses BOOLEAN DEFAULT false,
    requires_team_assignment BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(site_id)
);

-- Create site_scoping_data table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.site_scoping_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    
    -- Hardware Requirements
    hardware_requirements JSONB DEFAULT '{}'::jsonb,
    
    -- Software Requirements
    software_requirements JSONB DEFAULT '{}'::jsonb,
    
    -- Kiosk Requirements
    kiosk_requirements JSONB DEFAULT '{}'::jsonb,
    
    -- POS Requirements
    pos_requirements JSONB DEFAULT '{}'::jsonb,
    
    -- Payment Requirements
    payment_requirements JSONB DEFAULT '{}'::jsonb,
    
    -- Location Details
    location_details JSONB DEFAULT '{}'::jsonb,
    
    -- Created By
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(site_id)
);

-- Create site_procurement_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.site_procurement_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    
    -- Item Details
    item_type TEXT NOT NULL, -- 'hardware', 'software', 'services'
    category TEXT NOT NULL,
    item_name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER DEFAULT 1,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    
    -- Supplier Information
    supplier TEXT,
    supplier_part_number TEXT,
    
    -- Procurement Status
    procurement_status TEXT DEFAULT 'pending' CHECK (procurement_status IN ('pending', 'ordered', 'received', 'installed', 'cancelled')),
    order_date TIMESTAMPTZ,
    delivery_date TIMESTAMPTZ,
    installation_date TIMESTAMPTZ,
    
    -- Delivery Details
    tracking_number TEXT,
    carrier TEXT,
    
    -- Additional Information
    warranty_period INTEGER, -- in months
    condition_upon_arrival TEXT,
    installation_progress TEXT,
    serial_number TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create site_deployment_status table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.site_deployment_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    
    -- Deployment Progress
    deployment_status TEXT DEFAULT 'scheduled' CHECK (deployment_status IN ('scheduled', 'in_progress', 'completed', 'failed', 'cancelled')),
    deployment_start_date TIMESTAMPTZ,
    deployment_end_date TIMESTAMPTZ,
    
    -- Team Assignment
    deployment_team JSONB DEFAULT '[]'::jsonb,
    on_site_coordinator UUID REFERENCES auth.users(id),
    
    -- Equipment Status
    equipment_delivered BOOLEAN DEFAULT false,
    equipment_installed BOOLEAN DEFAULT false,
    equipment_tested BOOLEAN DEFAULT false,
    equipment_live BOOLEAN DEFAULT false,
    
    -- Testing and Quality
    connectivity_tested BOOLEAN DEFAULT false,
    performance_tested BOOLEAN DEFAULT false,
    security_tested BOOLEAN DEFAULT false,
    user_acceptance_completed BOOLEAN DEFAULT false,
    
    -- Documentation
    installation_checklist_completed BOOLEAN DEFAULT false,
    handover_documentation_completed BOOLEAN DEFAULT false,
    photos_taken BOOLEAN DEFAULT false,
    completion_certificate_generated BOOLEAN DEFAULT false,
    
    -- Notes and Issues
    deployment_notes TEXT,
    issues_encountered TEXT,
    resolution_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(site_id)
);

-- Create site_golive_status table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.site_golive_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    
    -- Go Live Status
    go_live_status TEXT DEFAULT 'scheduled' CHECK (go_live_status IN ('scheduled', 'live', 'issues', 'rolled_back', 'completed')),
    go_live_date TIMESTAMPTZ,
    actual_go_live_date TIMESTAMPTZ,
    
    -- Performance Metrics
    system_performance JSONB DEFAULT '{}'::jsonb,
    
    -- Support Information
    support_mode TEXT DEFAULT 'standard' CHECK (support_mode IN ('standard', 'enhanced', 'dedicated')),
    support_team_assigned JSONB DEFAULT '[]'::jsonb,
    emergency_contact TEXT,
    
    -- Monitoring
    monitoring_enabled BOOLEAN DEFAULT false,
    alerting_configured BOOLEAN DEFAULT false,
    
    -- Backup and Recovery
    backup_strategy TEXT,
    backup_frequency TEXT,
    
    -- User Training
    training_completed BOOLEAN DEFAULT false,
    training_date TIMESTAMPTZ,
    
    -- Handover Documentation
    handover_completed BOOLEAN DEFAULT false,
    handover_date TIMESTAMPTZ,
    recipient JSONB DEFAULT '{}'::jsonb,
    
    -- Post Go-Live Review
    review_scheduled_date TIMESTAMPTZ,
    review_completed_date TIMESTAMPTZ,
    
    -- Notes and Feedback
    go_live_notes TEXT,
    user_feedback JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(site_id)
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_scoping TO authenticated;
GRANT SELECT ON public.site_scoping TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_approvals TO authenticated;
GRANT SELECT ON public.site_approvals TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_scoping_data TO authenticated;
GRANT SELECT ON public.site_scoping_data TO anon;
GRANT VIEW SELECT ON public.site_procurement_items TO authenticated;
GRANT SELECT ON public.site_procurement_items TO anon;
GRANT VIEW SELECT ON self_deployment_status TO authenticated;
GRANT SELECT ON public.site_deployment_status TO anon;
GRANT VIEW SELECT ON public.site_golive_status TO authenticated;
GRANT SELECT ON public.site_golive_status TO anon;

-- Populate data based on site statuses

-- Function to get corresponding status based on site status
CREATE OR REPLACE FUNCTION get_workflow_status(site_status TEXT, workflow_table TEXT)
RETURNS TEXT AS $$
BEGIN
    CASE 
        WHEN workflow_table = 'site_scoping' THEN
            RETURN CASE site_status
                WHEN 'site_study_done' THEN 'approved'
                WHEN 'scoping_done' THEN 'approved'
                WHEN 'approved' THEN 'approved'
                WHEN 'procurement_done' THEN 'approved'
                WHEN 'deployed' THEN 'approved'
                WHEN 'live' THEN 'approved'
                WHEN 'site_created' THEN 'draft'
                WHEN 'Created' THEN 'draft'
                ELSE 'draft'
            END;
        WHEN workflow_table = 'site_approvals' THEN
            RETURN CASE site_status
                WHEN 'site_study_done' THEN 'pending'
                WHEN 'scoping_done' THEN 'pending'
                WHEN 'approved' THEN 'approved'
                WHEN 'procurement_done' THEN 'approved'
                WHEN 'deployed' THEN 'approved'
                WHEN 'live' THEN 'approved'
                WHEN 'site_created' THEN 'pending'
                WHEN 'Created' THEN 'pending'
                ELSE 'pending'
            END;
        WHEN workflow_table = 'site_deployment_status' THEN
            RETURN CASE site_status
                WHEN 'deployed' THEN 'completed'
                WHEN 'live' THEN 'completed'
                WHEN 'procurement_done' THEN 'scheduled'
                WHEN 'approved' THEN 'scheduled'
                ELSE 'scheduled'
            END;
        WHEN workflow_table = 'site_golive_status' THEN
            RETURN CASE site_status
                WHEN 'live' THEN 'completed'
                WHEN 'deployed' THEN 'scheduled'
                ELSE 'scheduled'
            END;
        ELSE RETURN 'draft';
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Populate site_scoping table
INSERT INTO public.site_scoping (site_id, status, submitted_at, approved_at, selected_software_software_hardware, created_at, updated_at)
SELECT 
    id,
    get_workflow_status(status, 'site_scoping'),
    CASE WHEN status IN ('scoping_done', 'approved', 'procurement_done', 'deployed', 'live') THEN created_at ELSE NULL END,
    CASE WHEN status IN ('approved', 'procurement_done', 'deployed', 'live') THEN COALESCE(updated_at, created_at) ELSE NULL END,
    CASE 
        WHEN status IN ('scoping_done', 'approved', 'procurement_done', 'deployed', 'live') THEN
            '{"software": ["pos-system", "kiosk-software"], "hardware": ["tablet", "card-reader"]}'::jsonb
        ELSE '{"software": [], "hardware": []}'::jsonb
    END,
    created_at,
    updated_at
FROM public.sites 
WHERE NOT EXISTS (
    SELECT 1 FROM public.site_scoping WHERE site_scoping.site_id = sites.id
);

-- Populate site_approvals table
INSERT INTO public.site_approvals (site_id, approval_status, approved_date, approver_comments, requires_hardware_budget, requires_software_licenses, created_at, updated_at)
SELECT 
    id,
    get_workflow_status(status, 'site_approvals'),
    CASE WHEN status IN ('approved', 'procurement_done', 'deployed', 'live') THEN COALESCE(updated_at, created_at) ELSE NULL END,
    CASE WHEN status IN ('approved', 'procurement_done', 'deployed', 'live') 
         THEN 'Approved for implementation' 
         ELSE NULL 
    END,
    criticality_level != 'low',
    true,
    created_at,
    updated_at
FROM public.sites 
WHERE NOT EXISTS (
    SELECT 1 FROM public.site_approvals WHERE site_approvals.site_id = sites.id
);

-- Populate site_scoping_data table
INSERT INTO public.site_scoping_data (site_id, hardware_requirements, software_requirements, kiosk_requirements, pos_requirements, created_at, updated_at)
SELECT 
    id,
    CASE WHEN status IN ('scoping_done', 'approved', 'procurement_done', 'deployed', 'live') THEN
        '{"tablets": 2, "cardReaders": 1, "printers": 1}'::jsonb
    ELSE '{}'::jsonb END,
    CASE WHEN status IN ('scoping_done', 'approved', 'procurement_done', 'deployed', 'live') THEN
        '{"posSystem": true, "kioskSoftware": true, "inventoryManagement": true}'::jsonb
    ELSE '{}'::jsonb END,
    CASE WHEN status IN ('scoping_done', 'approved', 'procurement_done', 'deployed', 'live') THEN
        '{"numberOfKiosks": 1, "screenSize": "15inch", "paymentIntegration": true}'::jsonb
    ELSE '{}'::jsonb END,
    CASE WHEN status IN ('scoping_done', 'approved', 'procurement_done', 'deployed', 'live') THEN
        '{"numberOfTerminals": 2, "cashDrawer": true, "integratedPayment": true}'::jsonb
    ELSE '{}'::jsonb END,
    created_at,
    updated_at
FROM public.sites 
WHERE NOT EXISTS (
    SELECT 1 FROM public.site_scoping_data WHERE site_scoping_data.site_id = sites.id
);

-- Populate site_procurement_items table
INSERT INTO public.site_procurement_items (site_id, item_type, category, item_name, description, quantity, unit_cost, total_cost, procurement_status, order_date)
SELECT 
    s.id,
    'hardware',
    'tablet',
    'POS Tablet Device',
    'Touch screen tablet for POS operations',
    CASE WHEN s.criticality_level = 'high' THEN 3 ELSE 2 END,
    CASE WHEN s.organization_name = 'ASDA' THEN 299.99 
         WHEN s.organization_name = 'Tesco' THEN 279.99 
         WHEN s.organization_name = 'Sainsbury' THEN 319.99 
         ELSE 299.99 END,
    (CASE WHEN s.criticality_level = 'high' THEN 3 ELSE 2 END) * 
    (CASE WHEN s.organization_name = 'ASDA' THEN 299.99 
          WHEN s.organization_name = 'Tesco' THEN 279.99 
          WHEN s.organization_name = 'Sainsbury' THEN 319.99 
          ELSE 299.99 END),
    CASE WHEN s.status IN ('procurement_done', 'deployed', 'live') THEN 'installed'
         WHEN s.status IN ('approved', 'scoping_done') THEN 'ordered'
         ELSE 'pending' END,
    CASE WHEN s.status IN ('procurement_done', 'deployed', 'live', 'approved', 'scoping_done') 
         THEN s.created_at::date + interval '7 days' 
         ELSE NULL END
FROM public.sites s
WHERE s.status NOT IN ('site_created', 'Created') 
  AND NOT EXISTS (
    SELECT 1 FROM public.site_procurement_items WHERE site_procurement_items.site_id = s.id
  );

-- Add more procurement items
INSERT INTO public.site_procurement_items (site_id, item_type, category, item_name, description, quantity, unit_cost, total_cost, procurement_status, order_date)
SELECT 
    s.id,
    'hardware',
    'payment_device',
    'Card Payment Terminal',
    'EMV compliant card payment device',
    1,
    149.99,
    149.99,
    CASE WHEN s.status IN ('procurement_done', 'deployed', 'live') THEN 'installed'
         WHEN s.status IN ('approved', 'scoping_done') THEN 'ordered'
         ELSE 'pending' END,
    CASE WHEN s.status IN ('procurement_done', 'deployed', 'live', 'approved', 'scoping_done') 
         THEN s.created_at::date + interval '7 days' 
         ELSE NULL END
FROM public.sites s
WHERE s.status NOT IN ('site_created', 'Created') 
  AND NOT EXISTS (
    SELECT 1 FROM public.site_procurement_items spi 
    WHERE spi.site_id = s.id AND spi.item_name = 'Card Payment Terminal'
  );

-- Populate site_deployment_status table
INSERT INTO public.site_deployment_status (site_id, deployment_status, deployment_start_date, deployment_end_date, equipment_delivered, equipment_installed, equipment_tested, equipment_live, deployment_notes)
SELECT 
    id,
    get_workflow_status(status, 'site_deployment_status'),
    CASE WHEN status IN ('deployed', 'live') THEN created_at::date + interval '14 days' ELSE NULL END,
    CASE WHEN status IN ('deployed', 'live') THEN created_at::date + interval '21 days' ELSE NULL END,
    CASE WHEN status IN ('deployed', 'live') THEN true ELSE false END,
    CASE WHEN status IN ('deployed', 'live') THEN true ELSE false END,
    CASE WHEN status IN ('deployed', 'live') THEN true ELSE false END,
    status = 'live',
    CASE WHEN status IN ('deployed', 'live') THEN 'Deployment completed successfully' ELSE 'Deployment scheduled' END
FROM public.sites 
WHERE NOT EXISTS (
    SELECT 1 FROM public.site_deployment_status WHERE site_deployment_status.site_id = sites.id
);

-- Populate site_golive_status table
INSERT INTO public.site_golive_status (site_id, go_live_status, go_live_date, actual_go_live_date, support_mode, monitoring_enabled, handover_completed, go_live_notes)
SELECT 
    site_id,
    get_workflow_status(status, 'site_golive_status'),
    CASE WHEN status IN ('live', 'deployed') THEN target_live_date ELSE NULL END,
    CASE WHEN status = 'live' THEN target_live_date ELSE NULL END,
    CASE WHEN criticality_level = 'high' THEN 'dedicated' WHEN criticality_level = 'medium' THEN 'enhanced' ELSE 'standard' END,
    CASE WHEN status IN ('live') THEN true ELSE false END,
    CASE WHEN status IN ('live') THEN true ELSE false END,
    CASE WHEN status = 'live' THEN 'Site successfully went live on schedule' ELSE 'Go live scheduled' END
FROM public.sites 
WHERE NOT EXISTS (
    SELECT 1 FROM public.site_golive_status WHERE site_golive_status.site_id = sites.id
);

-- Drop the function as it's no longer needed
DROP FUNCTION IF EXISTS get_workflow_status(TEXT, TEXT);

COMMIT;

-- Additional notes:
-- 1. All tables are created with proper foreign key relationships
-- 2. Data is populated based on current site statuses
-- 3. RLS policies should be manually configured based on your authentication setup
-- 4. Indexes can be added for frequently queried columns
-- 5. The script handles the error: no 404 Not Found issues for workflow tables
