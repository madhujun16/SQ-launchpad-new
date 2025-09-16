-- Inventory & Deployment Schema for SmartQ LaunchPad
-- This migration creates the complete inventory management system

-- Create enums for inventory management
CREATE TYPE public.inventory_status AS ENUM (
  'available', 
  'deployed', 
  'maintenance', 
  'retired', 
  'lost', 
  'damaged'
);

CREATE TYPE public.inventory_type AS ENUM (
  'pos_machine',
  'ped', 
  'kiosk', 
  'cash_drawer', 
  'printer', 
  'kds_screen',
  'kitchen_printer'
);

CREATE TYPE public.group_type AS ENUM (
  'POS',
  'KMS', 
  'KIOSK'
);

CREATE TYPE public.license_status AS ENUM (
  'active',
  'expired',
  'pending_renewal',
  'suspended'
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
  region VARCHAR(255),
  country VARCHAR(100) DEFAULT 'UK',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, region)
);

-- Create sites table (organizations/food courts)
CREATE TABLE public.sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  food_court_unit VARCHAR(255) NOT NULL, -- This is the constant Food Court (unit)
  sector_id UUID REFERENCES public.sectors(id),
  city_id UUID REFERENCES public.cities(id),
  address TEXT,
  contact_person VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(user_id),
  UNIQUE(food_court_unit)
);

-- Create inventory items table
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  serial_number VARCHAR(255) UNIQUE NOT NULL,
  model VARCHAR(255) NOT NULL,
  manufacturer VARCHAR(255),
  inventory_type inventory_type NOT NULL,
  group_type group_type NOT NULL,
  status inventory_status DEFAULT 'available',
  site_id UUID REFERENCES public.sites(id),
  assigned_to UUID REFERENCES public.profiles(user_id),
  purchase_date DATE,
  warranty_expiry DATE,
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(user_id)
);

-- Create licenses table
CREATE TABLE public.licenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  license_key VARCHAR(500),
  license_type VARCHAR(100) NOT NULL, -- 'hardware', 'software', 'service'
  status license_status DEFAULT 'active',
  start_date DATE NOT NULL,
  expiry_date DATE,
  renewal_date DATE,
  cost DECIMAL(10,2),
  vendor VARCHAR(255),
  site_id UUID REFERENCES public.sites(id),
  inventory_item_id UUID REFERENCES public.inventory_items(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(user_id)
);

-- Create inventory deployment history table
CREATE TABLE public.inventory_deployment_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id),
  from_site_id UUID REFERENCES public.sites(id),
  to_site_id UUID NOT NULL REFERENCES public.sites(id),
  deployed_by UUID NOT NULL REFERENCES public.profiles(user_id),
  deployed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reason TEXT,
  notes TEXT
);

-- Create inventory maintenance log table
CREATE TABLE public.inventory_maintenance_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id),
  maintenance_type VARCHAR(100) NOT NULL, -- 'preventive', 'corrective', 'upgrade'
  description TEXT NOT NULL,
  performed_by UUID REFERENCES public.profiles(user_id),
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  cost DECIMAL(10,2),
  next_maintenance_date DATE,
  notes TEXT
);

-- Enable RLS on all tables
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_deployment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_maintenance_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sectors
CREATE POLICY "Anyone can view sectors" ON public.sectors FOR SELECT USING (true);
CREATE POLICY "Admins can manage sectors" ON public.sectors FOR ALL USING (public.is_admin());

-- Create RLS policies for cities
CREATE POLICY "Anyone can view cities" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Admins can manage cities" ON public.cities FOR ALL USING (public.is_admin());

-- Create RLS policies for sites
CREATE POLICY "Anyone can view sites" ON public.sites FOR SELECT USING (true);
CREATE POLICY "Admins can manage sites" ON public.sites FOR ALL USING (public.is_admin());

-- Create RLS policies for inventory items
CREATE POLICY "Anyone can view inventory items" ON public.inventory_items FOR SELECT USING (true);
CREATE POLICY "Admins can manage inventory items" ON public.inventory_items FOR ALL USING (public.is_admin());
CREATE POLICY "Ops managers can update inventory items" ON public.inventory_items FOR UPDATE USING (
  public.has_role(auth.uid(), 'ops_manager')
);

-- Create RLS policies for licenses
CREATE POLICY "Anyone can view licenses" ON public.licenses FOR SELECT USING (true);
CREATE POLICY "Admins can manage licenses" ON public.licenses FOR ALL USING (public.is_admin());

-- Create RLS policies for deployment history
CREATE POLICY "Anyone can view deployment history" ON public.inventory_deployment_history FOR SELECT USING (true);
CREATE POLICY "Admins can manage deployment history" ON public.inventory_deployment_history FOR ALL USING (public.is_admin());

-- Create RLS policies for maintenance log
CREATE POLICY "Anyone can view maintenance log" ON public.inventory_maintenance_log FOR SELECT USING (true);
CREATE POLICY "Admins can manage maintenance log" ON public.inventory_maintenance_log FOR ALL USING (public.is_admin());

-- Create indexes for better performance
CREATE INDEX idx_inventory_items_site_id ON public.inventory_items(site_id);
CREATE INDEX idx_inventory_items_status ON public.inventory_items(status);
CREATE INDEX idx_inventory_items_type ON public.inventory_items(inventory_type);
CREATE INDEX idx_inventory_items_group_type ON public.inventory_items(group_type);
CREATE INDEX idx_inventory_items_serial_number ON public.inventory_items(serial_number);
CREATE INDEX idx_licenses_site_id ON public.licenses(site_id);
CREATE INDEX idx_licenses_status ON public.licenses(status);
CREATE INDEX idx_sites_sector_id ON public.sites(sector_id);
CREATE INDEX idx_sites_city_id ON public.sites(city_id);

-- Create functions for inventory management
CREATE OR REPLACE FUNCTION public.get_inventory_summary()
RETURNS TABLE (
  total_items BIGINT,
  available_items BIGINT,
  deployed_items BIGINT,
  maintenance_items BIGINT,
  retired_items BIGINT
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    COUNT(*) as total_items,
    COUNT(*) FILTER (WHERE status = 'available') as available_items,
    COUNT(*) FILTER (WHERE status = 'deployed') as deployed_items,
    COUNT(*) FILTER (WHERE status = 'maintenance') as maintenance_items,
    COUNT(*) FILTER (WHERE status = 'retired') as retired_items
  FROM public.inventory_items;
$$;

-- Create function to get inventory by filters
CREATE OR REPLACE FUNCTION public.get_filtered_inventory(
  p_sector_id UUID DEFAULT NULL,
  p_city_id UUID DEFAULT NULL,
  p_site_id UUID DEFAULT NULL,
  p_group_type group_type DEFAULT NULL,
  p_inventory_type inventory_type DEFAULT NULL,
  p_status inventory_status DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  serial_number VARCHAR,
  model VARCHAR,
  manufacturer VARCHAR,
  inventory_type inventory_type,
  group_type group_type,
  status inventory_status,
  site_name VARCHAR,
  sector_name VARCHAR,
  city_name VARCHAR,
  assigned_to_name VARCHAR,
  purchase_date DATE,
  warranty_expiry DATE
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    ii.id,
    ii.serial_number,
    ii.model,
    ii.manufacturer,
    ii.inventory_type,
    ii.group_type,
    ii.status,
    s.name as site_name,
    sec.name as sector_name,
    c.name as city_name,
    p.full_name as assigned_to_name,
    ii.purchase_date,
    ii.warranty_expiry
  FROM public.inventory_items ii
  LEFT JOIN public.sites s ON ii.site_id = s.id
  LEFT JOIN public.sectors sec ON s.sector_id = sec.id
  LEFT JOIN public.cities c ON s.city_id = c.id
  LEFT JOIN public.profiles p ON ii.assigned_to = p.user_id
  WHERE (p_sector_id IS NULL OR s.sector_id = p_sector_id)
    AND (p_city_id IS NULL OR s.city_id = p_city_id)
    AND (p_site_id IS NULL OR ii.site_id = p_site_id)
    AND (p_group_type IS NULL OR ii.group_type = p_group_type)
    AND (p_inventory_type IS NULL OR ii.inventory_type = p_inventory_type)
    AND (p_status IS NULL OR ii.status = p_status);
$$;

-- Insert sample data for testing
INSERT INTO public.sectors (name, description) VALUES
  ('Food & Beverage', 'Restaurants, cafes, and food service establishments'),
  ('Retail', 'General retail and shopping centers'),
  ('Healthcare', 'Hospitals, clinics, and medical facilities'),
  ('Education', 'Schools, universities, and educational institutions'),
  ('Transportation', 'Airports, train stations, and transport hubs');

INSERT INTO public.cities (name, region) VALUES
  ('London', 'Greater London'),
  ('Manchester', 'North West'),
  ('Birmingham', 'West Midlands'),
  ('Leeds', 'Yorkshire and the Humber'),
  ('Liverpool', 'North West'),
  ('Sheffield', 'Yorkshire and the Humber'),
  ('Edinburgh', 'Scotland'),
  ('Bristol', 'South West'),
  ('Glasgow', 'Scotland'),
  ('Leicester', 'East Midlands');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_sectors_updated_at BEFORE UPDATE ON public.sectors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON public.cities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON public.sites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_licenses_updated_at BEFORE UPDATE ON public.licenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); 