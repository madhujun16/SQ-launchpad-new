# Backend Procurement API Requirements

## Overview

This document outlines the backend API endpoints required for the procurement workflow. The system allows users to upload delivery information (date, receipt, summary) and mark procurement as complete (Admin or Deployment Engineer only).

## Database Schema

### Table: `procurement_data`

```sql
CREATE TABLE procurement_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    site_id INT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    delivery_date DATE,
    delivery_receipt_url VARCHAR(500),
    summary TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'completed'
    completed_at TIMESTAMP NULL,
    completed_by INT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_site_procurement (site_id)
);

CREATE INDEX idx_procurement_data_site_id ON procurement_data(site_id);
CREATE INDEX idx_procurement_data_status ON procurement_data(status);
```

## API Endpoints

### 1. Get Procurement Data

**Endpoint:** `GET /api/site/{site_id}/procurement`

**Purpose:** Get procurement data for a site

**Authentication:** Required

**Response (Success - 200):**
```json
{
  "message": "Successfully fetched procurement data",
  "data": {
    "id": 1,
    "site_id": 123,
    "delivery_date": "2025-01-15",
    "delivery_receipt_url": "https://storage.googleapis.com/bucket/receipt-123.pdf",
    "summary": "All hardware items delivered successfully. Receipt attached.",
    "status": "draft",
    "completed_at": null,
    "completed_by": null,
    "created_at": "2025-01-10T10:00:00Z",
    "updated_at": "2025-01-15T14:30:00Z"
  }
}
```

**Response (Not Found - 404):**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Procurement data not found for this site"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: User not authenticated
- `404 Not Found`: Procurement data not found (this is acceptable for new sites)

### 2. Update Procurement Data (Save as Draft)

**Endpoint:** `PUT /api/site/{site_id}/procurement`

**Purpose:** Save or update procurement data as draft

**Authentication:** Required

**Request Body:**
```json
{
  "delivery_date": "2025-01-15",
  "delivery_receipt_url": "https://storage.googleapis.com/bucket/receipt-123.pdf",
  "summary": "All hardware items delivered successfully. Receipt attached.",
  "status": "draft"
}
```

**Request Body Fields:**
- `delivery_date` (optional): ISO date string (YYYY-MM-DD)
- `delivery_receipt_url` (optional): URL to uploaded receipt file
- `summary` (optional): Text summary of procurement
- `status` (optional): Must be 'draft' for this endpoint

**Response (Success - 200):**
```json
{
  "message": "Procurement data updated successfully",
  "data": {
    "id": 1,
    "site_id": 123,
    "delivery_date": "2025-01-15",
    "delivery_receipt_url": "https://storage.googleapis.com/bucket/receipt-123.pdf",
    "summary": "All hardware items delivered successfully. Receipt attached.",
    "status": "draft",
    "completed_at": null,
    "completed_by": null,
    "created_at": "2025-01-10T10:00:00Z",
    "updated_at": "2025-01-15T14:30:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: User not authenticated
- `404 Not Found`: Site not found

### 3. Mark Procurement as Complete

**Endpoint:** `POST /api/site/{site_id}/procurement/complete`

**Purpose:** Mark procurement as complete (Admin or Deployment Engineer only)

**Authentication:** Required (Admin or Deployment Engineer role)

**Request Body:**
```json
{
  "delivery_date": "2025-01-15",
  "delivery_receipt_url": "https://storage.googleapis.com/bucket/receipt-123.pdf",
  "summary": "All hardware items delivered successfully. Receipt attached."
}
```

**Request Body Fields (All Required):**
- `delivery_date` (required): ISO date string (YYYY-MM-DD)
- `delivery_receipt_url` (required): URL to uploaded receipt file
- `summary` (required): Text summary of procurement (non-empty)

**Response (Success - 200):**
```json
{
  "message": "Procurement marked as complete successfully",
  "data": {
    "id": 1,
    "site_id": 123,
    "delivery_date": "2025-01-15",
    "delivery_receipt_url": "https://storage.googleapis.com/bucket/receipt-123.pdf",
    "summary": "All hardware items delivered successfully. Receipt attached.",
    "status": "completed",
    "completed_at": "2025-01-15T14:30:00Z",
    "completed_by": 456,
    "created_at": "2025-01-10T10:00:00Z",
    "updated_at": "2025-01-15T14:30:00Z"
  }
}
```

**Backend Actions:**
1. Update `procurement_data` table:
   - Set `delivery_date` to provided date
   - Set `delivery_receipt_url` to provided URL
   - Set `summary` to provided text
   - Set `status` to 'completed'
   - Set `completed_at` to current timestamp
   - Set `completed_by` to current user ID
   - Update `updated_at` timestamp

2. Update `sites` table:
   - Set `status` to 'procurement_done'

3. (Optional) Create audit log entry

**Error Responses:**
- `400 Bad Request`: Missing required fields or invalid data
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User doesn't have permission (not Admin or Deployment Engineer)
- `404 Not Found`: Site not found
- `422 Unprocessable Entity`: Validation errors (e.g., invalid date format, empty summary)

## Business Logic

### Validation Rules

1. **Delivery Date:**
   - Must be a valid date in YYYY-MM-DD format
   - Can be in the past (delivery already happened)
   - Cannot be more than 1 year in the future

2. **Delivery Receipt URL:**
   - Must be a valid URL
   - Should point to an uploaded file (image or PDF)
   - Required when marking as complete

3. **Summary:**
   - Must be non-empty string when marking as complete
   - Maximum length: 5000 characters
   - Required when marking as complete

### Role-Based Access

1. **Get/Update Procurement Data:**
   - Any authenticated user can view and save as draft

2. **Mark as Complete:**
   - Only Admin or Deployment Engineer can mark procurement as complete
   - Backend must verify user role before allowing completion

### Status Flow

```
No data → draft (via update endpoint)
draft → completed (via complete endpoint)
```

Once marked as completed, the procurement cannot be edited (status is final).

## File Upload Integration

The frontend uses the existing file upload service (`/api/generate-upload-url`) to upload delivery receipts. The backend should:

1. Accept the receipt URL from the frontend (already uploaded to storage)
2. Store the URL in `delivery_receipt_url` field
3. Validate that the URL is accessible (optional)

## Integration Points

1. **Site Status Update**: When procurement is marked complete, update site status to 'procurement_done'
2. **User Lookup**: Resolve `completed_by` to get user name for display
3. **File Storage**: Receipt files are uploaded separately via file upload service

## Error Handling

All endpoints should return consistent error responses:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional error details"
    }
  }
}
```

Common error codes:
- `VALIDATION_ERROR`: Request validation failed
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `INTERNAL_ERROR`: Server error

## Testing Checklist

### Get Procurement Data
- [ ] Get existing procurement data → Returns 200 with data
- [ ] Get non-existent procurement data → Returns 404
- [ ] Get without authentication → Returns 401

### Update Procurement Data
- [ ] Update with all fields → Returns 200
- [ ] Update with partial fields → Returns 200 (updates only provided fields)
- [ ] Update with invalid date → Returns 400
- [ ] Update without authentication → Returns 401
- [ ] Update non-existent site → Returns 404

### Mark Procurement Complete
- [ ] Mark complete with all required fields (Admin) → Returns 200, updates site status
- [ ] Mark complete with all required fields (Deployment Engineer) → Returns 200
- [ ] Mark complete as Ops Manager → Returns 403
- [ ] Mark complete without delivery date → Returns 400
- [ ] Mark complete without receipt URL → Returns 400
- [ ] Mark complete without summary → Returns 400
- [ ] Mark complete with empty summary → Returns 422
- [ ] Mark complete without authentication → Returns 401
- [ ] Verify site status updated to 'procurement_done'
- [ ] Verify completed_at and completed_by are set correctly

## Example Requests

### Update Procurement (Draft)
```bash
PUT /api/site/123/procurement
Content-Type: application/json

{
  "delivery_date": "2025-01-15",
  "delivery_receipt_url": "https://storage.googleapis.com/bucket/receipt-123.pdf",
  "summary": "Hardware delivered successfully",
  "status": "draft"
}
```

### Mark Procurement Complete
```bash
POST /api/site/123/procurement/complete
Content-Type: application/json

{
  "delivery_date": "2025-01-15",
  "delivery_receipt_url": "https://storage.googleapis.com/bucket/receipt-123.pdf",
  "summary": "All hardware items delivered successfully. Receipt attached."
}
```

## Notes

1. **File Upload**: The frontend handles file upload separately using the existing file upload service. The backend only stores the URL.

2. **Status Management**: The `status` field in `procurement_data` is separate from the site's `status` field. When procurement is marked complete, both are updated.

3. **One Record Per Site**: Use `UNIQUE KEY unique_site_procurement (site_id)` to ensure only one procurement record per site.

4. **Audit Trail**: Consider logging procurement completion actions for audit purposes.

5. **Date Format**: All dates should be stored in ISO format (YYYY-MM-DD) in the database and returned in ISO format in API responses.

---

**Status**: ✅ Ready for Implementation

