# Site Study Enhancements

This document describes the new features added to the Site Study page, including Site Notes and Stakeholders management.

## New Features

### 1. Site Notes & Additional Details
- **Site Notes**: A rich text area for entering detailed site study notes, observations, and key findings
- **Additional Site Details**: A separate text area for supplementary information, special requirements, or additional context
- **Edit Mode**: Toggle between view and edit modes with inline editing
- **Character Counts**: Real-time character counting with performance warnings for long content
- **Auto-save**: Changes are automatically saved to the database

### 2. Stakeholders Management
- **Add Stakeholders**: Add new stakeholders with name, role, email, and phone
- **Edit Stakeholders**: Modify existing stakeholder information
- **Remove Stakeholders**: Delete stakeholders from the site study
- **Validation**: Client-side and server-side validation for all stakeholder fields
- **Table View**: Clean, organized display of all stakeholders with contact information

## Database Changes

### New Columns Added to `site_studies` table:
- `site_notes` (TEXT): Stores the main site study notes
- `additional_site_details` (TEXT): Stores supplementary site information
- `stakeholders` (JSONB): Stores an array of stakeholder objects

### Stakeholder JSONB Structure:
```json
[
  {
    "name": "John Doe",
    "role": "Operations Manager",
    "email": "john.doe@company.com",
    "phone": "+44 7700 900123"
  }
]
```

## Setup Instructions

### 1. Database Migration
Run the following SQL script in your Supabase SQL editor:

```sql
-- File: supabase/add-site-notes-stakeholders.sql
-- This script adds the new columns and creates necessary indexes
```

### 2. Application Features
The new features are automatically available in the Site Study page:
- Navigate to any site's Site Study page
- Use the stepper to navigate to the "Notes & Stakeholders" step
- Add/edit site notes and manage stakeholders

## Usage

### Site Notes
1. Navigate to the "Notes & Stakeholders" step in the Site Study
2. Click "Edit Notes" to enter edit mode
3. Enter your site study notes and additional details
4. Click "Save Notes" to save changes

### Stakeholders
1. In the "Notes & Stakeholders" step, find the Stakeholders section
2. Click "Add Stakeholder" to add a new stakeholder
3. Fill in the required fields (Name, Role, Email, Phone)
4. Click "Add Stakeholder" to save
5. Use the edit/delete buttons to manage existing stakeholders

## Validation Rules

### Stakeholder Validation:
- **Name**: Required, non-empty string
- **Role**: Required, non-empty string
- **Email**: Required, valid email format
- **Phone**: Required, valid phone format (allows international formats)

### Notes Validation:
- Both fields are optional but recommended
- Character limits are enforced for performance
- Content is automatically saved to prevent data loss

## Technical Implementation

### Components:
- `SiteNotesManager`: Manages site notes and additional details
- `StakeholderManager`: Manages stakeholder CRUD operations
- `SiteStudyService`: Handles database operations and validation

### Services:
- `SiteStudyService`: Central service for all site study operations
- Database integration with Supabase
- Real-time validation and error handling

### State Management:
- Local state for form data
- Real-time updates to parent components
- Automatic synchronization with database

## Error Handling

- Form validation errors are displayed inline
- Database operation errors show toast notifications
- Loading states prevent multiple submissions
- Graceful fallbacks for missing data

## Performance Considerations

- Character count warnings for long notes (>1000 characters)
- Efficient JSONB indexing for stakeholder queries
- Lazy loading of stakeholder data
- Optimized re-renders with React state management

## Future Enhancements

- Rich text editing for notes (markdown support)
- Stakeholder role templates
- Bulk stakeholder import/export
- Advanced search and filtering for stakeholders
- Integration with external contact systems
