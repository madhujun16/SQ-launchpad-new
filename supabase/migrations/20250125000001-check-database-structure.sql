-- Database structure verification script
-- Run this to check what tables and columns actually exist before running cleanup

-- Check if costing_approvals table exists and what columns it has
DO $$
BEGIN
    RAISE NOTICE 'Checking costing_approvals table...';
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'costing_approvals') THEN
        RAISE NOTICE 'costing_approvals table EXISTS';
        
        -- List all columns in costing_approvals
        PERFORM column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'costing_approvals'
        ORDER BY ordinal_position;
        
    ELSE
        RAISE NOTICE 'costing_approvals table DOES NOT EXIST';
    END IF;
END $$;

-- Check if costing_items table exists
DO $$
BEGIN
    RAISE NOTICE 'Checking costing_items table...';
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'costing_items') THEN
        RAISE NOTICE 'costing_items table EXISTS';
        
        -- List all columns in costing_items
        PERFORM column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'costing_items'
        ORDER BY ordinal_position;
        
    ELSE
        RAISE NOTICE 'costing_items table DOES NOT EXIST';
    END IF;
END $$;

-- Check what custom types exist
DO $$
BEGIN
    RAISE NOTICE 'Checking custom types...';
    
    PERFORM typname 
    FROM pg_type 
    WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    AND typtype = 'e'  -- enum types
    ORDER BY typname;
    
END $$;

-- Show all tables that match our migration targets
SELECT 
    table_name,
    (SELECT string_agg(column_name || ' (' || data_type || ')', ', ')
     FROM information_schema.columns 
     WHERE information_schema.columns.table_name = information_schema.tables.table_name
     AND table_schema = 'public')
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'costing_approvals', 'costing_items', 'costing_approval_audit_log',
    'scoping_approvals', 'business_rules', 'assets', 'inventory_items',
    'licenses', 'licenses_secure', 'maintenance_logs', 'deployments'
)
ORDER BY table_name;

-- Add comment
COMMENT ON DATABASE postgres IS 'Database structure verified on 2025-01-25';
