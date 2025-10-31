# Manual Database Fix Instructions

## Problem Identified
The Sites page is showing organizations that don't exist in the database because:
1. Sites have `organization_id: NULL` but hardcoded `organization_name` values
2. The organizations table has different organizations than what sites reference
3. SitesService tries to join with organizations but fails due to NULL organization_id

## Solution Applied

### 1. Fixed SitesService (src/services/sitesService.ts)
- Updated the query to include organization ID in the join
- Improved fallback logic for organization names
- Better handling of missing organization data

### 2. Created Migration Script (fix_organizations_migration.sql)
This script will:
- Create missing organizations (ASDA, Tesco, Sainsbury, Morrisons, Waitrose, Marks & Spencer)
- Link existing sites to proper organizations
- Verify the updates

### 3. Created Automation Script (fix_organizations.sh)
Run this script to automatically apply the fix:
```bash
./fix_organizations.sh
```

## Manual Steps (if automation doesn't work)

### Step 1: Connect to your database
```bash
# Get database URL
supabase status

# Connect to database (replace with your actual URL)
psql "your-database-url-here"
```

### Step 2: Run the migration SQL
```sql
-- Copy and paste the contents of fix_organizations_migration.sql
-- This will create organizations and link sites
```

### Step 3: Verify the fix
```sql
-- Check that sites are now linked to organizations
SELECT 
    s.name as site_name,
    s.organization_id,
    o.name as organization_name,
    o.sector
FROM sites s
LEFT JOIN organizations o ON s.organization_id = o.id
WHERE s.is_archived = false
ORDER BY s.name;
```

## Expected Results After Fix
1. Sites page will show proper organization names from the database
2. Organization logos will work correctly
3. Sites will be properly linked to their organizations
4. Organization management will work correctly

## Testing the Fix
1. Refresh the Sites page in your browser
2. Verify that organizations show correctly
3. Check that organization logos display properly
4. Test creating a new site to ensure organization selection works
