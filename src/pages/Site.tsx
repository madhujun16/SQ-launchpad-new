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
  Upload
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
        // If not found in context, load from mock data (in real app, this would be an API call)
        const mockSite: Site = {
          id: id,
          name: `Site ${id}`, // This will be overridden by actual data
          organization: 'ASDA',
          foodCourt: 'ASDA Redditch',
          unitCode: 'AR004',
          goLiveDate: '2024-11-15',
          priority: 'high',
          riskLevel: 'medium',
          status: 'hardware_scoped',
          assignedOpsManager: 'Jessica Cleaver',
          assignedDeploymentEngineer: 'John Smith',
          stakeholders: [
            { 
              id: '1',
              name: 'Sarah Johnson', 
              role: 'Operations Manager', 
              email: 'sarah.johnson@asda.com', 
              phone: '+44 7700 900123',
              organization: 'ASDA'
            },
            { 
              id: '2',
              name: 'Mike Wilson', 
              role: 'IT Manager', 
              email: 'mike.wilson@asda.com', 
              phone: '+44 7700 900456',
              organization: 'ASDA'
            }
          ],
          notes: 'Full POS and Kiosk implementation for ASDA Redditch location',
          lastUpdated: '2024-07-30',
          description: 'Full POS and Kiosk implementation for ASDA Redditch location'
        };
        
        // Try to find site in mock data based on ID
        const mockSites = [
          {
            id: '1',
            name: 'London Central',
            organization: 'Compass Group UK',
            foodCourt: 'London Central',
            unitCode: 'LC001',
            goLiveDate: '2024-01-15',
            priority: 'high' as const,
            riskLevel: 'medium' as const,
            status: 'live' as UnifiedSiteStatus,
            assignedOpsManager: 'John Smith',
            assignedDeploymentEngineer: 'Mike Johnson',
            stakeholders: [],
            notes: 'London Central site implementation',
            description: 'London Central site implementation',
            lastUpdated: '2024-01-15'
          },
          {
            id: '2',
            name: 'Manchester North',
            organization: 'Compass Group UK',
            foodCourt: 'Manchester North',
            unitCode: 'MN002',
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
            status: 'created' as UnifiedSiteStatus,
            assignedOpsManager: 'Dr. Sarah Johnson',
            assignedDeploymentEngineer: 'Mark Wilson',
            stakeholders: [],
            notes: 'Oxford University site implementation',
            description: 'Oxford University site implementation',
            lastUpdated: '2024-03-01'
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
            lastUpdated: '2024-03-10'
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
            status: 'created' as UnifiedSiteStatus,
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
      }
    }
  }, [id, sites]);

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
      
      // For non-admin users, they can only edit if the workflow has progressed to that step
      const currentStepIndex = getStepperStepFromStatus(site.status);
      return stepIndex <= currentStepIndex;
    };

    // Check if specific fields can be edited (Organization, Site, Unit code are always read-only for non-admins)
    const canEditField = (fieldName: string) => {
      if (currentRole === 'admin') return true;
      
      // These fields are always read-only for non-admins
      const readOnlyFields = ['organization', 'foodCourt', 'unitCode'];
      return !readOnlyFields.includes(fieldName);
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
                        <label className="text-sm font-medium text-gray-700">Organisation</label>
                        <Input 
                          defaultValue={site.organization} 
                          placeholder="e.g., Compass Group UK"
                          className={`w-full ${!canEditField('organization') ? "bg-gray-50" : ""}`}
                          disabled={!canEditField('organization')}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Food Court Name</label>
                        <Input 
                          defaultValue={site.foodCourt} 
                          placeholder="e.g., London Central"
                          className={`w-full ${!canEditField('foodCourt') ? "bg-gray-50" : ""}`}
                          disabled={!canEditField('foodCourt')}
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
                <h2 className="text-2xl font-bold text-gray-900">Site Study Report</h2>
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
                      <div className="flex justify-between">
                        <span className="text-gray-600">Organisation:</span>
                        <span className="font-medium">Compass Eurest</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sector:</span>
                        <span className="font-medium">Eurest</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">sarah.johnson@jlr.com</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Unit Manager:</span>
                        <span className="font-medium">Sarah Johnson</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Job Title:</span>
                        <span className="font-medium">Operations Manager</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mobile:</span>
                        <span className="font-medium">+44 7700 900123</span>
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
                      <div className="flex justify-between">
                        <span className="text-gray-600">Floor:</span>
                        <span className="font-medium">2nd Floor</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lift Access:</span>
                        <Badge className="bg-green-100 text-green-800">Available</Badge>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Security Restrictions:</span>
                        <span className="font-medium">Security pass required for all visitors</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Window:</span>
                        <span className="font-medium">10:00 AM–2:00 PM</span>
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
                      <div className="flex justify-between">
                        <span className="text-gray-600">Employee Strength:</span>
                        <span className="font-medium">2,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expected Footfall:</span>
                        <span className="font-medium">800</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Seating Capacity:</span>
                        <span className="font-medium">300</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Operating Days:</span>
                        <span className="font-medium">Monday - Friday</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Operating Hours:</span>
                        <span className="font-medium">7:00 AM - 6:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Peak Hours:</span>
                        <span className="font-medium">12:00 PM - 2:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kitchen Staff:</span>
                        <span className="font-medium">15</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service Staff:</span>
                        <span className="font-medium">8</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Management:</span>
                        <span className="font-medium">3</span>
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
                      <div className="flex justify-between">
                        <span className="text-gray-600">LAN Points:</span>
                        <span className="font-medium">8</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Wi-Fi Available:</span>
                        <Badge className="bg-green-100 text-green-800">Yes</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bandwidth:</span>
                        <span className="font-medium">6 Mbps</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Static IP:</span>
                        <Badge className="bg-green-100 text-green-800">Provided</Badge>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">UPS Power (POS):</span>
                        <Badge className="bg-green-100 text-green-800">Available</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">UPS Power (Ceiling):</span>
                        <Badge className="bg-red-100 text-red-800">Not Available</Badge>
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
                      <div className="flex justify-between">
                        <span className="text-gray-600">Site Deployment Ready:</span>
                        <Badge className="bg-green-100 text-green-800">Ready</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Key Blockers:</span>
                        <span className="font-medium">None</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Unresolved Dependencies:</span>
                        <span className="font-medium">No</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Suggested Go-Live Date:</span>
                        <span className="font-medium">1st November 2025</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Layout Images Upload Section */}
                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Layout Images</h4>
                    <p className="text-sm text-gray-600 mb-4">Upload up to 3 layout images for the site (JPG, PNG, PDF - Max 10MB each)</p>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <div className="flex flex-col items-center space-y-4">
                        <Upload className="h-12 w-12 text-gray-400" />
                        <div>
                          <p className="text-lg font-medium text-gray-700">Upload Layout Images</p>
                          <p className="text-sm text-gray-500">Select up to 3 files or drag & drop them here</p>
                        </div>
                        <input
                          type="file"
                          multiple
                          accept=".jpg,.jpeg,.png,.pdf"
                          className="hidden"
                          id="layout-images"
                        />
                        <label htmlFor="layout-images" className="cursor-pointer">
                          <Button variant="outline" size="lg">
                            Choose Files
                          </Button>
                        </label>
                      </div>
                    </div>
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

            {/* Scoping Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Software Selection Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Monitor className="mr-2 h-5 w-5" />
                    Software Selection
                  </CardTitle>
                  <CardDescription>
                    Choose the software modules required for this site
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">POS System</h4>
                        <p className="text-sm text-gray-600">Point of Sale system for transactions</p>
                      </div>
                      <Checkbox />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Kiosk Software</h4>
                        <p className="text-sm text-gray-600">Self-service kiosk software</p>
                      </div>
                      <Checkbox />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Kitchen Display</h4>
                        <p className="text-sm text-gray-600">Kitchen display system for orders</p>
                      </div>
                      <Checkbox />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Inventory Management</h4>
                        <p className="text-sm text-gray-600">Inventory tracking and management</p>
                      </div>
                      <Checkbox />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hardware Selection Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Hardware Selection
                  </CardTitle>
                  <CardDescription>
                    Specify the quantity of hardware required
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">POS Terminals</h4>
                        <p className="text-sm text-gray-600">Point of Sale terminals</p>
                      </div>
                      <Input type="number" placeholder="0" className="w-20" />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Self-Service Kiosks</h4>
                        <p className="text-sm text-gray-600">Self-service ordering kiosks</p>
                      </div>
                      <Input type="number" placeholder="0" className="w-20" />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Kitchen Displays</h4>
                        <p className="text-sm text-gray-600">Kitchen display screens</p>
                      </div>
                      <Input type="number" placeholder="0" className="w-20" />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Printers</h4>
                        <p className="text-sm text-gray-600">Receipt and kitchen printers</p>
                      </div>
                      <Input type="number" placeholder="0" className="w-20" />
                    </div>
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
                <span>Submit for Approval</span>
              </Button>
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

      case 4: // Deployment
        return (
          <div className="space-y-6">
            {/* Action Buttons at Top */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Deployment</h2>
                <p className="text-gray-600 mt-1">Hardware installation and system deployment</p>
              </div>
              <div className="flex space-x-3">
                {canEditStep(4) && (
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
              {site.organization} • {site.foodCourt} ({site.unitCode})
            </p>
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Live Date: {new Date(site.goLiveDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
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
          <CardTitle className="flex items-center text-gray-900">
            <Info className="mr-2 h-5 w-5 text-blue-600" />
            Go-Live Progress
          </CardTitle>
          <CardDescription>
            Track the progress of this site through the SmartQ LaunchPad workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Stepper 
            steps={stepperSteps} 
            currentStep={selectedStep}
            onStepClick={setSelectedStep}
            className="mb-6"
          />
          <div className="flex justify-between items-center">
            <div className="text-base font-semibold text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
              Current Status: {getStatusDisplayName(site.status)}
            </div>
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
    </div>
  );
};

export default SiteDetail; 