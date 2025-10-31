-- Create site_scoping table for the scoping workflow
CREATE TABLE IF NOT EXISTS public.site_scoping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  selected_software JSONB NOT NULL DEFAULT '[]'::jsonb,
  selected_hardware JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'changes_requested')),
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  rejected_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  changes_requested_at TIMESTAMPTZ,
  changes_requested_by UUID REFERENCES auth.users(id),
  changes_requested_reason TEXT,
  cost_summary JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT site_scoping_site_id_key UNIQUE(site_id)
);

-- Create site_approvals table for tracking approval workflow
CREATE TABLE IF NOT EXISTS public.site_approvals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  comments TEXT,
  approver_details JSONB DEFAULT '{"name": "", "role": "", "department": ""}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approval_type TEXT,
  scoping_id UUID REFERENCES public.site_scoping(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES auth.users(id),
  CONSTRAINT site_approvals_site_id_key UNIQUE(site_id)
);

-- Create site_procurement_items table for detailed procurement tracking
CREATE TABLE IF NOT EXISTS public.site_procurement_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  hardware_item_id UUID REFERENCES public.hardware_items(id),
  software_module_id UUID REFERENCES public.software_modules(id),
  item_type TEXT NOT NULL CHECK (item_type IN ('software', 'hardware')),
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ordered', 'delivered', 'installed')),
  order_date DATE,
  delivery_date DATE,
  installation_date DATE,
  supplier TEXT,
  order_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_site_scoping_site_id ON public.site_scoping(site_id);
CREATE INDEX IF NOT EXISTS idx_site_scoping_status ON public.site_scoping(status);
CREATE INDEX IF NOT EXISTS idx_site_approvals_site_id ON public.site_approvals(site_id);
CREATE INDEX IF NOT EXISTS idx_site_approvals_status ON public.site_approvals(status);
CREATE INDEX IF NOT EXISTS idx_site_procurement_items_site_id ON public.site_procurement_items(site_id);
CREATE INDEX IF NOT EXISTS idx_site_procurement_items_status ON public.site_procurement_items(status);

-- Enable RLS
ALTER TABLE public.site_scoping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_procurement_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for site_scoping
CREATE POLICY "Users can view scoping for their assigned sites" ON public.site_scoping FOR SELECT USING (
  auth.uid() IN (
    SELECT assigned_ops_manager_id FROM public.sites WHERE id = site_id
    UNION
    SELECT assigned_deployment_engineer_id FROM public.sites WHERE id = site_id
  )
);

CREATE POLICY "Admins can view all site scoping" ON public.site_scoping FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Assigned users can insert/update scoping for their sites" ON public.site_scoping FOR ALL USING (
  auth.uid() IN (
    SELECT assigned_ops_manager_id FROM public.sites WHERE id = site_id
    UNION
    SELECT assigned_deployment_engineer_id FROM public.sites WHERE id = site_id
  )
);

CREATE POLICY "Admins can manage all site scoping" ON public.site_scoping FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for site_approvals
CREATE POLICY "Users can view approvals for their assigned sites" ON public.site_approvals FOR SELECT USING (
  auth.uid() IN (
    SELECT assigned_ops_manager_id FROM public.sites WHERE id = site_id
    UNION
    SELECT assigned_deployment_engineer_id FROM public.sites WHERE id = site_id
  )
);

CREATE POLICY "Admins can view all site approvals" ON public.site_approvals FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all site approvals" ON public.site_approvals FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for site_procurement_items
CREATE POLICY "Users can view procurement items for their assigned sites" ON public.site_procurement_items FOR SELECT USING (
  auth.uid() IN (
    SELECT assigned_ops_manager_id FROM public.sites WHERE id = site_id
    UNION
    SELECT assigned_deployment_engineer_id FROM public.sites WHERE id = site_id
  )
);

CREATE POLICY "Admins can view all procurement items" ON public.site_procurement_items FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Assigned users can manage procurement items for their sites" ON public.site_procurement_items FOR ALL USING (
  auth.uid() IN (
    SELECT assigned_ops_manager_id FROM public.sites WHERE id = site_id
    UNION
    SELECT assigned_deployment_engineer_id FROM public.sites WHERE id = site_id
  )
);

CREATE POLICY "Admins can manage all procurement items" ON public.site_procurement_items FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Add comments
COMMENT ON TABLE public.site_scoping IS 'Site scoping data including selected software and hardware';
COMMENT ON TABLE public.site_approvals IS 'Approval workflow tracking for site operations';
COMMENT ON TABLE public.site_procurement_items IS 'Detailed procurement items tracking for sites';
COMMENT ON COLUMN public.site_scoping.selected_software IS 'Array of selected software module IDs';
COMMENT ON COLUMN public.site_scoping.selected_hardware IS 'Array of selected hardware items with quantities';
COMMENT ON COLUMN public.site_scoping.status IS 'Current status of the scoping process';
COMMENT ON COLUMN public.site_approvals.approval_type IS 'Type of approval (scoping, procurement, deployment)';
COMMENT ON COLUMN public.site_procurement_items.item_type IS 'Whether this is a software or hardware item';
