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
  Loader
} from 'lucide-react';
import { toast } from 'sonner';
import { SitesService, type Site, type Organization } from '@/services/sitesService';

interface User {
  id: string;
  name: string;
  role: 'ops_manager' | 'deployment_engineer';
  email: string;
}

interface SiteData {
  name: string;
  organization_id: string;
  location: string;
  target_live_date: string;
  assigned_ops_manager: string;
  assigned_deployment_engineer: string;
  notes: string;
}

const SiteCreation = () => {
  const { currentRole } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<SiteData>({
    name: '',
    organization_id: '',
    location: '',
    target_live_date: '',
    assigned_ops_manager: '',
    assigned_deployment_engineer: '',
    notes: ''
  });

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [opsManagers, setOpsManagers] = useState<User[]>([]);
  const [deploymentEngineers, setDeploymentEngineers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

        // For now, using mock data for users - this should be replaced with actual user service
        const mockOpsManagers: User[] = [
          { id: '1', name: 'Jessica Cleaver', role: 'ops_manager', email: 'jessica.cleaver@company.com' },
          { id: '2', name: 'Mike Thompson', role: 'ops_manager', email: 'mike.thompson@company.com' },
          { id: '3', name: 'Sarah Johnson', role: 'ops_manager', email: 'sarah.johnson@company.com' }
        ];
        setOpsManagers(mockOpsManagers);

        const mockDeploymentEngineers: User[] = [
          { id: '1', name: 'John Smith', role: 'deployment_engineer', email: 'john.smith@company.com' },
          { id: '2', name: 'Emma Wilson', role: 'deployment_engineer', email: 'emma.wilson@company.com' },
          { id: '3', name: 'David Brown', role: 'deployment_engineer', email: 'david.brown@company.com' }
        ];
        setDeploymentEngineers(mockDeploymentEngineers);

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

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name || !formData.organization_id || !formData.location || !formData.target_live_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.assigned_ops_manager || !formData.assigned_deployment_engineer) {
      toast.error('Please assign both Ops Manager and Deployment Engineer');
      return;
    }

    try {
      setSubmitting(true);

      // Prepare site data for backend
      const siteData = {
        name: formData.name,
        organization_id: formData.organization_id,
        location: formData.location,
        target_live_date: formData.target_live_date,
        assigned_ops_manager: formData.assigned_ops_manager,
        assigned_deployment_engineer: formData.assigned_deployment_engineer,
        status: 'site_created', // Initial status
        description: formData.notes // Use description field for notes
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

  const selectedOrg = organizations.find(org => org.id === formData.organization_id);
  const selectedOpsManager = opsManagers.find(om => om.id === formData.assigned_ops_manager);
  const selectedDeploymentEngineer = deploymentEngineers.find(de => de.id === formData.assigned_deployment_engineer);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading site creation form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create New Site</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Create a new site with organization and stakeholder details
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <Card className="lg:col-span-2 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-blue-600" />
                Basic Information
              </CardTitle>
              <CardDescription className="text-gray-600">
                Essential site details and organization information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <Label htmlFor="organization">Organization *</Label>
                  <Select value={formData.organization_id} onValueChange={(value) => handleInputChange('organization_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name} ({org.sector})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="Enter site location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="go-live-date">Target Go-Live Date *</Label>
                  <Input
                    id="go-live-date"
                    type="date"
                    value={formData.target_live_date}
                    onChange={(e) => handleInputChange('target_live_date', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Site Summary */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Site Summary</CardTitle>
              <CardDescription className="text-gray-600">
                Overview of the site details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedOrg && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Organization</p>
                  <p className="text-sm font-medium">{selectedOrg.name}</p>
                  <p className="text-xs text-gray-500">Sector: {selectedOrg.sector}</p>
                </div>
              )}
              {formData.location && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="text-sm font-medium">{formData.location}</p>
                </div>
              )}
              {formData.target_live_date && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Target Go-Live Date</p>
                  <p className="text-sm font-medium">{new Date(formData.target_live_date).toLocaleDateString()}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Assigned Team */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-green-600" />
                Assigned Team
              </CardTitle>
              <CardDescription className="text-gray-600">
                Assign Ops Manager and Deployment Engineer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ops-manager">Ops Manager *</Label>
                <Select value={formData.assigned_ops_manager} onValueChange={(value) => handleInputChange('assigned_ops_manager', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Ops Manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {opsManagers.map((om) => (
                      <SelectItem key={om.id} value={om.id}>
                        {om.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deployment-engineer">Deployment Engineer *</Label>
                <Select value={formData.assigned_deployment_engineer} onValueChange={(value) => handleInputChange('assigned_deployment_engineer', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Deployment Engineer" />
                  </SelectTrigger>
                  <SelectContent>
                    {deploymentEngineers.map((de) => (
                      <SelectItem key={de.id} value={de.id}>
                        {de.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-orange-600" />
                Additional Information
              </CardTitle>
              <CardDescription className="text-gray-600">
                Notes and additional site details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="site-notes">Site Notes</Label>
                <Textarea
                  id="site-notes"
                  placeholder="Enter site notes and additional information..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleSubmit} 
            disabled={submitting}
            className="bg-gradient-to-r from-black to-green-600 text-white px-8 py-3 rounded-lg hover:from-gray-900 hover:to-green-700 transition-all duration-200 shadow-lg"
            size="lg"
          >
            {submitting ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Creating Site...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
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