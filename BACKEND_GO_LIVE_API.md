# Backend Go Live API Requirements

## Overview

This document outlines the backend API endpoints required for the go live workflow. After procurement is complete, the go live process is simply "flicking the switch" - a toggle to mark the site as live or offline.

## Database Schema

### Table: `go_live_data`

```sql
CREATE TABLE go_live_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    site_id INT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'offline', -- 'live', 'offline', 'postponed'
    go_live_date TIMESTAMP NULL,
    signed_off_by INT REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_site_go_live (site_id)
);

CREATE INDEX idx_go_live_data_site_id ON go_live_data(site_id);
CREATE INDEX idx_go_live_data_status ON go_live_data(status);
```

## API Endpoints

### 1. Get Go Live Data

**Endpoint:** `GET /api/site/{site_id}/go-live`

**Purpose:** Get go live status for a site

**Authentication:** Required

**Response (Success - 200):**
```json
{
  "message": "Successfully fetched go live data",
  "data": {
    "id": 1,
    "site_id": 123,
    "status": "live",
    "go_live_date": "2025-01-20T10:00:00Z",
    "signed_off_by": 456,
    "notes": "Site went live successfully. All systems operational.",
    "created_at": "2025-01-20T10:00:00Z",
    "updated_at": "2025-01-20T10:00:00Z"
  }
}
```

**Response (Not Found - 404):**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Go live data not found for this site"
  }
}
```

**Note:** 404 is acceptable for sites that haven't gone live yet. Frontend will handle this gracefully.

**Error Responses:**
- `401 Unauthorized`: User not authenticated
- `404 Not Found`: Go live data not found (acceptable for new sites)

### 2. Mark Site as Live

**Endpoint:** `POST /api/site/{site_id}/go-live/activate`

**Purpose:** Mark site as live (Admin or Deployment Engineer only)

**Authentication:** Required (Admin or Deployment Engineer role)

**Request Body:**
```json
{
  "notes": "Site went live successfully. All systems operational. Staff training completed."
}
```

**Request Body Fields:**
- `notes` (required): Text notes about going live (non-empty string)

**Response (Success - 200):**
```json
{
  "message": "Site marked as live successfully",
  "data": {
    "id": 1,
    "site_id": 123,
    "status": "live",
    "go_live_date": "2025-01-20T10:00:00Z",
    "signed_off_by": 456,
    "notes": "Site went live successfully. All systems operational. Staff training completed.",
    "created_at": "2025-01-20T10:00:00Z",
    "updated_at": "2025-01-20T10:00:00Z"
  }
}
```

**Backend Actions:**
1. Validate prerequisites:
   - Site status must be 'procurement_done' (procurement must be completed)
   - Return 400 if prerequisites not met

2. Update `go_live_data` table:
   - Set `status` to 'live'
   - Set `go_live_date` to current timestamp
   - Set `signed_off_by` to current user ID
   - Set `notes` to provided notes
   - Update `updated_at` timestamp
   - Create record if it doesn't exist, update if it does

3. Update `sites` table:
   - Set `status` to 'live'

4. (Optional) Create audit log entry

**Error Responses:**
- `400 Bad Request`: Prerequisites not met (procurement not completed) or missing notes
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User doesn't have permission (not Admin or Deployment Engineer)
- `404 Not Found`: Site not found
- `422 Unprocessable Entity`: Validation errors (e.g., empty notes)

### 3. Mark Site as Offline

**Endpoint:** `POST /api/site/{site_id}/go-live/deactivate`

**Purpose:** Take site offline (Admin or Deployment Engineer only)

**Authentication:** Required (Admin or Deployment Engineer role)

**Request Body:**
```json
{
  "notes": "Site taken offline for maintenance. Expected to be back online in 2 hours."
}
```

**Request Body Fields:**
- `notes` (optional): Text notes about taking site offline

**Response (Success - 200):**
```json
{
  "message": "Site taken offline successfully",
  "data": {
    "id": 1,
    "site_id": 123,
    "status": "offline",
    "go_live_date": "2025-01-20T10:00:00Z",
    "signed_off_by": 456,
    "notes": "Site taken offline for maintenance. Expected to be back online in 2 hours.",
    "created_at": "2025-01-20T10:00:00Z",
    "updated_at": "2025-01-20T14:30:00Z"
  }
}
```

**Backend Actions:**
1. Update `go_live_data` table:
   - Set `status` to 'offline'
   - Update `notes` if provided
   - Update `updated_at` timestamp
   - Keep `go_live_date` and `signed_off_by` for historical record

2. Update `sites` table:
   - Set `status` back to 'procurement_done' (or previous status before going live)

3. (Optional) Create audit log entry

**Error Responses:**
- `400 Bad Request`: Site is not currently live
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User doesn't have permission (not Admin or Deployment Engineer)
- `404 Not Found`: Site or go live data not found

## Business Logic

### Prerequisites for Going Live

1. **Site Status Check:**
   - Site must be in 'procurement_done' status
   - Cannot go live if procurement is not completed
   - Return 400 with clear error message if prerequisites not met

2. **Notes Requirement:**
   - Notes are required when going live
   - Notes are optional when taking offline
   - Maximum length: 5000 characters

### Role-Based Access

1. **Get Go Live Data:**
   - Any authenticated user can view go live status

2. **Mark as Live/Offline:**
   - Only Admin or Deployment Engineer can toggle go live status
   - Backend must verify user role before allowing toggle

### Status Flow

```
offline → live (via activate endpoint)
live → offline (via deactivate endpoint)
```

### Historical Data

- When a site is taken offline, preserve the `go_live_date` and `signed_off_by` fields
- This allows tracking when the site first went live
- Only update `status` and `notes` when toggling

## Integration Points

1. **Site Status Update**: When going live, update site status to 'live'. When going offline, revert to 'procurement_done'.

2. **User Lookup**: Resolve `signed_off_by` to get user name for display.

3. **Prerequisites Validation**: Ensure procurement is completed before allowing go live.

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
- `PREREQUISITE_NOT_MET`: Prerequisites not met (e.g., procurement not completed)
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `INTERNAL_ERROR`: Server error

## Testing Checklist

### Get Go Live Data
- [ ] Get existing go live data → Returns 200 with data
- [ ] Get non-existent go live data → Returns 404 (acceptable)
- [ ] Get without authentication → Returns 401

### Mark Site as Live
- [ ] Mark live with valid prerequisites (Admin) → Returns 200, updates site status
- [ ] Mark live with valid prerequisites (Deployment Engineer) → Returns 200
- [ ] Mark live without completed procurement → Returns 400
- [ ] Mark live without notes → Returns 422
- [ ] Mark live as Ops Manager → Returns 403
- [ ] Mark live without authentication → Returns 401
- [ ] Verify site status updated to 'live'
- [ ] Verify go_live_date and signed_off_by are set correctly

### Mark Site as Offline
- [ ] Take offline when site is live (Admin) → Returns 200, reverts site status
- [ ] Take offline when site is live (Deployment Engineer) → Returns 200
- [ ] Take offline when site is not live → Returns 400
- [ ] Take offline as Ops Manager → Returns 403
- [ ] Take offline without authentication → Returns 401
- [ ] Verify go_live_date is preserved
- [ ] Verify site status reverted to 'procurement_done'

## Example Requests

### Mark Site as Live
```bash
POST /api/site/123/go-live/activate
Content-Type: application/json

{
  "notes": "Site went live successfully. All systems operational. Staff training completed."
}
```

### Mark Site as Offline
```bash
POST /api/site/123/go-live/deactivate
Content-Type: application/json

{
  "notes": "Site taken offline for maintenance. Expected to be back online in 2 hours."
}
```

## Notes

1. **Simple Toggle**: The go live process is intentionally simple - just a toggle switch. No complex checklists or workflows.

2. **Prerequisites**: The backend must enforce that procurement is completed before allowing go live.

3. **Historical Tracking**: Preserve go_live_date even when site is taken offline for audit purposes.

4. **Status Management**: The `status` field in `go_live_data` is separate from the site's `status` field. When going live, both are updated.

5. **One Record Per Site**: Use `UNIQUE KEY unique_site_go_live (site_id)` to ensure only one go live record per site.

6. **Audit Trail**: Consider logging go live activation/deactivation actions for audit purposes.

---

**Status**: ✅ Ready for Implementation

