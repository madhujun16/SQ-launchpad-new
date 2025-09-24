-- Create site_assets table for tracking individual hardware assets deployed at sites
CREATE TABLE IF NOT EXISTS public.site_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hardware_item_id UUID NOT NULL REFERENCES public.hardware_items(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  model_number TEXT NOT NULL,
  service_cycle_months INTEGER NOT NULL DEFAULT 12,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'installed', 'active', 'maintenance', 'retired')),
  installed_at TIMESTAMPTZ,
  last_service_date TIMESTAMPTZ,
  next_service_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_site_assets_site_id ON public.site_assets(site_id);
CREATE INDEX IF NOT EXISTS idx_site_assets_hardware_item_id ON public.site_assets(hardware_item_id);
CREATE INDEX IF NOT EXISTS idx_site_assets_status ON public.site_assets(status);

-- Enable RLS
ALTER TABLE public.site_assets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view assets for their assigned sites" ON public.site_assets FOR SELECT USING (
  auth.uid() IN (
    SELECT assigned_ops_manager_id FROM public.sites WHERE id = site_id
    UNION
    SELECT assigned_deployment_engineer_id FROM public.sites WHERE id = site_id
  )
);

CREATE POLICY "Admins can view all site assets" ON public.site_assets FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Assigned users can insert assets for their sites" ON public.site_assets FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT assigned_ops_manager_id FROM public.sites WHERE id = site_id
    UNION
    SELECT assigned_deployment_engineer_id FROM public.sites WHERE id = site_id
  )
);

CREATE POLICY "Admins can insert assets for any site" ON public.site_assets FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Assigned users can update assets for their sites" ON public.site_assets FOR UPDATE USING (
  auth.uid() IN (
    SELECT assigned_ops_manager_id FROM public.sites WHERE id = site_id
    UNION
    SELECT assigned_deployment_engineer_id FROM public.sites WHERE id = site_id
  )
);

CREATE POLICY "Admins can update assets for any site" ON public.site_assets FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Assigned users can delete assets for their sites" ON public.site_assets FOR DELETE USING (
  auth.uid() IN (
    SELECT assigned_ops_manager_id FROM public.sites WHERE id = site_id
    UNION
    SELECT assigned_deployment_engineer_id FROM public.sites WHERE id = site_id
  )
);

CREATE POLICY "Admins can delete assets for any site" ON public.site_assets FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Add comments
COMMENT ON TABLE public.site_assets IS 'Individual hardware assets deployed at sites with tracking information';
COMMENT ON COLUMN public.site_assets.model_number IS 'Specific model number of the hardware asset';
COMMENT ON COLUMN public.site_assets.service_cycle_months IS 'Service cycle interval in months';
COMMENT ON COLUMN public.site_assets.status IS 'Current status of the asset';
COMMENT ON COLUMN public.site_assets.installed_at IS 'When the asset was installed';
COMMENT ON COLUMN public.site_assets.last_service_date IS 'Date of last service';
COMMENT ON COLUMN public.site_assets.next_service_date IS 'Date of next scheduled service';
