-- Create software_modules table if it doesn't exist
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

-- Create hardware_items table if it doesn't exist
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
CREATE INDEX IF NOT EXISTS idx_software_modules_name ON software_modules(name);
CREATE INDEX IF NOT EXISTS idx_software_modules_category ON software_modules(category);
CREATE INDEX IF NOT EXISTS idx_software_modules_active ON software_modules(is_active);

CREATE INDEX IF NOT EXISTS idx_hardware_items_name ON hardware_items(name);
CREATE INDEX IF NOT EXISTS idx_hardware_items_category ON hardware_items(category);
CREATE INDEX IF NOT EXISTS idx_hardware_items_active ON hardware_items(is_active);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
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
ALTER TABLE software_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE hardware_items ENABLE ROW LEVEL SECURITY;

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
GRANT SELECT ON software_modules TO authenticated;
GRANT INSERT, UPDATE, DELETE ON software_modules TO authenticated;

GRANT SELECT ON hardware_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON hardware_items TO authenticated;

-- Insert some sample data if tables are empty
INSERT INTO software_modules (name, description, category, license_fee, is_active) VALUES
  ('POS License', 'Point of Sale software license', 'POS', 25.00, true),
  ('Kiosk License', 'Self-service kiosk software license', 'Kiosk', 15.00, true),
  ('KMS License', 'Kitchen Management System license', 'Kitchen Display (KDS)', 20.00, true),
  ('Inventory License', 'Inventory management software license', 'Inventory', 30.00, true)
ON CONFLICT DO NOTHING;

INSERT INTO hardware_items (name, description, category, manufacturer, unit_cost, is_active) VALUES
  ('15.6" Kitchen Screen', 'Kitchen display screen for order management', 'Kitchen Display (KDS)', 'Samsung', 839.00, true),
  ('ELO Remote Support', 'Remote support service for ELO hardware', 'POS', 'ELO', 259.00, true),
  ('Installation Engineer - Weekday', 'Professional installation service', 'POS', 'SmartQ', 500.00, true),
  ('Printer with Cable', 'Thermal printer with connecting cable', 'POS', 'Epson', 199.00, true),
  ('Wall Mounting Kit (Fixed)', 'Fixed wall mounting kit for displays', 'Kitchen Display (KDS)', 'Generic', 136.00, true)
ON CONFLICT DO NOTHING;
