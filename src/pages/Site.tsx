import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/roles';
import { useSiteContext, type Site } from '@/contexts/SiteContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Stepper } from '@/components/ui/stepper';
import { 
  Building, 
  MapPin, 
  Search, 
  Plus, 
  Filter, 
  Calendar, 
  Users, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  Copy,
  MoreHorizontal,
  ArrowUpDown,
  FileText,
  Package,
  CheckCircle,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  Settings,
  Info,
  BarChart3,
  Wrench,
  Shield,
  ArrowLeft,
  ChevronRight,
  Home,
  User,
  Phone,
  Mail,
  Globe,
  Wifi,
  Zap,
  Monitor,
  Printer,
  Smartphone,
  Tv,
  Camera,
  Navigation,
  CheckSquare,
  Truck,
  ArrowRight,
  Upload,
  StickyNote
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
import { createStepperSteps, getStatusColor, getStatusDisplayName, getStepperStepFromStatus, type UnifiedSiteStatus } from '@/lib/siteTypes';
import { Checkbox } from '@/components/ui/checkbox';
import { LocationPicker } from '@/components/ui/location-picker';
import { getHardwareRecommendations, getRecommendationRules } from '@/services/platformConfiguration';
import { LayoutImageUpload } from '@/components/LayoutImageUpload';
import { GlobalSiteNotesModal } from '@/components/GlobalSiteNotesModal';
import { SitesService } from '@/services/sitesService';

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
  monthlyFee: number;
  setupFee: number;
  hardwareRequirements: string[];
}

// Mock data for software modules and hardware items
const softwareModules: SoftwareModule[] = [
  {
    id: 'pos-system',
    name: 'POS System',
    monthlyFee: 25,
    setupFee: 150,
    hardwareRequirements: ['pos-terminal', 'printer', 'cash-drawer']
  },
  {
    id: 'kiosk-software',
    name: 'Kiosk Software',
    monthlyFee: 20,
    setupFee: 100,
    hardwareRequirements: ['kiosk-display', 'touch-screen', 'printer']
  },
  {
    id: 'kitchen-display',
    name: 'Kitchen Display',
    monthlyFee: 20,
    setupFee: 100,
    hardwareRequirements: ['kitchen-display', 'printer']
  },
  {
    id: 'inventory-management',
    name: 'Inventory Management',
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

const SiteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { currentRole } = useAuth();
  const navigate = useNavigate();
  const { sites, setSites, setSelectedSite } = useSiteContext();
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStep, setSelectedStep] = useState(0);
  const [locationData, setLocationData] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);

  // Handler for layout images updates
  const handleLayoutImagesUpdated = (images: any[]) => {
    // Update local site state if needed
    if (site) {
      setSite({
        ...site,
        layout_images: images.map(img => img.url),
        layout_images_metadata: images.map(img => ({
          id: img.id,
          name: img.name,
          size: img.size,
          type: img.type,
          uploaded_at: img.uploaded_at
        }))
      });
    }
  };

  // Check if user has permission to access sites
  useEffect(() => {
    if (currentRole && !hasPermission(currentRole, 'view_sites')) {
      toast.error('You do not have permission to access the Sites panel');
      navigate('/dashboard');
    }
  }, [currentRole, navigate]);

  // Load site data
  useEffect(() => {
    if (id) {
      // First try to get site from context
      const existingSite = sites.find(s => s.id === id);
      
      if (existingSite) {
        setSite(existingSite);
        setSelectedStep(getStepperStepFromStatus(existingSite.status as UnifiedSiteStatus));
        setLoading(false);
      } else {
        // Try to load from database
        const loadSiteFromDatabase = async () => {
          try {
            const dbSites = await SitesService.getAllSites();
            const dbSite = dbSites.find(s => s.id === id);
            
            if (dbSite) {
              // Convert database site to context site format
              const contextSite: Site = {
                id: dbSite.id,
                name: dbSite.name,
                organization: dbSite.organization_name || 'Unknown Organization',
                foodCourt: dbSite.location || 'Unknown Location',
                unitCode: 'N/A', // Not available in database schema
                sector: 'Eurest', // Default sector
                goLiveDate: dbSite.target_live_date || '2024-12-31',
                priority: 'medium',
                riskLevel: 'medium',
                status: dbSite.status as UnifiedSiteStatus,
                assignedOpsManager: dbSite.assigned_ops_manager || 'Unassigned',
                assignedDeploymentEngineer: dbSite.assigned_deployment_engineer || 'Unassigned',
                stakeholders: [],
                notes: '', // Not available in database schema
                description: '', // Not available in database schema
                lastUpdated: new Date().toISOString().split('T')[0]
              };
              setSite(contextSite);
              setSelectedStep(getStepperStepFromStatus(contextSite.status as UnifiedSiteStatus));
              setLoading(false);
              return;
            }
          } catch (error) {
            console.error('Error loading site from database:', error);
          }
          
          // Fall back to mock data if database load fails
          // If not found in context, load from mock data (in real app, this would be an API call)
          const mockSite: Site = {
          id: id,
          name: `ASDA Redditch (${id.substring(0, 8)})`, // More user-friendly name with partial ID
          organization: 'ASDA',
          foodCourt: 'ASDA Redditch',
          unitCode: 'AR004',
          sector: 'Eurest',
          goLiveDate: '2024-11-15',
          priority: 'high',
          riskLevel: 'medium',
          status: 'scoping_done',
          assignedOpsManager: 'Jessica Cleaver',
          assignedDeploymentEngineer: 'John Smith',
          stakeholders: [
            {
              id: '1',
              name: 'Sarah Johnson',
              role: 'Unit Manager',
              email: 'sarah.johnson@company.com',
              phone: '+44 20 7123 4567',
              organization: 'Company Ltd'
            },
            {
              id: '2',
              name: 'Mike Wilson',
              role: 'IT Manager',
              email: 'mike.wilson@company.com',
              phone: '+44 20 7123 4568',
              organization: 'Company Ltd'
            }
          ],
          notes: 'Full POS and Kiosk implementation for ASDA Redditch location',
          lastUpdated: '2024-07-30',
          description: 'Full POS and Kiosk implementation for ASDA Redditch location',
          hardwareScope: {
            approvalStatus: 'approved' as const
          },
          scoping: {
            selectedSoftware: ['pos-system', 'inventory-management'],
            selectedHardware: [
              { id: 'pos-terminal', quantity: 2, customizations: undefined },
              { id: 'printer', quantity: 2, customizations: undefined },
              { id: 'cash-drawer', quantity: 1, customizations: undefined },
              { id: 'tablet', quantity: 1, customizations: undefined },
              { id: 'barcode-scanner', quantity: 1, customizations: undefined }
            ],
            status: 'approved' as const,
            submittedAt: '2024-01-10T10:00:00Z',
            approvedAt: '2024-01-12T14:30:00Z',
            approvedBy: 'John Smith'
          }
        };
        
        // Try to find site in mock data based on ID
        const mockSites = [
                     {
             id: '1',
             name: 'London Central',
             organization: 'Compass Group UK',
             foodCourt: 'London Central',
             unitCode: 'LC001',
             sector: 'Eurest',
             goLiveDate: '2024-01-15',
             priority: 'high' as const,
             riskLevel: 'medium' as const,
             status: 'live' as UnifiedSiteStatus,
             assignedOpsManager: 'John Smith',
             assignedDeploymentEngineer: 'Mike Johnson',
             stakeholders: [],
             notes: 'London Central site implementation',
             description: 'London Central site implementation',
             lastUpdated: '2024-01-15',
             hardwareScope: {
               approvalStatus: 'approved' as const
             }
           },
          {
                         id: '2',
             name: 'Manchester North',
             organization: 'Compass Group UK',
             foodCourt: 'Manchester North',
             unitCode: 'MN002',
             sector: 'Eurest',
             goLiveDate: '2024-01-20',
             priority: 'medium' as const,
             riskLevel: 'low' as const,
             status: 'live' as UnifiedSiteStatus,
             assignedOpsManager: 'Sarah Wilson',
             assignedDeploymentEngineer: 'David Brown',
             stakeholders: [],
             notes: 'Manchester North site implementation',
             description: 'Manchester North site implementation',
             lastUpdated: '2024-01-18'
          },
          {
            id: '3',
            name: 'Birmingham South',
            organization: 'Compass Group UK',
            foodCourt: 'Birmingham South',
            unitCode: 'BS003',
            goLiveDate: '2024-01-25',
            priority: 'high' as const,
            riskLevel: 'medium' as const,
            status: 'live' as UnifiedSiteStatus,
            assignedOpsManager: 'Emma Davis',
            assignedDeploymentEngineer: 'Tom Wilson',
            stakeholders: [],
            notes: 'Birmingham South site implementation',
            description: 'Birmingham South site implementation',
            lastUpdated: '2024-01-19'
          },
          {
            id: '4',
            name: 'Leeds Central',
            organization: 'Compass Group UK',
            foodCourt: 'Leeds Central',
            unitCode: 'LC004',
            goLiveDate: '2024-02-01',
            priority: 'medium' as const,
            riskLevel: 'low' as const,
            status: 'live' as UnifiedSiteStatus,
            assignedOpsManager: 'Alex Johnson',
            assignedDeploymentEngineer: 'Lisa Brown',
            stakeholders: [],
            notes: 'Leeds Central site implementation',
            description: 'Leeds Central site implementation',
            lastUpdated: '2024-01-30'
          },
          {
            id: '5',
            name: 'Liverpool Docklands',
            organization: 'Compass Group UK',
            foodCourt: 'Liverpool Docklands',
            unitCode: 'LD005',
            goLiveDate: '2024-02-05',
            priority: 'high' as const,
            riskLevel: 'medium' as const,
            status: 'live' as UnifiedSiteStatus,
            assignedOpsManager: 'Michael Wilson',
            assignedDeploymentEngineer: 'Sarah Davis',
            stakeholders: [],
            notes: 'Liverpool Docklands site implementation',
            description: 'Liverpool Docklands site implementation',
            lastUpdated: '2024-02-01'
          },
          {
            id: '6',
            name: 'Edinburgh Castle',
            organization: 'Compass Group UK',
            foodCourt: 'Edinburgh Castle',
            unitCode: 'EC006',
            goLiveDate: '2024-02-10',
            priority: 'medium' as const,
            riskLevel: 'low' as const,
            status: 'live' as UnifiedSiteStatus,
            assignedOpsManager: 'David Thompson',
            assignedDeploymentEngineer: 'Emma Wilson',
            stakeholders: [],
            notes: 'Edinburgh Castle site implementation',
            description: 'Edinburgh Castle site implementation',
            lastUpdated: '2024-02-05'
          },
          {
            id: '7',
            name: 'Cardiff Bay',
            organization: 'Compass Group UK',
            foodCourt: 'Cardiff Bay',
            unitCode: 'CB007',
            goLiveDate: '2024-02-15',
            priority: 'high' as const,
            riskLevel: 'medium' as const,
            status: 'live' as UnifiedSiteStatus,
            assignedOpsManager: 'Rachel Green',
            assignedDeploymentEngineer: 'James Miller',
            stakeholders: [],
            notes: 'Cardiff Bay site implementation',
            description: 'Cardiff Bay site implementation',
            lastUpdated: '2024-02-10'
          },
          {
            id: '8',
            name: 'Glasgow Central',
            organization: 'Compass Group UK',
            foodCourt: 'Glasgow Central',
            unitCode: 'GC008',
            goLiveDate: '2024-03-01',
            priority: 'medium' as const,
            riskLevel: 'low' as const,
            status: 'approved' as UnifiedSiteStatus,
            assignedOpsManager: 'Fiona MacDonald',
            assignedDeploymentEngineer: 'Robert Campbell',
            stakeholders: [],
            notes: 'Glasgow Central site implementation',
            description: 'Glasgow Central site implementation',
            lastUpdated: '2024-02-15'
          },
          {
            id: '9',
            name: 'Bristol Harbour',
            organization: 'Compass Group UK',
            foodCourt: 'Bristol Harbour',
            unitCode: 'BH009',
            goLiveDate: '2024-03-05',
            priority: 'high' as const,
            riskLevel: 'medium' as const,
            status: 'approved' as UnifiedSiteStatus,
            assignedOpsManager: 'Tom Anderson',
            assignedDeploymentEngineer: 'Helen White',
            stakeholders: [],
            notes: 'Bristol Harbour site implementation',
            description: 'Bristol Harbour site implementation',
            lastUpdated: '2024-02-20'
          },
          {
            id: '10',
            name: 'Newcastle Quayside',
            organization: 'Compass Group UK',
            foodCourt: 'Newcastle Quayside',
            unitCode: 'NQ010',
            goLiveDate: '2024-03-10',
            priority: 'medium' as const,
            riskLevel: 'low' as const,
            status: 'approved' as UnifiedSiteStatus,
            assignedOpsManager: 'Peter Mitchell',
            assignedDeploymentEngineer: 'Claire Roberts',
            stakeholders: [],
            notes: 'Newcastle Quayside site implementation',
            description: 'Newcastle Quayside site implementation',
            lastUpdated: '2024-02-25'
          },
          {
            id: '11',
            name: 'Sheffield Steelworks',
            organization: 'Compass Group UK',
            foodCourt: 'Sheffield Steelworks',
            unitCode: 'SS011',
            goLiveDate: '2024-03-15',
            priority: 'high' as const,
            riskLevel: 'medium' as const,
            status: 'approved' as UnifiedSiteStatus,
            assignedOpsManager: 'Andrew Taylor',
            assignedDeploymentEngineer: 'Natalie Clark',
            stakeholders: [],
            notes: 'Sheffield Steelworks site implementation',
            description: 'Sheffield Steelworks site implementation',
            lastUpdated: '2024-03-01'
          },
          {
            id: '12',
            name: 'Nottingham Castle',
            organization: 'Compass Group UK',
            foodCourt: 'Nottingham Castle',
            unitCode: 'NC012',
            goLiveDate: '2024-03-20',
            priority: 'medium' as const,
            riskLevel: 'low' as const,
            status: 'approved' as UnifiedSiteStatus,
            assignedOpsManager: 'Daniel Wright',
            assignedDeploymentEngineer: 'Sophie Turner',
            stakeholders: [],
            notes: 'Nottingham Castle site implementation',
            description: 'Nottingham Castle site implementation',
            lastUpdated: '2024-03-05'
          },
          {
            id: '13',
            name: 'Oxford University',
            organization: 'Compass Group UK',
            foodCourt: 'Oxford University',
            unitCode: 'OU013',
            goLiveDate: '2024-04-01',
            priority: 'high' as const,
            riskLevel: 'medium' as const,
            status: 'site_created' as UnifiedSiteStatus,
            assignedOpsManager: 'Dr. Sarah Johnson',
            assignedDeploymentEngineer: 'Mark Wilson',
            stakeholders: [],
            notes: 'Oxford University site implementation',
            description: 'Oxford University site implementation',
            lastUpdated: '2024-03-01',
            hardwareScope: {
              approvalStatus: 'pending' as const
            }
          },
          {
            id: '14',
            name: 'Cambridge Science Park',
            organization: 'Compass Group UK',
            foodCourt: 'Cambridge Science Park',
            unitCode: 'CSP014',
            goLiveDate: '2024-04-05',
            priority: 'medium' as const,
            riskLevel: 'low' as const,
            status: 'study_in_progress' as UnifiedSiteStatus,
            assignedOpsManager: 'Dr. Michael Brown',
            assignedDeploymentEngineer: 'Emma Davis',
            stakeholders: [],
            notes: 'Cambridge Science Park site implementation',
            description: 'Cambridge Science Park site implementation',
            lastUpdated: '2024-03-10',
            hardwareScope: {
              approvalStatus: 'rejected' as const
            }
          },
          {
            id: '15',
            name: 'Durham Cathedral',
            organization: 'Compass Group UK',
            foodCourt: 'Durham Cathedral',
            unitCode: 'DC015',
            goLiveDate: '2024-04-10',
            priority: 'high' as const,
            riskLevel: 'medium' as const,
            status: 'site_created' as UnifiedSiteStatus,
            assignedOpsManager: 'Reverend James Smith',
            assignedDeploymentEngineer: 'Lisa Anderson',
            stakeholders: [],
            notes: 'Durham Cathedral site implementation',
            description: 'Durham Cathedral site implementation',
            lastUpdated: '2024-03-15'
          }
        ];
        
        const foundSite = mockSites.find(s => s.id === id);
        if (foundSite) {
          setSite(foundSite);
          setSelectedStep(getStepperStepFromStatus(foundSite.status as UnifiedSiteStatus));
          } else {
            setSite(mockSite);
            setSelectedStep(getStepperStepFromStatus(mockSite.status as UnifiedSiteStatus));
          }
          setLoading(false);
        };
        
        // Call the async function
        loadSiteFromDatabase();
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Create stepper steps based on site status
  const stepperSteps = createStepperSteps(site.status as UnifiedSiteStatus);

  // Render content based on selected step
  const renderStepContent = () => {
    // Check if user can edit based on role and workflow progress
    const canEditStep = (stepIndex: number) => {
      // Only admins can edit anything at any stage
      if (currentRole === 'admin') return true;
      
      // Live sites are completely read-only for non-admin users
      if (site.status === 'live') {
        return false;
      }
      
      // For non-admin users, check specific step logic
      const currentStepIndex = getStepperStepFromStatus(site.status);
      
      // Site Study (step 1) special logic
      if (stepIndex === 1) {
        // Site Study is NOT editable if status is approved, deployment, activated, or live
        if (['approved', 'deployment', 'activated', 'live'].includes(site.status)) {
          return false;
        }
        
        // Exception: Site Study IS editable if scoping is rejected
        if (site.hardwareScope?.approvalStatus === 'rejected') {
          return true;
        }
        
        // Otherwise, follow normal workflow progression
        return stepIndex <= currentStepIndex;
      }
      
      // Scoping (step 2) special logic
      if (stepIndex === 2) {
        // Scoping is editable if it's rejected
        if (site.hardwareScope?.approvalStatus === 'rejected') {
          return true;
        }
        
        // Otherwise, follow normal workflow progression
        return stepIndex <= currentStepIndex;
      }
      
      // For other steps, they can only edit if the workflow has progressed to that step
      return stepIndex <= currentStepIndex;
    };

    // Check if specific fields can be edited based on user role and workflow progression
    const canEditField = (fieldName: string, stepIndex?: number) => {
      // Admin can edit any field at any stage
      if (currentRole === 'admin') return true;
      
      // Live sites are completely read-only for non-admin users
      if (site.status === 'live') {
        return false;
      }
      
      // These fields are always read-only for non-admins
      const readOnlyFields = ['organization', 'foodCourt', 'unitCode'];
      if (readOnlyFields.includes(fieldName)) {
        return false;
      }
      
      // For Site Study form fields (step 1), apply special role-based logic
      if (stepIndex === 1) {
        const currentStepIndex = getStepperStepFromStatus(site.status);
        
        // Deployment Engineer can edit Site Study fields up until Scoping step starts
        if (currentRole === 'deployment_engineer') {
          // Can edit if workflow hasn't reached Scoping step yet
          return currentStepIndex < 2;
        }
        
        // For all other roles (including ops_manager), Site Study fields become read-only 
        // immediately after Site Study step is completed
        return currentStepIndex <= 1;
      }
      
      // For other steps, follow normal field permissions
      return true;
    };

    // Check if the Site Study form should show as read-only
    const isSiteStudyFormReadOnly = () => {
      if (currentRole === 'admin') return false;
      
      // Live sites are completely read-only for non-admin users
      if (site.status === 'live') {
        return true;
      }
      
      const currentStepIndex = getStepperStepFromStatus(site.status);
      
      // Deployment Engineer can edit until Scoping starts
      if (currentRole === 'deployment_engineer') {
        return currentStepIndex >= 2;
      }
      
      // Other roles can only edit during Site Study step
      return currentStepIndex > 1;
    };

    switch (selectedStep) {
      case 0: // Site Creation
        return (
          <div className="space-y-6">
            {/* Action Buttons at Top */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Site Creation</h2>
                <p className="text-gray-600 mt-1">Basic site information and configuration</p>
              </div>
              <div className="flex space-x-3">
                {canEditStep(0) && (
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2"
                    onClick={() => {/* TODO: Implement edit mode toggle */}}
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Site Creation</span>
                  </Button>
                )}
                <Button className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Submit for Review</span>
                </Button>
              </div>
            </div>

            {/* Site Creation Form */}
            <div className="grid grid-cols-1 gap-6">
              {/* General Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="mr-2 h-5 w-5" />
                    General Information
                  </CardTitle>
                  <CardDescription>
                    Basic site details and organisation information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Site Information */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700 border-b pb-2">Basic Site Information</h4>
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <label className="text-sm font-medium text-gray-700">Site Name</label>
                         <Input 
                           defaultValue={site.foodCourt} 
                           placeholder="e.g., London Central"
                           className={`w-full ${!canEditField('foodCourt') ? "bg-gray-50" : ""}`}
                           disabled={!canEditField('foodCourt')}
                         />
                       </div>
                       <div className="space-y-2">
                         <label className="text-sm font-medium text-gray-700">Organisation</label>
                         <Input 
                           defaultValue={site.organization} 
                           placeholder="e.g., Compass Group UK"
                           className={`w-full ${!canEditField('organization') ? "bg-gray-50" : ""}`}
                           disabled={!canEditField('organization')}
                         />
                       </div>
                       <div className="space-y-2">
                         <label className="text-sm font-medium text-gray-700">Sector</label>
                         <Input 
                           defaultValue={site.sector || 'Eurest'} 
                           placeholder="e.g., Eurest"
                           className={`w-full ${!canEditField('sector') ? "bg-gray-50" : ""}`}
                           disabled={!canEditField('sector')}
                         />
                       </div>
                       <div className="space-y-2">
                         <label className="text-sm font-medium text-gray-700">Unit Code</label>
                         <Input 
                           defaultValue={site.unitCode} 
                           placeholder="e.g., LC001"
                           className={`w-full ${!canEditField('unitCode') ? "bg-gray-50" : ""}`}
                           disabled={!canEditField('unitCode')}
                         />
                       </div>
                       <div className="space-y-2">
                         <label className="text-sm font-medium text-gray-700">Target Live Date</label>
                         <Input 
                           type="date"
                           defaultValue={site.goLiveDate}
                           className={`w-full ${!canEditField('goLiveDate') ? "bg-gray-50" : ""}`}
                           disabled={!canEditField('goLiveDate')}
                         />
                       </div>
                     </div>
                  </div>

                  {/* Priority & Risk Assessment */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700 border-b pb-2">Priority & Risk Assessment</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Priority Level</label>
                        <Select defaultValue={site.priority} disabled={!canEditField('priority')}>
                          <SelectTrigger className={!canEditField('priority') ? "bg-gray-50" : ""}>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low Priority</SelectItem>
                            <SelectItem value="medium">Medium Priority</SelectItem>
                            <SelectItem value="high">High Priority</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Risk Level</label>
                        <Select defaultValue={site.riskLevel} disabled={!canEditField('riskLevel')}>
                          <SelectTrigger className={!canEditField('riskLevel') ? "bg-gray-50" : ""}>
                            <SelectValue placeholder="Select risk level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low Risk</SelectItem>
                            <SelectItem value="medium">Medium Risk</SelectItem>
                            <SelectItem value="high">High Risk</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Team Assignment */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700 border-b pb-2">Team Assignment</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Operations Manager</label>
                        <Select defaultValue={site.assignedOpsManager} disabled={!canEditField('assignedOpsManager')}>
                          <SelectTrigger className={!canEditField('assignedOpsManager') ? "bg-gray-50" : ""}>
                            <SelectValue placeholder="Select operations manager" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="John Smith">John Smith</SelectItem>
                            <SelectItem value="Sarah Wilson">Sarah Wilson</SelectItem>
                            <SelectItem value="Emma Davis">Emma Davis</SelectItem>
                            <SelectItem value="Alex Johnson">Alex Johnson</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Deployment Engineer</label>
                        <Select defaultValue={site.assignedDeploymentEngineer} disabled={!canEditField('assignedDeploymentEngineer')}>
                          <SelectTrigger className={!canEditField('assignedDeploymentEngineer') ? "bg-gray-50" : ""}>
                            <SelectValue placeholder="Select deployment engineer" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Mike Brown">Mike Brown</SelectItem>
                            <SelectItem value="Lisa Chen">Lisa Chen</SelectItem>
                            <SelectItem value="David Wilson">David Wilson</SelectItem>
                            <SelectItem value="Anna Rodriguez">Anna Rodriguez</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    Location Information
                  </CardTitle>
                  <CardDescription>
                    Site location details and coordinates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {locationData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Selected Address</label>
                        <Input 
                          value={locationData.address}
                          readOnly
                          className="w-full"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Latitude</label>
                          <Input 
                            value={locationData.lat.toFixed(6)}
                            readOnly
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Longitude</label>
                          <Input 
                            value={locationData.lng.toFixed(6)}
                            readOnly
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Location Picker for updating location */}
                  <div className="pt-4 border-t">
                    <LocationPicker
                      onLocationSelect={(location) => {
                        setLocationData({
                          lat: location.lat,
                          lng: location.lng,
                          address: location.address
                        });
                      }}
                      initialLocation={locationData ? { lat: locationData.lat, lng: locationData.lng } : undefined}
                    />
                  </div>
                </CardContent>
              </Card>


            </div>

            {/* Action Buttons at Bottom */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button variant="outline" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Save as Draft</span>
              </Button>
              <Button className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Submit for Review</span>
              </Button>
            </div>
          </div>
        );

      case 1: // Site Study
        return (
          <div className="space-y-6">
            {/* Action Buttons at Top */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Site Study</h2>
                <p className="text-gray-600 mt-1">Comprehensive site assessment and deployment readiness</p>
              </div>
              <div className="flex space-x-3">
                {canEditStep(1) && (
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2"
                    onClick={() => {/* TODO: Implement edit mode toggle */}}
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Site Study</span>
                  </Button>
                )}
                <Button className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Export Report</span>
                </Button>
              </div>
            </div>

            {/* Read-Only Banner */}
            {isSiteStudyFormReadOnly() && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <div>
                    <h4 className="font-medium text-amber-800">Form Read-Only</h4>
                    <p className="text-sm text-amber-700">
                      {currentRole === 'deployment_engineer' 
                        ? 'The workflow has progressed to Scoping stage. Site Study fields are now read-only.'
                        : 'Site Study step has been completed. Fields are now read-only for your role.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Site Study Content with Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* General Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="mr-2 h-5 w-5" />
                    General Information
                  </CardTitle>
                  <CardDescription>
                    Organisation details and key contacts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Organisation</label>
                        <Input 
                          defaultValue="Compass Eurest"
                          placeholder="Enter organisation name"
                          className={`w-full ${!canEditField('organization', 1) ? "bg-gray-50" : ""}`}
                          disabled={!canEditField('organization', 1)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Sector</label>
                        <Input 
                          defaultValue="Eurest"
                          placeholder="Enter sector"
                          className={`w-full ${!canEditField('sector', 1) ? "bg-gray-50" : ""}`}
                          disabled={!canEditField('sector', 1)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <Input 
                          defaultValue="sarah.johnson@company.com"
                          placeholder="Enter email address"
                          type="email"
                          className={`w-full ${!canEditField('email', 1) ? "bg-gray-50" : ""}`}
                          disabled={!canEditField('email', 1)}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Unit Manager</label>
                        <Input 
                          defaultValue="Sarah Johnson"
                          placeholder="Enter unit manager name"
                          className={`w-full ${!canEditField('unitManager', 1) ? "bg-gray-50" : ""}`}
                          disabled={!canEditField('unitManager', 1)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Job Title</label>
                        <Input 
                          defaultValue="Operations Manager"
                          placeholder="Enter job title"
                          className={`w-full ${!canEditField('jobTitle', 1) ? "bg-gray-50" : ""}`}
                          disabled={!canEditField('jobTitle', 1)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Mobile</label>
                        <Input 
                          defaultValue="+44 7700 900123"
                          placeholder="Enter mobile number"
                          className={`w-full ${!canEditField('mobile', 1) ? "bg-gray-50" : ""}`}
                          disabled={!canEditField('mobile', 1)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location & Delivery Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="mr-2 h-5 w-5" />
                    Location & Delivery Information
                  </CardTitle>
                  <CardDescription>
                    Access details and delivery requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Floor</label>
                        <Input 
                          defaultValue="2nd Floor"
                          placeholder="Enter floor number/description"
                          className={`w-full ${!canEditField('floor', 1) ? "bg-gray-50" : ""}`}
                          disabled={!canEditField('floor', 1)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Lift Access</label>
                        <Select defaultValue="available" disabled={!canEditField('liftAccess', 1)}>
                          <SelectTrigger className={`w-full ${!canEditField('liftAccess', 1) ? "bg-gray-50" : ""}`}>
                            <SelectValue placeholder="Select lift access" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="not-available">Not Available</SelectItem>
                            <SelectItem value="limited">Limited</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Security Restrictions</label>
                        <Input 
                          defaultValue="Security pass required for all visitors"
                          placeholder="Enter security restrictions"
                          className={`w-full ${!canEditField('securityRestrictions', 1) ? "bg-gray-50" : ""}`}
                          disabled={!canEditField('securityRestrictions', 1)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Delivery Window</label>
                        <Input 
                          defaultValue="10:00 AM–2:00 PM"
                          placeholder="Enter delivery window"
                          className={`w-full ${!canEditField('deliveryWindow', 1) ? "bg-gray-50" : ""}`}
                          disabled={!canEditField('deliveryWindow', 1)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Staff & Capacity Planning Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Staff & Capacity Planning
                  </CardTitle>
                  <CardDescription>
                    Employee numbers and operational capacity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Employee Strength</label>
                        <Input 
                          defaultValue="2,500"
                          placeholder="Enter employee count"
                          type="number"
                          className={`w-full ${!canEditField('employeeStrength', 1) ? "bg-gray-50" : ""}`}
                          disabled={!canEditField('employeeStrength', 1)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Expected Footfall</label>
                        <Input 
                          defaultValue="800"
                          placeholder="Enter expected footfall"
                          type="number"
                          className={`w-full ${!canEditField('expectedFootfall', 1) ? "bg-gray-50" : ""}`}
                          disabled={!canEditField('expectedFootfall', 1)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Seating Capacity</label>
                        <Input 
                          defaultValue="300"
                          placeholder="Enter seating capacity"
                          type="number"
                          className={`w-full ${!canEditField('seatingCapacity', 1) ? "bg-gray-50" : ""}`}
                          disabled={!canEditField('seatingCapacity', 1)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Operating Days</label>
                        <Input 
                          defaultValue="Monday - Friday"
                          placeholder="Enter operating days"
                          className={`w-full ${!canEditField('operatingDays', 1) ? "bg-gray-50" : ""}`}
                          disabled={!canEditField('operatingDays', 1)}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Operating Hours</label>
                        <Input 
                          defaultValue="7:00 AM - 6:00 PM"
                          placeholder="Enter operating hours"
                          className={`w-full ${!canEditField('operatingHours', 1) ? "bg-gray-50" : ""}`}
                          disabled={!canEditField('operatingHours', 1)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Peak Hours</label>
                        <Input 
                          defaultValue="12:00 PM - 2:00 PM"
                          placeholder="Enter peak hours"
                          className={`w-full ${!canEditField('peakHours', 1) ? "bg-gray-50" : ""}`}
                          disabled={!canEditField('peakHours', 1)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Kitchen Staff</label>
                        <Input 
                          defaultValue="15"
                          placeholder="Enter kitchen staff count"
                          type="number"
                          className={`w-full ${!canEditField('kitchenStaff', 1) ? "bg-gray-50" : ""}`}
                          disabled={!canEditField('kitchenStaff', 1)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Service Staff</label>
                        <Input 
                          defaultValue="8"
                          placeholder="Enter service staff count"
                          type="number"
                          className={`w-full ${!canEditField('serviceStaff', 1) ? "bg-gray-50" : ""}`}
                          disabled={!canEditField('serviceStaff', 1)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Management</label>
                        <Input 
                          defaultValue="3"
                          placeholder="Enter management count"
                          type="number"
                          className={`w-full ${!canEditField('management', 1) ? "bg-gray-50" : ""}`}
                          disabled={!canEditField('management', 1)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* IT & Power Infrastructure Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wifi className="mr-2 h-5 w-5" />
                    IT & Power Infrastructure
                  </CardTitle>
                  <CardDescription>
                    Network connectivity and power requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">LAN Points</label>
                        <Input 
                          defaultValue="8"
                          placeholder="Enter number of LAN points"
                          type="number"
                          className={`w-full ${!canEditField('lanPoints', 1) ? "bg-gray-50" : ""}`}
                          disabled={!canEditField('lanPoints', 1)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Wi-Fi Available</label>
                        <Select defaultValue="yes" disabled={!canEditField('wifiAvailable', 1)}>
                          <SelectTrigger className={`w-full ${!canEditField('wifiAvailable', 1) ? "bg-gray-50" : ""}`}>
                            <SelectValue placeholder="Select Wi-Fi availability" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="limited">Limited</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Bandwidth</label>
                        <Input 
                          defaultValue="6 Mbps"
                          placeholder="Enter bandwidth"
                          className={`w-full ${!canEditField('bandwidth', 1) ? "bg-gray-50" : ""}`}
                          disabled={!canEditField('bandwidth', 1)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Static IP</label>
                        <Select defaultValue="provided" disabled={!canEditField('staticIP', 1)}>
                          <SelectTrigger className={`w-full ${!canEditField('staticIP', 1) ? "bg-gray-50" : ""}`}>
                            <SelectValue placeholder="Select static IP status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="provided">Provided</SelectItem>
                            <SelectItem value="not-provided">Not Provided</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">UPS Power (POS)</label>
                        <Select defaultValue="available" disabled={!canEditField('upsPowerPOS', 1)}>
                          <SelectTrigger className={`w-full ${!canEditField('upsPowerPOS', 1) ? "bg-gray-50" : ""}`}>
                            <SelectValue placeholder="Select UPS power status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="not-available">Not Available</SelectItem>
                            <SelectItem value="limited">Limited</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">UPS Power (Ceiling)</label>
                        <Select defaultValue="not-available" disabled={!canEditField('upsPowerCeiling', 1)}>
                          <SelectTrigger className={`w-full ${!canEditField('upsPowerCeiling', 1) ? "bg-gray-50" : ""}`}>
                            <SelectValue placeholder="Select UPS power status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="not-available">Not Available</SelectItem>
                            <SelectItem value="limited">Limited</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Readiness & Risks Card */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Readiness & Risks
                  </CardTitle>
                  <CardDescription>
                    Deployment readiness assessment and potential blockers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Site Deployment Ready</label>
                        <Select defaultValue="ready" disabled={!canEditField('deploymentReady', 1)}>
                          <SelectTrigger className={`w-full ${!canEditField('deploymentReady', 1) ? "bg-gray-50" : ""}`}>
                            <SelectValue placeholder="Select deployment readiness" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ready">Ready</SelectItem>
                            <SelectItem value="not-ready">Not Ready</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Key Blockers</label>
                        <Input 
                          defaultValue="None"
                          placeholder="Enter key blockers"
                          className={`w-full ${!canEditField('keyBlockers', 1) ? "bg-gray-50" : ""}`}
                          disabled={!canEditField('keyBlockers', 1)}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Unresolved Dependencies</label>
                        <Select defaultValue="no" disabled={!canEditField('unresolvedDependencies', 1)}>
                          <SelectTrigger className={`w-full ${!canEditField('unresolvedDependencies', 1) ? "bg-gray-50" : ""}`}>
                            <SelectValue placeholder="Select dependency status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="partial">Partial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Suggested Go-Live Date</label>
                        <Input 
                          defaultValue="1st November 2025"
                          placeholder="Enter suggested go-live date"
                          className={`w-full ${!canEditField('suggestedGoLiveDate', 1) ? "bg-gray-50" : ""}`}
                          disabled={!canEditField('suggestedGoLiveDate', 1)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Layout Images Upload Section */}
                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Layout Images</h4>
                    <p className="text-sm text-gray-600 mb-4">Upload up to 3 layout images for the site (JPG, PNG, PDF - Max 10MB each)</p>
                    
                    <LayoutImageUpload
                      siteId={id || ''}
                      disabled={!canEditField('layoutImages', 1)}
                      onImagesUpdated={handleLayoutImagesUpdated}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 2: // Scoping (Software & Hardware)
        return (
          <div className="space-y-6">
            {/* Action Buttons at Top */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Scoping</h2>
                <p className="text-gray-600 mt-1">Select software and hardware requirements for the site</p>
              </div>
              <div className="flex space-x-3">
                {canEditStep(2) && (
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2"
                    onClick={() => {/* TODO: Implement edit mode toggle */}}
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Scoping</span>
                  </Button>
                )}
                <Button className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Submit for Approval</span>
                </Button>
              </div>
            </div>

            {/* Enhanced Scoping Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Configuration Panel */}
              <div className="lg:col-span-2 space-y-6">
                {/* Software Selection Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Monitor className="mr-2 h-5 w-5" />
                      Software Selection
                    </CardTitle>
                    <CardDescription>
                      Choose software modules to automatically get hardware recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <Checkbox 
                              id="pos-system"
                              checked={site?.scoping?.selectedSoftware?.includes('pos-system') || false}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  // Add POS system and update hardware recommendations
                                  const updatedSoftware = [...(site?.scoping?.selectedSoftware || []), 'pos-system'];
                                  updateSiteScoping(updatedSoftware, site?.scoping?.selectedHardware || []);
                                } else {
                                  // Remove POS system and update hardware recommendations
                                  const updatedSoftware = (site?.scoping?.selectedSoftware || []).filter(s => s !== 'pos-system');
                                  updateSiteScoping(updatedSoftware, site?.scoping?.selectedHardware || []);
                                }
                              }}
                              disabled={!canEditStep(2)}
                            />
                            <div>
                              <h4 className="font-medium">POS System</h4>
                              <p className="text-sm text-gray-600">Point of Sale system for transactions</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm">
                                <span className="text-green-600">£25/month</span>
                                <span className="text-blue-600">£150 setup</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <Checkbox 
                              id="kiosk-software"
                              checked={site?.scoping?.selectedSoftware?.includes('kiosk-software') || false}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  const updatedSoftware = [...(site?.scoping?.selectedSoftware || []), 'kiosk-software'];
                                  updateSiteScoping(updatedSoftware, site?.scoping?.selectedHardware || []);
                                } else {
                                  const updatedSoftware = (site?.scoping?.selectedSoftware || []).filter(s => s !== 'kiosk-software');
                                  updateSiteScoping(updatedSoftware, site?.scoping?.selectedHardware || []);
                                }
                              }}
                              disabled={!canEditStep(2)}
                            />
                            <div>
                              <h4 className="font-medium">Kiosk Software</h4>
                              <p className="text-sm text-gray-600">Self-service kiosk software</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm">
                                <span className="text-green-600">£20/month</span>
                                <span className="text-blue-600">£100 setup</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <Checkbox 
                              id="kitchen-display"
                              checked={site?.scoping?.selectedSoftware?.includes('kitchen-display') || false}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  const updatedSoftware = [...(site?.scoping?.selectedSoftware || []), 'kitchen-display'];
                                  updateSiteScoping(updatedSoftware, site?.scoping?.selectedHardware || []);
                                } else {
                                  const updatedSoftware = (site?.scoping?.selectedSoftware || []).filter(s => s !== 'kitchen-display');
                                  updateSiteScoping(updatedSoftware, site?.scoping?.selectedHardware || []);
                                }
                              }}
                              disabled={!canEditStep(2)}
                            />
                            <div>
                              <h4 className="font-medium">Kitchen Display</h4>
                              <p className="text-sm text-gray-600">Kitchen display system for orders</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm">
                                <span className="text-green-600">£20/month</span>
                                <span className="text-blue-600">£100 setup</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <Checkbox 
                              id="inventory-management"
                              checked={site?.scoping?.selectedSoftware?.includes('inventory-management') || false}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  const updatedSoftware = [...(site?.scoping?.selectedSoftware || []), 'inventory-management'];
                                  updateSiteScoping(updatedSoftware, site?.scoping?.selectedHardware || []);
                                } else {
                                  const updatedSoftware = (site?.scoping?.selectedSoftware || []).filter(s => s !== 'inventory-management');
                                  updateSiteScoping(updatedSoftware, site?.scoping?.selectedHardware || []);
                                }
                              }}
                              disabled={!canEditStep(2)}
                            />
                            <div>
                              <h4 className="font-medium">Inventory Management</h4>
                              <p className="text-sm text-gray-600">Inventory tracking and management</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm">
                                <span className="text-green-600">£15/month</span>
                                <span className="text-blue-600">£75 setup</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Hardware Recommendations Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Package className="mr-2 h-5 w-5" />
                      Hardware Requirements
                    </CardTitle>
                    <CardDescription>
                      Automatically recommended based on your software selections
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {getRecommendedHardware(site?.scoping?.selectedSoftware || []).length > 0 ? (
                      <div className="space-y-3">
                        {getRecommendedHardware(site?.scoping?.selectedSoftware || []).map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-gray-600">{item.description}</p>
                              <p className="text-sm text-gray-500">{item.manufacturer} {item.model}</p>
                              <p className="text-sm text-blue-600">{item.reason}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateHardwareQuantity(item.id, item.quantity - 1)}
                                  disabled={!canEditStep(2) || item.quantity <= 1}
                                >
                                  -
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateHardwareQuantity(item.id, item.quantity + 1)}
                                  disabled={!canEditStep(2)}
                                >
                                  +
                                </Button>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">£{(item.unitCost * item.quantity).toLocaleString()}</div>
                                <div className="text-sm text-gray-500">£{item.unitCost} each</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Select software modules to see hardware recommendations
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Cost Summary Panel */}
              <div className="space-y-6">
                {/* Cost Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="mr-2 h-5 w-5" />
                      Cost Summary
                    </CardTitle>
                    <CardDescription>
                      Real-time cost calculations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* CAPEX */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Capital Expenditure (CAPEX)</h4>
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
                          <span>£{calculateInstallationCosts().toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Contingency (15%)</span>
                          <span>£{calculateContingencyCosts().toLocaleString()}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-medium">
                          <span>Total CAPEX</span>
                          <span>£{calculateTotalCAPEX().toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* OPEX */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Operating Expenditure (OPEX)</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Monthly Software Fees</span>
                          <span>£{calculateMonthlySoftwareFees().toLocaleString()}/month</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Maintenance</span>
                          <span>£{calculateMaintenanceCosts().toLocaleString()}/month</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-medium">
                          <span>Total Monthly OPEX</span>
                          <span>£{calculateTotalMonthlyOPEX().toLocaleString()}/month</span>
                        </div>
                      </div>
                    </div>

                    {/* Total */}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Investment</span>
                      <span>£{calculateTotalInvestment().toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                  <CardContent className="pt-6">
                    <Button
                      onClick={saveScopingConfiguration}
                      disabled={!canEditStep(2) || !site?.scoping?.selectedSoftware?.length}
                      className="w-full"
                      size="lg"
                    >
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Save & Submit for Approval
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 3: // Approval
        return (
          <div className="space-y-6">
            {/* Action Buttons at Top */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Approval</h2>
                <p className="text-gray-600 mt-1">Ops Manager approval for software and hardware selection</p>
              </div>
              <div className="flex space-x-3">
                {canEditStep(3) && (
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2"
                    onClick={() => {/* TODO: Implement edit mode toggle */}}
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Approval</span>
                  </Button>
                )}
                <Button className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Approve</span>
                </Button>
              </div>
            </div>

            {/* Approval Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Approval Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckSquare className="mr-2 h-5 w-5" />
                    Approval Status
                  </CardTitle>
                  <CardDescription>
                    Current approval status and next steps
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Approval Status</h4>
                      <p className="text-sm text-gray-600">
                        Waiting for approval from {site.assignedOpsManager}
                      </p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Requested Date:</span>
                      <span className="font-medium">15th January 2025</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected Response:</span>
                      <span className="font-medium">Within 48 hours</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Software & Hardware Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Software & Hardware Summary
                  </CardTitle>
                  <CardDescription>
                    Selected software and hardware requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">POS System</h4>
                        <p className="text-sm text-gray-600">Point of Sale system</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Selected</Badge>
                    </div>
                    <div className="flex justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Kiosk Software</h4>
                        <p className="text-sm text-gray-600">Self-service kiosk</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Selected</Badge>
                    </div>
                    <div className="flex justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">POS Terminals</h4>
                        <p className="text-sm text-gray-600">Point of Sale terminals</p>
                      </div>
                      <span className="font-medium">4 units</span>
                    </div>
                    <div className="flex justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Self-Service Kiosks</h4>
                        <p className="text-sm text-gray-600">Self-service ordering</p>
                      </div>
                      <span className="font-medium">2 units</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons at Bottom */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button variant="outline" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Request Changes</span>
              </Button>
              <Button className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Approve</span>
              </Button>
            </div>
          </div>
        );

      case 4: // Procurement
        return (
          <div className="space-y-6">
            {/* Action Buttons at Top */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Procurement</h2>
                <p className="text-gray-600 mt-1">Track procurement status of approved software and hardware</p>
              </div>
              <div className="flex space-x-3">
                {canEditStep(4) && (
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2"
                    onClick={() => {/* TODO: Implement edit mode toggle */}}
                  >
                    <Edit className="h-4 w-4" />
                    <span>Update Procurement Status</span>
                  </Button>
                )}
                <Button className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Mark Procurement Complete</span>
                </Button>
              </div>
            </div>

            {/* Procurement Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Software Procurement Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Monitor className="mr-2 h-5 w-5" />
                    Software Procurement Status
                  </CardTitle>
                  <CardDescription>
                    Track procurement of approved software modules
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {site?.scoping?.selectedSoftware?.length > 0 ? (
                    <div className="space-y-3">
                      {site.scoping.selectedSoftware.map((softwareId) => {
                        const software = softwareModules.find(s => s.id === softwareId);
                        if (!software) return null;
                        
                        return (
                          <div key={softwareId} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium">{software.name}</h4>
                              <p className="text-sm text-gray-600">Software module for {software.name.toLowerCase()}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm">
                                <span className="text-green-600">£{software.monthlyFee}/month</span>
                                <span className="text-blue-600">£{software.setupFee} setup</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Select defaultValue="pending" disabled={!canEditStep(4)}>
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="ordered">Ordered</SelectItem>
                                  <SelectItem value="received">Received</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No software modules selected for this site
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Hardware Procurement Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Hardware Procurement Status
                  </CardTitle>
                  <CardDescription>
                    Track procurement of approved hardware items
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {site?.scoping?.selectedHardware?.length > 0 ? (
                    <div className="space-y-3">
                      {site.scoping.selectedHardware.map((hardware) => {
                        const hardwareItem = hardwareItems.find(h => h.id === hardware.id);
                        if (!hardwareItem) return null;
                        
                        return (
                          <div key={hardware.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium">{hardwareItem.name}</h4>
                              <p className="text-sm text-gray-600">{hardwareItem.description}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm">
                                <span className="text-gray-600">Qty: {hardware.quantity}</span>
                                <span className="text-green-600">£{hardwareItem.unitCost} each</span>
                                <span className="text-blue-600">Total: £{(hardwareItem.unitCost * hardware.quantity).toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Select defaultValue="pending" disabled={!canEditStep(4)}>
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="ordered">Ordered</SelectItem>
                                  <SelectItem value="received">Received</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No hardware items selected for this site
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Procurement Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Procurement Summary
                </CardTitle>
                <CardDescription>
                  Overall procurement progress and status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {site?.scoping?.selectedSoftware?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Software Modules</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {site?.scoping?.selectedHardware?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Hardware Items</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-gray-600">In Progress</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons at Bottom */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button variant="outline" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Save Progress</span>
              </Button>
              <Button className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Mark Procurement Complete</span>
              </Button>
            </div>
          </div>
        );

      case 5: // Deployment
        return (
          <div className="space-y-6">
            {/* Action Buttons at Top */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Deployment</h2>
                <p className="text-gray-600 mt-1">Hardware installation and system deployment</p>
              </div>
              <div className="flex space-x-3">
                {canEditStep(5) && (
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2"
                    onClick={() => {/* TODO: Implement edit mode toggle */}}
                  >
                    <Edit className="h-4 w-4" />
                    <span>Update Progress</span>
                  </Button>
                )}
                <Button className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Mark Complete</span>
                </Button>
              </div>
            </div>

            {/* Deployment Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Deployment Progress Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="mr-2 h-5 w-5" />
                    Deployment Progress
                  </CardTitle>
                  <CardDescription>
                    Current deployment status and progress
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm font-medium text-blue-600">75%</span>
                  </div>
                  <Progress value={75} className="w-full" />
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Hardware Delivered</h4>
                          <p className="text-sm text-gray-600">All hardware received on site</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <Clock className="h-3 w-3 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Installation In Progress</h4>
                          <p className="text-sm text-gray-600">POS terminals being installed</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-6 w-6 bg-gray-100 rounded-full flex items-center justify-center">
                          <AlertTriangle className="h-3 w-3 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Testing Pending</h4>
                          <p className="text-sm text-gray-600">System testing and validation</p>
                        </div>
                      </div>
                      <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Deployment Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Deployment Details
                  </CardTitle>
                  <CardDescription>
                    Key deployment information and timeline
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deployment Engineer:</span>
                      <span className="font-medium">{site.assignedDeploymentEngineer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-medium">20th January 2025</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected Completion:</span>
                      <span className="font-medium">25th January 2025</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Phase:</span>
                      <Badge className="bg-blue-100 text-blue-800">Installation</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons at Bottom */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button variant="outline" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Update Progress</span>
              </Button>
              <Button className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Mark Complete</span>
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Site Information</CardTitle>
              <CardDescription>
                Basic information about the site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Select a step from the workflow above to view details.</p>
            </CardContent>
          </Card>
        );
    }
  };

  // Helper functions for Scoping step
  const getRecommendedHardware = (selectedSoftware: string[]): HardwareItem[] => {
    // Get recommendation rules from platform configuration
    const recommendationRules = getHardwareRecommendations(selectedSoftware);
    
    const recommendations: HardwareItem[] = [];
    
    selectedSoftware.forEach(softwareId => {
      const rules = recommendationRules.filter(r => r.softwareModuleId === softwareId);
      rules.forEach(rule => {
        const hardware = hardwareItems.find(h => h.id === rule.hardwareItemId);
        if (hardware) {
          const existing = recommendations.find(r => r.id === hardware.id);
          if (existing) {
            existing.quantity += rule.defaultQuantity;
          } else {
            recommendations.push({
              ...hardware,
              quantity: rule.defaultQuantity,
              reason: rule.reason
            });
          }
        }
      });
    });
    
    return recommendations;
  };

  const calculateHardwareCosts = (): number => {
    const selectedSoftware = site?.scoping?.selectedSoftware || [];
    const recommendations = getRecommendedHardware(selectedSoftware);
    return recommendations.reduce((total, item) => total + (item.unitCost * item.quantity), 0);
  };

  const calculateSoftwareSetupCosts = (): number => {
    const selectedSoftware = site?.scoping?.selectedSoftware || [];
    return selectedSoftware.reduce((total, softwareId) => {
      const software = softwareModules.find(s => s.id === softwareId);
      return total + (software?.setupFee || 0);
    }, 0);
  };

  const calculateInstallationCosts = (): number => {
    const hardwareCosts = calculateHardwareCosts();
    return hardwareCosts * 0.1; // 10% of hardware cost
  };

  const calculateContingencyCosts = (): number => {
    const hardwareCosts = calculateHardwareCosts();
    const softwareSetupCosts = calculateSoftwareSetupCosts();
    const installationCosts = calculateInstallationCosts();
    return (hardwareCosts + softwareSetupCosts + installationCosts) * 0.15; // 15% contingency
  };

  const calculateTotalCAPEX = (): number => {
    return calculateHardwareCosts() + calculateSoftwareSetupCosts() + calculateInstallationCosts() + calculateContingencyCosts();
  };

  const calculateMonthlySoftwareFees = (): number => {
    const selectedSoftware = site?.scoping?.selectedSoftware || [];
    return selectedSoftware.reduce((total, softwareId) => {
      const software = softwareModules.find(s => s.id === softwareId);
      return total + (software?.monthlyFee || 0);
    }, 0);
  };

  const calculateMaintenanceCosts = (): number => {
    const hardwareCosts = calculateHardwareCosts();
    return hardwareCosts * 0.02; // 2% monthly maintenance
  };

  const calculateTotalMonthlyOPEX = (): number => {
    return calculateMonthlySoftwareFees() + calculateMaintenanceCosts();
  };

  const calculateTotalInvestment = (): number => {
    return calculateTotalCAPEX() + calculateTotalMonthlyOPEX();
  };

  const updateSiteScoping = (selectedSoftware: string[], selectedHardware: any[]) => {
    if (site) {
      setSite({
        ...site,
        scoping: {
          ...site.scoping,
          selectedSoftware,
          selectedHardware
        }
      });
    }
  };

  const updateHardwareQuantity = (hardwareId: string, quantity: number) => {
    if (site?.scoping?.selectedHardware) {
      const updatedHardware = site.scoping.selectedHardware.map(item =>
        item.id === hardwareId ? { ...item, quantity: Math.max(1, quantity) } : item
      );
      updateSiteScoping(site.scoping.selectedSoftware || [], updatedHardware);
    }
  };

  const saveScopingConfiguration = () => {
    if (site) {
      // Save the scoping configuration
      const updatedSite = {
        ...site,
        scoping: {
          ...site.scoping,
          status: 'pending_approval' as const,
          submittedAt: new Date().toISOString()
        }
      };
      setSite(updatedSite);
      
      // Update the sites array
      setSites((prevSites: Site[]) => 
        prevSites.map(s => s.id === site.id ? updatedSite : s)
      );
      
      toast.success('Scoping configuration saved and submitted for approval');
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{site.name}</h1>
                     <div className="flex items-center space-x-4 mt-2">
             <p className="text-gray-600">
               {site.sector || 'Unknown Sector'} → {site.organization} - {new Date(site.goLiveDate).toLocaleDateString()}
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



      {/* Workflow Stepper */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center text-gray-900">
              <Info className="mr-2 h-5 w-5 text-blue-600" />
              Go-Live Progress
            </CardTitle>
            <div className="text-base font-semibold text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
              Current Status: {getStatusDisplayName(site.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Stepper 
              steps={stepperSteps} 
              currentStep={selectedStep}
              onStepClick={setSelectedStep}
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Step {selectedStep + 1} of {stepperSteps.length}
            </div>
          </div>
          
          {/* Mobile Navigation Buttons */}
          <div className="md:hidden flex justify-between items-center mt-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setSelectedStep(Math.max(0, selectedStep - 1))}
              disabled={selectedStep === 0}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>
            <Button
              onClick={() => setSelectedStep(Math.min(stepperSteps.length - 1, selectedStep + 1))}
              disabled={selectedStep === stepperSteps.length - 1}
              className="flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

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