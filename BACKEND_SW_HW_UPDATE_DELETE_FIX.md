# Backend Fix Required: Software & Hardware Update/Delete Operations

## Issue Summary

The frontend is unable to update or delete software modules, hardware items, or categories. The operations are failing silently or with generic error messages.

## Current Status

✅ **Frontend**: Fixed - Now properly handles errors and displays backend error messages  
❌ **Backend**: Needs investigation and fixes

## Required Backend Endpoints

### 1. Update Software Module
**Endpoint:** `PUT /api/platform/software-modules/:id`

**Expected Request Body:**
```json
{
  "name": "Updated Software Name",
  "description": "Updated description",
  "category_id": "1",
  "license_fee": 99.99,
  "is_active": true
}
```

**Expected Response (200 OK):**
```json
{
  "message": "Software module updated successfully",
  "data": {
    "id": "1",
    "name": "Updated Software Name",
    "description": "Updated description",
    "category_id": "1",
    "license_fee": 99.99,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  }
}
```

**Error Responses:**
- `404 Not Found`: If software module doesn't exist
- `400 Bad Request`: If validation fails (e.g., invalid category_id, missing required fields)
- `500 Internal Server Error`: If database error occurs

---

### 2. Delete Software Module
**Endpoint:** `DELETE /api/platform/software-modules/:id`

**Expected Response (200 OK):**
```json
{
  "message": "Software module deleted successfully"
}
```

**Error Responses:**
- `404 Not Found`: If software module doesn't exist
- `409 Conflict`: If software module is referenced by other records (foreign key constraint)
- `500 Internal Server Error`: If database error occurs

**Important:** If the software module is referenced by other tables (e.g., site studies, scoping), you should either:
- Return `409 Conflict` with a clear message
- Or implement cascade delete if appropriate

---

### 3. Update Hardware Item
**Endpoint:** `PUT /api/platform/hardware-items/:id`

**Expected Request Body:**
```json
{
  "name": "Updated Hardware Name",
  "description": "Updated description",
  "category_id": "1",
  "subcategory": "Tablets",
  "manufacturer": "Apple",
  "configuration_notes": "Updated notes",
  "unit_cost": 1099.99,
  "support_type": "Warranty",
  "support_cost": 99.99,
  "is_active": true
}
```

**Expected Response (200 OK):**
```json
{
  "message": "Hardware item updated successfully",
  "data": {
    "id": "1",
    "name": "Updated Hardware Name",
    "description": "Updated description",
    "category_id": "1",
    "subcategory": "Tablets",
    "manufacturer": "Apple",
    "configuration_notes": "Updated notes",
    "unit_cost": 1099.99,
    "support_type": "Warranty",
    "support_cost": 99.99,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  }
}
```

**Error Responses:**
- `404 Not Found`: If hardware item doesn't exist
- `400 Bad Request`: If validation fails (e.g., invalid category_id, missing required fields)
- `500 Internal Server Error`: If database error occurs

---

### 4. Delete Hardware Item
**Endpoint:** `DELETE /api/platform/hardware-items/:id`

**Expected Response (200 OK):**
```json
{
  "message": "Hardware item deleted successfully"
}
```

**Error Responses:**
- `404 Not Found`: If hardware item doesn't exist
- `409 Conflict`: If hardware item is referenced by other records (foreign key constraint)
- `500 Internal Server Error`: If database error occurs

**Important:** If the hardware item is referenced by other tables (e.g., site studies, scoping), you should either:
- Return `409 Conflict` with a clear message
- Or implement cascade delete if appropriate

---

### 5. Update Software Category
**Endpoint:** `PUT /api/platform/software-categories/:id`

**Expected Request Body:**
```json
{
  "name": "Updated Category Name",
  "description": "Updated description"
}
```

**Expected Response (200 OK):**
```json
{
  "message": "Software category updated successfully",
  "data": {
    "id": "1",
    "name": "Updated Category Name",
    "description": "Updated description",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  }
}
```

**Error Responses:**
- `404 Not Found`: If category doesn't exist
- `400 Bad Request`: If validation fails (e.g., duplicate name)
- `409 Conflict`: If category is in use by software modules
- `500 Internal Server Error`: If database error occurs

---

### 6. Delete Software Category
**Endpoint:** `DELETE /api/platform/software-categories/:id`

**Expected Response (200 OK):**
```json
{
  "message": "Software category deleted successfully"
}
```

**Error Responses:**
- `404 Not Found`: If category doesn't exist
- `409 Conflict`: If category is in use by software modules (should return clear message)
- `500 Internal Server Error`: If database error occurs

**Important:** Check if category is referenced by software_modules before deleting. If it is, return `409 Conflict` with message like:
```json
{
  "message": "Cannot delete category: it is in use by 5 software modules",
  "code": "CATEGORY_IN_USE"
}
```

---

### 7. Update Hardware Category
**Endpoint:** `PUT /api/platform/hardware-categories/:id`

**Expected Request Body:**
```json
{
  "name": "Updated Category Name",
  "description": "Updated description"
}
```

**Expected Response (200 OK):**
```json
{
  "message": "Hardware category updated successfully",
  "data": {
    "id": "1",
    "name": "Updated Category Name",
    "description": "Updated description",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  }
}
```

**Error Responses:**
- `404 Not Found`: If category doesn't exist
- `400 Bad Request`: If validation fails (e.g., duplicate name)
- `409 Conflict`: If category is in use by hardware items
- `500 Internal Server Error`: If database error occurs

---

### 8. Delete Hardware Category
**Endpoint:** `DELETE /api/platform/hardware-categories/:id`

**Expected Response (200 OK):**
```json
{
  "message": "Hardware category deleted successfully"
}
```

**Error Responses:**
- `404 Not Found`: If category doesn't exist
- `409 Conflict`: If category is in use by hardware items (should return clear message)
- `500 Internal Server Error`: If database error occurs

**Important:** Check if category is referenced by hardware_items before deleting. If it is, return `409 Conflict` with message like:
```json
{
  "message": "Cannot delete category: it is in use by 3 hardware items",
  "code": "CATEGORY_IN_USE"
}
```

---

## Common Issues to Check

### 1. Response Format
Make sure all responses follow the expected format:
- **Success responses** should include `message` and `data` fields
- **Error responses** should include `message` field with a clear error description
- **Status codes** should be appropriate (200 for success, 4xx for client errors, 5xx for server errors)

### 2. Error Messages
Error messages should be descriptive and user-friendly:
- ✅ Good: `"Cannot delete software module: it is referenced by 2 site studies"`
- ❌ Bad: `"Internal error"` or `"Database constraint violation"`

### 3. Foreign Key Constraints
If items are referenced by other tables:
- Check for references before deleting
- Return `409 Conflict` with a clear message if deletion would violate constraints
- Or implement cascade delete if appropriate for your business logic

### 4. Validation
Validate all input:
- Required fields should be present
- Data types should match (e.g., `category_id` should be a valid ID)
- Business rules should be enforced (e.g., `unit_cost` must be positive)

### 5. Authentication/Authorization
Ensure endpoints require authentication:
- Check for valid JWT token in cookies
- Verify user has permission to update/delete (e.g., admin role)

---

## Testing Checklist

After implementing fixes, test the following:

1. **Update Software Module**
   - ✅ Update with valid data → Should succeed
   - ✅ Update with invalid category_id → Should return 400
   - ✅ Update non-existent module → Should return 404
   - ✅ Update with missing required fields → Should return 400

2. **Delete Software Module**
   - ✅ Delete existing module → Should succeed
   - ✅ Delete non-existent module → Should return 404
   - ✅ Delete module referenced by other records → Should return 409

3. **Update Hardware Item**
   - ✅ Update with valid data → Should succeed
   - ✅ Update with invalid category_id → Should return 400
   - ✅ Update non-existent item → Should return 404
   - ✅ Update with missing required fields → Should return 400

4. **Delete Hardware Item**
   - ✅ Delete existing item → Should succeed
   - ✅ Delete non-existent item → Should return 404
   - ✅ Delete item referenced by other records → Should return 409

5. **Update/Delete Categories**
   - ✅ Update category → Should succeed
   - ✅ Delete unused category → Should succeed
   - ✅ Delete category in use → Should return 409 with clear message

---

## Frontend Changes Made

The frontend has been updated to:
- ✅ Properly handle and display backend error messages
- ✅ Log detailed error information for debugging
- ✅ Show user-friendly error messages in toast notifications
- ✅ Handle different response formats (nested data vs direct data)

---

## Next Steps

1. **Backend Team**: Implement/fix the endpoints listed above
2. **Testing**: Test all update/delete operations
3. **Error Handling**: Ensure all error cases return appropriate status codes and messages
4. **Documentation**: Update API documentation if needed

---

## Debugging Tips

If operations are still failing:

1. **Check Browser Console**: Look for detailed error logs with status codes and error messages
2. **Check Network Tab**: Inspect the actual HTTP requests and responses
3. **Check Backend Logs**: Look for database errors, constraint violations, etc.
4. **Test with Postman/curl**: Verify endpoints work independently of the frontend

---

**Status**: Backend fix required  
**Priority**: High - blocks update/delete functionality  
**Last Updated**: 2024-01-XX

