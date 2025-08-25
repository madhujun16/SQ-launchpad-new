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
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { SitesService, type Site, type Organization } from '@/services/sitesService';

interface User {
  id: string;
  name: string;
  role: 'ops_manager' | 'deployment_engineer';
  email: string;
}

interface Stakeholder {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  organization: string;
}

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
  stakeholders: Stakeholder[];
}

const SiteCreation = () => {
  const { currentRole } = useAuth();
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
    stakeholders: []
  });

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [opsManagers, setOpsManagers] = useState<User[]>([]);
  const [deploymentEngineers, setDeploymentEngineers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    location: false,
    stakeholders: false
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

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const addStakeholder = () => {
    const newStakeholder: Stakeholder = {
      id: Date.now().toString(),
      name: '',
      role: '',
      email: '',
      phone: '',
      organization: ''
    };
    setFormData({
      ...formData,
      stakeholders: [...formData.stakeholders, newStakeholder]
    });
  };

  const updateStakeholder = (id: string, field: keyof Stakeholder, value: string) => {
    setFormData({
      ...formData,
      stakeholders: formData.stakeholders.map(stakeholder =>
        stakeholder.id === id ? { ...stakeholder, [field]: value } : stakeholder
      )
    });
  };

  const removeStakeholder = (id: string) => {
    setFormData({
      ...formData,
      stakeholders: formData.stakeholders.filter(stakeholder => stakeholder.id !== id)
    });
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
        stakeholders: formData.stakeholders,
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
                  Mark as Completed
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
                                {om.name}
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
                                {de.name}
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

          {/* Location Information Section */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => toggleSection('location')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg">Location Information</CardTitle>
                </div>
                {expandedSections.location ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <CardDescription className="text-gray-600">
                Site location details and coordinates
              </CardDescription>
            </CardHeader>
            {expandedSections.location && (
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location Details</Label>
                    <Textarea
                      id="location"
                      placeholder="Enter detailed location information including address, coordinates, and any specific location details..."
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      rows={6}
                      className="border-2 border-dashed border-gray-300"
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Stakeholders Section */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => toggleSection('stakeholders')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-lg">Stakeholders</CardTitle>
                </div>
                {expandedSections.stakeholders ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <CardDescription className="text-gray-600">
                Add key stakeholders and site contacts
              </CardDescription>
            </CardHeader>
            {expandedSections.stakeholders && (
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {formData.stakeholders.map((stakeholder, index) => (
                    <div key={stakeholder.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Stakeholder {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStakeholder(stakeholder.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label>Name</Label>
                          <Input
                            placeholder="Full name"
                            value={stakeholder.name}
                            onChange={(e) => updateStakeholder(stakeholder.id, 'name', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Role</Label>
                          <Input
                            placeholder="e.g., Site Manager"
                            value={stakeholder.role}
                            onChange={(e) => updateStakeholder(stakeholder.id, 'role', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Email</Label>
                          <Input
                            type="email"
                            placeholder="email@company.com"
                            value={stakeholder.email}
                            onChange={(e) => updateStakeholder(stakeholder.id, 'email', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Phone</Label>
                          <Input
                            placeholder="+44 123 456 7890"
                            value={stakeholder.phone}
                            onChange={(e) => updateStakeholder(stakeholder.id, 'phone', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <Label>Organization</Label>
                          <Input
                            placeholder="Organization name"
                            value={stakeholder.organization}
                            onChange={(e) => updateStakeholder(stakeholder.id, 'organization', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button onClick={addStakeholder} variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Stakeholder
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SiteCreation; 