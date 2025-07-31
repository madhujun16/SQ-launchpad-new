import React, { useState } from 'react';
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
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Stakeholder {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}

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
}

interface SiteProject {
  name: string;
  organization: string;
  foodCourt: string;
  stakeholders: Stakeholder[];
  notes: string;
  riskLevel: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high';
}

const SiteCreationForm = () => {
  const [formData, setFormData] = useState<SiteProject>({
    name: '',
    organization: '',
    foodCourt: '',
    stakeholders: [],
    notes: '',
    riskLevel: 'medium',
    priority: 'medium'
  });

  // Mock data
  const organizations: Organization[] = [
    { id: '1', name: 'Compass Group UK', type: 'Food Service', industry: 'Hospitality' },
    { id: '2', name: 'Sodexo UK', type: 'Facility Management', industry: 'Services' },
    { id: '3', name: 'Aramark UK', type: 'Food Service', industry: 'Hospitality' }
  ];

  const foodCourts: FoodCourt[] = [
    { id: '1', name: 'Manchester Central Food Court', location: 'Manchester', capacity: 500 },
    { id: '2', name: 'London Bridge Hub', location: 'London', capacity: 300 },
    { id: '3', name: 'Birmingham Office Complex', location: 'Birmingham', capacity: 200 }
  ];

  const handleInputChange = (field: keyof SiteProject, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const addStakeholder = () => {
    const newStakeholder: Stakeholder = {
      id: Date.now().toString(),
      name: '',
      role: '',
      email: '',
      phone: ''
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
    if (!formData.name || !formData.organization || !formData.foodCourt) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    toast.success('Site project created successfully!');
    console.log('Form Data:', formData);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Create New Site Project</h1>
          <p className="text-muted-foreground">
            Create a new site project with organization and stakeholder details
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Main Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Essential project details and organization information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="projectName">Project Name *</Label>
                  <Input
                    id="projectName"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter project name"
                  />
                </div>

                <div>
                  <Label htmlFor="organization">Organization *</Label>
                  <Select value={formData.organization} onValueChange={(value) => handleInputChange('organization', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name} - {org.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="foodCourt">Food Court *</Label>
                  <Select value={formData.foodCourt} onValueChange={(value) => handleInputChange('foodCourt', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select food court" />
                    </SelectTrigger>
                    <SelectContent>
                      {foodCourts.map((court) => (
                        <SelectItem key={court.id} value={court.id}>
                          {court.name} ({court.location}) - {court.capacity} capacity
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="riskLevel">Risk Level</Label>
                    <Select value={formData.riskLevel} onValueChange={(value: any) => handleInputChange('riskLevel', value)}>
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
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value: any) => handleInputChange('priority', value)}>
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Additional Information
                </CardTitle>
                <CardDescription>
                  Notes and additional project details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="notes">Project Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Enter project notes and additional information..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stakeholders */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Stakeholders
                </CardTitle>
                <CardDescription>
                  Add key stakeholders and project contacts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.stakeholders.map((stakeholder) => (
                  <div key={stakeholder.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Stakeholder</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeStakeholder(stakeholder.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={stakeholder.name}
                          onChange={(e) => updateStakeholder(stakeholder.id, 'name', e.target.value)}
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <Label>Role</Label>
                        <Input
                          value={stakeholder.role}
                          onChange={(e) => updateStakeholder(stakeholder.id, 'role', e.target.value)}
                          placeholder="Job role"
                        />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={stakeholder.email}
                          onChange={(e) => updateStakeholder(stakeholder.id, 'email', e.target.value)}
                          placeholder="Email address"
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={stakeholder.phone}
                          onChange={(e) => updateStakeholder(stakeholder.id, 'phone', e.target.value)}
                          placeholder="Phone number"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" onClick={addStakeholder} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Stakeholder
                </Button>
              </CardContent>
            </Card>

            {/* Project Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Project Summary</CardTitle>
                <CardDescription>
                  Overview of the project details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Risk Level</span>
                    <div className="flex items-center mt-1">
                      <Badge className={getRiskColor(formData.riskLevel)}>
                        {formData.riskLevel}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Priority</span>
                    <div className={`font-medium mt-1 ${getPriorityColor(formData.priority)}`}>
                      {formData.priority}
                    </div>
                  </div>
                </div>
                
                <div className="text-sm">
                  <span className="text-muted-foreground">Stakeholders</span>
                  <div className="font-medium mt-1">{formData.stakeholders.length} stakeholders</div>
                </div>
                
                {formData.organization && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Selected Organization</span>
                    <div className="font-medium mt-1">
                      {organizations.find(org => org.id === formData.organization)?.name}
                    </div>
                  </div>
                )}
                
                {formData.foodCourt && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Selected Food Court</span>
                    <div className="font-medium mt-1">
                      {foodCourts.find(court => court.id === formData.foodCourt)?.name}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <Button onClick={handleSubmit} className="px-8">
            <Save className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SiteCreationForm; 