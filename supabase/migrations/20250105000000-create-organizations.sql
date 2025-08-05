-- Create organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- RLS policies for organizations
CREATE POLICY "Admins can view all organizations" 
ON public.organizations 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins can insert organizations" 
ON public.organizations 
FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update organizations" 
ON public.organizations 
FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Admins can delete organizations" 
ON public.organizations 
FOR DELETE 
USING (public.is_admin()); 