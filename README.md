# 🚀 SmartQ LaunchPad

**Site Onboarding, Deployment & Inventory Management Platform**

---

## 🧭 Purpose

SmartQ LaunchPad is a workflow-driven platform built to simplify and standardize the onboarding of new client sites across the UK. It manages the entire process — from site creation and stakeholder mapping to hardware scoping, deployment tracking, inventory management, and system integration.

---

## 👥 User Roles & Responsibilities

| Role                    | Key Responsibilities                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Admin**               | Create sites, assign Ops Managers and Deployment Engineers, scope hardware, manage approval workflows, export data |
| **Ops Manager**         | Approve hardware requests for assigned sites                                                                       |
| **Deployment Engineer** | Conduct site studies, upload findings, define hardware requirements, update site status                            |

---

## 🔁 Workflow Overview

### 1. **Site Creation (Admin)**

* Admin creates a new **Organisation** and assigns a **Food Court (unit)**
* **Important**:
  🟡 **Food Court (unit)** is a constant — it does **not** change dynamically during the lifecycle

  * It represents a fixed operational unit tied to a site or trading location
* Admin maps:

  * Responsible **Ops Manager**
  * Assigned **Deployment Engineer**

---

### 2. **Site Study (Deployment Engineer)**

* Assigned sites are visible on the engineer's dashboard
* Engineer conducts on-site assessment and submits:

  * Site Map
  * Counter Count
  * Product-wise and counter-wise hardware needs
* Site status is updated manually post-study

---

### 3. **Hardware Scoping & Approval (Admin + Ops Manager)**

* Admin scopes required hardware based on submitted data
* Hardware types may include:

  * POS Machines, PEDs, Kiosks, Cash Drawers, Printers, KDS Screens
* Request is routed to **Ops Manager** for approval
* Upon approval, hardware procurement is handed over to **Melford**
* Admin uploads related files (e.g., approvals, screenshots)

---

### 4. **Inventory & Deployment**

* Inventory Dashboard is enabled post-approval
* Tracks deployment and asset ownership using filters:

  * **Sector**, **City**, **Site**, **Group Type**, **Inventory Type**, **License**
* **Group Types**:

  * `POS`: POS Machine, PED, Printer, Cash Drawer
  * `KMS`: Kitchen Printers
  * `KIOSK`: Self-service Kiosk

---

### 5. **Control Desk Integration**

* Admin exports site data as **JSON** or **Excel**
* Used by Control Desk to configure:

  * Organisation hierarchy
  * Food Courts (units)
  * Outlet records

---

### 6. **License & Service Tracking**

* Tracks hardware/software/service licenses
* Monitors:

  * Status
  * Renewal timelines
  * Compliance status

---

### 7. **Forecasting & Pipeline Visibility**

* Forecast Dashboard shows onboarding capacity and upcoming sites
* Enables planning for:

  * Hardware procurement
  * Resource deployment
  * Operational readiness

---

## 📊 Dashboards Summary

| Dashboard                | Role                | Description                                                         |
| ------------------------ | ------------------- | ------------------------------------------------------------------- |
| **Admin Dashboard**      | Admin               | Site overview, pending approvals, inventory insights, pipeline view |
| **Deployment Dashboard** | Deployment Engineer | Assigned site list, progress tracking, manual status updates        |
| **Inventory Dashboard**  | All mapped users    | Live asset visibility with filters                                  |
| **Forecast Dashboard**   | Admin               | Pipeline of incoming clients, readiness forecasts                   |

---

## 🛠️ Technology Stack

This project is built with:

- **Frontend**: React + TypeScript + Vite
- **UI Components**: shadcn-ui + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Icons**: Lucide React

---

## 🚀 Getting Started

### Prerequisites

- Node.js & npm installed
- Supabase account and project setup

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd sq-launchpad-cg

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at **http://localhost:8080**

---

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/            # shadcn-ui components
│   └── ...            # Custom components
├── pages/             # Page components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
├── integrations/      # External service integrations
│   └── supabase/     # Supabase client and types
└── assets/           # Static assets
```

---

## 🔧 Development

- **Development**: `npm run dev`
- **Build**: `npm run build`
- **Preview**: `npm run preview`
- **Lint**: `npm run lint`

---

## 📝 Key Features

- **Role-based Access Control**: Admin, Ops Manager, Deployment Engineer
- **Workflow Management**: Site creation → Study → Hardware scoping → Approval → Deployment
- **Inventory Tracking**: Real-time asset management with filtering
- **Data Export**: JSON/Excel export for Control Desk integration
- **Forecasting**: Pipeline visibility and capacity planning
- **License Management**: Hardware/software/service license tracking

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📄 License

This project is proprietary to SmartQ.
