-- =====================================================
-- SmartQ Launchpad CG - DEPRECATED DATABASE SETUP SCRIPT
-- =====================================================
-- 
-- ⚠️  WARNING: This file is DEPRECATED and should NOT be used
-- 
-- Reason: This script contains outdated schema definitions that do not
-- match the current database state. The database has been evolved through
-- multiple migrations and this initial setup is no longer valid.
-- 
-- Current Status:
-- - Tables already exist with proper structure
-- - RLS policies are already implemented and simplified
-- - Functions and triggers are already in place
-- - Types and enums are already created
-- 
-- For reference only - DO NOT EXECUTE
-- =====================================================

-- This file has been marked as deprecated.
-- The database is already properly set up and configured.
-- All necessary tables, functions, policies, and types are in place.
-- Complete schema and sample data
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS
-- =====================================================

-- Create app role enum
CREATE TYPE public.app_role AS ENUM (
  'admin',
  'ops_manager',
  'deployment_engineer'
);

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

-- =====================================================
-- TABLES
-- =====================================================

-- Create profiles table
CREATE TABLE public.profiles (
  user_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  invited_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  role app_role NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create sectors table
CREATE TABLE public.sectors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cities table
CREATE TABLE public.cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  region VARCHAR(100) DEFAULT 'UK',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, region)
);

-- Create sites table
CREATE TABLE public.sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  food_court_unit VARCHAR(100) NOT NULL,
  sector_id UUID REFERENCES public.sectors(id),
  city_id UUID REFERENCES public.cities(id),
  address TEXT,
  postcode VARCHAR(20),
  cafeteria_type cafeteria_type DEFAULT 'mixed',
  capacity INTEGER DEFAULT 0,
  expected_footfall INTEGER DEFAULT 0,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(user_id)
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

-- Create inventory items table
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  manufacturer VARCHAR(255),
  model_number VARCHAR(100),
  serial_number VARCHAR(100),
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10, 2),
  total_value DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'available',
  location VARCHAR(255),
  assigned_to UUID REFERENCES public.profiles(user_id),
  site_id UUID REFERENCES public.sites(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(user_id)
);

-- Create licenses table
CREATE TABLE public.licenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  license_key VARCHAR(500),
  license_type VARCHAR(100),
  vendor VARCHAR(255),
  cost DECIMAL(10, 2),
  purchase_date DATE,
  expiry_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(user_id)
);

-- Create inventory deployment history table
CREATE TABLE public.inventory_deployment_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  deployed_by UUID NOT NULL REFERENCES public.profiles(user_id),
  deployed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deployment_notes TEXT,
  status VARCHAR(50) DEFAULT 'deployed'
);

-- Create inventory maintenance log table
CREATE TABLE public.inventory_maintenance_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  maintenance_type VARCHAR(100),
  description TEXT,
  performed_by UUID REFERENCES public.profiles(user_id),
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  cost DECIMAL(10, 2),
  next_maintenance_date DATE
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Profiles indexes
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at);

-- User roles indexes
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

-- Sites indexes
CREATE INDEX idx_sites_sector_id ON public.sites(sector_id);
CREATE INDEX idx_sites_city_id ON public.sites(city_id);
CREATE INDEX idx_sites_created_by ON public.sites(created_by);
CREATE INDEX idx_sites_status ON public.sites(status);

-- Site assignments indexes
CREATE INDEX idx_site_assignments_site_id ON public.site_assignments(site_id);
CREATE INDEX idx_site_assignments_ops_manager_id ON public.site_assignments(ops_manager_id);
CREATE INDEX idx_site_assignments_deployment_engineer_id ON public.site_assignments(deployment_engineer_id);

-- Site studies indexes
CREATE INDEX idx_site_studies_site_id ON public.site_studies(site_id);
CREATE INDEX idx_site_studies_conducted_by ON public.site_studies(conducted_by);

-- Site status tracking indexes
CREATE INDEX idx_site_status_tracking_site_id ON public.site_status_tracking(site_id);

-- Inventory indexes
CREATE INDEX idx_inventory_items_category ON public.inventory_items(category);
CREATE INDEX idx_inventory_items_status ON public.inventory_items(status);
CREATE INDEX idx_inventory_items_assigned_to ON public.inventory_items(assigned_to);
CREATE INDEX idx_inventory_items_site_id ON public.inventory_items(site_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sectors_updated_at BEFORE UPDATE ON public.sectors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON public.cities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON public.sites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_assignments_updated_at BEFORE UPDATE ON public.site_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_studies_updated_at BEFORE UPDATE ON public.site_studies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_status_tracking_updated_at BEFORE UPDATE ON public.site_status_tracking FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_licenses_updated_at BEFORE UPDATE ON public.licenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Email normalization trigger
CREATE OR REPLACE FUNCTION public.normalize_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email = LOWER(NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER normalize_profile_email
BEFORE INSERT OR UPDATE OF email ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.normalize_profile_email();

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to get current user roles
CREATE OR REPLACE FUNCTION public.get_current_user_roles()
RETURNS app_role[]
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT ARRAY_AGG(role)
  FROM public.user_roles 
  WHERE user_id = auth.uid()
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- Function to get site with all related data
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
  WHERE s.id = site_uuid
$$;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_status_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_deployment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_maintenance_log ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Allow email existence check for login" 
ON public.profiles 
FOR SELECT 
TO anon
USING (true);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins can insert new profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update profiles" 
ON public.profiles 
FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (public.is_admin());

-- User roles policies
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins can insert roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update roles" 
ON public.user_roles 
FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Admins can delete roles" 
ON public.user_roles 
FOR DELETE 
USING (public.is_admin());

-- Sites policies
CREATE POLICY "Anyone can view sites" 
ON public.sites 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage sites" 
ON public.sites 
FOR ALL 
USING (public.is_admin());

-- Site assignments policies
CREATE POLICY "Anyone can view site assignments" 
ON public.site_assignments 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage site assignments" 
ON public.site_assignments 
FOR ALL 
USING (public.is_admin());

-- Site studies policies
CREATE POLICY "Anyone can view site studies" 
ON public.site_studies 
FOR SELECT 
USING (true);

CREATE POLICY "Admins and deployment engineers can manage site studies" 
ON public.site_studies 
FOR ALL 
USING (
  public.is_admin() OR public.has_role(auth.uid(), 'deployment_engineer')
);

-- Site status tracking policies
CREATE POLICY "Anyone can view site status tracking" 
ON public.site_status_tracking 
FOR SELECT 
USING (true);

CREATE POLICY "Admins and ops managers can manage site status tracking" 
ON public.site_status_tracking 
FOR ALL 
USING (
  public.is_admin() OR public.has_role(auth.uid(), 'ops_manager')
);

-- Inventory policies
CREATE POLICY "Anyone can view inventory items" 
ON public.inventory_items 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage inventory items" 
ON public.inventory_items 
FOR ALL 
USING (public.is_admin());

-- Licenses policies
CREATE POLICY "Anyone can view licenses" 
ON public.licenses 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage licenses" 
ON public.licenses 
FOR ALL 
USING (public.is_admin());

-- Other inventory tables policies
CREATE POLICY "Anyone can view deployment history" 
ON public.inventory_deployment_history 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage deployment history" 
ON public.inventory_deployment_history 
FOR ALL 
USING (public.is_admin());

CREATE POLICY "Anyone can view maintenance log" 
ON public.inventory_maintenance_log 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage maintenance log" 
ON public.inventory_maintenance_log 
FOR ALL 
USING (public.is_admin());

-- Sectors and cities policies
CREATE POLICY "Anyone can view sectors" 
ON public.sectors 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage sectors" 
ON public.sectors 
FOR ALL 
USING (public.is_admin());

CREATE POLICY "Anyone can view cities" 
ON public.cities 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage cities" 
ON public.cities 
FOR ALL 
USING (public.is_admin());

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample sectors
INSERT INTO public.sectors (name, description) VALUES
('Healthcare', 'Hospitals, clinics, and medical facilities'),
('Education', 'Schools, universities, and educational institutions'),
('Corporate', 'Office buildings and corporate headquarters'),
('Retail', 'Shopping centers and retail stores'),
('Transportation', 'Airports, train stations, and transport hubs');

-- Insert sample cities
INSERT INTO public.cities (name, region) VALUES
('London', 'UK'),
('Manchester', 'UK'),
('Birmingham', 'UK'),
('Leeds', 'UK'),
('Liverpool', 'UK'),
('Sheffield', 'UK'),
('Edinburgh', 'UK'),
('Bristol', 'UK'),
('Glasgow', 'UK'),
('Cardiff', 'UK');

-- Insert sample profiles
INSERT INTO public.profiles (user_id, email, full_name, invited_at, invited_by) VALUES
(
  gen_random_uuid(),
  'admin@smartq.com',
  'Admin User',
  now(),
  NULL
),
(
  gen_random_uuid(),
  'ops.manager@smartq.com',
  'Ops Manager',
  now(),
  NULL
),
(
  gen_random_uuid(),
  'deployment.engineer@smartq.com',
  'Deployment Engineer',
  now(),
  NULL
),
(
  gen_random_uuid(),
  'john.doe@compass.com',
  'John Doe',
  now(),
  NULL
),
(
  gen_random_uuid(),
  'jane.smith@compass.com',
  'Jane Smith',
  now(),
  NULL
);

-- Insert user roles
INSERT INTO public.user_roles (user_id, role, assigned_at)
SELECT 
  p.user_id,
  'admin'::app_role,
  now()
FROM public.profiles p
WHERE p.email = 'admin@smartq.com';

INSERT INTO public.user_roles (user_id, role, assigned_at)
SELECT 
  p.user_id,
  'ops_manager'::app_role,
  now()
FROM public.profiles p
WHERE p.email = 'ops.manager@smartq.com';

INSERT INTO public.user_roles (user_id, role, assigned_at)
SELECT 
  p.user_id,
  'deployment_engineer'::app_role,
  now()
FROM public.profiles p
WHERE p.email = 'deployment.engineer@smartq.com';

INSERT INTO public.user_roles (user_id, role, assigned_at)
SELECT 
  p.user_id,
  'ops_manager'::app_role,
  now()
FROM public.profiles p
WHERE p.email = 'john.doe@compass.com';

INSERT INTO public.user_roles (user_id, role, assigned_at)
SELECT 
  p.user_id,
  'deployment_engineer'::app_role,
  now()
FROM public.profiles p
WHERE p.email = 'jane.smith@compass.com';

-- Insert sample sites
INSERT INTO public.sites (name, food_court_unit, sector_id, city_id, address, postcode, cafeteria_type, capacity, expected_footfall, description, created_by)
SELECT 
  'Manchester Central Hospital Cafeteria',
  'FC001',
  s.id,
  c.id,
  '123 Hospital Street, Manchester',
  'M1 1AA',
  'mixed',
  150,
  500,
  'Main cafeteria serving hospital staff and visitors',
  p.user_id
FROM public.sectors s, public.cities c, public.profiles p
WHERE s.name = 'Healthcare' AND c.name = 'Manchester' AND p.email = 'admin@smartq.com';

INSERT INTO public.sites (name, food_court_unit, sector_id, city_id, address, postcode, cafeteria_type, capacity, expected_footfall, description, created_by)
SELECT 
  'London Business Center Cafeteria',
  'FC002',
  s.id,
  c.id,
  '456 Business Avenue, London',
  'EC1A 1BB',
  'staff',
  200,
  800,
  'Corporate cafeteria for office employees',
  p.user_id
FROM public.sectors s, public.cities c, public.profiles p
WHERE s.name = 'Corporate' AND c.name = 'London' AND p.email = 'admin@smartq.com';

INSERT INTO public.sites (name, food_court_unit, sector_id, city_id, address, postcode, cafeteria_type, capacity, expected_footfall, description, created_by)
SELECT 
  'Birmingham University Cafeteria',
  'FC003',
  s.id,
  c.id,
  '789 University Road, Birmingham',
  'B1 1CC',
  'mixed',
  120,
  400,
  'Student and staff cafeteria',
  p.user_id
FROM public.sectors s, public.cities c, public.profiles p
WHERE s.name = 'Education' AND c.name = 'Birmingham' AND p.email = 'admin@smartq.com';

-- Insert site assignments
INSERT INTO public.site_assignments (site_id, ops_manager_id, deployment_engineer_id, assigned_by)
SELECT 
  s.id,
  ops.user_id,
  de.user_id,
  admin.user_id
FROM public.sites s
CROSS JOIN public.profiles ops
CROSS JOIN public.profiles de
CROSS JOIN public.profiles admin
WHERE s.name = 'Manchester Central Hospital Cafeteria'
  AND ops.email = 'ops.manager@smartq.com'
  AND de.email = 'deployment.engineer@smartq.com'
  AND admin.email = 'admin@smartq.com';

INSERT INTO public.site_assignments (site_id, ops_manager_id, deployment_engineer_id, assigned_by)
SELECT 
  s.id,
  ops.user_id,
  de.user_id,
  admin.user_id
FROM public.sites s
CROSS JOIN public.profiles ops
CROSS JOIN public.profiles de
CROSS JOIN public.profiles admin
WHERE s.name = 'London Business Center Cafeteria'
  AND ops.email = 'john.doe@compass.com'
  AND de.email = 'jane.smith@compass.com'
  AND admin.email = 'admin@smartq.com';

-- Insert site status tracking
INSERT INTO public.site_status_tracking (site_id, study_status, cost_approval_status, inventory_status, products_status, deployment_status, overall_status, updated_by)
SELECT 
  s.id,
  'completed',
  'approved',
  'in-progress',
  'pending',
  'pending',
  'in-progress',
  admin.user_id
FROM public.sites s
CROSS JOIN public.profiles admin
WHERE s.name = 'Manchester Central Hospital Cafeteria'
  AND admin.email = 'admin@smartq.com';

INSERT INTO public.site_status_tracking (site_id, study_status, cost_approval_status, inventory_status, products_status, deployment_status, overall_status, updated_by)
SELECT 
  s.id,
  'pending',
  'pending',
  'pending',
  'pending',
  'pending',
  'new',
  admin.user_id
FROM public.sites s
CROSS JOIN public.profiles admin
WHERE s.name = 'London Business Center Cafeteria'
  AND admin.email = 'admin@smartq.com';

-- Insert sample inventory items
INSERT INTO public.inventory_items (name, description, category, manufacturer, model_number, serial_number, quantity, unit_price, total_value, status, location, created_by)
SELECT 
  'SmartQ POS Terminal',
  'Point of sale terminal with touchscreen display',
  'Hardware',
  'SmartQ Technologies',
  'SQ-POS-2024',
  'SQ001234567',
  5,
  1200.00,
  6000.00,
  'available',
  'Warehouse A',
  p.user_id
FROM public.profiles p
WHERE p.email = 'admin@smartq.com';

INSERT INTO public.inventory_items (name, description, category, manufacturer, model_number, serial_number, quantity, unit_price, total_value, status, location, created_by)
SELECT 
  'Payment Card Reader',
  'Contactless payment card reader',
  'Hardware',
  'PaymentTech',
  'PT-CR-001',
  'PT001234567',
  10,
  150.00,
  1500.00,
  'available',
  'Warehouse B',
  p.user_id
FROM public.profiles p
WHERE p.email = 'admin@smartq.com';

-- Insert sample licenses
INSERT INTO public.licenses (name, license_key, license_type, vendor, cost, purchase_date, expiry_date, status, notes, created_by)
SELECT 
  'SmartQ POS Software License',
  'SQ-LIC-2024-001',
  'Perpetual',
  'SmartQ Technologies',
  5000.00,
  '2024-01-15',
  '2025-01-15',
  'active',
  'Main POS software license',
  p.user_id
FROM public.profiles p
WHERE p.email = 'admin@smartq.com';

-- =====================================================
-- FINAL SETUP
-- =====================================================

-- Create unique index for email normalization
CREATE UNIQUE INDEX profiles_email_lower_unique ON public.profiles (LOWER(email));

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify the setup
SELECT 'Profiles count:' as info, COUNT(*) as count FROM public.profiles
UNION ALL
SELECT 'User roles count:', COUNT(*) FROM public.user_roles
UNION ALL
SELECT 'Sites count:', COUNT(*) FROM public.sites
UNION ALL
SELECT 'Sectors count:', COUNT(*) FROM public.sectors
UNION ALL
SELECT 'Cities count:', COUNT(*) FROM public.cities
UNION ALL
SELECT 'Inventory items count:', COUNT(*) FROM public.inventory_items
UNION ALL
SELECT 'Licenses count:', COUNT(*) FROM public.licenses;

-- Show sample data
SELECT 'Sample profiles:' as info;
SELECT email, full_name FROM public.profiles LIMIT 5;

SELECT 'Sample sites:' as info;
SELECT name, food_court_unit, cafeteria_type FROM public.sites LIMIT 5; 