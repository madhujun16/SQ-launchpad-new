-- Fix stepper flow backend tables with proper IF NOT EXISTS checks

-- 1. Software modules table
CREATE TABLE IF NOT EXISTS public.software_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  monthly_fee DECIMAL(10,2) DEFAULT 0,
  setup_fee DECIMAL(10,2) DEFAULT 0,
  hardware_requirements JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 2. Add category column to hardware_items if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hardware_items' AND column_name = 'category') THEN
    ALTER TABLE public.hardware_items ADD COLUMN category VARCHAR(100);
  END IF;
END $$;

-- 3. Site studies table with comprehensive structure
CREATE TABLE IF NOT EXISTS public.site_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  
  -- Site Details
  site_details JSONB DEFAULT '{
    "clientName": "",
    "siteAddress": "",
    "siteContact": []
  }'::jsonb,
  
  -- Schedule
  schedule JSONB DEFAULT '{
    "targetGoLiveDate": "",
    "operatingHours": []
  }'::jsonb,
  
  -- Environment
  environment JSONB DEFAULT '{
    "spaceType": "",
    "isListedBuilding": false,
    "permitRequired": false
  }'::jsonb,
  
  -- Power Infrastructure
  power_infrastructure JSONB DEFAULT '{
    "availablePower": [],
    "distanceFromPower": 0
  }'::jsonb,
  
  -- Data Infrastructure
  data_infrastructure JSONB DEFAULT '{
    "networkConnectivity": "",
    "ethernetPorts": 0,
    "wifiSSIDs": "",
    "vlanIPPlan": "",
    "proxyWebFiltering": false,
    "firewallEgress": false,
    "mobileSignal": ""
  }'::jsonb,
  
  -- Physical - Mounting
  mounting JSONB DEFAULT '{
    "mountType": "",
    "surfaceMaterial": "",
    "drillingRestrictions": false
  }'::jsonb,
  
  -- Physical - Layout
  layout JSONB DEFAULT '{
    "clearanceAvailable": "",
    "distanceToTill": 0,
    "accessibilityCompliance": false
  }'::jsonb,
  
  -- Devices
  devices JSONB DEFAULT '{
    "kiosk": {
      "numberOfKiosks": 0,
      "screenSize": "",
      "cardPaymentDevice": "",
      "receiptPrinter": false,
      "grabGoShelf": false
    },
    "pos": {
      "numberOfTerminals": 0,
      "cashDrawer": false
    },
    "kitchen": {
      "numberOfKDSScreens": 0,
      "kitchenPrinter": false
    },
    "other": {
      "scanners": false,
      "nfc": false,
      "customerDisplay": false
    }
  }'::jsonb,
  
  -- Software Modules
  software_modules JSONB DEFAULT '{
    "modulesRequired": [],
    "userRoles": []
  }'::jsonb,
  
  -- Compliance
  compliance JSONB DEFAULT '{
    "pciResponsibilities": "",
    "brandAssetsAvailable": false
  }'::jsonb,
  
  -- Payments
  payments JSONB DEFAULT '{
    "gateway": {
      "paymentProvider": "",
      "p2peRequired": "",
      "settlementCurrency": ""
    },
    "ped": {
      "commsMethod": "",
      "mountingType": ""
    }
  }'::jsonb,
  
  -- Security & HSE
  security_hse JSONB DEFAULT '{
    "device": {
      "mdmRequired": "",
      "assetTagging": false
    },
    "hse": {
      "ramsApproval": false,
      "workingConstraints": ""
    }
  }'::jsonb,
  
  status VARCHAR(50) DEFAULT 'draft',
  progress_percentage INTEGER DEFAULT 0,
  findings TEXT,
  uploaded_docs JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id)
);

-- 4. Other stepper tables
CREATE TABLE IF NOT EXISTS public.site_scoping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  
  selected_software JSONB DEFAULT '[]'::jsonb,
  selected_hardware JSONB DEFAULT '[]'::jsonb,
  
  cost_summary JSONB DEFAULT '{
    "hardwareCost": 0,
    "softwareSetupCost": 0,
    "installationCost": 0,
    "contingencyCost": 0,
    "totalCapex": 0,
    "monthlySoftwareFees": 0,
    "maintenanceCost": 0,
    "totalMonthlyOpex": 0,
    "totalInvestment": 0
  }'::jsonb,
  
  status VARCHAR(50) DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.site_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  
  status VARCHAR(50) DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  comments TEXT,
  
  approver_details JSONB DEFAULT '{
    "name": "",
    "role": "",
    "department": ""
  }'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_procurement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  
  status VARCHAR(50) DEFAULT 'pending',
  
  software_modules JSONB DEFAULT '[]'::jsonb,
  hardware_items JSONB DEFAULT '[]'::jsonb,
  
  summary JSONB DEFAULT '{
    "totalSoftwareModules": 0,
    "totalHardwareItems": 0,
    "inProgress": 0,
    "completed": 0
  }'::jsonb,
  
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  
  status VARCHAR(50) DEFAULT 'scheduled',
  start_date DATE,
  end_date DATE,
  assigned_engineer UUID REFERENCES auth.users(id),
  notes TEXT,
  
  progress JSONB DEFAULT '{
    "overallProgress": 0,
    "hardwareDelivered": "pending",
    "installation": "pending",
    "testing": "pending"
  }'::jsonb,
  
  timeline JSONB DEFAULT '{
    "hardwareDelivery": "",
    "installationStart": "",
    "installationEnd": "",
    "testingStart": "",
    "testingEnd": "",
    "goLiveDate": ""
  }'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_go_live (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  
  status VARCHAR(50) DEFAULT 'pending',
  date DATE,
  signed_off_by UUID REFERENCES auth.users(id),
  notes TEXT,
  
  checklist JSONB DEFAULT '{
    "hardwareInstallationComplete": "pending",
    "softwareConfigurationComplete": "pending",
    "staffTraining": "pending",
    "finalTesting": "pending"
  }'::jsonb,
  
  timeline JSONB DEFAULT '{
    "targetGoLiveDate": "",
    "finalTesting": "",
    "staffTraining": "",
    "systemHandover": ""
  }'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_site_studies_site_id ON public.site_studies(site_id);
CREATE INDEX IF NOT EXISTS idx_site_scoping_site_id ON public.site_scoping(site_id);
CREATE INDEX IF NOT EXISTS idx_site_approvals_site_id ON public.site_approvals(site_id);
CREATE INDEX IF NOT EXISTS idx_site_procurement_site_id ON public.site_procurement(site_id);
CREATE INDEX IF NOT EXISTS idx_site_deployments_site_id ON public.site_deployments(site_id);
CREATE INDEX IF NOT EXISTS idx_site_go_live_site_id ON public.site_go_live(site_id);

-- 6. Enable RLS on new tables only
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'software_modules') THEN
    ALTER TABLE public.software_modules ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_studies') THEN
    ALTER TABLE public.site_studies ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_scoping') THEN
    ALTER TABLE public.site_scoping ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_approvals') THEN
    ALTER TABLE public.site_approvals ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_procurement') THEN
    ALTER TABLE public.site_procurement ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_deployments') THEN
    ALTER TABLE public.site_deployments ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_go_live') THEN
    ALTER TABLE public.site_go_live ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 7. Create policies only if they don't exist
DO $$
BEGIN
  -- Software modules policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'software_modules' AND policyname = 'Authenticated users can view software modules') THEN
    CREATE POLICY "Authenticated users can view software modules" ON public.software_modules
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'software_modules' AND policyname = 'Admins can manage software modules') THEN
    CREATE POLICY "Admins can manage software modules" ON public.software_modules
      FOR ALL USING (is_admin());
  END IF;

  -- Site studies policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_studies' AND policyname = 'Users can view site studies for assigned sites') THEN
    CREATE POLICY "Users can view site studies for assigned sites" ON public.site_studies
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.sites s 
          WHERE s.id = site_studies.site_id 
          AND (s.assigned_ops_manager = auth.uid() OR s.assigned_deployment_engineer = auth.uid() OR is_admin())
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_studies' AND policyname = 'Users can manage site studies for assigned sites') THEN
    CREATE POLICY "Users can manage site studies for assigned sites" ON public.site_studies
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.sites s 
          WHERE s.id = site_studies.site_id 
          AND (s.assigned_ops_manager = auth.uid() OR s.assigned_deployment_engineer = auth.uid() OR is_admin())
        )
      );
  END IF;
END $$;

-- 8. Insert default software modules
INSERT INTO public.software_modules (name, description, category, monthly_fee, setup_fee, hardware_requirements) VALUES
('POS System', 'Point of Sale system for transactions', 'POS', 25.00, 150.00, '["pos-terminal", "barcode-scanner", "cash-drawer"]'::jsonb),
('Kiosk Software', 'Self-service kiosk interface', 'Kiosk', 15.00, 100.00, '["kiosk-terminal", "touch-screen"]'::jsonb),
('Kitchen Display', 'Kitchen order management system', 'Kitchen Display (KDS)', 20.00, 120.00, '["kitchen-display", "printer"]'::jsonb),
('Inventory Management', 'Stock tracking and management', 'Inventory', 30.00, 200.00, '["tablet", "barcode-scanner"]'::jsonb),
('Subscription Management', 'Manage customer subscriptions', 'Subscriptions', 25.00, 180.00, '["tablet"]'::jsonb),
('Loyalty Program', 'Customer loyalty and rewards', 'Loyalty', 20.00, 150.00, '["tablet", "barcode-scanner"]'::jsonb)
ON CONFLICT DO NOTHING;