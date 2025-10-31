-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'ops_manager', 'deployment_engineer', 'user');

-- Create user_roles table for multiple roles per user
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  assigned_by UUID,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get current user roles
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

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- RLS policies for user_roles
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

-- Remove single role column from profiles and update policies
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- Update profiles policies to use new role system
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert new profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins can insert new profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (public.is_admin());

-- Insert the required users
INSERT INTO public.profiles (user_id, email, full_name, invited_at, invited_by)
VALUES 
  (
    gen_random_uuid(),
    'Shivanshu.singh@thesmartq.com',
    'Shivanshu Singh',
    now(),
    NULL
  ),
  (
    gen_random_uuid(),
    'Madhusudhan@thesmartq.com', 
    'Madhusudhan',
    now(),
    NULL
  );

-- Insert roles for the users
INSERT INTO public.user_roles (user_id, role, assigned_at)
SELECT 
  p.user_id,
  'admin'::app_role,
  now()
FROM public.profiles p
WHERE p.email = 'Shivanshu.singh@thesmartq.com';

INSERT INTO public.user_roles (user_id, role, assigned_at)
SELECT 
  p.user_id,
  'ops_manager'::app_role,
  now()
FROM public.profiles p
WHERE p.email = 'Madhusudhan@thesmartq.com';

INSERT INTO public.user_roles (user_id, role, assigned_at)
SELECT 
  p.user_id,
  'deployment_engineer'::app_role,
  now()
FROM public.profiles p
WHERE p.email = 'Madhusudhan@thesmartq.com';