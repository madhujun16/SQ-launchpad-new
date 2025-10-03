-- Fix: Check if costing_approvals.status column exists before creating index
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'costing_approvals' 
        AND column_name = 'status'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_costing_approvals_status ON public.costing_approvals(status);
        RAISE NOTICE 'Created costing_approvals status index';
    ELSE
        RAISE NOTICE 'costing_approvals.status column does not exist, skipping index creation';
    END IF;
END $$;
