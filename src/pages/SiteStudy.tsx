import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  EnhancedStepper, 
  EnhancedStepContent, 
  MultiStepForm,
  type EnhancedStepperStep 
} from '@/components/ui/enhanced-stepper';
import { 
  FileText, 
  Eye, 
  Building, 
  MapPin, 
  Users, 
  Settings, 
  Package,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Calendar,
  Search,
  Filter,
  Download,
  ArrowRight,
  User,
  Mail,
  Phone,
  Wifi,
  Zap,
  Monitor,
  Printer,
  Smartphone,
  Tv,
  Camera,
  Navigation,
  Globe,
  Map,
  Info,
  ArrowLeft,
  Home,
  ChevronRight,
  Edit,
  Save,
  X,
  StickyNote
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Loader } from '@/components/ui/loader';

import { useAuth } from '@/hooks/useAuth';
import { useSiteContext } from '@/contexts/SiteContext';
import { useToast } from '@/hooks/use-toast';
import { StakeholderManager } from '@/components/StakeholderManager';
import { SiteStudyService } from '@/services/siteStudyService';
import { Stakeholder, SiteStudyFormData } from '@/types/siteStudy';
import { GlobalSiteNotesModal } from '@/components/GlobalSiteNotesModal';

export default function SiteStudy() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentRole } = useAuth();
  const { sites, getSiteById } = useSiteContext();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoadingStudyData, setIsLoadingStudyData] = useState(true);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [studyData, setStudyData] = useState<SiteStudyFormData>({
    generalInfo: {
      sector: 'Eurest',
      foodCourtName: 'JLR Whitley',
      unitManagerName: 'Sarah Johnson',
      jobTitle: 'Operations Manager',
      unitManagerEmail: 'sarah.johnson@company.com',
      unitManagerMobile: '+44 20 7123 4567',
      additionalContactName: 'John Smith',
      additionalContactEmail: 'john.smith@company.com',
      siteStudyDate: new Date().toISOString().split('T')[0]
    },
    location: {
      address: 'Southhall Road, Crestview Hills, Birmingham, Jefferson County, Alabama, 35213, USA',
      postcode: '35213',
      region: 'West Midlands',
      country: 'United Kingdom',
      latitude: 33.523049,
      longitude: -86.737073,
      accuracy: 10
    },
    infrastructure: {
      floorPlan: 'yes',
      photos: ['floor-plan-1.jpg', 'site-photo-1.jpg'],
      counters: 4,
      mealSessions: ['Breakfast', 'Lunch', 'Dinner']
    },
    hardware: {
      smartQSolutions: ['Order Management', 'Payment Processing', 'Inventory Tracking'],
      additionalHardware: ['POS Terminals', 'Receipt Printers', 'Barcode Scanners'],
      networkRequirements: 'High-speed internet connection required, minimum 100Mbps bandwidth',
      powerRequirements: 'Standard 230V power outlets, backup power recommended'
    },
    review: {
      notes: 'Site is ready for deployment. All infrastructure requirements have been assessed.',
      recommendations: 'Proceed with hardware procurement and software installation.'
    },
    // New fields
    siteNotes: {
      notes: '',
      additionalSiteDetails: ''
    },
    stakeholders: []
  });



  // Mandatory fields validation
  const mandatoryFields = {
    generalInfo: ['sector', 'foodCourtName', 'unitManagerName', 'unitManagerEmail', 'unitManagerMobile'],
    location: ['address', 'postcode', 'region'],
    infrastructure: ['counters'],
    hardware: ['smartQSolutions'],
    // Notes and stakeholders are optional but recommended
    siteNotes: [],
    stakeholders: []
  };

  const validateMandatoryFields = () => {
    const errors: string[] = [];
    
    // Check general info
    mandatoryFields.generalInfo.forEach(field => {
      if (!studyData.generalInfo[field as keyof typeof studyData.generalInfo]) {
        errors.push(`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`);
      }
    });

    // Check location
    mandatoryFields.location.forEach(field => {
      if (!studyData.location[field as keyof typeof studyData.location]) {
        errors.push(`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`);
      }
    });

    // Check infrastructure
    if (!studyData.infrastructure.counters || studyData.infrastructure.counters <= 0) {
      errors.push('Number of counters is required and must be greater than 0');
    }

    // Check hardware
    if (!studyData.hardware.smartQSolutions.length) {
      errors.push('At least one SmartQ solution is required');
    }

    return errors;
  };

  const handleSave = () => {
    const errors = validateMandatoryFields();
    
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(', '),
        variant: "destructive"
      });
      return;
    }

    // Save the data (you can implement actual save logic here)
    console.log('Saving study data:', studyData);
    
    toast({
      title: "Success",
      description: "Site study data saved successfully!",
    });
    
    setIsEditMode(false);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    // Reset to original data if needed
  };

  // Enhanced stepper steps with collapsible functionality
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0]));
  
  const steps: EnhancedStepperStep[] = React.useMemo(() => [
    {
      id: 'site-info',
      title: 'Site Info',
      description: 'Basic site details',
      status: currentStep === 0 ? 'current' : currentStep > 0 ? 'completed' : 'upcoming',
      icon: Info,
      isExpanded: expandedSteps.has(0),
      canCollapse: true
    },
    {
      id: 'infrastructure-assessment',
      title: 'Infrastructure Assessment',
      description: 'Site infrastructure and operational details',
      status: currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'upcoming',
      icon: Building,
      isExpanded: expandedSteps.has(1),
      canCollapse: true
    },
    {
      id: 'software-scoping',
      title: 'Software Scoping',
      description: 'Software requirements and solutions',
      status: currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'upcoming',
      icon: Settings,
      isExpanded: expandedSteps.has(2),
      canCollapse: true
    },
    {
      id: 'hardware-scoping',
      title: 'Hardware Scoping',
      description: 'Hardware requirements and specifications',
      status: currentStep === 3 ? 'current' : currentStep > 3 ? 'completed' : 'upcoming',
      icon: Package,
      isExpanded: expandedSteps.has(3),
      canCollapse: true
    },
    {
      id: 'stakeholder-management',
      title: 'Stakeholder Management',
      description: 'Key stakeholders and site contacts',
      status: currentStep === 4 ? 'current' : currentStep > 4 ? 'completed' : 'upcoming',
      icon: Users,
      isExpanded: expandedSteps.has(4),
      canCollapse: true
    },
    {
      id: 'detailed-analysis',
      title: 'Detailed Site Analysis',
      description: 'Comprehensive site analysis and recommendations',
      status: currentStep === 5 ? 'current' : currentStep > 5 ? 'completed' : 'upcoming',
      icon: FileText,
      isExpanded: expandedSteps.has(5),
      canCollapse: true
    }
  ], [currentStep, expandedSteps]);

  // Get site data
  const site = id ? getSiteById(id) : null;

  // Load existing site study data
  useEffect(() => {
    const loadSiteStudyData = async () => {
      if (!id) return;
      
      try {
        const existingStudy = await SiteStudyService.getSiteStudyBySiteId(id);
        if (existingStudy) {
          setStudyData(prev => ({
            ...prev,
            siteNotes: {
              notes: existingStudy.site_notes || '',
              additionalSiteDetails: existingStudy.additional_site_details || ''
            },
            stakeholders: existingStudy.stakeholders || []
          }));
        }
      } catch (error) {
        console.error('Error loading site study data:', error);
      } finally {
        setIsLoadingStudyData(false);
      }
    };

    loadSiteStudyData();
  }, [id]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepToggle = (stepIndex: number, isExpanded: boolean) => {
    const newExpandedSteps = new Set(expandedSteps);
    if (isExpanded) {
      newExpandedSteps.add(stepIndex);
    } else {
      newExpandedSteps.delete(stepIndex);
    }
    setExpandedSteps(newExpandedSteps);
  };

  const handleComplete = () => {
    // Save study data
    console.log('Study completed:', studyData);
    navigate(`/sites/${id}`);
  };

  const handleLocationSearch = () => {
    // Location picker is only available during site creation, not editing
    toast({
      title: "Location Picker Unavailable",
      description: "Location picker is only available during site creation. Please manually enter the address details.",
      variant: "default"
    });
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    // This function is not used in edit mode
    setStudyData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        latitude: lat,
        longitude: lng,
        address: address
      }
    }));
    // setShowLocationModal(false); // Commented out as state not defined
  };

  // Handle site notes changes
  const handleSiteNotesChange = async (notes: string, additionalDetails: string) => {
    if (!id) return;
    
    try {
      const success = await SiteStudyService.updateSiteNotes(id, notes, additionalDetails);
      if (success) {
        setStudyData(prev => ({
          ...prev,
          siteNotes: { notes, additionalSiteDetails: additionalDetails }
        }));
        toast({
          title: "Success",
          description: "Site notes updated successfully!",
        });
      }
    } catch (error) {
      console.error('Error updating site notes:', error);
      toast({
        title: "Error",
        description: "Failed to update site notes. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle stakeholders changes
  const handleStakeholdersChange = async (stakeholders: Stakeholder[]) => {
    if (!id) return;
    
    try {
      const success = await SiteStudyService.updateStakeholders(id, stakeholders);
      if (success) {
        setStudyData(prev => ({
          ...prev,
          stakeholders
        }));
        toast({
          title: "Success",
          description: "Stakeholders updated successfully!",
        });
      }
    } catch (error) {
      console.error('Error updating stakeholders:', error);
      toast({
        title: "Error",
        description: "Failed to update stakeholders. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Site Info
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Site Information
              </CardTitle>
              <CardDescription>Basic site details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Organization Details */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Organization Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sector">
                      Sector <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="sector"
                      value={studyData.generalInfo.sector}
                      onChange={(e) => setStudyData(prev => ({
                        ...prev,
                        generalInfo: { ...prev.generalInfo, sector: e.target.value }
                      }))}
                      placeholder="e.g., Eurest, Sodexo"
                      disabled={!isEditMode}
                      className={!isEditMode ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="foodCourtName">
                      Food Court Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="foodCourtName"
                      value={studyData.generalInfo.foodCourtName}
                      onChange={(e) => setStudyData(prev => ({
                        ...prev,
                        generalInfo: { ...prev.generalInfo, foodCourtName: e.target.value }
                      }))}
                      placeholder="e.g., JLR Whitley"
                      disabled={!isEditMode}
                      className={!isEditMode ? "bg-gray-50" : ""}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Primary Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unitManagerName">
                      Unit Manager Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="unitManagerName"
                      value={studyData.generalInfo.unitManagerName}
                      onChange={(e) => setStudyData(prev => ({
                        ...prev,
                        generalInfo: { ...prev.generalInfo, unitManagerName: e.target.value }
                      }))}
                      placeholder="e.g., Sarah Johnson"
                      disabled={!isEditMode}
                      className={!isEditMode ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      value={studyData.generalInfo.jobTitle}
                      onChange={(e) => setStudyData(prev => ({
                        ...prev,
                        generalInfo: { ...prev.generalInfo, jobTitle: e.target.value }
                      }))}
                      placeholder="e.g., Operations Manager"
                      disabled={!isEditMode}
                      className={!isEditMode ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitManagerEmail">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="unitManagerEmail"
                      type="email"
                      value={studyData.generalInfo.unitManagerEmail}
                      onChange={(e) => setStudyData(prev => ({
                        ...prev,
                        generalInfo: { ...prev.generalInfo, unitManagerEmail: e.target.value }
                      }))}
                      placeholder="e.g., sarah.johnson@company.com"
                      disabled={!isEditMode}
                      className={!isEditMode ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitManagerMobile">
                      Mobile <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="unitManagerMobile"
                      value={studyData.generalInfo.unitManagerMobile}
                      onChange={(e) => setStudyData(prev => ({
                        ...prev,
                        generalInfo: { ...prev.generalInfo, unitManagerMobile: e.target.value }
                      }))}
                      placeholder="e.g., +44 20 7123 4567"
                      disabled={!isEditMode}
                      className={!isEditMode ? "bg-gray-50" : ""}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Contact */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Additional Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="additionalContactName">Additional Contact Name</Label>
                    <Input
                      id="additionalContactName"
                      value={studyData.generalInfo.additionalContactName}
                      onChange={(e) => setStudyData(prev => ({
                        ...prev,
                        generalInfo: { ...prev.generalInfo, additionalContactName: e.target.value }
                      }))}
                      placeholder="e.g., John Smith"
                      disabled={!isEditMode}
                      className={!isEditMode ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="additionalContactEmail">Additional Contact Email</Label>
                    <Input
                      id="additionalContactEmail"
                      type="email"
                      value={studyData.generalInfo.additionalContactEmail}
                      onChange={(e) => setStudyData(prev => ({
                        ...prev,
                        generalInfo: { ...prev.generalInfo, additionalContactEmail: e.target.value }
                      }))}
                      placeholder="e.g., john.smith@company.com"
                      disabled={!isEditMode}
                      className={!isEditMode ? "bg-gray-50" : ""}
                    />
                  </div>
                </div>
              </div>

              {/* Study Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Study Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="siteStudyDate">Site Study Date</Label>
                    <Input
                      id="siteStudyDate"
                      type="date"
                      value={studyData.generalInfo.siteStudyDate}
                      onChange={(e) => setStudyData(prev => ({
                        ...prev,
                        generalInfo: { ...prev.generalInfo, siteStudyDate: e.target.value }
                      }))}
                      disabled={!isEditMode}
                      className={!isEditMode ? "bg-gray-50" : ""}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 1: // Infrastructure Assessment
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Infrastructure Assessment
              </CardTitle>
              <CardDescription>Site infrastructure and operational details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Location Details */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Location Information</h4>
                
                {/* Read-only location display */}
                {!isEditMode && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {studyData.location.address ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Selected Address</Label>
                            <p className="text-gray-900 mt-1">{studyData.location.address}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Postcode</Label>
                            <p className="text-gray-900 mt-1">{studyData.location.postcode || 'Not specified'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Region</Label>
                            <p className="text-gray-900 mt-1">{studyData.location.region || 'Not specified'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Country</Label>
                            <p className="text-gray-900 mt-1">{studyData.location.country || 'Not specified'}</p>
                          </div>
                        </div>
                        {(studyData.location.latitude && studyData.location.longitude) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Latitude</Label>
                              <p className="text-gray-900 mt-1">{studyData.location.latitude}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Longitude</Label>
                              <p className="text-gray-900 mt-1">{studyData.location.longitude}</p>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No location information available</p>
                        <p className="text-sm text-gray-400">Click "Edit Site Study" to add location details</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Editable location form */}
                {isEditMode && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="address">
                        Site Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="address"
                        value={studyData.location.address}
                        onChange={(e) => setStudyData(prev => ({
                          ...prev,
                          location: { ...prev.location, address: e.target.value }
                        }))}
                        placeholder="Enter site address"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Location coordinates are managed during site creation. You can update the address details here.
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="postcode">
                        Postcode <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="postcode"
                        value={studyData.location.postcode}
                        onChange={(e) => setStudyData(prev => ({
                          ...prev,
                          location: { ...prev.location, postcode: e.target.value }
                        }))}
                        placeholder="e.g., CV3 4LF"
                      />
                    </div>
                    <div>
                      <Label htmlFor="region">
                        Region <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="region"
                        value={studyData.location.region}
                        onChange={(e) => setStudyData(prev => ({
                          ...prev,
                          location: { ...prev.location, region: e.target.value }
                        }))}
                        placeholder="e.g., West Midlands"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={studyData.location.country}
                        onChange={(e) => setStudyData(prev => ({
                          ...prev,
                          location: { ...prev.location, country: e.target.value }
                        }))}
                        placeholder="e.g., United Kingdom"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Infrastructure Details */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Infrastructure Assessment</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="counters">
                      Number of Counters <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="counters"
                      type="number"
                      value={studyData.infrastructure.counters}
                      onChange={(e) => setStudyData(prev => ({
                        ...prev,
                        infrastructure: { ...prev.infrastructure, counters: parseInt(e.target.value) || 0 }
                      }))}
                      placeholder="e.g., 4"
                      disabled={!isEditMode}
                      className={!isEditMode ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="floorPlan">Floor Plan Available</Label>
                    <Select 
                      value={studyData.infrastructure.floorPlan} 
                      onValueChange={(value) => setStudyData(prev => ({
                        ...prev,
                        infrastructure: { ...prev.infrastructure, floorPlan: value }
                      }))}
                      disabled={!isEditMode}
                    >
                      <SelectTrigger className={!isEditMode ? "bg-gray-50" : ""}>
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="mealSessions">Meal Sessions</Label>
                  <Textarea
                    id="mealSessions"
                    value={studyData.infrastructure.mealSessions.join(', ')}
                    onChange={(e) => setStudyData(prev => ({
                      ...prev,
                      infrastructure: { 
                        ...prev.infrastructure, 
                        mealSessions: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                      }
                    }))}
                    placeholder="e.g., Breakfast, Lunch, Dinner"
                    rows={2}
                    disabled={!isEditMode}
                    className={!isEditMode ? "bg-gray-50" : ""}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2: // Software Scoping
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Software Scoping
              </CardTitle>
              <CardDescription>Define software requirements and solutions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* SmartQ Solutions */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">SmartQ Solutions</h4>
                <div>
                  <Label htmlFor="smartQSolutions">
                    Required Solutions <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="smartQSolutions"
                    value={studyData.hardware.smartQSolutions.join(', ')}
                    onChange={(e) => setStudyData(prev => ({
                      ...prev,
                      hardware: { 
                        ...prev.hardware, 
                        smartQSolutions: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                      }
                    }))}
                    placeholder="Enter required SmartQ solutions (comma-separated)"
                    rows={3}
                    disabled={!isEditMode}
                    className={!isEditMode ? "bg-gray-50" : ""}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Examples: Order Management, Payment Processing, Inventory Tracking, Analytics Dashboard
                  </p>
                </div>
              </div>

              {/* Technical Requirements */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Technical Requirements</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="networkRequirements">Network Requirements</Label>
                    <Textarea
                      id="networkRequirements"
                      value={studyData.hardware.networkRequirements}
                      onChange={(e) => setStudyData(prev => ({
                        ...prev,
                        hardware: { ...prev.hardware, networkRequirements: e.target.value }
                      }))}
                      placeholder="Describe network requirements, bandwidth needs, security considerations..."
                      rows={3}
                      disabled={!isEditMode}
                      className={!isEditMode ? "bg-gray-50" : ""}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 3: // Hardware Scoping
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Hardware Scoping
              </CardTitle>
              <CardDescription>Define hardware requirements and specifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hardware Requirements */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Hardware Requirements</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="additionalHardware">Additional Hardware Required</Label>
                    <Textarea
                      id="additionalHardware"
                      value={studyData.hardware.additionalHardware.join(', ')}
                      onChange={(e) => setStudyData(prev => ({
                        ...prev,
                        hardware: { 
                          ...prev.hardware, 
                          additionalHardware: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                        }
                      }))}
                      placeholder="Enter additional hardware requirements (comma-separated)"
                      rows={3}
                      disabled={!isEditMode}
                      className={!isEditMode ? "bg-gray-50" : ""}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Examples: POS Terminals, Receipt Printers, Barcode Scanners, Cash Drawers
                    </p>
                  </div>
                </div>
              </div>

              {/* Power & Infrastructure */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Power & Infrastructure</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="powerRequirements">Power Requirements</Label>
                    <Textarea
                      id="powerRequirements"
                      value={studyData.hardware.powerRequirements}
                      onChange={(e) => setStudyData(prev => ({
                        ...prev,
                        hardware: { ...prev.hardware, powerRequirements: e.target.value }
                      }))}
                      placeholder="Describe power requirements, voltage needs, backup power considerations..."
                      rows={3}
                      disabled={!isEditMode}
                      className={!isEditMode ? "bg-gray-50" : ""}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 4: // Stakeholder Management
        return (
          <div className="space-y-6">
            {/* Site Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StickyNote className="h-5 w-5" />
                  Site Notes & Details
                </CardTitle>
                <CardDescription>
                  Manage site notes and additional details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="site-notes">Site Notes</Label>
                  <Textarea
                    id="site-notes"
                    placeholder="Enter site notes and additional information..."
                    value={studyData.siteNotes.notes}
                    onChange={(e) => setStudyData(prev => ({
                      ...prev,
                      siteNotes: { ...prev.siteNotes, notes: e.target.value }
                    }))}
                    rows={4}
                    disabled={!isEditMode}
                    className={!isEditMode ? "bg-gray-50" : ""}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    These notes will be added to the site with your name and role
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="additional-site-details">Additional Site Details</Label>
                  <Textarea
                    id="additional-site-details"
                    placeholder="Enter any additional site details..."
                    value={studyData.siteNotes.additionalSiteDetails}
                    onChange={(e) => setStudyData(prev => ({
                      ...prev,
                      siteNotes: { ...prev.siteNotes, additionalSiteDetails: e.target.value }
                    }))}
                    rows={4}
                    disabled={!isEditMode}
                    className={!isEditMode ? "bg-gray-50" : ""}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stakeholders */}
            <StakeholderManager
              siteId={id || ''}
              stakeholders={studyData.stakeholders}
              onStakeholdersChange={handleStakeholdersChange}
              disabled={!isEditMode}
            />
          </div>
        );

      case 5: // Detailed Site Analysis
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detailed Site Analysis
              </CardTitle>
              <CardDescription>Comprehensive site analysis and recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Review and Recommendations */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Review & Recommendations</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="reviewNotes">Site Notes</Label>
                    <Textarea
                      id="reviewNotes"
                      value={studyData.review.notes}
                      onChange={(e) => setStudyData(prev => ({
                        ...prev,
                        review: { ...prev.review, notes: e.target.value }
                      }))}
                      placeholder="Enter site notes and observations"
                      rows={4}
                      disabled={!isEditMode}
                      className={!isEditMode ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="recommendations">Recommendations</Label>
                    <Textarea
                      id="recommendations"
                      value={studyData.review.recommendations}
                      onChange={(e) => setStudyData(prev => ({
                        ...prev,
                        review: { ...prev.review, recommendations: e.target.value }
                      }))}
                      placeholder="Enter recommendations for the site"
                      rows={4}
                      disabled={!isEditMode}
                      className={!isEditMode ? "bg-gray-50" : ""}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

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

  if (isLoadingStudyData) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <Loader size="lg" />
          <p className="text-gray-600 mt-4">Loading site study...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/sites" className="flex items-center space-x-1 hover:text-gray-900">
          <Home className="h-4 w-4" />
          <span>Sites</span>
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link to={`/sites/${id}`} className="hover:text-gray-900">
          {site.name}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Site Study</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Site Study - {site.name}</h1>
          <p className="text-gray-600 mt-1">
            Complete the site study for {site.organization} • {site.foodCourt}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {!isEditMode ? (
            <Button
              onClick={() => setIsEditMode(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Site Study
            </Button>
          ) : (
            <>
              <Button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          )}
          <Button
            variant="outline"
            onClick={() => navigate(`/sites/${id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Site
          </Button>
        </div>
      </div>

      {/* Mandatory Fields Note */}
      {!isEditMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">View Mode</h3>
              <p className="text-sm text-blue-700 mt-1">
                Click "Edit Site Study" to modify the information. Fields marked with <span className="text-red-500">*</span> are mandatory.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Stepper Form */}
      <MultiStepForm
        steps={steps}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        onStepToggle={handleStepToggle}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onComplete={handleComplete}
        canProceed={true}
        showNavigation={true}
      >
        {/* Step 1: Site Info */}
        {currentStep === 0 && (
          <EnhancedStepContent
            step={steps[0]}
            isExpanded={expandedSteps.has(0)}
            onToggle={() => handleStepToggle(0, !expandedSteps.has(0))}
            canCollapse={true}
          >
            {renderStepContent()}
          </EnhancedStepContent>
        )}

        {/* Step 2: Infrastructure Assessment */}
        {currentStep === 1 && (
          <EnhancedStepContent
            step={steps[1]}
            isExpanded={expandedSteps.has(1)}
            onToggle={() => handleStepToggle(1, !expandedSteps.has(1))}
            canCollapse={true}
          >
            {renderStepContent()}
          </EnhancedStepContent>
        )}

        {/* Step 3: Software Scoping */}
        {currentStep === 2 && (
          <EnhancedStepContent
            step={steps[2]}
            isExpanded={expandedSteps.has(2)}
            onToggle={() => handleStepToggle(2, !expandedSteps.has(2))}
            canCollapse={true}
          >
            {renderStepContent()}
          </EnhancedStepContent>
        )}

        {/* Step 4: Hardware Scoping */}
        {currentStep === 3 && (
          <EnhancedStepContent
            step={steps[3]}
            isExpanded={expandedSteps.has(3)}
            onToggle={() => handleStepToggle(3, !expandedSteps.has(3))}
            canCollapse={true}
          >
            {renderStepContent()}
          </EnhancedStepContent>
        )}

        {/* Step 5: Stakeholder Management */}
        {currentStep === 4 && (
          <EnhancedStepContent
            step={steps[4]}
            isExpanded={expandedSteps.has(4)}
            onToggle={() => handleStepToggle(4, !expandedSteps.has(4))}
            canCollapse={true}
          >
            {renderStepContent()}
          </EnhancedStepContent>
        )}

        {/* Step 6: Detailed Site Analysis */}
        {currentStep === 5 && (
          <EnhancedStepContent
            step={steps[5]}
            isExpanded={expandedSteps.has(5)}
            onToggle={() => handleStepToggle(5, !expandedSteps.has(5))}
            canCollapse={true}
          >
            {renderStepContent()}
          </EnhancedStepContent>
        )}
      </MultiStepForm>

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
} 