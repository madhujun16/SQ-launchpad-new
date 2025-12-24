# Backend Issue - Site Deletion Failing (500 Error)

## Problem

Frontend is getting **500 Internal Server Error** when trying to delete sites (e.g., site ID 9).

## Error Details

**Request**: `DELETE /api/site?site_id=9`

**Response**: 
- Status: `500 Internal Server Error`
- Message: `"Unable to delete the site due to an internal error"`

## Likely Causes

### 1. Foreign Key Constraints
The site likely has related records that prevent deletion:
- **Pages** (create_site, site_study, scoping, etc.)
- **Sections** (belonging to those pages)
- **Fields** (belonging to those sections)
- **Other related data** (if any)

### 2. Missing Cascade Delete
The database schema might not have `ON DELETE CASCADE` configured for:
- `Page.site_id` → should cascade delete all pages when site is deleted
- `Section.page_id` → should cascade delete all sections when page is deleted
- `Field.section_id` → should cascade delete all fields when section is deleted

### 3. Transaction Issues
The delete operation might be failing partway through, leaving the database in an inconsistent state.

## What Backend Needs to Check

### 1. Database Schema
Check if foreign keys have cascade delete:
```sql
-- Should be:
FOREIGN KEY (site_id) REFERENCES site(id) ON DELETE CASCADE
FOREIGN KEY (page_id) REFERENCES page(id) ON DELETE CASCADE
FOREIGN KEY (section_id) REFERENCES section(id) ON DELETE CASCADE
```

### 2. Delete Endpoint Logic
**File**: `app/launchpad/launchpad_api/controllers/site_controller.py`

Check the delete endpoint:
- Does it handle cascade deletion of related records?
- Does it use transactions?
- Does it catch and log specific database errors?

### 3. Error Logging
Backend should log the actual database error (not just "internal error"):
- Foreign key constraint violation
- Transaction rollback errors
- Specific table/column causing the issue

## Recommended Fix

### Option 1: Add Cascade Delete (Recommended)
Update database schema to automatically delete related records:
```sql
ALTER TABLE page 
  DROP CONSTRAINT IF EXISTS page_site_id_fkey,
  ADD CONSTRAINT page_site_id_fkey 
    FOREIGN KEY (site_id) REFERENCES site(id) ON DELETE CASCADE;

ALTER TABLE section 
  DROP CONSTRAINT IF EXISTS section_page_id_fkey,
  ADD CONSTRAINT section_page_id_fkey 
    FOREIGN KEY (page_id) REFERENCES page(id) ON DELETE CASCADE;

ALTER TABLE field 
  DROP CONSTRAINT IF EXISTS field_section_id_fkey,
  ADD CONSTRAINT field_section_id_fkey 
    FOREIGN KEY (section_id) REFERENCES section(id) ON DELETE CASCADE;
```

### Option 2: Manual Cascade in Delete Endpoint
In the delete endpoint, manually delete related records:
```python
def delete_site(site_id):
    try:
        # Delete all fields first
        Field.query.filter(Field.section_id.in_(
            select(Section.id).filter(Section.page_id.in_(
                select(Page.id).filter(Page.site_id == site_id)
            ))
        )).delete()
        
        # Delete all sections
        Section.query.filter(Section.page_id.in_(
            select(Page.id).filter(Page.site_id == site_id)
        )).delete()
        
        # Delete all pages
        Page.query.filter(Page.site_id == site_id).delete()
        
        # Finally delete the site
        Site.query.filter(Site.id == site_id).delete()
        db.session.commit()
        
        return {"message": "Site deleted successfully"}, 200
    except Exception as e:
        db.session.rollback()
        # Log the actual error
        logger.error(f"Error deleting site {site_id}: {str(e)}")
        return {"error": str(e)}, 500
```

### Option 3: Soft Delete (Alternative)
Instead of hard delete, mark site as deleted:
- Add `deleted_at` column to `site` table
- Filter out deleted sites in queries
- Allows recovery if needed

## Testing

1. **Test with site that has pages**: Try deleting site 9 (which has create_site page)
2. **Test with site without pages**: Try deleting a site with no related data
3. **Check database logs**: Look for foreign key constraint errors
4. **Check application logs**: Look for the actual exception message

## Expected Behavior

After fix:
- `DELETE /api/site?site_id=9` should return `200 OK`
- Site and all related pages/sections/fields should be deleted
- No foreign key constraint errors

## Current Workaround

Frontend shows error message to user, but deletion fails. Users cannot delete sites that have related pages/sections/fields.

---

## Summary

**Issue**: 500 error when deleting sites with related pages/sections/fields

**Root Cause**: Foreign key constraints preventing deletion (likely missing CASCADE)

**Fix**: Add `ON DELETE CASCADE` to foreign keys OR manually delete related records in delete endpoint

**Priority**: High - Users cannot delete sites

