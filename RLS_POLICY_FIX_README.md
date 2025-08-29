# RLS Policy Fix for Software Module Deletion

## Problem Description

You're experiencing a `403 (Forbidden)` error when trying to delete software modules from the "Software and Hardware" page. The error message indicates:

```
new row violates row-level security policy for table "configuration_audit_log"
```

## Root Cause

The issue is caused by a missing Row-Level Security (RLS) policy on the `configuration_audit_log` table:

1. **Database Trigger**: When you delete a software module, a database trigger (`audit_software_modules_changes`) automatically fires
2. **Audit Function**: This trigger calls the `log_configuration_change()` function
3. **Missing Policy**: The function tries to insert an audit log entry into `configuration_audit_log`, but this table only has a SELECT policy, no INSERT policy
4. **RLS Block**: Row-Level Security blocks the insert operation, causing the 403 error

## Solution

Add the missing INSERT policy to the `configuration_audit_log` table.

## How to Fix

### Option 1: Run SQL in Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the following SQL:

```sql
-- Add INSERT policy for configuration_audit_log table
CREATE POLICY IF NOT EXISTS "Authenticated users can insert audit logs" ON public.configuration_audit_log
    FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.role() = 'authenticated');
```

4. Click "Run" to execute the SQL

### Option 2: Use the Provided SQL File

Run the `supabase/fix-rls-policy-simple.sql` file in your Supabase SQL editor.

## Verification

After running the fix, you can verify it worked by running:

```sql
-- Check the policies on configuration_audit_log table
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'configuration_audit_log'
ORDER BY policyname;
```

You should see both the SELECT and INSERT policies listed.

## Expected Result

After applying this fix:
- ✅ You should be able to delete software modules without errors
- ✅ Audit logs will be automatically created when software modules are deleted
- ✅ The deletion operation will complete successfully
- ✅ The audit trail will be maintained for compliance purposes

## Files Modified

- `supabase/fix-rls-policy-simple.sql` - Simple SQL fix
- `supabase/fix-all-audit-log-rls.sql` - Comprehensive fix for all audit log tables
- `RLS_POLICY_FIX_README.md` - This documentation

## Technical Details

The fix adds an INSERT policy that allows authenticated users to insert records into the `configuration_audit_log` table. This is necessary because:

- The audit trigger runs in the context of the authenticated user
- Without an INSERT policy, RLS blocks all insert operations
- The policy `WITH CHECK (auth.role() = 'authenticated')` ensures only authenticated users can insert

This is a secure approach as it maintains the existing SELECT policy (only admins can view audit logs) while allowing the necessary INSERT operations for audit functionality.
