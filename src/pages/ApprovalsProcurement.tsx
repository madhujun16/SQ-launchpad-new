import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AppTable } from '@/components/ui/AppTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  CreditCard,
  Settings,
  List,
  CheckSquare
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { AccessDenied } from '@/components/AccessDenied';
import { Loader } from '@/components/ui/loader';
import { getRoleConfig } from '@/lib/roles';
import { useNavigate } from 'react-router-dom';
import { CostingApprovalCard } from '@/components/CostingApprovalCard';
import { CostingService } from '@/services/costingService';
import { CostingApproval } from '@/types/costing';

interface RequestHistoryEntry {
  id: string;
  action: 'submitted' | 'approved' | 'rejected' | 'comment';
  user: string;
  timestamp: string;
  comment?: string;
}

interface ScopingItem { name: string; units?: number; monthlyFee?: number; setupFee?: number; unitCost?: number }
interface ScopingSummary { software: ScopingItem[]; hardware: ScopingItem[] }

interface HardwareRequest {
  id: string;
  site_name: string;
  site_id: string;
  requested_by: string;
  requested_at: string;
  status: 'pending' | 'approved' | 'rejected' | 'procurement' | 'dispatched' | 'delivered';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  items_count: number;
  total_value: number;
  assigned_ops_manager?: string;
  assigned_deployment_engineer?: string;
  comments?: string;
  rejection_reason?: string;
  procurement_status?: string;
  expected_delivery?: string;
  history?: RequestHistoryEntry[];
  scoping_summary?: ScopingSummary;
}

const ApprovalsProcurement = () => {
  const { currentRole, profile } = useAuth();
  const { getTabAccess } = useRoleAccess();
  const navigate = useNavigate();
  const roleConfig = getRoleConfig(currentRole || 'admin');
  const RoleIconComp = roleConfig.icon; // fix dynamic icon
  
  const [requests, setRequests] = useState<HardwareRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<HardwareRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<HardwareRequest | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showOutcomeDialog, setShowOutcomeDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewComment, setReviewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Costing approvals state
  const [costingApprovals, setCostingApprovals] = useState<CostingApproval[]>([]);
  const [filteredCostingApprovals, setFilteredCostingApprovals] = useState<CostingApproval[]>([]);
  const [costingStatusFilter, setCostingStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('hardware');

  // Check access permissions
  const tabAccess = getTabAccess('/approvals-procurement');
  
  if (!tabAccess.canAccess) {
    return (
      <AccessDenied 
        pageName="Approvals & Procurement"
        customMessage="You don't have permission to access the Approvals & Procurement page."
      />
    );
  }

  // Mock data & async loads
  useEffect(() => {
    let isMounted = true;
    (async () => {
    const mockRequests: HardwareRequest[] = [
      {
        id: '1',
        site_name: 'Birmingham South',
        site_id: '3',
        requested_by: 'Tom Wilson',
        requested_at: '2024-01-16T10:30:00Z',
        status: 'pending',
        priority: 'high',
        items_count: 2,
        total_value: 4500,
        assigned_ops_manager: 'Emma Davis',
        assigned_deployment_engineer: 'Tom Wilson',
          comments: 'Need additional POS terminals for peak hours',
          history: [
            { id: crypto.randomUUID(), action: 'submitted', user: 'Tom Wilson', timestamp: '2024-01-16T10:30:00Z' }
          ],
          scoping_summary: {
            software: [ { name: 'POS System', monthlyFee: 25, setupFee: 150 }, { name: 'Kiosk Software', monthlyFee: 20, setupFee: 100 } ],
            hardware: [ { name: 'POS Terminals', units: 2, unitCost: 700 }, { name: 'Receipt Printers', units: 1, unitCost: 120 } ]
          }
      },
      {
        id: '2',
        site_name: 'Leeds Central',
        site_id: '4',
        requested_by: 'Chris Taylor',
        requested_at: '2024-01-17T14:20:00Z',
        status: 'approved',
        priority: 'medium',
        items_count: 5,
        total_value: 12000,
        assigned_ops_manager: 'Lisa Anderson',
        assigned_deployment_engineer: 'Chris Taylor',
        comments: 'Complete hardware setup for new cafeteria',
        procurement_status: 'ordered',
          expected_delivery: '2024-01-25',
          history: [
            { id: crypto.randomUUID(), action: 'submitted', user: 'Chris Taylor', timestamp: '2024-01-17T14:20:00Z' },
            { id: crypto.randomUUID(), action: 'approved', user: 'Lisa Anderson', timestamp: '2024-01-18T09:00:00Z', comment: 'Looks good. Proceed.' }
          ],
          scoping_summary: {
            software: [ { name: 'POS System', monthlyFee: 25, setupFee: 150 }, { name: 'Kitchen Display', monthlyFee: 20, setupFee: 100 } ],
            hardware: [ { name: 'POS Terminals', units: 4, unitCost: 700 } ]
          }
      },
      {
        id: '3',
        site_name: 'Liverpool East',
        site_id: '5',
        requested_by: 'Anna Garcia',
        requested_at: '2024-01-18T09:15:00Z',
        status: 'rejected',
        priority: 'low',
        items_count: 1,
        total_value: 800,
        assigned_ops_manager: 'Mark Thompson',
        assigned_deployment_engineer: 'Anna Garcia',
        comments: 'Request for additional display screen',
          rejection_reason: 'Budget constraints - alternative solution available',
          history: [
            { id: crypto.randomUUID(), action: 'submitted', user: 'Anna Garcia', timestamp: '2024-01-18T09:15:00Z' },
            { id: crypto.randomUUID(), action: 'rejected', user: 'Mark Thompson', timestamp: '2024-01-19T11:00:00Z', comment: 'Please reduce scope and resubmit.' }
          ],
          scoping_summary: {
            software: [ { name: 'Self-Service Kiosks', monthlyFee: 15, setupFee: 80 } ],
            hardware: [ { name: 'Tablets', units: 1, unitCost: 250 } ]
          }
      },
      {
        id: '4',
        site_name: 'Manchester North',
        site_id: '2',
        requested_by: 'David Brown',
        requested_at: '2024-01-19T11:45:00Z',
        status: 'procurement',
        priority: 'urgent',
        items_count: 3,
        total_value: 7500,
        assigned_ops_manager: 'Sarah Wilson',
        assigned_deployment_engineer: 'David Brown',
        comments: 'Critical hardware for deployment next week',
        procurement_status: 'in_progress',
          expected_delivery: '2024-01-22',
          history: [
            { id: crypto.randomUUID(), action: 'submitted', user: 'David Brown', timestamp: '2024-01-19T11:45:00Z' },
            { id: crypto.randomUUID(), action: 'approved', user: 'Sarah Wilson', timestamp: '2024-01-20T10:10:00Z', comment: 'Proceed to procurement.' }
          ],
          scoping_summary: {
            software: [ { name: 'Kitchen Display', monthlyFee: 20, setupFee: 100 } ],
            hardware: [ { name: 'KDS Screens', units: 3, unitCost: 300 } ]
          }
      },
      {
        id: '5',
        site_name: 'London Central',
        site_id: '1',
        requested_by: 'Mike Johnson',
        requested_at: '2024-01-20T16:30:00Z',
        status: 'dispatched',
        priority: 'medium',
        items_count: 4,
        total_value: 9800,
        assigned_ops_manager: 'John Smith',
        assigned_deployment_engineer: 'Mike Johnson',
        comments: 'Replacement hardware for maintenance',
        procurement_status: 'shipped',
          expected_delivery: '2024-01-23',
          history: [
            { id: crypto.randomUUID(), action: 'submitted', user: 'Mike Johnson', timestamp: '2024-01-20T16:30:00Z' },
            { id: crypto.randomUUID(), action: 'approved', user: 'John Smith', timestamp: '2024-01-21T08:30:00Z', comment: 'Approved and ordered.' }
          ],
          scoping_summary: {
            software: [ { name: 'Inventory Management', monthlyFee: 0, setupFee: 0 } ],
            hardware: [ { name: 'Barcode Scanners', units: 2, unitCost: 180 } ]
          }
        }
      ];

    let filteredRequestsData = mockRequests;
    if (currentRole === 'deployment_engineer') {
      const currentUserName = profile?.full_name || profile?.email || '';
      filteredRequestsData = mockRequests.filter(request => 
        request.requested_by === currentUserName || 
        request.assigned_deployment_engineer === currentUserName
      );
    } else if (currentRole === 'ops_manager') {
      const currentUserName = profile?.full_name || profile?.email || '';
      filteredRequestsData = mockRequests.filter(request => 
        request.assigned_ops_manager === currentUserName
      );
    }

      if (!isMounted) return;
    setRequests(filteredRequestsData);
    setFilteredRequests(filteredRequestsData);
    
      if (isMounted && (currentRole === 'ops_manager' || currentRole === 'admin')) {
        try {
      const approvals = await CostingService.getCostingApprovals();
          if (!isMounted) return;
      setCostingApprovals(approvals);
      setFilteredCostingApprovals(approvals);
        } catch (e) {
          // swallow error for mock/demo
        }
      }

      if (isMounted) setLoading(false);
    })();

    return () => {
      isMounted = false;
    };
  }, [currentRole, profile]);

  // Timeout handling to prevent infinite loading
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        console.warn('⚠️ Approvals loading timeout - forcing display');
        setLoadingTimeout(true);
        setLoading(false);
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [loading]);

  useEffect(() => {
    let filtered = requests;

    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.site_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requested_by.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(request => request.priority === priorityFilter);
    }

    setFilteredRequests(filtered);
  }, [requests, searchTerm, statusFilter, priorityFilter]);

  // Filter costing approvals
  useEffect(() => {
    let filtered = costingApprovals;
    if (costingStatusFilter !== 'all') {
      filtered = filtered.filter(approval => approval.status === costingStatusFilter);
    }
    setFilteredCostingApprovals(filtered);
  }, [costingApprovals, costingStatusFilter]);

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { label: 'Pending Review', color: 'bg-orange-100 text-orange-800', icon: Clock },
      approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
      procurement: { label: 'In Procurement', color: 'bg-blue-100 text-blue-800', icon: Package },
      dispatched: { label: 'Dispatched', color: 'bg-purple-100 text-purple-800', icon: Truck },
      delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const getPriorityConfig = (priority: string) => {
    const configs = {
      low: { label: 'Low', color: 'bg-gray-100 text-gray-800', icon: TrendingDown },
      medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800', icon: Activity },
      high: { label: 'High', color: 'bg-orange-100 text-orange-800', icon: TrendingUp },
      urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800', icon: AlertCircle }
    };
    return configs[priority as keyof typeof configs] || configs.medium;
  };

  const handleReviewRequest = (request: HardwareRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setReviewAction(action);
    setReviewComment('');
    setShowReviewDialog(true);
  };

  const handleSubmitReview = () => {
    if (!selectedRequest || !reviewComment.trim()) return;

    const updatedRequests = requests.map(req => {
      if (req.id === selectedRequest.id) {
        const now = new Date().toISOString();
        const newHistory: RequestHistoryEntry = {
          id: crypto.randomUUID(),
          action: (reviewAction === 'approve' ? 'approved' : 'rejected'),
          user: profile?.full_name || profile?.email || 'Ops Manager',
          timestamp: now,
          comment: reviewComment
        };
        return {
          ...req,
          status: (reviewAction === 'approve' ? 'approved' : 'rejected') as HardwareRequest['status'],
          rejection_reason: reviewAction === 'reject' ? reviewComment : undefined,
          comments: reviewComment,
          history: [...(req.history || []), newHistory]
        };
      }
      return req;
    });

    setRequests(updatedRequests);
    setShowReviewDialog(false);
    setSelectedRequest(null);
    setReviewComment('');
  };

  const handleCostingStatusFilter = (status: string) => {
    setCostingStatusFilter(status);
    if (status === 'all') {
      setFilteredCostingApprovals(costingApprovals);
    } else {
      const filtered = costingApprovals.filter(approval => approval.status === status);
      setFilteredCostingApprovals(filtered);
    }
  };

  const handleCostingStatusChange = () => {
    CostingService.getCostingApprovals().then(approvals => {
      setCostingApprovals(approvals);
      setFilteredCostingApprovals(approvals);
    });
  };

  const canReviewRequests = currentRole === 'ops_manager';

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'procurement', label: 'In Procurement' },
    { value: 'dispatched', label: 'Dispatched' },
    { value: 'delivered', label: 'Delivered' }
  ];

  const costingStatusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending_review', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'resubmitted', label: 'Resubmitted' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const pendingCount = filteredRequests.filter(r => r.status === 'pending').length;
  const resubmissionCount = filteredRequests.filter(r => r.status === 'rejected').length;

  const getLastActionTime = (req: HardwareRequest, action: RequestHistoryEntry['action']) => {
    const entries = (req.history || []).filter(h => h.action === action);
    if (entries.length === 0) return null;
    return entries[entries.length - 1].timestamp;
  };

  if (loading && !loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white/90">
        <div className="text-center">
          <Loader size="lg" />
          <p className="text-gray-600 mt-4">Loading approvals...</p>
        </div>
      </div>
    );
  }

  if (loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white/90">
        <div className="text-center">
          <div className="text-orange-600 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Taking Longer Than Expected</h2>
          <p className="text-gray-600 mb-4">The approvals page is still loading. This might be due to:</p>
          <ul className="text-sm text-gray-500 text-left max-w-md mx-auto space-y-1 mb-4">
            <li>• Slow database connection</li>
            <li>• Authentication service delay</li>
            <li>• Network connectivity issues</li>
          </ul>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const computeSoftwareTotals = (summary?: ScopingSummary) => {
    const monthly = summary?.software.reduce((acc, s) => acc + (s.monthlyFee || 0), 0) || 0;
    const setup = summary?.software.reduce((acc, s) => acc + (s.setupFee || 0), 0) || 0;
    return { monthly, setup };
  };
  const computeHardwareTotal = (summary?: ScopingSummary) => {
    return summary?.hardware.reduce((acc, h) => acc + (h.unitCost || 0) * (h.units || 1), 0) || 0;
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="icon-badge-green"><CheckSquare className="nav-icon" color="#1CB255" /></span>
            <h1 className="pro-h2">Approvals & Procurement</h1>
          </div>
          <p className="pro-subtle mt-1">
            Review hardware requests and manage procurement workflow
            {tabAccess.message && (
              <span className="block text-sm text-blue-700 mt-1">
                {tabAccess.message}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <RoleIconComp className="h-3 w-3" />
            <span>{roleConfig.displayName}</span>
          </Badge>
        </div>
      </div>
      <div className="divider-soft" />

          {/* Filters */}
      <Card className="pro-card">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by site or requester..."
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
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            <Button variant="light-outline" className="flex items-center space-x-2 hover-glow-green" onClick={() => { setSearchTerm(''); setStatusFilter('all'); setPriorityFilter('all'); }}>
                  <Filter className="h-4 w-4" />
                  <span>Clear Filters</span>
                </Button>
              </div>
            </CardContent>
          </Card>

      {/* Consolidated list of all requests */}
      <Card className="pro-card">
                <CardHeader>
          <div className="flex items-center gap-2">
            <span className="icon-badge-green"><List className="nav-icon" color="#1CB255" /></span>
            <CardTitle className="pro-h3">All Hardware Requests</CardTitle>
          </div>
          <CardDescription className="pro-subtle">All requests including pending and resubmissions</CardDescription>
                </CardHeader>
                <CardContent>
          <AppTable
            headers={[
              'Site',
              'Requester',
              'Requested',
              'Status',
              'Priority',
              'Items',
              'Total Value',
              'Actions',
            ]}
          >
                      {filteredRequests.map((request) => {
                        const statusConfig = getStatusConfig(request.status);
                        const priorityConfig = getPriorityConfig(request.priority);
                        const StatusIcon = statusConfig.icon;
                        const PriorityIcon = priorityConfig.icon;
                        return (
                          <TableRow key={request.id}>
                    <TableCell><div className="font-medium">{request.site_name}</div></TableCell>
                    <TableCell><div className="flex items-center gap-1"><User className="h-3 w-3 text-gray-400" /><span>{request.requested_by}</span></div></TableCell>
                    <TableCell><div className="flex items-center gap-1"><Calendar className="h-3 w-3 text-gray-400" /><span>{new Date(request.requested_at).toLocaleDateString()}</span></div></TableCell>
                    <TableCell><Badge className={`${statusConfig.color} flex items-center gap-1`}><StatusIcon className="h-3 w-3" />{statusConfig.label}</Badge></TableCell>
                    <TableCell><Badge className={`${priorityConfig.color} flex items-center gap-1`}><PriorityIcon className="h-3 w-3" />{priorityConfig.label}</Badge></TableCell>
                    <TableCell><div className="flex items-center gap-1"><Package className="h-3 w-3 text-gray-400" /><span>{request.items_count} items</span></div></TableCell>
                    <TableCell><div className="flex items-center gap-1"><DollarSign className="h-3 w-3 text-gray-400" /><span>£{request.total_value.toLocaleString()}</span></div></TableCell>
                            <TableCell>
                      <div className="flex items-center gap-2">
                        {currentRole === 'ops_manager' && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleReviewRequest(request, 'approve')}><CheckCircle className="h-4 w-4 text-green-600" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleReviewRequest(request, 'reject')}><XCircle className="h-4 w-4 text-red-600" /></Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedRequest(request); setShowOutcomeDialog(true); }}><Eye className="h-4 w-4" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
          </AppTable>
            </CardContent>
          </Card>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve Hardware Request' : 'Reject Hardware Request'}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <div className="mt-2">
                  <p><strong>Site:</strong> {selectedRequest.site_name}</p>
                  <p><strong>Requested by:</strong> {selectedRequest.requested_by}</p>
                  <p><strong>Value:</strong> £{selectedRequest.total_value?.toLocaleString()}</p>
                  <p><strong>Items:</strong> {selectedRequest.items_count}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="review-comment">
                {reviewAction === 'approve' ? 'Approval Comments' : 'Rejection Reason'} *
              </Label>
              <Textarea
                id="review-comment"
                placeholder={
                  reviewAction === 'approve' 
                    ? 'Add any comments about this approval...' 
                    : 'Please provide a reason for rejection...'
                }
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant={reviewAction === 'approve' ? 'gradient' : 'destructive'}
              onClick={handleSubmitReview}
              disabled={!reviewComment.trim()}
            >
              {reviewAction === 'approve' ? 'Approve Request' : 'Reject Request'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Outcome Dialog (read-only) for all roles; shows status, feedback, and audit trail */}
      <Dialog open={showOutcomeDialog} onOpenChange={setShowOutcomeDialog}>
        <DialogContent className="md:max-w-[1100px] w-full">
          {selectedRequest && (
            <div className="space-y-4">
              {/* Role banner for Deployment Engineer */}
              {currentRole === 'deployment_engineer' && (
                <Alert>
                  <AlertDescription>
                    You are viewing the approval outcome for this site. Actions can only be taken by your Ops Manager.
                  </AlertDescription>
                </Alert>
              )}

              {/* Header Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{selectedRequest.site_name}</h3>
                  {(() => {
                    const cfg = getStatusConfig(selectedRequest.status);
                    const Icon = cfg.icon;
                    return (
                      <Badge className={`${cfg.color} flex items-center gap-1`}>
                        <Icon className="h-3 w-3" />
                        {cfg.label}
                      </Badge>
                    );
                  })()}
                </div>
                <div className="text-sm text-gray-500">Submitted {new Date(selectedRequest.requested_at).toLocaleString()}</div>
              </div>

              {/* Outcome banner */}
              {selectedRequest.status === 'approved' ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <span>Approved on {new Date(getLastActionTime(selectedRequest, 'approved') || selectedRequest.requested_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-green-900 mt-2">Proceeding to Procurement.</p>
                </div>
              ) : selectedRequest.status === 'rejected' ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <div className="flex items-center gap-2 text-red-800">
                    <XCircle className="h-4 w-4" />
                    <span>Rejected on {new Date(getLastActionTime(selectedRequest, 'rejected') || selectedRequest.requested_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-red-900 mt-2 font-medium">Feedback from Ops Manager</p>
                  <p className="text-sm text-red-900 whitespace-pre-wrap">{selectedRequest.rejection_reason || selectedRequest.comments || 'No comments provided.'}</p>
                </div>
              ) : (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-900">Awaiting final decision.</div>
              )}

              {/* Two-column layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column: History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Approval History</CardTitle>
                    <CardDescription>Timeline of actions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-[360px] overflow-auto pr-1">
                      {(selectedRequest.history || []).map((h) => (
                        <div key={h.id} className="flex items-start gap-3 p-2 border rounded">
                          <div className="mt-0.5">
                            {h.action === 'approved' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : h.action === 'rejected' ? (
                              <XCircle className="h-4 w-4 text-red-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm"><span className="font-medium capitalize">{h.action}</span> by {h.user}</div>
                            <div className="text-xs text-gray-500">{new Date(h.timestamp).toLocaleString()}</div>
                            {h.comment && (<div className="text-sm mt-1 whitespace-pre-wrap">{h.comment}</div>)}
                          </div>
                        </div>
                      ))}
                      {(selectedRequest.history || []).length === 0 && (
                        <p className="text-sm text-gray-500">No history available.</p>
                      )}
                    </div>
                    {currentRole === 'deployment_engineer' && selectedRequest.status === 'rejected' && (
                      <div className="mt-4">
                        <Button onClick={() => navigate(`/sites/${selectedRequest.site_id}/study`)} className="hover-glow-green">
                          Edit & Resubmit
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Right column: Scoping Summary & Cost Breakdown */}
                <div className="space-y-6">
                  {/* Scoping Summary */}
                  {selectedRequest.scoping_summary && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Software & Hardware Summary</CardTitle>
                        <CardDescription>Selected software and hardware requirements</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-1">Software</p>
                          <div className="space-y-1">
                            {selectedRequest.scoping_summary.software.map((s, i) => (
                              <div key={i} className="flex items-center justify-between p-2 border rounded">
                                <span className="text-sm">{s.name}</span>
                                <Badge variant="secondary">Selected</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Hardware</p>
                          <div className="space-y-1">
                            {selectedRequest.scoping_summary.hardware.map((h, i) => (
                              <div key={i} className="flex items-center justify-between p-2 border rounded">
                                <span className="text-sm">{h.name}</span>
                                <Badge variant="outline">{h.units ?? 1} units</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Cost Breakdown */}
                  {selectedRequest.scoping_summary && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Cost Breakdown</CardTitle>
                        <CardDescription>Per item pricing and totals</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-1">Software</p>
                          <div className="space-y-1">
                            {selectedRequest.scoping_summary.software.map((s, i) => (
                              <div key={i} className="grid grid-cols-3 gap-2 p-2 border rounded text-sm">
                                <div>{s.name}</div>
                                <div className="text-gray-600">Monthly £{(s.monthlyFee || 0).toLocaleString()}</div>
                                <div className="text-gray-600">Setup £{(s.setupFee || 0).toLocaleString()}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Hardware</p>
                          <div className="space-y-1">
                            {selectedRequest.scoping_summary.hardware.map((h, i) => (
                              <div key={i} className="grid grid-cols-4 gap-2 p-2 border rounded text-sm">
                                <div>{h.name}</div>
                                <div className="text-gray-600">Unit £{(h.unitCost || 0).toLocaleString()}</div>
                                <div className="text-gray-600">Qty {h.units || 1}</div>
                                <div className="text-gray-800 font-medium">£{(((h.unitCost || 0) * (h.units || 1))).toLocaleString()}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 border rounded text-sm">
                          {(() => {
                            const sw = computeSoftwareTotals(selectedRequest.scoping_summary);
                            const hw = computeHardwareTotal(selectedRequest.scoping_summary);
                            return (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>Software Monthly Total: <span className="font-semibold">£{sw.monthly.toLocaleString()}</span></div>
                                <div>Software Setup Total: <span className="font-semibold">£{sw.setup.toLocaleString()}</span></div>
                                <div>Hardware Total: <span className="font-semibold">£{hw.toLocaleString()}</span></div>
                              </div>
                            );
                          })()}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApprovalsProcurement; 