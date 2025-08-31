import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/roles';
import { useSiteContext, type Site } from '@/contexts/SiteContext';
import { createStepperSteps, getStatusColor, getStatusDisplayName, getStepperStepFromStatus, validateStatusProgression, type UnifiedSiteStatus } from '@/lib/siteTypes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  EnhancedStepper, 
  EnhancedStepContent, 
  MultiStepForm,
  ReadOnlyInput,
  ReadOnlyTextarea,
  ReadOnlySelect,
  isStepReadOnly,
  type EnhancedStepperStep 
} from '@/components/ui/enhanced-stepper';
import { 
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building, 
  CalendarDays,
  CheckCircle,
  ChevronDown,
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
import { Checkbox } from '@/components/ui/checkbox';
import { LocationPicker } from '@/components/ui/location-picker';
import { getHardwareRecommendations, getRecommendationRules } from '@/services/platformConfiguration';
import { LayoutImageUpload } from '@/components/LayoutImageUpload';
import { GlobalSiteNotesModal } from '@/components/GlobalSiteNotesModal';
import { SitesService } from '@/services/sitesService';
import { getOrganisations, type Organisation } from '@/services/organisationsService';
import { Loader } from '@/components/ui/loader';
import { Calendar } from "@/components/ui/calendar";
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
  const { sites, setSites, setSelectedSite, getSiteById } = useSiteContext();
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

  // Load organisations data
  useEffect(() => {
    const loadOrganisations = async () => {
      try {
        const orgs = await getOrganisations();
        setOrganisations(orgs);
      } catch (error) {
        console.error('Error loading organisations:', error);
      }
    };
    
    loadOrganisations();
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
            console.log('Attempting to load site from database:', id);
            const dbSites = await SitesService.getAllSites();
            const dbSite = dbSites.find(s => s.id === id);
            
            if (dbSite) {
              console.log('Site found in database:', dbSite);
              // Convert database site to context site format
              const contextSite: Site = {
                id: dbSite.id,
                name: dbSite.name,
                organization: dbSite.organization_id || 'Unknown Organization',
                foodCourt: dbSite.location || 'Unknown Location',
                unitCode: 'N/A', // Not available in database schema
                sector: 'Eurest', // Default sector
                goLiveDate: dbSite.target_live_date || '2024-12-31',
                priority: 'medium',
                riskLevel: 'medium',
                criticality: 'medium',
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
            } else {
              console.log('Site not found in database, will use mock data');
            }
          } catch (error) {
            console.error('Error loading site from database:', error);
          }
          
          // Fall back to mock data if database load fails
          console.log('Creating mock site for ID:', id);
          setIsMockSite(true); // Mark this as a mock site
          
          // If not found in context, load from mock data (in real app, this would be an API call)
          const mockSite: Site = {
            id: id,
            name: `ASDA Redditch (${id.substring(0, 8)})`, // More user-friendly name with partial ID
            organization: 'ASDA',
            foodCourt: 'ASDA Redditch',
            unitCode: 'AR004',
            sector: 'Eurest',
            goLiveDate: '2025-01-15', // Changed to a different date for testing
            priority: 'high',
            riskLevel: 'medium',
            criticality: 'high',
            status: 'Created',
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
          
          setSite(mockSite);
          setSelectedStep(getStepperStepFromStatus(mockSite.status as UnifiedSiteStatus));
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

  // Create stepper steps based on site status
  const [stepperSteps, setStepperSteps] = useState<EnhancedStepperStep[]>([]);
  const [manuallyUpdatedSteps, setManuallyUpdatedSteps] = useState(false);
  const [isMockSite, setIsMockSite] = useState(false);

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
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  General Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Site Name</label>
                    <Input value={site.foodCourt} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Organization</label>
                    <Input value={site.organization} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Sector</label>
                    <Input value={site.sector} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Target Live Date</label>
                    <Input value={site.goLiveDate} readOnly className="bg-gray-50" />
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
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Site Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Site study content will be implemented here.</p>
              </CardContent>
            </Card>
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
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Monitor className="mr-2 h-5 w-5" />
                      Software Selection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {softwareModules.map((software) => (
                        <div key={software.id} className="flex items-center space-x-3">
                          <Checkbox id={software.id} />
                          <label htmlFor={software.id} className="text-sm font-medium">
                            {software.name} - £{software.monthlyFee}/month
                          </label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="mr-2 h-5 w-5" />
                      Cost Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Hardware</span>
                        <span>£{calculateHardwareCosts().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Software Setup</span>
                        <span>£{calculateSoftwareSetupCosts().toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total CAPEX</span>
                        <span>£{calculateTotalCAPEX().toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
          <h1 className="text-3xl font-bold text-gray-900">{site.name}</h1>
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

      {/* Workflow Stepper */}
      <Card>
        <CardContent className="pt-6">
          <EnhancedStepper 
            steps={stepperSteps} 
            currentStep={getStepperStepFromStatus(site.status as UnifiedSiteStatus)}
            onStepClick={setSelectedStep}
            onStepToggle={handleStepToggle}
            showNavigation={false}
            compact={true}
          />
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
