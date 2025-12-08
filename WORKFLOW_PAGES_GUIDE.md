# Workflow Pages Guide

## Overview

The site workflow is managed through a **page-based system** where each workflow stage is a "page" that contains "sections" with "fields".

**Hierarchy:**
```
Site
  └── Pages (Workflow Stages)
      └── Sections (Logical Groupings)
          └── Fields (Data Points)
```

## Workflow Stages → Pages Mapping

| Workflow Stage | Page Name | Description |
|----------------|-----------|-------------|
| `Created` | `create_site` | Initial site creation |
| `site_study_done` | `site_study` | Site study completed |
| `scoping_done` | `scoping` | Hardware scoping done |
| `approved` | `approval` | Approval stage |
| `procurement_done` | `procurement` | Procurement completed |
| `deployed` | `deployment` | Deployment stage |
| `live` | `go_live` | Go-live stage |

## Standard Page Sections

### 1. Create Site (`create_site`)
- **general_info**: Site name, organization, status
- **location**: Address, coordinates, target live date
- **stakeholders**: Ops manager, deployment engineer, contacts

### 2. Site Study (`site_study`)
- **study_details**: Study date, conducted by, findings
- **findings**: Observations, recommendations
- **documents**: Uploaded documents, site maps

### 3. Scoping (`scoping`)
- **hardware_requirements**: Required hardware items
- **cost_breakdown**: Cost summary, budget
- **approvals**: Approval status, comments

### 4. Approval (`approval`)
- **approval_details**: Approver, approval date, status
- **comments**: Approval comments, feedback
- **attachments**: Supporting documents

### 5. Procurement (`procurement`)
- **procurement_items**: Items to procure, quantities
- **vendor_info**: Vendor details, PO numbers
- **delivery**: Delivery dates, tracking

### 6. Deployment (`deployment`)
- **deployment_checklist**: Deployment tasks
- **installation**: Installation details, hardware mapping
- **testing**: Testing results, validation

### 7. Go Live (`go_live`)
- **go_live_checklist**: Pre-go-live checks
- **activation**: Activation date, activated by
- **post_live**: Post-live monitoring, issues

## Usage Examples

### Creating a Site with Initial Page

```typescript
import { SitesService } from '@/services/sitesService';

const site = await SitesService.createSite({
  name: 'New Site',
  organization_id: '1',
  organization_name: 'Acme Corp',
  location: 'London, UK',
  target_live_date: '2024-12-31',
  assigned_ops_manager: 'user-123',
  assigned_deployment_engineer: 'user-456',
  status: 'Created',
});
// This automatically creates the 'create_site' page with sections
```

### Getting a Workflow Page

```typescript
import { PageService } from '@/services/pageService';

// Get site study page
const siteStudyPage = await PageService.getPage('site_study', siteId);

// Get page by status
const page = await PageService.getPageByStatus('site_study_done', siteId);
```

### Updating Field Values

```typescript
// Update a single field
await PageService.updateField(
  siteId,
  'site_study',
  'findings',
  'counter_count',
  { value: 15, type: 'number' }
);

// Get a field value
const counterCount = await PageService.getFieldValue(
  siteId,
  'site_study',
  'findings',
  'counter_count'
);
```

### Creating a New Section

```typescript
import { SectionService } from '@/services/sectionService';

await SectionService.createSection(
  pageId,
  'custom_section',
  [
    { field_name: 'custom_field', field_value: { text: 'value' } }
  ]
);
```

### Updating Site Status (Creates/Updates Page)

```typescript
// When site status changes, the corresponding page is created/updated
await SitesService.updateSite(siteId, {
  status: 'site_study_done' // Creates/updates 'site_study' page
});
```

## Field Value Structure

Fields store flexible JSON data. Examples:

```typescript
// Text field
{ field_name: 'site_name', field_value: { text: 'Site Name' } }

// Number field
{ field_name: 'counter_count', field_value: { value: 15, type: 'number' } }

// Date field
{ field_name: 'target_live_date', field_value: { date: '2024-12-31' } }

// Complex object
{ 
  field_name: 'hardware_items', 
  field_value: {
    items: [
      { name: 'POS Machine', quantity: 5, cost: 1000 }
    ],
    total: 5000
  }
}

// Array
{ 
  field_name: 'stakeholders', 
  field_value: [
    { name: 'John', role: 'Manager', email: 'john@example.com' }
  ]
}
```

## Backend API Endpoints

- `GET /api/page?page_name={name}&site_id={id}` - Get page with sections/fields
- `POST /api/page` - Create page (can create site if site_id not provided)
- `PUT /api/page` - Update page (requires id in body)
- `GET /api/section?page_id={id}&section_name={name}` - Get sections
- `POST /api/section` - Create section

## Best Practices

1. **Always create pages when site status changes** - Use `SitesService.updateSite()` which handles this automatically

2. **Use consistent field names** - Follow naming conventions:
   - `site_name`, `organization_name`, `location`
   - `counter_count`, `hardware_items`, `cost_breakdown`
   - `approval_status`, `approval_date`, `approver_id`

3. **Group related fields in sections** - Logical groupings make data easier to manage

4. **Use structured field values** - Store data as JSON objects, not plain strings

5. **Initialize pages lazily** - Create pages when needed, not all at once (unless required)

6. **Handle missing pages gracefully** - Check if page exists before accessing fields

## Migration Notes

- Existing sites may not have pages created yet
- Use `PageService.initializeSiteWorkflow(siteId)` to create all pages for an existing site
- Field values can be migrated from old structure to new page-based structure

