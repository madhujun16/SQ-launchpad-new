-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

-- Insert default categories
INSERT INTO categories (name, description) VALUES
  ('POS', 'Point of Sale systems for transactions'),
  ('Kiosk', 'Self-service kiosk interfaces'),
  ('Kitchen Display (KDS)', 'Kitchen order management systems'),
  ('Inventory', 'Stock tracking and management systems')
ON CONFLICT (name) DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to categories table
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies using the existing is_admin() function
-- Allow all authenticated users to read categories
CREATE POLICY "Allow authenticated users to read categories" ON categories
  FOR SELECT TO authenticated
  USING (is_active = true);

-- Allow admin users to insert categories
CREATE POLICY "Allow admin users to insert categories" ON categories
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

-- Allow admin users to update categories
CREATE POLICY "Allow admin users to update categories" ON categories
  FOR UPDATE TO authenticated
  USING (public.is_admin());

-- Allow admin users to delete categories (soft delete by setting is_active = false)
CREATE POLICY "Allow admin users to delete categories" ON categories
  FOR UPDATE TO authenticated
  USING (public.is_admin());

-- Grant necessary permissions
GRANT SELECT ON categories TO authenticated;
GRANT INSERT, UPDATE ON categories TO authenticated;
