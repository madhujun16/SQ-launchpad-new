-- Create general_settings table for platform configuration
CREATE TABLE IF NOT EXISTS public.general_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date_format VARCHAR(50) DEFAULT 'dd-mmm-yyyy',
  currency VARCHAR(10) DEFAULT 'GBP',
  fy_budget DECIMAL(15,2) DEFAULT 500000,
  site_targets INTEGER DEFAULT 1000,
  approval_response_time INTEGER DEFAULT 24, -- in hours
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.general_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage general settings" ON public.general_settings
  FOR ALL USING (is_admin());

CREATE POLICY "Authenticated users can read general settings" ON public.general_settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Insert default settings if none exist
INSERT INTO public.general_settings (date_format, currency, fy_budget, site_targets, approval_response_time)
VALUES ('dd-mmm-yyyy', 'GBP', 500000, 1000, 24)
ON CONFLICT DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_general_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_general_settings_updated_at
  BEFORE UPDATE ON public.general_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_general_settings_updated_at();
