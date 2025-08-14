import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Package, 
  Truck, 
  Calendar,
  User,
  Building,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  FileText,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Wrench,
  Shield,
  Zap,
  Play,
  Pause,
  Settings,
  List,
  CheckSquare,
  Square
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { AccessDenied } from '@/components/AccessDenied';
import { ContentLoader } from '@/components/ui/loader';
import { getRoleConfig } from '@/lib/roles';

interface ScopingItem { name: string; quantity: number; unit_cost: number }
interface ApprovalHistoryEntry { date: string; user: string; action: 'submitted' | 'approved' | 'rejected'; comments?: string }
type ProcurementStage = 'requested' | 'approved' | 'dispatched';
interface DeploymentNote { id: string; author: string; content: string; timestamp: string }

interface Deployment {
  id: string;
  site_name: string;
  site_id: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  deployment_date: string;
  assigned_deployment_engineer: string;
  assigned_ops_manager: string;
  progress_percentage: number;
  checklist_items: ChecklistItem[];
  notes?: string;
  hardware_delivered: boolean;
  installation_started: boolean;
  testing_completed: boolean;
  live_ready: boolean;
  created_at: string;
  updated_at: string;
  // New fields
  approval: { status: 'pending' | 'approved' | 'rejected'; comments?: string; history: ApprovalHistoryEntry[] };
  scoping_summary: { software: ScopingItem[]; hardware: ScopingItem[] };
  procurement_stage: ProcurementStage;
  milestones: Array<{ name: string; start: string; end: string; status: 'pending' | 'in_progress' | 'done' }>;
  shared_notes: DeploymentNote[];
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completed_by?: string;
  completed_at?: string;
  category: 'pre_deployment' | 'installation' | 'testing' | 'post_deployment';
}

const Deployment = () => {
  const { currentRole, profile } = useAuth();
  const { getTabAccess } = useRoleAccess();
  const roleConfig = getRoleConfig(currentRole || 'admin');
  
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [filteredDeployments, setFilteredDeployments] = useState<Deployment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null);
  // Simplified flow: open a single details dialog when a site/card is clicked
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [decisionComment, setDecisionComment] = useState('');
  const [loading, setLoading] = useState(true);

  // Check access permissions
  const tabAccess = getTabAccess('/deployment');
  
  if (!tabAccess.canAccess) {
    return (
      <AccessDenied 
        pageName="Deployment"
        customMessage="You don't have permission to access the Deployment page."
      />
    );
  }

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockDeployments: Deployment[] = [
      {
        id: '1',
        site_name: 'Manchester North',
        site_id: '2',
        status: 'in_progress',
        deployment_date: '2024-01-20',
        assigned_deployment_engineer: 'David Brown',
        assigned_ops_manager: 'Sarah Wilson',
        progress_percentage: 65,
        checklist_items: [
          { id: '1-1', title: 'Hardware Inventory Check', description: 'Verify all hardware items are present', completed: true, completed_by: 'David Brown', completed_at: '2024-01-20T09:00:00Z', category: 'pre_deployment' },
          { id: '1-2', title: 'Network Connectivity Test', description: 'Test network connectivity and bandwidth', completed: true, completed_by: 'David Brown', completed_at: '2024-01-20T10:30:00Z', category: 'pre_deployment' },
          { id: '1-3', title: 'POS Terminal Installation', description: 'Install and configure POS terminals', completed: true, completed_by: 'David Brown', completed_at: '2024-01-20T11:45:00Z', category: 'installation' },
          { id: '1-4', title: 'Display Screen Setup', description: 'Install and configure display screens', completed: false, category: 'installation' },
          { id: '1-5', title: 'System Integration Test', description: 'Test integration between all systems', completed: false, category: 'testing' },
          { id: '1-6', title: 'User Training', description: 'Conduct user training session', completed: false, category: 'post_deployment' }
        ],
        notes: 'Hardware delivery completed on time. Installation proceeding as scheduled.',
        hardware_delivered: true,
        installation_started: true,
        testing_completed: false,
        live_ready: false,
        created_at: '2024-01-15',
        updated_at: '2024-01-20',
        approval: {
          status: 'approved',
          comments: 'Looks good, proceed.',
          history: [
            { date: '2024-01-16T10:00:00Z', user: 'David Brown', action: 'submitted' },
            { date: '2024-01-17T09:00:00Z', user: 'Sarah Wilson', action: 'approved', comments: 'Looks good, proceed.' }
          ]
        },
        scoping_summary: {
          software: [ { name: 'POS System', quantity: 1, unit_cost: 1200 } ],
          hardware: [ { name: 'POS Terminal', quantity: 3, unit_cost: 800 }, { name: 'KDS Screen', quantity: 2, unit_cost: 450 } ]
        },
        procurement_stage: 'approved',
        milestones: [
          { name: 'Procurement', start: '2024-01-10', end: '2024-01-18', status: 'done' },
          { name: 'Installation', start: '2024-01-20', end: '2024-01-21', status: 'in_progress' },
          { name: 'Testing', start: '2024-01-21', end: '2024-01-22', status: 'pending' },
          { name: 'Go Live', start: '2024-01-23', end: '2024-01-23', status: 'pending' }
        ],
        shared_notes: [
          { id: 'n1', author: 'Sarah Wilson', content: 'Ensure extra ethernet cables on site.', timestamp: '2024-01-19T12:00:00Z' }
        ]
      },
      {
        id: '2',
        site_name: 'Birmingham South',
        site_id: '3',
        status: 'scheduled',
        deployment_date: '2024-01-25',
        assigned_deployment_engineer: 'Tom Wilson',
        assigned_ops_manager: 'Emma Davis',
        progress_percentage: 0,
        checklist_items: [
          { id: '2-1', title: 'Hardware Inventory Check', description: 'Verify all hardware items are present', completed: false, category: 'pre_deployment' },
          { id: '2-2', title: 'Network Connectivity Test', description: 'Test network connectivity and bandwidth', completed: false, category: 'pre_deployment' },
          { id: '2-3', title: 'POS Terminal Installation', description: 'Install and configure POS terminals', completed: false, category: 'installation' },
          { id: '2-4', title: 'Display Screen Setup', description: 'Install and configure display screens', completed: false, category: 'installation' },
          { id: '2-5', title: 'System Integration Test', description: 'Test integration between all systems', completed: false, category: 'testing' },
          { id: '2-6', title: 'User Training', description: 'Conduct user training session', completed: false, category: 'post_deployment' }
        ],
        notes: 'Hardware procurement completed. Ready for deployment.',
        hardware_delivered: false,
        installation_started: false,
        testing_completed: false,
        live_ready: false,
        created_at: '2024-01-16',
        updated_at: '2024-01-19',
        approval: {
          status: 'pending',
          history: [ { date: '2024-01-18T09:00:00Z', user: 'Tom Wilson', action: 'submitted' } ]
        },
        scoping_summary: {
          software: [ { name: 'Kitchen Display', quantity: 1, unit_cost: 900 } ],
          hardware: [ { name: 'POS Terminal', quantity: 2, unit_cost: 800 } ]
        },
        procurement_stage: 'requested',
        milestones: [
          { name: 'Procurement', start: '2024-01-19', end: '2024-01-22', status: 'in_progress' },
          { name: 'Installation', start: '2024-01-25', end: '2024-01-26', status: 'pending' },
          { name: 'Testing', start: '2024-01-27', end: '2024-01-27', status: 'pending' },
          { name: 'Go Live', start: '2024-01-28', end: '2024-01-28', status: 'pending' }
        ],
        shared_notes: []
      },
      {
        id: '3',
        site_name: 'Leeds Central',
        site_id: '4',
        status: 'completed',
        deployment_date: '2024-01-18',
        assigned_deployment_engineer: 'Chris Taylor',
        assigned_ops_manager: 'Lisa Anderson',
        progress_percentage: 100,
        checklist_items: [
          { id: '3-1', title: 'Hardware Inventory Check', description: 'Verify all hardware items are present', completed: true, completed_by: 'Chris Taylor', completed_at: '2024-01-18T08:30:00Z', category: 'pre_deployment' },
          { id: '3-2', title: 'Network Connectivity Test', description: 'Test network connectivity and bandwidth', completed: true, completed_by: 'Chris Taylor', completed_at: '2024-01-18T09:15:00Z', category: 'pre_deployment' },
          { id: '3-3', title: 'POS Terminal Installation', description: 'Install and configure POS terminals', completed: true, completed_by: 'Chris Taylor', completed_at: '2024-01-18T10:45:00Z', category: 'installation' },
          { id: '3-4', title: 'Display Screen Setup', description: 'Install and configure display screens', completed: true, completed_by: 'Chris Taylor', completed_at: '2024-01-18T11:30:00Z', category: 'installation' },
          { id: '3-5', title: 'System Integration Test', description: 'Test integration between all systems', completed: true, completed_by: 'Chris Taylor', completed_at: '2024-01-18T14:20:00Z', category: 'testing' },
          { id: '3-6', title: 'User Training', description: 'Conduct user training session', completed: true, completed_by: 'Chris Taylor', completed_at: '2024-01-18T16:00:00Z', category: 'post_deployment' }
        ],
        notes: 'Deployment completed successfully. Site is live and operational.',
        hardware_delivered: true,
        installation_started: true,
        testing_completed: true,
        live_ready: true,
        created_at: '2024-01-12',
        updated_at: '2024-01-18',
        approval: {
          status: 'approved',
          history: [
            { date: '2024-01-14T10:00:00Z', user: 'Chris Taylor', action: 'submitted' },
            { date: '2024-01-15T09:00:00Z', user: 'Lisa Anderson', action: 'approved' }
          ]
        },
        scoping_summary: {
          software: [ { name: 'Inventory', quantity: 1, unit_cost: 700 } ],
          hardware: [ { name: 'KDS Screen', quantity: 2, unit_cost: 450 } ]
        },
        procurement_stage: 'dispatched',
        milestones: [
          { name: 'Procurement', start: '2024-01-10', end: '2024-01-12', status: 'done' },
          { name: 'Installation', start: '2024-01-16', end: '2024-01-16', status: 'done' },
          { name: 'Testing', start: '2024-01-17', end: '2024-01-17', status: 'done' },
          { name: 'Go Live', start: '2024-01-18', end: '2024-01-18', status: 'done' }
        ],
        shared_notes: [ { id: 'n2', author: 'Lisa Anderson', content: 'Post go-live training complete.', timestamp: '2024-01-18T18:00:00Z' } ]
      }
    ];

    // Filter deployments based on user role and access level
    let filteredDeploymentsData = mockDeployments;
    
    if (currentRole === 'ops_manager' || currentRole === 'deployment_engineer') {
      // For non-admin users, only show assigned deployments
      const currentUserName = profile?.full_name || profile?.email || '';
      filteredDeploymentsData = mockDeployments.filter(deployment => 
        deployment.assigned_ops_manager === currentUserName || 
        deployment.assigned_deployment_engineer === currentUserName
      );
    }
    // Admin sees all deployments

    setDeployments(filteredDeploymentsData);
    setFilteredDeployments(filteredDeploymentsData);
    setLoading(false);
  }, [currentRole, profile]);

  useEffect(() => {
    let filtered = deployments;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(deployment =>
        deployment.site_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deployment.assigned_deployment_engineer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(deployment => deployment.status === statusFilter);
    }

    setFilteredDeployments(filtered);
  }, [deployments, searchTerm, statusFilter]);

  const getStatusConfig = (status: string) => {
    const configs = {
      scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800', icon: Calendar },
      in_progress: { label: 'In Progress', color: 'bg-orange-100 text-orange-800', icon: Activity },
      completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      on_hold: { label: 'On Hold', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: AlertCircle }
    };
    return configs[status as keyof typeof configs] || configs.scheduled;
  };

  // Checklist handling moved into the consolidated details dialog in future iterations

  const handleGoLive = (deploymentId: string) => {
    setDeployments(prev => prev.map(deployment => {
      if (deployment.id === deploymentId) {
        return {
          ...deployment,
          status: 'completed' as Deployment['status'],
          progress_percentage: 100,
          live_ready: true
        };
      }
      return deployment;
    }));
  };

  const canUpdateDeployment = currentRole === 'deployment_engineer' || currentRole === 'ops_manager';
  const isAdmin = currentRole === 'admin';
  const isOps = currentRole === 'ops_manager';
  const isDE = currentRole === 'deployment_engineer';

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  if (loading) {
    return (
      <ContentLoader />
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deployment</h1>
          <p className="text-gray-600 mt-1">
            Track deployment progress and manage installation workflows
            {tabAccess.message && (
              <span className="block text-sm text-blue-600 mt-1">
                {tabAccess.message}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <roleConfig.icon className="h-3 w-3" />
            <span>{roleConfig.displayName}</span>
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Clear Filters</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content - simplified: one list of deployments; click a card to open details dialog */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment Status Progress</CardTitle>
          <CardDescription>Click a site to see full details and actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filteredDeployments.map((deployment) => (
              <button
                key={deployment.id}
                className="w-full text-left border rounded-lg p-4 hover:shadow-md transition-shadow"
                onClick={() => {
                  setSelectedDeployment(deployment);
                  setShowDetailsDialog(true);
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">{deployment.site_name}</h3>
                    <p className="text-sm text-gray-500">{deployment.assigned_deployment_engineer}</p>
                  </div>
                  <Badge className={`${getStatusConfig(deployment.status).color} flex items-center space-x-1`}>
                    {React.createElement(getStatusConfig(deployment.status).icon, { className: 'h-3 w-3' })}
                    <span>{getStatusConfig(deployment.status).label}</span>
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                      deployment.hardware_delivered ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Truck className="h-4 w-4" />
                    </div>
                    <div className="text-xs font-medium">Hardware Delivered</div>
                  </div>
                  <div className="text-center">
                    <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                      deployment.installation_started ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Wrench className="h-4 w-4" />
                    </div>
                    <div className="text-xs font-medium">Installation Started</div>
                  </div>
                  <div className="text-center">
                    <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                      deployment.testing_completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div className="text-xs font-medium">Testing Completed</div>
                  </div>
                  <div className="text-center">
                    <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                      deployment.live_ready ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="text-xs font-medium">Go-Live Ready</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Progress</span>
                    <span>{deployment.progress_percentage}%</span>
                  </div>
                  <Progress value={deployment.progress_percentage} className="h-2" />
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Checklist Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="md:max-w-[1000px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDeployment?.site_name} — Deployment Overview
            </DialogTitle>
            <DialogDescription>
              Live control center with scope, approvals, procurement, milestones, and notes
            </DialogDescription>
          </DialogHeader>
          {selectedDeployment && (
            <div className="space-y-4">
              {/* Header badges and quick actions */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusConfig(selectedDeployment.status).color}`}>{getStatusConfig(selectedDeployment.status).label}</Badge>
                  <Badge variant="secondary">Go-Live: {new Date(selectedDeployment.deployment_date).toLocaleDateString()}</Badge>
                  <Badge variant="outline">Ops: {selectedDeployment.assigned_ops_manager}</Badge>
                  <Badge variant="outline">Engineer: {selectedDeployment.assigned_deployment_engineer}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  {isOps && selectedDeployment.approval.status === 'pending' && (
                    <>
                      <Input placeholder="Comments (optional)" value={decisionComment} onChange={(e) => setDecisionComment(e.target.value)} className="w-56" />
                      <Button size="sm" onClick={() => {
                        setDeployments(prev => prev.map(d => d.id === selectedDeployment.id ? { ...d, approval: { ...d.approval, status: 'approved', comments: decisionComment, history: [...d.approval.history, { date: new Date().toISOString(), user: profile?.full_name || 'Ops', action: 'approved', comments: decisionComment }] }, status: 'in_progress' } : d));
                        toast.success('Scope approved');
                      }}>Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        setDeployments(prev => prev.map(d => d.id === selectedDeployment.id ? { ...d, approval: { ...d.approval, status: 'rejected', comments: decisionComment, history: [...d.approval.history, { date: new Date().toISOString(), user: profile?.full_name || 'Ops', action: 'rejected', comments: decisionComment }] }, status: 'on_hold' } : d));
                        toast.success('Scope rejected');
                      }}>Reject</Button>
                    </>
                  )}
                  {isDE && selectedDeployment.approval.status === 'rejected' && (
                    <Button size="sm" onClick={() => toast.info('Open scoping editor (stub)') }><Edit className="h-4 w-4 mr-1" />Edit & Resubmit</Button>
                  )}
                  {isAdmin && (
                    <Button variant="outline" size="sm" onClick={() => toast.info('Exporting CSV...')}><Download className="h-4 w-4 mr-1" />Export</Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Scope Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Scope Summary</CardTitle>
                    <CardDescription>Hardware and Software with costs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium mb-2">Software</div>
                        <div className="space-y-1">
                          {selectedDeployment.scoping_summary.software.map((s, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span>{s.name} × {s.quantity}</span>
                              <span>£{(s.unit_cost * s.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-2">Hardware</div>
                        <div className="space-y-1">
                          {selectedDeployment.scoping_summary.hardware.map((h, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span>{h.name} × {h.quantity}</span>
                              <span>£{(h.unit_cost * h.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex justify-between text-sm font-semibold">
                      <span>Total</span>
                      <span>£{(
                        [...selectedDeployment.scoping_summary.software, ...selectedDeployment.scoping_summary.hardware]
                          .reduce((sum, i) => sum + i.unit_cost * i.quantity, 0)
                      ).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Procurement Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Procurement Status</CardTitle>
                    <CardDescription>Requested → Approved → Dispatched</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      <Badge className={`${selectedDeployment.procurement_stage === 'requested' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>Requested</Badge>
                      <Badge className={`${selectedDeployment.procurement_stage === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>Approved</Badge>
                      <Badge className={`${selectedDeployment.procurement_stage === 'dispatched' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'}`}>Dispatched</Badge>
                    </div>
                    {isAdmin && (
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant={selectedDeployment.procurement_stage==='requested'? 'default':'outline'} onClick={() => setDeployments(prev => prev.map(d => d.id===selectedDeployment.id?{...d, procurement_stage:'requested'}:d))}>Requested</Button>
                        <Button size="sm" variant={selectedDeployment.procurement_stage==='approved'? 'default':'outline'} onClick={() => setDeployments(prev => prev.map(d => d.id===selectedDeployment.id?{...d, procurement_stage:'approved'}:d))}>Approved</Button>
                        <Button size="sm" variant={selectedDeployment.procurement_stage==='dispatched'? 'default':'outline'} onClick={() => setDeployments(prev => prev.map(d => d.id===selectedDeployment.id?{...d, procurement_stage:'dispatched'}:d))}>Dispatched</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Milestones */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Forecast & Milestones</CardTitle>
                    <CardDescription>Key dates and current status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      {selectedDeployment.milestones.map((m, idx) => (
                        <div key={idx} className="p-3 border rounded">
                          <div className="text-sm font-medium">{m.name}</div>
                          <div className="text-xs text-gray-600">{m.start} → {m.end}</div>
                          <div className="mt-1 text-xs">Status: {m.status.replace('_',' ')}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Approval History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Approval History</CardTitle>
                    <CardDescription>Decisions and comments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {selectedDeployment.approval.history.map((h, i) => (
                        <div key={i} className="flex items-start justify-between p-2 border rounded">
                          <div>
                            <div className="font-medium">{h.action.toUpperCase()} — {h.user}</div>
                            {h.comments && <div className="text-xs text-gray-600">{h.comments}</div>}
                          </div>
                          <div className="text-xs text-gray-500">{new Date(h.date).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                    <CardDescription>Shared across all roles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedDeployment.shared_notes.map(n => (
                        <div key={n.id} className="p-2 border rounded text-sm flex items-center justify-between">
                          <div>
                            <div className="font-medium">{n.author}</div>
                            <div>{n.content}</div>
                          </div>
                          <div className="text-xs text-gray-500">{new Date(n.timestamp).toLocaleString()}</div>
                        </div>
                      ))}
                      {(isAdmin || isDE) && (
                        <div className="flex items-center gap-2">
                          <Input placeholder="Add a note" onKeyDown={(e) => {
                            if (e.key === 'Enter' && selectedDeployment) {
                              const content = (e.target as HTMLInputElement).value.trim();
                              if (!content) return;
                              setDeployments(prev => prev.map(d => d.id===selectedDeployment.id?{...d, shared_notes:[...d.shared_notes, { id: Date.now().toString(), author: profile?.full_name || 'User', content, timestamp: new Date().toISOString() }]}: d));
                              (e.target as HTMLInputElement).value='';
                            }
                          }} />
                          <Button size="sm" onClick={() => toast.success('Note added')}>Add</Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Checklist dialog removed in simplified flow */}
    </div>
  );
};

export default Deployment; 