-- User Management Performance Optimization
-- This script optimizes the database for better user management performance
-- Run this script in your Supabase SQL editor

-- 1. Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 2. Create a composite index for the most common query pattern
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON public.user_roles(user_id, role);

-- 3. Add partial indexes for role-specific queries
CREATE INDEX IF NOT EXISTS idx_user_roles_admin ON public.user_roles(user_id) WHERE role = 'admin';
CREATE INDEX IF NOT EXISTS idx_user_roles_ops_manager ON public.user_roles(user_id) WHERE role = 'ops_manager';
CREATE INDEX IF NOT EXISTS idx_user_roles_deployment_engineer ON public.user_roles(user_id) WHERE role = 'deployment_engineer';

-- 4. Optimize table statistics (run this periodically)
ANALYZE public.profiles;
ANALYZE public.user_roles;

-- 5. Create a materialized view for user statistics (optional, for very large datasets)
-- This can be refreshed periodically for better performance on statistics queries
CREATE MATERIALIZED VIEW IF NOT EXISTS user_statistics AS
SELECT 
  COUNT(DISTINCT ur.user_id) as total_users,
  COUNT(CASE WHEN ur.role = 'admin' THEN 1 END) as admin_count,
  COUNT(CASE WHEN ur.role = 'ops_manager' THEN 1 END) as ops_manager_count,
  COUNT(CASE WHEN ur.role = 'deployment_engineer' THEN 1 END) as deployment_engineer_count,
  NOW() as last_updated
FROM public.user_roles ur;

-- Create index on the materialized view
CREATE INDEX IF NOT EXISTS idx_user_statistics_last_updated ON user_statistics(last_updated);

-- 6. Grant necessary permissions
GRANT SELECT ON user_statistics TO authenticated;

-- 7. Create a function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_user_statistics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW user_statistics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION refresh_user_statistics() TO authenticated;

-- 8. Performance monitoring queries (run these to check performance)
-- Check if indexes are being used
EXPLAIN (ANALYZE, BUFFERS) 
SELECT p.*, ur.role 
FROM profiles p 
JOIN user_roles ur ON p.user_id = ur.user_id 
ORDER BY p.created_at DESC;

-- Check user statistics performance
EXPLAIN (ANALYZE, BUFFERS) 
SELECT 
  COUNT(DISTINCT ur.user_id) as total_users,
  COUNT(CASE WHEN ur.role = 'admin' THEN 1 END) as admin_count,
  COUNT(CASE WHEN ur.role = 'ops_manager' THEN 1 END) as ops_manager_count,
  COUNT(CASE WHEN ur.role = 'deployment_engineer' THEN 1 END) as deployment_engineer_count
FROM user_roles ur;
