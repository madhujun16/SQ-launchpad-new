# SmartQ Launchpad - Product Requirements Document (PRD)

## 📋 Executive Summary

SmartQ Launchpad is a comprehensive B2B cafeteria management platform designed for Compass Group UK. The application streamlines the end-to-end process of deploying SmartQ digital ordering solutions across cafeteria locations, from initial site studies to final deployment and ongoing inventory management.

## 🎯 Product Vision

To provide a unified platform that enables efficient management of SmartQ deployments across Compass Group's cafeteria network, ensuring seamless coordination between site studies, hardware procurement, approvals, and deployment processes.

## 👥 Target Users

### Primary Users
- **Admin Users**: System administrators with full access to manage users, sites, and system configurations
- **Ops Managers**: Operations managers responsible for approving hardware requests and managing site deployments
- **Deployment Engineers**: Field engineers who conduct site studies and manage deployment processes

### Secondary Users
- **Site Managers**: Local cafeteria managers who need visibility into deployment status
- **IT Support**: Technical support teams requiring system access for troubleshooting

## 🔐 Authentication & Authorization

### Authentication Flow
1. **Email-based OTP Authentication**
   - Users enter their email address
   - System sends one-time password (OTP) to registered email
   - Users verify OTP to gain access
   - Session management with automatic logout

### Role-Based Access Control (RBAC)
- **Admin Role**: Full system access, user management, site management
- **Ops Manager Role**: Hardware approvals, site management, inventory access
- **Deployment Engineer Role**: Site studies, deployment management, hardware scoping

## 🏗️ Application Architecture & Flow

### Core Application Flow

```
Landing Page → Authentication → Dashboard → Role-Based Navigation → Feature Pages
```

### Main Navigation Structure

#### 1. **Dashboard** (`/dashboard`)
- **Purpose**: Central hub showing role-specific overview and quick actions
- **Access**: All authenticated users
- **Key Features**:
  - Role-specific metrics and KPIs
  - Recent activities and notifications
  - Quick action buttons for common tasks
  - Performance overview with completion rates and deployment times

#### 2. **Sites Management**
   - **Create Site** (`/site-creation`)
   - **Site Management** (`/site`)
   - **Completed Sites** (`/completed-sites`)
   - **Forecast** (`/forecast`) - Timeline view

#### 3. **Site Study** (`/site-study`)
   - **Start New Study**
   - **Completed Studies**
   - **View/Edit Studies**
   - **Export Site Study (PDF)**

#### 4. **Hardware Management**
   - **Scope Hardware** (`/hardware-scoping`)
   - **Approvals** (`/hardware-approvals`)
   - **Hardware Master List** (`/hardware-master`)
   - **Vendor Dispatch Status**

#### 5. **Inventory** (`/inventory`)
   - **View All Inventory**
   - **Filter by Site/Type**
   - **Add Asset**
   - **License & Warranty Tracker**

#### 6. **Role-Specific Pages**
   - **Admin** (`/admin`)
   - **Ops Manager** (`/ops-manager`)
   - **Deployment** (`/deployment`)

## 📄 Detailed Page Functionality

### 1. **Landing Page** (`/`)
**Purpose**: Marketing and introduction page
**Functionality**:
- Product overview and value proposition
- Call-to-action for authentication
- Feature highlights and benefits
- Contact information and support details

### 2. **Authentication Page** (`/auth`)
**Purpose**: Secure user authentication
**Functionality**:
- Email input and validation
- OTP generation and delivery
- OTP verification with 6-digit code
- Resend OTP functionality (60-second cooldown)
- Error handling for invalid emails/OTPs
- Session management and redirect to dashboard

### 3. **Dashboard** (`/dashboard`)
**Purpose**: Central overview and quick actions
**Functionality**:
- **Key Metrics Display**:
  - Total Cafeterias count
  - Active Deployments
  - In Progress items
  - Pending Approvals
- **Performance Overview**:
  - Completion Rate with progress bars
  - Average Deployment Time
  - Customer Satisfaction ratings
- **Recent Activities Tab**:
  - Site study updates
  - Hardware approval status
  - Deployment progress
- **Notifications Tab**:
  - System alerts and updates
  - Approval requests
  - Status change notifications
- **Quick Actions Tab**:
  - Role-specific action buttons
  - Direct navigation to common tasks

### 4. **Site Study** (`/site-study`)
**Purpose**: Comprehensive site analysis and documentation
**Functionality**:
- **Study Management**:
  - Create new site studies
  - View existing studies with filters
  - Edit study details and findings
  - Export studies to PDF format
- **Geolocation Capture**:
  - GPS location capture for site mapping
  - Address validation and verification
  - Integration with mapping services
- **Detailed Information Collection**:
  - Site general information (sector, food court name, manager details)
  - Technical specifications (WiFi, power, network requirements)
  - Hardware requirements assessment
  - Infrastructure analysis
- **Status Tracking**:
  - Study completion status
  - Progress tracking with timelines
  - Assignment to deployment engineers
- **Reporting**:
  - Comprehensive study reports
  - Cost analysis and recommendations
  - Technical specifications documentation

### 5. **Site Creation** (`/site-creation`)
**Purpose**: Create and configure new cafeteria sites
**Functionality**:
- **Site Information Entry**:
  - Site name and location details
  - Food court unit information
  - Cafeteria type (staff/visitor/mixed)
  - Capacity and expected footfall
- **Assignment Management**:
  - Assign Ops Managers
  - Assign Deployment Engineers
  - Set site priorities and timelines
- **Configuration**:
  - Site-specific settings
  - Integration requirements
  - Custom field definitions

### 6. **Hardware Scoping** (`/hardware-scoping`)
**Purpose**: Define and manage hardware requirements for sites
**Functionality**:
- **Hardware Requirements Definition**:
  - Add hardware items with quantities
  - Categorize by type (monitors, printers, kiosks, etc.)
  - Set delivery and installation timelines
  - Add notes and specifications
- **Cost Analysis**:
  - Hardware cost calculations
  - Licensing costs (app fees, control desk, kiosk licenses)
  - Support costs (deployment, menu setup, surveys)
  - Total CAPEX and OPEX calculations
- **Approval Workflow**:
  - Submit for Ops Manager approval
  - Track approval status
  - Handle rejections with feedback
- **Vendor Management**:
  - Track delivery status
  - Monitor dispatch timelines
  - Manage installation schedules

### 7. **Hardware Approvals** (`/hardware-approvals`)
**Purpose**: Manage hardware request approvals
**Functionality**:
- **Approval Queue Management**:
  - View pending approval requests
  - Filter by site, engineer, or status
  - Sort by priority or submission date
- **Review Process**:
  - Detailed hardware scope review
  - Cost analysis validation
  - Technical specification verification
- **Approval Actions**:
  - Approve with comments
  - Reject with feedback
  - Request modifications
- **Status Tracking**:
  - Approval history
  - Timeline tracking
  - Notification system

### 8. **Hardware Master** (`/hardware-master`)
**Purpose**: Centralized hardware catalog and management
**Functionality**:
- **Hardware Catalog**:
  - Complete hardware item database
  - Specifications and compatibility
  - Pricing and availability
- **Inventory Management**:
  - Stock level tracking
  - Reorder points and alerts
  - Supplier information
- **Configuration Templates**:
  - Pre-defined hardware sets
  - Site-specific configurations
  - Standard deployment packages

### 9. **Inventory Management** (`/inventory`)
**Purpose**: Comprehensive asset tracking and management
**Functionality**:
- **Asset Tracking**:
  - Real-time inventory visibility
  - Asset lifecycle management
  - Location and status tracking
- **Advanced Filtering**:
  - Filter by site, type, status, group
  - Search functionality
  - Custom filter combinations
- **Asset Operations**:
  - Add new assets
  - Edit asset details
  - Deploy assets to sites
  - Maintenance scheduling
- **Reporting and Analytics**:
  - Inventory summary dashboards
  - Usage analytics
  - Cost analysis
  - Performance metrics
- **License Management**:
  - Software license tracking
  - Warranty management
  - Renewal notifications

### 10. **Admin Panel** (`/admin`)
**Purpose**: System administration and user management
**Functionality**:
- **User Management**:
  - Create new users
  - Assign roles and permissions
  - Manage user access
  - User activity monitoring
- **Site Management**:
  - Create and edit sites
  - Assign site managers
  - Configure site settings
  - Site status monitoring
- **System Configuration**:
  - Global settings management
  - Email template configuration
  - System logs and monitoring
- **Data Management**:
  - Export functionality
  - Backup and restore
  - Data integrity checks

### 11. **Ops Manager** (`/ops-manager`)
**Purpose**: Operations oversight and approval management
**Functionality**:
- **Approval Management**:
  - Hardware request approvals
  - Cost approval workflows
  - Site deployment approvals
- **Project Oversight**:
  - Active project monitoring
  - Progress tracking
  - Resource allocation
- **Performance Monitoring**:
  - Site performance metrics
  - Deployment success rates
  - Customer satisfaction tracking

### 12. **Deployment** (`/deployment`)
**Purpose**: Deployment engineering and field operations
**Functionality**:
- **Deployment Management**:
  - Assigned site deployments
  - Installation progress tracking
  - Technical issue resolution
- **Field Operations**:
  - Site visit scheduling
  - Installation checklists
  - Status reporting
- **System Monitoring**:
  - Deployment health monitoring
  - Performance metrics
  - Alert management

### 13. **Forecast** (`/forecast`)
**Purpose**: Pipeline and capacity planning
**Functionality**:
- **Pipeline Management**:
  - Upcoming client projects
  - Resource capacity planning
  - Timeline projections
- **Analytics**:
  - Trend analysis
  - Capacity forecasting
  - Risk assessment

### 14. **License Management** (`/license-management`)
**Purpose**: Software license and warranty tracking
**Functionality**:
- **License Tracking**:
  - Software license inventory
  - Renewal date management
  - Usage compliance monitoring
- **Warranty Management**:
  - Hardware warranty tracking
  - Service contract management
  - Support entitlement tracking

## 🔄 Core Workflows

### 1. **Site Deployment Workflow**
```
Site Creation → Site Study → Hardware Scoping → Approval → Deployment → Inventory Tracking
```

### 2. **Hardware Approval Workflow**
```
Hardware Scoping → Submit for Approval → Ops Manager Review → Approval/Rejection → Procurement
```

### 3. **Inventory Management Workflow**
```
Asset Addition → Deployment Assignment → Status Tracking → Maintenance → Retirement
```

## 📊 Key Performance Indicators (KPIs)

### Operational KPIs
- **Completion Rate**: Target 90%, Current 85%
- **Average Deployment Time**: Target 10 days, Current 12 days
- **Customer Satisfaction**: Target 4.5/5.0, Current 4.8/5.0
- **Hardware Approval Time**: Average 2-3 business days
- **Site Study Completion**: Average 5.2 days

### Business KPIs
- **Total Cafeterias**: 24 active sites
- **Active Deployments**: 18 ongoing projects
- **Pending Approvals**: 2 requiring attention
- **Inventory Utilization**: Real-time tracking

## 🔧 Technical Requirements

### Frontend
- **Framework**: React 18+ with TypeScript
- **UI Library**: shadcn/ui components
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation

### Backend Integration
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with OTP
- **Real-time**: Supabase real-time subscriptions
- **File Storage**: Supabase Storage

### Performance Requirements
- **Load Time**: < 3 seconds for initial page load
- **Responsiveness**: Mobile-first design
- **Availability**: 99.9% uptime
- **Security**: Role-based access control

## 🚀 Future Enhancements

### Phase 2 Features
- **Mobile App**: Native mobile application for field engineers
- **Advanced Analytics**: Predictive analytics and AI-powered insights
- **Integration APIs**: Third-party system integrations
- **Advanced Reporting**: Custom report builder
- **Workflow Automation**: Automated approval workflows

### Phase 3 Features
- **AI-Powered Recommendations**: Smart hardware recommendations
- **Predictive Maintenance**: IoT integration for proactive maintenance
- **Advanced Scheduling**: Intelligent resource scheduling
- **Multi-tenant Support**: Support for multiple organizations

## 📝 Success Metrics

### User Adoption
- 90% of target users actively using the platform
- 80% reduction in manual processes
- 50% faster deployment times

### Business Impact
- 30% reduction in hardware procurement time
- 25% improvement in deployment success rate
- 40% reduction in approval cycle time

### Technical Performance
- 99.9% system availability
- < 3 second page load times
- Zero critical security incidents

---

*This PRD serves as the comprehensive guide for the SmartQ Launchpad application development and maintenance.* 