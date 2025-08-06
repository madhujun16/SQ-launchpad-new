-- Create hardware requests table for approvals and procurement workflow
CREATE TABLE IF NOT EXISTS public.hardware_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
    site_name TEXT NOT NULL,
    requested_by UUID REFERENCES public.profiles(user_id),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'procurement', 'dispatched', 'delivered')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    items_count INTEGER NOT NULL DEFAULT 0,
    total_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    assigned_ops_manager UUID REFERENCES public.profiles(user_id),
    assigned_deployment_engineer UUID REFERENCES public.profiles(user_id),
    comments TEXT,
    rejection_reason TEXT,
    procurement_status TEXT,
    expected_delivery DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hardware request items table
CREATE TABLE IF NOT EXISTS public.hardware_request_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id UUID REFERENCES public.hardware_requests(id) ON DELETE CASCADE,
    hardware_item_id UUID REFERENCES public.hardware_items(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deployment tracking table
CREATE TABLE IF NOT EXISTS public.deployments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
    site_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'on_hold', 'cancelled')),
    deployment_date DATE NOT NULL,
    assigned_deployment_engineer UUID REFERENCES public.profiles(user_id),
    assigned_ops_manager UUID REFERENCES public.profiles(user_id),
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    notes TEXT,
    hardware_delivered BOOLEAN DEFAULT FALSE,
    installation_started BOOLEAN DEFAULT FALSE,
    testing_completed BOOLEAN DEFAULT FALSE,
    go_live_ready BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deployment checklist items table
CREATE TABLE IF NOT EXISTS public.deployment_checklist_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    deployment_id UUID REFERENCES public.deployments(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    completed_by UUID REFERENCES public.profiles(user_id),
    completed_at TIMESTAMP WITH TIME ZONE,
    category TEXT NOT NULL CHECK (category IN ('pre_deployment', 'installation', 'testing', 'post_deployment')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assets table for post-live asset management
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    serial_number TEXT UNIQUE,
    site_id UUID REFERENCES public.sites(id),
    site_name TEXT,
    status TEXT NOT NULL DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'assigned', 'deployed', 'in_maintenance', 'retired')),
    location TEXT,
    assigned_to UUID REFERENCES public.profiles(user_id),
    purchase_date DATE,
    warranty_expiry DATE,
    last_maintenance DATE,
    next_maintenance DATE,
    maintenance_schedule TEXT,
    license_key TEXT,
    license_expiry DATE,
    cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    manufacturer TEXT,
    model TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create maintenance logs table
CREATE TABLE IF NOT EXISTS public.maintenance_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    asset_name TEXT NOT NULL,
    maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('preventive', 'corrective', 'emergency')),
    description TEXT NOT NULL,
    performed_by UUID REFERENCES public.profiles(user_id),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    next_maintenance_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entity TEXT NOT NULL,
    action TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(user_id),
    user_name TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    details TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hardware_requests_site_id ON public.hardware_requests(site_id);
CREATE INDEX IF NOT EXISTS idx_hardware_requests_status ON public.hardware_requests(status);
CREATE INDEX IF NOT EXISTS idx_hardware_requests_requested_by ON public.hardware_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_hardware_requests_assigned_ops_manager ON public.hardware_requests(assigned_ops_manager);

CREATE INDEX IF NOT EXISTS idx_deployments_site_id ON public.deployments(site_id);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON public.deployments(status);
CREATE INDEX IF NOT EXISTS idx_deployments_assigned_deployment_engineer ON public.deployments(assigned_deployment_engineer);

CREATE INDEX IF NOT EXISTS idx_assets_site_id ON public.assets(site_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON public.assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_assigned_to ON public.assets(assigned_to);

CREATE INDEX IF NOT EXISTS idx_maintenance_logs_asset_id ON public.maintenance_logs(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_performed_at ON public.maintenance_logs(performed_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp);

-- Enable RLS on all new tables
ALTER TABLE public.hardware_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hardware_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployment_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hardware_requests
CREATE POLICY "Users can view hardware requests based on role" ON public.hardware_requests
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            -- Admins can see all requests
            (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin' OR
            -- Ops managers can see requests for their assigned sites
            (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'ops_manager' AND assigned_ops_manager = auth.uid() OR
            -- Deployment engineers can see their own requests
            (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'deployment_engineer' AND requested_by = auth.uid()
        )
    );

CREATE POLICY "Users can update hardware requests based on role" ON public.hardware_requests
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND (
            -- Admins can update all requests
            (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin' OR
            -- Ops managers can update requests for their assigned sites
            (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'ops_manager' AND assigned_ops_manager = auth.uid() OR
            -- Deployment engineers can update their own requests
            (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'deployment_engineer' AND requested_by = auth.uid()
        )
    );

CREATE POLICY "Deployment engineers can create hardware requests" ON public.hardware_requests
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'deployment_engineer'
    );

-- RLS Policies for deployments
CREATE POLICY "Users can view deployments based on role" ON public.deployments
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            -- Admins can see all deployments
            (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin' OR
            -- Ops managers can see deployments for their assigned sites
            (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'ops_manager' AND assigned_ops_manager = auth.uid() OR
            -- Deployment engineers can see their assigned deployments
            (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'deployment_engineer' AND assigned_deployment_engineer = auth.uid()
        )
    );

CREATE POLICY "Users can update deployments based on role" ON public.deployments
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND (
            -- Admins can update all deployments
            (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin' OR
            -- Ops managers can update deployments for their assigned sites
            (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'ops_manager' AND assigned_ops_manager = auth.uid() OR
            -- Deployment engineers can update their assigned deployments
            (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'deployment_engineer' AND assigned_deployment_engineer = auth.uid()
        )
    );

-- RLS Policies for assets
CREATE POLICY "Users can view assets based on role" ON public.assets
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            -- Admins can see all assets
            (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin' OR
            -- Ops managers can see all assets
            (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'ops_manager' OR
            -- Deployment engineers can see assets for their assigned sites
            (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'deployment_engineer' AND assigned_to = auth.uid()
        )
    );

CREATE POLICY "Ops managers and admins can manage assets" ON public.assets
    FOR ALL USING (
        auth.role() = 'authenticated' AND (
            -- Admins can manage all assets
            (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin' OR
            -- Ops managers can manage all assets
            (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'ops_manager'
        )
    );

-- RLS Policies for audit_logs (read-only for admins)
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin'
    );

-- Function to automatically log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
    p_entity TEXT,
    p_action TEXT,
    p_details TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.audit_logs (entity, action, user_id, user_name, details, ip_address)
    VALUES (
        p_entity,
        p_action,
        auth.uid(),
        (SELECT full_name FROM public.profiles WHERE user_id = auth.uid()),
        p_details,
        inet_client_addr()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 