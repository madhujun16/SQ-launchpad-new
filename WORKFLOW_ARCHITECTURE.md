# Site Workflow Architecture Update

## Overview
This document describes the updated site workflow architecture that implements a proper step-by-step flow from scoping through deployment with approval workflows and asset management.

## Workflow Flow

### 1. Scoping Step
- **Purpose**: Select software modules and get hardware recommendations
- **Process**:
  - User selects software modules from available options
  - Hardware items are automatically filtered based on software categories
  - User adjusts hardware quantities as needed
  - User submits scoping for approval
- **Database**: Data stored in `site_scoping` table with status 'submitted'

### 2. Approval Workflow
- **Purpose**: Review and approve scoping decisions
- **Process**:
  - Scoping submission creates approval request
  - Admin reviews and approves/rejects scoping
  - Approved scoping moves to procurement phase
- **Database**: Approval tracked in `site_approvals` table

### 3. Procurement Step
- **Purpose**: Manage procurement of approved hardware
- **Process**:
  - Shows approved hardware from scoping
  - Creates procurement items for each hardware piece
  - Tracks procurement status (pending → ordered → delivered → installed)
- **Database**: Items tracked in `site_procurement_items` table

### 4. Deployment Step
- **Purpose**: Deploy procured hardware and manage assets
- **Process**:
  - Shows hardware that has been delivered/installed
  - Allows adding individual assets for each hardware item
  - Creates multiple assets based on procurement quantity
- **Database**: Assets tracked in `site_assets` table

## Database Schema

### New Tables Created

#### 1. `site_scoping`
```sql
- id (UUID, Primary Key)
- site_id (UUID, Foreign Key to sites)
- selected_software (JSONB) - Array of software module IDs
- selected_hardware (JSONB) - Array of hardware items with quantities
- status (TEXT) - draft, submitted, approved, rejected, changes_requested
- submitted_at (TIMESTAMPTZ)
- approved_at (TIMESTAMPTZ)
- approved_by (UUID, Foreign Key to auth.users)
- cost_summary (JSONB) - Cost breakdown
- notes (TEXT)
- created_at, updated_at (TIMESTAMPTZ)
```

#### 2. `site_approvals`
```sql
- id (UUID, Primary Key)
- site_id (UUID, Foreign Key to sites)
- scoping_id (UUID, Foreign Key to site_scoping)
- approval_type (TEXT) - scoping, procurement, deployment
- status (TEXT) - pending, approved, rejected, changes_requested
- requested_by, approved_by, rejected_by (UUID, Foreign Key to auth.users)
- requested_at, approved_at, rejected_at (TIMESTAMPTZ)
- rejection_reason, changes_requested_reason (TEXT)
- comments (TEXT)
- created_at, updated_at (TIMESTAMPTZ)
```

#### 3. `site_procurement_items`
```sql
- id (UUID, Primary Key)
- site_id (UUID, Foreign Key to sites)
- hardware_item_id (UUID, Foreign Key to hardware_items)
- software_module_id (UUID, Foreign Key to software_modules)
- item_type (TEXT) - software, hardware
- item_name (TEXT)
- quantity (INTEGER)
- unit_cost, total_cost (DECIMAL)
- status (TEXT) - pending, ordered, delivered, installed
- order_date, delivery_date, installation_date (DATE)
- supplier (TEXT)
- order_reference (TEXT)
- notes (TEXT)
- created_at, updated_at (TIMESTAMPTZ)
```

#### 4. `site_assets` (Enhanced)
```sql
- id (UUID, Primary Key)
- hardware_item_id (UUID, Foreign Key to hardware_items)
- site_id (UUID, Foreign Key to sites)
- model_number (TEXT) - Unique identifier for the asset
- service_cycle_months (INTEGER) - Service interval
- status (TEXT) - pending, installed, active, maintenance, retired
- installed_at (TIMESTAMPTZ)
- last_service_at (TIMESTAMPTZ)
- next_service_due (TIMESTAMPTZ)
- created_at, updated_at (TIMESTAMPTZ)
```

## Key Features Implemented

### 1. Software-Driven Hardware Filtering
- Software selection drives hardware recommendations
- Hardware items are filtered by software categories
- Removing software removes related hardware

### 2. Approval Workflow
- Scoping submissions require approval
- Approval status tracked in database
- Only approved items move to procurement

### 3. Procurement Management
- Approved hardware automatically creates procurement items
- Status tracking: pending → ordered → delivered → installed
- Supplier and order reference management

### 4. Asset Management
- Multiple assets created based on procurement quantity
- Automatic model numbering (e.g., SQ-POS-001, SQ-POS-002)
- Service cycle tracking
- Individual asset status management

### 5. Archive Functionality
- Software and hardware items can be archived instead of deleted
- Archived items hidden from selection but preserved for historical sites
- Archive/restore functionality in management interface

## Migration Scripts

### 1. `20250105000027-create-workflow-tables.sql`
- Creates all new workflow tables
- Sets up RLS policies
- Adds indexes for performance

### 2. `20250105000028-populate-workflow-data.sql`
- Populates workflow tables with sample data
- Creates realistic procurement and asset data
- Links existing sites to workflow data

## Component Updates

### 1. ScopingStep.tsx
- Software selection with category-based filtering
- Hardware recommendations based on software choices
- Submission for approval workflow
- Clean, focused UI

### 2. ProcurementStep.tsx
- Shows approved hardware from scoping
- Creates procurement items automatically
- Status tracking and updates
- Procurement summary dashboard

### 3. DeploymentStep.tsx
- Shows procured hardware ready for deployment
- Asset creation with quantity-based numbering
- Service cycle management
- Asset tracking and status

### 4. SoftwareHardwareManagement.tsx
- Archive/restore functionality
- Toggle between active and archived items
- Preserves historical data for existing sites

## Benefits

1. **Proper Workflow**: Clear progression from scoping → approval → procurement → deployment
2. **Data Integrity**: Each step builds on the previous with proper validation
3. **Asset Tracking**: Individual hardware assets tracked with service cycles
4. **Approval Control**: Admin oversight at key decision points
5. **Historical Preservation**: Archived items preserved for existing sites
6. **Scalability**: Proper database design supports growth
7. **User Experience**: Intuitive flow with clear status indicators

## Usage Instructions

1. **Scoping**: Select software modules, adjust hardware quantities, submit for approval
2. **Approval**: Admin reviews and approves scoping decisions
3. **Procurement**: Create procurement items, track orders and deliveries
4. **Deployment**: Add assets for delivered hardware, manage service cycles
5. **Management**: Archive/restore software and hardware items as needed

This architecture provides a robust, scalable foundation for managing site deployments with proper workflow controls and asset tracking.
