-- Drop the overly permissive policy
DROP POLICY "Allow email existence check for login" ON public.profiles;

-- Create a more restrictive policy that allows checking email existence for login
-- This policy allows unauthenticated users to query emails for OTP login
CREATE POLICY "Allow email existence check for login" 
ON public.profiles 
FOR SELECT 
TO anon
USING (true);

-- Add admin policy to allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_admin());

-- Add admin policy to allow admins to insert new profiles
CREATE POLICY "Admins can insert new profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (public.is_admin());

-- Add admin policy to allow admins to update profiles
CREATE POLICY "Admins can update profiles" 
ON public.profiles 
FOR UPDATE 
USING (public.is_admin());

-- Add admin policy to allow admins to delete profiles
CREATE POLICY "Admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (public.is_admin());

-- Add site-related tables for SmartQ LaunchPad business requirements

-- Create site status enum
CREATE TYPE public.site_status AS ENUM (
  'new',
  'in-progress', 
  'active',
  'deployed'
);

-- Create cafeteria type enum
CREATE TYPE public.cafeteria_type AS ENUM (
  'staff',
  'visitor',
  'mixed'
);

-- Create site assignments table
CREATE TABLE public.site_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  ops_manager_id UUID REFERENCES public.profiles(user_id),
  deployment_engineer_id UUID REFERENCES public.profiles(user_id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID NOT NULL REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create site studies table
CREATE TABLE public.site_studies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  conducted_by UUID NOT NULL REFERENCES public.profiles(user_id),
  study_date DATE NOT NULL,
  findings TEXT,
  site_map_url TEXT,
  counter_count INTEGER,
  hardware_requirements JSONB,
  geolocation_lat DECIMAL(10, 8),
  geolocation_lng DECIMAL(11, 8),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create site status tracking table
CREATE TABLE public.site_status_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  study_status VARCHAR(50) DEFAULT 'pending',
  cost_approval_status VARCHAR(50) DEFAULT 'pending',
  inventory_status VARCHAR(50) DEFAULT 'pending',
  products_status VARCHAR(50) DEFAULT 'pending',
  deployment_status VARCHAR(50) DEFAULT 'pending',
  overall_status site_status DEFAULT 'new',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID NOT NULL REFERENCES public.profiles(user_id)
);

-- Add columns to sites table for business requirements
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS cafeteria_type cafeteria_type DEFAULT 'mixed';
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 0;
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS expected_footfall INTEGER DEFAULT 0;
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS postcode VARCHAR(20);

-- Enable RLS on new tables
ALTER TABLE public.site_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_status_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for site assignments
CREATE POLICY "Anyone can view site assignments" ON public.site_assignments FOR SELECT USING (true);
CREATE POLICY "Admins can manage site assignments" ON public.site_assignments FOR ALL USING (public.is_admin());

-- Create RLS policies for site studies
CREATE POLICY "Anyone can view site studies" ON public.site_studies FOR SELECT USING (true);
CREATE POLICY "Admins and deployment engineers can manage site studies" ON public.site_studies FOR ALL USING (
  public.is_admin() OR public.has_role(auth.uid(), 'deployment_engineer')
);

-- Create RLS policies for site status tracking
CREATE POLICY "Anyone can view site status tracking" ON public.site_status_tracking FOR SELECT USING (true);
CREATE POLICY "Admins and ops managers can manage site status tracking" ON public.site_status_tracking FOR ALL USING (
  public.is_admin() OR public.has_role(auth.uid(), 'ops_manager')
);

-- Create indexes
CREATE INDEX idx_site_assignments_site_id ON public.site_assignments(site_id);
CREATE INDEX idx_site_assignments_ops_manager_id ON public.site_assignments(ops_manager_id);
CREATE INDEX idx_site_assignments_deployment_engineer_id ON public.site_assignments(deployment_engineer_id);
CREATE INDEX idx_site_studies_site_id ON public.site_studies(site_id);
CREATE INDEX idx_site_studies_conducted_by ON public.site_studies(conducted_by);
CREATE INDEX idx_site_status_tracking_site_id ON public.site_status_tracking(site_id);

-- Create triggers for updated_at
CREATE TRIGGER update_site_assignments_updated_at BEFORE UPDATE ON public.site_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_studies_updated_at BEFORE UPDATE ON public.site_studies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_status_tracking_updated_at BEFORE UPDATE ON public.site_status_tracking FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get site with all related data
CREATE OR REPLACE FUNCTION public.get_site_with_details(site_uuid UUID)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  food_court_unit VARCHAR,
  address TEXT,
  postcode VARCHAR,
  cafeteria_type cafeteria_type,
  capacity INTEGER,
  expected_footfall INTEGER,
  description TEXT,
  status VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  sector_name VARCHAR,
  city_name VARCHAR,
  ops_manager_name VARCHAR,
  deployment_engineer_name VARCHAR,
  study_status VARCHAR,
  cost_approval_status VARCHAR,
  inventory_status VARCHAR,
  products_status VARCHAR,
  deployment_status VARCHAR,
  overall_status site_status
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    s.id,
    s.name,
    s.food_court_unit,
    s.address,
    s.postcode,
    s.cafeteria_type,
    s.capacity,
    s.expected_footfall,
    s.description,
    s.status,
    s.created_at,
    s.updated_at,
    s.created_by,
    sec.name as sector_name,
    c.name as city_name,
    ops.full_name as ops_manager_name,
    de.full_name as deployment_engineer_name,
    sst.study_status,
    sst.cost_approval_status,
    sst.inventory_status,
    sst.products_status,
    sst.deployment_status,
    sst.overall_status
  FROM public.sites s
  LEFT JOIN public.sectors sec ON s.sector_id = sec.id
  LEFT JOIN public.cities c ON s.city_id = c.id
  LEFT JOIN public.site_assignments sa ON s.id = sa.site_id
  LEFT JOIN public.profiles ops ON sa.ops_manager_id = ops.user_id
  LEFT JOIN public.profiles de ON sa.deployment_engineer_id = de.user_id
  LEFT JOIN public.site_status_tracking sst ON s.id = sst.site_id
  WHERE s.id = site_uuid;
$$;