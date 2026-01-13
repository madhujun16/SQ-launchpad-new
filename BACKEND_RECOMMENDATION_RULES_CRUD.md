# Backend Recommendation Rules CRUD API Requirements

## Overview

The frontend now has a full UI for managing recommendation rules on the Software & Hardware Management page. The following backend endpoints are required to support create, read, update, and delete operations.

## Required Endpoints

### 1. Get All Recommendation Rules
**Endpoint:** `GET /api/platform/recommendation-rules`

**Purpose:** Fetch all recommendation rules (used in the management UI)

**Response Format:**
```json
{
  "message": "Successfully fetched recommendation rules",
  "data": [
    {
      "id": "1",
      "software_category": "1",
      "hardware_category": "1",
      "is_mandatory": true,
      "quantity": 2,
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00"
    }
  ]
}
```

**Note:** This endpoint already exists but may need to support fetching all rules (without category_ids filter).

---

### 2. Create Recommendation Rule
**Endpoint:** `POST /api/platform/recommendation-rules`

**Request Body:**
```json
{
  "software_category": "1",
  "hardware_category": "2",
  "is_mandatory": true,
  "quantity": 1
}
```

**Response Format (200 OK):**
```json
{
  "message": "Recommendation rule created successfully",
  "data": {
    "id": "1",
    "software_category": "1",
    "hardware_category": "2",
    "is_mandatory": true,
    "quantity": 1,
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  }
}
```

**Error Responses:**
- `400 Bad Request`: If validation fails (e.g., invalid category IDs, quantity < 1)
- `409 Conflict`: If duplicate rule exists (same software_category + hardware_category combination)
- `500 Internal Server Error`: If database error occurs

**Validation:**
- `software_category` must be a valid software category ID
- `hardware_category` must be a valid hardware category ID
- `quantity` must be >= 1
- `is_mandatory` must be a boolean

---

### 3. Update Recommendation Rule
**Endpoint:** `PUT /api/platform/recommendation-rules/:id`

**Request Body:** (all fields optional)
```json
{
  "software_category": "1",
  "hardware_category": "2",
  "is_mandatory": false,
  "quantity": 3
}
```

**Response Format (200 OK):**
```json
{
  "message": "Recommendation rule updated successfully",
  "data": {
    "id": "1",
    "software_category": "1",
    "hardware_category": "2",
    "is_mandatory": false,
    "quantity": 3,
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  }
}
```

**Error Responses:**
- `404 Not Found`: If recommendation rule doesn't exist
- `400 Bad Request`: If validation fails
- `409 Conflict`: If update would create duplicate rule
- `500 Internal Server Error`: If database error occurs

---

### 4. Delete Recommendation Rule
**Endpoint:** `DELETE /api/platform/recommendation-rules/:id`

**Response Format (200 OK):**
```json
{
  "message": "Recommendation rule deleted successfully"
}
```

**Error Responses:**
- `404 Not Found`: If recommendation rule doesn't exist
- `500 Internal Server Error`: If database error occurs

---

## Database Schema

The `recommendation_rules` table should have:
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `software_category_id` (INT, FOREIGN KEY → software_categories.id)
- `hardware_category_id` (INT, FOREIGN KEY → hardware_categories.id)
- `is_mandatory` (BOOLEAN, DEFAULT FALSE)
- `quantity` (INT, DEFAULT 1, CHECK quantity >= 1)
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

**Optional:** Add unique constraint on `(software_category_id, hardware_category_id)` to prevent duplicates.

---

## Implementation Notes

### 1. Column Name Mapping
The database uses `software_category_id` and `hardware_category_id`, but the API should use `software_category` and `hardware_category` in requests/responses.

**Mapping:**
- Request/Response: `software_category` → Database: `software_category_id`
- Request/Response: `hardware_category` → Database: `hardware_category_id`

### 2. GET All Rules
The existing `GET /api/platform/recommendation-rules` endpoint should:
- If `category_ids` query param is provided: Filter by those categories (existing behavior)
- If `category_ids` is NOT provided: Return ALL recommendation rules (new behavior for management UI)

### 3. Duplicate Prevention
Consider adding a unique constraint or checking for duplicates before creating:
```sql
-- Prevent duplicate rules
ALTER TABLE recommendation_rules 
ADD UNIQUE KEY unique_rule (software_category_id, hardware_category_id);
```

Or handle in application code:
```python
# Check if rule already exists
existing = RecommendationRule.query.filter_by(
    software_category_id=data['software_category'],
    hardware_category_id=data['hardware_category']
).first()

if existing:
    return jsonify({
        'message': 'Recommendation rule already exists for this software and hardware category combination',
        'code': 'DUPLICATE_RULE'
    }), 409
```

### 4. Validation
- Validate that `software_category` exists in `software_categories` table
- Validate that `hardware_category` exists in `hardware_categories` table
- Validate that `quantity` is >= 1
- Validate that `is_mandatory` is a boolean

---

## Testing Checklist

### Create Recommendation Rule
- [ ] Create with valid data → Returns 200 with created rule
- [ ] Create with invalid software_category_id → Returns 400
- [ ] Create with invalid hardware_category_id → Returns 400
- [ ] Create with quantity < 1 → Returns 400
- [ ] Create duplicate rule → Returns 409
- [ ] Create with missing required fields → Returns 400

### Update Recommendation Rule
- [ ] Update with valid data → Returns 200 with updated rule
- [ ] Update non-existent rule → Returns 404
- [ ] Update with invalid category IDs → Returns 400
- [ ] Update with quantity < 1 → Returns 400
- [ ] Update to create duplicate → Returns 409

### Delete Recommendation Rule
- [ ] Delete existing rule → Returns 200
- [ ] Delete non-existent rule → Returns 404
- [ ] Delete with database error → Returns 500

### Get All Recommendation Rules
- [ ] Get all rules (no filter) → Returns all rules
- [ ] Get rules with category_ids filter → Returns filtered rules
- [ ] Get rules when table is empty → Returns empty array

---

## Frontend Integration

The frontend is already implemented and ready to use these endpoints:

**Service Methods:**
- `PlatformConfigService.getAllRecommendationRules()` - GET all rules
- `PlatformConfigService.createRecommendationRule(data)` - POST new rule
- `PlatformConfigService.updateRecommendationRule(id, data)` - PUT update rule
- `PlatformConfigService.deleteRecommendationRule(id)` - DELETE rule

**UI Location:**
- Software & Hardware Management page → "Recommendation Rules" tab
- Full CRUD interface with table view and modal forms

---

## Error Response Format

All error responses should follow this format:

```json
{
  "message": "Descriptive error message",
  "code": "ERROR_CODE"  // Optional, for specific error types
}
```

### Example Error Codes
- `DUPLICATE_RULE` - Rule already exists for this combination
- `INVALID_CATEGORY` - Category ID doesn't exist
- `INVALID_QUANTITY` - Quantity is less than 1

---

## Status

✅ **Frontend**: Complete - Ready to use once backend endpoints are implemented  
❌ **Backend**: Needs implementation of POST, PUT, DELETE endpoints  
⚠️ **GET**: May need update to support fetching all rules (without filter)

---

**Last Updated**: 2024-01-XX

