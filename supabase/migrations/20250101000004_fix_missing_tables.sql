-- Migration: Fix Missing Workflow Tables
-- Description: Create only the missing workflow tables and populate them based on site statuses
-- Date: 2025-01-01
-- Author: System

BEGIN;

-- First, let's check what actually exists and create what's missing

-- Create site_scoping table (it seems to be missing)
CREATE TABLE IF NOT EXISTS public.site_scoping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    selected_software JSONB DEFAULT '[]'::jsonb,
    selected_hardware JSONB DEFAULT '[]'::jsonb,
    cost_summary JSONB DEFAULT '{
        "hardwareCost": 0,
        "softwareSetupCost": 0,
        "installationCost": 0,
        "contingencyCost": 0,
        "totalCapex": 0,
        "monthlySoftwareFees": 0,
        "maintenanceCost": 0,
        "totalMonthlyOpex": 0,
        "totalInvestment": 0
    }'::jsonb,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id),
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Add unique constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'public.site_scoping'::regclass 
        AND conname = 'site_scoping_site_id_key'
    ) THEN
        ALTER TABLE public.site_scoping ADD CONSTRAINT site_scoping_site_id_key UNIQUE(site_id);
    END IF;
END $$;

-- Create site_approvals table if missing
CREATE TABLE IF NOT EXISTS public.site_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested')),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id),
    comments TEXT,
    approver_details JSONB DEFAULT '{"name": "", "role": "", "department": ""}'::jsonb,
    approval_type TEXT DEFAULT 'general',
    requested_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'public.site_approvals'::regclass 
        AND conname = 'site_approvals_site_id_key'
    ) THEN
        ALTER TABLE public.site_approvals ADD CONSTRAINT site_approvals_site_id_key UNIQUE(site_id);
    END IF;
END $$;

-- Ensure site_procurement_items table exists
CREATE TABLE IF NOT EXISTS public.site_procurement_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL,
    category TEXT NOT NULL,
    item_name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER DEFAULT 1,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    supplier TEXT,
    supplier_part_number TEXT,
    procurement_status TEXT DEFAULT 'pending' CHECK (procurement_status IN ('pending', 'ordered', 'received', 'installed', 'cancelled')),
    order_date TIMESTAMPTZ,
    delivery_date TIMESTAMPTZ,
    installation_date TIMESTAMPTZ,
    tracking_number TEXT,
    carrier TEXT,
    warranty_period INTEGER,
    condition_upon_arrival TEXT,
    installation_progress TEXT,
    serial_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure site_deployment_status table exists
CREATE TABLE IF NOT EXISTS public.site_deployment_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    deployment_status TEXT DEFAULT 'scheduled' CHECK (deployment_status IN ('scheduled', 'in_progress', 'completed', 'failed', 'cancelled')),
    deployment_start_date TIMESTAMPTZ,
    deployment_end_date TIMESTAMPTZ,
    deployment_team JSONB DEFAULT '[]'::jsonb,
    on_site_coordinator UUID REFERENCES auth.users(id),
    equipment_delivered BOOLEAN DEFAULT false,
    equipment_installed BOOLEAN DEFAULT false,
    equipment_tested BOOLEAN DEFAULT false,
    equipment_live BOOLEAN DEFAULT false,
    connectivity_tested BOOLEAN DEFAULT false,
    performance_tested BOOLEAN DEFAULT false,
    security_tested BOOLEAN DEFAULT false,
    user_acceptance_completed BOOLEAN DEFAULT false,
    installation_checklist_completed BOOLEAN DEFAULT false,
    handover_documentation_completed BOOLEAN DEFAULT false,
    photos_taken BOOLEAN DEFAULT false,
    completion_certificate_generated BOOLEAN DEFAULT false,
    deployment_notes TEXT,
    issues_encountered TEXT,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT site_deployment_status_site_id_key UNIQUE(site_id)
);

-- Ensure site_golive_status table exists
CREATE TABLE IF NOT EXISTS public.site_golive_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    go_live_status TEXT DEFAULT 'scheduled' CHECK (go_live_status IN ('scheduled', 'live', 'issues', 'rolled_back', 'completed')),
    go_live_date TIMESTAMPTZ,
    actual_go_live_date TIMESTAMPTZ,
    system_performance JSONB DEFAULT '{}'::jsonb,
    support_mode TEXT DEFAULT 'standard' CHECK (support_mode IN ('standard', 'enhanced', 'dedicated')),
    support_team_assigned JSONB DEFAULT '[]'::jsonb,
    emergency_contact TEXT,
    monitoring_enabled BOOLEAN DEFAULT false,
    alerting_configured BOOLEAN DEFAULT false,
    backup_strategy TEXT,
    backup_frequency TEXT,
    training_completed BOOLEAN DEFAULT false,
    training_date TIMESTAMPTZ,
    handover_completed BOOLEAN DEFAULT false,
    handover_date TIMESTAMPTZ,
    recipient JSONB DEFAULT '{}'::jsonb,
    review_scheduled_date TIMESTAMPTZ,
    review_completed_date TIMESTAMPTZ,
    go_live_notes TEXT,
    user_feedback JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT site_golive_status_site_id_key UNIQUE(site_id)
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_scoping TO authenticated;
GRANT SELECT ON public.site_scoping TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_approvals TO authenticated;
GRANT SELECT ON public.site_approvals TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_procurement_items TO authenticated;
GRANT SELECT ON public.site_procurement_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_deployment_status TO authenticated;
GRANT SELECT ON public.site_deployment_status TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_golive_status TO authenticated;
GRANT SELECT ON public.site_golive_status TO anon;

-- Populate data based on site statuses
INSERT INTO public.site_scoping (site_id, selected_software, selected_hardware, status, submitted_at, approved_at, cost_summary, created_at, updated_at)
SELECT 
    s.id,
    CASE WHEN s.status IN ('scoping_done', 'approved', 'procurement_done', 'deployed', 'live') THEN
        '[{"id": "pos-system", "quantity": 1}, {"id": "kiosk-software", "quantity": 1}]'::jsonb
    ELSE '[]'::jsonb END,
    CASE WHEN s.status IN ('scoping_done', 'approved', 'procurement_done', 'deployed', 'live') THEN
        '[{"id": "tablet", "quantity": 2}, {"id": "card-reader", "quantity": 1}]'::jsonb
    ELSE '[]'::jsonb END,
    CASE WHEN s.status IN ('approved', 'procurement_done', 'deployed', 'live') THEN 'approved'
         WHEN s.status IN ('scoping_done') THEN 'submitted'
         ELSE 'draft' END,
    CASE WHEN s.status IN ('scoping_done', 'approved', 'procurement_done', 'deployed', 'live') THEN s.updated_at ELSE NULL END,
    CASE WHEN s.status IN ('approved', 'procurement_done', 'deployed', 'live') THEN s.updated_at ELSE NULL END,
    CASE WHEN s.status IN ('scoping_done', 'approved', 'procurement_done', 'deployed', 'live') THEN
        '{"hardwareCost": 1500, "softwareSetupCost": 500, "installationCost": 300, "contingencyCost": 345, "totalCapex": 2645, "monthlySoftwareFees": 200, "maintenanceCost": 100, "totalMonthlyOpex": 300, "totalInvestment": 6245}'::jsonb
    ELSE '{}'::jsonb END,
    s.created_at,
    s.updated_at
FROM public.sites s
WHERE NOT EXISTS (SELECT 1 FROM public.site_scoping sc WHERE sc.site_id = s.id);

-- Populate site_approvals
INSERT INTO public.site_approvals (site_id, status, approved_at, comments, approval_type)
SELECT 
    s.id,
    CASE WHEN s.status IN ('approved', 'procurement_done', 'deployed', 'live') THEN 'approved'
         WHEN s.status IN ('scoping_done') THEN 'pending'
         ELSE 'pending' END,
    CASE WHEN s.status IN ('approved', 'procurement_done', 'deployed', 'live') THEN s.updated_at ELSE NULL END,
    CASE WHEN s.status IN ('approved', 'procurement_done', 'deployed', 'live') 
         THEN 'Approved for implementation' 
         ELSE NULL END,
    'General Approval'
FROM public.sites s
WHERE NOT EXISTS (SELECT 1 FROM public.site_approvals sa WHERE sa.site_id = s.id);

COMMIT;
