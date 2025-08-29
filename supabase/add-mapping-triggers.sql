-- Add missing triggers and functions for software_hardware_mapping table

-- 1. Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create trigger for software_hardware_mapping table
DROP TRIGGER IF EXISTS update_software_hardware_mapping_updated_at ON public.software_hardware_mapping;
CREATE TRIGGER update_software_hardware_mapping_updated_at 
    BEFORE UPDATE ON public.software_hardware_mapping 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Create audit logging function for mapping changes
CREATE OR REPLACE FUNCTION public.log_mapping_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the change to audit_logs table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        INSERT INTO public.audit_logs (
            user_id,
            action,
            table_name,
            record_id,
            old_values,
            new_values,
            created_at
        ) VALUES (
            auth.uid(),
            CASE 
                WHEN TG_OP = 'INSERT' THEN 'CREATE'
                WHEN TG_OP = 'UPDATE' THEN 'UPDATE'
                WHEN TG_OP = 'DELETE' THEN 'DELETE'
            END,
            'software_hardware_mapping',
            COALESCE(NEW.id, OLD.id),
            CASE WHEN TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
            CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
            NOW()
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create audit triggers for mapping changes
DROP TRIGGER IF EXISTS audit_software_hardware_mapping_changes ON public.software_hardware_mapping;
CREATE TRIGGER audit_software_hardware_mapping_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.software_hardware_mapping
    FOR EACH ROW
    EXECUTE FUNCTION public.log_mapping_change();

-- 5. Create function to get mappings with software and hardware details
CREATE OR REPLACE FUNCTION public.get_mappings_with_details()
RETURNS TABLE (
    id UUID,
    software_module_id UUID,
    software_module_name TEXT,
    software_module_category TEXT,
    hardware_item_id UUID,
    hardware_item_name TEXT,
    hardware_item_category TEXT,
    is_required BOOLEAN,
    quantity INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        shm.id,
        shm.software_module_id,
        sm.name as software_module_name,
        sm.category as software_module_category,
        shm.hardware_item_id,
        hi.name as hardware_item_name,
        hi.category as hardware_item_category,
        shm.is_required,
        shm.quantity,
        shm.created_at,
        shm.updated_at
    FROM public.software_hardware_mapping shm
    JOIN public.software_modules sm ON shm.software_module_id = sm.id
    JOIN public.hardware_items hi ON shm.hardware_item_id = hi.id
    ORDER BY shm.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_mappings_with_details() TO authenticated;

-- 7. Add comments
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Automatically updates updated_at timestamp on table updates';
COMMENT ON FUNCTION public.log_mapping_change() IS 'Logs changes to software_hardware_mapping table for audit purposes';
COMMENT ON FUNCTION public.get_mappings_with_details() IS 'Returns software-hardware mappings with detailed information from related tables';
