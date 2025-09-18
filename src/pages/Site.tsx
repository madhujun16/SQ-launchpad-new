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
// Import step components
import CreateSiteStep from '@/components/siteSteps/CreateSiteStep';
import SiteStudyStep from '@/components/siteSteps/SiteStudyStep';
import ScopingStep from '@/components/siteSteps/ScopingStep';
import ApprovalStep from '@/components/siteSteps/ApprovalStep';
import ProcurementStep from '@/components/siteSteps/ProcurementStep';
import DeploymentStep from '@/components/siteSteps/DeploymentStep';
import GoLiveStep from '@/components/siteSteps/GoLiveStep';
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
const createMockSiteWithStatus = (id: string, status: UnifiedSiteStatus, siteData?: any): Site => {
  const baseSite: Site = {
    id: id,
    name: siteData?.name || `Site ${id.slice(0, 8)}`,
    organization: siteData?.organization_name || 'Unknown Organization',
    foodCourt: siteData?.name || `Site ${id.slice(0, 8)}`,
    unitCode: siteData?.unit_code || `UNIT-${id.slice(0, 8)}`,
    sector: siteData?.sector || 'Retail',
    goLiveDate: siteData?.target_live_date || '2025-12-31',
    priority: siteData?.criticality_level || 'medium',
    riskLevel: 'medium',
    criticality: siteData?.criticality_level || 'medium',
    status: status,
    assignedOpsManager: siteData?.assigned_ops_manager || 'TBD',
    assignedDeploymentEngineer: siteData?.assigned_deployment_engineer || 'TBD',
    stakeholders: [
      { id: '1', name: siteData?.unit_manager_name || 'Site Manager', role: 'Unit Manager', email: siteData?.unit_manager_email || 'manager@site.com', phone: siteData?.unit_manager_mobile || '+44 20 7123 4567', organization: siteData?.organization_name || 'Organization' },
      { id: '2', name: siteData?.additional_contact_name || 'IT Contact', role: 'IT Manager', email: siteData?.additional_contact_email || 'it@site.com', phone: '+44 20 7123 4568', organization: siteData?.organization_name || 'Organization' }
    ],
    notes: `Implementation for ${siteData?.name || 'site'} location`,
    lastUpdated: siteData?.updated_at ? new Date(siteData.updated_at).toISOString().split('T')[0] : '2024-12-30',
    description: `Full POS and Kiosk implementation for ${siteData?.name || 'site'} location`,
  };

  // Site Creation data (always available)
  baseSite.siteCreation = {
    contactInfo: {
      unitManagerName: siteData?.unit_manager_name || 'Site Manager',
      jobTitle: siteData?.job_title || 'Operations Manager',
      unitManagerEmail: siteData?.unit_manager_email || 'manager@site.com',
      unitManagerMobile: siteData?.unit_manager_mobile || '+44 7700 900123',
      additionalContactName: siteData?.additional_contact_name || 'IT Contact',
      additionalContactEmail: siteData?.additional_contact_email || 'it@site.com'
    },
    locationInfo: {
      location: `${siteData?.name || 'Site'}, ${siteData?.location || 'Location'}`,
      postcode: siteData?.postcode || 'POSTCODE',
      region: siteData?.region || 'Region',
      country: siteData?.country || 'United Kingdom',
      latitude: siteData?.latitude || 52.3067,
      longitude: siteData?.longitude || -1.9456
    },
    additionalNotes: 'Kitchen area needs additional power outlets for POS terminals. Storage area available for hardware installation.'
  };

  // Site Study data (available for site_study_done and beyond)
  if (['site_study_done', 'scoping_done', 'approved', 'procurement_done', 'deployed', 'live'].includes(status)) {
    baseSite.siteStudy = {
      contactInfo: {
        primaryContact: {
          name: siteData?.unit_manager_name || 'Site Manager',
          jobTitle: siteData?.job_title || 'Operations Manager',
          email: siteData?.unit_manager_email || 'manager@site.com',
          mobile: siteData?.unit_manager_mobile || '+44 7700 900123'
        },
        additionalContact: {
          name: siteData?.additional_contact_name || 'IT Contact',
          email: siteData?.additional_contact_email || 'it@site.com'
        }
      },
      infrastructure: {
        siteAddress: `${siteData?.name || 'Site'}, ${siteData?.location || 'Location'}`,
        postcode: siteData?.postcode || 'POSTCODE',
        region: siteData?.region || 'Region',
        country: siteData?.country || 'United Kingdom',
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
      startDate: '2025-11-08',
      endDate: '2025-11-12',
      assignedEngineer: 'Alice Brown',
      notes: 'All hardware installed and software configured. Initial testing passed. Site ready for go-live.',
      progress: {
        overallProgress: 100,
        hardwareDelivered: 'completed',
        installation: 'completed',
        testing: 'completed'
      },
      timeline: {
        hardwareDelivery: '2025-11-05',
        installationStart: '2025-11-08',
        installationEnd: '2025-11-10',
        testingStart: '2025-11-11',
        testingEnd: '2025-11-12',
        goLiveDate: '2025-11-15'
      }
    };
  } else if (status === 'in_progress' as UnifiedSiteStatus) {
    baseSite.deployment = {
      status: 'in_progress',
      startDate: '2025-11-08',
      assignedEngineer: 'Alice Brown',
      notes: 'Deployment currently underway. POS terminals installed, working on kiosks.',
      progress: {
        overallProgress: 75,
        hardwareDelivered: 'completed',
        installation: 'in_progress',
        testing: 'pending'
      },
      timeline: {
        hardwareDelivery: '2025-11-05',
        installationStart: '2025-11-08',
        installationEnd: '2025-11-10',
        testingStart: '2025-11-11',
        testingEnd: '2025-11-12',
        goLiveDate: '2025-11-15'
      }
    };
  }

  // Go Live data (only for live status)
  if (status === 'live') {
    baseSite.goLive = {
      status: 'live',
      date: '2025-11-15',
      signedOffBy: 'Operations Director',
      notes: 'Site successfully launched. All systems operational. Staff training completed.',
      checklist: {
        hardwareInstallationComplete: 'completed',
        softwareConfigurationComplete: 'completed',
        staffTraining: 'completed',
        finalTesting: 'completed'
      },
      timeline: {
        targetGoLiveDate: '2025-11-15',
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
        console.log('Site data fields:', {
          name: existingSite.name,
          organization: existingSite.organization,
          organization_name: (existingSite as any).organization_name,
          location: (existingSite as any).location,
          postcode: (existingSite as any).postcode
        });
        // Use basic site details from context and create mock data for the rest
        const mockSite: Site = createMockSiteWithStatus(id, existingSite.status as UnifiedSiteStatus, existingSite);
        
        // Override with actual site data from context
        mockSite.name = existingSite.name;
        mockSite.organization = (existingSite as any).organization_name || existingSite.organization || mockSite.organization;
        mockSite.sector = (existingSite as any).sector || existingSite.sector || mockSite.sector;
        mockSite.unitCode = (existingSite as any).unit_code || existingSite.unitCode || mockSite.unitCode;
        mockSite.goLiveDate = (existingSite as any).target_live_date || existingSite.goLiveDate || mockSite.goLiveDate;
        mockSite.priority = (existingSite as any).criticality_level || existingSite.priority || mockSite.priority;
        mockSite.assignedOpsManager = (existingSite as any).assigned_ops_manager || existingSite.assignedOpsManager || mockSite.assignedOpsManager;
        mockSite.assignedDeploymentEngineer = (existingSite as any).assigned_deployment_engineer || existingSite.assignedDeploymentEngineer || mockSite.assignedDeploymentEngineer;
        mockSite.notes = (existingSite as any).notes || existingSite.notes || mockSite.notes;
        mockSite.description = (existingSite as any).description || existingSite.description || mockSite.description;
        
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
          const employeeStrength = site.siteStudy.staffCapacity?.employeeStrength || 'N/A';
          const seatingCapacity = site.siteStudy.staffCapacity?.seatingCapacity || 'N/A';
          return `Study completed. ${employeeStrength} employees, ${seatingCapacity} seats`;
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
        return <CreateSiteStep site={site} onSiteUpdate={setSite} />;

      case 1: // Site Study
        return <SiteStudyStep site={site} onSiteUpdate={setSite} />;

      case 2: // Scoping
        return <ScopingStep site={site} onSiteUpdate={setSite} />;

      case 3: // Approval
        return <ApprovalStep site={site} onSiteUpdate={setSite} />;

      case 4: // Procurement
        return <ProcurementStep site={site} onSiteUpdate={setSite} />;

      case 5: // Deployment
        return <DeploymentStep site={site} onSiteUpdate={setSite} />;

      case 6: // Go Live
        return <GoLiveStep site={site} onSiteUpdate={setSite} />;

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
