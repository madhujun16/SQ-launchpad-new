# Platform Configuration System

## Overview

The Platform Configuration system has been redesigned to provide centralized control over hardware/software recommendations, dependencies, and business rules. This system allows platform administrators to manage all configuration logic centrally, while the Scoping step in Site Details dynamically reads from these configurations.

## Architecture

### 1. Platform Configuration Page (`/platform-configuration`)
- **Organizations**: Manage organization details and configurations
- **User Management**: Manage user accounts, roles, and permissions  
- **Software & Hardware**: View software modules and hardware inventory
- **Recommendation Rules**: **NEW** - Manage hardware/software mappings and dependencies
- **Audit & Logs**: View system logs and audit trails

### 2. Scoping Step (Site Details)
- **Dynamic Recommendations**: Reads from platform configuration instead of hardcoded values
- **Real-time Updates**: Recommendations update automatically when platform config changes
- **Role-based Editing**: Maintains existing permission system

## Key Features

### Recommendation Rules Management
- **Hardware-Software Mappings**: Define which hardware items are recommended for each software module
- **Default Quantities**: Set default quantities for each hardware item
- **Required vs Optional**: Mark hardware items as required or optional
- **Reason Documentation**: Document why each hardware item is needed
- **Cost Multipliers**: Apply cost adjustments for specific configurations

### Business Rules Engine
- **Dependencies**: Define required relationships between software and hardware
- **Exclusions**: Prevent incompatible combinations
- **Quantity Rules**: Set quantity constraints
- **Cost Rules**: Define pricing logic and adjustments
- **Priority System**: Order rules by importance

### Audit & Compliance
- **Change Tracking**: All configuration changes are automatically logged
- **User Attribution**: Track who made each change
- **Before/After Values**: Complete audit trail of modifications
- **Timestamp Logging**: Precise timing of all changes

## Database Schema

### Core Tables
1. **`software_modules`** - Software module definitions
2. **`hardware_items`** - Hardware item catalog
3. **`recommendation_rules`** - Hardware/software mappings
4. **`business_rules`** - Complex business logic rules
5. **`configuration_audit_log`** - Change audit trail

### Key Relationships
- Software modules → Hardware items (via recommendation_rules)
- Business rules → Software modules + Hardware items (arrays)
- All changes → Audit log (via triggers)

## Supabase Setup

### Step 1: Run the Migration Files

Execute these SQL files in your Supabase SQL editor in order:

1. **Create Tables**: `20250105000003-create-platform-configuration-tables.sql`
2. **Populate Data**: `20250105000004-populate-platform-configuration-data.sql`

### Step 2: Verify Tables Created

```sql
-- Check if tables were created successfully
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('software_modules', 'hardware_items', 'recommendation_rules', 'business_rules', 'configuration_audit_log');
```

### Step 3: Verify Initial Data

```sql
-- Check software modules
SELECT * FROM public.software_modules;

-- Check hardware items  
SELECT * FROM public.hardware_items;

-- Check recommendation rules
SELECT 
    sm.name as software_module,
    hi.name as hardware_item,
    rr.default_quantity,
    rr.is_required,
    rr.reason
FROM public.recommendation_rules rr
JOIN public.software_modules sm ON rr.software_module_id = sm.id
JOIN public.hardware_items hi ON rr.hardware_item_id = hi.id
ORDER BY sm.name, hi.name;

-- Check business rules
SELECT 
    name,
    description,
    rule_type,
    rule_value,
    priority
FROM public.business_rules
ORDER BY priority;
```

### Step 4: Test RLS Policies

```sql
-- Test admin access (should work)
-- Make sure you're logged in as an admin user
SELECT * FROM public.software_modules;

-- Test audit logging
-- Make a change to see if it's logged
UPDATE public.software_modules 
SET description = 'Updated POS System description' 
WHERE name = 'POS System';

-- Check audit log
SELECT 
    table_name,
    action,
    changed_at,
    new_values->>'name' as item_name
FROM public.configuration_audit_log 
WHERE table_name = 'software_modules'
ORDER BY changed_at DESC;
```

## Usage Workflow

### For Platform Administrators

1. **Access Platform Configuration**: Navigate to `/platform-configuration`
2. **Manage Recommendation Rules**: 
   - Add new hardware/software mappings
   - Adjust default quantities
   - Set required vs optional items
   - Update cost multipliers
3. **Configure Business Rules**:
   - Define dependencies
   - Set exclusions
   - Configure quantity constraints
4. **Monitor Changes**: Review audit logs for all modifications

### For Site Users

1. **Navigate to Site Details**: Go to any site's detail page
2. **Access Scoping Step**: Click on the "Scoping" step in the workflow
3. **View Dynamic Recommendations**: Hardware recommendations automatically appear based on platform configuration
4. **Edit Quantities**: Adjust quantities as needed (based on role permissions)
5. **Submit for Approval**: Save and submit the scoping configuration

## API Integration

### Current Implementation
- **Mock Data**: Currently uses mock data for demonstration
- **Service Layer**: `src/services/platformConfiguration.ts` provides the interface
- **Ready for Backend**: All functions are prepared for actual API integration

### Future Backend Integration
Replace mock functions in `platformConfiguration.ts` with actual API calls:

```typescript
// Current (mock)
export const getRecommendationRules = async (): Promise<RecommendationRule[]> => {
  return mockRecommendationRules;
};

// Future (real API)
export const getRecommendationRules = async (): Promise<RecommendationRule[]> => {
  const response = await fetch('/api/platform-configuration/recommendation-rules');
  return response.json();
};
```

## Benefits

### Centralized Control
- **Single Source of Truth**: All configuration logic in one place
- **Consistent Rules**: Same logic applies across all sites
- **Easy Updates**: Change once, affects everywhere

### Dynamic Recommendations
- **Real-time Updates**: Changes in platform config immediately reflect in scoping
- **No Hardcoding**: Scoping step is completely dynamic
- **Flexible Logic**: Complex business rules supported

### Audit & Compliance
- **Complete Traceability**: Every change is logged
- **User Attribution**: Know who made what changes
- **Before/After Values**: Complete change history

### Scalability
- **Easy Expansion**: Add new software/hardware without code changes
- **Business Rule Engine**: Complex logic without development
- **Performance**: Indexed database queries for fast access

## Troubleshooting

### Common Issues

1. **Tables Not Created**: Ensure you're running migrations in order
2. **RLS Policy Errors**: Verify `public.is_admin()` function exists
3. **No Data**: Check if initial data migration ran successfully
4. **Permission Denied**: Ensure user has admin role

### Verification Queries

```sql
-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('software_modules', 'hardware_items', 'recommendation_rules', 'business_rules');

-- Check triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table IN ('software_modules', 'hardware_items', 'recommendation_rules', 'business_rules');

-- Check audit log
SELECT COUNT(*) as total_audit_entries FROM public.configuration_audit_log;
```

## Next Steps

1. **Run Migrations**: Execute the SQL files in Supabase
2. **Test Configuration**: Verify tables and data are created
3. **Test RLS**: Ensure policies are working correctly
4. **Test Audit**: Make changes and verify logging
5. **Backend Integration**: Replace mock services with real APIs
6. **User Training**: Train administrators on the new system

## Support

For issues or questions:
1. Check the audit logs for error details
2. Verify RLS policies are correctly applied
3. Ensure user has proper role permissions
4. Check Supabase logs for any backend errors
