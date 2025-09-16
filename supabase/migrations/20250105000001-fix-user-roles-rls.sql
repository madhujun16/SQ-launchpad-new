-- Drop existing RLS policies on user_roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete user roles" ON public.user_roles;

-- Create simplified RLS policies for user_roles table
CREATE POLICY "Enable read access for authenticated users" 
ON public.user_roles 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" 
ON public.user_roles 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" 
ON public.user_roles 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Also fix profiles table RLS if needed
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

CREATE POLICY "Enable read access for authenticated users" 
ON public.profiles 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" 
ON public.profiles 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" 
ON public.profiles 
FOR DELETE 
USING (auth.role() = 'authenticated'); 