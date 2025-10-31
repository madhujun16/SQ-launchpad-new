# 📚 SmartQ LaunchPad - Complete Documentation

**Version**: 1.0.0  
**Last Updated**: October 31, 2025  
**Project**: Site Onboarding, Deployment & Inventory Management Platform

---

## 📑 Table of Contents

1. [Project Overview](#-project-overview)
2. [Technology Stack](#-technology-stack)
3. [Getting Started](#-getting-started)
4. [Project Architecture](#-project-architecture)
5. [Features & Modules](#-features--modules)
6. [User Roles & Permissions](#-user-roles--permissions)
7. [Database Schema](#-database-schema)
8. [Workflow System](#-workflow-system)
9. [Development Guide](#-development-guide)
10. [API Services](#-api-services)
11. [Deployment](#-deployment)
12. [Performance Optimizations](#-performance-optimizations)
13. [Troubleshooting](#-troubleshooting)
14. [Best Practices](#-best-practices)

---

## 🚀 Project Overview

### Purpose

SmartQ LaunchPad is a comprehensive workflow-driven platform designed to simplify and standardize the onboarding of new client sites across the UK. It manages the entire lifecycle from initial site creation through deployment, inventory management, and system integration.

### Key Objectives

- **Streamline Site Onboarding**: Automate and standardize the site onboarding process
- **Hardware Management**: Track hardware from scoping through deployment and service
- **Approval Workflows**: Implement structured approval processes for hardware and software decisions
- **Inventory Tracking**: Real-time visibility into asset deployment and status
- **Forecasting**: Pipeline visibility for capacity planning and resource allocation
- **Integration Ready**: Export data for Control Desk integration

### Target Users

- **Admins**: System administrators with full access
- **Ops Managers**: Approve hardware requests and oversee operations
- **Deployment Engineers**: Conduct site studies and deploy hardware

---

## 🛠️ Technology Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.3.1 | UI Framework |
| **TypeScript** | 5.5.3 | Type-safe JavaScript |
| **Vite** | 5.4.1 | Build tool and dev server |
| **React Router** | 6.26.2 | Client-side routing |
| **Tailwind CSS** | 3.4.11 | Utility-first CSS framework |
| **shadcn/ui** | Latest | Component library |

### State Management & Data Fetching

| Technology | Purpose |
|-----------|---------|
| **TanStack Query** | Server state management and caching |
| **React Hook Form** | Form state management |
| **Zod** | Schema validation |

### Backend & Database

| Technology | Purpose |
|-----------|---------|
| **Supabase** | Backend-as-a-Service platform |
| **PostgreSQL** | Relational database |
| **Supabase Auth** | Authentication & authorization |
| **Row Level Security (RLS)** | Database-level security |

### UI Components & Libraries

| Library | Purpose |
|---------|---------|
| **Radix UI** | Accessible UI primitives |
| **Lucide React** | Icon library |
| **Recharts** | Charts and data visualization |
| **date-fns** | Date manipulation |
| **Sonner** | Toast notifications |
| **cmdk** | Command menu |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **TypeScript** | Type checking |
| **PostCSS** | CSS processing |
| **Autoprefixer** | CSS vendor prefixing |

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: 20 LTS or higher (recommended: use nvm)
- **npm**: 10.x or higher
- **Git**: For version control
- **Supabase Account**: For backend services

### Installation

#### 1. Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd SQ-Launchpad/SQ-launchpad-new
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Environment Configuration

Create a `.env` file in the project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Other configurations
VITE_APP_ENV=development
```

**Note**: The project has safe defaults, so it can boot without `.env` for initial testing.

#### 4. Database Setup

Run the database setup scripts to create tables and populate initial data:

```bash
# Option 1: Automated setup
./setup_site_workflow.sh

# Option 2: Manual setup via Supabase Dashboard
# 1. Go to SQL Editor in Supabase Dashboard
# 2. Run: database/scripts/complete_site_workflow_setup.sql
```

#### 5. Start Development Server

The server is now configured to run on port **8085**:

```bash
npm run dev
```

Access the application at: **http://localhost:8085**

### macOS Quick Start

```bash
# Install nvm (if not already installed)
brew install nvm

# Load nvm
export NVM_DIR="$HOME/.nvm"
source "$(brew --prefix nvm)/nvm.sh"

# Install and use Node 20
nvm install 20
nvm use 20

# Install dependencies and run
npm install
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 8085 |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run build:analyze` | Build and analyze bundle size |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🏗️ Project Architecture

### Directory Structure

```
SQ-launchpad-new/
├── public/                     # Static assets
│   ├── favicon.svg
│   ├── manifest.json
│   └── smartq-launchpad-logo.svg
│
├── src/                        # Application source code
│   ├── assets/                # Images and static resources
│   │   ├── hero-image.jpg
│   │   └── smartq-launchpad-logo.svg
│   │
│   ├── components/            # React components
│   │   ├── ui/               # shadcn-ui components (65 files)
│   │   ├── dashboards/       # Dashboard components
│   │   ├── forecast/         # Forecast components
│   │   ├── inventory/        # Inventory components
│   │   ├── siteSteps/        # Site workflow step components
│   │   ├── AccessDenied.tsx
│   │   ├── AuthGuard.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── Header.tsx
│   │   ├── Layout.tsx
│   │   ├── NotificationBell.tsx
│   │   ├── RoleBasedRoute.tsx
│   │   └── [... other components]
│   │
│   ├── config/               # Configuration files
│   │   ├── security.ts
│   │   └── storage.ts
│   │
│   ├── contexts/             # React contexts
│   │   └── SiteContext.tsx
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.tsx
│   │   ├── useCommonOperations.ts
│   │   ├── useDataFetching.ts
│   │   ├── useRoleAccess.ts
│   │   ├── useSectionAutoSave.ts
│   │   └── use-toast.ts
│   │
│   ├── integrations/         # External integrations
│   │   └── supabase/
│   │       ├── client.ts     # Supabase client setup
│   │       └── types.ts      # Database types
│   │
│   ├── lib/                  # Utility libraries
│   │   ├── dateUtils.ts
│   │   ├── icons.ts
│   │   ├── roles.ts          # Role-based access control
│   │   ├── siteTypes.ts
│   │   └── utils.ts
│   │
│   ├── pages/                # Page components (23 pages)
│   │   ├── Dashboard.tsx
│   │   ├── Sites.tsx
│   │   ├── SiteCreation.tsx
│   │   ├── Site.tsx
│   │   ├── SiteFlowHub.tsx
│   │   ├── Deployment.tsx
│   │   ├── Inventory.tsx
│   │   ├── ApprovalsProcurement.tsx
│   │   ├── HardwareScoping.tsx
│   │   ├── HardwareApprovals.tsx
│   │   ├── SoftwareHardwareManagement.tsx
│   │   ├── OrganizationsManagement.tsx
│   │   ├── UserManagement.tsx
│   │   ├── LicenseManagement.tsx
│   │   ├── Forecast.tsx
│   │   ├── GeneralSettings.tsx
│   │   ├── AuditLogs.tsx
│   │   └── [... other pages]
│   │
│   ├── services/             # API service layer (19 services)
│   │   ├── apiService.ts
│   │   ├── approvalWorkflowService.ts
│   │   ├── categoryService.ts
│   │   ├── costingService.ts
│   │   ├── dashboardService.ts
│   │   ├── fileUploadService.ts
│   │   ├── inventoryService.ts
│   │   ├── licenseService.ts
│   │   ├── notificationService.ts
│   │   ├── organisationsService.ts
│   │   ├── platformConfigService.ts
│   │   ├── scopingService.ts
│   │   ├── settingsService.ts
│   │   ├── sitesService.ts
│   │   ├── siteStudyService.ts
│   │   ├── siteWorkflowService.ts
│   │   ├── userService.ts
│   │   └── workflowService.ts
│   │
│   ├── types/                # TypeScript type definitions
│   │   ├── costing.ts
│   │   ├── database.ts
│   │   ├── inventory.ts
│   │   ├── notifications.ts
│   │   ├── platformConfig.ts
│   │   ├── scopingApproval.ts
│   │   ├── siteStudy.ts
│   │   ├── siteTypes.ts
│   │   └── workflow.ts
│   │
│   ├── utils/                # Utility functions
│   │   ├── chromeOptimizations.ts
│   │   └── sessionMonitor.ts
│   │
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # Application entry point
│   ├── App.css               # Global styles
│   └── index.css             # Tailwind imports
│
├── supabase/                 # Supabase configuration
│   ├── migrations/           # Database migrations (135+ files)
│   ├── functions/            # Edge functions
│   │   └── geocoding/
│   └── config.toml           # Supabase config
│
├── database/                 # Database scripts
│   ├── scripts/              # SQL scripts
│   │   ├── complete_database_setup.sql
│   │   ├── complete_site_workflow_setup.sql
│   │   ├── setup_categories_table.sql
│   │   ├── setup_software_hardware_tables.sql
│   │   └── [... fix scripts]
│   └── README.md
│
├── scripts/                  # Build and utility scripts
│   ├── analyze-bundle.js
│   └── fix_organizations.sh
│
├── docs/                     # Project documentation
│   └── database/
│       └── ORGANIZATION_FIX_README.md
│
├── vite.config.ts            # Vite configuration
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies
├── README.md                 # Basic readme
├── WORKFLOW_ARCHITECTURE.md  # Workflow documentation
├── PERFORMANCE_OPTIMIZATIONS.md # Performance guide
└── COMPLETE_DOCUMENTATION.md # This file
```

### Component Architecture

```
┌─────────────────────────────────────────────┐
│            Browser / Client                  │
├─────────────────────────────────────────────┤
│                                              │
│  ┌──────────────────────────────────────┐  │
│  │         React Application             │  │
│  │                                       │  │
│  │  ┌──────────────────────────────┐   │  │
│  │  │     Pages (23 routes)        │   │  │
│  │  └──────────┬───────────────────┘   │  │
│  │             │                         │  │
│  │  ┌──────────▼───────────────────┐   │  │
│  │  │   Components & UI            │   │  │
│  │  └──────────┬───────────────────┘   │  │
│  │             │                         │  │
│  │  ┌──────────▼───────────────────┐   │  │
│  │  │   Hooks & State Management   │   │  │
│  │  └──────────┬───────────────────┘   │  │
│  │             │                         │  │
│  │  ┌──────────▼───────────────────┐   │  │
│  │  │   Services (19 services)     │   │  │
│  │  └──────────┬───────────────────┘   │  │
│  │             │                         │  │
│  │  ┌──────────▼───────────────────┐   │  │
│  │  │   Supabase Client            │   │  │
│  │  └──────────┬───────────────────┘   │  │
│  └─────────────┼─────────────────────── │  │
└────────────────┼─────────────────────────┘
                 │
                 │ HTTP/WebSocket
                 │
┌────────────────▼─────────────────────────┐
│         Supabase Backend                  │
├──────────────────────────────────────────┤
│  ┌──────────────────────────────────┐   │
│  │    PostgreSQL Database           │   │
│  │  - 135+ migrations               │   │
│  │  - Row Level Security (RLS)      │   │
│  └──────────────────────────────────┘   │
│                                           │
│  ┌──────────────────────────────────┐   │
│  │    Supabase Auth                 │   │
│  │  - User authentication           │   │
│  │  - Role-based access             │   │
│  └──────────────────────────────────┘   │
│                                           │
│  ┌──────────────────────────────────┐   │
│  │    Edge Functions                │   │
│  │  - Geocoding service             │   │
│  └──────────────────────────────────┘   │
└───────────────────────────────────────────┘
```

---

## 🎯 Features & Modules

### 1. Dashboard

**Purpose**: Central hub for role-specific information and quick actions

**Features**:
- Role-specific dashboard views
- Site statistics and KPIs
- Pending approvals summary
- Recent activities
- Quick access to common tasks

**User Roles**: Admin, Ops Manager, Deployment Engineer

**Key Components**:
- `Dashboard.tsx`
- `DashboardStats.tsx`
- `SimpleOpsManagerDashboard.tsx`
- `SimpleDeploymentEngineerDashboard.tsx`

---

### 2. Site Management

**Purpose**: Complete site lifecycle management from creation to go-live

#### 2.1 Site Creation

**Features**:
- Create new sites with organization mapping
- Assign Ops Managers and Deployment Engineers
- Set target live dates and criticality levels
- Define location and sector information

**Access**: Admin, Ops Manager, Deployment Engineer

**Page**: `SiteCreation.tsx`

#### 2.2 Site List

**Features**:
- View all sites with filtering and sorting
- Status-based filtering
- Search by name, organization, or location
- Quick actions (view, edit, delete)
- Export functionality

**Access**: All authenticated users

**Page**: `Sites.tsx`

#### 2.3 Site Details

**Features**:
- Complete site information
- Workflow step progress
- Stakeholder management
- Notes and comments
- Document uploads

**Access**: All authenticated users

**Page**: `Site.tsx`

#### 2.4 Site Flow Hub

**Purpose**: Visual workflow management with step-by-step progression

**Workflow Steps**:
1. **Site Creation**: Basic information and assignments
2. **Site Study**: Infrastructure assessment and requirements
3. **Scoping**: Software/hardware selection and costing
4. **Approvals**: Review and approval workflow
5. **Procurement**: Order tracking and delivery management
6. **Deployment**: Hardware installation and configuration
7. **Go Live**: Final checklist and handover

**Features**:
- Visual stepper interface
- Step-by-step data collection
- Auto-save functionality
- Progress tracking
- Step validation

**Access**: Assigned users per site

**Pages**: 
- `SiteFlowHub.tsx` (main hub)
- `SiteStepEdit.tsx` (step editor)
- Individual step components in `components/siteSteps/`

---

### 3. Site Study

**Purpose**: Deployment engineers conduct on-site assessments

**Features**:
- Site layout mapping
- Counter counting and documentation
- Infrastructure assessment
- Hardware requirement definition
- Photo/document uploads
- Geolocation capture

**Access**: Deployment Engineer, Ops Manager, Admin

**Components**: `siteSteps/SiteStudyStep.tsx`

**Data Collected**:
- Counter count
- Product types
- Network infrastructure
- Power requirements
- Space constraints
- Staff capacity

---

### 4. Hardware & Software Management

#### 4.1 Scoping

**Purpose**: Define software modules and hardware requirements

**Features**:
- Software module selection
- Hardware filtering based on software categories
- Quantity adjustment
- Cost calculation
- Submit for approval

**Access**: Admin, Ops Manager, Deployment Engineer

**Page**: `HardwareScoping.tsx`

**Workflow**:
```
Select Software → Filter Hardware → Adjust Quantities → Calculate Costs → Submit
```

#### 4.2 Hardware Approvals

**Purpose**: Review and approve hardware scoping decisions

**Features**:
- Review scoping submissions
- Approve/reject with comments
- Request changes
- Cost validation
- Approval history

**Access**: Admin, Ops Manager

**Page**: `HardwareApprovals.tsx`

#### 4.3 Hardware Master Data

**Purpose**: Manage hardware and software catalog

**Features**:
- Add/edit/archive hardware items
- Add/edit/archive software modules
- Category management
- Pricing management
- Archive functionality (preserves historical data)

**Access**: Admin

**Page**: `SoftwareHardwareManagement.tsx`

---

### 5. Procurement & Approvals

**Purpose**: Manage procurement process for approved hardware

**Features**:
- Create procurement items from approved scoping
- Track order status (pending → ordered → delivered → installed)
- Supplier management
- Order reference tracking
- Delivery date management
- Installation tracking

**Access**: Admin, Ops Manager

**Page**: `ApprovalsProcurement.tsx`

**Status Flow**:
```
Pending → Ordered → Delivered → Installed
```

---

### 6. Deployment

**Purpose**: Track hardware deployment across sites

**Features**:
- View sites ready for deployment
- Deployment progress tracking
- Timeline management
- Resource allocation
- Status updates

**Access**: Admin, Ops Manager, Deployment Engineer

**Page**: `Deployment.tsx`

---

### 7. Asset Management

**Purpose**: Track individual hardware assets and service cycles

**Features**:
- Individual asset tracking
- Model number assignment
- Service cycle management
- Status tracking (pending → installed → active → maintenance → retired)
- Service history
- Next service due dates
- Asset assignment to sites

**Access**: All authenticated users (role-based visibility)

**Page**: `Assets.tsx`

**Asset Lifecycle**:
```
Pending → Installed → Active → Maintenance → Retired
```

---

### 8. Inventory Management

**Purpose**: Real-time visibility into asset deployment and status

**Features**:
- Multi-dimensional filtering:
  - Sector
  - City
  - Site
  - Group Type (POS, KMS, KIOSK)
  - Inventory Type
  - License status
- Asset search
- Export functionality (JSON, Excel)
- Live status updates
- Service due alerts

**Access**: All authenticated users

**Page**: `Inventory.tsx`

**Group Types**:
- **POS**: POS Machine, PED, Printer, Cash Drawer
- **KMS**: Kitchen Printers and displays
- **KIOSK**: Self-service kiosks

---

### 9. License Management

**Purpose**: Track hardware, software, and service licenses

**Features**:
- License creation and assignment
- Renewal tracking
- Expiry alerts
- Compliance monitoring
- Cost tracking
- Vendor management
- License history

**Access**: Admin, Ops Manager

**Page**: `LicenseManagement.tsx`

**License Types**:
- Hardware warranties
- Software licenses
- Service agreements
- Support contracts

---

### 10. Forecasting

**Purpose**: Pipeline visibility and capacity planning

**Features**:
- Upcoming site onboarding pipeline
- Capacity forecasting
- Resource planning
- Timeline Gantt view
- Hardware procurement planning
- Deployment schedule

**Access**: Admin

**Page**: `Forecast.tsx`

**Components**: `TimelineGanttView.tsx`

---

### 11. Platform Configuration

#### 11.1 Organizations Management

**Purpose**: Manage client organizations

**Features**:
- Create/edit/delete organizations
- Organization hierarchy
- Food court (unit) mapping
- Contact information
- Status management

**Access**: Admin

**Page**: `OrganizationsManagement.tsx`

#### 11.2 User Management

**Purpose**: Manage system users and roles

**Features**:
- Create/edit/delete users
- Role assignment (Admin, Ops Manager, Deployment Engineer)
- User activation/deactivation
- Permission management
- User search and filtering

**Access**: Admin

**Page**: `UserManagement.tsx`

#### 11.3 General Settings

**Purpose**: System-wide configuration

**Features**:
- System settings
- Default values
- Email templates
- Notification preferences
- Integration settings

**Access**: Admin

**Page**: `GeneralSettings.tsx`

#### 11.4 Audit Logs

**Purpose**: Track system changes and user actions

**Features**:
- View audit trail
- Filter by user, date, action
- Export logs
- Compliance reporting

**Access**: Admin

**Page**: `AuditLogs.tsx`

---

### 12. Notifications

**Purpose**: Real-time notifications for important events

**Features**:
- Bell icon with unread count
- Notification center
- Mark as read/unread
- Notification types:
  - Approval requests
  - Status changes
  - Assignments
  - Deadlines
  - System alerts

**Access**: All authenticated users

**Components**: 
- `NotificationBell.tsx`
- `NotificationCenter.tsx`

---

### 13. Data Export

**Purpose**: Export data for Control Desk integration

**Features**:
- Export site data as JSON or Excel
- Organization hierarchy export
- Hardware inventory export
- Custom field selection
- Scheduled exports

**Access**: Admin

**Integration**: Control Desk configuration

---

## 👥 User Roles & Permissions

### Role Hierarchy

```
┌─────────────────────┐
│       Admin         │  (Full access)
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     │           │
┌────▼─────┐ ┌──▼──────────────────┐
│Ops       │ │Deployment           │
│Manager   │ │Engineer             │
└──────────┘ └─────────────────────┘
```

### Admin

**Display Name**: Admin  
**Icon**: Shield  
**Color**: Red

**Key Responsibilities**:
- Create and manage sites
- Assign Ops Managers and Deployment Engineers
- Scope hardware requirements
- Manage approval workflows
- Export data for Control Desk
- Configure system settings
- Manage users and organizations
- View all sites and deployments

**Permissions** (23 total):
- `create_sites`
- `assign_users`
- `edit_site_assignments`
- `view_all_sites`
- `manage_users`
- `edit_site_info`
- `scope_hardware`
- `manage_approval_workflows`
- `manage_approvals`
- `export_data`
- `view_inventory`
- `view_forecast`
- `manage_licenses`
- `conduct_site_studies`
- `upload_findings`
- `update_site_status`
- `add_site_geolocation`
- `define_hardware_requirements`
- `view_all_deployments`
- `view_all_assets`
- `manage_platform_configuration`

**Accessible Pages**: All pages (universal access)

---

### Ops Manager

**Display Name**: Ops Manager  
**Icon**: Users  
**Color**: Green

**Key Responsibilities**:
- Approve hardware requests for assigned sites
- Create sites
- Conduct site studies
- View assigned sites
- Update site status
- Manage approvals

**Permissions** (14 total):
- `approve_hardware_requests`
- `view_assigned_sites`
- `view_sites`
- `manage_approvals`
- `update_site_status`
- `view_inventory`
- `create_sites`
- `conduct_site_studies`
- `upload_findings`
- `add_site_geolocation`
- `define_hardware_requirements`
- `scope_hardware`
- `view_assigned_deployments`
- `view_all_assets`

**Accessible Pages**:
- Dashboard
- Sites (assigned only)
- Site Creation
- Site Details
- Site Flow Hub
- Site Study
- Approvals & Procurement
- Hardware Scoping/Approvals
- Deployment
- Inventory
- License Management

---

### Deployment Engineer

**Display Name**: Deployment Engineer  
**Icon**: Wrench  
**Color**: Green

**Key Responsibilities**:
- Conduct site studies
- Upload findings and documentation
- Define hardware requirements
- Update site status
- Create sites
- View assigned sites

**Permissions** (11 total):
- `conduct_site_studies`
- `upload_findings`
- `update_site_status`
- `view_assigned_sites`
- `view_sites`
- `manage_own_approvals`
- `add_site_geolocation`
- `define_hardware_requirements`
- `create_sites`
- `scope_hardware`
- `view_assigned_deployments`
- `view_assigned_assets`

**Accessible Pages**:
- Dashboard
- Sites (assigned only)
- Site Creation
- Site Details
- Site Flow Hub
- Site Study
- Hardware Scoping/Approvals
- Deployment
- Inventory

---

### User (Basic)

**Display Name**: User  
**Icon**: User  
**Color**: Gray

**Key Responsibilities**:
- Basic read-only access
- View dashboard

**Permissions**: None

**Accessible Pages**:
- Dashboard only

---

### Permission Checking

The system uses utility functions to check permissions:

```typescript
// Check if user has specific permission
hasPermission(userRole, 'create_sites') // boolean

// Check if user can access a page
canAccessPage(userRole, '/sites/create') // boolean

// Get all accessible pages for a role
getAccessiblePages(userRole) // string[]
```

---

## 🗄️ Database Schema

### Overview

The database is built on PostgreSQL (via Supabase) with comprehensive Row Level Security (RLS) policies. There are **135+ migration files** managing the schema evolution.

### Core Tables

#### 1. Users & Authentication

```sql
-- Managed by Supabase Auth
auth.users
  - id (UUID, Primary Key)
  - email (TEXT)
  - encrypted_password (TEXT)
  - created_at (TIMESTAMPTZ)
  - updated_at (TIMESTAMPTZ)

-- User profiles and roles
public.profiles
  - id (UUID, Primary Key, FK to auth.users)
  - user_id (UUID, FK to auth.users)
  - full_name (TEXT)
  - role (app_role ENUM)
  - avatar_url (TEXT)
  - created_at (TIMESTAMPTZ)
  - updated_at (TIMESTAMPTZ)
```

**Roles Enum**:
```sql
CREATE TYPE app_role AS ENUM ('admin', 'ops_manager', 'deployment_engineer', 'user');
```

---

#### 2. Organizations

```sql
public.organizations
  - id (UUID, Primary Key)
  - name (TEXT, Unique)
  - sector (TEXT)
  - contact_person (TEXT)
  - contact_email (TEXT)
  - contact_phone (TEXT)
  - status (TEXT) -- active, inactive
  - created_at (TIMESTAMPTZ)
  - updated_at (TIMESTAMPTZ)
  - created_by (UUID, FK to auth.users)
```

**Indexes**:
- `idx_organizations_name` on `name`
- `idx_organizations_status` on `status`

---

#### 3. Sites

```sql
public.sites
  - id (UUID, Primary Key)
  - name (TEXT)
  - organization_id (UUID, FK to organizations)
  - organization_name (TEXT)
  - location (TEXT)
  - address (TEXT)
  - postcode (TEXT)
  - sector (TEXT)
  - unit_code (TEXT, Unique)
  - criticality_level (TEXT) -- low, medium, high, critical
  - status (TEXT) -- draft, pending, approved, in_progress, deployed, live, cancelled
  - target_live_date (DATE)
  - actual_live_date (DATE)
  - assigned_ops_manager (TEXT)
  - assigned_deployment_engineer (TEXT)
  - latitude (NUMERIC)
  - longitude (NUMERIC)
  - notes (TEXT)
  - created_at (TIMESTAMPTZ)
  - updated_at (TIMESTAMPTZ)
  - created_by (UUID, FK to auth.users)
```

**Indexes**:
- `idx_sites_organization` on `organization_id`
- `idx_sites_status` on `status`
- `idx_sites_unit_code` on `unit_code`
- `idx_sites_created_by` on `created_by`

---

#### 4. Categories

```sql
public.categories
  - id (UUID, Primary Key)
  - name (TEXT, Unique)
  - description (TEXT)
  - is_archived (BOOLEAN, Default: false)
  - created_at (TIMESTAMPTZ)
  - updated_at (TIMESTAMPTZ)
```

**Common Categories**:
- POS
- Kiosk
- Kitchen Display (KDS)
- Inventory
- Networking
- Security

---

#### 5. Software Modules

```sql
public.software_modules
  - id (UUID, Primary Key)
  - name (TEXT, Unique)
  - description (TEXT)
  - category_id (UUID, FK to categories)
  - version (TEXT)
  - license_type (TEXT)
  - cost_per_license (NUMERIC)
  - is_archived (BOOLEAN, Default: false)
  - created_at (TIMESTAMPTZ)
  - updated_at (TIMESTAMPTZ)
```

**Example Data**:
- POS System (Category: POS)
- Kiosk Software (Category: Kiosk)
- Kitchen Display System (Category: KDS)
- Inventory Management (Category: Inventory)

---

#### 6. Hardware Items

```sql
public.hardware_items
  - id (UUID, Primary Key)
  - name (TEXT)
  - description (TEXT)
  - category_id (UUID, FK to categories)
  - model_number (TEXT)
  - manufacturer (TEXT)
  - unit_cost (NUMERIC)
  - service_cycle_months (INTEGER)
  - is_archived (BOOLEAN, Default: false)
  - specifications (JSONB)
  - created_at (TIMESTAMPTZ)
  - updated_at (TIMESTAMPTZ)
```

**Example Data**:
- POS Terminal (Category: POS)
- Receipt Printer (Category: POS)
- Cash Drawer (Category: POS)
- Kiosk Display (Category: Kiosk)
- KDS Screen (Category: KDS)
- Network Switch (Category: Networking)

---

### Workflow Tables

#### 7. Site Creation Data

```sql
public.site_creation_data
  - id (UUID, Primary Key)
  - site_id (UUID, FK to sites, Unique)
  - client_poc_name (TEXT)
  - client_poc_email (TEXT)
  - client_poc_phone (TEXT)
  - smartq_owner_name (TEXT)
  - smartq_owner_email (TEXT)
  - business_justification (TEXT)
  - special_requirements (TEXT)
  - regulatory_requirements (JSONB)
  - created_at (TIMESTAMPTZ)
  - updated_at (TIMESTAMPTZ)
```

---

#### 8. Site Study Data

```sql
public.site_study_data
  - id (UUID, Primary Key)
  - site_id (UUID, FK to sites, Unique)
  - counter_count (INTEGER)
  - infrastructure_assessment (JSONB)
  - network_details (JSONB)
  - power_requirements (JSONB)
  - space_constraints (TEXT)
  - staff_capacity (INTEGER)
  - photos (TEXT[])
  - study_notes (TEXT)
  - conducted_by (UUID, FK to auth.users)
  - conducted_at (TIMESTAMPTZ)
  - created_at (TIMESTAMPTZ)
  - updated_at (TIMESTAMPTZ)
```

---

#### 9. Site Scoping

```sql
public.site_scoping
  - id (UUID, Primary Key)
  - site_id (UUID, FK to sites)
  - selected_software (JSONB) -- Array of software module IDs
  - selected_hardware (JSONB) -- Array of {hardware_id, quantity, unit_cost, total_cost}
  - status (TEXT) -- draft, submitted, approved, rejected, changes_requested
  - cost_summary (JSONB) -- {software_total, hardware_total, grand_total}
  - submitted_at (TIMESTAMPTZ)
  - approved_at (TIMESTAMPTZ)
  - approved_by (UUID, FK to auth.users)
  - rejection_reason (TEXT)
  - notes (TEXT)
  - created_at (TIMESTAMPTZ)
  - updated_at (TIMESTAMPTZ)
  - created_by (UUID, FK to auth.users)
```

**Indexes**:
- `idx_site_scoping_site` on `site_id`
- `idx_site_scoping_status` on `status`

---

#### 10. Site Approvals

```sql
public.site_approvals
  - id (UUID, Primary Key)
  - site_id (UUID, FK to sites)
  - scoping_id (UUID, FK to site_scoping)
  - approval_type (TEXT) -- scoping, procurement, deployment, go_live
  - status (TEXT) -- pending, approved, rejected, changes_requested
  - requested_by (UUID, FK to auth.users)
  - approved_by (UUID, FK to auth.users)
  - rejected_by (UUID, FK to auth.users)
  - requested_at (TIMESTAMPTZ)
  - approved_at (TIMESTAMPTZ)
  - rejected_at (TIMESTAMPTZ)
  - rejection_reason (TEXT)
  - changes_requested_reason (TEXT)
  - comments (TEXT)
  - created_at (TIMESTAMPTZ)
  - updated_at (TIMESTAMPTZ)
```

**Indexes**:
- `idx_site_approvals_site` on `site_id`
- `idx_site_approvals_status` on `status`
- `idx_site_approvals_type` on `approval_type`

---

#### 11. Site Procurement Items

```sql
public.site_procurement_items
  - id (UUID, Primary Key)
  - site_id (UUID, FK to sites)
  - hardware_item_id (UUID, FK to hardware_items)
  - software_module_id (UUID, FK to software_modules)
  - item_type (TEXT) -- software, hardware
  - item_name (TEXT)
  - quantity (INTEGER)
  - unit_cost (NUMERIC)
  - total_cost (NUMERIC)
  - status (TEXT) -- pending, ordered, delivered, installed
  - order_date (DATE)
  - delivery_date (DATE)
  - installation_date (DATE)
  - supplier (TEXT)
  - order_reference (TEXT)
  - notes (TEXT)
  - created_at (TIMESTAMPTZ)
  - updated_at (TIMESTAMPTZ)
  - created_by (UUID, FK to auth.users)
```

**Indexes**:
- `idx_procurement_site` on `site_id`
- `idx_procurement_status` on `status`
- `idx_procurement_type` on `item_type`

---

#### 12. Site Assets

```sql
public.site_assets
  - id (UUID, Primary Key)
  - site_id (UUID, FK to sites)
  - hardware_item_id (UUID, FK to hardware_items)
  - model_number (TEXT, Unique)
  - serial_number (TEXT)
  - status (TEXT) -- pending, installed, active, maintenance, retired
  - installed_at (TIMESTAMPTZ)
  - service_cycle_months (INTEGER)
  - last_service_at (TIMESTAMPTZ)
  - next_service_due (TIMESTAMPTZ)
  - location_details (TEXT)
  - notes (TEXT)
  - created_at (TIMESTAMPTZ)
  - updated_at (TIMESTAMPTZ)
  - created_by (UUID, FK to auth.users)
```

**Indexes**:
- `idx_assets_site` on `site_id`
- `idx_assets_hardware` on `hardware_item_id`
- `idx_assets_model` on `model_number`
- `idx_assets_status` on `status`
- `idx_assets_service_due` on `next_service_due`

**Model Number Format**: `SQ-{CATEGORY}-{SEQUENCE}`
- Example: `SQ-POS-001`, `SQ-POS-002`, `SQ-KIOSK-001`

---

#### 13. Site Deployments

```sql
public.site_deployments
  - id (UUID, Primary Key)
  - site_id (UUID, FK to sites, Unique)
  - deployment_status (TEXT) -- planned, in_progress, completed, delayed
  - planned_start_date (DATE)
  - planned_end_date (DATE)
  - actual_start_date (DATE)
  - actual_end_date (DATE)
  - deployment_team (JSONB) -- Array of user IDs
  - progress_percentage (INTEGER)
  - milestones (JSONB)
  - blockers (JSONB)
  - notes (TEXT)
  - created_at (TIMESTAMPTZ)
  - updated_at (TIMESTAMPTZ)
  - created_by (UUID, FK to auth.users)
```

---

#### 14. Site Go Live

```sql
public.site_go_live
  - id (UUID, Primary Key)
  - site_id (UUID, FK to sites, Unique)
  - go_live_date (DATE)
  - checklist_items (JSONB) -- Array of checklist items with status
  - sign_off_by (UUID, FK to auth.users)
  - sign_off_date (TIMESTAMPTZ)
  - handover_notes (TEXT)
  - post_live_support_end_date (DATE)
  - status (TEXT) -- pending, completed
  - created_at (TIMESTAMPTZ)
  - updated_at (TIMESTAMPTZ)
```

---

### Supporting Tables

#### 15. Notifications

```sql
public.notifications
  - id (UUID, Primary Key)
  - user_id (UUID, FK to auth.users)
  - title (TEXT)
  - message (TEXT)
  - type (TEXT) -- approval, status_change, assignment, deadline, system
  - is_read (BOOLEAN, Default: false)
  - related_entity_type (TEXT) -- site, approval, deployment, etc.
  - related_entity_id (UUID)
  - action_url (TEXT)
  - created_at (TIMESTAMPTZ)
```

**Indexes**:
- `idx_notifications_user` on `user_id`
- `idx_notifications_read` on `is_read`
- `idx_notifications_created` on `created_at`

---

#### 16. Licenses

```sql
public.licenses
  - id (UUID, Primary Key)
  - site_id (UUID, FK to sites)
  - license_type (TEXT) -- hardware_warranty, software_license, service_agreement
  - item_name (TEXT)
  - vendor (TEXT)
  - license_key (TEXT)
  - start_date (DATE)
  - expiry_date (DATE)
  - renewal_cost (NUMERIC)
  - status (TEXT) -- active, expiring_soon, expired, renewed
  - notes (TEXT)
  - created_at (TIMESTAMPTZ)
  - updated_at (TIMESTAMPTZ)
```

**Indexes**:
- `idx_licenses_site` on `site_id`
- `idx_licenses_expiry` on `expiry_date`
- `idx_licenses_status` on `status`

---

#### 17. Audit Logs

```sql
public.audit_logs
  - id (UUID, Primary Key)
  - user_id (UUID, FK to auth.users)
  - action (TEXT) -- create, update, delete, approve, reject
  - entity_type (TEXT) -- site, approval, user, organization, etc.
  - entity_id (UUID)
  - changes (JSONB) -- Old and new values
  - ip_address (TEXT)
  - user_agent (TEXT)
  - created_at (TIMESTAMPTZ)
```

**Indexes**:
- `idx_audit_user` on `user_id`
- `idx_audit_entity` on `entity_type, entity_id`
- `idx_audit_created` on `created_at`

---

### Row Level Security (RLS)

All tables have RLS policies enabled. Example policies:

```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all sites
CREATE POLICY "Admins can view all sites"
ON public.sites FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Users can view assigned sites
CREATE POLICY "Users can view assigned sites"
ON public.sites FOR SELECT
USING (
  created_by = auth.uid()
  OR assigned_ops_manager IN (
    SELECT full_name FROM public.profiles WHERE user_id = auth.uid()
  )
  OR assigned_deployment_engineer IN (
    SELECT full_name FROM public.profiles WHERE user_id = auth.uid()
  )
);
```

---

### Database Migrations

Location: `supabase/migrations/`

**Total**: 135+ migration files

**Key Migrations**:
- Initial schema setup
- User profiles and roles
- Organizations and sites
- Categories and hardware
- Workflow tables
- Approval system
- Asset management
- Notifications
- Licenses
- Audit logs
- RLS policies
- Indexes and constraints

**Migration Naming**: `YYYYMMDDHHMMSS-description.sql`

Example: `20250105000027-create-workflow-tables.sql`

---

## 🔄 Workflow System

### Workflow Overview

The site workflow is the core of the LaunchPad system, guiding sites from initial creation through go-live.

```
┌─────────────┐     ┌──────────────┐     ┌──────────┐
│   Site      │────▶│  Site Study  │────▶│ Scoping  │
│  Creation   │     │              │     │          │
└─────────────┘     └──────────────┘     └──────────┘
                                                │
                                                ▼
┌─────────────┐     ┌──────────────┐     ┌──────────┐
│   Go Live   │◀────│ Deployment   │◀────│Approvals │
│             │     │              │     │          │
└─────────────┘     └──────────────┘     └──────────┘
                           ▲
                           │
                    ┌──────┴───────┐
                    │ Procurement  │
                    └──────────────┘
```

### Workflow Steps

#### Step 1: Site Creation

**Purpose**: Initialize a new site with basic information

**Data Collected**:
- Site name and location
- Organization mapping
- Contact information (client POC, SmartQ owner)
- Business justification
- Special requirements
- Regulatory requirements
- Target live date
- Criticality level
- Assigned Ops Manager
- Assigned Deployment Engineer

**Responsible Role**: Admin

**Table**: `sites`, `site_creation_data`

**Status**: `draft` → `pending`

---

#### Step 2: Site Study

**Purpose**: On-site assessment and requirements gathering

**Data Collected**:
- Counter count
- Infrastructure assessment
  - Existing hardware
  - Network infrastructure
  - Power availability
  - Space constraints
- Network details
  - Internet connectivity
  - WiFi coverage
  - Network equipment
- Staff capacity and training needs
- Photos and documentation
- Study notes

**Responsible Role**: Deployment Engineer

**Table**: `site_study_data`

**Status**: `pending` → `assessed`

**Workflow**:
1. Engineer visits site
2. Conducts assessment
3. Captures photos and notes
4. Submits findings
5. Status updated to "assessed"

---

#### Step 3: Scoping

**Purpose**: Define software modules and hardware requirements

**Process**:

1. **Software Selection**:
   - Select required software modules (POS, Kiosk, KDS, Inventory, etc.)
   - Software modules are categorized

2. **Hardware Filtering**:
   - Hardware items are automatically filtered based on selected software categories
   - For example, if POS software is selected, POS hardware (terminals, printers, etc.) becomes available

3. **Quantity Definition**:
   - Adjust quantities for each hardware item based on site needs
   - System calculates costs automatically

4. **Cost Calculation**:
   - Software cost: Sum of (license cost × quantity)
   - Hardware cost: Sum of (unit cost × quantity)
   - Grand total calculated

5. **Submission**:
   - Submit scoping for approval
   - Status changes to "submitted"

**Responsible Role**: Admin, Ops Manager, Deployment Engineer

**Table**: `site_scoping`

**Status**: `draft` → `submitted`

**Data Structure**:
```json
{
  "selected_software": ["uuid1", "uuid2"],
  "selected_hardware": [
    {
      "hardware_id": "uuid",
      "quantity": 5,
      "unit_cost": 500,
      "total_cost": 2500
    }
  ],
  "cost_summary": {
    "software_total": 5000,
    "hardware_total": 12500,
    "grand_total": 17500
  }
}
```

---

#### Step 4: Approvals

**Purpose**: Review and approve scoping decisions

**Process**:

1. **Approval Request Created**:
   - When scoping is submitted, an approval request is automatically created
   - Assigned to Ops Manager or Admin

2. **Review**:
   - Reviewer examines software selection
   - Reviewer examines hardware quantities and costs
   - Reviewer can request changes or reject

3. **Decision**:
   - **Approve**: Move to procurement
   - **Reject**: Return to scoping with reason
   - **Request Changes**: Return to scoping with specific change requests

4. **Notification**:
   - Submitter is notified of decision

**Responsible Role**: Ops Manager, Admin

**Table**: `site_approvals`

**Approval Types**:
- `scoping` - Initial hardware/software approval
- `procurement` - Procurement approval
- `deployment` - Deployment approval
- `go_live` - Go-live approval

**Status Flow**:
```
pending → approved/rejected/changes_requested
```

---

#### Step 5: Procurement

**Purpose**: Order and track approved hardware

**Process**:

1. **Procurement Item Creation**:
   - Approved hardware automatically creates procurement items
   - Each hardware item becomes a procurement line item

2. **Order Placement**:
   - Update status to "ordered"
   - Add supplier information
   - Add order reference
   - Set order date

3. **Delivery Tracking**:
   - Update status to "delivered"
   - Set delivery date
   - Confirm quantities received

4. **Installation Preparation**:
   - Update status to "installed"
   - Set installation date
   - Hardware ready for asset creation

**Responsible Role**: Admin, Ops Manager

**Table**: `site_procurement_items`

**Status Flow**:
```
pending → ordered → delivered → installed
```

**Data Tracked**:
- Item name and type
- Quantity
- Unit cost and total cost
- Supplier
- Order reference
- Order date
- Delivery date
- Installation date
- Notes

---

#### Step 6: Deployment

**Purpose**: Install and configure hardware at site

**Process**:

1. **Deployment Planning**:
   - Set planned start and end dates
   - Assign deployment team
   - Define milestones

2. **Asset Creation**:
   - Create individual assets from procurement items
   - Assign model numbers (e.g., SQ-POS-001, SQ-POS-002)
   - Set service cycles

3. **Installation**:
   - Track progress percentage
   - Update milestone completion
   - Note any blockers

4. **Configuration**:
   - Configure hardware
   - Test functionality
   - Update asset status to "active"

5. **Completion**:
   - All assets installed and tested
   - Status updated to "completed"

**Responsible Role**: Deployment Engineer, Admin

**Table**: `site_deployments`, `site_assets`

**Deployment Status Flow**:
```
planned → in_progress → completed/delayed
```

**Asset Status Flow**:
```
pending → installed → active → maintenance → retired
```

---

#### Step 7: Go Live

**Purpose**: Final checklist and handover

**Process**:

1. **Pre-Go-Live Checklist**:
   - All hardware installed and configured
   - All software installed and licensed
   - Staff trained
   - Integration testing completed
   - Control Desk configuration completed
   - Support documentation prepared

2. **Sign-Off**:
   - Final inspection
   - Sign-off by authorized personnel
   - Set go-live date

3. **Handover**:
   - Handover to operations team
   - Handover notes documented
   - Post-live support period defined

4. **Site Live**:
   - Site status updated to "live"
   - Monitoring begins
   - Support activated

**Responsible Role**: Admin

**Table**: `site_go_live`

**Checklist Items** (JSONB):
```json
[
  {"item": "Hardware installed", "status": "completed"},
  {"item": "Software configured", "status": "completed"},
  {"item": "Staff trained", "status": "completed"},
  {"item": "Integration tested", "status": "in_progress"},
  {"item": "Control Desk configured", "status": "pending"}
]
```

**Status**: `pending` → `completed`

---

### Workflow State Machine

```
Site Status Flow:
draft → pending → assessed → scoped → approved → 
  procurement → deployment → deployed → live

Abort Paths:
Any state → cancelled

Parallel Tracks:
- Main workflow (site status)
- Approval workflow (approval status)
- Asset workflow (asset status)
- Procurement workflow (procurement status)
```

---

### Workflow Services

#### siteWorkflowService.ts

**Purpose**: Orchestrate complete site workflow data

**Key Functions**:

```typescript
// Get complete workflow data for a site
async getSiteWorkflowData(siteId: string): Promise<SiteWorkflowData>

// Get specific step data
async getCreationData(siteId: string): Promise<SiteCreationData>
async getStudyData(siteId: string): Promise<SiteStudyData>
async getScopingData(siteId: string): Promise<SiteScopingData>
async getApprovalData(siteId: string): Promise<SiteApprovalData>
async getProcurementData(siteId: string): Promise<SiteProcurementData>
async getDeploymentData(siteId: string): Promise<SiteDeploymentData>
async getGoLiveData(siteId: string): Promise<SiteGoLiveData>

// Update step data
async updateStepData(siteId: string, stepKey: string, data: any): Promise<void>
```

---

### Workflow Automation

**Auto-save**: Changes in workflow steps are automatically saved

**Notifications**: Users are notified of:
- Assignment to sites
- Approval requests
- Approval decisions
- Status changes
- Deadline reminders

**Data Validation**: Each step validates data before allowing progression

**Audit Trail**: All workflow changes are logged in audit_logs table

---

## 🔧 Development Guide

### Setting Up Development Environment

#### Prerequisites

- Node.js 20+ (use nvm for version management)
- npm 10+
- Git
- Code editor (VS Code recommended)
- Supabase account

#### Initial Setup

```bash
# Clone repository
git clone <repo-url>
cd SQ-Launchpad/SQ-launchpad-new

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your Supabase credentials

# Run database migrations (via Supabase Dashboard)
# Or use setup script:
./setup_site_workflow.sh

# Start development server
npm run dev
```

Server will start on: `http://localhost:8085`

---

### Development Workflow

#### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes
# ... edit files ...

# Test locally
npm run dev

# Lint code
npm run lint

# Build to check for errors
npm run build

# Commit changes
git add .
git commit -m "feat: your feature description"

# Push to repository
git push origin feature/your-feature-name
```

#### 2. Component Development

**Structure**:
```
src/components/
├── YourComponent.tsx      # Component logic
└── ui/                    # shadcn components
    └── your-ui.tsx        # UI primitives
```

**Example Component**:
```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface YourComponentProps {
  title: string;
  onAction: () => void;
}

export const YourComponent: React.FC<YourComponentProps> = ({ 
  title, 
  onAction 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={onAction}>Action</Button>
      </CardContent>
    </Card>
  );
};
```

#### 3. Service Development

**Structure**:
```
src/services/
└── yourService.ts         # Service implementation
```

**Example Service**:
```typescript
import { supabase } from '@/integrations/supabase/client';

export const yourService = {
  async getData(): Promise<YourData[]> {
    const { data, error } = await supabase
      .from('your_table')
      .select('*');
    
    if (error) throw error;
    return data;
  },
  
  async createData(payload: YourData): Promise<void> {
    const { error } = await supabase
      .from('your_table')
      .insert(payload);
    
    if (error) throw error;
  }
};
```

#### 4. Type Development

**Structure**:
```
src/types/
└── yourTypes.ts           # Type definitions
```

**Example Types**:
```typescript
export interface YourData {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export type YourStatus = 'active' | 'inactive' | 'pending';
```

---

### Code Style Guide

#### TypeScript

- Use TypeScript strict mode
- Define interfaces for all data structures
- Use type inference where possible
- Avoid `any` type

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  role: UserRole;
}

const getUser = (id: string): Promise<User> => {
  // ...
};

// ❌ Bad
const getUser = (id: any): Promise<any> => {
  // ...
};
```

#### React Components

- Use functional components with hooks
- Use TypeScript props interfaces
- Extract complex logic to custom hooks
- Use meaningful component names

```typescript
// ✅ Good
interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  // ...
};

// ❌ Bad
export const Component = (props: any) => {
  // ...
};
```

#### File Naming

- Components: `PascalCase.tsx` (e.g., `UserCard.tsx`)
- Services: `camelCase.ts` (e.g., `userService.ts`)
- Types: `camelCase.ts` (e.g., `userTypes.ts`)
- Hooks: `camelCase.tsx` (e.g., `useAuth.tsx`)
- Utils: `camelCase.ts` (e.g., `dateUtils.ts`)

#### Import Order

```typescript
// 1. React and libraries
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Components
import { Card } from '@/components/ui/card';
import { Header } from '@/components/Header';

// 3. Services and hooks
import { userService } from '@/services/userService';
import { useAuth } from '@/hooks/useAuth';

// 4. Types
import type { User } from '@/types/userTypes';

// 5. Utils and config
import { formatDate } from '@/lib/dateUtils';
```

---

### Database Development

#### Creating Migrations

```sql
-- File: supabase/migrations/YYYYMMDDHHMMSS-description.sql

-- Create table
CREATE TABLE IF NOT EXISTS public.your_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_your_table_name ON public.your_table(name);
CREATE INDEX idx_your_table_status ON public.your_table(status);

-- Enable RLS
ALTER TABLE public.your_table ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view active records"
ON public.your_table FOR SELECT
USING (status = 'active');

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.your_table
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

#### Running Migrations

**Via Supabase Dashboard**:
1. Go to SQL Editor
2. Paste migration SQL
3. Run

**Via Supabase CLI**:
```bash
supabase db push
```

#### Querying Data

```typescript
// Select
const { data, error } = await supabase
  .from('your_table')
  .select('*')
  .eq('status', 'active')
  .order('created_at', { ascending: false });

// Insert
const { error } = await supabase
  .from('your_table')
  .insert({ name: 'Test', status: 'active' });

// Update
const { error } = await supabase
  .from('your_table')
  .update({ status: 'inactive' })
  .eq('id', userId);

// Delete
const { error } = await supabase
  .from('your_table')
  .delete()
  .eq('id', userId);

// Complex query with joins
const { data, error } = await supabase
  .from('sites')
  .select(`
    *,
    organization:organizations(name, sector),
    study:site_study_data(counter_count, conducted_at)
  `)
  .eq('status', 'active');
```

---

### Testing

#### Manual Testing

```bash
# Start dev server
npm run dev

# Test in browser
open http://localhost:8085

# Check browser console for errors
# Test user flows manually
```

#### Linting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

#### Build Testing

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

---

### Debugging

#### Browser DevTools

- **Console**: Check for JavaScript errors
- **Network**: Inspect API calls
- **Application**: Check localStorage, cookies
- **React DevTools**: Inspect component tree

#### Supabase Debugging

- Check **Logs** in Supabase Dashboard
- Use **SQL Editor** to query data directly
- Check **Auth** logs for authentication issues
- Verify **RLS Policies** in Table Editor

#### Common Issues

**Issue**: Page shows 404  
**Solution**: Check route configuration in `App.tsx`

**Issue**: Data not loading  
**Solution**: Check Supabase RLS policies, verify user permissions

**Issue**: Build errors  
**Solution**: Run `npm run build` to see TypeScript errors

**Issue**: Slow performance  
**Solution**: Check bundle analysis with `npm run build:analyze`

---

## 🌐 API Services

### Service Architecture

All data operations go through service files in `src/services/`. This provides:

- Centralized API logic
- Reusable functions
- Consistent error handling
- Easy testing and mocking

### Key Services

#### 1. sitesService.ts

**Purpose**: Manage site CRUD operations

**Functions**:
```typescript
getSites(): Promise<Site[]>
getSiteById(id: string): Promise<Site>
createSite(site: SiteInput): Promise<Site>
updateSite(id: string, updates: Partial<Site>): Promise<Site>
deleteSite(id: string): Promise<void>
getSitesByUser(userId: string): Promise<Site[]>
```

---

#### 2. siteWorkflowService.ts

**Purpose**: Orchestrate complete site workflow

**Functions**:
```typescript
getSiteWorkflowData(siteId: string): Promise<SiteWorkflowData>
getCreationData(siteId: string): Promise<SiteCreationData>
getStudyData(siteId: string): Promise<SiteStudyData>
getScopingData(siteId: string): Promise<SiteScopingData>
updateStepData(siteId: string, stepKey: string, data: any): Promise<void>
```

---

#### 3. approvalWorkflowService.ts

**Purpose**: Manage approval workflows

**Functions**:
```typescript
getPendingApprovals(userId: string): Promise<Approval[]>
createApprovalRequest(request: ApprovalRequest): Promise<Approval>
approveRequest(approvalId: string, comments: string): Promise<void>
rejectRequest(approvalId: string, reason: string): Promise<void>
requestChanges(approvalId: string, reason: string): Promise<void>
```

---

#### 4. scopingService.ts

**Purpose**: Manage hardware/software scoping

**Functions**:
```typescript
getSoftwareModules(): Promise<SoftwareModule[]>
getHardwareItems(): Promise<HardwareItem[]>
createScoping(siteId: string, scoping: ScopingInput): Promise<Scoping>
submitScoping(scopingId: string): Promise<void>
calculateCosts(scoping: ScopingInput): CostSummary
```

---

#### 5. inventoryService.ts

**Purpose**: Manage inventory and assets

**Functions**:
```typescript
getInventory(filters: InventoryFilters): Promise<Asset[]>
getAssetById(id: string): Promise<Asset>
createAsset(asset: AssetInput): Promise<Asset>
updateAssetStatus(id: string, status: AssetStatus): Promise<void>
getServiceDueAssets(): Promise<Asset[]>
```

---

#### 6. userService.ts

**Purpose**: Manage users and roles

**Functions**:
```typescript
getUsers(): Promise<User[]>
getUserById(id: string): Promise<User>
createUser(user: UserInput): Promise<User>
updateUserRole(id: string, role: UserRole): Promise<void>
deactivateUser(id: string): Promise<void>
```

---

#### 7. organisationsService.ts

**Purpose**: Manage organizations

**Functions**:
```typescript
getOrganizations(): Promise<Organization[]>
getOrganizationById(id: string): Promise<Organization>
createOrganization(org: OrganizationInput): Promise<Organization>
updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization>
deleteOrganization(id: string): Promise<void>
```

---

#### 8. notificationService.ts

**Purpose**: Manage notifications

**Functions**:
```typescript
getNotifications(userId: string): Promise<Notification[]>
getUnreadCount(userId: string): Promise<number>
markAsRead(notificationId: string): Promise<void>
createNotification(notification: NotificationInput): Promise<Notification>
```

---

#### 9. licenseService.ts

**Purpose**: Manage licenses

**Functions**:
```typescript
getLicenses(siteId?: string): Promise<License[]>
getExpiringLicenses(days: number): Promise<License[]>
createLicense(license: LicenseInput): Promise<License>
renewLicense(licenseId: string, newExpiryDate: Date): Promise<void>
```

---

### Error Handling

All services use consistent error handling:

```typescript
try {
  const { data, error } = await supabase
    .from('table')
    .select('*');
  
  if (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
  
  return data;
} catch (error) {
  console.error('Service error:', error);
  throw error;
}
```

---

## 🚀 Deployment

### Production Build

```bash
# Create production build
npm run build

# Output: dist/ directory
```

### Environment Configuration

**Production Environment Variables**:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_APP_ENV=production
```

### Deployment Options

#### Option 1: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

**Configuration**: `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

#### Option 2: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy

# Production deployment
netlify deploy --prod
```

**Configuration**: `netlify.toml`
```toml
[build]
  command = "npm run build"
  publish = "dist"
```

#### Option 3: Manual Hosting

```bash
# Build
npm run build

# Upload dist/ directory to your hosting provider
# - AWS S3 + CloudFront
# - Digital Ocean Spaces
# - Azure Static Web Apps
# - etc.
```

### Supabase Configuration

**Production Checklist**:
- ✅ Enable RLS on all tables
- ✅ Configure Auth providers
- ✅ Set up custom domain
- ✅ Configure CORS settings
- ✅ Set up email templates
- ✅ Configure storage policies
- ✅ Enable connection pooling
- ✅ Set up backups
- ✅ Configure rate limiting

### Post-Deployment

1. **Test Production**:
   - Test authentication
   - Test all user roles
   - Test critical workflows
   - Check error logging

2. **Monitor**:
   - Set up error tracking (Sentry, etc.)
   - Monitor Supabase logs
   - Track performance metrics
   - Monitor uptime

3. **Backup**:
   - Set up automated database backups
   - Export configuration
   - Document deployment process

---

## ⚡ Performance Optimizations

### Bundle Size Optimization

**Implemented**:
- ✅ Code splitting with dynamic imports
- ✅ Lazy loading for all pages
- ✅ Lazy loading for heavy components
- ✅ Tree shaking enabled
- ✅ Modern browser targeting

**Results**:
- Initial bundle: **88KB** (96% reduction)
- CSS: **90KB** (optimized)
- JavaScript: Loaded on-demand

### Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8085,
    host: true,
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['@radix-ui/react-*'],
          'data': ['@tanstack/react-query', '@supabase/supabase-js'],
        }
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### Chrome Optimizations

**File**: `src/utils/chromeOptimizations.ts`

**Features**:
- Chrome detection
- Extension conflict mitigation
- Memory usage monitoring
- Performance metrics tracking
- Error handling

**Usage**:
```typescript
import { initChromeOptimizations } from '@/utils/chromeOptimizations';

// Initialize on app start
initChromeOptimizations();
```

### Lazy Loading

**All pages are lazy loaded**:
```typescript
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const Sites = React.lazy(() => import('@/pages/Sites'));
// etc.
```

**Loading fallback**:
```typescript
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
  </Routes>
</Suspense>
```

### Performance Monitoring

**Core Web Vitals tracked**:
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)

**Memory monitoring**:
- Chrome memory usage
- Garbage collection suggestions
- Memory leak detection

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Authentication Issues

**Problem**: User can't log in  
**Possible Causes**:
- Incorrect Supabase credentials
- RLS policies blocking access
- Email not confirmed

**Solutions**:
```bash
# Check Supabase credentials in .env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# Check RLS policies in Supabase Dashboard
# Verify user exists in auth.users table
# Check if email is confirmed
```

---

#### 2. Data Not Loading

**Problem**: Pages show loading state indefinitely  
**Possible Causes**:
- RLS policy blocking query
- Network issue
- Service error

**Solutions**:
```typescript
// Check browser console for errors
// Check Network tab for failed requests
// Verify RLS policies allow read access

// Test query directly in Supabase SQL Editor
SELECT * FROM sites WHERE id = 'site-id';

// Add error handling to service
try {
  const { data, error } = await supabase.from('sites').select('*');
  if (error) {
    console.error('Query error:', error);
    throw error;
  }
} catch (error) {
  console.error('Service error:', error);
}
```

---

#### 3. Site Shows as Code/UUID

**Problem**: Site page shows UUID instead of name  
**Possible Cause**: Missing `organization_name` field

**Solution**:
```sql
-- Verify sites table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sites';

-- Update site if organization_name is missing
UPDATE sites 
SET organization_name = (
  SELECT name FROM organizations WHERE id = sites.organization_id
)
WHERE organization_name IS NULL;
```

---

#### 4. Workflow Step Missing Data

**Problem**: Workflow step shows no data  
**Possible Causes**:
- Data not created for step
- RLS blocking access
- Service error

**Solutions**:
```typescript
// Check if step data exists
const { data } = await supabase
  .from('site_scoping')
  .select('*')
  .eq('site_id', siteId);

console.log('Step data:', data);

// If no data, create default data
if (!data || data.length === 0) {
  await supabase
    .from('site_scoping')
    .insert({
      site_id: siteId,
      status: 'draft',
      selected_software: [],
      selected_hardware: []
    });
}
```

---

#### 5. Build Errors

**Problem**: `npm run build` fails  
**Possible Causes**:
- TypeScript errors
- Missing dependencies
- Import errors

**Solutions**:
```bash
# Check TypeScript errors
npm run build

# Fix import paths (use @ alias)
import { Component } from '@/components/Component';

# Install missing dependencies
npm install

# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

#### 6. Port Already in Use

**Problem**: Port 8085 already in use  
**Solution**:
```bash
# Find process using port
lsof -i :8085

# Kill process
kill -9 <PID>

# Or use different port
npm run dev -- --port 8086
```

---

#### 7. Slow Performance

**Problem**: Application loads slowly  
**Possible Causes**:
- Large bundle size
- Too many network requests
- Unoptimized images

**Solutions**:
```bash
# Analyze bundle
npm run build:analyze

# Check Network tab in DevTools
# - Reduce number of requests
# - Implement lazy loading
# - Optimize images

# Enable Chrome optimizations
# Already implemented in chromeOptimizations.ts
```

---

#### 8. Database Migration Errors

**Problem**: Migration fails to run  
**Solutions**:
```bash
# Check Supabase logs in Dashboard

# Run migrations one by one in SQL Editor

# Verify table doesn't already exist
SELECT * FROM information_schema.tables 
WHERE table_name = 'your_table';

# Use IF NOT EXISTS in migrations
CREATE TABLE IF NOT EXISTS ...
```

---

### Debug Mode

Enable detailed logging:

```typescript
// Add to main.tsx
if (import.meta.env.DEV) {
  console.log('Development mode');
  
  // Log all Supabase queries
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth event:', event, session);
  });
}
```

---

### Getting Help

**Resources**:
- [React Documentation](https://react.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [shadcn/ui Documentation](https://ui.shadcn.com)

**Support**:
- Check existing documentation
- Review code comments
- Check browser console
- Check Supabase logs
- Review database schema

---

## 📋 Best Practices

### Code Quality

1. **TypeScript Strict Mode**: Always use strict type checking
2. **Component Composition**: Break down large components
3. **Custom Hooks**: Extract reusable logic
4. **Error Boundaries**: Wrap components with error handling
5. **Lazy Loading**: Use for routes and heavy components

### Database

1. **RLS Policies**: Always enable on production tables
2. **Indexes**: Add indexes for frequently queried columns
3. **Migrations**: Use version-controlled migrations
4. **Backups**: Regular automated backups
5. **Soft Deletes**: Consider soft deletes for important data

### Security

1. **Environment Variables**: Never commit `.env` files
2. **API Keys**: Use Supabase anon key only (RLS protects data)
3. **Input Validation**: Validate all user inputs
4. **XSS Prevention**: Sanitize user-generated content
5. **CORS**: Configure properly in Supabase

### Performance

1. **Code Splitting**: Split by route and feature
2. **Lazy Loading**: Load components on demand
3. **Memoization**: Use `useMemo` and `useCallback` wisely
4. **Debouncing**: Debounce search inputs
5. **Pagination**: Paginate large lists

### User Experience

1. **Loading States**: Show loading indicators
2. **Error Messages**: Provide clear error messages
3. **Toast Notifications**: Use for success/error feedback
4. **Form Validation**: Real-time validation with clear messages
5. **Responsive Design**: Test on multiple screen sizes

---

## 📊 Project Statistics

### Codebase

- **Total Files**: 300+
- **Lines of Code**: ~50,000+
- **Components**: 80+
- **Pages**: 23
- **Services**: 19
- **Database Tables**: 17+
- **Database Migrations**: 135+

### Technology

- **React Version**: 18.3.1
- **TypeScript Version**: 5.5.3
- **Node Version**: 20 LTS
- **Build Tool**: Vite 5.4.1
- **UI Library**: shadcn/ui (Radix UI)
- **CSS Framework**: Tailwind CSS 3.4.11

### Performance

- **Initial Bundle**: 88KB (optimized)
- **First Paint**: < 1s
- **Time to Interactive**: < 2s
- **Build Time**: ~30s
- **Dev Server Start**: ~2s

---

## 🎓 Glossary

**Terms**:

- **Site**: A physical location being onboarded
- **Organization**: Client company (e.g., ASDA, Tesco)
- **Food Court (Unit)**: Operational unit within an organization
- **Ops Manager**: Operational manager who approves requests
- **Deployment Engineer**: Engineer who conducts site studies and deployments
- **Scoping**: Process of selecting software and hardware
- **Procurement**: Process of ordering and tracking hardware
- **Asset**: Individual hardware item with unique identifier
- **RLS**: Row Level Security (Supabase database security)
- **Workflow**: Step-by-step process from site creation to go-live

**Acronyms**:

- **POS**: Point of Sale
- **KDS**: Kitchen Display System
- **KMS**: Kitchen Management System
- **RLS**: Row Level Security
- **CRUD**: Create, Read, Update, Delete
- **UI**: User Interface
- **UX**: User Experience
- **API**: Application Programming Interface
- **JWT**: JSON Web Token (used by Supabase Auth)

---

## 📝 Changelog

### Version 1.0.0 (Current)

**Features**:
- ✅ Complete site workflow system (7 steps)
- ✅ Role-based access control (4 roles)
- ✅ Hardware and software management
- ✅ Approval workflows
- ✅ Procurement tracking
- ✅ Asset management with service cycles
- ✅ Inventory management with filtering
- ✅ License management
- ✅ Forecasting and pipeline visibility
- ✅ Notifications system
- ✅ Audit logging
- ✅ Data export (JSON, Excel)
- ✅ Performance optimizations
- ✅ Chrome-specific optimizations

**Technical**:
- ✅ 135+ database migrations
- ✅ Comprehensive RLS policies
- ✅ 23 pages
- ✅ 19 services
- ✅ 80+ components
- ✅ TypeScript throughout
- ✅ Lazy loading for all routes
- ✅ Bundle size: 88KB initial load

---

## 🙏 Acknowledgments

**Built With**:
- React Team for React framework
- Supabase Team for backend platform
- shadcn for UI component library
- Radix UI for accessible primitives
- Tailwind Labs for CSS framework
- Vercel for Vite build tool

---

## 📄 License

This project is proprietary to **SmartQ**.

All rights reserved. Unauthorized copying, distribution, or use of this software is strictly prohibited.

---

## 📞 Support & Contact

For support, questions, or feature requests:

- **Documentation**: Review this document and related docs in `docs/`
- **Code Issues**: Check browser console and Supabase logs
- **Database Issues**: Review RLS policies and table structure
- **Performance Issues**: Run bundle analysis and check Chrome DevTools

---

**End of Documentation**

*This comprehensive documentation covers all aspects of the SmartQ LaunchPad project. For specific technical details, refer to inline code comments and related documentation files.*

