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
  MapPin, 
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
  Package,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { SitesService, type Site, type Organization } from '@/services/sitesService';
import { LocationPicker } from '@/components/ui/location-picker';
import { UserService, UserWithRole } from '@/services/userService';
import { DatePicker } from '@/components/ui/date-picker';
import { PageLoader } from '@/components/ui/loader';
import { supabase } from '@/integrations/supabase/client';

interface SiteData {
  name: string;
  organization: string;
  sector: string;
  unitCode: string;
  targetLiveDate: string;
  criticalityLevel: 'low' | 'medium' | 'high';
  operationsManager: string;
  deploymentEngineer: string;
  location: string;
  postcode: string;
  region: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
}

// Predefined sector options (same as OrganizationsManagement)
const sectorOptions = [
  'Business & Industry',
  'Healthcare & Senior Living',
  'Education',
  'Sports & Leisure',
  'Defence',
  'Offshore & Remote'
];

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
    operationsManager: '',
    deploymentEngineer: '',
    location: '',
    postcode: '',
    region: '',
    country: 'United Kingdom',
    latitude: null,
    longitude: null
  });

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [opsManagers, setOpsManagers] = useState<UserWithRole[]>([]);
  const [deploymentEngineers, setDeploymentEngineers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    locationPicker: false
  });

  // Add Organization modal state
  const [addOrgModalOpen, setAddOrgModalOpen] = useState(false);
  const [newOrganization, setNewOrganization] = useState({
    name: '',
    description: '',
    sector: '',
    unit_code: ''
  });
  const [logoUpload, setLogoUpload] = useState<{ file: File; preview: string } | null>(null);
  const [savingOrg, setSavingOrg] = useState(false);

  // Check if user has permission to create sites
  useEffect(() => {
    if (currentRole && !hasPermission(currentRole, 'create_sites')) {
      toast.error('You do not have permission to create sites');
      navigate('/sites');
    }
  }, [currentRole, navigate]);

  // Fetch organizations and users on component mount
  useEffect(() => {
    // Only load if we have a current role (auth is ready)
    if (!currentRole) {
      console.log('SiteCreation: Waiting for auth state...', { currentRole });
      return;
    }

    console.log('SiteCreation: Auth ready, loading data...', { currentRole });

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch organizations from backend (filter out archived ones)
        const allOrgs = await SitesService.getAllOrganizations();
        const activeOrgs = allOrgs.filter(org => !org.is_archived);
        setOrganizations(activeOrgs);

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

    // Only fetch if we don't have data already
    if (organizations.length === 0 && opsManagers.length === 0 && deploymentEngineers.length === 0) {
      fetchData();
    }
  }, [currentRole, organizations.length, opsManagers.length, deploymentEngineers.length]); // Add currentRole as dependency

  const handleInputChange = (field: keyof SiteData, value: any) => {
    setFormData({ ...formData, [field]: value });
    
    // Auto-populate sector and unit code when organization changes
    if (field === 'organization' && value) {
      const selectedOrg = organizations.find(org => org.id === value);
      if (selectedOrg) {
        setFormData(prev => ({
          ...prev,
          sector: selectedOrg.sector,
          unitCode: selectedOrg.unit_code || ''
        }));
      }
    } else if (field === 'organization' && !value) {
      // Clear sector and unit code when organization is cleared
      setFormData(prev => ({
        ...prev,
        sector: '',
        unitCode: ''
      }));
    }
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
      if (!formData.organization) {
        toast.error('Please select an organization first. The sector and unit code will be automatically filled.');
      } else if (!formData.sector || !formData.unitCode) {
        toast.error('Please select an organization to auto-populate the sector and unit code fields.');
      } else {
        toast.error('Please fill in all required fields');
      }
      return;
    }

    if (!formData.operationsManager || !formData.deploymentEngineer) {
      toast.error('Please assign both Operations Manager and Deployment Engineer');
      return;
    }
    
    // Validate that the selected organization exists and has the required data
    const selectedOrg = organizations.find(org => org.id === formData.organization);
    if (!selectedOrg) {
      toast.error('Selected organization not found. Please select a valid organization.');
      return;
    }
    
    if (selectedOrg.sector !== formData.sector || selectedOrg.unit_code !== formData.unitCode) {
      toast.error('Organization data mismatch. Please refresh the page and try again.');
      return;
    }
    
    // Validate that the organization is not archived
    if (selectedOrg.is_archived) {
      toast.error('Cannot create a site for an archived organization. Please select an active organization.');
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
        status: 'Created', // Initial status
        sector: formData.sector,
        unit_code: formData.unitCode,
        criticality_level: formData.criticalityLevel
        // Removed description field until the column is available in the database
      };

      // Create site using backend service
      const createdSite = await SitesService.createSite(siteData);

      if (createdSite) {
        toast.success(`Site "${formData.name}" created successfully for organization "${selectedOrg.name}"!`);
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

  // Add Organization functions
  const handleAddOrganization = () => {
    setAddOrgModalOpen(true);
    setNewOrganization({
      name: '',
      description: '',
      sector: '',
      unit_code: ''
    });
    setLogoUpload(null);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }

      const preview = URL.createObjectURL(file);
      setLogoUpload({ file, preview });
    }
  };

  const clearLogoUpload = () => {
    if (logoUpload?.preview) {
      URL.revokeObjectURL(logoUpload.preview);
    }
    setLogoUpload(null);
  };

  const uploadLogoToStorage = async (file: File, organizationId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${organizationId}-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('organization-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Error uploading logo:', error);
        toast.error(`Failed to upload logo: ${error.message}`);
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('organization-logos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error(`Failed to upload logo: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  };

  const saveOrganization = async () => {
    if (!newOrganization.name.trim()) {
      toast.error('Organization name is required');
      return;
    }
    
    if (!newOrganization.sector) {
      toast.error('Please select a sector');
      return;
    }
    
    if (!newOrganization.unit_code.trim()) {
      toast.error('Unit code is required');
      return;
    }
    
    setSavingOrg(true);
    try {
      let logoUrl = null;

      // Handle logo upload if there's a new logo
      if (logoUpload?.file) {
        const tempId = `temp-${Date.now()}`;
        const uploadedLogoUrl = await uploadLogoToStorage(logoUpload.file, tempId);
        if (uploadedLogoUrl) {
          logoUrl = uploadedLogoUrl;
        } else {
          toast.error('Logo upload failed. Please try again.');
          return;
        }
      }

      // Add new organization
      const { data, error } = await supabase
        .from('organizations')
        .insert([{
          name: newOrganization.name.trim(),
          description: newOrganization.description.trim(),
          sector: newOrganization.sector,
          unit_code: newOrganization.unit_code.trim(),
          logo_url: logoUrl,
          created_by: profile?.id || 'system',
          created_on: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase insert error:', error);
        toast.error(`Failed to create organization: ${error.message}`);
        return;
      }
      
      const newOrg: Organization = {
        id: data.id,
        name: data.name,
        description: data.description,
        sector: data.sector || '',
        unit_code: data.unit_code || '',
        logo_url: data.logo_url || logoUrl || null,
        created_at: data.created_at || '',
        updated_at: data.updated_at || new Date().toISOString(),
        sites_count: 0
      };
      
      // Add to local state and refresh organizations
      setOrganizations(prev => [...prev, newOrg]);
      
      // Auto-select the newly created organization
      setFormData(prev => ({
        ...prev,
        organization: newOrg.id,
        sector: newOrg.sector,
        unitCode: newOrg.unit_code
      }));
      
      toast.success(`Organization "${newOrg.name}" created successfully!`);
      
      // Clear logo upload state and close modal
      clearLogoUpload();
      setAddOrgModalOpen(false);
      setNewOrganization({
        name: '',
        description: '',
        sector: '',
        unit_code: ''
      });
    } catch (error) {
      console.error('Error saving organization:', error);
      toast.error(`Failed to save organization: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSavingOrg(false);
    }
  };

  if (loading) {
    return <PageLoader />;
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
                  <Building className="h-5 w-5 text-green-600" />
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
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900 border-b pb-2">Basic Site Information</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddOrganization}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Organization
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="site-name">Site Name *</Label>
                        <Input
                          id="site-name"
                          placeholder="Enter site name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="organization">Organisation *</Label>
                        {organizations.length === 0 && (
                          <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                            No organizations available - create one to continue
                          </span>
                        )}
                        <Select value={formData.organization} onValueChange={(value) => handleInputChange('organization', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select organisation" />
                          </SelectTrigger>
                          <SelectContent>
                            {organizations.length === 0 ? (
                              <div className="p-2 text-center text-gray-500">
                                <p>No organizations available</p>
                                <p className="text-xs">Use the "Add Organization" button above to create one</p>
                              </div>
                            ) : (
                              organizations.map((org) => (
                                <SelectItem key={org.id} value={org.id}>
                                  <div className="flex items-center justify-between w-full">
                                    <span>{org.name}</span>
                                    {org.is_archived && (
                                      <Badge variant="outline" className="ml-2 text-xs">
                                        Archived
                                      </Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sector">Sector *</Label>
                        <Input
                          id="sector"
                          placeholder="Auto-populated from organization"
                          value={formData.sector}
                          onChange={(e) => handleInputChange('sector', e.target.value)}
                          disabled
                          className="bg-gray-50 text-gray-600"
                        />
                        <p className="text-xs text-gray-500">
                          {formData.organization ? 'Automatically filled from organization' : 'Select an organization to auto-fill'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit-code">Unit Code *</Label>
                        <Input
                          id="unit-code"
                          placeholder="Auto-populated from organization"
                          value={formData.unitCode}
                          onChange={(e) => handleInputChange('unitCode', e.target.value)}
                          disabled
                          className="bg-gray-50 text-gray-600"
                        />
                        <p className="text-xs text-gray-500">
                          {formData.organization ? 'Automatically filled from organization' : 'Select an organization to auto-fill'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="target-live-date">Target Live Date *</Label>
                        <DatePicker
                          value={formData.targetLiveDate ? new Date(formData.targetLiveDate) : undefined}
                          onChange={(date) => handleInputChange('targetLiveDate', date ? date.toISOString().split('T')[0] : '')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="criticality-level">Priority</Label>
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
                    {/* Location Picker Component (borderless, no subtitle, expanded) */}
                    <LocationPicker
                      onLocationSelect={(location) => {
                        handleInputChange('latitude', location.lat);
                        handleInputChange('longitude', location.lng);
                        handleInputChange('location', location.address);
                      }}
                      initialLocation={undefined}
                      className="border-0 shadow-none"
                    />

                    {/* Compact summary after selection */}
                    {(formData.latitude !== null && formData.longitude !== null) && (
                      <div className="mt-4 text-sm text-gray-700 space-y-1">
                        <div><span className="font-medium">Address:</span> {formData.location || '—'}</div>
                        <div>
                          <span className="font-medium">Coordinates:</span> {formData.latitude}, {formData.longitude}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

        </div>

        {/* Bottom Create Site Button */}
        <div className="mt-8 flex justify-between items-center">
          <Button 
            variant="outline"
            onClick={() => navigate('/sites')}
            className="text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg"
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

            {/* Add Organization Modal */}
      {addOrgModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">Add Missing Organization</h3>
            <p className="text-sm text-gray-600 mb-4">
              Can't find the organization you're looking for? Create a new one here. It will be automatically selected and its sector and unit code will populate the form fields.
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-org-name">Organization Name *</Label>
                <Input
                  id="new-org-name"
                  placeholder="e.g., Acme Corp"
                  value={newOrganization.name}
                  onChange={(e) => setNewOrganization(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="new-org-description">Description (Optional)</Label>
                <Textarea
                  id="new-org-description"
                  placeholder="Brief description of the organization"
                  value={newOrganization.description}
                  onChange={(e) => setNewOrganization(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="new-org-sector">Sector *</Label>
                <Select value={newOrganization.sector} onValueChange={(value) => setNewOrganization(prev => ({ ...prev, sector: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectorOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="new-org-unit-code">Unit Code *</Label>
                <Input
                  id="new-org-unit-code"
                  placeholder="e.g., ACME-001"
                  value={newOrganization.unit_code}
                  onChange={(e) => setNewOrganization(prev => ({ ...prev, unit_code: e.target.value }))}
                />
              </div>
              
              {/* Logo Upload Section */}
              <div>
                <Label htmlFor="new-org-logo">Organization Logo (Optional)</Label>
                <div className="space-y-3">
                  {/* Logo Upload Input */}
                  <div className="flex items-center space-x-2">
                    <Input
                      id="new-org-logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="cursor-pointer"
                      style={{ display: 'none' }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('new-org-logo')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Upload
                    </Button>
                  </div>
                  
                  {/* Logo Preview */}
                  {logoUpload && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <img 
                        src={logoUpload.preview} 
                        alt="New organization logo"
                        className="h-12 w-12 rounded-full object-cover border"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Logo Preview</p>
                        <p className="text-xs text-gray-500">New logo selected</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearLogoUpload}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    Upload a logo image (JPG, PNG, GIF). Max size: 2MB.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  clearLogoUpload();
                  setAddOrgModalOpen(false);
                  setNewOrganization({
                    name: '',
                    description: '',
                    sector: '',
                    unit_code: ''
                  });
                }}
                disabled={savingOrg}
              >
                Cancel
              </Button>
              <Button 
                onClick={saveOrganization}
                disabled={savingOrg}
                className="bg-green-600 hover:bg-green-700"
              >
                {savingOrg ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Organization
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteCreation; 