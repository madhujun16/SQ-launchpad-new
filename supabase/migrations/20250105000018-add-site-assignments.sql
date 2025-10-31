-- Add assignment columns to sites table
-- These columns are needed for the workflow RLS policies
ALTER TABLE public.sites 
ADD COLUMN assigned_ops_manager UUID REFERENCES public.profiles(user_id),
ADD COLUMN assigned_deployment_engineer UUID REFERENCES public.profiles(user_id);

-- Add indexes for better performance
CREATE INDEX idx_sites_assigned_ops_manager ON public.sites(assigned_ops_manager);
CREATE INDEX idx_sites_assigned_deployment_engineer ON public.sites(assigned_deployment_engineer); 