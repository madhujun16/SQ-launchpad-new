-- Create comprehensive tables for Stepper flow backend

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

-- 2. Hardware items table (update existing one)
DO $$
BEGIN
  -- Add missing columns to hardware_items if they don't exist
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

-- 4. Site scoping table
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

-- 5. Site approvals table
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

-- 6. Site procurement table
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

-- 7. Site deployments table (enhanced)
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

-- 8. Site go-live table
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

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_site_studies_site_id ON public.site_studies(site_id);
CREATE INDEX IF NOT EXISTS idx_site_scoping_site_id ON public.site_scoping(site_id);
CREATE INDEX IF NOT EXISTS idx_site_approvals_site_id ON public.site_approvals(site_id);
CREATE INDEX IF NOT EXISTS idx_site_procurement_site_id ON public.site_procurement(site_id);
CREATE INDEX IF NOT EXISTS idx_site_deployments_site_id ON public.site_deployments(site_id);
CREATE INDEX IF NOT EXISTS idx_site_go_live_site_id ON public.site_go_live(site_id);

-- 10. Add triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DO $$
BEGIN
  DROP TRIGGER IF EXISTS update_site_studies_updated_at ON public.site_studies;
  CREATE TRIGGER update_site_studies_updated_at
    BEFORE UPDATE ON public.site_studies
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  DROP TRIGGER IF EXISTS update_site_scoping_updated_at ON public.site_scoping;
  CREATE TRIGGER update_site_scoping_updated_at
    BEFORE UPDATE ON public.site_scoping
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  DROP TRIGGER IF EXISTS update_site_approvals_updated_at ON public.site_approvals;
  CREATE TRIGGER update_site_approvals_updated_at
    BEFORE UPDATE ON public.site_approvals
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  DROP TRIGGER IF EXISTS update_site_procurement_updated_at ON public.site_procurement;
  CREATE TRIGGER update_site_procurement_updated_at
    BEFORE UPDATE ON public.site_procurement
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  DROP TRIGGER IF EXISTS update_site_deployments_updated_at ON public.site_deployments;
  CREATE TRIGGER update_site_deployments_updated_at
    BEFORE UPDATE ON public.site_deployments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  DROP TRIGGER IF EXISTS update_site_go_live_updated_at ON public.site_go_live;
  CREATE TRIGGER update_site_go_live_updated_at
    BEFORE UPDATE ON public.site_go_live
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
END $$;

-- 11. Enable RLS on all tables
ALTER TABLE public.software_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_scoping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_procurement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_go_live ENABLE ROW LEVEL SECURITY;

-- 12. Create RLS policies
-- Software modules policies
CREATE POLICY "Authenticated users can view software modules" ON public.software_modules
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage software modules" ON public.software_modules
  FOR ALL USING (is_admin());

-- Site studies policies
CREATE POLICY "Users can view site studies for assigned sites" ON public.site_studies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sites s 
      WHERE s.id = site_studies.site_id 
      AND (s.assigned_ops_manager = auth.uid() OR s.assigned_deployment_engineer = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Users can manage site studies for assigned sites" ON public.site_studies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.sites s 
      WHERE s.id = site_studies.site_id 
      AND (s.assigned_ops_manager = auth.uid() OR s.assigned_deployment_engineer = auth.uid() OR is_admin())
    )
  );

-- Site scoping policies
CREATE POLICY "Users can view site scoping for assigned sites" ON public.site_scoping
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sites s 
      WHERE s.id = site_scoping.site_id 
      AND (s.assigned_ops_manager = auth.uid() OR s.assigned_deployment_engineer = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Users can manage site scoping for assigned sites" ON public.site_scoping
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.sites s 
      WHERE s.id = site_scoping.site_id 
      AND (s.assigned_ops_manager = auth.uid() OR s.assigned_deployment_engineer = auth.uid() OR is_admin())
    )
  );

-- Site approvals policies
CREATE POLICY "Users can view site approvals for assigned sites" ON public.site_approvals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sites s 
      WHERE s.id = site_approvals.site_id 
      AND (s.assigned_ops_manager = auth.uid() OR s.assigned_deployment_engineer = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Ops managers and admins can manage site approvals" ON public.site_approvals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.sites s 
      WHERE s.id = site_approvals.site_id 
      AND (s.assigned_ops_manager = auth.uid() OR is_admin())
    )
  );

-- Site procurement policies
CREATE POLICY "Users can view site procurement for assigned sites" ON public.site_procurement
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sites s 
      WHERE s.id = site_procurement.site_id 
      AND (s.assigned_ops_manager = auth.uid() OR s.assigned_deployment_engineer = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Users can manage site procurement for assigned sites" ON public.site_procurement
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.sites s 
      WHERE s.id = site_procurement.site_id 
      AND (s.assigned_ops_manager = auth.uid() OR s.assigned_deployment_engineer = auth.uid() OR is_admin())
    )
  );

-- Site deployments policies
CREATE POLICY "Users can view site deployments for assigned sites" ON public.site_deployments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sites s 
      WHERE s.id = site_deployments.site_id 
      AND (s.assigned_ops_manager = auth.uid() OR s.assigned_deployment_engineer = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Deployment engineers and admins can manage site deployments" ON public.site_deployments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.sites s 
      WHERE s.id = site_deployments.site_id 
      AND (s.assigned_deployment_engineer = auth.uid() OR is_admin())
    )
  );

-- Site go-live policies
CREATE POLICY "Users can view site go-live for assigned sites" ON public.site_go_live
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sites s 
      WHERE s.id = site_go_live.site_id 
      AND (s.assigned_ops_manager = auth.uid() OR s.assigned_deployment_engineer = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Users can manage site go-live for assigned sites" ON public.site_go_live
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.sites s 
      WHERE s.id = site_go_live.site_id 
      AND (s.assigned_ops_manager = auth.uid() OR s.assigned_deployment_engineer = auth.uid() OR is_admin())
    )
  );

-- 13. Insert default software modules with categories
INSERT INTO public.software_modules (name, description, category, monthly_fee, setup_fee, hardware_requirements) VALUES
('POS System', 'Point of Sale system for transactions', 'POS', 25.00, 150.00, '["pos-terminal", "barcode-scanner", "cash-drawer"]'::jsonb),
('Kiosk Software', 'Self-service kiosk interface', 'Kiosk', 15.00, 100.00, '["kiosk-terminal", "touch-screen"]'::jsonb),
('Kitchen Display', 'Kitchen order management system', 'Kitchen Display (KDS)', 20.00, 120.00, '["kitchen-display", "printer"]'::jsonb),
('Inventory Management', 'Stock tracking and management', 'Inventory', 30.00, 200.00, '["tablet", "barcode-scanner"]'::jsonb),
('Subscription Management', 'Manage customer subscriptions', 'Subscriptions', 25.00, 180.00, '["tablet"]'::jsonb),
('Loyalty Program', 'Customer loyalty and rewards', 'Loyalty', 20.00, 150.00, '["tablet", "barcode-scanner"]'::jsonb)
ON CONFLICT DO NOTHING;