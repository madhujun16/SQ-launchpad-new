# Backend Issue: Delete Operations Returning 500 Errors

## Problem Summary

All delete operations are returning **500 Internal Server Error**:
- ❌ Software Modules Delete
- ❌ Hardware Items Delete  
- ❌ Recommendation Rules Delete

## Affected Endpoints

### 1. Delete Software Module
**Endpoint:** `DELETE /api/platform/software-modules/:id`
**Status:** Returns 500 error

### 2. Delete Hardware Item
**Endpoint:** `DELETE /api/platform/hardware-items/:id`
**Status:** Returns 500 error

### 3. Delete Recommendation Rule
**Endpoint:** `DELETE /api/platform/recommendation-rules/:id`
**Status:** Returns 500 error

## Frontend Status

✅ **Frontend Error Handling**: Updated to capture and display detailed backend error messages for all delete operations  
❌ **Backend Delete Endpoints**: All returning 500 errors - needs investigation

## Common Causes

Since all three delete operations are failing with 500 errors, this suggests a **common issue** affecting all delete endpoints:

### 1. Database Foreign Key Constraints (Most Likely)
All three entities may be referenced by other tables:
- **Software Modules** may be referenced by:
  - Site studies
  - Scoping data
  - Site configurations
  - Other related records

- **Hardware Items** may be referenced by:
  - Site studies
  - Scoping data
  - Inventory records
  - Deployment records
  - Other related records

- **Recommendation Rules** may be referenced by:
  - Site studies
  - Scoping data
  - Other related records

**Solution**: Check for references before deleting and return `409 Conflict` with clear message if items are in use.

### 2. Missing Error Handling
Backend may not be properly catching exceptions:
- `IntegrityError` (foreign key violations) not being caught
- Database errors not being handled
- Transaction rollback not working

### 3. Database Transaction Issues
Common transaction problems:
- Transactions not properly committed
- Rollback not working correctly
- Database connection issues

### 4. Model Delete Method Issues
The `delete_row()` methods in models may have issues:
- Not handling exceptions properly
- Not checking for existence before deleting
- Not rolling back on errors

## Backend Investigation Steps

### 1. Check Backend Logs
Look for common patterns in all three delete operations:
- Database error messages
- Foreign key constraint violations
- Transaction errors
- Exception stack traces

### 2. Check Delete Implementations

**Files to Check:**
- `app/launchpad/launchpad_api/controllers/platform_controller.py`
  - `platform_software_modules_id_delete()`
  - `platform_hardware_items_id_delete()`
  - `platform_recommendation_rules_id_delete()`

**Common Pattern to Verify:**
```python
@platform_bp.route('/software-modules/<int:id>', methods=['DELETE'])
def platform_software_modules_id_delete(id):
    try:
        # Check if item exists
        item = SoftwareModule.get_by_id(id)
        if not item:
            return jsonify({'message': 'Software module not found'}), 404
        
        # Check if item is referenced (if applicable)
        # is_referenced = check_module_references(id)
        # if is_referenced:
        #     return jsonify({
        #         'message': 'Cannot delete: module is in use',
        #         'code': 'MODULE_IN_USE'
        #     }), 409
        
        # Delete the item
        success = SoftwareModule.delete_row(id)
        if not success:
            return jsonify({
                'message': 'Failed to delete software module'
            }), 500
        
        return jsonify({
            'message': 'Software module deleted successfully'
        }), 200
        
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({
            'message': 'Cannot delete software module: it is referenced by other records',
            'code': 'MODULE_IN_USE'
        }), 409
        
    except Exception as e:
        # Log the full error
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error deleting software module {id}:")
        print(error_trace)
        
        db.session.rollback()
        return jsonify({
            'message': f'Error deleting software module: {str(e)}'
        }), 500
```

### 3. Check Database Models

**Files to Check:**
- `app/launchpad/launchpad_api/db_models/software_module.py`
- `app/launchpad/launchpad_api/db_models/hardware_item.py`
- `app/launchpad/launchpad_api/db_models/recommendation_rule.py`

**Verify `delete_row()` methods:**
```python
@classmethod
def delete_row(cls, id):
    """
    Delete an item by ID
    """
    try:
        item = cls.query.get(id)
        if not item:
            return False
        
        db.session.delete(item)
        db.session.commit()
        return True
        
    except IntegrityError as e:
        db.session.rollback()
        raise  # Re-raise to be caught by controller
        
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting {cls.__name__} {id}: {str(e)}")
        raise
```

### 4. Check Database Schema

Check for foreign key constraints that might prevent deletion:

```sql
-- Check foreign keys referencing software_modules
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_NAME IN ('software_modules', 'hardware_items', 'recommendation_rules');
```

## Recommended Fix

### Option 1: Add Comprehensive Error Handling (Recommended)

Update all three delete endpoints with proper error handling:

```python
from sqlalchemy.exc import IntegrityError

@platform_bp.route('/software-modules/<int:id>', methods=['DELETE'])
def platform_software_modules_id_delete(id):
    try:
        item = SoftwareModule.get_by_id(id)
        if not item:
            return jsonify({'message': 'Software module not found'}), 404
        
        success = SoftwareModule.delete_row(id)
        if success:
            return jsonify({'message': 'Software module deleted successfully'}), 200
        else:
            return jsonify({'message': 'Failed to delete software module'}), 500
            
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({
            'message': 'Cannot delete software module: it is referenced by other records',
            'code': 'MODULE_IN_USE'
        }), 409
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error deleting software module {id}:")
        print(error_trace)
        
        db.session.rollback()
        return jsonify({
            'message': f'Error deleting software module: {str(e)}'
        }), 500
```

**Apply the same pattern to:**
- `platform_hardware_items_id_delete()`
- `platform_recommendation_rules_id_delete()`

### Option 2: Check References Before Deleting

If items can be referenced, check before attempting delete:

```python
def check_software_module_references(id):
    """Check if software module is referenced by other records"""
    # Check site studies
    from app.launchpad.launchpad_api.db_models.site_study import SiteStudy
    count = SiteStudy.query.filter_by(software_module_id=id).count()
    if count > 0:
        return True, f"referenced by {count} site studies"
    
    # Check other references...
    return False, None

@platform_bp.route('/software-modules/<int:id>', methods=['DELETE'])
def platform_software_modules_id_delete(id):
    try:
        item = SoftwareModule.get_by_id(id)
        if not item:
            return jsonify({'message': 'Software module not found'}), 404
        
        # Check references
        is_referenced, reference_info = check_software_module_references(id)
        if is_referenced:
            return jsonify({
                'message': f'Cannot delete software module: {reference_info}',
                'code': 'MODULE_IN_USE'
            }), 409
        
        # Proceed with delete
        success = SoftwareModule.delete_row(id)
        if success:
            return jsonify({'message': 'Software module deleted successfully'}), 200
        else:
            return jsonify({'message': 'Failed to delete software module'}), 500
            
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({
            'message': 'Cannot delete software module: it is referenced by other records',
            'code': 'MODULE_IN_USE'
        }), 409
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error deleting software module {id}:")
        print(error_trace)
        
        db.session.rollback()
        return jsonify({
            'message': f'Error deleting software module: {str(e)}'
        }), 500
```

## Testing Checklist

After implementing fixes, test all three delete operations:

### Software Module Delete
- [ ] Delete existing module → Returns 200
- [ ] Delete non-existent module → Returns 404
- [ ] Delete module in use → Returns 409 with clear message
- [ ] Delete with database error → Returns 500 with error message

### Hardware Item Delete
- [ ] Delete existing item → Returns 200
- [ ] Delete non-existent item → Returns 404
- [ ] Delete item in use → Returns 409 with clear message
- [ ] Delete with database error → Returns 500 with error message

### Recommendation Rule Delete
- [ ] Delete existing rule → Returns 200
- [ ] Delete non-existent rule → Returns 404
- [ ] Delete rule in use → Returns 409 with clear message
- [ ] Delete with database error → Returns 500 with error message

## Frontend Error Handling

The frontend now:
- ✅ Captures detailed error information for all delete operations
- ✅ Shows specific error messages in toast notifications
- ✅ Logs full error details to console for debugging
- ✅ Handles 500 errors with extended display time (5 seconds)
- ✅ Displays "Server error: [message]" for 500 errors

## Debugging Tips

1. **Check Browser Console**: Look for detailed error logs with full backend responses
2. **Check Network Tab**: Inspect actual HTTP requests/responses for all three endpoints
3. **Check Backend Logs**: Look for exception stack traces (should be logged after fix)
4. **Test with Postman/curl**: Verify endpoints work independently
5. **Check Database**: Verify foreign key constraints and relationships

## Related Files

### Frontend
- `src/services/platformConfigService.ts`
  - `deleteSoftwareModule()`
  - `deleteHardwareItem()`
  - `deleteRecommendationRule()`
- `src/pages/SoftwareHardwareManagement.tsx`
  - `handleDeleteSoftwareModule()`
  - `handleDeleteHardwareItem()`
  - `handleDeleteRecommendationRule()`

### Backend
- `app/launchpad/launchpad_api/controllers/platform_controller.py`
  - `platform_software_modules_id_delete()`
  - `platform_hardware_items_id_delete()`
  - `platform_recommendation_rules_id_delete()`
- `app/launchpad/launchpad_api/db_models/software_module.py`
- `app/launchpad/launchpad_api/db_models/hardware_item.py`
- `app/launchpad/launchpad_api/db_models/recommendation_rule.py`

---

**Status**: Backend issue - requires backend team investigation  
**Priority**: High - blocks all delete functionality  
**Last Updated**: 2024-01-XX

