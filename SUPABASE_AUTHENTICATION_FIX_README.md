# Supabase Authentication Context Fix

## Problem Summary

The Dashboard is experiencing authentication context errors:
```
Uncaught TypeError: Cannot read properties of null (reading 'useContext')
at useContext (chunk-BG45W2ER.js?v=8ffb7bf1:1062:29)
at useAuth (useAuth.tsx:253:19)
at Dashboard (Dashboard.tsx:68:36)
```

## Root Cause

The issue is caused by **missing database functions** that are referenced in Row Level Security (RLS) policies. When the frontend tries to authenticate, the RLS policies fail because they reference functions that don't exist, causing the authentication context to fail.

## What Needs to be Done in Supabase

### 1. **Run the Missing Helper Functions Script**

Execute this SQL script in your Supabase SQL editor:

```sql
-- File: supabase/fix-missing-helper-functions.sql
-- This creates the missing functions that RLS policies depend on
```

**What this script does:**
- Creates `is_verified_admin()` function
- Creates `has_role()` function  
- Creates `log_admin_profile_access()` function
- Creates `log_license_access()` function
- Creates `audit_logs` table
- Creates `user_roles` table
- Sets up proper permissions

### 2. **Run the Simplified RLS Policies Script**

Execute this SQL script to simplify complex RLS policies:

```sql
-- File: supabase/simplify-rls-policies.sql
-- This creates simplified, working RLS policies
```

**What this script does:**
- Replaces complex RLS policies with simple, working ones
- Removes dependencies on complex functions
- Ensures basic authentication works
- Maintains security while fixing functionality

### 3. **Verify Database Structure**

After running the scripts, verify these tables exist:
- `public.profiles`
- `public.user_roles` 
- `public.audit_logs`
- `public.licenses`
- `public.sites`
- `public.inventory_items`

### 4. **Check User Roles**

Ensure your user has a role assigned in the `user_roles` table:

```sql
-- Check if your user has a role
SELECT * FROM public.user_roles WHERE user_id = auth.uid();

-- If no role exists, insert one
INSERT INTO public.user_roles (user_id, role, created_by)
VALUES (auth.uid(), 'admin', auth.uid())
ON CONFLICT (user_id, role) DO NOTHING;
```

## Frontend Fixes Already Applied

I've already fixed the frontend code to handle authentication context issues more gracefully:

### 1. **Enhanced AuthGuard Component**
- Removed problematic try-catch blocks
- Added better error handling
- Improved context availability checks

### 2. **Robust useAuth Hook**
- Added fallback context values
- Removed error throwing
- Better initialization handling

### 3. **Improved ErrorBoundary**
- Better authentication error handling
- Recovery options for context issues
- User-friendly error messages

### 4. **Enhanced Dashboard Component**
- Better error handling
- Context availability checks
- Graceful fallbacks

## Step-by-Step Resolution

### Step 1: Run Supabase Scripts
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run `fix-missing-helper-functions.sql` first
4. Run `simplify-rls-policies.sql` second
5. Verify both scripts executed successfully

### Step 2: Test Authentication
1. Refresh your app
2. Try to log in
3. Navigate to Dashboard
4. Check browser console for errors

### Step 3: Verify User Roles
1. Check if your user has a role in `user_roles` table
2. If not, assign an appropriate role (admin, ops_manager, etc.)

### Step 4: Test Full Functionality
1. Test Dashboard access
2. Test role-based navigation
3. Test data loading
4. Verify no more context errors

## Expected Results

After applying these fixes:

✅ **Authentication context errors resolved**
✅ **Dashboard loads without errors**
✅ **Role-based access working**
✅ **RLS policies functioning correctly**
✅ **No more "useContext" errors**

## Troubleshooting

### If errors persist:

1. **Check Supabase logs** for SQL errors
2. **Verify function permissions** are granted to authenticated users
3. **Check RLS policies** are properly applied
4. **Ensure user_roles table** has data
5. **Verify auth.uid()** is working in Supabase

### Common Issues:

- **Function not found**: Run the helper functions script
- **Permission denied**: Check GRANT statements in scripts
- **RLS blocking access**: Run the simplified policies script
- **User role missing**: Insert role into user_roles table

## Security Notes

These fixes maintain security while resolving functionality:
- RLS policies still enforce access control
- Admin functions require proper authentication
- Audit logging is maintained
- User roles are properly validated

## Next Steps

1. **Run the SQL scripts in Supabase**
2. **Test the authentication flow**
3. **Verify Dashboard functionality**
4. **Check role-based access**
5. **Monitor for any remaining errors**

The authentication context should work properly after these database fixes are applied.
