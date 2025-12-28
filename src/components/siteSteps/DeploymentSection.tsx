import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Edit,
  Plus,
  Package,
  Settings,
  Activity,
  Upload,
  FileText,
  Loader2,
  X
} from 'lucide-react';
import { Site } from '@/types/siteTypes';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { PageService } from '@/services/pageService';
import { DatePicker } from '@/components/ui/date-picker';
import { FileUploadService } from '@/services/fileUploadService';
import { formatDate } from '@/lib/dateUtils';

interface DeploymentSectionProps {
  site: Site;
  onSiteUpdate: (updatedSite: Site) => void;
}

interface DeploymentStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  completedAt?: string;
  completedBy?: string;
  notes?: string;
  estimatedHours: number;
  actualHours?: number;
  deliveryReceipt?: string;
}

interface DeploymentData {
  steps: DeploymentStep[];
  deploymentEngineer?: string;
  startDate?: string;
  targetDate?: string;
  progress: number;
  notes: Array<{ id: string; author: string; content: string; timestamp: string }>;
}

const DEFAULT_STEPS: DeploymentStep[] = [
  {
    id: 'hardware_delivery',
    name: 'Hardware Delivery',
    status: 'pending',
    estimatedHours: 4
  },
  {
    id: 'software_installation',
    name: 'Software Installation',
    status: 'pending',
    estimatedHours: 8
  },
  {
    id: 'network_setup',
    name: 'Network Setup',
    status: 'pending',
    estimatedHours: 6
  },
  {
    id: 'system_testing',
    name: 'System Testing',
    status: 'pending',
    estimatedHours: 4
  }
];

const DeploymentSection: React.FC<DeploymentSectionProps> = ({ site, onSiteUpdate }) => {
  const { currentRole, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deploymentData, setDeploymentData] = useState<DeploymentData>({
    steps: DEFAULT_STEPS,
    progress: 0,
    notes: []
  });
  const [showStepDialog, setShowStepDialog] = useState(false);
  const [selectedStep, setSelectedStep] = useState<DeploymentStep | null>(null);
  const [stepNotes, setStepNotes] = useState('');
  const [deliveryReceipt, setDeliveryReceipt] = useState<File | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  const canUpdateDeployment = currentRole === 'admin' || currentRole === 'deployment_engineer';

  useEffect(() => {
    loadDeploymentData();
  }, [site.id]);

  const loadDeploymentData = async () => {
    try {
      setLoading(true);
      const page = await PageService.getPage('deployment', site.id);
      
      if (page) {
        // Load deployment_checklist section (steps)
        const checklistSection = page.sections.find(s => s.section_name === 'deployment_checklist');
        if (checklistSection) {
          const stepsField = checklistSection.fields.find(f => f.field_name === 'steps');
          if (stepsField && stepsField.field_value) {
            try {
              const steps = typeof stepsField.field_value === 'string' 
                ? JSON.parse(stepsField.field_value) 
                : stepsField.field_value;
              if (Array.isArray(steps)) {
                deploymentData.steps = steps;
              }
            } catch (e) {
              console.error('Error parsing steps:', e);
            }
          }
        }

        // Load installation section (engineer, dates, progress)
        const installationSection = page.sections.find(s => s.section_name === 'installation');
        if (installationSection) {
          const engineerField = installationSection.fields.find(f => f.field_name === 'deployment_engineer');
          const startDateField = installationSection.fields.find(f => f.field_name === 'start_date');
          const targetDateField = installationSection.fields.find(f => f.field_name === 'target_date');
          const progressField = installationSection.fields.find(f => f.field_name === 'progress');

          if (engineerField?.field_value) {
            deploymentData.deploymentEngineer = typeof engineerField.field_value === 'string' 
              ? engineerField.field_value 
              : String(engineerField.field_value);
          }
          if (startDateField?.field_value) {
            deploymentData.startDate = typeof startDateField.field_value === 'string' 
              ? startDateField.field_value 
              : String(startDateField.field_value);
          }
          if (targetDateField?.field_value) {
            deploymentData.targetDate = typeof targetDateField.field_value === 'string' 
              ? targetDateField.field_value 
              : String(targetDateField.field_value);
          }
          if (progressField?.field_value) {
            const progress = typeof progressField.field_value === 'string' 
              ? parseFloat(progressField.field_value) 
              : Number(progressField.field_value);
            if (!isNaN(progress)) {
              deploymentData.progress = progress;
            }
          }
        }

        // Load testing section (notes)
        const testingSection = page.sections.find(s => s.section_name === 'testing');
        if (testingSection) {
          const notesField = testingSection.fields.find(f => f.field_name === 'notes');
          if (notesField && notesField.field_value) {
            try {
              const notes = typeof notesField.field_value === 'string' 
                ? JSON.parse(notesField.field_value) 
                : notesField.field_value;
              if (Array.isArray(notes)) {
                deploymentData.notes = notes;
              }
            } catch (e) {
              console.error('Error parsing notes:', e);
            }
          }
        }

        // Calculate progress from steps
        const completedSteps = deploymentData.steps.filter(s => s.status === 'completed').length;
        const totalSteps = deploymentData.steps.length;
        deploymentData.progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

        setDeploymentData({ ...deploymentData });
      } else {
        // Initialize with default data
        setDeploymentData({
          steps: DEFAULT_STEPS,
          deploymentEngineer: profile?.full_name || undefined,
          progress: 0,
          notes: []
        });
      }
    } catch (error) {
      console.error('Error loading deployment data:', error);
      toast.error('Failed to load deployment data');
      setDeploymentData({
        steps: DEFAULT_STEPS,
        progress: 0,
        notes: []
      });
    } finally {
      setLoading(false);
    }
  };

  const saveDeploymentData = async () => {
    try {
      setSubmitting(true);

      // Save steps to deployment_checklist section
      await PageService.updateField(
        site.id,
        'deployment',
        'deployment_checklist',
        'steps',
        JSON.stringify(deploymentData.steps)
      );

      // Save installation data
      if (deploymentData.deploymentEngineer) {
        await PageService.updateField(
          site.id,
          'deployment',
          'installation',
          'deployment_engineer',
          deploymentData.deploymentEngineer
        );
      }
      if (deploymentData.startDate) {
        await PageService.updateField(
          site.id,
          'deployment',
          'installation',
          'start_date',
          deploymentData.startDate
        );
      }
      if (deploymentData.targetDate) {
        await PageService.updateField(
          site.id,
          'deployment',
          'installation',
          'target_date',
          deploymentData.targetDate
        );
      }
      await PageService.updateField(
        site.id,
        'deployment',
        'installation',
        'progress',
        String(deploymentData.progress)
      );

      // Save notes
      await PageService.updateField(
        site.id,
        'deployment',
        'testing',
        'notes',
        JSON.stringify(deploymentData.notes)
      );

      toast.success('Deployment data saved successfully');
      await loadDeploymentData();
    } catch (error: any) {
      console.error('Error saving deployment data:', error);
      toast.error(error?.message || 'Failed to save deployment data');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStepUpdate = (step: DeploymentStep) => {
    setSelectedStep(step);
    setStepNotes(step.notes || '');
    setDeliveryReceipt(null);
    setReceiptUrl(step.deliveryReceipt || null);
    setShowStepDialog(true);
  };

  const canUpdateStep = (step: DeploymentStep) => {
    const stepIndex = deploymentData.steps.findIndex(s => s.id === step.id);
    if (stepIndex === 0) return true;
    if (stepIndex > 0) {
      const previousStep = deploymentData.steps[stepIndex - 1];
      return previousStep.status === 'completed';
    }
    return false;
  };

  const handleReceiptUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload an image (JPEG, PNG, GIF) or PDF.');
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size exceeds 10MB limit.');
      return;
    }

    try {
      setUploadingReceipt(true);
      setDeliveryReceipt(file);

      const uploadResult = await FileUploadService.uploadFile(
        file,
        `deployment-${site.id}-receipt-${Date.now()}`
      );

      if (uploadResult.success && uploadResult.publicUrl) {
        setReceiptUrl(uploadResult.publicUrl);
        toast.success('Delivery receipt uploaded successfully');
      } else {
        toast.error(uploadResult.error || 'Failed to upload receipt');
        setDeliveryReceipt(null);
      }
    } catch (error) {
      console.error('Error uploading receipt:', error);
      toast.error('Failed to upload delivery receipt');
      setDeliveryReceipt(null);
    } finally {
      setUploadingReceipt(false);
    }
  };

  const updateStepStatus = async (stepId: string, status: 'completed' | 'in_progress' | 'blocked') => {
    if (!selectedStep) return;

    const updatedSteps = deploymentData.steps.map(step => 
      step.id === stepId 
        ? { 
            ...step, 
            status, 
            completedAt: status === 'completed' ? new Date().toISOString() : undefined,
            completedBy: status === 'completed' ? profile?.full_name || 'Unknown' : undefined,
            notes: stepNotes,
            deliveryReceipt: receiptUrl || step.deliveryReceipt
          }
        : step
    );

    // Calculate progress
    const completedSteps = updatedSteps.filter(s => s.status === 'completed').length;
    const totalSteps = updatedSteps.length;
    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    setDeploymentData({
      ...deploymentData,
      steps: updatedSteps,
      progress
    });

    // Save to backend
    await saveDeploymentData();

    setShowStepDialog(false);
    setDeliveryReceipt(null);
    setReceiptUrl(null);
    toast.success(`Step ${status === 'completed' ? 'completed' : 'updated'}`);
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-3 text-gray-600">Loading deployment data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Deployment</h2>
          <p className="text-gray-600 mt-1">
            Track deployment progress and manage installation workflows
          </p>
        </div>
      </div>

      {/* Deployment Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5 text-blue-600" />
            Deployment Progress
          </CardTitle>
          <CardDescription>
            Overall deployment status and progress tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Overall Progress</span>
              <span>{deploymentData.progress}%</span>
            </div>
            <Progress value={deploymentData.progress} className="h-2" />
          </div>

          {/* Deployment Steps */}
          <div className="space-y-3">
            {deploymentData.steps.map((step) => (
              <div key={step.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{step.name}</h4>
                    <Badge className={getStepStatusColor(step.status)}>
                      {step.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Estimated: {step.estimatedHours}h
                    {step.actualHours && ` • Actual: ${step.actualHours}h`}
                  </div>
                  {step.notes && (
                    <div className="text-sm text-gray-500 mt-1">{step.notes}</div>
                  )}
                  {step.completedAt && (
                    <div className="text-sm text-gray-500 mt-1">
                      Completed by {step.completedBy} on {formatDate(step.completedAt)}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStepUpdate(step)}
                    disabled={!canUpdateStep(step) || !canUpdateDeployment}
                    title={!canUpdateStep(step) ? "Previous step must be completed" : "Update Step"}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deployment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5 text-cyan-600" />
            Deployment Details
          </CardTitle>
          <CardDescription>
            Key deployment information and timeline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deployment-engineer">Deployment Engineer</Label>
              <Input 
                id="deployment-engineer" 
                value={deploymentData.deploymentEngineer || ''} 
                onChange={(e) => setDeploymentData({ ...deploymentData, deploymentEngineer: e.target.value })}
                disabled={!canUpdateDeployment || submitting}
                placeholder="Enter deployment engineer name"
              />
            </div>
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <DatePicker
                value={deploymentData.startDate ? new Date(deploymentData.startDate) : undefined}
                onChange={(date) => setDeploymentData({ 
                  ...deploymentData, 
                  startDate: date ? date.toISOString().split('T')[0] : undefined 
                })}
                disabled={!canUpdateDeployment || submitting}
                placeholder="Select start date"
              />
            </div>
            <div>
              <Label htmlFor="target-date">Target Completion Date</Label>
              <DatePicker
                value={deploymentData.targetDate ? new Date(deploymentData.targetDate) : undefined}
                onChange={(date) => setDeploymentData({ 
                  ...deploymentData, 
                  targetDate: date ? date.toISOString().split('T')[0] : undefined 
                })}
                disabled={!canUpdateDeployment || submitting}
                placeholder="Select target date"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      {canUpdateDeployment && (
        <div className="flex justify-end">
          <Button
            onClick={saveDeploymentData}
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Save Deployment Data
              </>
            )}
          </Button>
        </div>
      )}

      {/* Step Update Dialog */}
      <Dialog open={showStepDialog} onOpenChange={setShowStepDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Step: {selectedStep?.name}</DialogTitle>
            <DialogDescription>
              Update step status and add notes
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="step-notes">Notes</Label>
              <Textarea
                id="step-notes"
                placeholder="Add notes about this step..."
                value={stepNotes}
                onChange={(e) => setStepNotes(e.target.value)}
                rows={4}
              />
            </div>

            {/* Delivery Receipt Upload - Only for Hardware Delivery */}
            {selectedStep?.name === 'Hardware Delivery' && (
              <div>
                <Label htmlFor="delivery-receipt">Delivery Receipt</Label>
                <div className="mt-2">
                  <Input
                    id="delivery-receipt"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleReceiptUpload}
                    className="cursor-pointer"
                    disabled={uploadingReceipt}
                  />
                  {receiptUrl && (
                    <div className="mt-2 flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Receipt uploaded</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReceiptUrl(null);
                          setDeliveryReceipt(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Upload delivery receipt image or PDF (required for completion)
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => updateStepStatus(selectedStep!.id, 'in_progress')}
              disabled={submitting}
            >
              Mark In Progress
            </Button>
            <Button 
              onClick={() => {
                if (selectedStep?.name === 'Hardware Delivery' && !receiptUrl) {
                  toast.error('Please upload delivery receipt before marking as complete');
                  return;
                }
                updateStepStatus(selectedStep!.id, 'completed');
              }}
              className="bg-green-600 hover:bg-green-700"
              disabled={submitting}
            >
              Mark Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeploymentSection;

