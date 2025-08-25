import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/roles';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Users, 
  MapPin, 
  FileText,
  Plus,
  Trash2,
  Save,
  AlertTriangle,
  CheckCircle,
  Calendar,
  User,
  Wrench,
  Shield,
  ArrowLeft,
  Loader,
  ChevronDown,
  ChevronRight,
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
  Settings,
  Package
} from 'lucide-react';
import { toast } from 'sonner';
import { SitesService, type Site, type Organization } from '@/services/sitesService';
import { LocationPicker } from '@/components/ui/location-picker';
import { UserService, UserWithRole } from '@/services/userService';

interface SiteData {
  name: string;
  organization: string;
  sector: string;
  unitCode: string;
  targetLiveDate: string;
  criticalityLevel: 'low' | 'medium' | 'high';
  teamAssignment: string;
  operationsManager: string;
  deploymentEngineer: string;
  location: string;
  postcode: string;
  region: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  siteNotes: string;
  additionalSiteDetails: string;
  // Contact fields
  unitManagerName: string;
  jobTitle: string;
  unitManagerEmail: string;
  unitManagerMobile: string;
  additionalContactName: string;
  additionalContactEmail: string;
}

const SiteCreation = () => {
  const { currentRole, profile } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<SiteData>({
    name: '',
    organization: '',
    sector: '',
    unitCode: '',
    targetLiveDate: '',
    criticalityLevel: 'medium',
    teamAssignment: '',
    operationsManager: '',
    deploymentEngineer: '',
    location: '',
    postcode: '',
    region: '',
    country: 'United Kingdom',
    latitude: null,
    longitude: null,
    siteNotes: '',
    additionalSiteDetails: '',
    // Contact fields
    unitManagerName: '',
    jobTitle: '',
    unitManagerEmail: '',
    unitManagerMobile: '',
    additionalContactName: '',
    additionalContactEmail: ''
  });

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [opsManagers, setOpsManagers] = useState<UserWithRole[]>([]);
  const [deploymentEngineers, setDeploymentEngineers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    contact: false,
    locationPicker: false,
    notes: false
  });

  // Check if user has permission to create sites
  useEffect(() => {
    if (currentRole && !hasPermission(currentRole, 'create_sites')) {
      toast.error('You do not have permission to create sites');
      navigate('/sites');
    }
  }, [currentRole, navigate]);

  // Fetch organizations and users on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch organizations from backend
        const orgs = await SitesService.getAllOrganizations();
        setOrganizations(orgs);

        // Fetch users from backend using UserService
        const [opsManagersData, deploymentEngineersData] = await Promise.all([
          UserService.getOpsManagers(),
          UserService.getDeploymentEngineers()
        ]);
        
        setOpsManagers(opsManagersData);
        setDeploymentEngineers(deploymentEngineersData);

      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load required data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (field: keyof SiteData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name || !formData.organization || !formData.sector || !formData.unitCode || !formData.targetLiveDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.operationsManager || !formData.deploymentEngineer) {
      toast.error('Please assign both Operations Manager and Deployment Engineer');
      return;
    }

    try {
      setSubmitting(true);

      // Prepare site data for backend
      const siteData = {
        name: formData.name,
        organization_id: formData.organization,
        location: formData.location,
        target_live_date: formData.targetLiveDate,
        assigned_ops_manager: formData.operationsManager,
        assigned_deployment_engineer: formData.deploymentEngineer,
        status: 'site_created', // Initial status
        sector: formData.sector,
        unit_code: formData.unitCode,
        criticality_level: formData.criticalityLevel,
        team_assignment: formData.teamAssignment,
        description: `Site created with sector: ${formData.sector}, unit code: ${formData.unitCode}, criticality: ${formData.criticalityLevel}, team: ${formData.teamAssignment}`
      };

      // Create site using backend service
      const createdSite = await SitesService.createSite(siteData);

      if (createdSite) {
        toast.success('Site created successfully!');
        navigate('/sites');
      } else {
        toast.error('Failed to create site. Please try again.');
      }
    } catch (error) {
      console.error('Error creating site:', error);
      toast.error('An error occurred while creating the site');
    } finally {
      setSubmitting(false);
    }
  };

  const getCriticalityColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get selected organization name for dynamic display
  const getSelectedOrganizationName = () => {
    if (!formData.organization) return '';
    const org = organizations.find(o => o.id === formData.organization);
    return org ? org.name : formData.organization;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading site creation form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full max-w-none px-2 sm:px-4 lg:px-6 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/sites')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sites
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Site Creation</h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Basic site information and configuration
              </p>
            </div>
            <Button 
              onClick={handleSubmit} 
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Creating Site...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create Site
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* General Information Section */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => toggleSection('general')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">General Information</CardTitle>
                </div>
                {expandedSections.general ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <CardDescription className="text-gray-600">
                Basic site details and organisation information
              </CardDescription>
            </CardHeader>
            {expandedSections.general && (
              <CardContent className="pt-0">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Basic Site Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="site-name">Site Name *</Label>
                        <Input
                          id="site-name"
                          placeholder="Enter site name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="organization">Organisation *</Label>
                        <Select value={formData.organization} onValueChange={(value) => handleInputChange('organization', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select organisation" />
                          </SelectTrigger>
                          <SelectContent>
                            {organizations.map((org) => (
                              <SelectItem key={org.id} value={org.id}>
                                {org.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sector">Sector *</Label>
                        <Input
                          id="sector"
                          placeholder="Enter sector"
                          value={formData.sector}
                          onChange={(e) => handleInputChange('sector', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit-code">Unit Code *</Label>
                        <Input
                          id="unit-code"
                          placeholder="Enter unit code"
                          value={formData.unitCode}
                          onChange={(e) => handleInputChange('unitCode', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="target-live-date">Target Live Date *</Label>
                        <Input
                          id="target-live-date"
                          type="date"
                          value={formData.targetLiveDate}
                          onChange={(e) => handleInputChange('targetLiveDate', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="criticality-level">Criticality Level</Label>
                        <Select value={formData.criticalityLevel} onValueChange={(value) => handleInputChange('criticalityLevel', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="team-assignment">Team Assignment *</Label>
                        <Input
                          id="team-assignment"
                          placeholder="Enter team assignment"
                          value={formData.teamAssignment}
                          onChange={(e) => handleInputChange('teamAssignment', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="operations-manager">Operations Manager *</Label>
                        <Select value={formData.operationsManager} onValueChange={(value) => handleInputChange('operationsManager', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Operations Manager" />
                          </SelectTrigger>
                          <SelectContent>
                            {opsManagers.map((om) => (
                              <SelectItem key={om.id} value={om.id}>
                                {om.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deployment-engineer">Deployment Engineer *</Label>
                        <Select value={formData.deploymentEngineer} onValueChange={(value) => handleInputChange('deploymentEngineer', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Deployment Engineer" />
                          </SelectTrigger>
                          <SelectContent>
                            {deploymentEngineers.map((de) => (
                              <SelectItem key={de.id} value={de.id}>
                                {de.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Contact Information Section */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => toggleSection('contact')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </div>
                {expandedSections.contact ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <CardDescription className="text-gray-600">
                Primary and additional contact details
              </CardDescription>
            </CardHeader>
            {expandedSections.contact && (
              <CardContent className="pt-0">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Primary Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="unit-manager-name">Unit Manager Name</Label>
                        <Input
                          id="unit-manager-name"
                          placeholder="e.g., Sarah Johnson"
                          value={formData.unitManagerName}
                          onChange={(e) => handleInputChange('unitManagerName', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="job-title">Job Title</Label>
                        <Input
                          id="job-title"
                          placeholder="e.g., Operations Manager"
                          value={formData.jobTitle}
                          onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit-manager-email">Email</Label>
                        <Input
                          id="unit-manager-email"
                          type="email"
                          placeholder="e.g., sarah.johnson@company.com"
                          value={formData.unitManagerEmail}
                          onChange={(e) => handleInputChange('unitManagerEmail', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit-manager-mobile">Mobile</Label>
                        <Input
                          id="unit-manager-mobile"
                          placeholder="e.g., +44 20 7123 4567"
                          value={formData.unitManagerMobile}
                          onChange={(e) => handleInputChange('unitManagerMobile', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Additional Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="additional-contact-name">Additional Contact Name</Label>
                        <Input
                          id="additional-contact-name"
                          placeholder="e.g., John Smith"
                          value={formData.additionalContactName}
                          onChange={(e) => handleInputChange('additionalContactName', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="additional-contact-email">Additional Contact Email</Label>
                        <Input
                          id="additional-contact-email"
                          type="email"
                          placeholder="e.g., john.smith@company.com"
                          value={formData.additionalContactEmail}
                          onChange={(e) => handleInputChange('additionalContactEmail', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Location Picker Section */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => toggleSection('locationPicker')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg">Location Information</CardTitle>
                </div>
                {expandedSections.locationPicker ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <CardDescription className="text-gray-600">
                Select site location using the integrated location picker
              </CardDescription>
            </CardHeader>
            {expandedSections.locationPicker && (
              <CardContent className="pt-0">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Location Selection</h4>
                    
                    {/* Location Picker Component */}
                    <LocationPicker
                      onLocationSelect={(location) => {
                        handleInputChange('latitude', location.lat);
                        handleInputChange('longitude', location.lng);
                        handleInputChange('location', location.address);
                      }}
                      initialLocation={formData.latitude && formData.longitude ? 
                        { lat: formData.latitude, lng: formData.longitude } : undefined
                      }
                    />

                    {/* Manual Override Fields */}
                    <div className="mt-6">
                      <h5 className="font-medium text-gray-900 mb-3">Manual Override (Optional)</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="address">Site Address</Label>
                          <Input
                            id="address"
                            placeholder="Enter site address"
                            value={formData.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postcode">Postcode</Label>
                          <Input
                            id="postcode"
                            placeholder="e.g., CV3 4LF"
                            value={formData.postcode}
                            onChange={(e) => handleInputChange('postcode', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="region">Region</Label>
                          <Input
                            id="region"
                            placeholder="e.g., West Midlands"
                            value={formData.region}
                            onChange={(e) => handleInputChange('region', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            placeholder="e.g., United Kingdom"
                            value={formData.country}
                            onChange={(e) => handleInputChange('country', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="latitude">Latitude</Label>
                          <Input
                            id="latitude"
                            type="number"
                            step="any"
                            placeholder="e.g., 52.4862"
                            value={formData.latitude || ''}
                            onChange={(e) => handleInputChange('latitude', e.target.value ? parseFloat(e.target.value) : null)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="longitude">Longitude</Label>
                          <Input
                            id="longitude"
                            type="number"
                            step="any"
                            placeholder="e.g., -1.8904"
                            value={formData.longitude || ''}
                            onChange={(e) => handleInputChange('longitude', e.target.value ? parseFloat(e.target.value) : null)}
                          />
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Use these fields to manually adjust location details if needed
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Site Notes Section */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => toggleSection('notes')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  <CardTitle className="text-lg">Site Notes</CardTitle>
                </div>
                {expandedSections.notes ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <CardDescription className="text-gray-600">
                Additional notes and site details
              </CardDescription>
            </CardHeader>
            {expandedSections.notes && (
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="site-notes">Site Notes</Label>
                    <Textarea
                      id="site-notes"
                      placeholder="Enter site notes and additional information..."
                      value={formData.siteNotes}
                      onChange={(e) => handleInputChange('siteNotes', e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Bottom Create Site Button */}
        <div className="mt-8 flex justify-center">
          <Button 
            onClick={handleSubmit} 
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg"
            size="lg"
          >
            {submitting ? (
              <>
                <Loader className="h-5 w-5 mr-2 animate-spin" />
                Creating Site...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Create Site
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SiteCreation; 