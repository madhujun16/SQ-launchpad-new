import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter,
  Eye,
  MessageSquare,
  Truck,
  Package,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  Edit
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getRoleConfig } from '@/lib/roles';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
}

const ApprovalsProcurement = () => {
  const { currentRole, profile } = useAuth();
  const roleConfig = getRoleConfig(currentRole || 'admin');
  
  const [requests, setRequests] = useState<HardwareRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<HardwareRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<HardwareRequest | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewComment, setReviewComment] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock data - in real app, this would come from API
  useEffect(() => {
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
        comments: 'Need additional POS terminals for peak hours'
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
        expected_delivery: '2024-01-25'
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
        rejection_reason: 'Budget constraints - alternative solution available'
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
        expected_delivery: '2024-01-22'
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
        expected_delivery: '2024-01-23'
      }
    ];

    setRequests(mockRequests);
    setFilteredRequests(mockRequests);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = requests;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.site_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requested_by.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(request => request.priority === priorityFilter);
    }

    setFilteredRequests(filtered);
  }, [requests, searchTerm, statusFilter, priorityFilter]);

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
      low: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
      medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800' },
      high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
      urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800' }
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

    // In real app, this would update the database
    const updatedRequests = requests.map(req => {
      if (req.id === selectedRequest.id) {
        return {
          ...req,
          status: (reviewAction === 'approve' ? 'approved' : 'rejected') as HardwareRequest['status'],
          rejection_reason: reviewAction === 'reject' ? reviewComment : undefined,
          comments: reviewComment
        };
      }
      return req;
    });

    setRequests(updatedRequests);
    setShowReviewDialog(false);
    setSelectedRequest(null);
    setReviewComment('');
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

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Approvals & Procurement</h1>
          <p className="text-gray-600 mt-1">
            Review hardware requests and track procurement progress
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
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Clear Filters</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
          <TabsTrigger value="procurement">Procurement Tracker</TabsTrigger>
          <TabsTrigger value="resubmission">Resubmission Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Hardware Requests</CardTitle>
              <CardDescription>
                Hardware requests awaiting your review and approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests
                    .filter(req => req.status === 'pending')
                    .map((request) => {
                      const statusConfig = getStatusConfig(request.status);
                      const priorityConfig = getPriorityConfig(request.priority);
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div className="font-medium">{request.site_name}</div>
                            <div className="text-sm text-gray-500">{request.assigned_ops_manager}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{request.requested_by}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(request.requested_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={priorityConfig.color}>
                              {priorityConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Package className="h-4 w-4 text-gray-400" />
                              <span>{request.items_count} items</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4 text-gray-400" />
                              <span>£{request.total_value.toLocaleString()}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${statusConfig.color} flex items-center space-x-1`}>
                              <StatusIcon className="h-3 w-3" />
                              <span>{statusConfig.label}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {canReviewRequests && (
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleReviewRequest(request, 'approve')}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleReviewRequest(request, 'reject')}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="procurement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Procurement Tracker</CardTitle>
              <CardDescription>
                Track the progress of approved hardware requests through procurement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expected Delivery</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests
                    .filter(req => ['approved', 'procurement', 'dispatched', 'delivered'].includes(req.status))
                    .map((request) => {
                      const statusConfig = getStatusConfig(request.status);
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div className="font-medium">{request.site_name}</div>
                            <div className="text-sm text-gray-500">{request.assigned_deployment_engineer}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${statusConfig.color} flex items-center space-x-1`}>
                              <StatusIcon className="h-3 w-3" />
                              <span>{statusConfig.label}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {request.expected_delivery ? (
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                <span>{new Date(request.expected_delivery).toLocaleDateString()}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">TBD</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4 text-gray-400" />
                              <span>£{request.total_value.toLocaleString()}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  request.status === 'approved' ? 'bg-blue-600 w-1/4' :
                                  request.status === 'procurement' ? 'bg-yellow-600 w-1/2' :
                                  request.status === 'dispatched' ? 'bg-purple-600 w-3/4' :
                                  'bg-green-600 w-full'
                                }`}
                              ></div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resubmission" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resubmission Requests</CardTitle>
              <CardDescription>
                Rejected requests that can be edited and resubmitted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Original Request</TableHead>
                    <TableHead>Rejection Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests
                    .filter(req => req.status === 'rejected')
                    .map((request) => {
                      const statusConfig = getStatusConfig(request.status);
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div className="font-medium">{request.site_name}</div>
                            <div className="text-sm text-gray-500">{request.requested_by}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>£{request.total_value.toLocaleString()}</div>
                              <div className="text-gray-500">{request.items_count} items</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600 max-w-xs">
                              {request.rejection_reason}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${statusConfig.color} flex items-center space-x-1`}>
                              <StatusIcon className="h-3 w-3" />
                              <span>{statusConfig.label}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit & Resubmit
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
    </div>
  );
};

export default ApprovalsProcurement; 