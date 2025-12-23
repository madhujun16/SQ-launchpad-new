# Backend Fix Required - Page Name Mismatch

## ⚠️ CRITICAL ISSUE

The backend query in `get_all_site_details()` is looking for the wrong page name.

### Current Implementation (WRONG)
- **File:** `app/launchpad/launchpad_api/utils/queries.py`
- **Lines:** 30, 54
- **Current Query:** Looks for page name `'site_study'`
- **Code:** `(p.page_name == 'site_study')`

### Required Fix
- **Should Look For:** Page name `'create_site'`
- **Change To:** `(p.page_name == 'create_site')`

### Why This Matters
- Frontend creates `create_site` page with `general_info` section when a site is created
- Backend needs to read from `create_site/general_info` to normalize fields for `GET /api/site/all`
- Currently, backend is looking for `site_study` page, so it never finds the data
- Result: Sites list shows N/A for organization, target go-live, assigned team, etc.

### Field Names in create_site/general_info
The frontend creates these fields (backend should normalize them):
- `org_name` → normalized to `organization_name`
- `site_name` → normalized to `name`
- `unit_id` → normalized to `unit_code`
- `target_live_date` → `target_live_date`
- `suggested_go_live` → `suggested_go_live`
- `assigned_ops_manager` → `assigned_ops_manager`
- `assigned_deployment_engineer` → `assigned_deployment_engineer`
- `sector` → `sector`
- `organization_logo` → `organization_logo`

### Expected Behavior After Fix
1. Frontend creates site → creates `create_site` page with `general_info` section
2. Backend `GET /api/site/all` reads from `create_site/general_info`
3. Backend normalizes fields and returns them in response
4. Frontend displays: organization, target go-live, assigned team, sector, etc.

---

## Frontend Implementation Status

✅ **Frontend is ready:**
- Creates `create_site` page with correct field names
- Uses lowercase snake_case consistently
- Handles missing fields gracefully
- Only creates `create_site` page on site creation (other pages created lazily)

---

## Testing After Backend Fix

1. Create a new site from frontend
2. Check `GET /api/site/all` response - should include:
   - `name` (from `site_name`)
   - `organization_name` (from `org_name`)
   - `unit_code` (from `unit_id`)
   - `target_live_date`
   - `assigned_ops_manager`
   - `assigned_deployment_engineer`
   - `sector`
3. Sites list page should show all details (no more N/A)
4. Edit site page should show all details

---

## Additional Notes

- Field values are stored as `{value: "..."}` format
- Backend extraction logic already handles this correctly
- Missing fields are not included in response (not null) - frontend handles this
- Page/section/field names are case-sensitive - using lowercase snake_case

