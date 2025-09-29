-- Optimize remaining tables after cleanup
-- This migration adds indexes and optimizations for the cleaned schema

-- Indexes for better query performance on core tables

-- Sites table optimizations
CREATE INDEX IF NOT EXISTS idx_sites_status ON public.sites(status) WHERE is_archived = false;
CREATE INDEX IF NOT EXISTS idx_sites_organization_id ON public.sites(organization_id);
CREATE INDEX IF NOT EXISTS idx_sites_assigned_ops_manager ON public.sites(assigned_ops_manager_id);
CREATE INDEX IF NOT EXISTS idx_sites_assigned_deployment_engineer ON public.sites(assigned_deployment_engineer_id);

-- Profiles optimization
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON public.profiles(is_active);

-- User roles optimization
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Organizations optimization  
CREATE INDEX IF NOT EXISTS idx_organizations_name ON public.organizations(name);
CREATE INDEX IF NOT EXISTS idx_organizations_archived ON public.organizations(is_archived);

-- Workflow tables optimization
CREATE INDEX IF NOT EXISTS idx_site_creation_data_site_id ON public.site_creation_data(site_id);
CREATE INDEX IF NOT EXISTS idx_site_study_data_site_id ON public.site_study_data(site_id);
CREATE INDEX IF NOT EXISTS idx_site_scoping_data_site_id ON public.site_scoping_data(site_id);
CREATE INDEX IF NOT EXISTS idx_site_approvals_site_id ON public.site_approvals(site_id);
CREATE INDEX IF NOT EXISTS idx_site_procurement_site_id ON public.site_procurement(site_id);
CREATE INDEX IF NOT EXISTS idx_site_deployments_site_id ON public.site_deployments(site_id);
CREATE INDEX IF NOT EXISTS idx_site_go_live_site_id ON public.site_go_live(site_id);

-- Site approvals status index for filtering
CREATE INDEX IF NOT EXISTS idx_site_approvals_status ON public.site_approvals(status);

-- Procurement status index
CREATE INDEX IF NOT EXISTS idx_site_procurement_status ON public.site_procurement(status);

-- Site deployments status index  
CREATE INDEX IF NOT EXISTS idx_site_deployments_status ON public.site_deployments(status);

-- Platform configuration optimization
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active);
CREATE INDEX IF NOT EXISTS idx_software_modules_active ON public.software_modules(is_active);
CREATE INDEX IF NOT EXISTS idx_hardware_items_active ON public.hardware_items(is_active);
CREATE INDEX IF NOT EXISTS idx_software_modules_category ON public.software_modules(category_id);
CREATE INDEX IF NOT EXISTS idx_hardware_items_category ON public.hardware_items(category_id);

-- Recommendation rules optimization
CREATE INDEX IF NOT EXISTS idx_recommendation_rules_software ON public.recommendation_rules(software_module_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_rules_hardware ON public.recommendation_rules(hardware_item_id);

-- Site assignments optimization
CREATE INDEX IF NOT EXISTS idx_site_assignments_site_id ON public.site_assignments(site_id);
CREATE INDEX IF NOT EXISTS idx_site_assignments_ops_manager ON public.site_assignments(ops_manager_id);
CREATE INDEX IF NOT EXISTS idx_site_assignments_deployment_engineer ON public.site_assignments(deployment_engineer_id);

-- Costing approvals optimization (if table exists and will be kept)
DO $$
BEGIN
    -- Check if costing_approvals table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'costing_approvals') THEN
        -- Check if columns exist before creating indexes
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'costing_approvals' AND column_name = 'site_id') THEN
            CREATE INDEX IF NOT EXISTS idx_costing_approvals_site_id ON public.costing_approvals(site_id);
        END IF;
        
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'costing_approvals' AND column_name = 'status') THEN
            CREATE INDEX IF NOT EXISTS idx_costing_approvals_status ON public.costing_approvals(status);
        END IF;
        
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'costing_approvals' AND column_name = 'deployment_engineer_id') THEN
            CREATE INDEX IF NOT EXISTS idx_costing_approvals_deployment_engineer ON public.costing_approvals(deployment_engineer_id);
        END IF;
        
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'costing_approvals' AND column_name = 'ops_manager_id') THEN
            CREATE INDEX IF NOT EXISTS idx_costing_approvals_ops_manager ON public.costing_approvals(ops_manager_id);
        END IF;
    END IF;
END $$;

-- Costing items optimization (if table exists and will be kept)
DO $$
BEGIN
    -- Check if costing_items approval column exists
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'costing_items'
        AND EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'costing_items' 
            AND column_name = 'costing_approval_id'
        )
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_costing_items_approval_id ON public.costing_items(costing_approval_id);
    END IF;
END $$;

-- Notifications optimization (if tables exist and will be kept)
DO $$
BEGIN
    -- Check if notifications table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
        CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
        CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);
        CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
        CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
        CREATE INDEX IF NOT EXISTS idx_notifications_priority ON public.notifications(priority);
    END IF;
END $$;

-- Add partial indexes for common queries
CREATE INDEX IF NOT EXISTS idx_sites_active_not_archived ON public.sites(status, organization_id) 
    WHERE is_archived = false;

-- Analysis comments for database maintenance
ANALYZE public.sites;
ANALYZE public.profiles;
ANALYZE public.user_roles;
ANALYZE public.organizations;

-- Add database comment
COMMENT ON DATABASE postgres IS 'Schema optimized and cleaned up on 2025-01-25 - Added performance indexes';
