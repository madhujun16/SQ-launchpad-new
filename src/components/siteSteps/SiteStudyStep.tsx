import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Download, 
  CheckCircle, 
  MapPin, 
  Wifi, 
  Building, 
  Users, 
  Zap,
  Shield,
  Save,
  X,
  Plus,
  Trash2,
  Clock,
  Camera,
  FileText,
  Upload,
  Image
} from 'lucide-react';
import { Site } from '@/types/siteTypes';
import { toast } from 'sonner';

interface SiteStudyStepProps {
  site: Site;
  onSiteUpdate: (updatedSite: Site) => void;
}

const SiteStudyStep: React.FC<SiteStudyStepProps> = ({ site, onSiteUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(site?.siteStudy || {
    // Planning Phase Data
    spaceAssessment: {
      spaceType: '',
      footfallPattern: '',
      operatingHours: '',
      peakTimes: '',
      constraints: [],
      layoutPhotos: []
    },
    stakeholders: [],
    requirements: {
      primaryPurpose: '',
      expectedTransactions: '',
      paymentMethods: [],
      specialRequirements: [],
      softwareCategories: []
    },
    infrastructure: {
      powerAvailable: false,
      networkAvailable: false,
      wifiQuality: '',
      physicalConstraints: []
    },
    timeline: {
      studyDate: '',
      proposedGoLive: '',
      urgency: 'normal'
    },
    findings: '',
    recommendations: ''
  });

  useEffect(() => {
    if (site?.siteStudy) {
      setFormData(site.siteStudy);
    }
  }, [site?.siteStudy]);

  const handleInputChange = (path: string, value: any) => {
    setFormData(prev => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleArrayChange = (path: string, index: number, field: string, value: any) => {
    setFormData(prev => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      const array = current[keys[keys.length - 1]] || [];
      const newArray = [...array];
      newArray[index] = { ...newArray[index], [field]: value };
      current[keys[keys.length - 1]] = newArray;
      
      return newData;
    });
  };

  const addArrayItem = (path: string, defaultItem: any) => {
    setFormData(prev => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      const array = current[keys[keys.length - 1]] || [];
      current[keys[keys.length - 1]] = [...array, defaultItem];
      
      return newData;
    });
  };

  const removeArrayItem = (path: string, index: number) => {
    setFormData(prev => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      const array = current[keys[keys.length - 1]] || [];
      current[keys[keys.length - 1]] = array.filter((_: any, i: number) => i !== index);
      
      return newData;
    });
  };

  const handleSave = async () => {
    try {
      const updatedSite = {
        ...site,
        siteStudy: formData
      };
      onSiteUpdate(updatedSite);
      setIsEditing(false);
      toast.success('Site study saved successfully');
    } catch (error) {
      console.error('Error saving site study:', error);
      toast.error('Failed to save site study');
    }
  };

  const handleCancel = () => {
    setFormData(site?.siteStudy || {});
    setIsEditing(false);
  };

  const getValue = (path: string) => {
    const keys = path.split('.');
    let current = formData;
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return '';
      }
    }
    return current || '';
  };

  const handleMultiSelectChange = (path: string, value: string, checked: boolean) => {
    const currentValues = getValue(path) || [];
    const newValues = checked 
      ? [...currentValues, value]
      : currentValues.filter((v: string) => v !== value);
    handleInputChange(path, newValues);
  };

  const handleFileUpload = (path: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const newPhotos = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      file: file
    }));
    
    const currentPhotos = getValue(path) || [];
    handleInputChange(path, [...currentPhotos, ...newPhotos]);
  };

  const removePhoto = (path: string, photoId: number) => {
    const currentPhotos = getValue(path) || [];
    const updatedPhotos = currentPhotos.filter((photo: any) => photo.id !== photoId);
    handleInputChange(path, updatedPhotos);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Site Study</h2>
          <p className="text-gray-600 mt-1">Planning phase assessment to understand deployment requirements</p>
        </div>
        <div className="flex space-x-2">
          {!isEditing ? (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit Study
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export Report
              </Button>
              <Button size="sm">
                <CheckCircle className="h-4 w-4 mr-1" />
                Complete Study
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCancel}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSave}
              >
                <Save className="h-4 w-4 mr-1" />
                Save Study
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Vertical Layout */}
        <div className="space-y-6">
          {/* Space Assessment */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5 text-blue-600" />
                Space Assessment
              </CardTitle>
              <CardDescription>
                Understanding the physical space and operational context
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="space-type">Space Type *</Label>
                  <Select 
                    value={getValue('spaceAssessment.spaceType')} 
                    onValueChange={(value) => handleInputChange('spaceAssessment.spaceType', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select space type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cafeteria">Cafeteria</SelectItem>
                      <SelectItem value="Reception">Reception</SelectItem>
                      <SelectItem value="Restaurant">Restaurant</SelectItem>
                      <SelectItem value="Grab & Go">Grab & Go</SelectItem>
                      <SelectItem value="Coffee Shop">Coffee Shop</SelectItem>
                      <SelectItem value="Food Court">Food Court</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="footfall">Footfall Pattern *</Label>
                  <Select 
                    value={getValue('spaceAssessment.footfallPattern')} 
                    onValueChange={(value) => handleInputChange('spaceAssessment.footfallPattern', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select footfall pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High (200+ daily)">High (200+ daily)</SelectItem>
                      <SelectItem value="Medium (100-200 daily)">Medium (100-200 daily)</SelectItem>
                      <SelectItem value="Low (<100 daily)">Low (&lt;100 daily)</SelectItem>
                      <SelectItem value="Variable">Variable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="operating-hours">Operating Hours *</Label>
                <Input
                  id="operating-hours"
                  value={getValue('spaceAssessment.operatingHours')}
                  onChange={(e) => handleInputChange('spaceAssessment.operatingHours', e.target.value)}
                  placeholder="e.g., Mon-Fri 8AM-6PM, Sat-Sun 9AM-4PM"
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label htmlFor="peak-times">Peak Times</Label>
                <Input
                  id="peak-times"
                  value={getValue('spaceAssessment.peakTimes')}
                  onChange={(e) => handleInputChange('spaceAssessment.peakTimes', e.target.value)}
                  placeholder="e.g., 12PM-2PM lunch rush, 4PM-6PM afternoon"
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label>Physical Constraints</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['Listed Building', 'Limited Power', 'No Drilling', 'Accessibility Requirements', 'Fire Safety Restrictions', 'Heritage Restrictions'].map((constraint) => (
                    <div key={constraint} className="flex items-center space-x-2">
                      <Checkbox
                        id={constraint}
                        checked={(getValue('spaceAssessment.constraints') || []).includes(constraint)}
                        onCheckedChange={(checked) => handleMultiSelectChange('spaceAssessment.constraints', constraint, !!checked)}
                        disabled={!isEditing}
                      />
                      <Label htmlFor={constraint} className="text-sm">{constraint}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Layout Photos</Label>
                <div className="space-y-3">
                  {isEditing && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        id="layout-photos"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleFileUpload('spaceAssessment.layoutPhotos', e.target.files)}
                        className="hidden"
                      />
                      <label htmlFor="layout-photos" className="cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Click to upload layout photos</p>
                        <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 10MB each</p>
                      </label>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {(getValue('spaceAssessment.layoutPhotos') || []).map((photo: any) => (
                      <div key={photo.id} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={photo.url}
                            alt={photo.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
                            {isEditing && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => removePhoto('spaceAssessment.layoutPhotos', photo.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 truncate" title={photo.name}>
                          {photo.name}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {(!getValue('spaceAssessment.layoutPhotos') || getValue('spaceAssessment.layoutPhotos').length === 0) && (
                    <div className="text-center py-4 text-gray-500">
                      <Image className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No layout photos uploaded yet</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements Analysis */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-green-600" />
                Requirements Analysis
              </CardTitle>
              <CardDescription>
                Understanding what needs to be achieved
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="primary-purpose">Primary Purpose *</Label>
                <Textarea
                  id="primary-purpose"
                  value={getValue('requirements.primaryPurpose')}
                  onChange={(e) => handleInputChange('requirements.primaryPurpose', e.target.value)}
                  placeholder="What is the main goal of this digital transformation?"
                  disabled={!isEditing}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="expected-transactions">Expected Daily Transactions</Label>
                <Select 
                  value={getValue('requirements.expectedTransactions')} 
                  onValueChange={(value) => handleInputChange('requirements.expectedTransactions', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select transaction volume" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="<50">Less than 50</SelectItem>
                    <SelectItem value="50-150">50-150</SelectItem>
                    <SelectItem value="150-300">150-300</SelectItem>
                    <SelectItem value="300-500">300-500</SelectItem>
                    <SelectItem value="500+">500+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Payment Methods Required</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['Card Payments', 'Contactless', 'Mobile Payments', 'Cash', 'Corporate Cards', 'Gift Cards'].map((method) => (
                    <div key={method} className="flex items-center space-x-2">
                      <Checkbox
                        id={method}
                        checked={(getValue('requirements.paymentMethods') || []).includes(method)}
                        onCheckedChange={(checked) => handleMultiSelectChange('requirements.paymentMethods', method, !!checked)}
                        disabled={!isEditing}
                      />
                      <Label htmlFor={method} className="text-sm">{method}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Software Categories Required *</Label>
                <p className="text-sm text-gray-600 mb-3">Select the software categories needed for this deployment</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {[
                    { id: 'POS', name: 'Point of Sale (POS)', description: 'Transaction processing and payment handling' },
                    { id: 'Kiosk', name: 'Self-Service Kiosk', description: 'Customer self-ordering and payment' },
                    { id: 'Kitchen Display (KDS)', name: 'Kitchen Display System', description: 'Order management and kitchen operations' },
                    { id: 'Inventory', name: 'Inventory Management', description: 'Stock tracking and management' },
                    { id: 'Customer Management', name: 'Customer Management', description: 'Customer data and loyalty programs' },
                    { id: 'Analytics', name: 'Analytics & Reporting', description: 'Business intelligence and reporting' },
                    { id: 'Integration', name: 'System Integration', description: 'Third-party system connections' },
                    { id: 'Security', name: 'Security & Compliance', description: 'Data protection and compliance tools' }
                  ].map((category) => (
                    <div key={category.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <Checkbox
                        id={category.id}
                        checked={(getValue('requirements.softwareCategories') || []).includes(category.id)}
                        onCheckedChange={(checked) => handleMultiSelectChange('requirements.softwareCategories', category.id, !!checked)}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor={category.id} className="text-sm font-medium cursor-pointer">
                          {category.name}
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Special Requirements</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {['Multi-language Support', 'Accessibility Features', 'Integration with Existing Systems', 'Custom Branding', 'Loyalty Program', 'Reporting & Analytics'].map((req) => (
                    <div key={req} className="flex items-center space-x-2">
                      <Checkbox
                        id={req}
                        checked={(getValue('requirements.specialRequirements') || []).includes(req)}
                        onCheckedChange={(checked) => handleMultiSelectChange('requirements.specialRequirements', req, !!checked)}
                        disabled={!isEditing}
                      />
                      <Label htmlFor={req} className="text-sm">{req}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-orange-600" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="study-date">Study Date *</Label>
                  <Input
                    id="study-date"
                    type="date"
                    value={getValue('timeline.studyDate')}
                    onChange={(e) => handleInputChange('timeline.studyDate', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                
                <div>
                  <Label htmlFor="proposed-go-live">Proposed Go-Live Date</Label>
                  <Input
                    id="proposed-go-live"
                    type="date"
                    value={getValue('timeline.proposedGoLive')}
                    onChange={(e) => handleInputChange('timeline.proposedGoLive', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select 
                  value={getValue('timeline.urgency')} 
                  onValueChange={(value) => handleInputChange('timeline.urgency', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Flexible timeline</SelectItem>
                    <SelectItem value="normal">Normal - Standard timeline</SelectItem>
                    <SelectItem value="high">High - Rush deployment</SelectItem>
                    <SelectItem value="critical">Critical - Emergency replacement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
          {/* Stakeholders */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-purple-600" />
                Key Stakeholders
              </CardTitle>
              <CardDescription>
                People involved in the project decision and implementation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Stakeholder Contacts</Label>
                  {isEditing && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => addArrayItem('stakeholders', { name: '', role: '', email: '', phone: '', department: '' })}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Stakeholder
                    </Button>
                  )}
                </div>
                
                {(getValue('stakeholders') || []).map((stakeholder: any, index: number) => (
                  <div key={index} className="grid grid-cols-1 gap-3 p-3 border rounded-lg">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Name *"
                        value={stakeholder.name || ''}
                        onChange={(e) => handleArrayChange('stakeholders', index, 'name', e.target.value)}
                        disabled={!isEditing}
                      />
                      <Input
                        placeholder="Role/Title *"
                        value={stakeholder.role || ''}
                        onChange={(e) => handleArrayChange('stakeholders', index, 'role', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Email"
                        type="email"
                        value={stakeholder.email || ''}
                        onChange={(e) => handleArrayChange('stakeholders', index, 'email', e.target.value)}
                        disabled={!isEditing}
                      />
                      <Input
                        placeholder="Phone"
                        value={stakeholder.phone || ''}
                        onChange={(e) => handleArrayChange('stakeholders', index, 'phone', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Input
                        placeholder="Department"
                        value={stakeholder.department || ''}
                        onChange={(e) => handleArrayChange('stakeholders', index, 'department', e.target.value)}
                        disabled={!isEditing}
                        className="flex-1"
                      />
                      {isEditing && (
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => removeArrayItem('stakeholders', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {(!getValue('stakeholders') || getValue('stakeholders').length === 0) && (
                  <div className="text-center py-4 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No stakeholders added yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Infrastructure Check */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wifi className="mr-2 h-5 w-5 text-indigo-600" />
                Infrastructure Check
              </CardTitle>
              <CardDescription>
                Basic infrastructure readiness assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="power-available"
                      checked={getValue('infrastructure.powerAvailable')}
                      onCheckedChange={(checked) => handleInputChange('infrastructure.powerAvailable', checked)}
                      disabled={!isEditing}
                    />
                    <Label htmlFor="power-available">Power Available</Label>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Wifi className="h-5 w-5 text-blue-500" />
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="network-available"
                      checked={getValue('infrastructure.networkAvailable')}
                      onCheckedChange={(checked) => handleInputChange('infrastructure.networkAvailable', checked)}
                      disabled={!isEditing}
                    />
                    <Label htmlFor="network-available">Network Available</Label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="wifi-quality">WiFi Quality Assessment</Label>
                <Select 
                  value={getValue('infrastructure.wifiQuality')} 
                  onValueChange={(value) => handleInputChange('infrastructure.wifiQuality', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Assess WiFi quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                    <SelectItem value="none">No WiFi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Physical Constraints</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {['Limited Wall Space', 'No Drilling Allowed', 'Cable Management Issues', 'Accessibility Concerns'].map((constraint) => (
                    <div key={constraint} className="flex items-center space-x-2">
                      <Checkbox
                        id={constraint}
                        checked={(getValue('infrastructure.physicalConstraints') || []).includes(constraint)}
                        onCheckedChange={(checked) => handleMultiSelectChange('infrastructure.physicalConstraints', constraint, !!checked)}
                        disabled={!isEditing}
                      />
                      <Label htmlFor={constraint} className="text-sm">{constraint}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Findings & Recommendations */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="mr-2 h-5 w-5 text-red-600" />
                Findings & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="findings">Key Findings</Label>
                <Textarea
                  id="findings"
                  value={getValue('findings')}
                  onChange={(e) => handleInputChange('findings', e.target.value)}
                  placeholder="Document key observations, measurements, photos taken, etc."
                  disabled={!isEditing}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="recommendations">Recommendations</Label>
                <Textarea
                  id="recommendations"
                  value={getValue('recommendations')}
                  onChange={(e) => handleInputChange('recommendations', e.target.value)}
                  placeholder="Recommended approach, potential challenges, next steps..."
                  disabled={!isEditing}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
};

export default SiteStudyStep;