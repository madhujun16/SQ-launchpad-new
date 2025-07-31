import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Building, 
  Wifi, 
  Server, 
  Users, 
  MapPin, 
  Clock, 
  FileText,
  Plus,
  Trash2,
  Save,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

interface Counter {
  id: string;
  name: string;
  count: number;
  type: string;
}

interface SiteStudyData {
  // General Site Info
  siteName: string;
  location: string;
  siteType: string;
  expectedFootfall: number;
  
  // Service Details
  services: string[];
  operatingHours: string;
  peakHours: string[];
  
  // Infrastructure Mapping
  networkRequirements: string;
  powerRequirements: string;
  spaceAvailable: number;
  
  // Network Readiness
  existingNetwork: boolean;
  networkSpeed: string;
  wifiCoverage: string;
  
  // Hardware Expectations
  posSystems: number;
  printers: number;
  displays: number;
  
  // Additional Information
  notes: string;
  risks: string;
  recommendations: string;
}

const SiteStudyForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SiteStudyData>({
    siteName: '',
    location: '',
    siteType: '',
    expectedFootfall: 0,
    services: [],
    operatingHours: '',
    peakHours: [],
    networkRequirements: '',
    powerRequirements: '',
    spaceAvailable: 0,
    existingNetwork: false,
    networkSpeed: '',
    wifiCoverage: '',
    posSystems: 0,
    printers: 0,
    displays: 0,
    notes: '',
    risks: '',
    recommendations: ''
  });

  const [counters, setCounters] = useState<Counter[]>([]);

  const totalSteps = 6;

  const calculateProgress = () => {
    return (currentStep / totalSteps) * 100;
  };

  const addCounter = () => {
    const newCounter: Counter = {
      id: Date.now().toString(),
      name: '',
      count: 0,
      type: ''
    };
    setCounters([...counters, newCounter]);
  };

  const updateCounter = (id: string, field: keyof Counter, value: any) => {
    setCounters(counters.map(counter => 
      counter.id === id ? { ...counter, [field]: value } : counter
    ));
  };

  const removeCounter = (id: string) => {
    setCounters(counters.filter(counter => counter.id !== id));
  };

  const handleInputChange = (field: keyof SiteStudyData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleServiceToggle = (service: string) => {
    const updatedServices = formData.services.includes(service)
      ? formData.services.filter(s => s !== service)
      : [...formData.services, service];
    handleInputChange('services', updatedServices);
  };

  const handlePeakHourToggle = (hour: string) => {
    const updatedHours = formData.peakHours.includes(hour)
      ? formData.peakHours.filter(h => h !== hour)
      : [...formData.peakHours, hour];
    handleInputChange('peakHours', updatedHours);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    toast.success('Site study form submitted successfully!');
    console.log('Form Data:', formData);
    console.log('Counters:', counters);
  };

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building className="mr-2 h-5 w-5" />
          General Site Information
        </CardTitle>
        <CardDescription>
          Basic information about the site and location
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="siteName">Site Name *</Label>
            <Input
              id="siteName"
              value={formData.siteName}
              onChange={(e) => handleInputChange('siteName', e.target.value)}
              placeholder="Enter site name"
            />
          </div>
          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Enter location"
            />
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="siteType">Site Type *</Label>
            <Select value={formData.siteType} onValueChange={(value) => handleInputChange('siteType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select site type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cafeteria">Cafeteria</SelectItem>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="food-court">Food Court</SelectItem>
                <SelectItem value="canteen">Canteen</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="expectedFootfall">Expected Daily Footfall</Label>
            <Input
              id="expectedFootfall"
              type="number"
              value={formData.expectedFootfall}
              onChange={(e) => handleInputChange('expectedFootfall', parseInt(e.target.value) || 0)}
              placeholder="Number of visitors"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5" />
          Service Details
        </CardTitle>
        <CardDescription>
          Information about services and operating hours
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Services Offered</Label>
          <div className="grid md:grid-cols-2 gap-2 mt-2">
            {['Food Service', 'Beverage Service', 'Takeaway', 'Delivery', 'Catering', 'Vending'].map((service) => (
              <div key={service} className="flex items-center space-x-2">
                <Checkbox
                  id={service}
                  checked={formData.services.includes(service)}
                  onCheckedChange={() => handleServiceToggle(service)}
                />
                <Label htmlFor={service}>{service}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <Label htmlFor="operatingHours">Operating Hours</Label>
          <Input
            id="operatingHours"
            value={formData.operatingHours}
            onChange={(e) => handleInputChange('operatingHours', e.target.value)}
            placeholder="e.g., 7:00 AM - 7:00 PM"
          />
        </div>
        
        <div>
          <Label>Peak Hours</Label>
          <div className="grid md:grid-cols-3 gap-2 mt-2">
            {['Breakfast (7-9 AM)', 'Lunch (12-2 PM)', 'Dinner (6-8 PM)'].map((hour) => (
              <div key={hour} className="flex items-center space-x-2">
                <Checkbox
                  id={hour}
                  checked={formData.peakHours.includes(hour)}
                  onCheckedChange={() => handlePeakHourToggle(hour)}
                />
                <Label htmlFor={hour}>{hour}</Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Server className="mr-2 h-5 w-5" />
          Infrastructure Mapping
        </CardTitle>
        <CardDescription>
          Technical requirements and space allocation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="networkRequirements">Network Requirements</Label>
          <Textarea
            id="networkRequirements"
            value={formData.networkRequirements}
            onChange={(e) => handleInputChange('networkRequirements', e.target.value)}
            placeholder="Describe network requirements..."
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="powerRequirements">Power Requirements</Label>
          <Textarea
            id="powerRequirements"
            value={formData.powerRequirements}
            onChange={(e) => handleInputChange('powerRequirements', e.target.value)}
            placeholder="Describe power requirements..."
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="spaceAvailable">Space Available (sq ft)</Label>
          <Input
            id="spaceAvailable"
            type="number"
            value={formData.spaceAvailable}
            onChange={(e) => handleInputChange('spaceAvailable', parseInt(e.target.value) || 0)}
            placeholder="Available space"
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wifi className="mr-2 h-5 w-5" />
          Network Readiness
        </CardTitle>
        <CardDescription>
          Network infrastructure assessment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="existingNetwork"
            checked={formData.existingNetwork}
            onCheckedChange={(checked) => handleInputChange('existingNetwork', checked)}
          />
          <Label htmlFor="existingNetwork">Existing network infrastructure available</Label>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="networkSpeed">Network Speed</Label>
            <Select value={formData.networkSpeed} onValueChange={(value) => handleInputChange('networkSpeed', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select network speed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100mbps">100 Mbps</SelectItem>
                <SelectItem value="1gbps">1 Gbps</SelectItem>
                <SelectItem value="10gbps">10 Gbps</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="wifiCoverage">WiFi Coverage</Label>
            <Select value={formData.wifiCoverage} onValueChange={(value) => handleInputChange('wifiCoverage', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select WiFi coverage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="full">Full Coverage</SelectItem>
                <SelectItem value="none">No WiFi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep5 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Server className="mr-2 h-5 w-5" />
          Hardware Expectations
        </CardTitle>
        <CardDescription>
          Hardware requirements and specifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="posSystems">POS Systems</Label>
            <Input
              id="posSystems"
              type="number"
              value={formData.posSystems}
              onChange={(e) => handleInputChange('posSystems', parseInt(e.target.value) || 0)}
              placeholder="Number of POS systems"
            />
          </div>
          <div>
            <Label htmlFor="printers">Printers</Label>
            <Input
              id="printers"
              type="number"
              value={formData.printers}
              onChange={(e) => handleInputChange('printers', parseInt(e.target.value) || 0)}
              placeholder="Number of printers"
            />
          </div>
          <div>
            <Label htmlFor="displays">Displays</Label>
            <Input
              id="displays"
              type="number"
              value={formData.displays}
              onChange={(e) => handleInputChange('displays', parseInt(e.target.value) || 0)}
              placeholder="Number of displays"
            />
          </div>
        </div>
        
        <div>
          <Label>Additional Counters</Label>
          <div className="space-y-2">
            {counters.map((counter) => (
              <div key={counter.id} className="flex items-center space-x-2">
                <Input
                  placeholder="Counter name"
                  value={counter.name}
                  onChange={(e) => updateCounter(counter.id, 'name', e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Count"
                  value={counter.count}
                  onChange={(e) => updateCounter(counter.id, 'count', parseInt(e.target.value) || 0)}
                  className="w-20"
                />
                <Input
                  placeholder="Type"
                  value={counter.type}
                  onChange={(e) => updateCounter(counter.id, 'type', e.target.value)}
                  className="w-32"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeCounter(counter.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={addCounter} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Counter
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep6 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          Additional Information
        </CardTitle>
        <CardDescription>
          Notes, risks, and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="notes">General Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Additional notes about the site..."
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="risks">Identified Risks</Label>
          <Textarea
            id="risks"
            value={formData.risks}
            onChange={(e) => handleInputChange('risks', e.target.value)}
            placeholder="Any risks or concerns identified..."
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="recommendations">Recommendations</Label>
          <Textarea
            id="recommendations"
            value={formData.recommendations}
            onChange={(e) => handleInputChange('recommendations', e.target.value)}
            placeholder="Recommendations for implementation..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      default: return renderStep1();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Site Study Form</h1>
          <p className="text-muted-foreground">
            Complete the site study form to assess infrastructure and requirements
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(calculateProgress())}% Complete</span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
        </div>

        {/* Form Content */}
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            {currentStep < totalSteps ? (
              <Button onClick={nextStep}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                <Save className="mr-2 h-4 w-4" />
                Submit Form
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteStudyForm; 