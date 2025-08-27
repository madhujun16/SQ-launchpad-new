# Sites Page Backend Integration Guide

## Problem
The Sites page currently displays incorrect "Assigned Team" data because:
1. The assigned team fields contain UUIDs instead of actual user names
2. The backend is not properly joining with the profiles table to get user information
3. The database lacks proper user profiles and site assignments

## Solution

### Step 1: Run the SQL Script
Execute the SQL script `supabase/fix-sites-assigned-team.sql` in your Supabase SQL Editor. This script will:

1. **Create proper user profiles** with realistic names for:
   - Ops Managers: Sarah Johnson, Rebecca Brown, David Jones, Emma Davies, Michael O'Connor
   - Deployment Engineers: Mike Chen, James Wilson, Ahmed Khan, Sean Murphy, Tom Anderson
   - Admin users: Shivanshu Singh, System Administrator

2. **Assign roles** to users (admin, ops_manager, deployment_engineer)

3. **Create site assignments** linking sites to actual users:
   - 250 ER Restaurant → Sarah Johnson (Ops), Mike Chen (Deployment)
   - Baxter Health Restaurant → Rebecca Brown (Ops), James Wilson (Deployment)
   - BP Pulse Arena → David Jones (Ops), Ahmed Khan (Deployment)
   - Chartswell London HQ → Emma Davies (Ops), Sean Murphy (Deployment)
   - Chartswell Manchester → Emma Davies (Ops), Sean Murphy (Deployment)

4. **Update the sites table** with proper assignment IDs

5. **Create indexes** for better performance

6. **Enable RLS policies** for security

### Step 2: Verify the Data
After running the script, verify the data with these queries:

```sql
-- Check site assignments
SELECT 
  s.name as site_name,
  s.status,
  ops.full_name as ops_manager,
  de.full_name as deployment_engineer
FROM public.sites s
LEFT JOIN public.profiles ops ON s.assigned_ops_manager_id = ops.user_id
LEFT JOIN public.profiles de ON s.assigned_deployment_engineer_id = de.user_id
ORDER BY s.name;

-- Check all users and their roles
SELECT 
  p.full_name,
  p.email,
  ur.role,
  p.created_at
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
ORDER BY p.full_name, ur.role;
```

### Step 3: Backend Integration
The `SitesService` has been updated to:

1. **Fetch user names** instead of UUIDs by joining with the profiles table
2. **Handle missing relationships** gracefully with fallback values
3. **Provide methods** for user assignment and management

### Step 4: Frontend Updates
The Sites page will now display:
- **Actual user names** instead of "Unassigned" or UUIDs
- **Proper team assignments** for each site
- **Realistic data** that matches the business requirements

## Expected Results

After running the script and refreshing the Sites page, you should see:

| Site Name | Organization | Status | Assigned Team |
|------------|--------------|---------|---------------|
| 250 ER Restaurant | Peabody | Deployed | Sarah Johnson, Mike Chen |
| Baxter Health Restaurant | Baxter Health | Site Created | Rebecca Brown, James Wilson |
| BP Pulse Arena | The NEC | Live | David Jones, Ahmed Khan |
| Chartswell London HQ | Chartswell Group | Site Created | Emma Davies, Sean Murphy |
| Chartswell Manchester | Chartswell Group | Site Created | Emma Davies, Sean Murphy |

## Troubleshooting

### If users still show as "Unassigned":
1. Check if the SQL script ran successfully
2. Verify that `site_assignments` table has data
3. Check that the `assigned_ops_manager_id` and `assigned_deployment_engineer_id` columns exist in the sites table

### If you get database errors:
1. Ensure you have the latest database schema
2. Check that the profiles and user_roles tables exist
3. Verify RLS policies are properly configured

### If the page doesn't load:
1. Check browser console for JavaScript errors
2. Verify that the SitesService is properly importing the updated code
3. Check that Supabase client is properly configured

## Next Steps

Once the basic integration is working:

1. **Add user assignment functionality** to the Sites page
2. **Implement organization management** if needed
3. **Add user profile management** for admins
4. **Enhance the UI** with user avatars and contact information
5. **Add notification system** for assignment changes

## Files Modified

- `supabase/fix-sites-assigned-team.sql` - Database setup script
- `src/services/sitesService.ts` - Backend service updates
- `src/pages/Sites.tsx` - Frontend display logic (already working)

## Database Schema

The solution uses these key tables:
- `profiles` - User information
- `user_roles` - User role assignments
- `sites` - Site information with assignment IDs
- `site_assignments` - Site-to-user assignment relationships
