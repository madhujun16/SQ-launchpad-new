# Backend Scoping Approval API Requirements

## Overview

This document outlines the backend API endpoints required for the scoping approval workflow. The system allows deployment engineers to submit scoping for approval, and Admin/Operations Manager users to approve or reject scoping requests.

## Database Schema

### Table: `scoping_approvals`

```sql
CREATE TABLE scoping_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    site_name VARCHAR(255) NOT NULL,
    deployment_engineer_id UUID NOT NULL REFERENCES users(id),
    deployment_engineer_name VARCHAR(255) NOT NULL,
    ops_manager_id UUID REFERENCES users(id),
    ops_manager_name VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'changes_requested'
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by UUID REFERENCES users(id),
    review_comment TEXT,
    rejection_reason TEXT,
    scoping_data JSONB NOT NULL, -- Contains selected_software and selected_hardware
    cost_breakdown JSONB NOT NULL, -- Contains cost summary
    version INTEGER NOT NULL DEFAULT 1,
    previous_version_id UUID REFERENCES scoping_approvals(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scoping_approvals_site_id ON scoping_approvals(site_id);
CREATE INDEX idx_scoping_approvals_status ON scoping_approvals(status);
CREATE INDEX idx_scoping_approvals_deployment_engineer_id ON scoping_approvals(deployment_engineer_id);
```

### Table: `approval_actions` (Optional - for audit trail)

```sql
CREATE TABLE approval_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_id UUID NOT NULL REFERENCES scoping_approvals(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- 'submit', 'approve', 'reject', 'request_changes', 'resubmit'
    performed_by UUID NOT NULL REFERENCES users(id),
    performed_by_role VARCHAR(50) NOT NULL,
    performed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    comment TEXT,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_approval_actions_approval_id ON approval_actions(approval_id);
```

## API Endpoints

### 1. Submit Scoping for Approval

**Endpoint:** `POST /api/site/{site_id}/scoping/submit`

**Purpose:** Submit scoping data for approval by Admin/Operations Manager

**Authentication:** Required (Deployment Engineer role)

**Request Body:**
```json
{
  "site_name": "Birmingham South Cafeteria",
  "selected_software": [
    {
      "id": "software-uuid-1",
      "quantity": 2
    },
    {
      "id": "software-uuid-2",
      "quantity": 1
    }
  ],
  "selected_hardware": [
    {
      "id": "hardware-uuid-1",
      "quantity": 3
    },
    {
      "id": "hardware-uuid-2",
      "quantity": 2
    }
  ],
  "cost_summary": {
    "hardwareCost": 5000,
    "softwareSetupCost": 500,
    "installationCost": 1000,
    "contingencyCost": 750,
    "totalCapex": 7250,
    "monthlySoftwareFees": 200,
    "maintenanceCost": 100,
    "totalMonthlyOpex": 300,
    "totalInvestment": 10850
  }
}
```

**Response (Success - 200):**
```json
{
  "message": "Scoping submitted for approval successfully",
  "data": {
    "id": "approval-uuid",
    "site_id": "site-uuid",
    "site_name": "Birmingham South Cafeteria",
    "deployment_engineer_id": "user-uuid",
    "deployment_engineer_name": "John Doe",
    "ops_manager_id": null,
    "ops_manager_name": null,
    "status": "pending",
    "submitted_at": "2025-01-15T10:30:00Z",
    "reviewed_at": null,
    "reviewed_by": null,
    "review_comment": null,
    "rejection_reason": null,
    "scoping_data": {
      "selected_software": [...],
      "selected_hardware": [...]
    },
    "cost_breakdown": {...},
    "version": 1,
    "previous_version_id": null,
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User doesn't have permission (not Deployment Engineer)
- `404 Not Found`: Site not found
- `409 Conflict`: Scoping already submitted for this site (pending approval exists)

### 2. Resubmit Scoping After Rejection

**Endpoint:** `POST /api/site/{site_id}/scoping/resubmit`

**Purpose:** Resubmit scoping after it has been rejected

**Authentication:** Required (Deployment Engineer role)

**Request Body:**
```json
{
  "previous_approval_id": "approval-uuid",
  "site_name": "Birmingham South Cafeteria",
  "selected_software": [...],
  "selected_hardware": [...],
  "cost_summary": {...}
}
```

**Response:** Same format as submit endpoint, but with incremented `version` and `previous_version_id` set.

**Error Responses:**
- `400 Bad Request`: Invalid request data or previous approval not in 'rejected' status
- `404 Not Found`: Previous approval or site not found

### 3. Get Pending Scoping Approvals

**Endpoint:** `GET /api/scoping-approvals?status=pending`

**Purpose:** Get all pending scoping approvals for Admin/Operations Manager review

**Authentication:** Required (Admin or Operations Manager role)

**Query Parameters:**
- `status` (optional): Filter by status ('pending', 'approved', 'rejected', 'changes_requested')
- `site_id` (optional): Filter by site ID

**Response (Success - 200):**
```json
{
  "message": "Successfully fetched scoping approvals",
  "data": [
    {
      "id": "approval-uuid-1",
      "site_id": "site-uuid-1",
      "site_name": "Birmingham South Cafeteria",
      "deployment_engineer_id": "user-uuid",
      "deployment_engineer_name": "John Doe",
      "ops_manager_id": null,
      "ops_manager_name": null,
      "status": "pending",
      "submitted_at": "2025-01-15T10:30:00Z",
      "reviewed_at": null,
      "reviewed_by": null,
      "review_comment": null,
      "rejection_reason": null,
      "scoping_data": {
        "selected_software": [
          {
            "id": "software-uuid-1",
            "quantity": 2
          }
        ],
        "selected_hardware": [
          {
            "id": "hardware-uuid-1",
            "quantity": 3
          }
        ]
      },
      "cost_breakdown": {
        "hardwareCost": 5000,
        "softwareSetupCost": 500,
        "installationCost": 1000,
        "contingencyCost": 750,
        "totalCapex": 7250,
        "monthlySoftwareFees": 200,
        "maintenanceCost": 100,
        "totalMonthlyOpex": 300,
        "totalInvestment": 10850
      },
      "version": 1,
      "previous_version_id": null,
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User doesn't have permission (not Admin or Operations Manager)

### 4. Get Scoping Approval by ID

**Endpoint:** `GET /api/scoping-approvals/{approval_id}`

**Purpose:** Get a specific scoping approval by ID

**Authentication:** Required

**Response:** Same format as single approval object in the list endpoint

**Error Responses:**
- `404 Not Found`: Approval not found

### 5. Get Scoping Approval by Site ID

**Endpoint:** `GET /api/scoping-approvals?site_id={site_id}`

**Purpose:** Get the most recent scoping approval for a site

**Authentication:** Required

**Response:** Same format as single approval object

### 6. Approve Scoping

**Endpoint:** `POST /api/scoping-approvals/{approval_id}/approve`

**Purpose:** Approve a pending scoping request

**Authentication:** Required (Admin or Operations Manager role)

**Request Body:**
```json
{
  "comment": "Approved. Proceed with procurement."
}
```

**Response (Success - 200):**
```json
{
  "message": "Scoping approved successfully",
  "data": {
    "id": "approval-uuid",
    "status": "approved",
    "reviewed_at": "2025-01-16T09:00:00Z",
    "reviewed_by": "reviewer-uuid",
    "review_comment": "Approved. Proceed with procurement.",
    "updated_at": "2025-01-16T09:00:00Z"
  }
}
```

**Backend Actions:**
1. Update `scoping_approvals` table:
   - Set `status` to 'approved'
   - Set `reviewed_at` to current timestamp
   - Set `reviewed_by` to current user ID
   - Set `review_comment` to provided comment
   - Update `updated_at`

2. Update `sites` table:
   - Set `status` to 'approved' (or appropriate next status)

3. (Optional) Create entry in `approval_actions` table for audit trail

**Error Responses:**
- `400 Bad Request`: Approval is not in 'pending' status
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User doesn't have permission
- `404 Not Found`: Approval not found

### 7. Reject Scoping

**Endpoint:** `POST /api/scoping-approvals/{approval_id}/reject`

**Purpose:** Reject a pending scoping request

**Authentication:** Required (Admin or Operations Manager role)

**Request Body:**
```json
{
  "comment": "Cost exceeds budget. Please reduce hardware quantities.",
  "rejection_reason": "Cost exceeds budget. Please reduce hardware quantities."
}
```

**Response (Success - 200):**
```json
{
  "message": "Scoping rejected successfully",
  "data": {
    "id": "approval-uuid",
    "status": "rejected",
    "reviewed_at": "2025-01-16T09:00:00Z",
    "reviewed_by": "reviewer-uuid",
    "review_comment": "Cost exceeds budget. Please reduce hardware quantities.",
    "rejection_reason": "Cost exceeds budget. Please reduce hardware quantities.",
    "updated_at": "2025-01-16T09:00:00Z"
  }
}
```

**Backend Actions:**
1. Update `scoping_approvals` table:
   - Set `status` to 'rejected'
   - Set `reviewed_at` to current timestamp
   - Set `reviewed_by` to current user ID
   - Set `review_comment` to provided comment
   - Set `rejection_reason` to provided rejection_reason (or comment if not provided)
   - Update `updated_at`

2. (Optional) Create entry in `approval_actions` table for audit trail

**Error Responses:**
- `400 Bad Request`: Approval is not in 'pending' status
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User doesn't have permission
- `404 Not Found`: Approval not found

## Business Logic

### Submission Rules
1. Only one pending approval can exist per site at a time
2. If a site already has a pending approval, return 409 Conflict
3. Deployment Engineer must be assigned to the site
4. All software and hardware IDs must be valid and active

### Approval Rules
1. Only Admin or Operations Manager can approve/reject
2. Cannot approve/reject if status is not 'pending'
3. When approved, site status should be updated to 'approved'
4. When rejected, site status can remain as-is or be set to 'scoping' to allow resubmission

### Resubmission Rules
1. Can only resubmit if previous approval status is 'rejected'
2. New approval gets incremented version number
3. Previous approval ID is stored in `previous_version_id`
4. Old approval status remains 'rejected' (for audit trail)

## Status Flow

```
pending → approved (via approve endpoint)
pending → rejected (via reject endpoint)
rejected → pending (via resubmit endpoint, creates new approval with higher version)
```

## Integration Points

1. **Site Status Update**: When scoping is approved, update the site's status field
2. **User Lookup**: Resolve deployment_engineer_id and reviewed_by to get user names
3. **Software/Hardware Validation**: Validate that all selected software and hardware IDs exist and are active
4. **Cost Calculation**: Verify cost_summary matches the selected items (optional validation)

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
- `CONFLICT`: Resource conflict (e.g., pending approval already exists)
- `INTERNAL_ERROR`: Server error

## Testing Checklist

- [ ] Submit scoping for approval (success case)
- [ ] Submit scoping when pending approval exists (409 Conflict)
- [ ] Submit scoping with invalid site ID (404)
- [ ] Get pending approvals (Admin role)
- [ ] Get pending approvals (Operations Manager role)
- [ ] Get pending approvals (Deployment Engineer - should be empty or filtered)
- [ ] Approve scoping (success case)
- [ ] Approve scoping that's already approved (400)
- [ ] Reject scoping (success case)
- [ ] Reject scoping that's already rejected (400)
- [ ] Resubmit after rejection (success case)
- [ ] Resubmit without previous rejection (400)
- [ ] Verify site status updates on approval
- [ ] Verify version increment on resubmission

