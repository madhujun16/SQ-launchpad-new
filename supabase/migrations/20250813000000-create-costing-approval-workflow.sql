-- Costing Approval Workflow Schema
-- This migration creates the complete costing approval system for hardware/software scoping

-- Create enum for costing approval status
CREATE TYPE public.costing_approval_status AS ENUM (
  'pending_review',
  'approved',
  'rejected',
  'resubmitted'
);

-- Create enum for procurement status
CREATE TYPE public.procurement_status AS ENUM (
  'pending',
  'approved',
  'ordered',
  'in_transit',
  'delivered',
  'installed'
);

-- Create costing_approvals table
CREATE TABLE public.costing_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  deployment_engineer_id UUID NOT NULL REFERENCES public.profiles(user_id),
  ops_manager_id UUID NOT NULL REFERENCES public.profiles(user_id),
  status costing_approval_status DEFAULT 'pending_review',
  total_hardware_cost DECIMAL(10,2) DEFAULT 0,
  total_software_cost DECIMAL(10,2) DEFAULT 0,
  total_license_cost DECIMAL(10,2) DEFAULT 0,
  total_monthly_fees DECIMAL(10,2) DEFAULT 0,
  grand_total DECIMAL(10,2) DEFAULT 0,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(user_id),
  review_comment TEXT,
  rejection_reason TEXT,
  procurement_status procurement_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create costing_items table for detailed item breakdown
CREATE TABLE public.costing_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  costing_approval_id UUID NOT NULL REFERENCES public.costing_approvals(id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL, -- 'hardware', 'software', 'license'
  item_name VARCHAR(255) NOT NULL,
  item_description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  monthly_fee DECIMAL(10,2) DEFAULT 0,
  annual_fee DECIMAL(10,2) DEFAULT 0,
  is_required BOOLEAN DEFAULT true,
  category VARCHAR(100),
  manufacturer VARCHAR(255),
  model VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create costing_approval_audit_log table for tracking all actions
CREATE TABLE public.costing_approval_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  costing_approval_id UUID NOT NULL REFERENCES public.costing_approvals(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL, -- 'submitted', 'approved', 'rejected', 'resubmitted', 'procurement_started'
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  user_role VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  comment TEXT,
  metadata JSONB -- Store additional context like previous values, etc.
);

-- Create indexes for performance
CREATE INDEX idx_costing_approvals_site_id ON public.costing_approvals(site_id);
CREATE INDEX idx_costing_approvals_status ON public.costing_approvals(status);
CREATE INDEX idx_costing_approvals_ops_manager_id ON public.costing_approvals(ops_manager_id);
CREATE INDEX idx_costing_approvals_deployment_engineer_id ON public.costing_approvals(deployment_engineer_id);
CREATE INDEX idx_costing_items_approval_id ON public.costing_items(costing_approval_id);
CREATE INDEX idx_costing_approval_audit_log_approval_id ON public.costing_approval_audit_log(costing_approval_id);

-- Create RLS policies for costing_approvals
ALTER TABLE public.costing_approvals ENABLE ROW LEVEL SECURITY;

-- Users can view costing approvals they're involved with
CREATE POLICY "Users can view involved costing approvals" ON public.costing_approvals
  FOR SELECT USING (
    auth.uid() = deployment_engineer_id OR 
    auth.uid() = ops_manager_id OR 
    public.is_admin()
  );

-- Deployment engineers can create and update their own costing approvals
CREATE POLICY "Deployment engineers can manage own costing approvals" ON public.costing_approvals
  FOR ALL USING (
    auth.uid() = deployment_engineer_id OR 
    public.is_admin()
  );

-- Ops managers can update costing approvals they're assigned to
CREATE POLICY "Ops managers can review assigned costing approvals" ON public.costing_approvals
  FOR UPDATE USING (
    auth.uid() = ops_manager_id OR 
    public.is_admin()
  );

-- Create RLS policies for costing_items
ALTER TABLE public.costing_items ENABLE ROW LEVEL SECURITY;

-- Users can view costing items for approvals they can access
CREATE POLICY "Users can view accessible costing items" ON public.costing_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.costing_approvals ca
      WHERE ca.id = costing_approval_id AND (
        ca.deployment_engineer_id = auth.uid() OR 
        ca.ops_manager_id = auth.uid() OR 
        public.is_admin()
      )
    )
  );

-- Deployment engineers can manage costing items for their approvals
CREATE POLICY "Deployment engineers can manage own costing items" ON public.costing_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.costing_approvals ca
      WHERE ca.id = costing_approval_id AND ca.deployment_engineer_id = auth.uid()
    ) OR public.is_admin()
  );

-- Create RLS policies for costing_approval_audit_log
ALTER TABLE public.costing_approval_audit_log ENABLE ROW LEVEL SECURITY;

-- Users can view audit logs for approvals they can access
CREATE POLICY "Users can view accessible audit logs" ON public.costing_approval_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.costing_approvals ca
      WHERE ca.id = costing_approval_id AND (
        ca.deployment_engineer_id = auth.uid() OR 
        ca.ops_manager_id = auth.uid() OR 
        public.is_admin()
      )
    )
  );

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" ON public.costing_approval_audit_log
  FOR INSERT WITH CHECK (true);

-- Create function to calculate totals automatically
CREATE OR REPLACE FUNCTION public.calculate_costing_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Update totals when costing items change
  UPDATE public.costing_approvals 
  SET 
    total_hardware_cost = (
      SELECT COALESCE(SUM(total_cost), 0) 
      FROM public.costing_items 
      WHERE costing_approval_id = NEW.costing_approval_id AND item_type = 'hardware'
    ),
    total_software_cost = (
      SELECT COALESCE(SUM(total_cost), 0) 
      FROM public.costing_items 
      WHERE costing_approval_id = NEW.costing_approval_id AND item_type = 'software'
    ),
    total_license_cost = (
      SELECT COALESCE(SUM(total_cost), 0) 
      FROM public.costing_items 
      WHERE costing_approval_id = NEW.costing_approval_id AND item_type = 'license'
    ),
    total_monthly_fees = (
      SELECT COALESCE(SUM(monthly_fee), 0) 
      FROM public.costing_items 
      WHERE costing_approval_id = NEW.costing_approval_id
    ),
    grand_total = (
      SELECT COALESCE(SUM(total_cost), 0) 
      FROM public.costing_items 
      WHERE costing_approval_id = NEW.costing_approval_id
    ),
    updated_at = now()
  WHERE id = NEW.costing_approval_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate totals
CREATE TRIGGER trigger_calculate_costing_totals
  AFTER INSERT OR UPDATE OR DELETE ON public.costing_items
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_costing_totals();

-- Create function to log audit events
CREATE OR REPLACE FUNCTION public.log_costing_approval_action(
  p_approval_id UUID,
  p_action VARCHAR(100),
  p_comment TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.costing_approval_audit_log (
    costing_approval_id,
    action,
    user_id,
    user_role,
    comment,
    metadata
  ) VALUES (
    p_approval_id,
    p_action,
    auth.uid(),
    (SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1),
    p_comment,
    p_metadata
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.costing_approvals TO authenticated;
GRANT ALL ON public.costing_items TO authenticated;
GRANT ALL ON public.costing_approval_audit_log TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_costing_totals() TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_costing_approval_action(UUID, VARCHAR, TEXT, JSONB) TO authenticated;
