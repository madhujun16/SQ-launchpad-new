# SQ Launchpad CG - Site Map

## 🌐 Application Overview
**SQ Launchpad CG** is a comprehensive site management and hardware deployment platform for SmartQ Technologies, designed to streamline site creation, hardware scoping, approvals, and inventory management.

---

## 👥 User Roles & Access Control

### 🔴 **Admin**
- **Description**: Full system access with site creation, user management, and approval workflows
- **Permissions**: Create sites, assign users, manage approvals, export data, view all sites
- **Color**: Red (`text-red-600`)

### 🔵 **Ops Manager** 
- **Description**: Approve hardware requests for assigned sites, create sites, conduct site studies
- **Permissions**: Approve hardware requests, view assigned sites, manage approvals, conduct site studies
- **Color**: Blue (`text-blue-600`)

### 🟢 **Deployment Engineer**
- **Description**: Conduct site studies, upload findings, define hardware requirements
- **Permissions**: Conduct site studies, upload findings, update site status, view assigned sites
- **Color**: Green (`text-green-600`)

---

## 🗺️ Site Structure

### 📄 **Public Pages**
```
/ (Landing Page)
├── Hero Section
├── Features Overview
├── About SmartQ
└── Contact Information
```

### 🔐 **Authentication**
```
/auth
├── Login Form
├── Role Selection
└── Password Reset
```

### 🏠 **Main Dashboard** (`/dashboard`)
```
Role-Based Dashboard Views:
├── Admin Dashboard
│   ├── System Overview
│   ├── User Management
│   ├── Site Statistics
│   └── Approval Workflows
├── Ops Manager Dashboard
│   ├── Assigned Sites
│   ├── Pending Approvals
│   └── Site Studies
└── Deployment Engineer Dashboard
    ├── Assigned Tasks
    ├── Site Studies
    └── Deployment Status
```

---

## 🏢 **Sites Module**

### 📍 **Site Creation** (`/site-creation`)
```
Site Creation Workflow:
├── Basic Information
│   ├── Site Name
│   ├── Food Court Unit
│   └── Location Details
├── Organization Details
│   ├── Organization Name
│   ├── Contact Information
│   └── Business Type
├── Site Configuration
│   ├── Site Type
│   ├── Requirements
│   └── Special Notes
└── Review & Submit
```

### 🏢 **Site Management** (`/site`)
```
Site Management Features:
├── Site Overview
│   ├── Basic Information
│   ├── Status Tracking
│   └── Assignment Details
├── Site Details
│   ├── Location Information
│   ├── Contact Details
│   └── Business Information
├── Site Studies
│   ├── Study History
│   ├── Findings Upload
│   └── Status Updates
└── Hardware Assignment
    ├── Deployed Hardware
    ├── Maintenance Records
    └── Warranty Information
```

### 📊 **Forecast (Timeline View)** (`/forecast`)
```
Project Timeline Features:
├── Timeline Overview
│   ├── Project Milestones
│   ├── Deadlines
│   └── Progress Tracking
├── Site Progress
│   ├── Individual Site Status
│   ├── Completion Rates
│   └── Bottleneck Analysis
└── Resource Planning
    ├── Hardware Allocation
    ├── Personnel Assignment
    └── Budget Tracking
```

---

## 🔬 **Site Study Module**

### 📋 **Start New Study** (`/site-study`)
```
Site Study Workflow:
├── Study Information
│   ├── Study Type
│   ├── Objectives
│   └── Timeline
├── Site Assessment
│   ├── Physical Layout
│   ├── Infrastructure
│   └── Requirements
├── Hardware Requirements
│   ├── POS Systems
│   ├── Networking
│   └── Additional Equipment
├── Findings Upload
│   ├── Photos & Documents
│   ├── Measurements
│   └── Recommendations
└── Study Completion
    ├── Summary Report
    ├── Next Steps
    └── Approval Process
```

### 📚 **Study Management**
```
Study Management Features:
├── Completed Studies
│   ├── Study History
│   ├── Findings Archive
│   └── Status Tracking
├── View/Edit Studies
│   ├── Study Details
│   ├── Edit Capabilities
│   └── Version Control
└── Export Studies
    ├── PDF Generation
    ├── Report Templates
    └── Data Export
```

---

## ⚙️ **Hardware Module**

### 🔍 **Scope Hardware** (`/hardware-scoping`)
```
Hardware Scoping Features:
├── Requirements Analysis
│   ├── Site Requirements
│   ├── Business Needs
│   └── Technical Specifications
├── Hardware Selection
│   ├── POS Systems
│   ├── Networking Equipment
│   ├── Printers & Peripherals
│   └── Additional Hardware
├── Cost Estimation
│   ├── Hardware Costs
│   ├── Installation Costs
│   └── Maintenance Costs
└── Proposal Generation
    ├── Detailed Specifications
    ├── Cost Breakdown
    └── Timeline
```

### ✅ **Hardware Approvals** (`/hardware-approvals`)
```
Approval Management:
├── Pending Approvals
│   ├── Approval Queue
│   ├── Priority Levels
│   └── Deadline Tracking
├── Approved Requests
│   ├── Approval History
│   ├── Implementation Status
│   └── Follow-up Actions
├── Rejected Requests
│   ├── Rejection Reasons
│   ├── Revision Requests
│   └── Resubmission Process
└── Approval Workflow
    ├── Multi-level Approvals
    ├── Notifications
    └── Status Updates
```

### 📋 **Hardware Master List** (`/hardware-master`)
```
Hardware Inventory Management:
├── Hardware Catalog
│   ├── POS Systems
│   ├── Kiosks
│   ├── Printers
│   ├── Networking
│   ├── Servers
│   └── Other Equipment
├── Asset Tracking
│   ├── Serial Numbers
│   ├── Deployment Status
│   ├── Location Tracking
│   └── Assignment History
├── Maintenance Records
│   ├── Maintenance Schedule
│   ├── Service History
│   ├── Warranty Information
│   └── Next Maintenance
└── Cost Management
    ├── Purchase Costs
    ├── Maintenance Costs
    ├── Depreciation
    └── ROI Analysis
```

### 🚚 **Vendor Dispatch Status**
```
Vendor Management:
├── Dispatch Tracking
│   ├── Shipment Status
│   ├── Delivery Tracking
│   └── Installation Schedule
├── Vendor Information
│   ├── Vendor Details
│   ├── Contact Information
│   └── Performance History
└── Communication
    ├── Status Updates
    ├── Issue Resolution
    └── Documentation
```

---

## 📦 **Inventory Module** *(To be removed)*

### 👁️ **View All Inventory** (`/inventory`)
```
Inventory Management:
├── Inventory Overview
│   ├── Total Assets
│   ├── By Category
│   ├── By Status
│   └── By Location
├── Asset Details
│   ├── Asset Information
│   ├── Deployment History
│   ├── Maintenance Records
│   └── Cost Information
├── Filtering & Search
│   ├── Advanced Filters
│   ├── Search Functionality
│   └── Export Options
└── Asset Management
    ├── Add New Assets
    ├── Update Information
    ├── Deploy Assets
    └── Retire Assets
```

### 💳 **License & Warranty Tracker** (`/license-management`)
```
License Management:
├── License Overview
│   ├── Active Licenses
│   ├── Expiring Soon
│   ├── Expired Licenses
│   └── By Type
├── License Details
│   ├── License Information
│   ├── Expiry Dates
│   ├── Renewal Status
│   └── Cost Tracking
├── Warranty Tracking
│   ├── Warranty Status
│   ├── Expiry Dates
│   ├── Service History
│   └── Claims Management
└── Management Actions
    ├── Renew Licenses
    ├── Update Information
    ├── Generate Reports
    └── Export Data
```

---

## 🎛️ **Control Desk** (`/control-desk`)

### 🔌 **Integrations**
```
System Integrations:
├── Third-party Systems
│   ├── API Connections
│   ├── Data Synchronization
│   └── Error Handling
├── External Services
│   ├── Payment Systems
│   ├── Communication Tools
│   └── Analytics Platforms
└── System Monitoring
    ├── Health Checks
    ├── Performance Metrics
    └── Alert Management
```

---

## 👨‍💼 **Admin Module** (`/admin`)

### 👥 **Users & Roles**
```
User Management:
├── User Directory
│   ├── User Profiles
│   ├── Role Assignments
│   └── Permission Management
├── Role Configuration
│   ├── Role Definitions
│   ├── Permission Sets
│   └── Access Control
└── User Actions
    ├── Create Users
    ├── Edit Profiles
    ├── Deactivate Users
    └── Password Management
```

### ⚙️ **Master Settings**
```
System Configuration:
├── General Settings
│   ├── Site Configuration
│   ├── Default Values
│   └── System Preferences
├── Workflow Settings
│   ├── Approval Processes
│   ├── Notification Rules
│   └── Automation Rules
└── Security Settings
    ├── Authentication
    ├── Authorization
    └── Data Protection
```

### 📧 **Email Templates**
```
Communication Management:
├── Template Library
│   ├── Notification Templates
│   ├── Approval Templates
│   └── Report Templates
├── Template Editor
│   ├── Content Creation
│   ├── Variable Support
│   └── Preview Functionality
└── Template Management
    ├── Version Control
    ├── Approval Process
    └── Deployment
```

### 📊 **System Logs**
```
System Monitoring:
├── Activity Logs
│   ├── User Actions
│   ├── System Events
│   └── Error Logs
├── Performance Metrics
│   ├── Response Times
│   ├── Resource Usage
│   └── Error Rates
└── Audit Trail
    ├── Data Changes
    ├── Access Logs
    └── Security Events
```

---

## 🔧 **Role-Specific Features**

### 👨‍💼 **Ops Manager Features**
```
Ops Manager Dashboard:
├── My Approvals
│   ├── Pending Approvals
│   ├── Approval History
│   └── Decision Tracking
├── My Sites
│   ├── Assigned Sites
│   ├── Site Status
│   └── Performance Metrics
└── Calendar View
    ├── Schedule Overview
    ├── Important Dates
    └── Task Management
```

### 🔧 **Deployment Engineer Features**
```
Deployment Dashboard:
├── Assigned Sites
│   ├── Site List
│   ├── Priority Levels
│   └── Progress Tracking
├── Deployment Checklist
│   ├── Task Lists
│   ├── Completion Status
│   └── Quality Checks
└── Status Reports
    ├── Report Upload
    ├── Progress Updates
    └── Issue Reporting
```

---

## 📱 **Navigation Structure**

### 🖥️ **Desktop Navigation**
```
Main Navigation Bar:
├── Dashboard (Home)
├── Sites (Dropdown)
│   ├── Create Site
│   ├── Site Management
│   ├── Completed Sites
│   └── Forecast (Timeline View)
├── Site Study (Dropdown)
│   ├── Start New Study
│   ├── Completed Studies
│   ├── View/Edit Studies
│   └── Export Site Study (PDF)
├── Hardware (Dropdown)
│   ├── Scope Hardware
│   ├── Approvals (Pending/Approved)
│   ├── Hardware Master List
│   └── Vendor Dispatch Status
├── Inventory (Dropdown) [To be removed]
│   ├── View All Inventory
│   ├── Filter by Site/Type
│   ├── Add Asset
│   └── License & Warranty Tracker
├── Admin (Dropdown) [Admin only]
│   ├── Users & Roles
│   ├── Master Settings
│   ├── Email Templates
│   └── System Logs
├── Ops Manager (Dropdown) [Ops Manager only]
│   ├── My Approvals
│   ├── My Sites
│   └── Calendar View
└── Deployment (Dropdown) [Deployment Engineer only]
    ├── Assigned Sites
    ├── Deployment Checklist
    └── Upload Status Reports
```

### 📱 **Mobile Navigation**
```
Mobile Menu:
├── Hamburger Menu
├── Role Indicator
├── Quick Actions
├── Navigation Links
└── User Menu
    ├── Profile
    ├── Role Switch
    └── Sign Out
```

---

## 🔄 **Workflow Processes**

### 🏗️ **Site Creation Workflow**
```
1. Site Creation Request
2. Basic Information Entry
3. Organization Details
4. Site Configuration
5. Review & Validation
6. Approval Process
7. Site Activation
8. Assignment to Team
```

### 🔬 **Site Study Workflow**
```
1. Study Initiation
2. Site Assessment
3. Requirements Analysis
4. Hardware Scoping
5. Findings Documentation
6. Report Generation
7. Review & Approval
8. Implementation Planning
```

### ⚙️ **Hardware Approval Workflow**
```
1. Hardware Request
2. Requirements Review
3. Cost Analysis
4. Technical Validation
5. Approval Process
6. Vendor Selection
7. Implementation
8. Quality Assurance
```

---

## 📊 **Data Architecture**

### 🗄️ **Core Entities**
```
Primary Data Models:
├── Sites
│   ├── Basic Information
│   ├── Location Details
│   ├── Organization Data
│   └── Status Information
├── Users
│   ├── Profile Information
│   ├── Role Assignments
│   ├── Permissions
│   └── Activity History
├── Hardware
│   ├── Asset Information
│   ├── Deployment Status
│   ├── Maintenance Records
│   └── Cost Data
├── Licenses
│   ├── License Details
│   ├── Expiry Information
│   ├── Renewal Status
│   └── Cost Tracking
└── Site Studies
    ├── Study Information
    ├── Findings Data
    ├── Requirements
    └── Implementation Plans
```

### 🔗 **Relationships**
```
Data Relationships:
├── Sites ↔ Users (Assignments)
├── Sites ↔ Hardware (Deployments)
├── Sites ↔ Site Studies (Research)
├── Hardware ↔ Licenses (Compliance)
├── Users ↔ Roles (Permissions)
└── Hardware ↔ Vendors (Procurement)
```

---

## 🎯 **Key Features Summary**

### ✅ **Implemented Features**
- ✅ Role-based access control
- ✅ Site creation and management
- ✅ Hardware scoping and approvals
- ✅ Site study workflow
- ✅ Inventory management
- ✅ License and warranty tracking
- ✅ Dashboard analytics
- ✅ User management
- ✅ Performance monitoring

### 🔄 **Planned Changes**
- 🔄 Remove inventory module
- 🔄 Move License & Warranty Tracker to Hardware module
- 🔄 Consolidate hardware management features

### 🚀 **Future Enhancements**
- 🚀 Advanced reporting
- 🚀 Mobile application
- 🚀 Real-time notifications
- 🚀 Advanced analytics
- 🚀 Integration with external systems

---

*Last Updated: January 2025*
*Version: 1.0* 