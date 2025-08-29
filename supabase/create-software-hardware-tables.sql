-- Create software_modules table
CREATE TABLE IF NOT EXISTS public.software_modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    monthly_fee DECIMAL(10,2),
    setup_fee DECIMAL(10,2),
    license_fee DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create hardware_items table
CREATE TABLE IF NOT EXISTS public.hardware_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    model VARCHAR(255),
    manufacturer VARCHAR(255),
    unit_cost DECIMAL(10,2),
    installation_cost DECIMAL(10,2),
    maintenance_cost DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for software_modules
ALTER TABLE public.software_modules ENABLE ROW LEVEL SECURITY;

-- Policy for admins to read all software modules
CREATE POLICY "Admins can read all software modules" ON public.software_modules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

-- Policy for admins to insert software modules
CREATE POLICY "Admins can insert software modules" ON public.software_modules
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

-- Policy for admins to update software modules
CREATE POLICY "Admins can update software modules" ON public.software_modules
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

-- Policy for admins to delete software modules
CREATE POLICY "Admins can delete software modules" ON public.software_modules
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

-- Add RLS policies for hardware_items
ALTER TABLE public.hardware_items ENABLE ROW LEVEL SECURITY;

-- Policy for admins to read all hardware items
CREATE POLICY "Admins can read all hardware items" ON public.hardware_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

-- Policy for admins to insert hardware items
CREATE POLICY "Admins can insert hardware items" ON public.hardware_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

-- Policy for admins to update hardware items
CREATE POLICY "Admins can update hardware items" ON public.hardware_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

-- Policy for admins to delete hardware items
CREATE POLICY "Admins can delete hardware items" ON public.hardware_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

-- Insert some sample data for software modules
INSERT INTO public.software_modules (name, description, category, monthly_fee, setup_fee, license_fee) VALUES
('POS System', 'Point of Sale system for retail operations', 'Point of Sale', 50.00, 200.00, 100.00),
('Kitchen Display', 'Kitchen order management system', 'Kitchen Management', 30.00, 150.00, 75.00),
('Inventory Management', 'Stock tracking and management system', 'Inventory Management', 25.00, 100.00, 50.00),
('Customer Management', 'CRM system for customer data', 'Customer Management', 40.00, 180.00, 90.00),
('Analytics & Reporting', 'Business intelligence and reporting tools', 'Analytics & Reporting', 35.00, 120.00, 60.00)
ON CONFLICT DO NOTHING;

-- Insert some sample data for hardware items
INSERT INTO public.hardware_items (name, description, category, model, manufacturer, unit_cost, installation_cost, maintenance_cost) VALUES
('POS Terminal', 'Point of sale terminal for transactions', 'Point of Sale', 'Verifone VX520', 'Verifone', 300.00, 50.00, 25.00),
('Kitchen Display Screen', 'Touch screen for kitchen orders', 'Display', 'Samsung 22"', 'Samsung', 200.00, 75.00, 15.00),
('Network Switch', 'Ethernet switch for network connectivity', 'Networking', 'Cisco SG350', 'Cisco', 150.00, 100.00, 20.00),
('Receipt Printer', 'Thermal receipt printer', 'Printing', 'Star TSP100', 'Star', 80.00, 30.00, 10.00),
('Security Camera', 'IP security camera system', 'Security', 'Hikvision DS-2CD2142FWD', 'Hikvision', 120.00, 60.00, 15.00)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_software_modules_category ON public.software_modules(category);
CREATE INDEX IF NOT EXISTS idx_software_modules_is_active ON public.software_modules(is_active);
CREATE INDEX IF NOT EXISTS idx_hardware_items_category ON public.hardware_items(category);
CREATE INDEX IF NOT EXISTS idx_hardware_items_is_active ON public.hardware_items(is_active);

-- Grant necessary permissions
GRANT ALL ON public.software_modules TO authenticated;
GRANT ALL ON public.hardware_items TO authenticated;
