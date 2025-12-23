# Site Delete 500 Internal Server Error

## Issue
Frontend is unable to delete sites - backend returns **500 Internal Server Error** with message:
> "Unable to delete the site due to an internal error. Please contact support if this issue persists."

## Current Status
✅ **Frontend Error Handling**: Working correctly - displays backend error message  
❌ **Backend Delete Endpoint**: Returns 500 error - needs investigation

## Request Details
- **Endpoint**: `DELETE /api/site?site_id={id}`
- **Example**: `DELETE https://sq-launchpad-backend.onrender.com/api/site?site_id=8`
- **Status Code**: `500 Internal Server Error`
- **Request Method**: `DELETE`

## Frontend Implementation
The frontend is correctly calling the endpoint:
```typescript
// Endpoint: /api/site?site_id=8
const response = await apiClient.delete(API_ENDPOINTS.SITES.DELETE(siteId));
```

## Expected Behavior
- Backend should delete the site and all related data (pages, sections, fields)
- Return `200 OK` with success message
- Or return appropriate error code (404 if not found, 403 if no permission, etc.)

## Possible Backend Issues

### 1. Foreign Key Constraints
The site may have related records that prevent deletion:
- **Pages** (create_site, site_study, scoping, approval, procurement, deployment, go_live)
- **Sections** (belonging to those pages)
- **Fields** (belonging to those sections)

**Solution**: Implement cascade delete or manually delete related records before deleting the site.

### 2. Missing Error Handling
Backend may not be handling edge cases:
- Site doesn't exist
- Site has dependencies
- Database connection issues
- Transaction rollback failures

### 3. Database Configuration
Check if foreign key constraints are set up correctly:
- Should cascade delete related records
- Or should manually delete in correct order (Fields → Sections → Pages → Site)

## Backend Investigation Steps

1. **Check Backend Logs**
   - Look for stack trace or error message in server logs
   - Identify the exact line causing the 500 error

2. **Test DELETE Endpoint Directly**
   ```bash
   curl -X DELETE "https://sq-launchpad-backend.onrender.com/api/site?site_id=8" \
     -H "Cookie: session_id=..." \
     -v
   ```

3. **Check Database Constraints**
   ```sql
   -- Check foreign key constraints on Site table
   SELECT * FROM information_schema.table_constraints 
   WHERE table_name = 'site';
   
   -- Check if site 8 has related records
   SELECT COUNT(*) FROM page WHERE site_id = 8;
   SELECT COUNT(*) FROM section s 
   JOIN page p ON s.page_id = p.page_id 
   WHERE p.site_id = 8;
   ```

4. **Review Delete Implementation**
   - Check `site_controller.py` DELETE method
   - Verify it handles:
     - Deleting related pages
     - Deleting related sections
     - Deleting related fields
     - Transaction management
     - Error handling

## Recommended Backend Fix

### Option 1: Cascade Delete (Recommended)
Configure database foreign keys to cascade delete:
```python
# In database schema
class Page(db.Model):
    site_id = db.Column(db.Integer, db.ForeignKey('site.site_id', ondelete='CASCADE'))
    # ... other fields
```

### Option 2: Manual Deletion Order
Delete in correct order to avoid foreign key violations:
```python
def delete_site(site_id):
    try:
        # 1. Get all pages for this site
        pages = Page.query.filter_by(site_id=site_id).all()
        
        for page in pages:
            # 2. Get all sections for each page
            sections = Section.query.filter_by(page_id=page.page_id).all()
            
            for section in sections:
                # 3. Delete all fields in each section
                Field.query.filter_by(section_id=section.section_id).delete()
            
            # 4. Delete all sections
            Section.query.filter_by(page_id=page.page_id).delete()
        
        # 5. Delete all pages
        Page.query.filter_by(site_id=site_id).delete()
        
        # 6. Finally delete the site
        Site.query.filter_by(site_id=site_id).delete()
        db.session.commit()
        
        return {"message": "Site deleted successfully"}, 200
    except Exception as e:
        db.session.rollback()
        return {"message": f"Error deleting site: {str(e)}"}, 500
```

## Frontend Error Handling
The frontend now:
- ✅ Shows specific error messages from backend
- ✅ Handles 500 errors with user-friendly message
- ✅ Logs detailed error information for debugging
- ✅ Provides status code-specific error messages

## Testing After Backend Fix

1. **Test Delete Site**
   - Try deleting a site with no related data
   - Try deleting a site with pages/sections/fields
   - Verify all related data is deleted

2. **Test Error Cases**
   - Delete non-existent site (should return 404)
   - Delete site without permission (should return 403)
   - Verify error messages are clear

## Related Files
- Frontend: `src/services/sitesService.ts` - `deleteSite()` method
- Frontend: `src/pages/Sites.tsx` - Delete confirmation handler
- Backend: `app/launchpad/launchpad_api/controllers/site_controller.py` - DELETE endpoint

---
**Status**: Backend issue - requires backend team investigation
**Priority**: High - blocks site deletion functionality

