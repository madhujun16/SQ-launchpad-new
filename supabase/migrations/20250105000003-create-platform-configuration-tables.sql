-- Create platform configuration tables for recommendation rules and business logic
-- This migration creates the infrastructure for managing hardware/software mappings centrally

-- Software modules table
CREATE TABLE IF NOT EXISTS public.software_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    monthly_fee DECIMAL(10,2) DEFAULT 0.00,
    setup_fee DECIMAL(10,2) DEFAULT 0.00,
    category VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Hardware items table
CREATE TABLE IF NOT EXISTS public.hardware_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    unit_cost DECIMAL(10,2) DEFAULT 0.00,
    category VARCHAR(100),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'discontinued')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Recommendation rules table
CREATE TABLE IF NOT EXISTS public.recommendation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    software_module_id UUID NOT NULL REFERENCES public.software_modules(id) ON DELETE CASCADE,
    hardware_item_id UUID NOT NULL REFERENCES public.hardware_items(id) ON DELETE CASCADE,
    default_quantity INTEGER DEFAULT 1 CHECK (default_quantity > 0),
    is_required BOOLEAN DEFAULT true,
    reason TEXT,
    cost_multiplier DECIMAL(5,2) DEFAULT 1.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(software_module_id, hardware_item_id)
);

-- Business rules table
CREATE TABLE IF NOT EXISTS public.business_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('dependency', 'exclusion', 'quantity', 'cost')),
    software_module_ids UUID[] DEFAULT '{}',
    hardware_item_ids UUID[] DEFAULT '{}',
    rule_value TEXT,
    priority INTEGER DEFAULT 1 CHECK (priority > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Configuration audit log table
CREATE TABLE IF NOT EXISTS public.configuration_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recommendation_rules_software ON public.recommendation_rules(software_module_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_rules_hardware ON public.recommendation_rules(hardware_item_id);
CREATE INDEX IF NOT EXISTS idx_business_rules_type ON public.business_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_business_rules_priority ON public.business_rules(priority);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON public.configuration_audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON public.configuration_audit_log(changed_at);

-- Enable Row Level Security
ALTER TABLE public.software_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hardware_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuration_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for software_modules
CREATE POLICY "Admins can manage software modules" ON public.software_modules
    FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view active software modules" ON public.software_modules
    FOR SELECT USING (status = 'active');

-- RLS Policies for hardware_items
CREATE POLICY "Admins can manage hardware items" ON public.hardware_items
    FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view available hardware items" ON public.hardware_items
    FOR SELECT USING (status = 'available');

-- RLS Policies for recommendation_rules
CREATE POLICY "Admins can manage recommendation rules" ON public.recommendation_rules
    FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view recommendation rules" ON public.recommendation_rules
    FOR SELECT USING (true);

-- RLS Policies for business_rules
CREATE POLICY "Admins can manage business rules" ON public.business_rules
    FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view business rules" ON public.business_rules
    FOR SELECT USING (true);

-- RLS Policies for configuration_audit_log
CREATE POLICY "Admins can view audit logs" ON public.configuration_audit_log
    FOR SELECT USING (public.is_admin());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_software_modules_updated_at 
    BEFORE UPDATE ON public.software_modules 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hardware_items_updated_at 
    BEFORE UPDATE ON public.hardware_items 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recommendation_rules_updated_at 
    BEFORE UPDATE ON public.recommendation_rules 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_rules_updated_at 
    BEFORE UPDATE ON public.business_rules 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to log configuration changes
CREATE OR REPLACE FUNCTION public.log_configuration_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.configuration_audit_log (table_name, record_id, action, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.configuration_audit_log (table_name, record_id, action, old_values, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.configuration_audit_log (table_name, record_id, action, old_values, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create triggers for audit logging
CREATE TRIGGER audit_software_modules_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.software_modules
    FOR EACH ROW EXECUTE FUNCTION public.log_configuration_change();

CREATE TRIGGER audit_hardware_items_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.hardware_items
    FOR EACH ROW EXECUTE FUNCTION public.log_configuration_change();

CREATE TRIGGER audit_recommendation_rules_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.recommendation_rules
    FOR EACH ROW EXECUTE FUNCTION public.log_configuration_change();

CREATE TRIGGER audit_business_rules_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.business_rules
    FOR EACH ROW EXECUTE FUNCTION public.log_configuration_change();
