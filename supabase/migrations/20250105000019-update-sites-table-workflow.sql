-- Update sites table with workflow stages and status tracking
-- Add new columns for workflow management

ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS workflow_status TEXT DEFAULT 'created' CHECK (workflow_status IN ('created', 'study_in_progress', 'study_completed', 'hardware_scoped', 'approved', 'procurement', 'deployment', 'activated', 'go_live'));

ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS study_started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS study_completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS hardware_scoped_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS procurement_started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS deployment_started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS go_live_at TIMESTAMP WITH TIME ZONE;

-- Add notes and comments columns
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS study_notes TEXT;
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS hardware_notes TEXT;
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS deployment_notes TEXT;

-- Add target dates
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS target_study_completion DATE;
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS target_hardware_approval DATE;
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS target_deployment_start DATE;
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS target_go_live DATE;

-- Create index for workflow status
CREATE INDEX IF NOT EXISTS idx_sites_workflow_status ON public.sites(workflow_status);

-- Update RLS policies for workflow stages
DROP POLICY IF EXISTS "Users can view sites based on role and assignment" ON public.sites;
CREATE POLICY "Users can view sites based on role and assignment" ON public.sites
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            -- Admins can see all sites
            (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin' OR
            -- Ops managers can see assigned sites
            (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'ops_manager' AND assigned_ops_manager = auth.uid() OR
            -- Deployment engineers can see assigned sites
            (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'deployment_engineer' AND assigned_deployment_engineer = auth.uid()
        )
    );

-- Policy for updating workflow status
DROP POLICY IF EXISTS "Users can update sites based on role and assignment" ON public.sites;
CREATE POLICY "Users can update sites based on role and assignment" ON public.sites
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND (
            -- Admins can update all sites
            (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin' OR
            -- Ops managers can update assigned sites
            (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'ops_manager' AND assigned_ops_manager = auth.uid() OR
            -- Deployment engineers can update assigned sites
            (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'deployment_engineer' AND assigned_deployment_engineer = auth.uid()
        )
    );

-- Policy for inserting new sites (only admins)
DROP POLICY IF EXISTS "Admins can create sites" ON public.sites;
CREATE POLICY "Admins can create sites" ON public.sites
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin'
    ); 