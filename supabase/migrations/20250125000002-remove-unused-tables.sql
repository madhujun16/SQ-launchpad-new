-- Remove unused/legacy tables from SmartQ Launchpad schema
-- This migration removes tables that are not currently used in the application

-- ⚠️  BACKUP YOUR DATABASE BEFORE RUNNING THIS MIGRATION

-- Drop foreign key dependencies first, then remove tables
-- Tables are ordered by dependency to avoid constraint violations

-- Remove approval audit tables (not used)
DROP TABLE IF EXISTS public.approval_actions CASCADE;
DROP TABLE IF EXISTS public.costing_approval_audit_log CASCADE;

-- Remove configuration audit (not used)
DROP TABLE IF EXISTS public.configuration_audit_log CASCADE;

-- Remove deployment management tables (superseded)
DROP TABLE IF EXISTS public.deployment_checklist_items CASCADE;
DROP TABLE IF EXISTS public.deployments CASCADE;

-- Remove hardware request system (not implemented)
DROP TABLE IF EXISTS public.hardware_request_items CASCADE;
DROP TABLE IF EXISTS public.hardware_requests CASCADE;

-- Remove business rules (superseded by recommendation_rules)
DROP TABLE IF EXISTS public.business_rules CASCADE;

-- Remove inventory/license system (mock data only)
DROP TABLE IF EXISTS public.inventory_items CASCADE;
DROP TABLE IF EXISTS public.licenses CASCADE;
DROP TABLE IF EXISTS public.licenses_secure CASCADE;
DROP TABLE IF EXISTS public.maintenance_logs CASCADE;

-- Remove legacy scoping system
DROP TABLE IF EXISTS public.scoping_approvals CASCADE;
DROP TABLE IF EXISTS public.site_hardware_scoping CASCADE;
DROP TABLE IF EXISTS public.site_software_scoping CASCADE;
DROP TABLE IF EXISTS public.site_scoping CASCADE;

-- Remove legacy procurement
DROP TABLE IF EXISTS public.site_procurement_items CASCADE;

-- Remove unused status tracking (status in sites table)
DROP TABLE IF EXISTS public.site_status_tracking CASCADE;

-- Remove legacy studies (superseded by site_study_data)
DROP TABLE IF EXISTS public.site_studies CASCADE;

-- Remove workflow stages (not implemented)
DROP TABLE IF EXISTS public.site_workflow_stages CASCADE;

-- Remove audit/logging tables (not used)
DROP TABLE IF EXISTS public.workflow_audit_logs CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;

-- Remove unused reference tables
DROP TABLE IF EXISTS public.cities CASCADE;
DROP TABLE IF EXISTS public.sectors CASCADE;

-- Remove assets table (not implemented in current app)
DROP TABLE IF EXISTS public.assets CASCADE;

-- Update RLS policies if any referenced removed tables
-- Add necessary grants/revocations for remaining tables

-- Add comment for this migration
COMMENT ON DATABASE postgres IS 'Schema cleaned up on 2025-01-25 - removed unused tables';
