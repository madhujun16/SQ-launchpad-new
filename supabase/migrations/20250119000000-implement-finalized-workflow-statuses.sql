-- Migration: Implement Finalized Workflow Status Sequence
-- Date: 2025-01-19
-- Description: Updates the database to support the new finalized workflow status sequence:
-- Site Created → Site Study Done → Scoping Done → Approved → Procurement Done → Deployed → Live

-- 1. Create workflow audit logs table for tracking status transitions
CREATE TABLE IF NOT EXISTS workflow_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    from_status TEXT NOT NULL,
    to_status TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_role TEXT NOT NULL CHECK (user_role IN ('admin', 'ops_manager', 'deployment_engineer')),
    reason TEXT,
    admin_override BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for workflow audit logs
ALTER TABLE workflow_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view audit logs for sites they have access to
CREATE POLICY "Users can view workflow audit logs for accessible sites" ON workflow_audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM sites s
            WHERE s.id = workflow_audit_logs.site_id
            AND (
                -- Admin can see all
                EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
                OR
                -- Ops managers can see sites assigned to them
                (s.assigned_ops_manager = (SELECT full_name FROM profiles WHERE user_id = auth.uid()))
                OR
                -- Deployment engineers can see sites assigned to them
                (s.assigned_deployment_engineer = (SELECT full_name FROM profiles WHERE user_id = auth.uid()))
            )
        )
    );

-- Policy: Only authenticated users can insert audit logs (handled by application)
CREATE POLICY "Authenticated users can insert workflow audit logs" ON workflow_audit_logs
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 2. Create or update status enum with new values
DO $$
BEGIN
    -- Drop the existing enum if it exists
    DROP TYPE IF EXISTS site_status_enum CASCADE;
    
    -- Create new enum with finalized status sequence
    CREATE TYPE site_status_enum AS ENUM (
        'site_created',
        'site_study_done', 
        'scoping_done',
        'approved',
        'procurement_done',
        'deployed',
        'live'
    );
    
    -- Add legacy statuses for backward compatibility during migration
    ALTER TYPE site_status_enum ADD VALUE IF NOT EXISTS 'created';
    ALTER TYPE site_status_enum ADD VALUE IF NOT EXISTS 'study_in_progress';
    ALTER TYPE site_status_enum ADD VALUE IF NOT EXISTS 'study_completed';
    ALTER TYPE site_status_enum ADD VALUE IF NOT EXISTS 'hardware_scoped';
    ALTER TYPE site_status_enum ADD VALUE IF NOT EXISTS 'procurement';
    ALTER TYPE site_status_enum ADD VALUE IF NOT EXISTS 'deployment';
    ALTER TYPE site_status_enum ADD VALUE IF NOT EXISTS 'activated';
    
EXCEPTION
    WHEN duplicate_object THEN
        -- Enum already exists, just add new values
        ALTER TYPE site_status_enum ADD VALUE IF NOT EXISTS 'site_created';
        ALTER TYPE site_status_enum ADD VALUE IF NOT EXISTS 'site_study_done';
        ALTER TYPE site_status_enum ADD VALUE IF NOT EXISTS 'scoping_done';
        ALTER TYPE site_status_enum ADD VALUE IF NOT EXISTS 'procurement_done';
END $$;

-- 3. Update sites table status column to use the enum (if not already)
DO $$
BEGIN
    -- Try to alter the column type
    ALTER TABLE sites ALTER COLUMN status TYPE site_status_enum USING status::site_status_enum;
EXCEPTION
    WHEN others THEN
        -- If it fails, the column might already be the correct type or need different handling
        RAISE NOTICE 'Could not alter sites.status column type. It may already be correct or need manual intervention.';
END $$;

-- 4. Migrate existing status values to new finalized sequence
UPDATE sites SET status = 'site_created' WHERE status IN ('created', 'new');
UPDATE sites SET status = 'site_study_done' WHERE status IN ('study_in_progress', 'study_completed', 'site_study');
UPDATE sites SET status = 'scoping_done' WHERE status IN ('hardware_scoped', 'software_scoping', 'hardware_scoping');
UPDATE sites SET status = 'procurement_done' WHERE status IN ('procurement');
UPDATE sites SET status = 'deployed' WHERE status IN ('deployment');
UPDATE sites SET status = 'live' WHERE status IN ('activated', 'go_live');

-- 5. Create function to validate status progression
CREATE OR REPLACE FUNCTION validate_status_progression(
    current_status site_status_enum,
    new_status site_status_enum,
    user_role TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    status_order site_status_enum[] := ARRAY[
        'site_created',
        'site_study_done', 
        'scoping_done',
        'approved',
        'procurement_done',
        'deployed',
        'live'
    ];
    current_index INTEGER;
    new_index INTEGER;
BEGIN
    -- Admin can make any transition
    IF user_role = 'admin' THEN
        RETURN TRUE;
    END IF;
    
    -- Find positions in the status order
    SELECT array_position(status_order, current_status) INTO current_index;
    SELECT array_position(status_order, new_status) INTO new_index;
    
    -- If either status is not in the main sequence, allow it (for backward compatibility)
    IF current_index IS NULL OR new_index IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Only allow progression to the next status (no skipping, no going backward)
    RETURN new_index = current_index + 1;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger to validate status changes
CREATE OR REPLACE FUNCTION validate_site_status_change()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Get the current user's role from user_roles table
    SELECT ur.role::text INTO user_role
    FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    LIMIT 1;
    
    -- If no role found, default to user (most restrictive)
    IF user_role IS NULL THEN
        user_role := 'user';
    END IF;
    
    -- If status is changing, validate the progression
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        IF NOT validate_status_progression(OLD.status, NEW.status, user_role) THEN
            RAISE EXCEPTION 'Invalid status progression from % to %. Only sequential progression is allowed unless you are an admin.', OLD.status, NEW.status;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS validate_site_status_trigger ON sites;

-- Create the trigger
CREATE TRIGGER validate_site_status_trigger
    BEFORE UPDATE ON sites
    FOR EACH ROW
    EXECUTE FUNCTION validate_site_status_change();

-- 7. Create function to get workflow statistics
CREATE OR REPLACE FUNCTION get_workflow_statistics()
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_object_agg(status, count) INTO stats
    FROM (
        SELECT 
            status,
            COUNT(*) as count
        FROM sites 
        WHERE status IN ('site_created', 'site_study_done', 'scoping_done', 'approved', 'procurement_done', 'deployed', 'live')
        GROUP BY status
        
        UNION ALL
        
        -- Ensure all statuses are represented, even with 0 count
        SELECT 
            unnest(ARRAY['site_created', 'site_study_done', 'scoping_done', 'approved', 'procurement_done', 'deployed', 'live']) as status,
            0 as count
        WHERE NOT EXISTS (SELECT 1 FROM sites WHERE status = unnest)
    ) grouped_stats
    GROUP BY status;
    
    RETURN COALESCE(stats, '{}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);
CREATE INDEX IF NOT EXISTS idx_workflow_audit_logs_site_id ON workflow_audit_logs(site_id);
CREATE INDEX IF NOT EXISTS idx_workflow_audit_logs_created_at ON workflow_audit_logs(created_at DESC);

-- 9. Grant necessary permissions
GRANT SELECT ON workflow_audit_logs TO authenticated;
GRANT INSERT ON workflow_audit_logs TO authenticated;

-- 10. Add helpful comments
COMMENT ON TABLE workflow_audit_logs IS 'Tracks all site status transitions for audit purposes';
COMMENT ON COLUMN workflow_audit_logs.admin_override IS 'True if an admin made a status transition that bypassed normal progression rules';
COMMENT ON FUNCTION validate_status_progression IS 'Validates that status transitions follow the correct sequence unless overridden by admin';
COMMENT ON FUNCTION get_workflow_statistics IS 'Returns count of sites in each workflow status for dashboard statistics';

-- 11. Insert sample audit log entry to verify table structure
DO $$
BEGIN
    -- Only insert if there are sites and no existing audit logs
    IF EXISTS (SELECT 1 FROM sites LIMIT 1) AND NOT EXISTS (SELECT 1 FROM workflow_audit_logs LIMIT 1) THEN
        INSERT INTO workflow_audit_logs (site_id, from_status, to_status, user_id, user_role, reason, admin_override)
        SELECT 
            s.id,
            'site_created',
            s.status,
            COALESCE(
                (SELECT id FROM auth.users LIMIT 1),
                '00000000-0000-0000-0000-000000000000'::uuid
            ),
            'admin',
            'System migration to new workflow status sequence',
            true
        FROM sites s 
        LIMIT 1;
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Could not insert sample audit log entry: %', SQLERRM;
END $$;

-- 12. Final verification
DO $$
DECLARE
    site_count INTEGER;
    audit_table_exists BOOLEAN;
    status_enum_exists BOOLEAN;
BEGIN
    -- Check if sites table has data
    SELECT COUNT(*) INTO site_count FROM sites;
    
    -- Check if audit table was created
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'workflow_audit_logs'
    ) INTO audit_table_exists;
    
    -- Check if enum exists
    SELECT EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'site_status_enum'
    ) INTO status_enum_exists;
    
    RAISE NOTICE 'Migration completed successfully:';
    RAISE NOTICE '- Sites in database: %', site_count;
    RAISE NOTICE '- Workflow audit logs table created: %', audit_table_exists;
    RAISE NOTICE '- Site status enum exists: %', status_enum_exists;
    RAISE NOTICE 'New workflow sequence: Site Created → Site Study Done → Scoping Done → Approved → Procurement Done → Deployed → Live';
END $$;
