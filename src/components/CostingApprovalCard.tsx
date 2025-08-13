import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Building, 
  User, 
  Calendar, 
  DollarSign, 
  Package, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock,
  AlertCircle,
  TrendingUp,
  FileText
} from 'lucide-react';
import { CostingApproval, CostingItem } from '@/types/costing';
import { CostingService } from '@/services/costingService';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

interface CostingApprovalCardProps {
  approval: CostingApproval;
  onStatusChange: () => void;
}

export const CostingApprovalCard: React.FC<CostingApprovalCardProps> = ({ 
  approval, 
  onStatusChange 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewComment, setReviewComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_review':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Pending Review</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'resubmitted':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Resubmitted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getProcurementBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600">Ready for Procurement</Badge>;
      case 'ordered':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Ordered</Badge>;
      case 'in_transit':
        return <Badge variant="outline" className="text-purple-600 border-purple-600">In Transit</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="text-green-600 border-green-600">Delivered</Badge>;
      case 'installed':
        return <Badge variant="default" className="bg-green-700">Installed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleReview = async () => {
    if (!reviewComment.trim()) {
      toast.error('Please provide a review comment');
      return;
    }

    if (reviewAction === 'reject' && !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await CostingService.reviewCostingApproval({
        approval_id: approval.id,
        action: reviewAction,
        comment: reviewComment,
        rejection_reason: reviewAction === 'reject' ? rejectionReason : undefined
      });

      if (success) {
        setShowReviewDialog(false);
        setReviewComment('');
        setRejectionReason('');
        onStatusChange();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Building className="h-5 w-5 text-blue-600" />
                <span>{approval.site_name}</span>
              </CardTitle>
              <CardDescription className="flex items-center space-x-4 text-sm">
                <span className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>DE: {approval.deployment_engineer_name}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(approval.submitted_at)}</span>
                </span>
              </CardDescription>
            </div>
            <div className="flex flex-col items-end space-y-2">
              {getStatusBadge(approval.status)}
              {getProcurementBadge(approval.procurement_status)}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(approval.total_hardware_cost)}
              </div>
              <div className="text-xs text-gray-600">Hardware</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(approval.total_software_cost)}
              </div>
              <div className="text-xs text-gray-600">Software</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(approval.total_license_cost)}
              </div>
              <div className="text-xs text-gray-600">Licenses</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(approval.grand_total)}
              </div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Package className="h-4 w-4" />
              <span>Monthly fees: {formatCurrency(approval.total_monthly_fees)}</span>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(true)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Button>
              
              {approval.status === 'pending_review' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setReviewAction('approve');
                    setShowReviewDialog(true);
                  }}
                  className="text-green-600 hover:text-green-700 border-green-600"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              )}
              
              {approval.status === 'pending_review' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setReviewAction('reject');
                    setShowReviewDialog(true);
                  }}
                  className="text-red-600 hover:text-red-700 border-red-600"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              )}
            </div>
          </div>

          {approval.rejection_reason && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Rejection Reason:</span>
              </div>
              <p className="text-sm text-red-600 mt-1">{approval.rejection_reason}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve Costing' : 'Reject Costing'}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve' 
                ? 'Please provide a comment for this approval.'
                : 'Please provide a reason for rejection and any feedback for the deployment engineer.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="reviewComment">Review Comment</Label>
              <Textarea
                id="reviewComment"
                placeholder={reviewAction === 'approve' 
                  ? 'Enter approval comment...' 
                  : 'Enter rejection reason and feedback...'
                }
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
              />
            </div>
            
            {reviewAction === 'reject' && (
              <div>
                <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Please specify why this costing is being rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={2}
                  required
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReviewDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReview}
              disabled={isSubmitting}
              className={reviewAction === 'approve' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
              }
            >
              {isSubmitting ? 'Processing...' : reviewAction === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-blue-600" />
              <span>Costing Details - {approval.site_name}</span>
            </DialogTitle>
            <DialogDescription>
              Detailed breakdown of hardware, software, and license costs
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Cost Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {formatCurrency(approval.total_hardware_cost)}
                </div>
                <div className="text-xs text-gray-600">Hardware</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {formatCurrency(approval.total_software_cost)}
                </div>
                <div className="text-xs text-gray-600">Software</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {formatCurrency(approval.total_license_cost)}
                </div>
                <div className="text-xs text-gray-600">Licenses</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">
                  {formatCurrency(approval.total_monthly_fees)}
                </div>
                <div className="text-xs text-gray-600">Monthly</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800">
                  {formatCurrency(approval.grand_total)}
                </div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
            </div>

            {/* Approval Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Submission Details</h4>
                <div className="text-sm space-y-1">
                  <div><span className="font-medium">Deployment Engineer:</span> {approval.deployment_engineer_name}</div>
                  <div><span className="font-medium">Submitted:</span> {formatDate(approval.submitted_at)}</div>
                  <div><span className="font-medium">Status:</span> {getStatusBadge(approval.status)}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Review Details</h4>
                <div className="text-sm space-y-1">
                  <div><span className="font-medium">Ops Manager:</span> {approval.ops_manager_name}</div>
                  {approval.reviewed_at && (
                    <div><span className="font-medium">Reviewed:</span> {formatDate(approval.reviewed_at)}</div>
                  )}
                  {approval.review_comment && (
                    <div><span className="font-medium">Comment:</span> {approval.review_comment}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Costing Items Table */}
            {approval.costing_items && approval.costing_items.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Item Breakdown</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Total Cost</TableHead>
                      <TableHead>Monthly Fee</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approval.costing_items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {item.item_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.item_name}</div>
                            {item.description && (
                              <div className="text-sm text-gray-500">{item.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.unit_cost)}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(item.total_cost)}</TableCell>
                        <TableCell>
                          {item.monthly_fee ? formatCurrency(item.monthly_fee) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
