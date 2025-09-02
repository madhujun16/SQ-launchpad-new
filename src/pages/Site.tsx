import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/roles';
import { useSiteContext } from '@/contexts/SiteContext';
import { getStatusColor, getStatusDisplayName, getStepperStepFromStatus, validateStatusProgression, type UnifiedSiteStatus } from '@/lib/siteTypes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building, 
  CalendarDays,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download, 
  Edit,
  FileText,
  Filter,
  Globe,
  Home,
  Info,
  Layout,
  MapPin,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Settings,
  Truck,
  Users,
  Wifi,
  X,
  Monitor,
  BarChart3,
  CheckSquare,
  StickyNote,
  Handshake,
  MessageSquare,
  BookOpen,
  ShoppingCart,
  Award,
  HardHat,
  Calendar,
  User,
  DollarSign,
  ListChecks,
  Zap,
  Smartphone,
  Tv,
  Camera,
  Navigation,
  CheckCheck,
  AlertCircle,
  Grid,
  ClipboardList,
  FileCheck
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { LocationPicker } from '@/components/ui/location-picker';
import { LayoutImageUpload } from '@/components/LayoutImageUpload';
import { GlobalSiteNotesModal } from '@/components/GlobalSiteNotesModal';
import { Loader } from '@/components/ui/loader';
import { Calendar as CalendarIcon } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
// Enhanced interfaces for Scoping step
interface HardwareItem {
  id: string;
  name: string;
  description: string;
  manufacturer: string;
  model: string;
  unitCost: number;
  quantity: number;
  reason: string;
}

interface SoftwareModule {
  id: string;
  name: string;
  description: string;
  monthlyFee: number;
  setupFee: number;
  hardwareRequirements: string[];
}

// Mock data for software modules and hardware items
const softwareModules: SoftwareModule[] = [
  {
    id: 'pos-system',
    name: 'POS System',
    description: 'Point of Sale system for transactions',
    monthlyFee: 25,
    setupFee: 150,
    hardwareRequirements: ['pos-terminal', 'printer', 'cash-drawer']
  },
  {
    id: 'kiosk-software',
    name: 'Kiosk Software',
    description: 'Self-service kiosk software',
    monthlyFee: 20,
    setupFee: 100,
    hardwareRequirements: ['kiosk-display', 'touch-screen', 'printer']
  },
  {
    id: 'kitchen-display',
    name: 'Kitchen Display',
    description: 'Kitchen display system for orders',
    monthlyFee: 20,
    setupFee: 100,
    hardwareRequirements: ['kitchen-display', 'printer']
  },
  {
    id: 'inventory-management',
    name: 'Inventory Management',
    description: 'Inventory tracking and management',
    monthlyFee: 15,
    setupFee: 75,
    hardwareRequirements: ['tablet', 'barcode-scanner']
  }
];

const hardwareItems: HardwareItem[] = [
  {
    id: 'pos-terminal',
    name: 'POS Terminal',
    description: 'Ingenico Telium 2 POS terminal',
    manufacturer: 'Ingenico',
    model: 'Telium 2',
    unitCost: 2500,
    quantity: 1,
    reason: 'Required by POS System'
  },
  {
    id: 'printer',
    name: 'Thermal Printer',
    description: 'Receipt and kitchen order printer',
    manufacturer: 'Epson',
    model: 'TM-T88VI',
    unitCost: 350,
    quantity: 1,
    reason: 'Required by POS System'
  },
  {
    id: 'cash-drawer',
    name: 'Cash Drawer',
    description: 'Electronic cash drawer',
    manufacturer: 'APG',
    model: 'CashDrawer-2000',
    unitCost: 200,
    quantity: 1,
    reason: 'Required by POS System'
  },
  {
    id: 'kiosk-display',
    name: 'Kiosk Display',
    description: 'Touch screen display for kiosk',
    manufacturer: 'Elo',
    model: 'TouchScreen-22',
    unitCost: 800,
    quantity: 1,
    reason: 'Required by Kiosk Software'
  },
  {
    id: 'touch-screen',
    name: 'Touch Screen',
    description: 'Touch screen interface',
    manufacturer: 'Elo',
    model: 'TouchScreen-15',
    unitCost: 600,
    quantity: 1,
    reason: 'Required by Kiosk Software'
  },
  {
    id: 'kitchen-display',
    name: 'Kitchen Display',
    description: 'Digital display for kitchen orders',
    manufacturer: 'Sony',
    model: 'KD-55X80K',
    unitCost: 1200,
    quantity: 1,
    reason: 'Required by Kitchen Display'
  },
  {
    id: 'tablet',
    name: 'Tablet',
    description: 'iPad for inventory management',
    manufacturer: 'Apple',
    model: 'iPad Air',
    unitCost: 800,
    quantity: 1,
    reason: 'Required by Inventory Management'
  },
  {
    id: 'barcode-scanner',
    name: 'Barcode Scanner',
    description: 'USB barcode scanner',
    manufacturer: 'Honeywell',
    model: 'Scanner-1900',
    unitCost: 150,
    quantity: 1,
    reason: 'Required by Inventory Management'
  }
];

// Enhanced Site interface with comprehensive step data
interface Site {
  id: string;
  name: string;
  organization: string;
  foodCourt?: string;
  unitCode: string;
  sector: string;
  goLiveDate: string;
  priority: 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high';
  criticality: 'low' | 'medium' | 'high';
  status: UnifiedSiteStatus;
  assignedOpsManager?: string;
  assignedDeploymentEngineer?: string;
  stakeholders?: Stakeholder[];
  notes?: string;
  lastUpdated?: string;
  description?: string;
  
  // Site Creation data
  siteCreation?: {
    contactInfo: {
      unitManagerName: string;
      jobTitle: string;
      unitManagerEmail: string;
      unitManagerMobile: string;
      additionalContactName: string;
      additionalContactEmail: string;
    };
    locationInfo: {
      location: string;
      postcode: string;
      region: string;
      country: string;
      latitude: number;
      longitude: number;
    };
    additionalNotes: string;
  };
  
  // Site Study data
  siteStudy?: {
    contactInfo: {
      primaryContact: {
        name: string;
        jobTitle: string;
        email: string;
        mobile: string;
      };
      additionalContact: {
        name: string;
        email: string;
      };
    };
    infrastructure: {
      siteAddress: string;
      postcode: string;
      region: string;
      country: string;
      numberOfCounters: number;
      floorPlanAvailable: boolean;
      mealSessions: string[];
      floor: string;
      liftAccess: string;
      securityRestrictions: string;
      deliveryWindow: string;
    };
    staffCapacity: {
      employeeStrength: number;
      operatingHours: string;
      expectedFootfall: number;
      peakHours: string;
      seatingCapacity: number;
      kitchenStaff: number;
      operatingDays: string;
      serviceStaff: number;
      management: number;
    };
    itInfrastructure: {
      lanPoints: number;
      upsPowerPos: string;
      wifiAvailable: string;
      upsPowerCeiling: string;
      bandwidth: string;
      staticIp: string;
    };
    softwareScoping: {
      selectedSolutions: string[];
    };
  };
  
  // Scoping data
  scoping?: {
    selectedSoftware: string[];
    selectedHardware: { id: string; quantity: number; customizations?: string }[];
    status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'changes_requested';
    submittedAt?: string;
    approvedAt?: string;
    approvedBy?: string;
    costSummary: {
      hardwareCost: number;
      softwareSetupCost: number;
      installationCost: number;
      contingencyCost: number;
      totalCapex: number;
      monthlySoftwareFees: number;
      maintenanceCost: number;
      totalMonthlyOpex: number;
      totalInvestment: number;
    };
  };
  
  // Approval data
  approval?: {
    status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
    requestedAt?: string;
    approvedAt?: string;
    approvedBy?: string;
    comments?: string;
    approverDetails: {
      name: string;
      role: string;
      department: string;
    };
  };
  
  // Procurement data
  procurement?: {
    status: 'pending' | 'ordered' | 'delivered' | 'partially_delivered';
    lastUpdated?: string;
    softwareModules: {
      name: string;
      status: 'pending' | 'ordered' | 'delivered';
      orderDate?: string;
      deliveryDate?: string;
      licenseKey?: string;
    }[];
    hardwareItems: {
      name: string;
      quantity: number;
      status: 'pending' | 'ordered' | 'delivered';
      orderDate?: string;
      deliveryDate?: string;
      trackingNumber?: string;
    }[];
    summary: {
      totalSoftwareModules: number;
      totalHardwareItems: number;
      inProgress: number;
      completed: number;
    };
  };
  
  // Deployment data
  deployment?: {
    status: 'scheduled' | 'in_progress' | 'completed' | 'on_hold';
    startDate?: string;
    endDate?: string;
    assignedEngineer?: string;
    notes?: string;
    progress: {
      overallProgress: number;
      hardwareDelivered: 'completed' | 'in_progress' | 'pending';
      installation: 'completed' | 'in_progress' | 'pending';
      testing: 'completed' | 'in_progress' | 'pending';
    };
    timeline: {
      hardwareDelivery: string;
      installationStart: string;
      installationEnd: string;
      testingStart: string;
      testingEnd: string;
      goLiveDate: string;
    };
  };
  
  // Go Live data
  goLive?: {
    status: 'pending' | 'live' | 'postponed';
    date?: string;
    signedOffBy?: string;
    notes?: string;
    checklist: {
      hardwareInstallationComplete: 'completed' | 'in_progress' | 'pending';
      softwareConfigurationComplete: 'completed' | 'in_progress' | 'pending';
      staffTraining: 'completed' | 'in_progress' | 'pending';
      finalTesting: 'completed' | 'in_progress' | 'pending';
    };
    timeline: {
      targetGoLiveDate: string;
      finalTesting: string;
      staffTraining: string;
      systemHandover: string;
    };
  };
}

// Missing interfaces
interface Stakeholder {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  organization: string;
}

interface Organisation {
  id: string;
  name: string;
  sector: string;
  unitCodePrefix: string;
}

interface EnhancedStepperStep {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'pending' | 'blocked';
  description: string;
}

// Helper function to create comprehensive mock site data based on status
const createMockSiteWithStatus = (id: string, status: UnifiedSiteStatus): Site => {
  const baseSite: Site = {
    id: id,
    name: `ASDA Redditch`,
    organization: 'ASDA',
    foodCourt: 'ASDA Redditch',
    unitCode: 'AR004',
    sector: 'Eurest',
    goLiveDate: '2025-01-15',
    priority: 'high',
    riskLevel: 'medium',
    criticality: 'high',
    status: status,
    assignedOpsManager: 'Jessica Cleaver',
    assignedDeploymentEngineer: 'John Smith',
    stakeholders: [
      { id: '1', name: 'Sarah Johnson', role: 'Unit Manager', email: 'sarah.johnson@company.com', phone: '+44 20 7123 4567', organization: 'Company Ltd' },
      { id: '2', name: 'Mike Wilson', role: 'IT Manager', email: 'mike.wilson@company.com', phone: '+44 20 7123 4568', organization: 'Company Ltd' }
    ],
    notes: 'Full POS and Kiosk implementation for ASDA Redditch location',
    lastUpdated: '2024-12-30',
    description: 'Full POS and Kiosk implementation for ASDA Redditch location',
  };

  // Site Creation data (always available)
  baseSite.siteCreation = {
    contactInfo: {
      unitManagerName: 'Sarah Johnson',
      jobTitle: 'Operations Manager',
      unitManagerEmail: 'sarah.johnson@company.com',
      unitManagerMobile: '+44 7700 900123',
      additionalContactName: 'Mike Wilson',
      additionalContactEmail: 'mike.wilson@company.com'
    },
    locationInfo: {
      location: 'ASDA Redditch, Redditch, Worcestershire',
      postcode: 'B98 8AA',
      region: 'West Midlands',
      country: 'United Kingdom',
      latitude: 52.3067,
      longitude: -1.9456
    },
    additionalNotes: 'Kitchen area needs additional power outlets for POS terminals. Storage area available for hardware installation.'
  };

  // Site Study data (available for site_study_done and beyond)
  if (['site_study_done', 'scoping_done', 'approved', 'procurement_done', 'deployed', 'live'].includes(status)) {
    baseSite.siteStudy = {
      contactInfo: {
        primaryContact: {
          name: 'Sarah Johnson',
          jobTitle: 'Operations Manager',
          email: 'sarah.johnson@company.com',
          mobile: '+44 7700 900123'
        },
        additionalContact: {
          name: 'John Smith',
          email: 'john.smith@company.com'
        }
      },
      infrastructure: {
        siteAddress: 'ASDA Redditch, Redditch, Worcestershire',
        postcode: 'B98 8AA',
        region: 'West Midlands',
        country: 'United Kingdom',
        numberOfCounters: 4,
        floorPlanAvailable: true,
        mealSessions: ['Breakfast', 'Lunch', 'Dinner'],
        floor: '2nd Floor',
        liftAccess: 'Available',
        securityRestrictions: 'Security pass required for all visitors',
        deliveryWindow: '10:00 AM - 2:00 PM'
      },
      staffCapacity: {
        employeeStrength: 45,
        operatingHours: '7:00 AM - 6:00 PM',
        expectedFootfall: 800,
        peakHours: '12:00 PM - 2:00 PM',
        seatingCapacity: 300,
        kitchenStaff: 15,
        operatingDays: 'Monday - Friday',
        serviceStaff: 8,
        management: 3
      },
      itInfrastructure: {
        lanPoints: 8,
        upsPowerPos: 'Available',
        wifiAvailable: 'Yes',
        upsPowerCeiling: 'Not Available',
        bandwidth: '6 Mbps',
        staticIp: 'Provided'
      },
      softwareScoping: {
        selectedSolutions: ['pos-system', 'kiosk-software', 'kitchen-display', 'inventory-management']
      }
    };
  }

  // Scoping data (available for scoping_done and beyond)
  if (['scoping_done', 'approved', 'procurement_done', 'deployed', 'live'].includes(status)) {
    baseSite.scoping = {
      selectedSoftware: ['pos-system', 'kiosk-software', 'kitchen-display', 'inventory-management'],
      selectedHardware: [
        { id: 'pos-terminal', quantity: 4 },
        { id: 'kiosk-display', quantity: 2 },
        { id: 'printer', quantity: 4 },
        { id: 'cash-drawer', quantity: 2 },
        { id: 'kitchen-display', quantity: 1 },
        { id: 'tablet', quantity: 2 },
        { id: 'barcode-scanner', quantity: 2 }
      ],
      status: 'approved',
      submittedAt: '2024-12-10T10:00:00Z',
      approvedAt: '2024-12-12T14:30:00Z',
      approvedBy: 'John Smith',
      costSummary: {
        hardwareCost: 12500,
        softwareSetupCost: 425,
        installationCost: 2000,
        contingencyCost: 2239,
        totalCapex: 17164,
        monthlySoftwareFees: 80,
        maintenanceCost: 50,
        totalMonthlyOpex: 130,
        totalInvestment: 17294
      }
    };
  }

  // Approval data (available for approved and beyond)
  if (['approved', 'procurement_done', 'deployed', 'live'].includes(status)) {
    baseSite.approval = {
      status: 'approved',
      requestedAt: '2024-12-15T09:00:00Z',
      approvedAt: '2024-12-18T11:00:00Z',
      approvedBy: 'Sarah Johnson',
      comments: 'All requirements met. Budget approved. Proceed with procurement.',
      approverDetails: {
        name: 'Sarah Johnson',
        role: 'Operations Director',
        department: 'Operations'
      }
    };
  } else if (status === 'changes_requested' as UnifiedSiteStatus) {
    baseSite.approval = {
      status: 'changes_requested',
      requestedAt: '2024-12-15T09:00:00Z',
      comments: 'Please review hardware quantities for kiosks. Requesting 2 more units.',
      approverDetails: {
        name: 'Sarah Johnson',
        role: 'Operations Director',
        department: 'Operations'
      }
    };
  } else if (status === 'rejected' as UnifiedSiteStatus) {
    baseSite.approval = {
      status: 'rejected',
      requestedAt: '2024-12-15T09:00:00Z',
      approvedAt: '2024-12-18T11:00:00Z',
      approvedBy: 'Sarah Johnson',
      comments: 'Budget constraints. Project on hold until next quarter.',
      approverDetails: {
        name: 'Sarah Johnson',
        role: 'Operations Director',
        department: 'Operations'
      }
    };
  }

  // Procurement data (available for procurement_done and beyond)
  if (['procurement_done', 'deployed', 'live'].includes(status)) {
    baseSite.procurement = {
      status: 'delivered',
      lastUpdated: '2025-01-05T10:00:00Z',
      softwareModules: [
        {
          name: 'POS System',
          status: 'delivered',
          orderDate: '2024-12-20',
          deliveryDate: '2024-12-28',
          licenseKey: 'POS-2024-001'
        },
        {
          name: 'Kiosk Software',
          status: 'delivered',
          orderDate: '2024-12-20',
          deliveryDate: '2024-12-28',
          licenseKey: 'KIO-2024-001'
        },
        {
          name: 'Kitchen Display',
          status: 'delivered',
          orderDate: '2024-12-20',
          deliveryDate: '2024-12-28',
          licenseKey: 'KDS-2024-001'
        },
        {
          name: 'Inventory Management',
          status: 'delivered',
          orderDate: '2024-12-20',
          deliveryDate: '2024-12-28',
          licenseKey: 'INV-2024-001'
        }
      ],
      hardwareItems: [
        {
          name: 'POS Terminals',
          quantity: 4,
          status: 'delivered',
          orderDate: '2024-12-20',
          deliveryDate: '2025-01-03',
          trackingNumber: 'TRK-001-2024'
        },
        {
          name: 'Kiosk Displays',
          quantity: 2,
          status: 'delivered',
          orderDate: '2024-12-20',
          deliveryDate: '2025-01-03',
          trackingNumber: 'TRK-002-2024'
        },
        {
          name: 'Printers',
          quantity: 4,
          status: 'delivered',
          orderDate: '2024-12-20',
          deliveryDate: '2025-01-04',
          trackingNumber: 'TRK-003-2024'
        },
        {
          name: 'Cash Drawers',
          quantity: 2,
          status: 'delivered',
          orderDate: '2024-12-20',
          deliveryDate: '2025-01-04',
          trackingNumber: 'TRK-004-2024'
        }
      ],
      summary: {
        totalSoftwareModules: 4,
        totalHardwareItems: 4,
        inProgress: 0,
        completed: 8
      }
    };
  } else if (status === 'procurement' as UnifiedSiteStatus) {
    baseSite.procurement = {
      status: 'ordered',
      lastUpdated: '2025-01-01T10:00:00Z',
      softwareModules: [
        {
          name: 'POS System',
          status: 'ordered',
          orderDate: '2024-12-20'
        },
        {
          name: 'Kiosk Software',
          status: 'ordered',
          orderDate: '2024-12-20'
        }
      ],
      hardwareItems: [
        {
          name: 'POS Terminals',
          quantity: 4,
          status: 'ordered',
          orderDate: '2024-12-20',
          deliveryDate: '2025-01-10'
        },
        {
          name: 'Kiosk Displays',
          quantity: 2,
          status: 'ordered',
          orderDate: '2024-12-20',
          deliveryDate: '2025-01-10'
        }
      ],
      summary: {
        totalSoftwareModules: 2,
        totalHardwareItems: 2,
        inProgress: 4,
        completed: 0
      }
    };
  }

  // Deployment data (available for deployed and live)
  if (['deployed', 'live'].includes(status)) {
    baseSite.deployment = {
      status: 'completed',
      startDate: '2025-01-08',
      endDate: '2025-01-12',
      assignedEngineer: 'Alice Brown',
      notes: 'All hardware installed and software configured. Initial testing passed. Site ready for go-live.',
      progress: {
        overallProgress: 100,
        hardwareDelivered: 'completed',
        installation: 'completed',
        testing: 'completed'
      },
      timeline: {
        hardwareDelivery: '2025-01-05',
        installationStart: '2025-01-08',
        installationEnd: '2025-01-10',
        testingStart: '2025-01-11',
        testingEnd: '2025-01-12',
        goLiveDate: '2025-01-15'
      }
    };
  } else if (status === 'in_progress' as UnifiedSiteStatus) {
    baseSite.deployment = {
      status: 'in_progress',
      startDate: '2025-01-08',
      assignedEngineer: 'Alice Brown',
      notes: 'Deployment currently underway. POS terminals installed, working on kiosks.',
      progress: {
        overallProgress: 75,
        hardwareDelivered: 'completed',
        installation: 'in_progress',
        testing: 'pending'
      },
      timeline: {
        hardwareDelivery: '2025-01-05',
        installationStart: '2025-01-08',
        installationEnd: '2025-01-10',
        testingStart: '2025-01-11',
        testingEnd: '2025-01-12',
        goLiveDate: '2025-01-15'
      }
    };
  }

  // Go Live data (only for live status)
  if (status === 'live') {
    baseSite.goLive = {
      status: 'live',
      date: '2025-01-15',
      signedOffBy: 'Operations Director',
      notes: 'Site successfully launched. All systems operational. Staff training completed.',
      checklist: {
        hardwareInstallationComplete: 'completed',
        softwareConfigurationComplete: 'completed',
        staffTraining: 'completed',
        finalTesting: 'completed'
      },
      timeline: {
        targetGoLiveDate: '2025-01-15',
        finalTesting: '2 days before',
        staffTraining: '1 week before',
        systemHandover: 'Go-Live day'
      }
    };
  }

  return baseSite;
};

const SiteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { currentRole } = useAuth();
  const navigate = useNavigate();
  const { sites } = useSiteContext();
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStep, setSelectedStep] = useState(0);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0]));
  const [locationData, setLocationData] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [selectedOrganisation, setSelectedOrganisation] = useState<Organisation | null>(null);

  // Handler for layout images updates
  const handleLayoutImagesUpdated = (images: any[]) => {
    // Update local site state if needed
    if (site) {
      setSite({
        ...site
      });
    }
  };

  // Handler for step toggle
  const handleStepToggle = (stepIndex: number, isExpanded: boolean) => {
    const newExpandedSteps = new Set(expandedSteps);
    if (isExpanded) {
      newExpandedSteps.add(stepIndex);
    } else {
      newExpandedSteps.delete(stepIndex);
    }
    setExpandedSteps(newExpandedSteps);
  };

  // Handler for organisation selection
  const handleOrganisationChange = (organisationId: string) => {
    const selectedOrg = organisations.find(org => org.id === organisationId);
    if (selectedOrg) {
      setSelectedOrganisation(selectedOrg);
      
      // Auto-update sector and unit code based on selected organisation
      if (site) {
        setSite({
          ...site,
          organization: selectedOrg.name,
          sector: selectedOrg.sector,
          unitCode: `${selectedOrg.unitCodePrefix}001` // Generate unit code with prefix
        });
      }
    }
  };

  // Check if user has permission to access sites
  useEffect(() => {
    if (currentRole && !hasPermission(currentRole, 'view_sites')) {
      toast.error('You do not have permission to access the Sites panel');
      navigate('/dashboard');
    }
  }, [currentRole, navigate]);

  // Load organisations data - REPLACED WITH MOCK DATA
  useEffect(() => {
    // Mock organizations data
    const mockOrganisations: Organisation[] = [
      {
        id: '1',
        name: 'ASDA',
        sector: 'Retail',
        unitCodePrefix: 'AR'
      },
      {
        id: '2',
        name: 'HSBC',
        sector: 'Banking',
        unitCodePrefix: 'HB'
      },
      {
        id: '3',
        name: 'Compass Group',
        sector: 'Food Service',
        unitCodePrefix: 'CG'
      }
    ];
    
    setOrganisations(mockOrganisations);
  }, []); // Only run once on component mount

  // Set selected organisation when site changes
  useEffect(() => {
    if (site && organisations.length > 0) {
      const org = organisations.find(o => o.name === site.organization);
      if (org) {
        setSelectedOrganisation(org);
      }
    }
  }, [site, organisations]);

  // Load site data - GET ACTUAL SITE DATA FROM SITES LIST
  useEffect(() => {
    if (id) {
      console.log('Loading site data for ID:', id);

      // First try to get site from context (Sites list)
      const existingSite = sites.find(s => s.id === id);
      
      if (existingSite) {
        console.log('Found site in context:', existingSite);
        // Use basic site details from context and create mock data for the rest
        const mockSite: Site = createMockSiteWithStatus(id, existingSite.status as UnifiedSiteStatus);
        
        // Override with actual site data from context
        mockSite.name = existingSite.name;
        mockSite.organization = existingSite.organization || mockSite.organization;
        mockSite.sector = existingSite.sector || mockSite.sector;
        mockSite.unitCode = existingSite.unitCode || mockSite.unitCode;
        mockSite.goLiveDate = existingSite.goLiveDate || mockSite.goLiveDate;
        mockSite.priority = existingSite.priority || mockSite.priority;
        mockSite.assignedOpsManager = existingSite.assignedOpsManager || mockSite.assignedOpsManager;
        mockSite.assignedDeploymentEngineer = existingSite.assignedDeploymentEngineer || mockSite.assignedDeploymentEngineer;
        mockSite.notes = existingSite.notes || mockSite.notes;
        mockSite.description = existingSite.description || mockSite.description;
        
        setSite(mockSite);
        setSelectedStep(getStepperStepFromStatus(mockSite.status as UnifiedSiteStatus));
              setLoading(false);
        setIsMockSite(false);
            } else {
        // If not found in context, create mock data based on the ID
        console.log('Site not found in context, creating mock data for ID:', id);
        const mockSite: Site = createMockSiteWithStatus(id, 'Created');
          setSite(mockSite);
          setSelectedStep(getStepperStepFromStatus(mockSite.status as UnifiedSiteStatus));
          setLoading(false);
        setIsMockSite(true);
      }
    }
  }, [id, sites]);

  // Update document title when site is loaded
  useEffect(() => {
    if (site) {
      document.title = `${site.name} - SmartQ Launchpad`;
    }
    return () => {
      document.title = 'SmartQ Launchpad';
    };
  }, [site]);

  // Create stepper steps based on site status
  const [stepperSteps, setStepperSteps] = useState<EnhancedStepperStep[]>([]);
  const [manuallyUpdatedSteps, setManuallyUpdatedSteps] = useState(false);
  const [isMockSite, setIsMockSite] = useState(false);

  // Function to create stepper steps with dynamic status
  const createStepperSteps = (currentStatus: UnifiedSiteStatus): EnhancedStepperStep[] => {
    const steps: EnhancedStepperStep[] = [
      { id: 'create-site', label: 'Create Site', status: 'pending', description: 'Basic site information' },
      { id: 'site-study', label: 'Site Study', status: 'pending', description: 'Detailed assessment' },
      { id: 'scoping', label: 'Scoping', status: 'pending', description: 'Software & hardware definition' },
      { id: 'approval', label: 'Approval', status: 'pending', description: 'Management review' },
      { id: 'procurement', label: 'Procurement', status: 'pending', description: 'Order & delivery' },
      { id: 'deployment', label: 'Deployment', status: 'pending', description: 'Installation & configuration' },
      { id: 'go-live', label: 'Go Live', status: 'pending', description: 'Final launch' },
    ];

    const currentStepIndex = getStepperStepFromStatus(currentStatus);

    return steps.map((step, index) => {
      let status: 'completed' | 'current' | 'pending' | 'blocked' = 'pending';
      
      // Determine step status based on current site status
      if (index < currentStepIndex) {
        status = 'completed';
      } else if (index === currentStepIndex) {
        if (['rejected', 'on_hold', 'blocked'].includes(currentStatus)) {
          status = 'blocked';
        } else {
          status = 'current';
        }
      }
      
      // Enhanced status determination based on actual data availability
      const enhancedStep = { ...step, status };
      
      // Add specific status indicators based on site data
      switch (index) {
        case 0: // Create Site
          if (site?.siteCreation) {
            enhancedStep.status = 'completed';
          }
          break;
        case 1: // Site Study
          if (site?.siteStudy) {
            enhancedStep.status = 'completed';
          } else if (index === currentStepIndex) {
            enhancedStep.status = 'current';
          }
          break;
        case 2: // Scoping
          if (site?.scoping) {
            enhancedStep.status = 'completed';
          } else if (index === currentStepIndex) {
            enhancedStep.status = 'current';
          }
          break;
        case 3: // Approval
          if (site?.approval?.status === 'approved') {
            enhancedStep.status = 'completed';
          } else if (site?.approval?.status === 'rejected' || site?.approval?.status === 'changes_requested') {
            enhancedStep.status = 'blocked';
          } else if (index === currentStepIndex) {
            enhancedStep.status = 'current';
          }
          break;
        case 4: // Procurement
          if (site?.procurement?.status === 'delivered') {
            enhancedStep.status = 'completed';
          } else if (site?.procurement?.status === 'ordered') {
            enhancedStep.status = 'current';
          } else if (index === currentStepIndex) {
            enhancedStep.status = 'current';
          }
          break;
        case 5: // Deployment
          if (site?.deployment?.status === 'completed') {
            enhancedStep.status = 'completed';
          } else if (site?.deployment?.status === 'in_progress') {
            enhancedStep.status = 'current';
          } else if (index === currentStepIndex) {
            enhancedStep.status = 'current';
          }
          break;
        case 6: // Go Live
          if (site?.goLive?.status === 'live') {
            enhancedStep.status = 'completed';
          } else if (index === currentStepIndex) {
            enhancedStep.status = 'current';
          }
          break;
      }
      
      return enhancedStep;
    });
  };

  // Initialize stepper steps when site is loaded
  useEffect(() => {
    if (site) {
      const steps = createStepperSteps(site.status as UnifiedSiteStatus);
      setStepperSteps(steps);
    }
  }, [site]);

  // Function to get step icon based on index
  const getStepIcon = (index: number) => {
    switch (index) {
      case 0: return <Grid className="h-5 w-5" />; // Create Site
      case 1: return <FileText className="h-5 w-5" />; // Site Study
      case 2: return <ClipboardList className="h-5 w-5" />; // Define Scope
      case 3: return <CheckSquare className="h-5 w-5" />; // Approval
      case 4: return <ShoppingCart className="h-5 w-5" />; // Procurement
      case 5: return <Truck className="h-5 w-5" />; // Deployment
      case 6: return <CheckCircle className="h-5 w-5" />; // Go Live
      default: return <FileText className="h-5 w-5" />;
    }
  };

  // Function to get detailed step status information
  const getStepStatusInfo = (index: number): string => {
    switch (index) {
      case 0: // Create Site
        if (site?.siteCreation) {
          return `Site created on ${site.lastUpdated}. Contact: ${site.siteCreation.contactInfo.unitManagerName}`;
        }
        return 'Site creation pending';
      case 1: // Site Study
        if (site?.siteStudy) {
          return `Study completed. ${site.siteStudy.staffCapacity.employeeStrength} employees, ${site.siteStudy.staffCapacity.seatingCapacity} seats`;
        }
        return 'Site study pending';
      case 2: // Scoping
        if (site?.scoping) {
          const totalCost = site.scoping.costSummary?.totalInvestment || 0;
          return `Scoping approved. Total investment: £${totalCost.toLocaleString()}`;
        }
        return 'Scoping pending';
      case 3: // Approval
        if (site?.approval) {
          if (site.approval.status === 'approved') {
            return `Approved by ${site.approval.approvedBy} on ${new Date(site.approval.approvedAt).toLocaleDateString()}`;
          } else if (site.approval.status === 'rejected') {
            return `Rejected: ${site.approval.comments}`;
          } else if (site.approval.status === 'changes_requested') {
            return `Changes requested: ${site.approval.comments}`;
          }
        }
        return 'Approval pending';
      case 4: // Procurement
        if (site?.procurement) {
          if (site.procurement.status === 'delivered') {
            return `All items delivered. ${site.procurement.summary.completed} items completed`;
          } else if (site.procurement.status === 'ordered') {
            return `Items ordered. ${site.procurement.summary.inProgress} items in progress`;
          }
        }
        return 'Procurement pending';
      case 5: // Deployment
        if (site?.deployment) {
          if (site.deployment.status === 'completed') {
            return `Deployment completed on ${site.deployment.endDate}`;
          } else if (site.deployment.status === 'in_progress') {
            return `Deployment ${site.deployment.progress.overallProgress}% complete`;
          }
        }
        return 'Deployment pending';
      case 6: // Go Live
        if (site?.goLive) {
          return `Site live since ${site.goLive.date}. All systems operational`;
        }
        return 'Go live pending';
      default:
        return 'Step information unavailable';
    }
  };

  // Calculate costs for Scoping step
  const calculateHardwareCosts = () => {
    let totalCost = 0;
    site?.scoping?.selectedHardware?.forEach(item => {
      const hardware = hardwareItems.find(h => h.id === item.id);
      if (hardware) {
        totalCost += hardware.unitCost * item.quantity;
      }
    });
    return totalCost;
  };

  const calculateSoftwareSetupCosts = () => {
    let totalCost = 0;
    site?.scoping?.selectedSoftware?.forEach(softwareId => {
      const software = softwareModules.find(s => s.id === softwareId);
      if (software) {
        totalCost += software.setupFee;
      }
    });
    return totalCost;
  };

  const calculateTotalCAPEX = () => {
    return calculateHardwareCosts() + calculateSoftwareSetupCosts();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white/90">
        <div className="text-center">
          <Loader size="lg" />
          <p className="text-gray-600 mt-4">Loading site details...</p>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Site Not Found</h1>
          <p className="text-gray-600 mb-4">The requested site could not be found.</p>
          <Button onClick={() => navigate('/sites')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sites
          </Button>
        </div>
      </div>
    );
  }

  // Render content based on selected step
  const renderStepContent = () => {
    switch (selectedStep) {
      case 0: // Site Creation
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Site Creation</h2>
                <p className="text-gray-600 mt-1">Basic site information and configuration</p>
              </div>
            </div>
            
            {/* General Information Section */}
            <Card className="shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-blue-600" />
                  General Information
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Basic site details and organisation information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Basic Site Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                        <Label htmlFor="site-name">Site Name</Label>
                        <Input value={site.name} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                        <Label htmlFor="organization">Organization</Label>
                    <Input value={site.organization} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                        <Label htmlFor="sector">Sector</Label>
                    <Input value={site.sector} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                        <Label htmlFor="unit-code">Unit Code</Label>
                        <Input value={site.unitCode} readOnly className="bg-gray-50" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="target-live-date">Target Live Date</Label>
                    <Input value={site.goLiveDate} readOnly className="bg-gray-50" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Input value={site.priority} readOnly className="bg-gray-50" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Team Assignment</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ops-manager">Operations Manager</Label>
                        <Input value={site.assignedOpsManager} readOnly className="bg-gray-50" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deployment-engineer">Deployment Engineer</Label>
                        <Input value={site.assignedDeploymentEngineer} readOnly className="bg-gray-50" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information Section */}
            <Card className="shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-green-600" />
                  Contact Information
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Primary and additional contact details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Primary Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="unit-manager-name">Unit Manager Name</Label>
                        <Input value={site.siteCreation?.contactInfo?.unitManagerName || "Sarah Johnson"} readOnly className="bg-gray-50" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="job-title">Job Title</Label>
                        <Input value={site.siteCreation?.contactInfo?.jobTitle || "Operations Manager"} readOnly className="bg-gray-50" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit-manager-email">Email</Label>
                        <Input value={site.siteCreation?.contactInfo?.unitManagerEmail || "sarah.johnson@company.com"} readOnly className="bg-gray-50" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit-manager-mobile">Mobile</Label>
                        <Input value={site.siteCreation?.contactInfo?.unitManagerMobile || "+44 7700 900123"} readOnly className="bg-gray-50" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Additional Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="additional-contact-name">Additional Contact Name</Label>
                        <Input value={site.siteCreation?.contactInfo?.additionalContactName || "Mike Wilson"} readOnly className="bg-gray-50" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="additional-contact-email">Additional Contact Email</Label>
                        <Input value={site.siteCreation?.contactInfo?.additionalContactEmail || "mike.wilson@company.com"} readOnly className="bg-gray-50" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Information Section */}
            <Card className="shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-green-600" />
                  Location Information
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Site location and address details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Location Selection</h4>
                    
                    {/* Location Picker Component */}
                    <LocationPicker
                      onLocationSelect={(location) => {
                        // Update site location data when location is selected
                        if (site) {
                          setSite({
                            ...site,
                            siteCreation: {
                              ...site.siteCreation,
                              locationInfo: {
                                ...site.siteCreation?.locationInfo,
                                location: location.address,
                                latitude: location.lat,
                                longitude: location.lng
                              }
                            }
                          });
                        }
                      }}
                      initialLocation={site?.siteCreation?.locationInfo?.latitude && site?.siteCreation?.locationInfo?.longitude ? 
                        { lat: site.siteCreation.locationInfo.latitude, lng: site.siteCreation.locationInfo.longitude } : undefined
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Site Notes Section */}
            <Card className="shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-purple-600" />
                  Site Notes
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Additional site details and notes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="site-notes">Site Notes</Label>
                    <Textarea 
                      value={site.notes || site.siteCreation?.additionalNotes || "Full POS and Kiosk implementation for ASDA Redditch location. Site has good network infrastructure and power availability."}
                      readOnly 
                      className="bg-gray-50" 
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="additional-details">Additional Site Details</Label>
                    <Textarea 
                      value={site.siteCreation?.additionalNotes || "Kitchen area needs additional power outlets for POS terminals. Storage area available for hardware installation. Site is ready for deployment."}
                      readOnly 
                      className="bg-gray-50" 
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 1: // Site Study
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Site Study</h2>
                <p className="text-gray-600 mt-1">Comprehensive site assessment and deployment readiness</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Site Study
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export Report
                </Button>
                <Button size="sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark as Completed
                </Button>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Contact Information */}
              <Card className="shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5 text-blue-600" />
                    Contact Information
                </CardTitle>
                  <CardDescription className="text-gray-600">
                    Primary and additional contact details
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Primary Contact</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="primary-name">Name</Label>
                          <Input id="primary-name" value={site?.siteStudy?.contactInfo?.primaryContact?.name || "Sarah Johnson"} readOnly className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="primary-job-title">Job Title</Label>
                          <Input id="primary-job-title" value={site?.siteStudy?.contactInfo?.primaryContact?.jobTitle || "Operations Manager"} readOnly className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="primary-email">Email</Label>
                          <Input id="primary-email" value={site?.siteStudy?.contactInfo?.primaryContact?.email || "sarah.johnson@company.com"} readOnly className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="primary-mobile">Mobile</Label>
                          <Input id="primary-mobile" value={site?.siteStudy?.contactInfo?.primaryContact?.mobile || "+44 7700 900123"} readOnly className="bg-gray-50" />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Additional Contact</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="additional-contact-name">Additional Contact Name</Label>
                          <Input id="additional-contact-name" value={site?.siteStudy?.contactInfo?.additionalContact?.name || "John Smith"} readOnly className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="additional-contact-email">Additional Contact Email</Label>
                          <Input id="additional-contact-email" value={site?.siteStudy?.contactInfo?.additionalContact?.email || "john.smith@company.com"} readOnly className="bg-gray-50" />
                        </div>
                      </div>
                    </div>
                  </div>
              </CardContent>
            </Card>

              {/* Location & Delivery Information */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-green-600" />
                    Location & Delivery Information
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Access details and delivery requirements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Access Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="floor">Floor</Label>
                          <Input id="floor" value={site?.siteStudy?.infrastructure?.floor || "2nd Floor"} readOnly className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="security-restrictions">Security Restrictions</Label>
                          <Input id="security-restrictions" value={site?.siteStudy?.infrastructure?.securityRestrictions || "Security pass required for all visitors"} readOnly className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lift-access">Lift Access</Label>
                          <Select value={site?.siteStudy?.infrastructure?.liftAccess || "Available"} disabled>
                            <SelectTrigger className="bg-gray-50">
                              <SelectValue />
                            </SelectTrigger>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="delivery-window">Delivery Window</Label>
                          <Input id="delivery-window" value={site?.siteStudy?.infrastructure?.deliveryWindow || "10:00 AM - 2:00 PM"} readOnly className="bg-gray-50" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* IT & Power Infrastructure */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wifi className="mr-2 h-5 w-5 text-purple-600" />
                    IT & Power Infrastructure
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Network connectivity and power requirements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Network Infrastructure</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="lan-points">LAN Points</Label>
                          <Input id="lan-points" value={site?.siteStudy?.itInfrastructure?.lanPoints?.toString() || "8"} readOnly className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bandwidth">Bandwidth</Label>
                          <Input id="bandwidth" value={site?.siteStudy?.itInfrastructure?.bandwidth || "6 Mbps"} readOnly className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="wifi-available">Wi-Fi Available</Label>
                          <Select value={site?.siteStudy?.itInfrastructure?.wifiAvailable || "Yes"} disabled>
                            <SelectTrigger className="bg-gray-50">
                              <SelectValue />
                            </SelectTrigger>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="static-ip">Static IP</Label>
                          <Select value={site?.siteStudy?.itInfrastructure?.staticIp || "Provided"} disabled>
                            <SelectTrigger className="bg-gray-50">
                              <SelectValue />
                            </SelectTrigger>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Power Infrastructure</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="ups-power-pos">UPS Power (POS)</Label>
                          <Select value={site?.siteStudy?.itInfrastructure?.upsPowerPos || "Available"} disabled>
                            <SelectTrigger className="bg-gray-50">
                              <SelectValue />
                            </SelectTrigger>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ups-power-ceiling">UPS Power (Ceiling)</Label>
                          <Select value={site?.siteStudy?.itInfrastructure?.upsPowerCeiling || "Not Available"} disabled>
                            <SelectTrigger className="bg-gray-50">
                              <SelectValue />
                            </SelectTrigger>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Infrastructure Assessment */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="mr-2 h-5 w-5 text-orange-600" />
                    Infrastructure Assessment
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Site infrastructure and operational details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Location Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="site-address">Site Address</Label>
                          <Input id="site-address" value={site?.siteStudy?.infrastructure?.siteAddress || "Enter site address"} readOnly className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="site-postcode">Postcode</Label>
                          <Input id="site-postcode" value={site?.siteStudy?.infrastructure?.postcode || "CV3 4LF"} readOnly className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="site-region">Region</Label>
                          <Input id="site-region" value={site?.siteStudy?.infrastructure?.region || "West Midlands"} readOnly className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="site-country">Country</Label>
                          <Input id="site-country" value={site?.siteStudy?.infrastructure?.country || "United Kingdom"} readOnly className="bg-gray-50" />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Infrastructure Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="number-of-counters">Number of Counters</Label>
                          <Input id="number-of-counters" value={site?.siteStudy?.infrastructure?.numberOfCounters?.toString() || "4"} readOnly className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="floor-plan-available">Floor Plan Available</Label>
                          <Select value={site?.siteStudy?.infrastructure?.floorPlanAvailable ? "Yes" : "No"} disabled>
                            <SelectTrigger className="bg-gray-50">
                              <SelectValue />
                            </SelectTrigger>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="meal-sessions">Meal Sessions</Label>
                          <Input id="meal-sessions" value={site?.siteStudy?.infrastructure?.mealSessions?.join(", ") || "Breakfast, Lunch, Dinner"} readOnly className="bg-gray-50" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Staff & Capacity Planning */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5 text-indigo-600" />
                    Staff & Capacity Planning
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Employee numbers and operational capacity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Staff Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="employee-strength">Employee Strength</Label>
                          <Input id="employee-strength" value={site?.siteStudy?.staffCapacity?.employeeStrength?.toString() || "Enter employee count"} readOnly className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="kitchen-staff">Kitchen Staff</Label>
                          <Input id="kitchen-staff" value={site?.siteStudy?.staffCapacity?.kitchenStaff?.toString() || "15"} readOnly className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="service-staff">Service Staff</Label>
                          <Input id="service-staff" value={site?.siteStudy?.staffCapacity?.serviceStaff?.toString() || "8"} readOnly className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="management">Management</Label>
                          <Input id="management" value={site?.siteStudy?.staffCapacity?.management?.toString() || "3"} readOnly className="bg-gray-50" />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Operational Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="operating-hours">Operating Hours</Label>
                          <Input id="operating-hours" value={site?.siteStudy?.staffCapacity?.operatingHours || "7:00 AM - 6:00 PM"} readOnly className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="operating-days">Operating Days</Label>
                          <Input id="operating-days" value={site?.siteStudy?.staffCapacity?.operatingDays || "Monday - Friday"} readOnly className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expected-footfall">Expected Footfall</Label>
                          <Input id="expected-footfall" value={site?.siteStudy?.staffCapacity?.expectedFootfall?.toString() || "800"} readOnly className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="seating-capacity">Seating Capacity</Label>
                          <Input id="seating-capacity" value={site?.siteStudy?.staffCapacity?.seatingCapacity?.toString() || "300"} readOnly className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="peak-hours">Peak Hours</Label>
                          <Input id="peak-hours" value={site?.siteStudy?.staffCapacity?.peakHours || "12:00 PM - 2:00 PM"} readOnly className="bg-gray-50" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Software Scoping */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Monitor className="mr-2 h-5 w-5 text-cyan-600" />
                    Software Scoping
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Define software requirements and solutions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">SmartQ Solutions</h4>
                      <div className="space-y-3">
                        {[
                          { id: 'pos-system', name: 'SmartQ POS Pro', description: 'Advanced point-of-sale system with inventory management' },
                          { id: 'kiosk-software', name: 'Self-Service Kiosk Suite', description: 'Touch-screen kiosk software for customer interactions' },
                          { id: 'kitchen-display', name: 'Kitchen Display System', description: 'Real-time order management for kitchen staff' },
                          { id: 'inventory-management', name: 'Inventory Management Pro', description: 'Comprehensive inventory tracking and forecasting' },
                          { id: 'payment-gateway', name: 'Payment Gateway', description: 'Secure payment processing integration' },
                          { id: 'analytics-dashboard', name: 'Analytics Dashboard', description: 'Business intelligence and reporting platform' }
                        ].map((software) => (
                          <div key={software.id} className="flex items-start space-x-3">
                            <Checkbox
                              id={software.id}
                              checked={site?.siteStudy?.softwareScoping?.selectedSolutions?.includes(software.id)}
                              disabled
                              className="mt-1"
                            />
                            <div>
                              <Label htmlFor={software.id} className="text-sm font-medium">
                                {software.name}
                              </Label>
                              <p className="text-xs text-gray-500">{software.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 2: // Scoping
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Scoping</h2>
                <p className="text-gray-600 mt-1">Select software and hardware requirements for the site</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Scoping
                </Button>
                <Button size="sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark as Completed
                </Button>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Software Selection */}
              <Card className="shadow-sm border border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                    <Monitor className="mr-2 h-5 w-5 text-blue-600" />
                      Software Selection
                    </CardTitle>
                  <CardDescription className="text-gray-600">
                    Choose software modules to automatically get hardware recommendations
                  </CardDescription>
                  </CardHeader>
                  <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Available Software Modules</h4>
                      <div className="space-y-4">
                      {softwareModules.map((software) => (
                          <div key={software.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Checkbox 
                                id={software.id} 
                                checked={site?.scoping?.selectedSoftware?.includes(software.id)}
                                disabled
                              />
                              <div>
                                <Label htmlFor={software.id} className="text-sm font-medium">
                                  {software.name}
                                </Label>
                                <p className="text-xs text-gray-500">{software.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">£{software.monthlyFee}/month</p>
                              <p className="text-xs text-gray-500">£{software.setupFee} setup</p>
                            </div>
                        </div>
                      ))}
                      </div>
                    </div>
                    </div>
                  </CardContent>
                </Card>

              {/* Hardware Requirements */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="mr-2 h-5 w-5 text-orange-600" />
                    Hardware Requirements
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Automatically recommended based on your software selections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
              <div>
                      <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Recommended Hardware</h4>
                      {site?.scoping?.selectedHardware && site.scoping.selectedHardware.length > 0 ? (
                        <div className="space-y-3">
                          {site.scoping.selectedHardware.map((item) => {
                            const hardware = hardwareItems.find(h => h.id === item.id);
                            return (
                              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                  <p className="font-medium">{hardware?.name}</p>
                                  <p className="text-sm text-gray-600">{hardware?.description}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">Qty: {item.quantity}</p>
                                  <p className="text-sm text-gray-600">£{hardware?.unitCost?.toLocaleString()}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">Select software modules to see hardware recommendations</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cost Summary */}
              <Card className="shadow-sm border border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-green-600" />
                      Cost Summary
                    </CardTitle>
                  <CardDescription className="text-gray-600">
                    Real-time cost calculations
                  </CardDescription>
                  </CardHeader>
                  <CardContent>
                  <div className="space-y-6">
                    {/* Capital Expenditure (CAPEX) */}
                    <div>
                      <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Capital Expenditure (CAPEX)</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Hardware</span>
                        <span>£{calculateHardwareCosts().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Software Setup</span>
                        <span>£{calculateSoftwareSetupCosts().toLocaleString()}</span>
                      </div>
                        <div className="flex justify-between">
                          <span>Installation</span>
                          <span>£{site?.scoping?.costSummary?.installationCost?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Contingency (15%)</span>
                          <span>£{site?.scoping?.costSummary?.contingencyCost?.toLocaleString() || '0'}</span>
                        </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total CAPEX</span>
                          <span>£{site?.scoping?.costSummary?.totalCapex?.toLocaleString() || calculateTotalCAPEX().toLocaleString()}</span>
                      </div>
                      </div>
                    </div>

                    {/* Operating Expenditure (OPEX) */}
                    <div>
                      <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Operating Expenditure (OPEX)</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Monthly Software Fees</span>
                          <span>£{site?.scoping?.costSummary?.monthlySoftwareFees?.toLocaleString() || '0'}/month</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Maintenance</span>
                          <span>£{site?.scoping?.costSummary?.maintenanceCost?.toLocaleString() || '0'}/month</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-medium">
                          <span>Total Monthly OPEX</span>
                          <span>£{site?.scoping?.costSummary?.totalMonthlyOpex?.toLocaleString() || '0'}/month</span>
                        </div>
                      </div>
                    </div>

                    {/* Total Investment */}
                    <div>
                      <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Total Investment</h4>
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total Investment</span>
                        <span>£{site?.scoping?.costSummary?.totalInvestment?.toLocaleString() || '0'}</span>
                      </div>
                    </div>

                    <Button className="w-full mt-4">
                      <FileCheck className="h-4 w-4 mr-1" />
                      Save & Submit for Approval
                    </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
          </div>
        );

      case 3: // Approval
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Approval</h2>
                <p className="text-gray-600 mt-1">Review and final approval for site progression</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Approval
                </Button>
                <Button size="sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark as Completed
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Approval Status Overview */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Handshake className="mr-2 h-5 w-5 text-indigo-600" />
                    Approval Status
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Current status of the site approval process
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <div>
                          <p className="font-semibold text-green-800">Approval Status</p>
                          <p className="text-sm text-green-600">Ready for review</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border border-green-200">
                        {site?.approval?.status ? site.approval.status.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Pending'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="requestedDate" className="text-sm font-medium text-gray-700">Requested Date</Label>
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <p className="text-sm text-gray-900">{site?.approval?.requestedAt ? new Date(site.approval.requestedAt).toLocaleDateString() : 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="approvedDate" className="text-sm font-medium text-gray-700">Approved/Rejected Date</Label>
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <p className="text-sm text-gray-900">{site?.approval?.approvedAt ? new Date(site.approval.approvedAt).toLocaleDateString() : 'Pending'}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="approvedBy" className="text-sm font-medium text-gray-700">Approved/Rejected By</Label>
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <p className="text-sm text-gray-900">{site?.approval?.approvedBy || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="approvalRole" className="text-sm font-medium text-gray-700">Approver Role</Label>
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <p className="text-sm text-gray-900">{site?.approval?.approverDetails?.role || 'Operations Director'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Approval Details */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5 text-blue-600" />
                    Approver Details
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Information about the approval authority
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-blue-900">{site?.approval?.approverDetails?.name || 'Sarah Johnson'}</p>
                          <p className="text-sm text-blue-700">{site?.approval?.approverDetails?.role || 'Operations Director'}</p>
                        </div>
                      </div>
                      <div className="text-sm text-blue-800">
                        <p><strong>Department:</strong> {site?.approval?.approverDetails?.department || 'Operations'}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Approval Authority</span>
                        <Badge className="bg-blue-100 text-blue-800">Final Decision</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Review Level</span>
                        <Badge className="bg-purple-100 text-purple-800">Management</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Response Time</span>
                        <Badge className="bg-green-100 text-green-800">Within 48h</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Approval Comments */}
            <Card className="shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-purple-600" />
                  Approval Comments
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Feedback and reasons for approval or rejection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-purple-900 mb-2">Review Comments</p>
                        <div className="p-3 bg-white rounded-lg border">
                          <p className="text-sm text-gray-800">
                            {site?.approval?.comments || 'All requirements met. Budget approved. Proceed with procurement. Site infrastructure assessment completed successfully.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Budget Approved</span>
                      </div>
                      <p className="text-xs text-green-700">All financial requirements met</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Technical Review</span>
                      </div>
                      <p className="text-xs text-blue-700">Infrastructure assessment passed</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">Timeline Approved</span>
                      </div>
                      <p className="text-xs text-purple-700">Deployment schedule confirmed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Approval Actions */}
            <div className="flex justify-end space-x-3">
              <Button variant="outline" className="border-gray-300 hover:border-gray-400">
                <Download className="h-4 w-4 mr-2" />
                Export Approval Report
              </Button>
              <Button variant="outline" className="border-blue-300 hover:border-blue-400">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Approval Notification
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Site
              </Button>
            </div>
          </div>
        );

      case 4: // Procurement
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Procurement</h2>
                <p className="text-gray-600 mt-1">Equipment and materials acquisition process</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
                <Button size="sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark as Completed
                </Button>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Procurement Overview */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="mr-2 h-5 w-5 text-blue-600" />
                    Procurement Status
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Overall progress of equipment acquisition
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Progress Overview</h4>
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                          <div>
                            <p className="font-semibold text-blue-800">Procurement Progress</p>
                            <p className="text-sm text-blue-600">In progress - 75% complete</p>
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 border border-blue-200">
                          {site?.procurement?.status ? site.procurement.status.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'In Progress'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Item Status</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">Total Items</span>
                          <Badge className="bg-gray-100 text-gray-800">12</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">Ordered</span>
                          <Badge className="bg-green-100 text-green-800">9</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">Delivered</span>
                          <Badge className="bg-blue-100 text-blue-800">6</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">Pending</span>
                          <Badge className="bg-yellow-100 text-yellow-800">3</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Budget Summary */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-green-600" />
                    Budget Summary
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Financial overview of procurement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Financial Overview</h4>
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-green-800">Total Budget</span>
                          <span className="text-lg font-bold text-green-900">$45,000</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-800">Spent</span>
                          <span className="text-lg font-bold text-green-900">$33,750</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-green-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-green-800">Remaining</span>
                            <span className="text-lg font-bold text-green-900">$11,250</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Progress Tracking</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-xs text-gray-600">Progress</span>
                          <span className="text-xs font-medium text-gray-800">75%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-purple-600" />
                    Procurement Timeline
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Key dates and milestones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Key Milestones</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-800">Procurement Started</p>
                            <p className="text-xs text-green-600">Dec 15, 2024</p>
                          </div>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-800">Orders Placed</p>
                            <p className="text-xs text-blue-600">Dec 20, 2024</p>
                          </div>
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-yellow-800">First Delivery</p>
                            <p className="text-xs text-yellow-600">Jan 5, 2025</p>
                          </div>
                          <Clock className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600">All Items Delivered</p>
                            <p className="text-xs text-gray-500">Jan 15, 2025</p>
                          </div>
                          <Clock className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Procurement Items */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="mr-2 h-5 w-5 text-orange-600" />
                    Procurement Items
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Detailed list of equipment and materials being procured
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Equipment List</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Item 1 */}
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Package className="h-5 w-5 text-green-600" />
                              <h4 className="font-semibold text-green-900">Antenna System</h4>
                            </div>
                            <Badge className="bg-green-100 text-green-800">Delivered</Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-green-700">Quantity:</span>
                              <span className="text-green-900 font-medium">2 units</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-700">Cost:</span>
                              <span className="text-green-900 font-medium">$8,500</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-700">Supplier:</span>
                              <span className="text-green-900 font-medium">TechCorp</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-700">Delivery:</span>
                              <span className="text-green-900 font-medium">Jan 3, 2025</span>
                            </div>
                          </div>
                        </div>

                        {/* Item 2 */}
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Package className="h-5 w-5 text-blue-600" />
                              <h4 className="font-semibold text-blue-900">Power Supply Units</h4>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800">Ordered</Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-blue-700">Quantity:</span>
                              <span className="text-blue-900 font-medium">4 units</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-blue-700">Cost:</span>
                              <span className="text-blue-900 font-medium">$6,200</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-blue-700">Supplier:</span>
                              <span className="text-blue-900 font-medium">PowerTech</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-blue-700">Delivery:</span>
                              <span className="text-blue-900 font-medium">Jan 8, 2025</span>
                            </div>
                          </div>
                        </div>

                        {/* Item 3 */}
                        <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Package className="h-5 w-5 text-yellow-600" />
                              <h4 className="font-semibold text-yellow-900">Cabling & Connectors</h4>
                            </div>
                            <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-yellow-700">Quantity:</span>
                              <span className="text-yellow-900 font-medium">1 lot</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-yellow-700">Cost:</span>
                              <span className="text-yellow-900 font-medium">$2,800</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-yellow-700">Supplier:</span>
                              <span className="text-yellow-900 font-medium">CablePro</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-yellow-700">Delivery:</span>
                              <span className="text-yellow-900 font-medium">Jan 12, 2025</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Procurement Actions */}
              <div className="flex justify-end space-x-3">
                <Button variant="outline" className="border-gray-300 hover:border-gray-400">
                  <Download className="h-4 w-4 mr-2" />
                  Export Procurement Report
                </Button>
                <Button variant="outline" className="border-blue-300 hover:border-blue-400">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Procurement Item
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Update Procurement Status
                </Button>
              </div>
            </div>
          </div>
        );

      case 5: // Deployment
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Deployment</h2>
                <p className="text-gray-600 mt-1">Hardware installation and system deployment</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Update Progress
                </Button>
                <Button size="sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark as Completed
                </Button>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Deployment Progress */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Progress className="mr-2 h-5 w-5 text-blue-600" />
                    Deployment Progress
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Current deployment status and progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Overall Progress</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Overall Progress</span>
                          <span>{site?.deployment?.progress?.overallProgress || 0}%</span>
                        </div>
                        <Progress value={site?.deployment?.progress?.overallProgress || 0} className="h-2" />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Task Status</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="font-medium">Hardware Delivered</p>
                              <p className="text-sm text-gray-600">All hardware received on site</p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Completed</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Clock className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium">Installation In Progress</p>
                              <p className="text-sm text-gray-600">POS terminals being installed</p>
                            </div>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <AlertCircle className="h-5 w-5 text-gray-600" />
                            <div>
                              <p className="font-medium">Testing Pending</p>
                              <p className="text-sm text-gray-600">System testing and validation</p>
                            </div>
                          </div>
                          <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Deployment Details */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarDays className="mr-2 h-5 w-5 text-cyan-600" />
                    Deployment Details
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Key deployment information and timeline
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Team Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="deployment-engineer">Deployment Engineer</Label>
                          <Input id="deployment-engineer" value={site?.deployment?.assignedEngineer || ""} readOnly className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="deployment-team">Deployment Team</Label>
                          <Input id="deployment-team" value="" readOnly className="bg-gray-50" />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Timeline Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start-date">Start Date</Label>
                          <Input id="start-date" value={site?.deployment?.startDate ? new Date(site.deployment.startDate).toLocaleDateString() : "20th January 2025"} readOnly className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expected-completion">Expected Completion</Label>
                          <Input id="expected-completion" value={site?.deployment?.endDate ? new Date(site.deployment.endDate).toLocaleDateString() : "25th January 2025"} readOnly className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="current-phase">Current Phase</Label>
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-blue-100 text-blue-800">Installation</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Deployment Timeline */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-purple-600" />
                    Deployment Timeline
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Key milestones and dates for the deployment process
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Key Milestones</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Package className="h-4 w-4 text-green-600" />
                            <span className="font-medium">Hardware Delivery</span>
                          </div>
                          <p className="text-sm text-gray-600">{site?.deployment?.timeline?.hardwareDelivery || "2025-01-05"}</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Settings className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">Installation Start</span>
                          </div>
                          <p className="text-sm text-gray-600">{site?.deployment?.timeline?.installationStart || "2025-01-08"}</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="font-medium">Installation End</span>
                          </div>
                          <p className="text-sm text-gray-600">{site?.deployment?.timeline?.installationEnd || "2025-01-10"}</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <ListChecks className="h-4 w-4 text-purple-600" />
                            <span className="font-medium">Testing Start</span>
                          </div>
                          <p className="text-sm text-gray-600">{site?.deployment?.timeline?.testingStart || "2025-01-11"}</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <CheckCheck className="h-4 w-4 text-green-600" />
                            <span className="font-medium">Testing End</span>
                          </div>
                          <p className="text-sm text-gray-600">{site?.deployment?.timeline?.testingEnd || "2025-01-12"}</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Award className="h-4 w-4 text-yellow-600" />
                            <span className="font-medium">Go Live Date</span>
                          </div>
                          <p className="text-sm text-gray-600">{site?.deployment?.timeline?.goLiveDate || "2025-01-15"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-right">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Update Progress
                </Button>
              </div>
            </div>
          </div>
        );

      case 6: // Go Live
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Go-Live</h2>
                <p className="text-gray-600 mt-1">Final system activation and go-live preparation</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Update Go-Live Status
                </Button>
                <Button size="sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark as Completed
                </Button>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Go-Live Checklist */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ListChecks className="mr-2 h-5 w-5 text-green-600" />
                    Go-Live Checklist
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Final verification checklist before going live
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Pre-Launch Tasks</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="font-medium">Hardware Installation Complete</p>
                              <p className="text-sm text-gray-600">All hardware installed and tested</p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Completed</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="font-medium">Software Configuration Complete</p>
                              <p className="text-sm text-gray-600">All software modules configured</p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Completed</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Clock className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium">Staff Training</p>
                              <p className="text-sm text-gray-600">Team training in progress</p>
                            </div>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <AlertCircle className="h-5 w-5 text-gray-600" />
                            <div>
                              <p className="font-medium">Final Testing</p>
                              <p className="text-sm text-gray-600">End-to-end system testing</p>
                            </div>
                          </div>
                          <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Go-Live Timeline */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-purple-600" />
                    Go-Live Timeline
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Key dates and milestones for go-live
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Key Milestones</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <CalendarDays className="h-4 w-4 text-yellow-600" />
                            <div>
                              <p className="font-medium">Target Go-Live Date</p>
                              <p className="text-sm text-gray-600">{site?.goLive?.timeline?.targetGoLiveDate || "2025-09-01"}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <ListChecks className="h-4 w-4 text-purple-600" />
                            <div>
                              <p className="font-medium">Final Testing</p>
                              <p className="text-sm text-gray-600">{site?.goLive?.timeline?.finalTesting || "2 days before"}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Users className="h-4 w-4 text-blue-600" />
                            <div>
                              <p className="font-medium">Staff Training</p>
                              <p className="text-sm text-gray-600">{site?.goLive?.timeline?.staffTraining || "1 week before"}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Handshake className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="font-medium">System Handover</p>
                              <p className="text-sm text-gray-600">{site?.goLive?.timeline?.systemHandover || "Go-Live day"}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Go-Live Details */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="mr-2 h-5 w-5 text-yellow-600" />
                    Go-Live Details
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Final confirmation and sign-off information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Go-Live Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="go-live-date">Go-Live Date</Label>
                          <Input id="go-live-date" value={site?.goLive?.date ? new Date(site.goLive.date).toLocaleDateString() : ""} readOnly className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signed-off-by">Signed Off By</Label>
                          <Input id="signed-off-by" value={site?.goLive?.signedOffBy || ""} readOnly className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="go-live-status">Status</Label>
                          <Badge className={getStatusColor(site?.goLive?.status || 'pending')}>
                            {site?.goLive?.status ? site.goLive.status.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Additional Notes</h4>
                      <div className="space-y-2">
                        <Label htmlFor="go-live-notes">Notes</Label>
                        <Textarea
                          id="go-live-notes"
                          value={site?.goLive?.notes || ""}
                          readOnly
                          rows={3}
                          className="bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Site Information</CardTitle>
              <CardDescription>Select a step from the workflow above to view details.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Select a step from the workflow above to view details.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/sites" className="flex items-center space-x-1 hover:text-gray-900">
          <Home className="h-4 w-4" />
          <span>Sites</span>
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">{site.name}</span>
      </nav>

      {/* Header with Status */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-gray-900">{site.name}</h1>
            {site && (
              <Badge className={`${getStatusColor(site.status)}`}>
                {getStatusDisplayName(site.status)}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-4 mt-2">
            <p className="text-gray-600">
              Sector - <span className="font-medium">{site.sector}</span> | 
              Organization - <span className="font-medium">{site.organization}</span> | 
              Target Date - <span className="font-medium">{site.goLiveDate}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowNotesModal(true)}
            className="flex items-center space-x-2"
          >
            <StickyNote className="h-4 w-4" />
            <span>Site Notes</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/sites')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Sites</span>
          </Button>
        </div>
      </div>

      {/* Modern Enhanced Stepper Flow Widget */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6">
        {/* Progress Overview */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Site Progress</h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-700">
              {Math.round(((stepperSteps.filter(step => step.status === 'completed').length) / stepperSteps.length) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Complete</div>
          </div>
        </div>
        
        {/* Modern Stepper with Enhanced Visual Design */}
        <div className="relative">
          <div className="flex items-center justify-between space-x-4">
            {stepperSteps.map((step, index) => (
              <div
                key={step.id}
                className={`flex-1 flex flex-col items-center cursor-pointer group relative z-10 ${
                  index <= selectedStep ? 'text-slate-700' : 'text-gray-400'
                }`}
                onClick={() => setSelectedStep(index)}
              >
                {/* Enhanced Step Icon with Modern Design */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 mb-3 relative
                    ${step.status === 'completed' ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-lg shadow-emerald-200 scale-105' : ''}
                    ${step.status === 'current' ? 'bg-gradient-to-br from-slate-500 to-slate-600 text-white shadow-xl shadow-slate-300 scale-110 ring-2 ring-slate-200' : ''}
                    ${step.status === 'pending' ? 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-400 border border-gray-200 hover:scale-105 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-600 transition-all duration-200' : ''}
                    ${step.status === 'blocked' ? 'bg-gradient-to-br from-red-400 to-red-500 text-white shadow-lg shadow-red-200' : ''}
                  `}
                  title={getStepStatusInfo(index)}
                >
                  {/* Step Icon */}
                  <div className="relative">
                    {step.status === 'completed' && <CheckCircle className="h-5 w-5" />}
                    {step.status === 'current' && getStepIcon(index)}
                    {step.status === 'pending' && getStepIcon(index)}
                    {step.status === 'blocked' && <AlertCircle className="h-5 w-5" />}
                  </div>
                  
                  {/* Subtle Pulse Animation for Current Step */}
                  {step.status === 'current' && (
                    <div className="absolute inset-0 rounded-full bg-slate-400 animate-ping opacity-10"></div>
                  )}
                  
                  {/* Status Indicator Badge */}
                  {step.status === 'blocked' && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-2 w-2 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Enhanced Step Label */}
                <div className="text-center max-w-24">
                  <span className={`block text-sm font-medium transition-colors duration-200 ${
                    step.status === 'current' ? 'text-slate-700' : 'group-hover:text-slate-600'
                  }`}>
                    {step.label}
                  </span>
                  {/* Status Indicator */}
                  {step.status === 'blocked' && (
                    <span className="block text-xs text-red-600 mt-1">⚠ Blocked</span>
                  )}
                  {step.status === 'current' && (
                    <span className="block text-xs text-slate-600 mt-1">● Active</span>
                  )}
                </div>
                
                {/* Progress Indicator Line */}
                {index < stepperSteps.length - 1 && (
                  <div className="absolute top-6 left-full w-full h-0.5 transform -translate-y-1/2 z-0">
                    <div className={`h-full rounded-full transition-all duration-300 ${
                      index < selectedStep 
                        ? 'bg-gradient-to-r from-slate-500 to-slate-400' 
                        : 'bg-gradient-to-r from-gray-200 to-gray-300'
                    }`}></div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Progress Bar Background */}
          <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-100 rounded-full -z-20"></div>
        </div>
      </div>

      {/* Step Content */}
      <div className="space-y-6">
        {renderStepContent()}
      </div>

      {/* Global Site Notes Modal */}
      {site && (
        <GlobalSiteNotesModal
          isOpen={showNotesModal}
          onClose={() => setShowNotesModal(false)}
          siteId={site.id}
          siteName={site.name}
        />
      )}
    </div>
  );
};

export default SiteDetail;
