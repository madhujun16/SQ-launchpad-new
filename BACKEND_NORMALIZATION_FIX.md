# Backend Fix Required - Site List Normalization

## Problem

Frontend is not seeing site details (organization, target go-live, assigned team) in the sites list because backend `GET /api/site/all` is not normalizing fields from `create_site` page.

## Current Situation

- ✅ Frontend creates `create_site` page with all site data
- ✅ Backend query was fixed to look for `'create_site'` page (not `'site_study'`)
- ❌ **Backend normalization logic is not working** - fields are not being extracted and returned

## What Backend Needs to Fix

### File: `app/launchpad/launchpad_api/utils/queries.py`

**Verify the query is correct:**
```python
# Should be:
(p.page_name == 'create_site')
(s.section_name == 'general_info')
```

### File: `app/launchpad/launchpad_api/controllers/site_controller.py`

**Check normalization function (lines 272-302):**

The function should:
1. **Find the `create_site` page** for each site
2. **Find the `general_info` section** in that page
3. **Extract field values** from fields in that section
4. **Map field names** to normalized names:
   - `org_name` → `organization_name`
   - `site_name` → `name`
   - `unit_id` → `unit_code`
   - `target_live_date` → `target_live_date`
   - `suggested_go_live` → `suggested_go_live`
   - `assigned_ops_manager` → `assigned_ops_manager`
   - `assigned_deployment_engineer` → `assigned_deployment_engineer`
   - `sector` → `sector`

### Field Value Extraction

**File: `app/launchpad/launchpad_api/controllers/site_controller.py` (lines 206-219)**

The `_extract_display_value()` function should handle:
- **String values**: `"Site Name"` → return as-is
- **Object values**: `{"value": "Site Name"}` → extract `value`
- **Object values**: `{"text": "Site Name"}` → extract `text`
- **Object values**: `{"label": "Site Name"}` → extract `label`

**IMPORTANT**: Frontend now sends `field_value` as **plain strings**, so backend should handle both:
- String: `"Site Name"` ✅
- Object: `{"value": "Site Name"}` ✅ (for backward compatibility)

## Expected Response

**`GET /api/site/all` should return:**

```json
{
  "message": "Succesfully fetched sites",
  "data": [
    {
      "site_id": 9,
      "status": "Created",
      "name": "Site Name",                    // from site_name field
      "organization_name": "Acme Corp",       // from org_name field
      "unit_code": "UNIT123",                 // from unit_id field
      "target_live_date": "2025-12-31",       // from target_live_date field
      "suggested_go_live": "2025-12-31",      // from suggested_go_live field
      "assigned_ops_manager": "John Manager",  // from assigned_ops_manager field
      "assigned_deployment_engineer": "Jane Engineer", // from assigned_deployment_engineer field
      "sector": "Healthcare"                  // from sector field
    }
  ]
}
```

## Current Response (WRONG)

```json
{
  "message": "Succesfully fetched sites",
  "data": [
    {
      "site_id": 9,
      "status": "Created"
      // Missing all normalized fields!
    }
  ]
}
```

## Debugging Steps

1. **Check if query finds the page:**
   ```python
   # In get_all_site_details()
   page = Page.query.filter(
       Page.site_id == site.id,
       Page.page_name == 'create_site'
   ).first()
   print(f"Site {site.id}: Found page: {page is not None}")
   ```

2. **Check if query finds the section:**
   ```python
   if page:
       section = Section.query.filter(
           Section.page_id == page.id,
           Section.section_name == 'general_info'
       ).first()
       print(f"Site {site.id}: Found section: {section is not None}")
   ```

3. **Check if query finds the fields:**
   ```python
   if section:
       fields = Field.query.filter(Field.section_id == section.id).all()
       print(f"Site {site.id}: Found {len(fields)} fields")
       for field in fields:
           print(f"  - {field.field_name}: {field.field_value}")
   ```

4. **Check normalization function:**
   ```python
   # In site_controller.py normalization logic
   # Add logging:
   print(f"Normalizing site {site.id}")
   print(f"  - org_name field value: {org_name_value}")
   print(f"  - Extracted value: {_extract_display_value(org_name_value)}")
   ```

## Quick Test

**Test with site 9 (which has create_site page):**

1. Run: `GET /api/site/all`
2. Check response for site 9
3. Should have: `name`, `organization_name`, `target_live_date`, `assigned_ops_manager`, etc.
4. If missing, check:
   - Is query finding `create_site` page? ✅
   - Is query finding `general_info` section? ❓
   - Is normalization function extracting values? ❓
   - Are field names matching exactly? ❓

## Most Likely Issues

1. **Section name mismatch**: Query might be looking for wrong section name
2. **Field extraction failing**: `_extract_display_value()` not handling string format
3. **Field name mismatch**: Field names don't match exactly (case-sensitive)
4. **Join conditions**: Query joins not working correctly

## Temporary Frontend Solution

Frontend now has a **smart fallback** that:
- Only fetches `create_site` pages for sites missing data
- Uses `Promise.allSettled` to handle errors gracefully
- Works in parallel for better performance

But this is a **temporary workaround**. The proper fix is for backend to normalize fields correctly.

---

## Summary

**Issue**: Backend normalization not working - fields not extracted from `create_site/general_info`

**Fix**: Ensure normalization logic in `site_controller.py` is:
1. Finding `create_site` page ✅ (already fixed)
2. Finding `general_info` section ❓
3. Extracting field values (handle both string and object formats) ❓
4. Mapping to normalized field names ❓

**Priority**: High - Users cannot see site details in list

