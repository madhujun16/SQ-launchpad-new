-- Fix the RLS policies for categories table
-- Drop existing policies first
DROP POLICY IF EXISTS "Allow authenticated users to read categories" ON categories;
DROP POLICY IF EXISTS "Allow admin users to insert categories" ON categories;
DROP POLICY IF EXISTS "Allow admin users to update categories" ON categories;
DROP POLICY IF EXISTS "Allow admin users to delete categories" ON categories;

-- Create simpler RLS policies that work with your current setup
CREATE POLICY "Allow authenticated users to read categories" ON categories
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Allow authenticated users to manage categories" ON categories
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON categories TO authenticated;
