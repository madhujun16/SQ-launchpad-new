import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Building, 
  MapPin, 
  Package, 
  CheckCircle, 
  ChevronDown, 
  ChevronRight,
  Info,
  Settings,
  FileText,
  StickyNote,
  ArrowLeft,
  Home,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  EnhancedStepper, 
  EnhancedStepContent, 
  MultiStepForm,
  type EnhancedStepperStep 
} from '@/components/ui/enhanced-stepper';

export default function EnhancedStepperDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0]));
  const [formData, setFormData] = useState({
    generalInfo: {
      username: 'kazi562',
      fullName: 'Kazi Erfan',
      email: 'erfan@email.com'
    },
    companyDetails: {
      companyName: 'Cravty',
      cnpj: '13567247451386',
      accountNumber: '4613********865',
      ispb: '00416968',
      compeCode: '6567',
      issuer: 'Nadia Asha',
      accountType: 'Savings',
      covenant: ''
    },
    additionalAccounts: [
      {
        accountNumber: '4613671357348683',
        ispb: '00413568',
        compeCode: '6594',
        issuer: 'Julian Floyed',
        accountType: 'Current',
        covenant: ''
      }
    ]
  });

  // Enhanced stepper steps with collapsible functionality
  const steps: EnhancedStepperStep[] = [
    {
      id: 'general-details',
      title: 'General Details',
      description: 'Basic user information',
      status: currentStep === 0 ? 'current' : currentStep > 0 ? 'completed' : 'upcoming',
      icon: User,
      isExpanded: expandedSteps.has(0),
      canCollapse: true
    },
    {
      id: 'company-details',
      title: 'Company Details',
      description: 'Company and account information',
      status: currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'upcoming',
      icon: Building,
      isExpanded: expandedSteps.has(1),
      canCollapse: true
    }
  ];

  const handleStepToggle = (stepIndex: number, isExpanded: boolean) => {
    const newExpandedSteps = new Set(expandedSteps);
    if (isExpanded) {
      newExpandedSteps.add(stepIndex);
    } else {
      newExpandedSteps.delete(stepIndex);
    }
    setExpandedSteps(newExpandedSteps);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      // Auto-expand the next step
      setExpandedSteps(prev => new Set([...prev, currentStep + 1]));
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Mark current step as completed
    const newSteps = steps.map((step, index) => 
      index === currentStep ? { ...step, status: 'completed' as const } : step
    );
    // In a real app, you would update the steps state here
    
    console.log('Form completed:', formData);
    alert('Form completed successfully!');
  };

  const canProceed = () => {
    // Basic validation - in a real app, you'd have more sophisticated validation
    if (currentStep === 0) {
      return formData.generalInfo.username && formData.generalInfo.fullName && formData.generalInfo.email;
    }
    if (currentStep === 1) {
      return formData.companyDetails.companyName && formData.companyDetails.cnpj;
    }
    return true;
  };

  const addAdditionalAccount = () => {
    setFormData(prev => ({
      ...prev,
      additionalAccounts: [
        ...prev.additionalAccounts,
        {
          accountNumber: '',
          ispb: '',
          compeCode: '',
          issuer: '',
          accountType: 'Savings',
          covenant: ''
        }
      ]
    }));
  };

  const removeAdditionalAccount = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalAccounts: prev.additionalAccounts.filter((_, i) => i !== index)
    }));
  };

  const updateAdditionalAccount = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      additionalAccounts: prev.additionalAccounts.map((account, i) => 
        i === index ? { ...account, [field]: value } : account
      )
    }));
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/" className="flex items-center space-x-1 hover:text-gray-900">
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Enhanced Stepper Demo</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Stepper Demo</h1>
          <p className="text-gray-600 mt-1">
            Multi-step form with collapsible sections and step completion states
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Multi-Step Form */}
      <MultiStepForm
        steps={steps}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        onStepToggle={handleStepToggle}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onComplete={handleComplete}
        canProceed={canProceed()}
        showNavigation={true}
      >
        {/* Step 1: General Details */}
        {currentStep === 0 && (
          <EnhancedStepContent
            step={steps[0]}
            isExpanded={expandedSteps.has(0)}
            onToggle={() => handleStepToggle(0, !expandedSteps.has(0))}
            canCollapse={true}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">
                    Username <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="username"
                    value={formData.generalInfo.username}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      generalInfo: { ...prev.generalInfo, username: e.target.value }
                    }))}
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <Label htmlFor="fullName">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.generalInfo.fullName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      generalInfo: { ...prev.generalInfo, fullName: e.target.value }
                    }))}
                    placeholder="Enter full name"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.generalInfo.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    generalInfo: { ...prev.generalInfo, email: e.target.value }
                  }))}
                  placeholder="Enter email address"
                />
              </div>
            </div>
          </EnhancedStepContent>
        )}

        {/* Step 2: Company Details */}
        {currentStep === 1 && (
          <EnhancedStepContent
            step={steps[1]}
            isExpanded={expandedSteps.has(1)}
            onToggle={() => handleStepToggle(1, !expandedSteps.has(1))}
            canCollapse={true}
          >
            <div className="space-y-6">
              {/* Primary Company Details */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Company Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">
                      Company Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="companyName"
                      value={formData.companyDetails.companyName}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        companyDetails: { ...prev.companyDetails, companyName: e.target.value }
                      }))}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cnpj">
                      CNPJ <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="cnpj"
                      value={formData.companyDetails.cnpj}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        companyDetails: { ...prev.companyDetails, cnpj: e.target.value }
                      }))}
                      placeholder="Enter CNPJ"
                    />
                  </div>
                </div>
              </div>

              {/* Primary Account Details */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Primary Account</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={formData.companyDetails.accountNumber}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        companyDetails: { ...prev.companyDetails, accountNumber: e.target.value }
                      }))}
                      placeholder="Enter account number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ispb">ISPB</Label>
                    <Input
                      id="ispb"
                      value={formData.companyDetails.ispb}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        companyDetails: { ...prev.companyDetails, ispb: e.target.value }
                      }))}
                      placeholder="Enter ISPB"
                    />
                  </div>
                  <div>
                    <Label htmlFor="compeCode">Compe Code</Label>
                    <Input
                      id="compeCode"
                      value={formData.companyDetails.compeCode}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        companyDetails: { ...prev.companyDetails, compeCode: e.target.value }
                      }))}
                      placeholder="Enter Compe Code"
                    />
                  </div>
                  <div>
                    <Label htmlFor="issuer">Issuer</Label>
                    <Input
                      id="issuer"
                      value={formData.companyDetails.issuer}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        companyDetails: { ...prev.companyDetails, issuer: e.target.value }
                      }))}
                      placeholder="Enter issuer name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountType">Account Type</Label>
                    <Select
                      value={formData.companyDetails.accountType}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        companyDetails: { ...prev.companyDetails, accountType: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Savings">Savings</SelectItem>
                        <SelectItem value="Current">Current</SelectItem>
                        <SelectItem value="Investment">Investment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="covenant">Covenant</Label>
                    <Input
                      id="covenant"
                      value={formData.companyDetails.covenant}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        companyDetails: { ...prev.companyDetails, covenant: e.target.value }
                      }))}
                      placeholder="Enter covenant details"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Accounts */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 border-b pb-2">Additional Accounts</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAdditionalAccount}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <ChevronRight className="h-4 w-4 mr-1" />
                    Add Additional Account
                  </Button>
                </div>
                
                {formData.additionalAccounts.map((account, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-gray-700">Account {index + 1}</h5>
                      {formData.additionalAccounts.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAdditionalAccount(index)}
                          className="text-red-600 hover:text-red-700 p-1 h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`accountNumber-${index}`}>Account Number</Label>
                        <Input
                          id={`accountNumber-${index}`}
                          value={account.accountNumber}
                          onChange={(e) => updateAdditionalAccount(index, 'accountNumber', e.target.value)}
                          placeholder="Enter account number"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`ispb-${index}`}>ISPB</Label>
                        <Input
                          id={`ispb-${index}`}
                          value={account.ispb}
                          onChange={(e) => updateAdditionalAccount(index, 'ispb', e.target.value)}
                          placeholder="Enter ISPB"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`compeCode-${index}`}>Compe Code</Label>
                        <Input
                          id={`compeCode-${index}`}
                          value={account.compeCode}
                          onChange={(e) => updateAdditionalAccount(index, 'compeCode', e.target.value)}
                          placeholder="Enter Compe Code"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`issuer-${index}`}>Issuer</Label>
                        <Input
                          id={`issuer-${index}`}
                          value={account.issuer}
                          onChange={(e) => updateAdditionalAccount(index, 'issuer', e.target.value)}
                          placeholder="Enter issuer name"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`accountType-${index}`}>Account Type</Label>
                        <Select
                          value={account.accountType}
                          onValueChange={(value) => updateAdditionalAccount(index, 'accountType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Savings">Savings</SelectItem>
                            <SelectItem value="Current">Current</SelectItem>
                            <SelectItem value="Investment">Investment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`covenant-${index}`}>Covenant</Label>
                        <Input
                          id={`covenant-${index}`}
                          value={account.covenant}
                          onChange={(e) => updateAdditionalAccount(index, 'covenant', e.target.value)}
                          placeholder="Enter covenant details"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </EnhancedStepContent>
        )}
      </MultiStepForm>

      {/* Debug Info */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm">Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs space-y-1">
            <p>Current Step: {currentStep}</p>
            <p>Expanded Steps: {Array.from(expandedSteps).join(', ')}</p>
            <p>Can Proceed: {canProceed() ? 'Yes' : 'No'}</p>
            <p>Form Data: {JSON.stringify(formData, null, 2)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
