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
import { Stepper, StepperContent, type StepperStep } from '@/components/ui/stepper';
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
  ChevronRight
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useSiteContext } from '@/contexts/SiteContext';

export default function SiteStudy() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentRole } = useAuth();
  const { sites, getSiteById } = useSiteContext();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [studyData, setStudyData] = useState({
    generalInfo: {
      sector: '',
      foodCourtName: '',
      unitManagerName: '',
      jobTitle: '',
      unitManagerEmail: '',
      unitManagerMobile: '',
      additionalContactName: '',
      additionalContactEmail: '',
      siteStudyDate: new Date().toISOString().split('T')[0]
    },
    location: {
      address: '',
      postcode: '',
      region: '',
      country: 'United Kingdom',
      latitude: null as number | null,
      longitude: null as number | null,
      accuracy: null as number | null
    },
    infrastructure: {
      floorPlan: '',
      photos: [] as string[],
      counters: 0,
      mealSessions: [] as string[]
    },
    hardware: {
      smartQSolutions: [] as string[],
      additionalHardware: [] as string[],
      networkRequirements: '',
      powerRequirements: ''
    },
    review: {
      notes: '',
      recommendations: ''
    }
  });

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');

  // Stepper steps - updated when currentStep changes
  const steps: StepperStep[] = React.useMemo(() => [
    {
      id: 'site-info',
      title: 'Site Info',
      description: 'Basic site details',
      status: currentStep === 0 ? 'current' : currentStep > 0 ? 'completed' : 'upcoming',
      icon: Info
    },
    {
      id: 'site-study',
      title: 'Site Study',
      description: 'Location & infrastructure',
      status: currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'upcoming',
      icon: FileText
    },
    {
      id: 'software-scoping',
      title: 'Software Scoping',
      description: 'Software requirements',
      status: currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'upcoming',
      icon: Settings
    },
    {
      id: 'hardware-scoping',
      title: 'Hardware Scoping',
      description: 'Hardware requirements',
      status: currentStep === 3 ? 'current' : currentStep > 3 ? 'completed' : 'upcoming',
      icon: Package
    }
  ], [currentStep]);

  // Get site data
  const site = id ? getSiteById(id) : null;

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

  const handleComplete = () => {
    // Save study data
    console.log('Study completed:', studyData);
    navigate(`/sites/${id}`);
  };

  const handleLocationSearch = () => {
    setShowLocationModal(true);
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setStudyData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        latitude: lat,
        longitude: lng,
        address: address
      }
    }));
    setShowLocationModal(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Site Info
        return (
          <Card>
            <CardHeader>
              <CardTitle>Site Information</CardTitle>
              <CardDescription>Basic site details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sector">Sector</Label>
                  <Input
                    id="sector"
                    value={studyData.generalInfo.sector}
                    onChange={(e) => setStudyData(prev => ({
                      ...prev,
                      generalInfo: { ...prev.generalInfo, sector: e.target.value }
                    }))}
                    placeholder="e.g., Eurest, Sodexo"
                  />
                </div>
                <div>
                  <Label htmlFor="foodCourtName">Food Court Name</Label>
                  <Input
                    id="foodCourtName"
                    value={studyData.generalInfo.foodCourtName}
                    onChange={(e) => setStudyData(prev => ({
                      ...prev,
                      generalInfo: { ...prev.generalInfo, foodCourtName: e.target.value }
                    }))}
                    placeholder="e.g., JLR Whitley"
                  />
                </div>
                <div>
                  <Label htmlFor="unitManagerName">Unit Manager Name</Label>
                  <Input
                    id="unitManagerName"
                    value={studyData.generalInfo.unitManagerName}
                    onChange={(e) => setStudyData(prev => ({
                      ...prev,
                      generalInfo: { ...prev.generalInfo, unitManagerName: e.target.value }
                    }))}
                    placeholder="e.g., Sarah Johnson"
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
                  />
                </div>
                <div>
                  <Label htmlFor="unitManagerEmail">Email</Label>
                  <Input
                    id="unitManagerEmail"
                    type="email"
                    value={studyData.generalInfo.unitManagerEmail}
                    onChange={(e) => setStudyData(prev => ({
                      ...prev,
                      generalInfo: { ...prev.generalInfo, unitManagerEmail: e.target.value }
                    }))}
                    placeholder="e.g., sarah.johnson@company.com"
                  />
                </div>
                <div>
                  <Label htmlFor="unitManagerMobile">Mobile</Label>
                  <Input
                    id="unitManagerMobile"
                    value={studyData.generalInfo.unitManagerMobile}
                    onChange={(e) => setStudyData(prev => ({
                      ...prev,
                      generalInfo: { ...prev.generalInfo, unitManagerMobile: e.target.value }
                    }))}
                    placeholder="e.g., +44 7700 900123"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 1: // Site Study
        return (
          <Card>
            <CardHeader>
              <CardTitle>Site Study</CardTitle>
              <CardDescription>Location and infrastructure details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="address">Site Address</Label>
                  <div className="flex gap-2">
                    <Input
                      id="address"
                      value={studyData.location.address}
                      onChange={(e) => setStudyData(prev => ({
                        ...prev,
                        location: { ...prev.location, address: e.target.value }
                      }))}
                      placeholder="Enter site address"
                    />
                    <Button
                      variant="outline"
                      onClick={handleLocationSearch}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Tag Location
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="postcode">Postcode</Label>
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
                  <Label htmlFor="region">Region</Label>
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
                  <Label htmlFor="counters">Number of Counters</Label>
                  <Input
                    id="counters"
                    type="number"
                    value={studyData.infrastructure.counters}
                    onChange={(e) => setStudyData(prev => ({
                      ...prev,
                      infrastructure: { ...prev.infrastructure, counters: parseInt(e.target.value) || 0 }
                    }))}
                    placeholder="e.g., 4"
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
              <CardTitle>Software Scoping</CardTitle>
              <CardDescription>Define software requirements and solutions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="smartQSolutions">SmartQ Solutions Required</Label>
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
                  />
                </div>
                <div>
                  <Label htmlFor="networkRequirements">Network Requirements</Label>
                  <Textarea
                    id="networkRequirements"
                    value={studyData.hardware.networkRequirements}
                    onChange={(e) => setStudyData(prev => ({
                      ...prev,
                      hardware: { ...prev.hardware, networkRequirements: e.target.value }
                    }))}
                    placeholder="Describe network requirements..."
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 3: // Hardware Scoping
        return (
          <Card>
            <CardHeader>
              <CardTitle>Hardware Scoping</CardTitle>
              <CardDescription>Define hardware requirements and specifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  />
                </div>
                <div>
                  <Label htmlFor="powerRequirements">Power Requirements</Label>
                  <Textarea
                    id="powerRequirements"
                    value={studyData.hardware.powerRequirements}
                    onChange={(e) => setStudyData(prev => ({
                      ...prev,
                      hardware: { ...prev.hardware, powerRequirements: e.target.value }
                    }))}
                    placeholder="Describe power requirements..."
                    rows={3}
                  />
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
        <Button
          variant="outline"
          onClick={() => navigate(`/sites/${id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Site
        </Button>
      </div>

      {/* Stepper Form */}
      <StepperContent
        steps={steps}
        currentStep={currentStep}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onComplete={handleComplete}
        canProceed={true}
      >
        {renderStepContent()}
      </StepperContent>

      {/* Location Modal */}
      <Dialog open={showLocationModal} onOpenChange={setShowLocationModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tag Site Location</DialogTitle>
            <DialogDescription>
              Search for the site location or select it on the map
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="locationSearch">Search Location</Label>
              <div className="flex gap-2">
                <Input
                  id="locationSearch"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  placeholder="Search for address, postcode, or landmark..."
                />
                <Button onClick={() => {
                  // In a real app, this would integrate with Google Maps API
                  // For now, we'll simulate a location selection
                  handleLocationSelect(52.4068, -1.5197, locationSearch || 'JLR Whitley, Abbey Road, Coventry, CV3 4LF');
                }}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Map className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Map integration would go here</p>
                <p className="text-sm text-gray-500">Google Maps or OpenStreetMap integration</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 