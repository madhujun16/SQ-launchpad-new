-- Create software modules table
CREATE TABLE public.software_modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hardware items table
CREATE TABLE public.hardware_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  model TEXT,
  manufacturer TEXT,
  estimated_cost DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create software-hardware mapping table
CREATE TABLE public.software_hardware_mapping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  software_module_id UUID REFERENCES public.software_modules(id) ON DELETE CASCADE,
  hardware_item_id UUID REFERENCES public.hardware_items(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT false,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(software_module_id, hardware_item_id)
);

-- Create site workflow stages table
CREATE TABLE public.site_workflow_stages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, blocked
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES public.profiles(user_id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create site software scoping table
CREATE TABLE public.site_software_scoping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  software_module_id UUID REFERENCES public.software_modules(id),
  is_selected BOOLEAN DEFAULT false,
  quantity INTEGER DEFAULT 1,
  notes TEXT,
  scoped_by UUID REFERENCES public.profiles(user_id),
  scoped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_frozen BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create site hardware scoping table
CREATE TABLE public.site_hardware_scoping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  hardware_item_id UUID REFERENCES public.hardware_items(id),
  software_module_id UUID REFERENCES public.software_modules(id),
  quantity INTEGER DEFAULT 1,
  is_auto_suggested BOOLEAN DEFAULT true,
  is_custom BOOLEAN DEFAULT false,
  custom_name TEXT,
  notes TEXT,
  scoped_by UUID REFERENCES public.profiles(user_id),
  scoped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE public.software_modules IS 'Available SmartQ software modules';
COMMENT ON TABLE public.hardware_items IS 'Available hardware items for deployment';
COMMENT ON TABLE public.software_hardware_mapping IS 'Mapping between software modules and compatible hardware';
COMMENT ON TABLE public.site_workflow_stages IS 'Track site deployment workflow stages';
COMMENT ON TABLE public.site_software_scoping IS 'Software modules selected for each site';
COMMENT ON TABLE public.site_hardware_scoping IS 'Hardware items scoped for each site';

-- Enable RLS
ALTER TABLE public.software_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hardware_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.software_hardware_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_workflow_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_software_scoping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_hardware_scoping ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for authenticated users" ON public.software_modules FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for admins" ON public.software_modules FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Enable update for admins" ON public.software_modules FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Enable delete for admins" ON public.software_modules FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Enable read access for authenticated users" ON public.hardware_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for admins" ON public.hardware_items FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Enable update for admins" ON public.hardware_items FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Enable delete for admins" ON public.hardware_items FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Enable read access for authenticated users" ON public.software_hardware_mapping FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for admins" ON public.software_hardware_mapping FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Enable update for admins" ON public.software_hardware_mapping FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Enable delete for admins" ON public.software_hardware_mapping FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Site workflow stages policies
CREATE POLICY "Users can view their assigned site stages" ON public.site_workflow_stages FOR SELECT USING (
  auth.uid() IN (
    SELECT assigned_ops_manager FROM public.sites WHERE id = site_id
    UNION
    SELECT assigned_deployment_engineer FROM public.sites WHERE id = site_id
  )
);

CREATE POLICY "Admins can view all site stages" ON public.site_workflow_stages FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Assigned users can update site stages" ON public.site_workflow_stages FOR UPDATE USING (
  auth.uid() = assigned_to OR
  auth.uid() IN (
    SELECT assigned_ops_manager FROM public.sites WHERE id = site_id
    UNION
    SELECT assigned_deployment_engineer FROM public.sites WHERE id = site_id
  )
);

-- Site software scoping policies
CREATE POLICY "Users can view their assigned site software scoping" ON public.site_software_scoping FOR SELECT USING (
  auth.uid() IN (
    SELECT assigned_ops_manager FROM public.sites WHERE id = site_id
    UNION
    SELECT assigned_deployment_engineer FROM public.sites WHERE id = site_id
  )
);

CREATE POLICY "Admins can view all site software scoping" ON public.site_software_scoping FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Assigned users can update site software scoping" ON public.site_software_scoping FOR UPDATE USING (
  auth.uid() IN (
    SELECT assigned_ops_manager FROM public.sites WHERE id = site_id
    UNION
    SELECT assigned_deployment_engineer FROM public.sites WHERE id = site_id
  )
);

-- Site hardware scoping policies
CREATE POLICY "Users can view their assigned site hardware scoping" ON public.site_hardware_scoping FOR SELECT USING (
  auth.uid() IN (
    SELECT assigned_ops_manager FROM public.sites WHERE id = site_id
    UNION
    SELECT assigned_deployment_engineer FROM public.sites WHERE id = site_id
  )
);

CREATE POLICY "Admins can view all site hardware scoping" ON public.site_hardware_scoping FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Assigned users can update site hardware scoping" ON public.site_hardware_scoping FOR UPDATE USING (
  auth.uid() IN (
    SELECT assigned_ops_manager FROM public.sites WHERE id = site_id
    UNION
    SELECT assigned_deployment_engineer FROM public.sites WHERE id = site_id
  )
); 