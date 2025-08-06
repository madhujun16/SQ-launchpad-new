import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Map
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

export default function SiteStudy() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    organisation: 'all',
    status: 'all',
    engineer: 'all'
  });
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState(null);


  // Mock statistics
  const stats = {
    totalStudies: 24,
    completedStudies: 18,
    inProgressStudies: 4,
    pendingStudies: 2,
    upcomingGoLives: 3,
    averageCompletionTime: '5.2 days'
  };

  // Mock site studies data with detailed information including geolocation
  const siteStudies = [
    {
      id: '1',
      siteName: 'JLR Whitley',
      organisation: 'Compass Eurest',
      unitCode: '93490',
      studyCompletionDate: '2025-10-28',
      deploymentEngineer: 'John Smith',
      status: 'completed',
      goLiveDate: '2025-11-01',
      // Geolocation data
      geolocation: {
        latitude: 52.4068,
        longitude: -1.5197,
        accuracy: 15,
        capturedAt: '2025-10-28T10:30:00Z',
        address: 'JLR Whitley, Abbey Road, Coventry, CV3 4LF',
        postcode: 'CV3 4LF',
        region: 'West Midlands',
        country: 'United Kingdom'
      },
      // Detailed information for report
      generalInfo: {
        sector: 'Eurest',
        foodCourtName: 'JLR Whitley',
        unitManagerName: 'Sarah Johnson',
        jobTitle: 'Operations Manager',
        unitManagerEmail: 'sarah.johnson@jlr.com',
        unitManagerMobile: '+44 7700 900123',
        additionalContactName: 'Mike Wilson',
        additionalContactEmail: 'mike.wilson@jlr.com',
        siteStudyDate: '2025-10-28'
      },
      locationInfo: {
        addressLine1: 'JLR Whitley',
        addressLine2: 'Abbey Road',
        city: 'Coventry',
        postcode: 'CV3 4LF',
        securityRestrictions: 'Security pass required for all visitors',
        preferredDeliveryWindow: '10:00 AM–2:00 PM',
        floor: '2nd Floor',
        liftAccess: true,
        loadingBayDetails: 'Loading bay available with dock access',
        // Enhanced location data
        coordinates: {
          latitude: 52.4068,
          longitude: -1.5197
        },
        timezone: 'Europe/London',
        elevation: 85, // meters above sea level
        accessibility: {
          wheelchairAccessible: true,
          parkingAvailable: true,
          publicTransportNearby: true
        }
      },
      capacityInfo: {
        employeeStrength: 2500,
        expectedFootfall: 800,
        seatingCapacity: 300,
        operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        operatingHours: '7:00 AM - 6:00 PM'
      },
      serviceInfo: {
        serviceModel: 'Self-Service',
        billingModel: 'Per Counter',
        centralCashCounterFinalized: true,
        menuStyle: 'Grab & Go',
        dayPartsServed: ['Breakfast', 'Lunch', 'Snacks'],
        mealPrepLocation: 'On-site'
      },
      counterInfo: {
        activeCounters: 4,
        counters: [
          { name: 'Counter 1', spaceAvailable: 'adequate', posHardwareFitment: true },
          { name: 'Counter 2', spaceAvailable: 'spacious', posHardwareFitment: true },
          { name: 'Counter 3', spaceAvailable: 'tight', posHardwareFitment: false },
          { name: 'Counter 4', spaceAvailable: 'adequate', posHardwareFitment: true }
        ]
      },
      infrastructureInfo: {
        availableLanPoints: 8,
        wifiAvailable: true,
        bandwidthTestResult: '6 Mbps',
        staticIpProvided: true,
        switchRouterLocation: 'Server room, 2nd floor',
        upsPowerPos: true,
        upsPowerCeiling: false,
        sockets4Pin: 6,
        sockets3Pin: 12
      },
      hardwareNeeds: [
        { deviceType: 'POS Terminals', required: true, quantity: 4, comments: 'Standard POS setup' },
        { deviceType: 'PEDs (Card Machines)', required: true, quantity: 4, comments: 'Contactless enabled' },
        { deviceType: 'Printers (KOT/BOH)', required: true, quantity: 2, comments: 'Kitchen and back office' },
        { deviceType: 'Kiosks', required: false, quantity: 0, comments: '' },
        { deviceType: 'Kitchen Display Sys', required: true, quantity: 1, comments: 'Kitchen order display' },
        { deviceType: 'Token Display Sys', required: false, quantity: 0, comments: '' },
        { deviceType: 'TVs (IMD/Marketing)', required: true, quantity: 2, comments: 'Wall mounted' },
        { deviceType: 'Clamps/Fixtures', required: true, quantity: 4, comments: 'Ceiling mounted' }
      ],
      facilityInfo: {
        ceilingHeight: 3.2,
        cableRoutingFeasible: true,
        physicalObstructions: 'None',
        preferredImdLocation: 'Main entrance and dining area',
        cctvPresent: true,
        civilWorkRequired: false
      },
      readinessInfo: {
        siteDeploymentReady: true,
        keyBlockers: 'None',
        unresolvedDependencies: false,
        dependencyDetails: '',
        notesForNextVisit: 'Site ready for deployment',
        suggestedGoLiveDate: '2025-11-01'
      }
    },
    {
      id: '2',
      siteName: 'Amazon London',
      organisation: 'Amazon',
      unitCode: 'A123',
      studyCompletionDate: '2025-10-25',
      deploymentEngineer: 'Jane Doe',
      status: 'in_progress',
      goLiveDate: '2025-11-15',
      geolocation: {
        latitude: 51.5074,
        longitude: -0.1278,
        accuracy: 20,
        capturedAt: '2025-10-25T14:15:00Z',
        address: 'Amazon London, Canary Wharf, London, E14 5AB',
        postcode: 'E14 5AB',
        region: 'Greater London',
        country: 'United Kingdom'
      },
      // Simplified data for in-progress study
      generalInfo: {
        sector: 'Amazon',
        foodCourtName: 'Amazon London',
        unitManagerName: 'Alex Brown',
        jobTitle: 'Facility Manager',
        unitManagerEmail: 'alex.brown@amazon.com',
        unitManagerMobile: '+44 7700 900456',
        additionalContactName: '',
        additionalContactEmail: '',
        siteStudyDate: '2025-10-25'
      }
    },
    {
      id: '3',
      siteName: 'HSBC Canary Wharf',
      organisation: 'HSBC',
      unitCode: 'H456',
      studyCompletionDate: '2025-10-20',
      deploymentEngineer: 'Mike Johnson',
      status: 'pending',
      goLiveDate: '2025-12-01',
      geolocation: {
        latitude: 51.5055,
        longitude: -0.0235,
        accuracy: 25,
        capturedAt: '2025-10-20T09:45:00Z',
        address: 'HSBC Canary Wharf, London, E14 4AB',
        postcode: 'E14 4AB',
        region: 'Greater London',
        country: 'United Kingdom'
      },
      // Simplified data for pending study
      generalInfo: {
        sector: 'HSBC',
        foodCourtName: 'HSBC Canary Wharf',
        unitManagerName: 'Emma Wilson',
        jobTitle: 'Operations Director',
        unitManagerEmail: 'emma.wilson@hsbc.com',
        unitManagerMobile: '+44 7700 900789',
        additionalContactName: '',
        additionalContactEmail: '',
        siteStudyDate: '2025-10-20'
      }
    }
  ];

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationPermission('granted');
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationPermission('denied');
        }
      );
    } else {
      setLocationPermission('denied');
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredStudies = siteStudies.filter(study =>
    searchTerm === '' || 
    study.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    study.organisation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    study.unitCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewReport = (study: any) => {
    setSelectedStudy(study);
    setIsReportModalOpen(true);
  };





  const getGoogleMapsUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  };

  const getOpenStreetMapUrl = (lat: number, lng: number) => {
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;
  };

  const renderReportModal = () => {
    if (!selectedStudy) return null;

    return (
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Site Study Report - {selectedStudy.siteName}
            </DialogTitle>
            <DialogDescription>
              Comprehensive site study details and deployment readiness assessment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Geolocation Information */}
            {selectedStudy.geolocation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Location & Coordinates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                      <p className="font-medium">{selectedStudy.geolocation.address}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Postcode</Label>
                      <p className="font-medium">{selectedStudy.geolocation.postcode}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Region</Label>
                      <p className="font-medium">{selectedStudy.geolocation.region}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Country</Label>
                      <p className="font-medium">{selectedStudy.geolocation.country}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Latitude</Label>
                      <p className="font-mono text-sm">{selectedStudy.geolocation.latitude.toFixed(6)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Longitude</Label>
                      <p className="font-mono text-sm">{selectedStudy.geolocation.longitude.toFixed(6)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Accuracy</Label>
                      <p className="font-medium">±{selectedStudy.geolocation.accuracy}m</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(getGoogleMapsUrl(selectedStudy.geolocation.latitude, selectedStudy.geolocation.longitude), '_blank')}
                    >
                      <Map className="h-4 w-4 mr-2" />
                      View on Google Maps
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(getOpenStreetMapUrl(selectedStudy.geolocation.latitude, selectedStudy.geolocation.longitude), '_blank')}
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      View on OpenStreetMap
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* General Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  General Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Organisation</Label>
                  <p className="font-medium">{selectedStudy.organisation}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Sector</Label>
                  <p className="font-medium">{selectedStudy.generalInfo?.sector}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Unit Manager</Label>
                  <p className="font-medium">{selectedStudy.generalInfo?.unitManagerName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Job Title</Label>
                  <p className="font-medium">{selectedStudy.generalInfo?.jobTitle}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedStudy.generalInfo?.unitManagerEmail}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Mobile</Label>
                  <p className="font-medium">{selectedStudy.generalInfo?.unitManagerMobile}</p>
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            {selectedStudy.locationInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location & Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                      <p className="font-medium">
                        {selectedStudy.locationInfo.addressLine1}<br />
                        {selectedStudy.locationInfo.addressLine2 && (
                          <>{selectedStudy.locationInfo.addressLine2}<br /></>
                        )}
                        {selectedStudy.locationInfo.city}, {selectedStudy.locationInfo.postcode}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Floor</Label>
                      <p className="font-medium">{selectedStudy.locationInfo.floor}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Security Restrictions</Label>
                    <p className="font-medium">{selectedStudy.locationInfo.securityRestrictions}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Delivery Window</Label>
                      <p className="font-medium">{selectedStudy.locationInfo.preferredDeliveryWindow}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Lift Access</Label>
                      <Badge variant={selectedStudy.locationInfo.liftAccess ? "default" : "secondary"}>
                        {selectedStudy.locationInfo.liftAccess ? "Available" : "Not Available"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Capacity Information */}
            {selectedStudy.capacityInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Staff & Capacity Planning
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Employee Strength</Label>
                    <p className="text-2xl font-bold">{selectedStudy.capacityInfo.employeeStrength}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Expected Footfall</Label>
                    <p className="text-2xl font-bold">{selectedStudy.capacityInfo.expectedFootfall}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Seating Capacity</Label>
                    <p className="text-2xl font-bold">{selectedStudy.capacityInfo.seatingCapacity}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-muted-foreground">Operating Days</Label>
                    <p className="font-medium">{selectedStudy.capacityInfo.operatingDays.join(', ')}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Operating Hours</Label>
                    <p className="font-medium">{selectedStudy.capacityInfo.operatingHours}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Infrastructure Information */}
            {selectedStudy.infrastructureInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    IT & Power Infrastructure
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">LAN Points</Label>
                    <p className="font-medium">{selectedStudy.infrastructureInfo.availableLanPoints}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Wi-Fi Available</Label>
                    <Badge variant={selectedStudy.infrastructureInfo.wifiAvailable ? "default" : "secondary"}>
                      {selectedStudy.infrastructureInfo.wifiAvailable ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Bandwidth</Label>
                    <p className="font-medium">{selectedStudy.infrastructureInfo.bandwidthTestResult}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Static IP</Label>
                    <Badge variant={selectedStudy.infrastructureInfo.staticIpProvided ? "default" : "secondary"}>
                      {selectedStudy.infrastructureInfo.staticIpProvided ? "Provided" : "Not Provided"}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">UPS Power (POS)</Label>
                    <Badge variant={selectedStudy.infrastructureInfo.upsPowerPos ? "default" : "secondary"}>
                      {selectedStudy.infrastructureInfo.upsPowerPos ? "Available" : "Not Available"}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">UPS Power (Ceiling)</Label>
                    <Badge variant={selectedStudy.infrastructureInfo.upsPowerCeiling ? "default" : "secondary"}>
                      {selectedStudy.infrastructureInfo.upsPowerCeiling ? "Available" : "Not Available"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Hardware Needs */}
            {selectedStudy.hardwareNeeds && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Hardware Deployment Needs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedStudy.hardwareNeeds.map((need: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant={need.required ? "default" : "secondary"}>
                            {need.required ? "Required" : "Optional"}
                          </Badge>
                          <span className="font-medium">{need.deviceType}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            Quantity: {need.quantity}
                          </span>
                          {need.comments && (
                            <span className="text-sm text-muted-foreground">
                              {need.comments}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Readiness Information */}
            {selectedStudy.readinessInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Readiness & Risks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-muted-foreground">Site Deployment Ready</Label>
                    <Badge variant={selectedStudy.readinessInfo.siteDeploymentReady ? "default" : "destructive"}>
                      {selectedStudy.readinessInfo.siteDeploymentReady ? "Ready" : "Not Ready"}
                    </Badge>
                  </div>
                  {selectedStudy.readinessInfo.keyBlockers && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Key Blockers</Label>
                      <p className="font-medium">{selectedStudy.readinessInfo.keyBlockers}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-muted-foreground">Unresolved Dependencies</Label>
                    <Badge variant={selectedStudy.readinessInfo.unresolvedDependencies ? "destructive" : "default"}>
                      {selectedStudy.readinessInfo.unresolvedDependencies ? "Yes" : "No"}
                    </Badge>
                  </div>
                  {selectedStudy.readinessInfo.suggestedGoLiveDate && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Suggested Go-Live Date</Label>
                      <p className="font-medium">{selectedStudy.readinessInfo.suggestedGoLiveDate}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsReportModalOpen(false)}>
              Close
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full max-w-none px-2 sm:px-4 lg:px-6 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Site Study Management</h1>
            <p className="text-muted-foreground">
              View and manage site study progress across all locations
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Studies</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudies}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                +12% from last month
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedStudies}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                Ready for deployment
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.inProgressStudies}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Clock className="h-3 w-3 mr-1 text-yellow-500" />
                Under review
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Go-Lives</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.upcomingGoLives}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Calendar className="h-3 w-3 mr-1 text-blue-500" />
                Next 30 days
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">View All Studies</h3>
                  <p className="text-sm text-muted-foreground">Browse completed and ongoing studies</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Download className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Export Reports</h3>
                  <p className="text-sm text-muted-foreground">Download study data and analytics</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Go-Live Calendar</h3>
                  <p className="text-sm text-muted-foreground">Track upcoming deployments</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Site Studies */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Site Studies</CardTitle>
                <CardDescription>Latest site studies and their status</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search site studies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filters.organisation} onValueChange={(value) => setFilters({...filters, organisation: value})}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Organisations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organisations</SelectItem>
                  <SelectItem value="asda">ASDA</SelectItem>
                  <SelectItem value="amazon">Amazon</SelectItem>
                  <SelectItem value="hsbc">HSBC</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Site Studies Table */}
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site Name</TableHead>
                    <TableHead>Organisation</TableHead>
                    <TableHead>Unit Code</TableHead>
                    <TableHead>Study Completion Date</TableHead>
                    <TableHead>Deployment Engineer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Go-Live Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudies.map((study) => (
                    <TableRow key={study.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{study.siteName}</TableCell>
                      <TableCell>{study.organisation}</TableCell>
                      <TableCell>{study.unitCode}</TableCell>
                      <TableCell>{new Date(study.studyCompletionDate).toLocaleDateString()}</TableCell>
                      <TableCell>{study.deploymentEngineer}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(study.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(study.status)}
                            {study.status.replace('_', ' ')}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(study.goLiveDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewReport(study)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>



        {/* Report Modal */}
        {renderReportModal()}
      </main>
    </div>
  );
} 