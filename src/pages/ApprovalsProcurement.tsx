import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  CheckSquare,
  History,
  ArrowRight,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { AccessDenied } from '@/components/AccessDenied';
import { PageLoader } from '@/components/ui/loader';
import { getRoleConfig } from '@/lib/roles';
import { SettingsService } from '@/services/settingsService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { formatDate } from '@/lib/dateUtils';
import { ScopingApprovalService } from '@/services/scopingApprovalService';
import { ScopingApproval } from '@/types/scopingApproval';

// Interfaces
interface ApprovalRequest {
  id: string;
  siteName: string;
  siteId: string;
  deploymentEngineer: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  totalCost: number;
  softwareCount: number;
  hardwareCount: number;
  comments?: string;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComment?: string;
  siteStudyReport?: string; // PDF URL or file path
  scopingDetails?: {
    software: Array<{
      name: string;
      monthlyFee: number;
      setupFee: number;
      description?: string;
    }>;
    hardware: Array<{
      name: string;
      quantity: number;
      unitCost: number;
      totalCost: number;
      description?: string;
    }>;
  };
  siteDetails?: {
    location: string;
    type: string;
    capacity: number;
    currentStatus: string;
  };
}

interface ApprovalHistory {
  id: string;
  siteName: string;
  deploymentEngineer: string;
  submittedAt: string;
  reviewedAt: string;
  reviewedBy: string;
  status: 'approved' | 'rejected';
  totalCost: number;
  reviewComment?: string;
}

const Approvals = () => {
  const { currentRole, profile } = useAuth();
  const { getTabAccess } = useRoleAccess();
  const navigate = useNavigate();
  const roleConfig = getRoleConfig(currentRole || 'admin');
  
  // State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewComment, setReviewComment] = useState('');
  const [approvalResponseTime, setApprovalResponseTime] = useState<number>(24);
  const [overdueApprovals, setOverdueApprovals] = useState<ApprovalRequest[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<ScopingApproval[]>([]);
  const [approvedApprovals, setApprovedApprovals] = useState<ScopingApproval[]>([]);
  const [rejectedApprovals, setRejectedApprovals] = useState<ScopingApproval[]>([]);

  // Check access permissions
  const tabAccess = getTabAccess('/approvals-procurement');
  
  if (!tabAccess.canAccess) {
    return (
              <AccessDenied 
          pageName="Approvals"
          customMessage="You don't have permission to access the Approvals page."
        />
    );
  }

  // Load scoping approvals and settings
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load approval response time from settings
        const responseTime = await SettingsService.getApprovalResponseTime();
        setApprovalResponseTime(responseTime);
        
        // Load all approval types in parallel
        const [pending, approved, rejected] = await Promise.all([
          ScopingApprovalService.getApprovals({ status: 'pending' }),
          ScopingApprovalService.getApprovals({ status: 'approved' }),
          ScopingApprovalService.getApprovals({ status: 'rejected' }),
        ]);
        
        setPendingApprovals(pending);
        setApprovedApprovals(approved);
        setRejectedApprovals(rejected);
        
        // Identify overdue approvals
        const allPending = pending.map(convertScopingToApprovalRequest);
        const overdue = allPending.filter(request => 
          SettingsService.isApprovalOverdue(request.submittedAt, responseTime)
        );
        setOverdueApprovals(overdue);
      } catch (error) {
        console.error('Error loading approval data:', error);
        toast.error('Failed to load approval data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Reload approvals after approve/reject action
  const reloadApprovals = async () => {
    try {
      const [pending, approved, rejected] = await Promise.all([
        ScopingApprovalService.getApprovals({ status: 'pending' }),
        ScopingApprovalService.getApprovals({ status: 'approved' }),
        ScopingApprovalService.getApprovals({ status: 'rejected' }),
      ]);
      
      setPendingApprovals(pending);
      setApprovedApprovals(approved);
      setRejectedApprovals(rejected);
      
      // Update overdue approvals
      const responseTime = await SettingsService.getApprovalResponseTime();
      const allPending = pending.map(convertScopingToApprovalRequest);
      const overdue = allPending.filter(request => 
        SettingsService.isApprovalOverdue(request.submittedAt, responseTime)
      );
      setOverdueApprovals(overdue);
    } catch (error) {
      console.error('Error reloading approvals:', error);
    }
  };

  // Convert ScopingApproval to ApprovalRequest format
  const convertScopingToApprovalRequest = (scoping: ScopingApproval): ApprovalRequest => {
    const scopingData = scoping.scopingData || {};
    const costBreakdown = scoping.costBreakdown || {};
    const selectedSoftware = scopingData.selected_software || [];
    const selectedHardware = scopingData.selected_hardware || [];
    
    return {
      id: scoping.id,
      siteName: scoping.siteName,
      siteId: scoping.siteId,
      deploymentEngineer: scoping.deploymentEngineerName,
      submittedAt: scoping.submittedAt,
      status: scoping.status === 'changes_requested' ? 'changes_requested' : scoping.status,
      priority: 'medium', // Default priority, can be enhanced
      totalCost: costBreakdown.totalInvestment || costBreakdown.totalCapex || 0,
      softwareCount: selectedSoftware.length,
      hardwareCount: selectedHardware.length,
      comments: scoping.reviewComment || undefined,
      rejectionReason: scoping.rejectionReason || undefined,
      reviewedBy: scoping.reviewedBy || undefined,
      reviewedAt: scoping.reviewedAt || undefined,
      reviewComment: scoping.reviewComment || undefined,
      scopingDetails: {
        software: selectedSoftware.map((sw: any) => ({
          name: sw.name || sw.id || 'Unknown Software',
          monthlyFee: sw.monthly_fee || sw.license_fee || 0,
          setupFee: sw.setup_fee || sw.license_fee || 0,
          description: sw.description || '',
        })),
        hardware: selectedHardware.map((hw: any) => ({
          name: hw.name || hw.id || 'Unknown Hardware',
          quantity: hw.quantity || 0,
          unitCost: hw.unit_cost || 0,
          totalCost: (hw.quantity || 0) * (hw.unit_cost || 0),
          description: hw.description || '',
        })),
      },
    };
  };

  // Helper function to check if approval is overdue
  const isApprovalOverdue = (requestDate: string): boolean => {
    return SettingsService.isApprovalOverdue(requestDate, approvalResponseTime);
  };

  // Helper function to get hours elapsed since request
  const getHoursElapsed = (requestDate: string): number => {
    const requestDateTime = new Date(requestDate);
    const now = new Date();
    return Math.floor((now.getTime() - requestDateTime.getTime()) / (1000 * 60 * 60));
  };

  // Filtered data
  const filteredPendingRequests = useMemo(() => {
    // Convert scoping approvals to approval requests
    const allRequests = pendingApprovals.map(convertScopingToApprovalRequest);

    let filtered = allRequests;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(request =>
        request.siteName.toLowerCase().includes(searchLower) ||
        request.deploymentEngineer.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(request => request.priority === priorityFilter);
    }

    return filtered;
  }, [searchTerm, statusFilter, priorityFilter, pendingApprovals]);

  const filteredHistory = useMemo(() => {
    // Combine approved and rejected approvals for history
    const allHistory = [
      ...approvedApprovals.map(convertScopingToApprovalRequest),
      ...rejectedApprovals.map(convertScopingToApprovalRequest)
    ].sort((a, b) => {
      // Sort by reviewed date (most recent first)
      const dateA = a.reviewedAt ? new Date(a.reviewedAt).getTime() : 0;
      const dateB = b.reviewedAt ? new Date(b.reviewedAt).getTime() : 0;
      return dateB - dateA;
    });

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return allHistory.filter(request =>
        request.siteName.toLowerCase().includes(searchLower) ||
        request.deploymentEngineer.toLowerCase().includes(searchLower)
      );
    }
    return allHistory;
  }, [searchTerm, approvedApprovals, rejectedApprovals]);

     // Helper functions
   // Priority levels: Set by deployment engineer during site study
   // - urgent: Site opening < 2 weeks, high revenue impact
   // - high: Site opening 2-4 weeks, medium revenue impact  
   // - medium: Site opening 1-2 months, standard deployment
   // - low: Site opening > 2 months, low priority
   const getStatusColor = (status: string) => {
    switch (status) {
      // Green: Live
      case 'approved':
        return 'bg-green-100 text-green-800';
      
      // Gray: Created, Pending
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      
      // Red: Blocked, On Hold, Rejected
      case 'rejected':
        return 'bg-red-100 text-red-800';
      
      // Blue: Procurement Done, Deployed, Approved (changes_requested maps to blue)
      case 'changes_requested':
        return 'bg-green-100 text-green-800';
      
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

  const handleReview = (request: ApprovalRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setReviewAction(action);
    setReviewComment('');
    setShowReviewDialog(true);
  };

  const handleViewDetails = (request: ApprovalRequest) => {
    setSelectedRequest(request);
    setShowDetailsDialog(true);
  };

  const submitReview = async () => {
    if (!selectedRequest || !reviewComment.trim()) {
      toast.error('Please provide a review comment');
      return;
    }

    setLoading(true);
    
    try {
      // Check if this is a scoping approval
      const scopingApproval = pendingApprovals.find(sa => sa.id === selectedRequest.id);
      
      if (scopingApproval) {
        // Handle scoping approval
        if (reviewAction === 'approve') {
          await ScopingApprovalService.approveScoping(scopingApproval.id, reviewComment);
        } else {
          await ScopingApprovalService.rejectScoping(scopingApproval.id, reviewComment, reviewComment);
        }
        
        // Refresh all approvals
        await reloadApprovals();
        
        toast.success(`Scoping ${reviewAction === 'approve' ? 'approved' : 'rejected'} successfully`);
      } else {
        toast.error('Approval request not found');
      }
      
      setShowReviewDialog(false);
      setSelectedRequest(null);
      setReviewComment('');
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error?.message || `Failed to ${reviewAction} request`);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  if (loading) {
    return <PageLoader />;
  }

    return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Approvals</h1>
            <p className="text-gray-600 mt-2">
              Review and approve hardware/software requests
            </p>
        </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="text-sm">
              {roleConfig.displayName}
            </Badge>
      </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
          </div>
              <div>
                <p className="text-sm text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingApprovals.length}
                </p>
        </div>
      </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Changes Requested</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingApprovals.filter(r => r.status === 'changes_requested').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
        <div>
                <p className="text-sm text-gray-600">Approved This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {approvedApprovals.filter(h => {
                    const reviewedDate = h.reviewedAt ? new Date(h.reviewedAt) : null;
                    if (!reviewedDate) return false;
                    const now = new Date();
                    return reviewedDate.getMonth() === now.getMonth() && 
                           reviewedDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
          </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Value Pending</p>
                                <p className="text-2xl font-bold text-gray-900">
                  £{pendingApprovals.reduce((sum, r) => {
                    const costBreakdown = r.costBreakdown || {};
                    return sum + (costBreakdown.totalInvestment || costBreakdown.totalCapex || 0);
                  }, 0).toLocaleString()}
          </p>
        </div>
        </div>
          </CardContent>
        </Card>
      </div>

             {/* Main Content */}
       {/* Tab Navigation */}
       <div className="mb-6">
         <div className="flex space-x-1 bg-white p-1 rounded-lg border">
           <Button
             variant={activeTab === 'pending' ? 'default' : 'ghost'}
             onClick={() => setActiveTab('pending')}
             className="flex-1"
           >
             <Clock className="h-4 w-4 mr-2" />
             Pending Approvals ({pendingApprovals.length})
           </Button>
           <Button
             variant={activeTab === 'history' ? 'default' : 'ghost'}
             onClick={() => setActiveTab('history')}
             className="flex-1"
           >
             <History className="h-4 w-4 mr-2" />
             Approval History
           </Button>
                  </div>
       </div>

       {/* Content based on active tab */}
       {activeTab === 'pending' && (
         <div className="space-y-6">
          {/* Overdue Approvals Alert */}
        {overdueApprovals.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>{overdueApprovals.length} approval request{overdueApprovals.length > 1 ? 's' : ''} overdue</strong> 
              (Response time: {approvalResponseTime}h). Please review and respond to these requests.
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                      placeholder="Search by site name or engineer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="changes_requested">Changes Requested</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={clearFilters} className="w-full lg:w-auto">
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Requests Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPendingRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                                 <CardHeader className="pb-3">
                   <div className="flex items-start justify-between">
                     <div className="flex-1">
                       <CardTitle className="text-lg">{request.siteName}</CardTitle>
                       <CardDescription className="mt-1">
                         Requested by {request.deploymentEngineer}
                       </CardDescription>
          </div>
                     <div className="flex flex-col items-end space-y-2">
                       <div className="flex items-center space-x-2">
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => handleViewDetails(request)}
                           className="h-6 w-6 p-0 hover:bg-gray-100"
                           title="View Details"
                         >
                           <Eye className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                         </Button>
                         {isApprovalOverdue(request.submittedAt) && (
                           <Badge className="bg-red-100 text-red-800 border-red-200">
                             <AlertTriangle className="h-3 w-3 mr-1" />
                             Overdue
                           </Badge>
                         )}
                         <Badge className={getPriorityColor(request.priority)}>
                           {request.priority}
                         </Badge>
                       </div>
                       <Badge className={getStatusColor(request.status)}>
                         {request.status.replace('_', ' ')}
                       </Badge>
                     </div>
                   </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Total Cost</p>
                      <p className="font-semibold text-lg">£{request.totalCost.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Submitted</p>
                      <p className="font-medium">
                        {formatDate(request.submittedAt)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getHoursElapsed(request.submittedAt)}h ago
                        {isApprovalOverdue(request.submittedAt) && (
                          <span className="text-red-600 ml-1">
                            (Overdue by {getHoursElapsed(request.submittedAt) - approvalResponseTime}h)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Package className="h-4 w-4 text-green-600" />
                      <span>{request.softwareCount} Software</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Truck className="h-4 w-4 text-green-600" />
                      <span>{request.hardwareCount} Hardware</span>
                    </div>
                  </div>

                  {request.comments && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium mb-1">Comments:</p>
                      <p>{request.comments}</p>
                    </div>
                  )}

                  {request.reviewComment && (
                    <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                      <p className="font-medium mb-1">Review Comment:</p>
                      <p>{request.reviewComment}</p>
                    </div>
                  )}

                                     {request.status === 'changes_requested' ? (
                     <div className="pt-2">
                       <div className="flex items-center justify-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                         <Clock className="h-4 w-4 mr-2 text-orange-600" />
                         <span className="text-sm font-medium text-orange-800">
                           Waiting for changes
                         </span>
                       </div>
                     </div>
                   ) : (
                     <div className="flex space-x-2 pt-2">
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => handleReview(request, 'approve')}
                         className="flex-1"
                       >
                         <Check className="h-4 w-4 mr-1" />
                         Approve
                       </Button>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => handleReview(request, 'reject')}
                         className="flex-1"
                       >
                         <X className="h-4 w-4 mr-1" />
                         Reject
                       </Button>
                     </div>
                   )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPendingRequests.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pending approvals</h3>
                <p className="text-gray-600">All approval requests have been processed.</p>
              </CardContent>
            </Card>
          )}
         </div>
       )}

       {activeTab === 'history' && (
         <div className="space-y-6">
          {/* History Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search approval history..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                              </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Site</TableHead>
                      <TableHead>Engineer</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Reviewed</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total Cost</TableHead>
                      <TableHead>Reviewer</TableHead>
                      <TableHead>Review Comment</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.siteName}</TableCell>
                        <TableCell>{item.deploymentEngineer}</TableCell>
                            <TableCell>
                          {formatDate(item.submittedAt)}
                            </TableCell>
                        <TableCell>
                          {item.reviewedAt ? formatDate(item.reviewedAt) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                            {item.status === 'approved' && (
                              <span className="text-xs text-green-600 font-medium">
                                Ready for procurement
                              </span>
                            )}
                            {item.status === 'rejected' && (
                              <span className="text-xs text-red-600 font-medium">
                                {item.rejectionReason ? 'Rejected' : 'Final Rejection'}
                              </span>
                            )}
                              </div>
                            </TableCell>
                        <TableCell className="font-medium">
                          £{item.totalCost.toLocaleString()}
                        </TableCell>
                        <TableCell>{item.reviewedBy || '-'}</TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm text-gray-600 truncate" title={item.reviewComment || item.rejectionReason}>
                              {item.reviewComment || item.rejectionReason || 'No comment'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(item)}
                            className="h-6 w-6 p-0 hover:bg-gray-100"
                            title="View Details"
                          >
                            <Eye className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                          </Button>
                            </TableCell>
                          </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {filteredHistory.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No approval history</h3>
                <p className="text-gray-600">No approved or rejected scoping requests yet.</p>
              </CardContent>
            </Card>
          )}
         </div>
       )}

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve Request' : 'Reject Request'}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.siteName} - {selectedRequest?.deploymentEngineer}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="review-comment">Review Comment</Label>
              <Textarea
                id="review-comment"
                placeholder={`Enter your ${reviewAction === 'approve' ? 'approval' : 'rejection'} comment...`}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitReview}
              variant={reviewAction === 'approve' ? 'approved' : 'reject'}
            >
              {reviewAction === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Site Study Details</span>
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.siteName} - Requested by {selectedRequest?.deploymentEngineer}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* Site Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Site Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Location</Label>
                      <p className="text-sm">{selectedRequest.siteDetails?.location}</p>
                </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Type</Label>
                      <p className="text-sm">{selectedRequest.siteDetails?.type}</p>
              </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Capacity</Label>
                      <p className="text-sm">{selectedRequest.siteDetails?.capacity} people</p>
                  </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Current Status</Label>
                      <p className="text-sm">{selectedRequest.siteDetails?.currentStatus}</p>
                </div>
                  </div>
                </CardContent>
              </Card>

              {/* Software Requirements */}
                <Card>
                  <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>Software Requirements</span>
                  </CardTitle>
                  </CardHeader>
                  <CardContent>
                  <div className="space-y-3">
                    {selectedRequest.scopingDetails?.software.map((software, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{software.name}</h4>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">£{software.monthlyFee}/month</p>
                            <p className="text-sm text-gray-600">£{software.setupFee} setup</p>
                          </div>
                          </div>
                        {software.description && (
                          <p className="text-sm text-gray-600">{software.description}</p>
                        )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

              {/* Hardware Requirements */}
                    <Card>
                      <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Truck className="h-5 w-5" />
                    <span>Hardware Requirements</span>
                  </CardTitle>
                      </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedRequest.scopingDetails?.hardware.map((hardware, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{hardware.name}</h4>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Qty: {hardware.quantity}</p>
                            <p className="text-sm text-gray-600">£{hardware.unitCost} each</p>
                            <p className="font-medium">£{hardware.totalCost} total</p>
                              </div>
                          </div>
                        {hardware.description && (
                          <p className="text-sm text-gray-600">{hardware.description}</p>
                        )}
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>

              {/* Cost Summary */}
                    <Card>
                      <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Cost Summary</span>
                  </CardTitle>
                      </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                        <div>
                      <Label className="text-sm font-medium text-gray-600">Total Hardware Cost</Label>
                      <p className="text-lg font-bold">
                        £{selectedRequest.scopingDetails?.hardware.reduce((sum, h) => sum + h.totalCost, 0).toLocaleString()}
                      </p>
                              </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Total Software Setup</Label>
                      <p className="text-lg font-bold">
                        £{selectedRequest.scopingDetails?.software.reduce((sum, s) => sum + s.setupFee, 0).toLocaleString()}
                      </p>
                          </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Monthly Software Fees</Label>
                      <p className="text-lg font-bold">
                        £{selectedRequest.scopingDetails?.software.reduce((sum, s) => sum + s.monthlyFee, 0).toLocaleString()}/month
                      </p>
                        </div>
                        <div>
                      <Label className="text-sm font-medium text-gray-600">Total Project Cost</Label>
                      <p className="text-2xl font-bold text-green-600">
                        £{selectedRequest.totalCost.toLocaleString()}
                      </p>
                              </div>
                          </div>
                </CardContent>
              </Card>

              {/* Site Study Report */}
              {selectedRequest.siteStudyReport && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Site Study Report</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="font-medium">Site Study Report</p>
                          <p className="text-sm text-gray-600">PDF document with detailed site analysis</p>
                        </div>
                              </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download PDF
                      </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                setShowDetailsDialog(false);
                handleReview(selectedRequest!, 'approve');
              }}
              variant="approved"
            >
              <Check className="h-4 w-4 mr-1" />
              Approve Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Approvals; 