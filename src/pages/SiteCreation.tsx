import React, { useState } from 'react';
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
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { useSiteContext, type Site, type Stakeholder } from '@/contexts/SiteContext';

interface Organization {
  id: string;
  name: string;
  type: string;
  industry: string;
}

interface FoodCourt {
  id: string;
  name: string;
  location: string;
  capacity: number;
  unitCode: string;
}

interface User {
  id: string;
  name: string;
  role: 'ops_manager' | 'deployment_engineer';
  email: string;
}

interface SiteData {
  name: string;
  organization: string;
  foodCourt: string;
  stakeholders: Stakeholder[];
  notes: string;
  riskLevel: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high';
  goLiveDate: string;
  assignedOpsManager: string;
  assignedDeploymentEngineer: string;
  status: 'draft' | 'in_study' | 'hardware_scoped' | 'live';
}

const SiteCreation = () => {
  const { currentRole } = useAuth();
  const navigate = useNavigate();
  const { createSite, setSelectedSite } = useSiteContext();
  
  const [formData, setFormData] = useState<SiteData>({
    name: '',
    organization: '',
    foodCourt: '',
    stakeholders: [],
    notes: '',
    riskLevel: 'medium',
    priority: 'medium',
    goLiveDate: '',
    assignedOpsManager: '',
    assignedDeploymentEngineer: '',
    status: 'draft'
  });

  // Check if user has permission to create sites
  React.useEffect(() => {
    if (currentRole && !hasPermission(currentRole, 'create_sites')) {
      toast.error('You do not have permission to create sites');
      navigate('/sites');
    }
  }, [currentRole, navigate]);

  // Mock data
  const organizations: Organization[] = [
    { id: '1', name: 'Compass Group UK', type: 'Food Service', industry: 'Hospitality' },
    { id: '2', name: 'Sodexo UK', type: 'Facility Management', industry: 'Services' },
    { id: '3', name: 'Aramark UK', type: 'Food Service', industry: 'Hospitality' },
    { id: '4', name: 'ASDA', type: 'Retail', industry: 'Retail' },
    { id: '5', name: 'HSBC', type: 'Banking', industry: 'Finance' }
  ];

  const foodCourts: FoodCourt[] = [
    { id: '1', name: 'Manchester Central Food Court', location: 'Manchester', capacity: 500, unitCode: 'MC001' },
    { id: '2', name: 'London Bridge Hub', location: 'London', capacity: 300, unitCode: 'LB002' },
    { id: '3', name: 'Birmingham Office Complex', location: 'Birmingham', capacity: 200, unitCode: 'BO003' },
    { id: '4', name: 'ASDA Redditch', location: 'Redditch', capacity: 150, unitCode: 'AR004' },
    { id: '5', name: 'HSBC Canary Wharf', location: 'London', capacity: 400, unitCode: 'HC005' }
  ];

  const opsManagers: User[] = [
    { id: '1', name: 'Jessica Cleaver', role: 'ops_manager', email: 'jessica.cleaver@smartq.com' },
    { id: '2', name: 'Mike Thompson', role: 'ops_manager', email: 'mike.thompson@smartq.com' },
    { id: '3', name: 'Sarah Johnson', role: 'ops_manager', email: 'sarah.johnson@smartq.com' }
  ];

  const deploymentEngineers: User[] = [
    { id: '1', name: 'John Smith', role: 'deployment_engineer', email: 'john.smith@smartq.com' },
    { id: '2', name: 'Emma Wilson', role: 'deployment_engineer', email: 'emma.wilson@smartq.com' },
    { id: '3', name: 'David Brown', role: 'deployment_engineer', email: 'david.brown@smartq.com' }
  ];

  const handleInputChange = (field: keyof SiteData, value: any) => {
    setFormData({ ...formData, [field]: value });
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

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.name || !formData.organization || !formData.foodCourt) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Create site using context
    const siteId = createSite({
      name: formData.name,
      organization: formData.organization,
      foodCourt: formData.foodCourt,
      unitCode: foodCourts.find(fc => fc.id === formData.foodCourt)?.unitCode || '',
      goLiveDate: formData.goLiveDate,
      priority: formData.priority,
      riskLevel: formData.riskLevel,
      assignedOpsManager: opsManagers.find(om => om.id === formData.assignedOpsManager)?.name || '',
      assignedDeploymentEngineer: deploymentEngineers.find(de => de.id === formData.assignedDeploymentEngineer)?.name || '',
      stakeholders: formData.stakeholders,
      notes: formData.notes,
      description: formData.notes,
      status: 'draft'
    });

    // Get the created site and set it as selected
    const createdSite = {
      id: siteId,
      name: formData.name,
      organization: formData.organization,
      foodCourt: formData.foodCourt,
      unitCode: foodCourts.find(fc => fc.id === formData.foodCourt)?.unitCode || '',
      goLiveDate: formData.goLiveDate,
      priority: formData.priority,
      riskLevel: formData.riskLevel,
      assignedOpsManager: opsManagers.find(om => om.id === formData.assignedOpsManager)?.name || '',
      assignedDeploymentEngineer: deploymentEngineers.find(de => de.id === formData.assignedDeploymentEngineer)?.name || '',
      stakeholders: formData.stakeholders,
      notes: formData.notes,
      description: formData.notes,
      status: 'draft' as const,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    setSelectedSite(createdSite);
    toast.success('Site created successfully!');
    
    // Navigate to site management
    navigate('/sites');
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedOrg = organizations.find(org => org.id === formData.organization);
  const selectedFoodCourt = foodCourts.find(fc => fc.id === formData.foodCourt);
  const selectedOpsManager = opsManagers.find(om => om.id === formData.assignedOpsManager);
  const selectedDeploymentEngineer = deploymentEngineers.find(de => de.id === formData.assignedDeploymentEngineer);

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
                  <Select value={formData.organization} onValueChange={(value) => handleInputChange('organization', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization" />
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
                  <Label htmlFor="food-court">Food Court / Unit *</Label>
                  <Select value={formData.foodCourt} onValueChange={(value) => handleInputChange('foodCourt', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select food court" />
                    </SelectTrigger>
                    <SelectContent>
                      {foodCourts.map((fc) => (
                        <SelectItem key={fc.id} value={fc.id}>
                          {fc.name} ({fc.unitCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="go-live-date">Go-Live Date *</Label>
                  <Input
                    id="go-live-date"
                    type="date"
                    value={formData.goLiveDate}
                    onChange={(e) => handleInputChange('goLiveDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="risk-level">Risk Level</Label>
                  <Select value={formData.riskLevel} onValueChange={(value) => handleInputChange('riskLevel', value)}>
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
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
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
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Risk Level</p>
                <Badge className={getRiskColor(formData.riskLevel)}>
                  {formData.riskLevel}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Priority</p>
                <Badge className={getPriorityColor(formData.priority)}>
                  {formData.priority}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Stakeholders</p>
                <p className="text-sm font-medium">{formData.stakeholders.length} stakeholders</p>
              </div>
              {selectedOrg && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Organization</p>
                  <p className="text-sm font-medium">{selectedOrg.name}</p>
                </div>
              )}
              {selectedFoodCourt && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Food Court</p>
                  <p className="text-sm font-medium">{selectedFoodCourt.name}</p>
                  <p className="text-xs text-gray-500">Unit: {selectedFoodCourt.unitCode}</p>
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
                <Select value={formData.assignedOpsManager} onValueChange={(value) => handleInputChange('assignedOpsManager', value)}>
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
                <Select value={formData.assignedDeploymentEngineer} onValueChange={(value) => handleInputChange('assignedDeploymentEngineer', value)}>
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

          {/* Stakeholders */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-purple-600" />
                Stakeholders
              </CardTitle>
              <CardDescription className="text-gray-600">
                Add key stakeholders and site contacts
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                    </div>
                  </div>
                ))}
                <Button onClick={addStakeholder} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stakeholder
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <Card className="mt-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
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

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSubmit} variant="gradient" size="lg">
            <Save className="h-4 w-4 mr-2" />
            Create Site
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SiteCreation; 