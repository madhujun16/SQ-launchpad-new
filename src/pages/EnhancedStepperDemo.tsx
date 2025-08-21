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
  X,
  Wifi,
  Monitor,
  Server,
  Truck,
  CreditCard
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  EnhancedStepper, 
  EnhancedStepContent, 
  MultiStepForm,
  ReadOnlyInput,
  ReadOnlyTextarea,
  ReadOnlySelect,
  isStepReadOnly,
  type EnhancedStepperStep 
} from '@/components/ui/enhanced-stepper';

export default function EnhancedStepperDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0]));
  
  // Enhanced form data for site details with realistic information
  const [formData, setFormData] = useState({
    siteInfo: {
      siteName: 'ASDA Redditch (AR004)',
      siteCode: 'AR004',
      location: 'Redditch, Worcestershire',
      address: 'Unit 4, Kingfisher Shopping Centre, Redditch B97 4HA',
      contactPerson: 'Sarah Johnson',
      contactPhone: '+44 1527 123456',
      contactEmail: 'sarah.johnson@asda.co.uk'
    },
    technicalRequirements: {
      networkType: 'Fiber Optic',
      bandwidth: '1 Gbps',
      hardwareSpecs: 'POS Terminals, Self-Service Kiosks, Kitchen Display Systems',
      softwareRequirements: 'POS System v3.2, Inventory Management, Customer Analytics',
      securityLevel: 'PCI DSS Level 1',
      backupRequirements: 'Daily automated backups with 30-day retention'
    },
    deploymentDetails: {
      deploymentDate: '2024-03-15',
      deploymentTeam: 'TechDeploy Squad Alpha',
      estimatedDuration: '3-4 days',
      specialRequirements: 'After-hours deployment to minimize business disruption',
      riskAssessment: 'Low - Standard deployment with experienced team',
      contingencyPlan: 'Rollback plan available with 2-hour recovery time'
    },
    financialInfo: {
      totalBudget: '£45,000',
      hardwareCost: '£28,000',
      softwareCost: '£12,000',
      laborCost: '£5,000',
      approvalStatus: 'Approved',
      approvedBy: 'Michael Chen',
      approvalDate: '2024-02-28'
    }
  });

  // Enhanced stepper steps with realistic site go-live flow
  const steps: EnhancedStepperStep[] = [
    {
      id: 'site-information',
      title: 'Site Information',
      description: 'Basic site details and contact information',
      status: currentStep === 0 ? 'current' : currentStep > 0 ? 'completed' : 'upcoming',
      icon: Building,
      isExpanded: expandedSteps.has(0),
      canCollapse: true
    },
    {
      id: 'technical-requirements',
      title: 'Technical Requirements',
      description: 'Network, hardware, and software specifications',
      status: currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'upcoming',
      icon: Server,
      isExpanded: expandedSteps.has(1),
      canCollapse: true
    },
    {
      id: 'deployment-planning',
      title: 'Deployment Planning',
      description: 'Timeline, team, and risk assessment',
      status: currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'upcoming',
      icon: Truck,
      isExpanded: expandedSteps.has(2),
      canCollapse: true
    },
    {
      id: 'financial-approval',
      title: 'Financial Approval',
      description: 'Budget, costs, and approval status',
      status: currentStep === 3 ? 'current' : currentStep > 3 ? 'completed' : 'upcoming',
      icon: CreditCard,
      isExpanded: expandedSteps.has(3),
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
      // Mark current step as completed
      const newSteps = steps.map((step, index) => 
        index === currentStep ? { ...step, status: 'completed' as const } : step
      );
      
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
    
    console.log('Site go-live process completed:', formData);
    alert('Site go-live process completed successfully!');
  };

  const canProceed = () => {
    // Basic validation based on current step
    if (currentStep === 0) {
      return formData.siteInfo.siteName && formData.siteInfo.siteCode && formData.siteInfo.contactEmail;
    }
    if (currentStep === 1) {
      return formData.technicalRequirements.networkType && formData.technicalRequirements.bandwidth;
    }
    if (currentStep === 2) {
      return formData.deploymentDetails.deploymentDate && formData.deploymentDetails.deploymentTeam;
    }
    if (currentStep === 3) {
      return formData.financialInfo.totalBudget && formData.financialInfo.approvalStatus === 'Approved';
    }
    return true;
  };

  // Helper function to determine if a step should be read-only
  const getStepReadOnlyStatus = (stepIndex: number): boolean => {
    const step = steps[stepIndex];
    return isStepReadOnly(step);
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
        <span className="text-gray-900 font-medium">Site Go-Live Process</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Site Go-Live Process</h1>
          <p className="text-gray-600 mt-1">
            Multi-step form for site deployment with conditional field editability
          </p>
          <div className="mt-2 flex items-center space-x-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Building className="h-3 w-3 mr-1" />
              ASDA Redditch (AR004)
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              In Progress
            </Badge>
          </div>
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
        {/* Step 1: Site Information */}
        {currentStep === 0 && (
          <EnhancedStepContent
            step={steps[0]}
            isExpanded={expandedSteps.has(0)}
            onToggle={() => handleStepToggle(0, !expandedSteps.has(0))}
            canCollapse={true}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReadOnlyInput
                  label="Site Name"
                  value={formData.siteInfo.siteName}
                  required={true}
                  placeholder="Enter site name"
                  readOnly={getStepReadOnlyStatus(0)}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    siteInfo: { ...prev.siteInfo, siteName: value }
                  }))}
                />
                <ReadOnlyInput
                  label="Site Code"
                  value={formData.siteInfo.siteCode}
                  required={true}
                  placeholder="Enter site code"
                  readOnly={getStepReadOnlyStatus(0)}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    siteInfo: { ...prev.siteInfo, siteCode: value }
                  }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReadOnlyInput
                  label="Location"
                  value={formData.siteInfo.location}
                  placeholder="Enter city/region"
                  readOnly={getStepReadOnlyStatus(0)}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    siteInfo: { ...prev.siteInfo, location: value }
                  }))}
                />
                <ReadOnlyInput
                  label="Contact Person"
                  value={formData.siteInfo.contactPerson}
                  placeholder="Enter contact person name"
                  readOnly={getStepReadOnlyStatus(0)}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    siteInfo: { ...prev.siteInfo, contactPerson: value }
                  }))}
                />
              </div>
              <ReadOnlyTextarea
                label="Full Address"
                value={formData.siteInfo.address}
                placeholder="Enter complete address"
                readOnly={getStepReadOnlyStatus(0)}
                onChange={(value) => setFormData(prev => ({
                  ...prev,
                  siteInfo: { ...prev.siteInfo, address: value }
                }))}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReadOnlyInput
                  label="Contact Phone"
                  value={formData.siteInfo.contactPhone}
                  type="tel"
                  placeholder="Enter phone number"
                  readOnly={getStepReadOnlyStatus(0)}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    siteInfo: { ...prev.siteInfo, contactPhone: value }
                  }))}
                />
                <ReadOnlyInput
                  label="Contact Email"
                  value={formData.siteInfo.contactEmail}
                  type="email"
                  required={true}
                  placeholder="Enter email address"
                  readOnly={getStepReadOnlyStatus(0)}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    siteInfo: { ...prev.siteInfo, contactEmail: value }
                  }))}
                />
              </div>
            </div>
          </EnhancedStepContent>
        )}

        {/* Step 2: Technical Requirements */}
        {currentStep === 1 && (
          <EnhancedStepContent
            step={steps[1]}
            isExpanded={expandedSteps.has(1)}
            onToggle={() => handleStepToggle(1, !expandedSteps.has(1))}
            canCollapse={true}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReadOnlySelect
                  label="Network Type"
                  value={formData.technicalRequirements.networkType}
                  required={true}
                  placeholder="Select network type"
                  options={[
                    { value: 'Fiber Optic', label: 'Fiber Optic' },
                    { value: 'Copper', label: 'Copper' },
                    { value: 'Wireless', label: 'Wireless' },
                    { value: 'Hybrid', label: 'Hybrid' }
                  ]}
                  readOnly={getStepReadOnlyStatus(1)}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    technicalRequirements: { ...prev.technicalRequirements, networkType: value }
                  }))}
                />
                <ReadOnlyInput
                  label="Bandwidth"
                  value={formData.technicalRequirements.bandwidth}
                  required={true}
                  placeholder="Enter bandwidth (e.g., 1 Gbps)"
                  readOnly={getStepReadOnlyStatus(1)}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    technicalRequirements: { ...prev.technicalRequirements, bandwidth: value }
                  }))}
                />
              </div>
              <ReadOnlyTextarea
                label="Hardware Specifications"
                value={formData.technicalRequirements.hardwareSpecs}
                placeholder="List required hardware components"
                readOnly={getStepReadOnlyStatus(1)}
                onChange={(value) => setFormData(prev => ({
                  ...prev,
                  technicalRequirements: { ...prev.technicalRequirements, hardwareSpecs: value }
                }))}
              />
              <ReadOnlyTextarea
                label="Software Requirements"
                value={formData.technicalRequirements.softwareRequirements}
                placeholder="List required software applications"
                readOnly={getStepReadOnlyStatus(1)}
                onChange={(value) => setFormData(prev => ({
                  ...prev,
                  technicalRequirements: { ...prev.technicalRequirements, softwareRequirements: value }
                }))}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReadOnlySelect
                  label="Security Level"
                  value={formData.technicalRequirements.securityLevel}
                  placeholder="Select security level"
                  options={[
                    { value: 'PCI DSS Level 1', label: 'PCI DSS Level 1' },
                    { value: 'PCI DSS Level 2', label: 'PCI DSS Level 2' },
                    { value: 'Basic', label: 'Basic' },
                    { value: 'Enhanced', label: 'Enhanced' }
                  ]}
                  readOnly={getStepReadOnlyStatus(1)}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    technicalRequirements: { ...prev.technicalRequirements, securityLevel: value }
                  }))}
                />
                <ReadOnlyInput
                  label="Backup Requirements"
                  value={formData.technicalRequirements.backupRequirements}
                  placeholder="Enter backup specifications"
                  readOnly={getStepReadOnlyStatus(1)}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    technicalRequirements: { ...prev.technicalRequirements, backupRequirements: value }
                  }))}
                />
              </div>
            </div>
          </EnhancedStepContent>
        )}

        {/* Step 3: Deployment Planning */}
        {currentStep === 2 && (
          <EnhancedStepContent
            step={steps[2]}
            isExpanded={expandedSteps.has(2)}
            onToggle={() => handleStepToggle(2, !expandedSteps.has(2))}
            canCollapse={true}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReadOnlyInput
                  label="Deployment Date"
                  value={formData.deploymentDetails.deploymentDate}
                  type="date"
                  required={true}
                  readOnly={getStepReadOnlyStatus(2)}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    deploymentDetails: { ...prev.deploymentDetails, deploymentDate: value }
                  }))}
                />
                <ReadOnlyInput
                  label="Deployment Team"
                  value={formData.deploymentDetails.deploymentTeam}
                  required={true}
                  placeholder="Enter team name"
                  readOnly={getStepReadOnlyStatus(2)}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    deploymentDetails: { ...prev.deploymentDetails, deploymentTeam: value }
                  }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReadOnlyInput
                  label="Estimated Duration"
                  value={formData.deploymentDetails.estimatedDuration}
                  placeholder="e.g., 3-4 days"
                  readOnly={getStepReadOnlyStatus(2)}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    deploymentDetails: { ...prev.deploymentDetails, estimatedDuration: value }
                  }))}
                />
                <ReadOnlySelect
                  label="Risk Assessment"
                  value={formData.deploymentDetails.riskAssessment}
                  placeholder="Select risk level"
                  options={[
                    { value: 'Low', label: 'Low' },
                    { value: 'Medium', label: 'Medium' },
                    { value: 'High', label: 'High' },
                    { value: 'Critical', label: 'Critical' }
                  ]}
                  readOnly={getStepReadOnlyStatus(2)}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    deploymentDetails: { ...prev.deploymentDetails, riskAssessment: value }
                  }))}
                />
              </div>
              <ReadOnlyTextarea
                label="Special Requirements"
                value={formData.deploymentDetails.specialRequirements}
                placeholder="Any special deployment requirements"
                readOnly={getStepReadOnlyStatus(2)}
                onChange={(value) => setFormData(prev => ({
                  ...prev,
                  deploymentDetails: { ...prev.deploymentDetails, specialRequirements: value }
                }))}
              />
              <ReadOnlyTextarea
                label="Contingency Plan"
                value={formData.deploymentDetails.contingencyPlan}
                placeholder="Describe contingency plan"
                readOnly={getStepReadOnlyStatus(2)}
                onChange={(value) => setFormData(prev => ({
                  ...prev,
                  deploymentDetails: { ...prev.deploymentDetails, contingencyPlan: value }
                }))}
              />
            </div>
          </EnhancedStepContent>
        )}

        {/* Step 4: Financial Approval */}
        {currentStep === 3 && (
          <EnhancedStepContent
            step={steps[3]}
            isExpanded={expandedSteps.has(3)}
            onToggle={() => handleStepToggle(3, !expandedSteps.has(3))}
            canCollapse={true}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReadOnlyInput
                  label="Total Budget"
                  value={formData.financialInfo.totalBudget}
                  required={true}
                  placeholder="Enter total budget"
                  readOnly={getStepReadOnlyStatus(3)}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    financialInfo: { ...prev.financialInfo, totalBudget: value }
                  }))}
                />
                <ReadOnlyInput
                  label="Hardware Cost"
                  value={formData.financialInfo.hardwareCost}
                  placeholder="Enter hardware cost"
                  readOnly={getStepReadOnlyStatus(3)}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    financialInfo: { ...prev.financialInfo, hardwareCost: value }
                  }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReadOnlyInput
                  label="Software Cost"
                  value={formData.financialInfo.softwareCost}
                  placeholder="Enter software cost"
                  readOnly={getStepReadOnlyStatus(3)}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    financialInfo: { ...prev.financialInfo, softwareCost: value }
                  }))}
                />
                <ReadOnlyInput
                  label="Labor Cost"
                  value={formData.financialInfo.laborCost}
                  placeholder="Enter labor cost"
                  readOnly={getStepReadOnlyStatus(3)}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    financialInfo: { ...prev.financialInfo, laborCost: value }
                  }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReadOnlySelect
                  label="Approval Status"
                  value={formData.financialInfo.approvalStatus}
                  required={true}
                  placeholder="Select approval status"
                  options={[
                    { value: 'Pending', label: 'Pending' },
                    { value: 'Approved', label: 'Approved' },
                    { value: 'Rejected', label: 'Rejected' },
                    { value: 'Under Review', label: 'Under Review' }
                  ]}
                  readOnly={getStepReadOnlyStatus(3)}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    financialInfo: { ...prev.financialInfo, approvalStatus: value }
                  }))}
                />
                <ReadOnlyInput
                  label="Approved By"
                  value={formData.financialInfo.approvedBy}
                  placeholder="Enter approver name"
                  readOnly={getStepReadOnlyStatus(3)}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    financialInfo: { ...prev.financialInfo, approvedBy: value }
                  }))}
                />
              </div>
              <ReadOnlyInput
                label="Approval Date"
                value={formData.financialInfo.approvalDate}
                type="date"
                readOnly={getStepReadOnlyStatus(3)}
                onChange={(value) => setFormData(prev => ({
                  ...prev,
                  financialInfo: { ...prev.financialInfo, approvalDate: value }
                }))}
              />
            </div>
          </EnhancedStepContent>
        )}
      </MultiStepForm>

      {/* Status Summary */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Process Status Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {steps.map((step, index) => (
              <div key={step.id} className="text-center">
                <div className={`
                  w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center
                  ${step.status === 'completed' ? 'bg-green-500 text-white' : 
                    step.status === 'current' ? 'bg-blue-500 text-white' : 
                    'bg-gray-300 text-gray-600'}
                `}>
                  {step.status === 'completed' ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : step.status === 'current' ? (
                    <span className="text-sm font-bold">{index + 1}</span>
                  ) : (
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900">{step.title}</p>
                <p className={`text-xs ${
                  step.status === 'completed' ? 'text-green-600' : 
                  step.status === 'current' ? 'text-blue-600' : 
                  'text-gray-500'
                }`}>
                  {step.status === 'completed' ? 'Completed' : 
                   step.status === 'current' ? 'In Progress' : 
                   'Pending'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
