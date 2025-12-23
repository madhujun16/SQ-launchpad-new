# Backend Problem - Sites List Still Empty After Fix

## Current Status

✅ **Fixed**: Query now looks for `'create_site'` page (not `'site_study'`)  
❌ **Still Broken**: `GET /api/site/all` returns 200 but data is empty/not normalized

## Evidence

1. **Site 9 has `create_site` page**: `GET /api/page?page_name=create_site&site_id=9` → **200 OK**
2. **Sites 10, 11, 12 don't have pages**: `GET /api/page?page_name=create_site&site_id=X` → **400 Bad Request**
3. **`GET /api/site/all` returns 200** but frontend receives empty fields (only `site_id` and `status`)

## Problem

**Backend is not normalizing fields from `create_site/general_info` section.**

Even though:
- Query now looks for `'create_site'` page ✅
- Page exists for site 9 ✅
- Page has `general_info` section with fields ✅

**The normalization logic in `site_controller.py` is not extracting/returning the fields.**

## What Backend Needs to Check

### 1. Verify Query is Actually Using `create_site`

**File**: `app/launchpad/launchpad_api/utils/queries.py`

**Check lines 30, 54:**
```python
# Should be:
(p.page_name == 'create_site')

# NOT:
(p.page_name == 'site_study')
```

### 2. Verify Normalization Logic is Working

**File**: `app/launchpad/launchpad_api/controllers/site_controller.py` (lines 272-302)

**Check if normalization is extracting fields from `create_site/general_info`:**

Expected field mappings:
- `org_name` → `organization_name`
- `site_name` → `name`
- `unit_id` → `unit_code`
- `target_live_date` → `target_live_date`
- `suggested_go_live` → `suggested_go_live`
- `assigned_ops_manager` → `assigned_ops_manager`
- `assigned_deployment_engineer` → `assigned_deployment_engineer`
- `sector` → `sector`

### 3. Check Field Value Extraction

**File**: `app/launchpad/launchpad_api/controllers/site_controller.py` (lines 206-219)

**Verify `_extract_display_value()` is handling field values correctly:**

Field values are stored as:
```json
{"value": "Site Name"}
```

The extraction should handle:
- `{value: "..."}` → extract `value`
- `{text: "..."}` → extract `text`
- `{label: "..."}` → extract `label`
- Plain string → return as-is

### 4. Test Query Directly

**Run this query in backend to verify:**

```python
# Should return fields from create_site/general_info for site 9
site = get_all_site_details()  # or whatever the function is called
# Check if site 9 has: name, organization_name, target_live_date, etc.
```

## Expected Response Format

**`GET /api/site/all` should return:**

```json
{
  "message": "Succesfully fetched sites",
  "data": [
    {
      "site_id": 9,
      "status": "Created",
      "name": "Site Name Value",           // from site_name
      "organization_name": "Org Name",      // from org_name
      "unit_code": "UNIT123",              // from unit_id
      "target_live_date": "2025-12-31",    // from target_live_date
      "suggested_go_live": "2025-12-31",   // from suggested_go_live
      "assigned_ops_manager": "Manager",    // from assigned_ops_manager
      "assigned_deployment_engineer": "Engineer", // from assigned_deployment_engineer
      "sector": "Healthcare"               // from sector
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
      // Missing all other fields!
    }
  ]
}
```

## Debugging Steps for Backend

1. **Check if query joins are correct:**
   - Is it joining `Page` table?
   - Is it filtering by `page_name == 'create_site'`?
   - Is it joining `Section` table with `section_name == 'general_info'`?
   - Is it joining `Field` table?

2. **Check if fields are being read:**
   - Add logging in `get_all_site_details()` to see what fields are found
   - Log the raw field values before normalization

3. **Check normalization function:**
   - Verify `_extract_display_value()` is being called
   - Verify field names match exactly (case-sensitive): `org_name`, `site_name`, `unit_id`, etc.

4. **Check for site 9 specifically:**
   - Does `create_site` page exist? ✅ (200 response confirms)
   - Does `general_info` section exist?
   - Do fields exist in that section?
   - Are field names exactly: `org_name`, `site_name`, `unit_id`, etc.?

## Most Likely Issues

1. **Field names don't match** - Backend expects different field names than frontend creates
2. **Normalization not running** - Query finds page but normalization logic isn't executing
3. **Field value format** - Backend can't extract values from `{value: "..."}` format
4. **Join conditions wrong** - Query isn't properly joining sections/fields

## Quick Test

**Backend should test this directly:**

```python
# Get site 9's create_site page
page = Page.get_by_siteid_and_pagename(9, 'create_site')
# Check if it exists
# Get general_info section
section = Section.get_by_pageid_and_sectionname(page.id, 'general_info')
# Get fields
fields = Field.get_by_sectionid(section.id)
# Check field names and values
for field in fields:
    print(f"{field.field_name}: {field.field_value}")
```

This will show exactly what data exists and if field names match.

---

## Summary

**Problem**: `GET /api/site/all` finds `create_site` page but doesn't normalize/return the fields.

**Check**:
1. Query joins are correct
2. Field names match exactly (`org_name`, `site_name`, `unit_id`, etc.)
3. Normalization function is executing
4. Field value extraction is working

