# SmartQ Launchpad - Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Core Features](#core-features)
5. [Database Schema](#database-schema)
6. [API Integration](#api-integration)
7. [File Structure](#file-structure)
8. [Development Setup](#development-setup)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**SmartQ Launchpad** is a comprehensive cafeteria management system designed for Compass Group UK. The application streamlines the entire process from site study to deployment, enabling efficient management of cafeteria operations across multiple locations.

### Key Objectives
- **Site Study Management** - Comprehensive site assessment and planning
- **Hardware Deployment** - Inventory tracking and deployment coordination
- **User Role Management** - Multi-level access control
- **Geolocation Integration** - Location-based site management
- **Real-time Monitoring** - Live status tracking and reporting

---

## 🏗️ Architecture & Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Component library
- **React Router** - Client-side routing
- **React Query** - Server state management

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Primary database
- **Row Level Security (RLS)** - Data access control
- **Real-time subscriptions** - Live updates

### Authentication & Authorization
- **Supabase Auth** - User authentication
- **Role-based access control** - Multi-level permissions
- **JWT tokens** - Secure session management

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control
- **npm** - Package management

---

## 👥 User Roles & Permissions

### 1. Admin
**Description**: Full system access with user management capabilities

**Permissions**:
- Create and manage sites
- Assign users to roles
- Manage approval workflows
- Export data and reports
- View all system data
- Hardware scoping and management

**Accessible Pages**:
- `/dashboard` - Main dashboard
- `/admin` - User and site management
- `/site-study` - Site study management
- `/hardware-scoping` - Hardware planning
- `/control-desk` - System control center
- `/forecast` - Project forecasting
- `/inventory` - Inventory management
- `/license-management` - License tracking
- `/site-creation` - Site creation form

### 2. Ops Manager
**Description**: Approve hardware requests and manage site operations

**Permissions**:
- Approve hardware requests
- View assigned sites
- Manage approvals
- Update site status
- Create sites
- Conduct site studies

**Accessible Pages**:
- `/dashboard` - Main dashboard
- `/ops-manager` - Operations management
- `/inventory` - Inventory management
- `/site-study` - Site study management
- `/site-creation` - Site creation form

### 3. Deployment Engineer
**Description**: Conduct site studies and manage deployments

**Permissions**:
- Conduct site studies
- Upload findings
- Update site status
- View assigned sites
- Add site geolocation
- Define hardware requirements
- Create sites

**Accessible Pages**:
- `/dashboard` - Main dashboard
- `/deployment` - Deployment management
- `/site-study` - Site study management
- `/site-creation` - Site creation form

---

## 🚀 Core Features

### 1. Site Study Management
**Location**: `/site-study`

**Features**:
- **7-Step Comprehensive Form**:
  1. Basic Information (Site name, organization, unit code)
  2. Location & Address (Address, GPS coordinates, delivery info)
  3. Contact Information (Manager details, secondary contacts)
  4. Staff & Capacity Planning (Employee strength, footfall, operating hours)
  5. IT & Power Infrastructure (LAN points, WiFi, UPS power)
  6. Hardware Deployment Needs (POS terminals, printers, displays)
  7. Readiness & Risks (Deployment readiness, blockers, dependencies)

- **Geolocation Integration**:
  - GPS coordinate capture
  - LocationIQ integration through Supabase Edge Functions
  - OpenStreetMap integration
  - Location accuracy tracking

- **Report Generation**:
  - Detailed study reports
  - PDF export functionality
  - Comprehensive data visualization

### 2. Site Creation
**Location**: `/site-creation`

**Features**:
- Multi-step site creation form
- Organization and stakeholder management
- Risk assessment and priority setting
- Food court and capacity planning
- Integration with site study workflow

### 3. Inventory Management
**Location**: `/inventory`

**Features**:
- Hardware tracking and management
- Deployment workflow coordination
- Asset tag management
- Melford order status tracking
- Installer assignment
- Timeline management

### 4. License Management
**Location**: `/license-management`

**Features**:
- License tracking across hierarchy
- Type-based license management
- Status monitoring
- Renewal tracking
- Export capabilities

### 5. Hardware Scoping
**Location**: `/hardware-scoping`

**Features**:
- Hardware requirement planning
- Quantity per counter management
- Serial number tracking
- Asset tag assignment
- Deployment timeline planning

---

## 🗄️ Database Schema

### Core Tables

#### 1. `profiles`
```sql
- user_id (UUID, Primary Key)
- full_name (TEXT)
- email (TEXT)
- role (app_role enum)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 2. `sites`
```sql
- id (UUID, Primary Key)
- name (TEXT)
- food_court_unit (TEXT)
- city (TEXT)
- address (TEXT)
- postcode (TEXT)
- cafeteria_type (cafeteria_type enum)
- capacity (INTEGER)
- expected_footfall (INTEGER)
- description (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 3. `site_assignments`
```sql
- id (UUID, Primary Key)
- site_id (UUID, Foreign Key)
- ops_manager_id (UUID, Foreign Key)
- deployment_engineer_id (UUID, Foreign Key)
- assigned_at (TIMESTAMP)
- status (assignment_status enum)
```

#### 4. `site_studies`
```sql
- id (UUID, Primary Key)
- site_id (UUID, Foreign Key)
- conducted_by (UUID, Foreign Key)
- study_date (DATE)
- status (study_status enum)
- findings (JSONB)
- geolocation (JSONB)
- created_at (TIMESTAMP)
```

#### 5. `site_status_tracking`
```sql
- id (UUID, Primary Key)
- site_id (UUID, Foreign Key)
- study_status (VARCHAR)
- cost_approval_status (VARCHAR)
- inventory_status (VARCHAR)
- products_status (VARCHAR)
- deployment_status (VARCHAR)
- overall_status (site_status enum)
- updated_at (TIMESTAMP)
- updated_by (UUID, Foreign Key)
```

### Enums

#### `app_role`
```sql
- admin
- ops_manager
- deployment_engineer
```

#### `cafeteria_type`
```sql
- staff
- visitor
- mixed
```

#### `assignment_status`
```sql
- pending
- active
- completed
- cancelled
```

#### `study_status`
```sql
- pending
- in_progress
- completed
- cancelled
```

#### `site_status`
```sql
- new
- in_progress
- active
- deployed
```

---

## 🔌 API Integration

### Supabase Client Configuration
```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### Key API Operations

#### Authentication
```typescript
// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Sign out
await supabase.auth.signOut()

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

#### Site Management
```typescript
// Create site
const { data, error } = await supabase
  .from('sites')
  .insert([{
    name: 'Site Name',
    food_court_unit: 'Unit Code',
    city: 'City',
    address: 'Address',
    postcode: 'Postcode'
  }])

// Get sites
const { data, error } = await supabase
  .from('sites')
  .select('*')
```

#### Site Studies
```typescript
// Create site study
const { data, error } = await supabase
  .from('site_studies')
  .insert([{
    site_id: 'site-uuid',
    conducted_by: 'user-uuid',
    study_date: '2025-01-01',
    status: 'completed',
    findings: { /* study data */ },
    geolocation: { lat: 51.5074, lng: -0.1278 }
  }])
```

---

## 📁 File Structure

```
sq-launchpad-cg/
├── src/
│   ├── components/
│   │   ├── ui/                    # Shadcn/ui components
│   │   ├── Header.tsx            # Main navigation
│   │   ├── AuthGuard.tsx         # Authentication wrapper
│   │   ├── RoleBasedRoute.tsx    # Role-based access control
│   │   ├── SiteCreation.tsx  # Site creation page
│   │   └── inventory/            # Inventory components
│   ├── pages/
│   │   ├── Index.tsx             # Dashboard
│   │   ├── Auth.tsx              # Authentication
│   │   ├── Admin.tsx             # Admin panel
│   │   ├── SiteStudy.tsx         # Site study management
│   │   ├── Inventory.tsx         # Inventory management
│   │   ├── LicenseManagement.tsx # License management
│   │   ├── HardwareScoping.tsx   # Hardware planning
│   │   ├── HardwareApprovals.tsx # Hardware approvals
│   │   ├── HardwareMaster.tsx # Hardware master inventory
│   │   ├── Forecast.tsx          # Project forecasting
│   │   ├── OpsManager.tsx        # Operations management
│   │   ├── Deployment.tsx        # Deployment management
│   │   ├── Site.tsx              # Site management
│   │   ├── Integrations.tsx      # Control desk
│   │   ├── Landing.tsx           # Landing page
│   │   └── NotFound.tsx          # 404 page
│   ├── hooks/
│   │   ├── useAuth.tsx           # Authentication hook
│   │   └── use-mobile.tsx        # Mobile detection
│   ├── lib/
│   │   ├── roles.ts              # Role definitions
│   │   ├── siteTypes.ts          # Site type definitions
│   │   └── utils.ts              # Utility functions
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts         # Supabase client
│   │       └── types.ts          # Database types
│   ├── services/
│   │   └── inventoryService.ts   # Inventory API service
│   ├── types/
│   │   └── inventory.ts          # Inventory type definitions
│   ├── assets/                   # Static assets
│   ├── App.tsx                   # Main app component
│   ├── main.tsx                  # App entry point
│   └── index.css                 # Global styles
├── supabase/
│   ├── config.toml               # Supabase configuration
│   └── migrations/               # Database migrations
├── public/                       # Public assets
├── package.json                  # Dependencies
├── vite.config.ts               # Vite configuration
├── tailwind.config.ts           # Tailwind configuration
└── tsconfig.json                # TypeScript configuration
```

---

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/shivanshusqlens/sq-launchpad-cg.git
cd sq-launchpad-cg
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
# Create .env.local file
cp .env.example .env.local

# Add your Supabase credentials
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Start development server**
```bash
npm run dev
```

5. **Open in browser**
```
http://localhost:5173
```

### Database Setup

1. **Create Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Get project URL and anon key

2. **Run migrations**
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

3. **Seed data (optional)**
```bash
supabase db reset
```

---

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
```bash
npm install -g vercel
vercel login
```

2. **Deploy**
```bash
vercel --prod
```

3. **Environment variables**
   - Add Supabase credentials in Vercel dashboard
   - Set production environment variables

### Supabase Production

1. **Database migrations**
```bash
supabase db push --project-ref your-production-ref
```

2. **Row Level Security**
   - Ensure RLS policies are enabled
   - Test permissions thoroughly

3. **Backup strategy**
   - Enable automatic backups
   - Set up monitoring

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Blank Pages
**Cause**: Role-based routing issues
**Solution**: 
- Check user role assignment
- Verify accessible pages in `roles.ts`
- Check browser console for errors

#### 2. Authentication Issues
**Cause**: Supabase configuration problems
**Solution**:
- Verify environment variables
- Check Supabase project settings
- Ensure RLS policies are correct

#### 3. Database Connection Errors
**Cause**: Supabase client configuration
**Solution**:
- Verify Supabase URL and key
- Check network connectivity
- Ensure database is accessible

#### 4. Build Errors
**Cause**: TypeScript or dependency issues
**Solution**:
```bash
# Clear cache
npm run clean

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript
npm run type-check
```

### Debug Mode

Enable debug logging:
```typescript
// In RoleBasedRoute.tsx
console.log('RoleBasedRoute Debug:', {
  currentRole,
  pathname: location.pathname,
  canAccess: canAccessPage(currentRole, location.pathname)
});
```

### Performance Monitoring

1. **Bundle analysis**
```bash
npm run build
npm run analyze
```

2. **Lighthouse audit**
```bash
npm run lighthouse
```

---

## 📈 Future Enhancements

### Planned Features
1. **Real-time notifications** - WebSocket integration
2. **Advanced reporting** - Custom report builder
3. **Mobile app** - React Native implementation
4. **API documentation** - Swagger/OpenAPI
5. **Automated testing** - Jest and Cypress
6. **CI/CD pipeline** - GitHub Actions
7. **Performance optimization** - Code splitting
8. **Accessibility improvements** - WCAG compliance

### Technical Debt
1. **Component optimization** - React.memo usage
2. **State management** - Consider Zustand/Redux
3. **Error boundaries** - Better error handling
4. **Loading states** - Skeleton components
5. **Form validation** - Zod schema validation

---

## 📞 Support

### Development Team
- **Lead Developer**: [Your Name]
- **Project Manager**: [PM Name]
- **QA Engineer**: [QA Name]

### Contact Information
- **Email**: support@smartq-launchpad.com
- **GitHub**: [Repository Issues](https://github.com/shivanshusqlens/sq-launchpad-cg/issues)
- **Documentation**: [Wiki](https://github.com/shivanshusqlens/sq-launchpad-cg/wiki)

### Resources
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/ui](https://ui.shadcn.com/)

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: Production Ready 