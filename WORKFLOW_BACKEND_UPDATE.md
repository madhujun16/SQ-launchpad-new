# SmartQ Launchpad - Workflow Backend Update Guide

## Overview

This guide explains the backend changes needed to implement the finalized workflow status sequence in your SmartQ Launchpad application.

## New Workflow Status Sequence

The application now uses this finalized sequence:

1. **Site Created** → 2. **Site Study Done** → 3. **Scoping Done** → 4. **Approved** → 5. **Procurement Done** → 6. **Deployed** → 7. **Live**

## What Changes Are Made

### 1. Database Schema Updates
- **New Status Enum**: Updated with finalized status values
- **Status Migration**: All existing sites migrated to new status values
- **Workflow Audit Table**: New table to track all status transitions
- **Validation Functions**: Database-level validation for status progression
- **Triggers**: Automatic validation of status changes
- **Indexes**: Performance optimizations for status queries

### 2. Security & Validation
- **Progression Rules**: Enforced at database level (no skipping steps)
- **Role-Based Permissions**: Different roles can make different transitions
- **Admin Overrides**: Admins can bypass progression rules (with audit trail)
- **Audit Logging**: Every status change is logged with user, timestamp, and reason

### 3. New Database Objects Created

#### Tables
- `workflow_audit_logs` - Tracks all status transitions

#### Functions
- `validate_status_progression()` - Validates status transitions
- `get_workflow_statistics()` - Returns workflow stats for dashboard
- `validate_site_status_change()` - Trigger function for validation

#### Triggers
- `validate_site_status_trigger` - Validates status changes before they happen

## How to Apply the Changes

### Quick Setup (Recommended)

**For Windows:**
```cmd
update-workflow-backend.bat
```

**For Mac/Linux:**
```bash
chmod +x update-workflow-backend.sh
./update-workflow-backend.sh
```

### Manual Setup

If you prefer to run the migration manually:

```bash
# 1. Ensure Supabase is running
supabase start

# 2. Apply the migration
supabase db push

# 3. Verify the changes
supabase db diff
```

## What the Migration Does

### 1. Status Value Migration
```sql
-- Old Status → New Status
'created' → 'site_created'
'study_completed' → 'site_study_done' 
'hardware_scoped' → 'scoping_done'
'procurement' → 'procurement_done'
'deployment' → 'deployed'
'activated' → 'live'
```

### 2. Audit Logging
Every status change creates an audit log entry with:
- Site ID
- From/To status
- User who made the change
- User role
- Timestamp
- Reason (optional)
- Admin override flag

### 3. Validation Rules
- Users can only progress to the next logical status
- No skipping steps (unless admin override)
- No going backwards in the workflow
- Role-based permissions enforced

## Role-Based Permissions

| Role | Can Transition From | Can Transition To |
|------|-------------------|------------------|
| **ops_manager** | site_created, site_study_done, scoping_done | site_study_done, scoping_done, approved |
| **deployment_engineer** | approved, procurement_done | procurement_done, deployed, live |
| **admin** | Any status | Any status (with override logging) |

## Verification Steps

After running the migration, verify:

1. **Check Sites Table**:
   ```sql
   SELECT status, COUNT(*) FROM sites GROUP BY status;
   ```

2. **Check Audit Table**:
   ```sql
   SELECT * FROM workflow_audit_logs ORDER BY created_at DESC LIMIT 5;
   ```

3. **Test Status Progression**:
   ```sql
   SELECT validate_status_progression('site_created', 'site_study_done', 'ops_manager');
   ```

4. **Get Workflow Stats**:
   ```sql
   SELECT get_workflow_statistics();
   ```

## Frontend Integration

The frontend is already updated and will automatically:
- Display new status labels
- Use new status values in API calls
- Show workflow progression validation
- Display audit trail information
- Enforce role-based UI restrictions

## Troubleshooting

### Common Issues

1. **Migration Fails**
   - Check database permissions
   - Ensure Supabase is running
   - Verify project configuration

2. **Status Validation Errors**
   - Check user roles are properly set in `user_roles` table
   - Verify status transition is valid
   - Use admin role for overrides

3. **Audit Logs Not Creating**
   - Check RLS policies
   - Verify user authentication
   - Check application integration

4. **Role Column Error**
   - Ensure you're using the updated migration script
   - The script now correctly references `user_roles` table instead of `profiles.role`
   - Verify your database has the `user_roles` table with `app_role` enum

### Getting Help

If you encounter issues:
1. Check the migration file: `supabase/migrations/20250119000000-implement-finalized-workflow-statuses.sql`
2. Review Supabase logs: `supabase logs`
3. Check database status: `supabase status`

## API Changes

### New Endpoints Available
Your WorkflowService now provides:
- `transitionSiteStatus()` - Transition with validation
- `getValidNextStatuses()` - Get allowed next statuses
- `getSiteAuditLogs()` - Get audit trail
- `getWorkflowStats()` - Get dashboard statistics

### Status Values
Always use the new status values in API calls:
- `site_created`
- `site_study_done`
- `scoping_done`
- `approved`
- `procurement_done`
- `deployed`
- `live`

## Rollback Plan

If you need to rollback:
1. The migration includes backward compatibility
2. Legacy status values are still supported
3. You can manually update status values if needed

## Next Steps

1. ✅ Run the migration script
2. ✅ Test status transitions in the UI
3. ✅ Verify audit logging is working
4. ✅ Check dashboard statistics
5. ✅ Train users on new workflow sequence

Your SmartQ Launchpad now has a robust, secure, and auditable workflow system! 🎉
