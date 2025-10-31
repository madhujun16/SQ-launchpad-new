# Fixed Site Workflow Setup - Manual Instructions

## Issues Fixed

The original script had two main issues:
1. **Missing `organization_name` field** in sites table insert
2. **Using `category` instead of `category_id`** for software_modules and hardware_items

## Quick Fix

### Option 1: Run the Fixed Script
```bash
./setup_site_workflow.sh
```

### Option 2: Manual Setup
1. Open your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `database/scripts/fixed_site_workflow_setup.sql`
4. Run the script

## What the Fixed Script Does

### 1. **Inserts Organizations** (if not exists)
- ASDA, Tesco, Morrisons, Sainsbury

### 2. **Inserts Software Modules** (using category_id)
- POS System, Kiosk Software, Kitchen Display, Inventory Management
- Uses proper foreign key references to categories table

### 3. **Inserts Hardware Items** (using category_id)
- POS Terminals, Printers, Cash Drawers, Kiosk Displays, etc.
- Uses proper foreign key references to categories table

### 4. **Inserts Sample Site** (with organization_name)
```sql
INSERT INTO public.sites (
  id, name, organization_id, organization_name, location, address, 
  postcode, sector, unit_code, criticality_level, status, 
  target_live_date, assigned_ops_manager, assigned_deployment_engineer
) VALUES (
  '5805e4ec-adce-43c7-a001-d93b70f7ab3e', 
  'Morrisons Leeds', 
  'dc8b5afe-29d0-449b-8122-5a7ec59848d5', 
  'Morrisons',  -- This fixes the organization_name issue
  'Leeds', 
  'Briggate, Leeds', 
  'LS1 6HB', 
  'Retail', 
  'MORR-LD-004', 
  'medium', 
  'approved', 
  '2025-11-30', 
  'David Lee', 
  'Sophie Clark'
);
```

### 5. **Creates Workflow Step Tables** (if they don't exist)
- `site_creation_data`
- `site_study_data`
- `site_scoping_data`
- `site_approvals`
- `site_procurement`
- `site_deployments`
- `site_go_live`

### 6. **Inserts Complete Workflow Data**
- All steps populated with realistic data for Morrisons Leeds

## Expected Results

After running the fixed script, visit:
```
http://localhost:8082/sites/5805e4ec-adce-43c7-a001-d93b70f7ab3e
```

You should see:
- ✅ **Site Name**: "Morrisons Leeds" (instead of "Site 5805e4ec")
- ✅ **Organization**: "Morrisons" (instead of "Unknown Organization")
- ✅ **Complete Stepper Flow**: All steps with real data
- ✅ **No Mock Data**: Real data fetched from database

## Troubleshooting

### If you still get errors:
1. **Check if categories table exists**:
   ```sql
   SELECT * FROM public.categories LIMIT 5;
   ```

2. **If categories don't exist, create them**:
   ```sql
   INSERT INTO public.categories (name) VALUES 
   ('POS'), ('Kiosk'), ('Kitchen Display (KDS)'), ('Inventory')
   ON CONFLICT (name) DO NOTHING;
   ```

3. **Check if organizations exist**:
   ```sql
   SELECT * FROM public.organizations LIMIT 5;
   ```

### If the site still shows as code:
1. Check browser console for data loading logs
2. Verify the site was inserted with proper organization_name
3. Ensure the SiteWorkflowService is being used

## Key Changes Made

1. **Fixed sites insert**: Added `organization_name` field
2. **Fixed software_modules insert**: Used `category_id` instead of `category`
3. **Fixed hardware_items insert**: Used `category_id` instead of `category`
4. **Added proper error handling**: All inserts use `ON CONFLICT DO NOTHING`
5. **Simplified structure**: Removed complex table creation, focused on data insertion

The fixed script should work with your current database structure and resolve both the site name and organization display issues.
