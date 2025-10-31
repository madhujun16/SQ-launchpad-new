-- Migration: Create Approval Workflow Tables
-- This migration creates the necessary tables for the comprehensive scoping approval workflow

-- Create scoping_approvals table
CREATE TABLE IF NOT EXISTS public.scoping_approvals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    site_name TEXT NOT NULL,
    deployment_engineer_id UUID NOT NULL REFERENCES auth.users(id),
    deployment_engineer_name TEXT NOT NULL,
    ops_manager_id UUID REFERENCES auth.users(id),
    ops_manager_name TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested')),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    review_comment TEXT,
    rejection_reason TEXT,
    scoping_data JSONB NOT NULL,
    cost_breakdown JSONB NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    previous_version_id UUID REFERENCES public.scoping_approvals(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create approval_actions table for audit trail
CREATE TABLE IF NOT EXISTS public.approval_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    approval_id UUID NOT NULL REFERENCES public.scoping_approvals(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('submit', 'approve', 'reject', 'request_changes', 'resubmit')),
    performed_by UUID NOT NULL REFERENCES auth.users(id),
    performed_by_role TEXT NOT NULL,
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    comment TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_scoping_approvals_site_id ON public.scoping_approvals(site_id);
CREATE INDEX IF NOT EXISTS idx_scoping_approvals_status ON public.scoping_approvals(status);
CREATE INDEX IF NOT EXISTS idx_scoping_approvals_deployment_engineer_id ON public.scoping_approvals(deployment_engineer_id);
CREATE INDEX IF NOT EXISTS idx_scoping_approvals_ops_manager_id ON public.scoping_approvals(ops_manager_id);
CREATE INDEX IF NOT EXISTS idx_scoping_approvals_submitted_at ON public.scoping_approvals(submitted_at);

CREATE INDEX IF NOT EXISTS idx_approval_actions_approval_id ON public.approval_actions(approval_id);
CREATE INDEX IF NOT EXISTS idx_approval_actions_performed_by ON public.approval_actions(performed_by);
CREATE INDEX IF NOT EXISTS idx_approval_actions_performed_at ON public.approval_actions(performed_at);

-- Add RLS policies
ALTER TABLE public.scoping_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_actions ENABLE ROW LEVEL SECURITY;

-- RLS policies for scoping_approvals
CREATE POLICY "Users can view their own approvals" ON public.scoping_approvals
    FOR SELECT USING (
        auth.uid() = deployment_engineer_id OR 
        auth.uid() = ops_manager_id OR
        public.has_role(auth.uid(), 'admin')
    );

CREATE POLICY "Deployment engineers can create approvals" ON public.scoping_approvals
    FOR INSERT WITH CHECK (
        auth.uid() = deployment_engineer_id
    );

CREATE POLICY "Deployment engineers can update their own approvals" ON public.scoping_approvals
    FOR UPDATE USING (
        auth.uid() = deployment_engineer_id AND status IN ('pending', 'changes_requested')
    );

CREATE POLICY "Ops managers can update approvals" ON public.scoping_approvals
    FOR UPDATE USING (
        auth.uid() = ops_manager_id OR
        public.has_role(auth.uid(), 'admin')
    );

-- RLS policies for approval_actions
CREATE POLICY "Users can view actions for their approvals" ON public.approval_actions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.scoping_approvals sa 
            WHERE sa.id = approval_id 
            AND (sa.deployment_engineer_id = auth.uid() OR sa.ops_manager_id = auth.uid())
        ) OR
        public.has_role(auth.uid(), 'admin')
    );

CREATE POLICY "Users can create actions for their approvals" ON public.approval_actions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.scoping_approvals sa 
            WHERE sa.id = approval_id 
            AND (sa.deployment_engineer_id = auth.uid() OR sa.ops_manager_id = auth.uid())
        )
    );

-- Add columns to sites table for approval tracking
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS scoping_approved_at TIMESTAMPTZ;
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS scoping_approved_by UUID REFERENCES auth.users(id);
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scoping_in_progress', 'pending_approval', 'ready_for_procurement', 'deployment_in_progress', 'live'));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_scoping_approvals_updated_at 
    BEFORE UPDATE ON public.scoping_approvals 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments
COMMENT ON TABLE public.scoping_approvals IS 'Stores scoping approval requests and their status';
COMMENT ON TABLE public.approval_actions IS 'Audit trail for all approval workflow actions';
COMMENT ON COLUMN public.scoping_approvals.scoping_data IS 'JSON containing the software and hardware selection';
COMMENT ON COLUMN public.scoping_approvals.cost_breakdown IS 'JSON containing the calculated cost breakdown';
COMMENT ON COLUMN public.scoping_approvals.version IS 'Version number for tracking changes and resubmissions';
COMMENT ON COLUMN public.approval_actions.metadata IS 'Additional context data for the action';
