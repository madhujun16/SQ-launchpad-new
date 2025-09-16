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
  )
ON CONFLICT (email) DO NOTHING;

-- Insert roles for Shivanshu (Admin)
INSERT INTO public.user_roles (user_id, role, assigned_at)
SELECT 
  p.user_id,
  'admin'::app_role,
  now()
FROM public.profiles p
WHERE p.email = 'Shivanshu.singh@thesmartq.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Insert roles for Madhusudhan (Ops Manager and Deployment Engineer)
INSERT INTO public.user_roles (user_id, role, assigned_at)
SELECT 
  p.user_id,
  'ops_manager'::app_role,
  now()
FROM public.profiles p
WHERE p.email = 'Madhusudhan@thesmartq.com'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role, assigned_at)
SELECT 
  p.user_id,
  'deployment_engineer'::app_role,
  now()
FROM public.profiles p
WHERE p.email = 'Madhusudhan@thesmartq.com'
ON CONFLICT (user_id, role) DO NOTHING;