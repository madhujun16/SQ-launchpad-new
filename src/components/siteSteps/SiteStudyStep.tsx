import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  Image,
  Loader2,
  CalendarIcon,
  User,
  Monitor,
  CreditCard,
  Printer,
  Smartphone
} from 'lucide-react';
import { Site } from '@/types/siteTypes';
import { toast } from 'sonner';
import { PlatformConfigService, SoftwareCategory } from '@/services/platformConfigService';
import { format } from 'date-fns';

interface SiteStudyStepProps {
  site: Site;
  onSiteUpdate: (updatedSite: Site) => void;
}

const SiteStudyStep: React.FC<SiteStudyStepProps> = ({ site, onSiteUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [softwareCategories, setSoftwareCategories] = useState<SoftwareCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [formData, setFormData] = useState(site?.siteStudy || {
    // Planning Phase Data
    spaceAssessment: {
      spaceType: '',
      footfallPattern: '',
      operatingHours: '',
      peakTimes: '',
      constraints: [],
      layoutPhotos: [],
      // Mounting/Layout/Accessibility information
      mounting: {
        mountType: '',
        surfaceMaterial: '',
        drillingRequired: false,
        clearanceAvailable: '',
        distanceToNearest: '',
        accessibleHeight: false
      }
    },
    stakeholders: [],
    requirements: {
      primaryPurpose: '',
      expectedTransactions: '',
      paymentMethods: [],
      specialRequirements: [],
      softwareCategories: [],
      // Category-specific requirements
      categoryRequirements: {
        foodOrderingApp: {
          brandAssetsAvailable: false
        },
        kiosk: {
          numberOfKiosks: 0,
          preferredScreenSize: '',
          cardPaymentDeviceType: '',
          receiptPrinterRequired: false,
          grabAndGoShelfRequired: false
        },
        pos: {
          numberOfPosTerminals: 0,
          cashDrawerRequired: false
        },
        kitchen: {
          numberOfKdsScreens: 0,
          kitchenPrinterRequired: false
        }
      }
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

  // Fetch software categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingCategories(true);
        
        const categories = await PlatformConfigService.getSoftwareCategories();
        setSoftwareCategories(categories);
      } catch (error) {
        console.error('Error fetching software categories:', error);
        toast.error('Failed to load software categories');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchData();
  }, []);

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

  // Helper function to format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'PPP');
    } catch {
      return dateString;
    }
  };

  // Helper function to handle date selection
  const handleDateSelect = (path: string, date: Date | undefined) => {
    if (date) {
      handleInputChange(path, date.toISOString().split('T')[0]);
    } else {
      handleInputChange(path, '');
    }
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
          {/* Timeline */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-orange-600" />
                Timeline
              </CardTitle>
              <CardDescription>
                Project timeline and urgency assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="study-date">Study Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${!getValue('timeline.studyDate') ? 'text-muted-foreground' : ''}`}
                        disabled={!isEditing}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {getValue('timeline.studyDate') ? formatDate(getValue('timeline.studyDate')) : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={getValue('timeline.studyDate') ? new Date(getValue('timeline.studyDate')) : undefined}
                        onSelect={(date) => handleDateSelect('timeline.studyDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label htmlFor="proposed-go-live">Proposed Go-Live Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${!getValue('timeline.proposedGoLive') ? 'text-muted-foreground' : ''}`}
                        disabled={!isEditing}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {getValue('timeline.proposedGoLive') ? formatDate(getValue('timeline.proposedGoLive')) : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={getValue('timeline.proposedGoLive') ? new Date(getValue('timeline.proposedGoLive')) : undefined}
                        onSelect={(date) => handleDateSelect('timeline.proposedGoLive', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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

          {/* Space Assessment */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5 text-blue-600" />
                Space Assessment
              </CardTitle>
              <CardDescription>
                Understanding the physical space, operational context, and installation requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="space-type">Space Type *</Label>
                  <p className="text-xs text-gray-500 mb-2">Type of space affects equipment placement and requirements</p>
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

          {/* Mounting & Layout Assessment */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-indigo-600" />
                Mounting & Layout Assessment
              </CardTitle>
              <CardDescription>
                Physical installation requirements and accessibility considerations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mount-type">Mount Type Required</Label>
                  <Select 
                    value={getValue('spaceAssessment.mounting.mountType')} 
                    onValueChange={(value) => handleInputChange('spaceAssessment.mounting.mountType', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mount type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Wall">Wall</SelectItem>
                      <SelectItem value="Desk/Counter">Desk/Counter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="surface-material">Surface Material</Label>
                  <Select 
                    value={getValue('spaceAssessment.mounting.surfaceMaterial')} 
                    onValueChange={(value) => handleInputChange('spaceAssessment.mounting.surfaceMaterial', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select surface material" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Drywall">Drywall</SelectItem>
                      <SelectItem value="Brick">Brick</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="drilling-required"
                    checked={getValue('spaceAssessment.mounting.drillingRequired')}
                    onCheckedChange={(checked) => handleInputChange('spaceAssessment.mounting.drillingRequired', checked)}
                    disabled={!isEditing}
                  />
                  <Label htmlFor="drilling-required">Any drilling required?</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="accessible-height"
                    checked={getValue('spaceAssessment.mounting.accessibleHeight')}
                    onCheckedChange={(checked) => handleInputChange('spaceAssessment.mounting.accessibleHeight', checked)}
                    disabled={!isEditing}
                  />
                  <Label htmlFor="accessible-height">Accessible height?</Label>
                </div>
              </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clearance-available">Clearance Available</Label>
                    <p className="text-xs text-gray-500 mb-1">Space around installation area</p>
                    <Input
                      id="clearance-available"
                      value={getValue('spaceAssessment.mounting.clearanceAvailable')}
                      onChange={(e) => handleInputChange('spaceAssessment.mounting.clearanceAvailable', e.target.value)}
                      placeholder="e.g., 2m clearance, no obstructions"
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="distance-to-nearest">Distance to Nearest Power Outlet</Label>
                    <p className="text-xs text-gray-500 mb-1">Distance in meters</p>
                    <Input
                      id="distance-to-nearest"
                      type="number"
                      value={getValue('spaceAssessment.mounting.distanceToNearest')}
                      onChange={(e) => handleInputChange('spaceAssessment.mounting.distanceToNearest', e.target.value)}
                      placeholder="Distance in meters"
                      disabled={!isEditing}
                    />
                  </div>
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
                Assess basic infrastructure readiness before defining requirements
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
                <Label htmlFor="expected-transactions">Expected Daily Transactions (Total Site)</Label>
                <p className="text-xs text-gray-500 mb-2">Total transactions across all terminals/kiosks per day</p>
                <Select 
                  value={getValue('requirements.expectedTransactions')} 
                  onValueChange={(value) => handleInputChange('requirements.expectedTransactions', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select total daily transaction volume" />
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
                <Label>Special Requirements</Label>
                <div className="grid grid-cols-1 gap-3 mt-2">
                  {['Multi-language Support', 'Accessibility Features', 'Integration with Existing Systems', 'Custom Branding', 'Loyalty Program', 'Reporting & Analytics'].map((req) => (
                    <div key={req} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={req}
                          checked={(getValue('requirements.specialRequirements') || []).some((item: any) => item.name === req)}
                          onCheckedChange={(checked) => {
                            const currentReqs = getValue('requirements.specialRequirements') || [];
                            if (checked) {
                              const newReqs = [...currentReqs, { name: req, details: '' }];
                              handleInputChange('requirements.specialRequirements', newReqs);
                            } else {
                              const newReqs = currentReqs.filter((item: any) => item.name !== req);
                              handleInputChange('requirements.specialRequirements', newReqs);
                            }
                          }}
                          disabled={!isEditing}
                        />
                        <Label htmlFor={req} className="text-sm">{req}</Label>
                      </div>
                      {(getValue('requirements.specialRequirements') || []).some((item: any) => item.name === req) && (
                        <div className="ml-6">
                          <Textarea
                            placeholder={`Provide details for ${req.toLowerCase()}...`}
                            value={(getValue('requirements.specialRequirements') || []).find((item: any) => item.name === req)?.details || ''}
                            onChange={(e) => {
                              const currentReqs = getValue('requirements.specialRequirements') || [];
                              const updatedReqs = currentReqs.map((item: any) => 
                                item.name === req ? { ...item, details: e.target.value } : item
                              );
                              handleInputChange('requirements.specialRequirements', updatedReqs);
                            }}
                            disabled={!isEditing}
                            rows={2}
                            className="text-sm"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Software Categories Required *</Label>
                <p className="text-sm text-gray-600 mb-3">Select the software categories needed for this deployment</p>
                {loadingCategories ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-500">Loading categories...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {softwareCategories.map((category) => (
                      <div key={category.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <Checkbox
                          id={category.id}
                          checked={(getValue('requirements.softwareCategories') || []).includes(category.name)}
                          onCheckedChange={(checked) => handleMultiSelectChange('requirements.softwareCategories', category.name, !!checked)}
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
                )}
              </div>

              {/* Category-Specific Requirements */}
              {(getValue('requirements.softwareCategories') || []).length > 0 && (
                <div className="mt-6">
                  <Label className="text-lg font-semibold">Category-Specific Requirements</Label>
                  <p className="text-sm text-gray-600 mb-4">Configure specific requirements for each selected category</p>
                  
                  <div className="space-y-6">
                    {/* Food Ordering App */}
                    {(getValue('requirements.softwareCategories') || []).includes('Food Ordering App') && (
                      <Card className="border border-blue-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center text-lg">
                            <Smartphone className="mr-2 h-5 w-5 text-blue-600" />
                            Food Ordering App
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="brand-assets"
                              checked={getValue('requirements.categoryRequirements.foodOrderingApp.brandAssetsAvailable')}
                              onCheckedChange={(checked) => handleInputChange('requirements.categoryRequirements.foodOrderingApp.brandAssetsAvailable', checked)}
                              disabled={!isEditing}
                            />
                            <Label htmlFor="brand-assets">Brand assets available (logo, fonts, colour codes)?</Label>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Kiosk */}
                    {(getValue('requirements.softwareCategories') || []).includes('Kiosk') && (
                      <Card className="border border-green-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center text-lg">
                            <Monitor className="mr-2 h-5 w-5 text-green-600" />
                            Kiosk
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="kiosk-count">Number of kiosks per outlet</Label>
                              <Input
                                id="kiosk-count"
                                type="number"
                                min="0"
                                value={getValue('requirements.categoryRequirements.kiosk.numberOfKiosks')}
                                onChange={(e) => handleInputChange('requirements.categoryRequirements.kiosk.numberOfKiosks', parseInt(e.target.value) || 0)}
                                disabled={!isEditing}
                              />
                            </div>
                            <div>
                              <Label htmlFor="screen-size">Preferred screen size</Label>
                              <Select 
                                value={getValue('requirements.categoryRequirements.kiosk.preferredScreenSize')} 
                                onValueChange={(value) => handleInputChange('requirements.categoryRequirements.kiosk.preferredScreenSize', value)}
                                disabled={!isEditing}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select screen size" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="15">15"</SelectItem>
                                  <SelectItem value="22">22"</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="ped-type">Card payment device (PED) type</Label>
                              <Select 
                                value={getValue('requirements.categoryRequirements.kiosk.cardPaymentDeviceType')} 
                                onValueChange={(value) => handleInputChange('requirements.categoryRequirements.kiosk.cardPaymentDeviceType', value)}
                                disabled={!isEditing}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select PED type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Verifone">Verifone</SelectItem>
                                  <SelectItem value="Ingenico">Ingenico</SelectItem>
                                  <SelectItem value="PAX">PAX</SelectItem>
                                  <SelectItem value="Adyen">Adyen</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                  <SelectItem value="Not required">Not required</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="receipt-printer"
                                checked={getValue('requirements.categoryRequirements.kiosk.receiptPrinterRequired')}
                                onCheckedChange={(checked) => handleInputChange('requirements.categoryRequirements.kiosk.receiptPrinterRequired', checked)}
                                disabled={!isEditing}
                              />
                              <Label htmlFor="receipt-printer">Receipt printer required?</Label>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="grab-go-shelf"
                              checked={getValue('requirements.categoryRequirements.kiosk.grabAndGoShelfRequired')}
                              onCheckedChange={(checked) => handleInputChange('requirements.categoryRequirements.kiosk.grabAndGoShelfRequired', checked)}
                              disabled={!isEditing}
                            />
                            <Label htmlFor="grab-go-shelf">Grab & Go shelf or additional plate needed?</Label>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* POS */}
                    {(getValue('requirements.softwareCategories') || []).includes('POS') && (
                      <Card className="border border-purple-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center text-lg">
                            <CreditCard className="mr-2 h-5 w-5 text-purple-600" />
                            POS
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="pos-count">Number of POS terminals</Label>
                              <Input
                                id="pos-count"
                                type="number"
                                min="0"
                                value={getValue('requirements.categoryRequirements.pos.numberOfPosTerminals')}
                                onChange={(e) => handleInputChange('requirements.categoryRequirements.pos.numberOfPosTerminals', parseInt(e.target.value) || 0)}
                                disabled={!isEditing}
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="cash-drawer"
                                checked={getValue('requirements.categoryRequirements.pos.cashDrawerRequired')}
                                onCheckedChange={(checked) => handleInputChange('requirements.categoryRequirements.pos.cashDrawerRequired', checked)}
                                disabled={!isEditing}
                              />
                              <Label htmlFor="cash-drawer">Cash drawer required?</Label>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Kitchen Display */}
                    {(getValue('requirements.softwareCategories') || []).includes('Kitchen Display (KDS)') && (
                      <Card className="border border-orange-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center text-lg">
                            <Printer className="mr-2 h-5 w-5 text-orange-600" />
                            Kitchen Display (KDS)
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="kds-count">Number of KDS screens</Label>
                              <Input
                                id="kds-count"
                                type="number"
                                min="0"
                                value={getValue('requirements.categoryRequirements.kitchen.numberOfKdsScreens')}
                                onChange={(e) => handleInputChange('requirements.categoryRequirements.kitchen.numberOfKdsScreens', parseInt(e.target.value) || 0)}
                                disabled={!isEditing}
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="kitchen-printer"
                                checked={getValue('requirements.categoryRequirements.kitchen.kitchenPrinterRequired')}
                                onCheckedChange={(checked) => handleInputChange('requirements.categoryRequirements.kitchen.kitchenPrinterRequired', checked)}
                                disabled={!isEditing}
                              />
                              <Label htmlFor="kitchen-printer">Kitchen printer required?</Label>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>


        </div>
          {/* Stakeholders */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-purple-600" />
                Configuration & Support Team
              </CardTitle>
              <CardDescription>
                Users who will configure and support the applications when sites go live
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>App Configuration Team</Label>
                  {isEditing && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => addArrayItem('stakeholders', { userId: '', name: '', role: '', email: '', phone: '', department: '', details: '', responsibilities: [] })}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Team Member
                    </Button>
                  )}
                </div>
                
                {(getValue('stakeholders') || []).map((stakeholder: any, index: number) => (
                  <div key={index} className="grid grid-cols-1 gap-3 p-3 border rounded-lg">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Configuration User Name</Label>
                        <Input
                          placeholder="Enter user name"
                          value={stakeholder.name || ''}
                          onChange={(e) => handleArrayChange('stakeholders', index, 'name', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label>Configuration Role</Label>
                        <Input
                          placeholder="e.g., Primary Configurator, Support Specialist"
                          value={stakeholder.configurationRole || ''}
                          onChange={(e) => handleArrayChange('stakeholders', index, 'configurationRole', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label>Email</Label>
                        <Input
                          placeholder="Email address"
                          type="email"
                          value={stakeholder.email || ''}
                          onChange={(e) => handleArrayChange('stakeholders', index, 'email', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          placeholder="Phone number"
                          value={stakeholder.phone || ''}
                          onChange={(e) => handleArrayChange('stakeholders', index, 'phone', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label>User Role/Title</Label>
                        <Input
                          placeholder="e.g., Deployment Engineer, Operations Manager"
                          value={stakeholder.role || ''}
                          onChange={(e) => handleArrayChange('stakeholders', index, 'role', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label>Department</Label>
                        <Input
                          placeholder="Department"
                          value={stakeholder.department || ''}
                          onChange={(e) => handleArrayChange('stakeholders', index, 'department', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label>Configuration Responsibilities</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {['App Setup', 'User Training', 'Go-Live Support', 'Post-Launch Support', 'System Configuration', 'Data Migration'].map((responsibility) => (
                            <div key={responsibility} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${responsibility}-${index}`}
                                checked={(stakeholder.responsibilities || []).includes(responsibility)}
                                onCheckedChange={(checked) => {
                                  const currentResponsibilities = stakeholder.responsibilities || [];
                                  const newResponsibilities = checked 
                                    ? [...currentResponsibilities, responsibility]
                                    : currentResponsibilities.filter((r: string) => r !== responsibility);
                                  handleArrayChange('stakeholders', index, 'responsibilities', newResponsibilities);
                                }}
                                disabled={!isEditing}
                              />
                              <Label htmlFor={`${responsibility}-${index}`} className="text-sm">{responsibility}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>Additional Notes</Label>
                        <Textarea
                          placeholder="Additional notes about this team member's role in configuration..."
                          value={stakeholder.details || ''}
                          onChange={(e) => handleArrayChange('stakeholders', index, 'details', e.target.value)}
                          disabled={!isEditing}
                          rows={2}
                        />
                      </div>
                    </div>
                    {isEditing && (
                      <div className="flex justify-end">
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => removeArrayItem('stakeholders', index)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove Team Member
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                
                {(!getValue('stakeholders') || getValue('stakeholders').length === 0) && (
                  <div className="text-center py-4 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No configuration team members added yet</p>
                    <p className="text-xs text-gray-400 mt-1">Add team members who will configure and support the applications</p>
                  </div>
                )}
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