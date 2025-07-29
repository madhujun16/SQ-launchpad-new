-- Give shivanshu.singh@thesmartq.com all 3 roles
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Get the user_id for shivanshu.singh@thesmartq.com
    SELECT user_id INTO target_user_id 
    FROM public.profiles 
    WHERE email = 'shivanshu.singh@thesmartq.com';
    
    -- If user exists, assign all roles
    IF target_user_id IS NOT NULL THEN
        -- Delete existing roles first to avoid conflicts
        DELETE FROM public.user_roles WHERE user_id = target_user_id;
        
        -- Insert all 4 roles
        INSERT INTO public.user_roles (user_id, role, assigned_by) VALUES
        (target_user_id, 'admin', target_user_id),
        (target_user_id, 'ops_manager', target_user_id),
        (target_user_id, 'deployment_engineer', target_user_id),
        (target_user_id, 'user', target_user_id);
    END IF;
END $$;