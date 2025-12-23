# Backend Issue Summary - Sites List Showing Empty Data

## Problem

Frontend is getting **400 Bad Request** errors when trying to fetch `create_site` pages for existing sites. This means those pages don't exist yet.

## Root Cause

1. **Backend Query Issue**: The backend's `GET /api/site/all` endpoint is looking for page name `'site_study'` instead of `'create_site'`
   - **File**: `app/launchpad/launchpad_api/utils/queries.py` (lines 30, 54)
   - **Current**: `(p.page_name == 'site_study')`
   - **Should be**: `(p.page_name == 'create_site')`

2. **Missing Pages**: Existing sites (created before frontend started creating `create_site` pages) don't have `create_site` pages yet
   - When frontend tries to fetch: `GET /api/page?page_name=create_site&site_id=X`
   - Backend returns: `400 Bad Request` with message "Invalid Page name or site"

## What Backend Needs to Fix

### Priority 1: Fix the Query (CRITICAL)

**File**: `app/launchpad/launchpad_api/utils/queries.py`

**Change lines 30 and 54:**
```python
# FROM:
(p.page_name == 'site_study')

# TO:
(p.page_name == 'create_site')
```

**Why**: Frontend creates `create_site` page with `general_info` section containing all site data. Backend needs to read from this page to normalize fields for `GET /api/site/all`.

### Priority 2: Handle Missing Pages Gracefully (Optional but Recommended)

**File**: `app/launchpad/launchpad_api/controllers/page_controller.py`

**Current behavior**: Returns `400 Bad Request` when page doesn't exist

**Recommended**: Return `200 OK` with `null` or empty data instead of 400, so frontend can handle it gracefully:

```python
# Instead of:
if not page:
    return {"message": "Invalid Page name or site"}, 400

# Consider:
if not page:
    return {"message": "Page not found", "data": None}, 200
```

This way, frontend can distinguish between:
- **400**: Actual error (invalid request)
- **200 with null**: Page doesn't exist yet (normal for new sites)

## Expected Field Names in create_site/general_info

Frontend creates these fields (backend should normalize them):

- `org_name` → normalized to `organization_name`
- `site_name` → normalized to `name`
- `unit_id` → normalized to `unit_code`
- `target_live_date` → `target_live_date`
- `suggested_go_live` → `suggested_go_live`
- `assigned_ops_manager` → `assigned_ops_manager`
- `assigned_deployment_engineer` → `assigned_deployment_engineer`
- `sector` → `sector`
- `criticality_level` → `criticality_level`
- `organization_id` → `organization_id`
- `organization_logo` → `organization_logo`

## Location Fields in create_site/location_info

- `location` → `location`
- `postcode` → `postcode`
- `region` → `region`
- `country` → `country`
- `latitude` → `latitude`
- `longitude` → `longitude`

## Testing After Backend Fix

1. **Create a new site** from frontend
2. **Check `GET /api/site/all`** - should return normalized fields:
   ```json
   {
     "data": [{
       "site_id": 8,
       "name": "Site Name",
       "organization_name": "Org Name",
       "target_live_date": "2025-12-31",
       "assigned_ops_manager": "Manager Name",
       "assigned_deployment_engineer": "Engineer Name",
       "sector": "Healthcare",
       "unit_code": "UNIT123"
     }]
   }
   ```
3. **Sites list page** should show all details (no more N/A)

## For Existing Sites (Created Before Fix)

**Option A**: Backend can create `create_site` pages for existing sites (migration script)

**Option B**: Frontend will handle missing pages gracefully (shows empty/N/A until page is created)

**Option C**: Users can manually trigger page creation when editing a site

---

## Summary

**Main Issue**: Backend query looks for wrong page name (`site_study` instead of `create_site`)

**Quick Fix**: Change query in `queries.py` line 30 and 54 from `'site_study'` to `'create_site'`

**Result**: `GET /api/site/all` will immediately return normalized fields for all sites that have `create_site` pages

