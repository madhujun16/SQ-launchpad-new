-- Complete setup script for categories, software_modules, and hardware_items tables

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create software_modules table
CREATE TABLE IF NOT EXISTS software_modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  license_fee DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hardware_items table
CREATE TABLE IF NOT EXISTS hardware_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  manufacturer VARCHAR(255),
  unit_cost DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

CREATE INDEX IF NOT EXISTS idx_software_modules_name ON software_modules(name);
CREATE INDEX IF NOT EXISTS idx_software_modules_category ON software_modules(category);
CREATE INDEX IF NOT EXISTS idx_software_modules_active ON software_modules(is_active);

CREATE INDEX IF NOT EXISTS idx_hardware_items_name ON hardware_items(name);
CREATE INDEX IF NOT EXISTS idx_hardware_items_category ON hardware_items(category);
CREATE INDEX IF NOT EXISTS idx_hardware_items_active ON hardware_items(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_software_modules_updated_at ON software_modules;
CREATE TRIGGER update_software_modules_updated_at
    BEFORE UPDATE ON software_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hardware_items_updated_at ON hardware_items;
CREATE TRIGGER update_hardware_items_updated_at
    BEFORE UPDATE ON hardware_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE software_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE hardware_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for categories
CREATE POLICY "Allow authenticated users to read categories" ON categories
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Allow admin users to insert categories" ON categories
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin users to update categories" ON categories
  FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "Allow admin users to delete categories" ON categories
  FOR UPDATE TO authenticated
  USING (public.is_admin());

-- Create RLS policies for software_modules
CREATE POLICY "Allow authenticated users to read software modules" ON software_modules
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Allow admin users to insert software modules" ON software_modules
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin users to update software modules" ON software_modules
  FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "Allow admin users to delete software modules" ON software_modules
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- Create RLS policies for hardware_items
CREATE POLICY "Allow authenticated users to read hardware items" ON hardware_items
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Allow admin users to insert hardware items" ON hardware_items
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin users to update hardware items" ON hardware_items
  FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "Allow admin users to delete hardware items" ON hardware_items
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- Grant necessary permissions
GRANT SELECT ON categories TO authenticated;
GRANT INSERT, UPDATE ON categories TO authenticated;

GRANT SELECT ON software_modules TO authenticated;
GRANT INSERT, UPDATE, DELETE ON software_modules TO authenticated;

GRANT SELECT ON hardware_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON hardware_items TO authenticated;

-- Insert default categories
INSERT INTO categories (name, description) VALUES
  ('POS', 'Point of Sale systems for transactions'),
  ('Kiosk', 'Self-service kiosk interfaces'),
  ('Kitchen Display (KDS)', 'Kitchen order management systems'),
  ('Inventory', 'Stock tracking and management systems')
ON CONFLICT (name) DO NOTHING;

-- Insert sample software modules
INSERT INTO software_modules (name, description, category, license_fee, is_active) VALUES
  ('POS License', 'Point of Sale software license', 'POS', 25.00, true),
  ('Kiosk License', 'Self-service kiosk software license', 'Kiosk', 15.00, true),
  ('KMS License', 'Kitchen Management System license', 'Kitchen Display (KDS)', 20.00, true),
  ('Inventory License', 'Inventory management software license', 'Inventory', 30.00, true)
ON CONFLICT DO NOTHING;

-- Insert sample hardware items
INSERT INTO hardware_items (name, description, category, manufacturer, unit_cost, is_active) VALUES
  ('15.6" Kitchen Screen', 'Kitchen display screen for order management', 'Kitchen Display (KDS)', 'Samsung', 839.00, true),
  ('ELO Remote Support', 'Remote support service for ELO hardware', 'POS', 'ELO', 259.00, true),
  ('Installation Engineer - Weekday', 'Professional installation service', 'POS', 'SmartQ', 500.00, true),
  ('Printer with Cable', 'Thermal printer with connecting cable', 'POS', 'Epson', 199.00, true),
  ('Wall Mounting Kit (Fixed)', 'Fixed wall mounting kit for displays', 'Kitchen Display (KDS)', 'Generic', 136.00, true)
ON CONFLICT DO NOTHING;
