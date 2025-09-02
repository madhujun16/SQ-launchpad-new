import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package, 
  Truck, 
  Wrench,
  Eye,
  Edit,
  Plus,
  Download,
  Building,
  User,
  Calendar,
  AlertCircle,
  CheckSquare,
  Square,
  MessageSquare,
  FileText,
  Settings,
  Activity,
  Upload
} from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { AccessDenied } from '@/components/AccessDenied';
import { ContentLoader } from '@/components/ui/loader';
import { getRoleConfig } from '@/lib/roles';
import { formatDate, formatDateTime } from '@/lib/dateUtils';

interface AssetDetail {
  id: string;
  serialNumber: string;
  serviceCycle: number;
  startOfServiceDate: string;
  addedToAssets: boolean;
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

interface HardwareItem {
  id: string;
  name: string;
  model: string;
  quantity: number;
  notes?: string;
  deliveryReceipt?: string;
  assetDetails: AssetDetail[];
  addedToAssets: boolean;
}

interface Deployment {
  id: string;
  siteName: string;
  siteId: string;
  deploymentEngineer: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: string;
  targetDate: string;
  progress: number;
  totalCost: number;
  hardwareItems: HardwareItem[];
  steps: DeploymentStep[];
  notes: Array<{ id: string; author: string; content: string; timestamp: string }>;
  createdAt: string;
  updatedAt: string;
}

const Deployment = () => {
  const { currentRole, profile } = useAuth();
  const { getTabAccess } = useRoleAccess();
  const roleConfig = getRoleConfig(currentRole || 'admin');
  
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [filteredDeployments, setFilteredDeployments] = useState<Deployment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showStepDialog, setShowStepDialog] = useState(false);
  const [showAssetDialog, setShowAssetDialog] = useState(false);
  const [selectedStep, setSelectedStep] = useState<DeploymentStep | null>(null);
  const [selectedHardwareItem, setSelectedHardwareItem] = useState<HardwareItem | null>(null);
  const [stepNotes, setStepNotes] = useState('');
  const [deliveryReceipt, setDeliveryReceipt] = useState<File | null>(null);
  const [assetDetails, setAssetDetails] = useState<AssetDetail[]>([]);
  const [loading, setLoading] = useState(true);

  // Check access permissions
  const tabAccess = getTabAccess('/deployment');
  
  // Mock data - deployment engineer focused with current dates
  useEffect(() => {
    if (!tabAccess.canAccess) return;
    
    const mockDeployments: Deployment[] = [
      {
        id: '1',
        siteName: 'Manchester North',
        siteId: 'site-001',
        deploymentEngineer: 'David Brown',
        status: 'in_progress',
        priority: 'high',
        startDate: '2025-09-01',
        targetDate: '2025-09-15',
        progress: 65,
        totalCost: 25000,
        hardwareItems: [
          {
            id: 'hw1',
            name: 'POS Terminal',
            model: 'Verifone VX520',
            quantity: 4,
            notes: 'All terminals installed and configured',
            addedToAssets: false,
            assetDetails: [
              { id: 'asset1', serialNumber: '', serviceCycle: 0, startOfServiceDate: '', addedToAssets: false },
              { id: 'asset2', serialNumber: '', serviceCycle: 0, startOfServiceDate: '', addedToAssets: false },
              { id: 'asset3', serialNumber: '', serviceCycle: 0, startOfServiceDate: '', addedToAssets: false },
              { id: 'asset4', serialNumber: '', serviceCycle: 0, startOfServiceDate: '', addedToAssets: false }
            ]
          },
          {
            id: 'hw2',
            name: 'Receipt Printer',
            model: 'Star TSP143',
            quantity: 2,
            notes: 'Ready for installation',
            addedToAssets: false,
            assetDetails: [
              { id: 'asset5', serialNumber: '', serviceCycle: 0, startOfServiceDate: '', addedToAssets: false },
              { id: 'asset6', serialNumber: '', serviceCycle: 0, startOfServiceDate: '', addedToAssets: false }
            ]
          }
        ],
        steps: [
          {
            id: 'step1',
            name: 'Hardware Delivery',
            status: 'completed',
            completedAt: '2025-09-05',
            completedBy: 'David Brown',
            notes: 'All hardware received and verified',
            estimatedHours: 4,
            actualHours: 3
          },
          {
            id: 'step2',
            name: 'Software Installation',
            status: 'completed',
            completedAt: '2025-09-06',
            completedBy: 'David Brown',
            notes: 'POS software installed and configured',
            estimatedHours: 8,
            actualHours: 6
          },
          {
            id: 'step3',
            name: 'Network Setup',
            status: 'in_progress',
            notes: 'Configuring network switches',
            estimatedHours: 6,
            actualHours: 4
          },
          {
            id: 'step4',
            name: 'System Testing',
            status: 'pending',
            estimatedHours: 4
          }
        ],
        notes: [
          {
            id: 'n1',
            author: 'David Brown',
            content: 'Site assessment completed. All requirements confirmed.',
            timestamp: '2025-09-01T10:00:00Z'
          },
          {
            id: 'n2',
            author: 'David Brown',
            content: 'Hardware inventory verified. All items accounted for.',
            timestamp: '2025-09-05T15:30:00Z'
          }
        ],
        createdAt: '2025-08-25',
        updatedAt: '2025-09-06'
      },
      {
        id: '2',
        siteName: 'Birmingham South',
        siteId: 'site-002',
        deploymentEngineer: 'Tom Wilson',
        status: 'scheduled',
        priority: 'medium',
        startDate: '2025-11-01',
        targetDate: '2025-12-15',
        progress: 0,
        totalCost: 18000,
        hardwareItems: [
          {
            id: 'hw3',
            name: 'Kitchen Display',
            model: 'KitchenConnect Pro',
            quantity: 2,
            notes: 'KDS units ready for installation',
            addedToAssets: false,
            assetDetails: [
              { id: 'asset7', serialNumber: '', serviceCycle: 0, startOfServiceDate: '', addedToAssets: false },
              { id: 'asset8', serialNumber: '', serviceCycle: 0, startOfServiceDate: '', addedToAssets: false }
            ]
          }
        ],
        steps: [
          {
            id: 'step5',
            name: 'Hardware Delivery',
            status: 'completed',
            completedAt: '2025-10-30',
            completedBy: 'Tom Wilson',
            notes: 'KDS hardware delivered',
            estimatedHours: 2,
            actualHours: 2
          },
          {
            id: 'step6',
            name: 'Software Installation',
          status: 'pending',
            estimatedHours: 6
          },
          {
            id: 'step7',
            name: 'Network Setup',
            status: 'pending',
            estimatedHours: 4
          },
          {
            id: 'step8',
            name: 'System Testing',
            status: 'pending',
            estimatedHours: 3
          }
        ],
        notes: [
          {
            id: 'n3',
            author: 'Tom Wilson',
            content: 'Project kickoff meeting completed.',
            timestamp: '2025-10-25T14:00:00Z'
          }
        ],
        createdAt: '2025-10-20',
        updatedAt: '2025-10-30'
      }
    ];

    setDeployments(mockDeployments);
    setFilteredDeployments(mockDeployments);
    setLoading(false);
  }, [tabAccess.canAccess]);

  useEffect(() => {
    if (!tabAccess.canAccess) return;
    
    let filtered = deployments;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(deployment =>
        deployment.siteName.toLowerCase().includes(searchLower) ||
        deployment.deploymentEngineer.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(deployment => deployment.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(deployment => deployment.priority === priorityFilter);
    }

    setFilteredDeployments(filtered);
  }, [deployments, searchTerm, statusFilter, priorityFilter, tabAccess.canAccess]);

  const getStatusColor = (status: string) => {
    switch (status) {
      // Green: Live
      case 'completed':
        return 'bg-green-100 text-green-800';
      
      // Gray: Created, Pending
      case 'scheduled':
        return 'bg-gray-100 text-gray-800';
      
      // Yellow: In Progress
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      
      // Red: Blocked, On Hold, Rejected
      case 'on_hold':
        return 'bg-red-100 text-red-800';
      
      // Blue: Procurement Done, Deployed, Approved
      case 'deployed':
        return 'bg-blue-100 text-blue-800';
      
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (deployment: Deployment) => {
    setSelectedDeployment(deployment);
    setShowDetailsDialog(true);
  };

  const handleStepUpdate = (step: DeploymentStep) => {
    setSelectedStep(step);
    setStepNotes(step.notes || '');
    setDeliveryReceipt(null);
    setShowStepDialog(true);
  };

  const handleAddToAssets = (hardwareItem: HardwareItem) => {
    setSelectedHardwareItem(hardwareItem);
    setAssetDetails([...hardwareItem.assetDetails]);
    setShowAssetDialog(true);
  };

  const canUpdateStep = (step: DeploymentStep, deployment: Deployment) => {
    const stepIndex = deployment.steps.findIndex(s => s.id === step.id);
    if (stepIndex === 0) return true; // First step can always be updated
    if (stepIndex > 0) {
      const previousStep = deployment.steps[stepIndex - 1];
      return previousStep.status === 'completed';
    }
    return false;
  };

  const updateStepStatus = (stepId: string, status: 'completed' | 'in_progress' | 'blocked') => {
    if (!selectedDeployment) return;
    
    const updatedDeployment = {
      ...selectedDeployment,
      steps: selectedDeployment.steps.map(step => 
        step.id === stepId 
          ? { 
              ...step, 
              status, 
              completedAt: status === 'completed' ? new Date().toISOString() : undefined,
              completedBy: status === 'completed' ? profile?.full_name || 'Unknown' : undefined,
              notes: stepNotes,
              deliveryReceipt: deliveryReceipt ? URL.createObjectURL(deliveryReceipt) : step.deliveryReceipt
            }
          : step
      )
    };
    
    setSelectedDeployment(updatedDeployment);
    setDeployments(deployments.map(d => d.id === selectedDeployment.id ? updatedDeployment : d));
    setShowStepDialog(false);
    setDeliveryReceipt(null);
    toast.success(`Step ${status === 'completed' ? 'completed' : 'updated'}`);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDeliveryReceipt(file);
    }
  };

  const saveAssetDetails = () => {
    if (!selectedDeployment || !selectedHardwareItem) return;

    // Validate that all serial numbers are filled
    const allSerialNumbersFilled = assetDetails.every(detail => detail.serialNumber.trim() !== '');
    if (!allSerialNumbersFilled) {
      toast.error('Please fill in all serial numbers');
      return;
    }

    const updatedDeployment = {
      ...selectedDeployment,
      hardwareItems: selectedDeployment.hardwareItems.map(item => 
        item.id === selectedHardwareItem.id 
          ? { 
              ...item, 
              addedToAssets: true,
              assetDetails: assetDetails.map(detail => ({ ...detail, addedToAssets: true }))
            }
          : item
      )
    };
    
    setSelectedDeployment(updatedDeployment);
    setDeployments(deployments.map(d => d.id === selectedDeployment.id ? updatedDeployment : d));
    setShowAssetDialog(false);
    toast.success(`${selectedHardwareItem.name} added to assets`);
  };

  const updateAssetDetail = (index: number, field: 'serialNumber' | 'serviceCycle' | 'startOfServiceDate', value: string | number) => {
    const updatedDetails = [...assetDetails];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };
    setAssetDetails(updatedDetails);
  };

  if (!tabAccess.canAccess) {
    return (
      <AccessDenied 
        pageName="Deployment"
        customMessage="You don't have permission to access the Deployment page."
      />
    );
  }

  if (loading) {
    return <ContentLoader />;
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deployment</h1>
          <p className="text-gray-600 mt-1">
            Track deployment progress and manage installation workflows
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <roleConfig.icon className="h-3 w-3" />
            <span>{roleConfig.displayName}</span>
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by site or engineer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setPriorityFilter('all');
            }}>
              <Filter className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Deployment Status Progress */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Deployment Status Progress
        </h2>
        <p className="text-gray-600 mb-6">
          Click a site to see full details and actions
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDeployments.map((deployment) => (
            <Card key={deployment.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{deployment.siteName}</CardTitle>
                    <CardDescription>
                      Assigned to {deployment.deploymentEngineer}
                    </CardDescription>
                    </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(deployment.status)}>
                        {deployment.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(deployment.priority)}>
                        {deployment.priority}
                      </Badge>
                  </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(deployment)}
                      className="h-6 w-6 p-0 hover:bg-gray-100"
                      title="View Details"
                    >
                      <Eye className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                    </Button>
                    </div>
                  </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Workflow Steps */}
                <div className="flex items-center justify-between space-x-2">
                  {deployment.steps.map((step, index) => (
                    <div key={step.id} className="flex flex-col items-center space-y-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.status === 'completed' ? 'bg-green-100 text-green-600' :
                        step.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {step.status === 'completed' ? (
                            <CheckCircle className="h-4 w-4" />
                        ) : step.status === 'in_progress' ? (
                            <Activity className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                          </div>
                      <span className="text-xs text-gray-600 text-center">
                        {step.name}
                      </span>
                        </div>
                  ))}
                      </div>

                {/* Progress Bar */}
                <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Overall Progress</span>
                    <span>{deployment.progress}%</span>
                  </div>
                  <Progress value={deployment.progress} className="h-2" />
                </div>

                {/* Key Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Target Date</div>
                    <div className="font-medium">{formatDate(deployment.targetDate)}</div>
                        </div>
                  <div>
                    <div className="text-gray-500">Total Cost</div>
                    <div className="font-medium">£{deployment.totalCost.toLocaleString()}</div>
                      </div>
              </div>
            </CardContent>
          </Card>
          ))}
                  </div>
              </div>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedDeployment?.siteName}</DialogTitle>
            <DialogDescription className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                <div className="text-gray-500 text-sm">Status</div>
                <Badge className={getStatusColor(selectedDeployment?.status || '')}>
                  {selectedDeployment?.status.replace('_', ' ') || ''}
                </Badge>
                            </div>
              <div>
                <div className="text-gray-500 text-sm">Engineer</div>
                <div className="font-medium">{selectedDeployment?.deploymentEngineer}</div>
                        </div>
              <div>
                <div className="text-gray-500 text-sm">Start Date</div>
                <div className="font-medium">{selectedDeployment ? formatDate(selectedDeployment.startDate) : ''}</div>
                      </div>
                      <div>
                <div className="text-gray-500 text-sm">Target Date</div>
                <div className="font-medium">{selectedDeployment ? formatDate(selectedDeployment.targetDate) : ''}</div>
                            </div>
            </DialogDescription>
          </DialogHeader>
          
          {selectedDeployment && (
            <div className="space-y-6">
              {/* Deployment Steps */}
                <Card>
                  <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Deployment Steps</span>
                  </CardTitle>
                  </CardHeader>
                  <CardContent>
                  <div className="space-y-4">
                    {selectedDeployment.steps.map((step) => (
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
                            disabled={!canUpdateStep(step, selectedDeployment)}
                            className="h-8 w-8 p-0"
                            title={canUpdateStep(step, selectedDeployment) ? "Update Step" : "Previous step must be completed"}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

              {/* Notes */}
                <Card>
                  <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Deployment Notes</span>
                  </CardTitle>
                  </CardHeader>
                  <CardContent>
                  <div className="space-y-4">
                    {selectedDeployment.notes.map((note) => (
                      <div key={note.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{note.author}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(note.timestamp).toLocaleString()}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{note.content}</div>
                          </div>
                </div>
              ))}
                    </div>
                  </CardContent>
                </Card>

              {/* Hardware Items */}
                <Card>
                  <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>Hardware Items</span>
                  </CardTitle>
                  </CardHeader>
                  <CardContent>
                  <div className="space-y-4">
                    {selectedDeployment.hardwareItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{item.name}</h4>
                            {item.addedToAssets && (
                              <Badge className="bg-green-100 text-green-800">
                                Added to Assets
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Model: {item.model} • Qty: {item.quantity}
                          </div>
                          {item.notes && (
                            <div className="text-sm text-gray-500 mt-1">{item.notes}</div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddToAssets(item)}
                            disabled={item.addedToAssets}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            {item.addedToAssets ? 'Added to Assets' : 'Add to Assets'}
                          </Button>
                          </div>
                        </div>
                      ))}
                </div>
                  </CardContent>
                </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload delivery receipt image or PDF (required for completion)
                  </p>
                </div>
              </div>
            )}

            {/* Hardware Items Section */}
            {selectedDeployment && (
              <div>
                <Label>Hardware Items</Label>
                <div className="mt-2 space-y-2">
                  {selectedDeployment.hardwareItems.map((item) => (
                    <div key={item.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-gray-600">
                            Model: {item.model} • Qty: {item.quantity}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => updateStepStatus(selectedStep!.id, 'in_progress')}
            >
              Update
            </Button>
            <Button 
              onClick={() => {
                if (selectedStep?.name === 'Hardware Delivery' && !deliveryReceipt) {
                  toast.error('Please upload delivery receipt before marking as complete');
                  return;
                }
                updateStepStatus(selectedStep!.id, 'completed');
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Mark Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Asset Details Dialog */}
      <Dialog open={showAssetDialog} onOpenChange={setShowAssetDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add {selectedHardwareItem?.name} to Assets</DialogTitle>
            <DialogDescription>
              Enter serial numbers and service cycles for each item
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {assetDetails.map((detail, index) => (
              <div key={detail.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Item {index + 1}</h4>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`serial-${index}`}>Serial Number *</Label>
                    <Input
                      id={`serial-${index}`}
                      value={detail.serialNumber}
                      onChange={(e) => updateAssetDetail(index, 'serialNumber', e.target.value)}
                      placeholder="Enter serial number"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`service-${index}`}>Service Cycle (months)</Label>
                    <Input
                      id={`service-${index}`}
                      type="number"
                      min="1"
                      value={detail.serviceCycle || ''}
                      onChange={(e) => updateAssetDetail(index, 'serviceCycle', parseInt(e.target.value) || 0)}
                      placeholder="e.g., 6"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`start-date-${index}`}>Service Start Date</Label>
                    <DatePicker
                      value={detail.startOfServiceDate ? new Date(detail.startOfServiceDate) : undefined}
                      onChange={(date) => updateAssetDetail(index, 'startOfServiceDate', date ? date.toISOString().split('T')[0] : '')}
                      placeholder="Select start date"
                      allowPastDates={true}
                      minDate={new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)} // 1 year ago
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssetDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveAssetDetails}>
              Add to Assets
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Deployment; 