# Backend Platform Configuration API Requirements

## Overview

The frontend needs backend API endpoints to fetch software and hardware categories, modules, and items for the Site Study and Scoping workflows.

## Required Endpoints

### 1. Get Software Categories
**Endpoint:** `GET /api/platform/software-categories`

**Purpose:** Fetch all software categories (e.g., "Food Ordering App", "Kiosk", "POS", "Kitchen Display System")

**Response Format:**
```json
{
  "message": "Successfully fetched software categories",
  "data": [
    {
      "id": "1",
      "name": "Food Ordering App",
      "description": "Mobile/web app for food ordering",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00"
    },
    {
      "id": "2",
      "name": "Kiosk",
      "description": "Self-service kiosk system",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00"
    }
  ]
}
```

### 2. Get Software Modules
**Endpoint:** `GET /api/platform/software-modules`

**Query Parameters:**
- `category_ids` (optional): Comma-separated list of category IDs to filter by (e.g., `?category_ids=1,2,3`)
- `is_active` (optional): Filter by active status (e.g., `?is_active=true`)

**Purpose:** Fetch software modules (specific software products within categories)

**Response Format:**
```json
{
  "message": "Successfully fetched software modules",
  "data": [
    {
      "id": "1",
      "name": "SmartQ Ordering App",
      "description": "Full-featured food ordering application",
      "category_id": "1",
      "license_fee": 99.99,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00",
      "category": {
        "id": "1",
        "name": "Food Ordering App",
        "description": "Mobile/web app for food ordering"
      }
    }
  ]
}
```

### 3. Get Hardware Items
**Endpoint:** `GET /api/platform/hardware-items`

**Query Parameters:**
- `category_ids` (optional): Comma-separated list of category IDs to filter by (e.g., `?category_ids=1,2,3`)
- `is_active` (optional): Filter by active status (e.g., `?is_active=true`)

**Purpose:** Fetch hardware items (devices, equipment)

**Response Format:**
```json
{
  "message": "Successfully fetched hardware items",
  "data": [
    {
      "id": "1",
      "name": "iPad Pro 12.9\"",
      "description": "Tablet for kiosk display",
      "category_id": "1",
      "subcategory": "Tablets",
      "manufacturer": "Apple",
      "configuration_notes": "Requires protective case",
      "unit_cost": 1099.99,
      "support_type": "Warranty",
      "support_cost": 99.99,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00",
      "category": {
        "id": "1",
        "name": "Tablets",
        "description": "Tablet devices"
      }
    }
  ]
}
```

### 4. Get Recommendation Rules (Optional)
**Endpoint:** `GET /api/platform/recommendation-rules`

**Query Parameters:**
- `category_ids` (optional): Comma-separated list of category IDs (e.g., `?category_ids=1,2,3`)

**Purpose:** Fetch recommendation rules that link software categories to hardware categories

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
      "quantity": 1,
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00"
    }
  ]
}
```

## Database Schema Suggestions

### Software Categories Table
```sql
CREATE TABLE software_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Software Modules Table
```sql
CREATE TABLE software_modules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category_id INT NOT NULL,
  license_fee DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES software_categories(id)
);
```

### Hardware Items Table
```sql
CREATE TABLE hardware_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category_id INT NOT NULL,
  subcategory VARCHAR(255),
  manufacturer VARCHAR(255),
  configuration_notes TEXT,
  unit_cost DECIMAL(10, 2) NOT NULL,
  support_type VARCHAR(255),
  support_cost DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(255),
  updated_by VARCHAR(255),
  FOREIGN KEY (category_id) REFERENCES hardware_categories(id)
);
```

## Implementation Notes

1. **Error Handling:** If endpoints don't exist yet, the frontend will return empty arrays (won't crash)
2. **Caching:** Consider implementing caching on the backend for frequently accessed data
3. **Pagination:** For large datasets, consider adding pagination support
4. **Filtering:** The `is_active` filter is important for showing only active items in dropdowns

## Additional Required Endpoints (for Software & Hardware Management Page)

### 5. Create Software Module
**Endpoint:** `POST /api/platform/software-modules`

**Request Body:**
```json
{
  "name": "SmartQ Ordering App",
  "description": "Full-featured food ordering application",
  "category_id": "1",
  "license_fee": 99.99,
  "is_active": true
}
```

**Response Format:**
```json
{
  "message": "Software module created successfully",
  "data": {
    "id": "1",
    "name": "SmartQ Ordering App",
    "description": "Full-featured food ordering application",
    "category_id": "1",
    "license_fee": 99.99,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  }
}
```

### 6. Update Software Module
**Endpoint:** `PUT /api/platform/software-modules/:id`

**Request Body:** (same as create, all fields optional except those being updated)

**Response Format:** (same as create)

### 7. Delete Software Module
**Endpoint:** `DELETE /api/platform/software-modules/:id`

**Response Format:**
```json
{
  "message": "Software module deleted successfully"
}
```

### 8. Archive/Unarchive Software Module
**Endpoint:** `PUT /api/platform/software-modules/:id/archive` or `PUT /api/platform/software-modules/:id/unarchive`

**Response Format:**
```json
{
  "message": "Software module archived successfully"
}
```

### 9. Create Hardware Item
**Endpoint:** `POST /api/platform/hardware-items`

**Request Body:**
```json
{
  "name": "iPad Pro 12.9\"",
  "description": "Tablet for kiosk display",
  "category_id": "1",
  "subcategory": "Tablets",
  "manufacturer": "Apple",
  "configuration_notes": "Requires protective case",
  "unit_cost": 1099.99,
  "support_type": "Warranty",
  "support_cost": 99.99,
  "is_active": true
}
```

**Response Format:**
```json
{
  "message": "Hardware item created successfully",
  "data": {
    "id": "1",
    "name": "iPad Pro 12.9\"",
    "description": "Tablet for kiosk display",
    "category_id": "1",
    "subcategory": "Tablets",
    "manufacturer": "Apple",
    "configuration_notes": "Requires protective case",
    "unit_cost": 1099.99,
    "support_type": "Warranty",
    "support_cost": 99.99,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  }
}
```

### 10. Update Hardware Item
**Endpoint:** `PUT /api/platform/hardware-items/:id`

**Request Body:** (same as create, all fields optional except those being updated)

**Response Format:** (same as create)

### 11. Delete Hardware Item
**Endpoint:** `DELETE /api/platform/hardware-items/:id`

**Response Format:**
```json
{
  "message": "Hardware item deleted successfully"
}
```

### 12. Archive/Unarchive Hardware Item
**Endpoint:** `PUT /api/platform/hardware-items/:id/archive` or `PUT /api/platform/hardware-items/:id/unarchive`

**Response Format:**
```json
{
  "message": "Hardware item archived successfully"
}
```

## Testing

Once implemented, test with:
- `GET /api/platform/software-categories` - Should return list of categories
- `GET /api/platform/software-modules?is_active=true` - Should return active modules
- `GET /api/platform/hardware-items?is_active=true` - Should return active hardware items
- `POST /api/platform/software-modules` - Should create a new software module
- `PUT /api/platform/software-modules/:id` - Should update an existing software module
- `DELETE /api/platform/software-modules/:id` - Should delete a software module
- `POST /api/platform/hardware-items` - Should create a new hardware item
- `PUT /api/platform/hardware-items/:id` - Should update an existing hardware item
- `DELETE /api/platform/hardware-items/:id` - Should delete a hardware item

