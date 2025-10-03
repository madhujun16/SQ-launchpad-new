-- Fix GRANT permissions for workflow tables
-- Run this script if you encounter GRANT syntax errors

BEGIN;

-- Fix site_procurement_items permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_procurement_items TO authenticated;
GRANT SELECT ON public.site_procurement_items TO anon;

-- Fix site_deployment_status permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_deployment_status TO authenticated;
GRANT SELECT ON public.site_deployment_status TO anon;

-- Fix site_golive_status permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_golive_status TO authenticated;
GRANT SELECT ON public.site_golive_status TO anon;

COMMIT;

-- Verification queries (optional)
-- SELECT 
--   grantee, 
--   table_name, 
--   privilege_type 
-- FROM information_schema.table_privileges 
-- WHERE table_schema = 'public' 
--   AND table_name IN ('site_procurement_items', 'site_deployment_status', 'site_golive_status')
-- ORDER BY table_name, grantee;
