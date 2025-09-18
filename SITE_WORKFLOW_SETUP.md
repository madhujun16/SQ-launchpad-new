# Site Workflow Database Setup & Real Data Integration

## Problem Solved

You were experiencing:
- ❌ Site page showing site codes (e.g., "5805e4ec") instead of actual site names
- ❌ "Unknown Organization" instead of proper organization names  
- ❌ Missing stepper flow information
- ❌ Lots of mock data being fetched instead of real database data

## Solution Overview

I've created a comprehensive solution that:

1. **Sets up complete database tables** for all workflow steps
2. **Creates a real data service** to fetch actual data instead of using mock data
3. **Updates the Site page** to use real data from the database
4. **Provides sample data** for immediate testing

## Files Created/Modified

### 1. Database Setup Script
- **`database/scripts/complete_site_workflow_setup.sql`** - Complete database schema and sample data
- **`setup_site_workflow.sh`** - Automated setup script

### 2. Real Data Service
- **`src/services/siteWorkflowService.ts`** - Service to fetch real workflow data from database

### 3. Updated Site Page
- **`src/pages/Site.tsx`** - Modified to use real data instead of mock data

## Quick Setup

### Option 1: Automated Setup (Recommended)
```bash
# Run the setup script
./setup_site_workflow.sh
```

### Option 2: Manual Setup
1. Open your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `database/scripts/complete_site_workflow_setup.sql`
4. Run the script

## What Gets Set Up

### Database Tables Created
- `site_creation_data` - Site creation step data
- `site_study_data` - Site study step data  
- `site_scoping_data` - Scoping step data
- `site_approvals` - Approval step data
- `site_procurement` - Procurement step data
- `site_deployments` - Deployment step data
- `site_go_live` - Go live step data
- `software_modules` - Software reference data
- `hardware_items` - Hardware reference data

### Sample Data Inserted
- **Organizations**: ASDA, Tesco, Morrisons, Sainsbury
- **Software Modules**: POS System, Kiosk Software, Kitchen Display, Inventory Management
- **Hardware Items**: POS Terminals, Printers, Cash Drawers, Kiosk Displays, etc.
- **Complete Site**: Morrisons Leeds with all workflow steps populated

## Testing the Fix

After running the setup, visit:
```
http://localhost:8082/sites/5805e4ec-adce-43c7-a001-d93b70f7ab3e
```

You should now see:
- ✅ **Site Name**: "Morrisons Leeds" (instead of "Site 5805e4ec")
- ✅ **Organization**: "Morrisons" (instead of "Unknown Organization")
- ✅ **Complete Stepper Flow**: All steps with real data
- ✅ **No Mock Data**: Real data fetched from database

## Architecture Benefits

### 1. **Scalable Database Design**
- Separate tables for each workflow step
- Proper foreign key relationships
- JSONB fields for flexible data storage
- Indexes for performance

### 2. **Real Data Integration**
- `SiteWorkflowService` fetches complete workflow data
- Proper data transformation from database to UI
- Fallback to mock data only when no real data exists

### 3. **Maintainable Code**
- Clear separation between data fetching and UI
- Type-safe interfaces for all data structures
- Comprehensive error handling

## Database Schema Overview

```sql
-- Core workflow tables
sites (main site data)
├── site_creation_data (step 1)
├── site_study_data (step 2)  
├── site_scoping_data (step 3)
├── site_approvals (step 4)
├── site_procurement (step 5)
├── site_deployments (step 6)
└── site_go_live (step 7)

-- Reference tables
software_modules
hardware_items
organizations
```

## Key Features

### 1. **Complete Workflow Data**
Each site can have data for all workflow steps:
- Site Creation: Contact info, location details
- Site Study: Infrastructure, staff capacity, IT requirements
- Scoping: Software/hardware selection, cost breakdown
- Approval: Status, comments, approver details
- Procurement: Order tracking, delivery status
- Deployment: Progress tracking, timeline
- Go Live: Checklist, final sign-off

### 2. **Real-time Data Loading**
- Fetches complete workflow data in parallel
- Maps database fields to UI interface
- Provides detailed logging for debugging
- Graceful fallback to mock data if needed

### 3. **Performance Optimized**
- Parallel data fetching for all workflow steps
- Proper database indexes
- Efficient JSONB queries
- Caching-friendly design

## Troubleshooting

### If you still see mock data:
1. Check browser console for data loading logs
2. Verify database tables were created successfully
3. Ensure sample data was inserted
4. Check Supabase RLS policies

### If site name still shows as code:
1. Verify the site exists in the `sites` table
2. Check that `organization_name` is properly joined
3. Ensure data transformation is working in Sites page

### If stepper flow is missing:
1. Verify workflow step tables have data
2. Check that `SiteWorkflowService.getSiteWorkflowData()` is working
3. Ensure proper data mapping in Site.tsx

## Next Steps

1. **Run the setup script** to create tables and sample data
2. **Restart your dev server** to pick up the new service
3. **Test the site page** to verify real data is loading
4. **Customize the sample data** for your specific needs
5. **Add more sites** using the same workflow structure

## Support

If you encounter any issues:
1. Check the browser console for detailed logs
2. Verify database setup completed successfully
3. Ensure all files were created/modified correctly
4. Test with the provided sample site first

The solution provides a solid foundation for managing complete site workflows with real data instead of mock data.
