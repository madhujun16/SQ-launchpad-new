-- Insert a default admin user
-- This will create a placeholder profile that will be linked when the actual user is created
INSERT INTO public.profiles (user_id, email, full_name, role)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'admin@smartq.com',
  'System Administrator',
  'admin'
) ON CONFLICT (email) DO NOTHING;