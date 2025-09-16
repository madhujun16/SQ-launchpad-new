-- Fix critical security vulnerability: Add missing search_path settings to database functions
-- This prevents potential SQL injection and ensures functions operate only on the public schema

-- Fix get_inventory_summary function
CREATE OR REPLACE FUNCTION public.get_inventory_summary()
 RETURNS TABLE(total_items bigint, available_items bigint, deployed_items bigint, maintenance_items bigint, retired_items bigint)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    COUNT(*) as total_items,
    COUNT(*) FILTER (WHERE status = 'available') as available_items,
    COUNT(*) FILTER (WHERE status = 'deployed') as deployed_items,
    COUNT(*) FILTER (WHERE status = 'maintenance') as maintenance_items,
    COUNT(*) FILTER (WHERE status = 'retired') as retired_items
  FROM public.inventory_items;
$function$;

-- Fix get_filtered_inventory function
CREATE OR REPLACE FUNCTION public.get_filtered_inventory(p_site_id uuid DEFAULT NULL::uuid, p_inventory_type inventory_type DEFAULT NULL::inventory_type, p_status inventory_status DEFAULT NULL::inventory_status, p_assigned_to uuid DEFAULT NULL::uuid)
 RETURNS SETOF inventory_items
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT * FROM public.inventory_items
  WHERE 
    (p_site_id IS NULL OR site_id = p_site_id) AND
    (p_inventory_type IS NULL OR inventory_type = p_inventory_type) AND
    (p_status IS NULL OR status = p_status) AND
    (p_assigned_to IS NULL OR assigned_to = p_assigned_to)
  ORDER BY created_at DESC;
$function$;

-- Fix log_audit_event function
CREATE OR REPLACE FUNCTION public.log_audit_event(p_entity text, p_action text, p_details text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.audit_logs (entity, action, user_id, user_name, details, ip_address)
    VALUES (
        p_entity,
        p_action,
        auth.uid(),
        (SELECT full_name FROM public.profiles WHERE user_id = auth.uid()),
        p_details,
        inet_client_addr()
    );
END;
$function$;

-- Fix log_configuration_change function
CREATE OR REPLACE FUNCTION public.log_configuration_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Fix validate_layout_images function
CREATE OR REPLACE FUNCTION public.validate_layout_images()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Ensure layout_images is an array
  IF NEW.layout_images IS NOT NULL AND jsonb_typeof(NEW.layout_images) != 'array' THEN
    RAISE EXCEPTION 'layout_images must be an array';
  END IF;
  
  -- Ensure layout_images_metadata is an array
  IF NEW.layout_images_metadata IS NOT NULL AND jsonb_typeof(NEW.layout_images_metadata) != 'array' THEN
    RAISE EXCEPTION 'layout_images_metadata must be an array';
  END IF;
  
  -- Limit to maximum 3 images
  IF NEW.layout_images IS NOT NULL AND jsonb_array_length(NEW.layout_images) > 3 THEN
    RAISE EXCEPTION 'Maximum 3 layout images allowed';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix seed_notification_preferences function
CREATE OR REPLACE FUNCTION public.seed_notification_preferences()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM auth.users
  LOOP
    INSERT INTO public.notification_preferences (user_id)
    VALUES (user_record.id)
    ON CONFLICT (user_id) DO NOTHING;
  END LOOP;
END;
$function$;

-- Fix log_costing_approval_action function
CREATE OR REPLACE FUNCTION public.log_costing_approval_action(p_approval_id uuid, p_action character varying, p_comment text DEFAULT NULL::text, p_metadata jsonb DEFAULT NULL::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Fix get_site_with_details function
CREATE OR REPLACE FUNCTION public.get_site_with_details(site_uuid uuid)
 RETURNS TABLE(id uuid, name character varying, food_court_unit character varying, address text, postcode character varying, cafeteria_type cafeteria_type, capacity integer, expected_footfall integer, description text, status character varying, created_at timestamp with time zone, updated_at timestamp with time zone, created_by uuid, sector_name character varying, city_name character varying, ops_manager_name character varying, deployment_engineer_name character varying, study_status character varying, cost_approval_status character varying, inventory_status character varying, products_status character varying, deployment_status character varying, overall_status site_status)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    s.id,
    s.name,
    s.food_court_unit,
    s.address,
    s.postcode,
    s.cafeteria_type,
    s.capacity,
    s.expected_footfall,
    s.description,
    s.status,
    s.created_at,
    s.updated_at,
    s.created_by,
    sec.name as sector_name,
    c.name as city_name,
    ops.full_name as ops_manager_name,
    de.full_name as deployment_engineer_name,
    sst.study_status,
    sst.cost_approval_status,
    sst.inventory_status,
    sst.products_status,
    sst.deployment_status,
    sst.overall_status
  FROM public.sites s
  LEFT JOIN public.sectors sec ON s.sector_id = sec.id
  LEFT JOIN public.cities c ON s.city_id = c.id
  LEFT JOIN public.site_assignments sa ON s.id = sa.site_id
  LEFT JOIN public.profiles ops ON sa.ops_manager_id = ops.user_id
  LEFT JOIN public.profiles de ON sa.deployment_engineer_id = de.user_id
  LEFT JOIN public.site_status_tracking sst ON s.id = sst.site_id
  WHERE s.id = site_uuid
$function$;

-- Fix log_license_function_access function
CREATE OR REPLACE FUNCTION public.log_license_function_access(p_function_name text, p_user_role text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.audit_logs (
    entity,
    action,
    user_id,
    user_name,
    details,
    metadata
  ) VALUES (
    'license_functions',
    'FUNCTION_ACCESS',
    auth.uid(),
    (SELECT full_name FROM public.profiles WHERE user_id = auth.uid()),
    'Accessed function: ' || p_function_name,
    jsonb_build_object(
      'function_name', p_function_name,
      'user_role', p_user_role,
      'access_time', now()
    )
  );
END;
$function$;

-- Fix get_user_management_stats function
CREATE OR REPLACE FUNCTION public.get_user_management_stats()
 RETURNS TABLE(total_users bigint, admin_count bigint, ops_manager_count bigint, deployment_engineer_count bigint)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    SELECT 
        COUNT(DISTINCT p.user_id) as total_users,
        COUNT(DISTINCT CASE WHEN ur.role = 'admin' THEN p.user_id END) as admin_count,
        COUNT(DISTINCT CASE WHEN ur.role = 'ops_manager' THEN p.user_id END) as ops_manager_count,
        COUNT(DISTINCT CASE WHEN ur.role = 'deployment_engineer' THEN p.user_id END) as deployment_engineer_count
    FROM public.profiles p
    LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id;
$function$;

-- Fix audit_rls_policies function
CREATE OR REPLACE FUNCTION public.audit_rls_policies()
 RETURNS TABLE(table_name text, policy_name text, policy_definition text, is_secure boolean)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    schemaname||'.'||tablename as table_name,
    policyname as policy_name,
    cmd||' ON '||schemaname||'.'||tablename||' FOR '||permissive||' '||array_to_string(roles, ',')||' USING ('||qual||')' as policy_definition,
    CASE 
      WHEN qual LIKE '%auth.role() = %authenticated%' OR qual LIKE '%public.is_admin%' THEN true
      ELSE false
    END as is_secure
  FROM pg_policies 
  WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'sites', 'site_assignments', 'site_studies', 
                      'inventory_items', 'licenses', 'sectors', 'cities', 'assets')
  ORDER BY tablename, policyname;
$function$;