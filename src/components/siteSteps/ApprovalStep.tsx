import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Download, 
  MessageSquare, 
  Handshake, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Clock, 
  Package,
  Edit,
  AlertCircle
} from 'lucide-react';
import { Site } from '@/types/siteTypes';
import { SettingsService } from '@/services/settingsService';
import { toast } from 'sonner';

interface ApprovalStepProps {
  site: Site;
  onSiteUpdate: (updatedSite: Site) => void;
}

const ApprovalStep: React.FC<ApprovalStepProps> = ({ site, onSiteUpdate }) => {
  const [approvalResponseTime, setApprovalResponseTime] = useState<number>(24);

  // Load approval response time from settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const responseTime = await SettingsService.getApprovalResponseTime();
        setApprovalResponseTime(responseTime);
      } catch (error) {
        console.error('Error loading approval settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Auto-populate requested date from scoping completion
  useEffect(() => {
    if (site?.scoping?.submittedAt && !site?.approval?.requestedAt) {
      const updatedSite = {
        ...site,
        approval: {
          ...site.approval,
          requestedAt: site.scoping.submittedAt,
          status: 'pending' as const
        }
      };
      onSiteUpdate(updatedSite);
    }
  }, [site?.scoping?.submittedAt, site?.approval?.requestedAt, site, onSiteUpdate]);

  // Helper functions
  const isApprovalOverdue = (): boolean => {
    if (!site?.approval?.requestedAt) return false;
    return SettingsService.isApprovalOverdue(site.approval.requestedAt, approvalResponseTime);
  };

  const getHoursElapsed = (): number => {
    if (!site?.approval?.requestedAt) return 0;
    const requestDateTime = new Date(site.approval.requestedAt);
    const now = new Date();
    return Math.floor((now.getTime() - requestDateTime.getTime()) / (1000 * 60 * 60));
  };

  const getNextAction = (): { text: string; action?: () => void; icon?: React.ReactNode } => {
    const status = site?.approval?.status;
    
    if (!status || status === 'pending') {
      const overdue = isApprovalOverdue();
      return {
        text: overdue ? 'Overdue - Awaiting Decision' : 'Pending - Awaiting Decision',
        icon: overdue ? <AlertCircle className="h-4 w-4 text-red-500" /> : <Clock className="h-4 w-4 text-yellow-500" />
      };
    }
    
    if (status === 'rejected') {
      return {
        text: 'Edit Scoping Step',
        action: () => {
          // Navigate to scoping step for editing
          toast.info('Redirecting to Scoping step for editing');
        },
        icon: <Edit className="h-4 w-4 text-orange-500" />
      };
    }
    
    if (status === 'approved') {
      return {
        text: 'Approval Completed - Proceed to Procurement',
        icon: <CheckCircle className="h-4 w-4 text-green-500" />
      };
    }
    
    return {
      text: 'Changes Requested - Review and Resubmit',
      icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />
    };
  };


  const nextAction = getNextAction();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hardware & Software Approval</h2>
          <p className="text-gray-600 mt-1">Review Ops Manager's approval decision and approved specifications before proceeding with deployment</p>
        </div>
        <div className="flex space-x-2">
          <Badge variant="outline" className="text-sm text-gray-600">
            <Handshake className="h-4 w-4 mr-1" />
            Read-Only Approval Review
          </Badge>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Approval Status Overview - Full Width */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Handshake className="mr-2 h-5 w-5 text-indigo-600" />
              Approval Decision
            </CardTitle>
            <CardDescription className="text-gray-600">
              Final decision from the assigned Ops Manager
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className={`flex items-center justify-between p-4 rounded-lg border ${
                site?.approval?.status === 'approved' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' :
                site?.approval?.status === 'changes_requested' ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' :
                site?.approval?.status === 'rejected' ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200' :
                'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${
                    site?.approval?.status === 'approved' ? 'bg-green-500' :
                    site?.approval?.status === 'changes_requested' ? 'bg-yellow-500' :
                    site?.approval?.status === 'rejected' ? 'bg-red-500' :
                    'bg-gray-500'
                  }`}></div>
                  <div>
                    <p className={`font-semibold ${
                      site?.approval?.status === 'approved' ? 'text-green-800' :
                      site?.approval?.status === 'changes_requested' ? 'text-yellow-800' :
                      site?.approval?.status === 'rejected' ? 'text-red-800' :
                      'text-gray-800'
                    }`}>Approval Status</p>
                    <p className={`text-sm ${
                      site?.approval?.status === 'approved' ? 'text-green-600' :
                      site?.approval?.status === 'changes_requested' ? 'text-yellow-600' :
                      site?.approval?.status === 'rejected' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {site?.approval?.status === 'approved' ? 'Approved - Ready for Procurement' : 
                       site?.approval?.status === 'changes_requested' ? 'Changes Requested - Review Required' :
                       site?.approval?.status === 'rejected' ? 'Rejected - Project On Hold' : 'Pending Review'}
                    </p>
                  </div>
                </div>
                <Badge className={`${
                  site?.approval?.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                  site?.approval?.status === 'changes_requested' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                  site?.approval?.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                  'bg-gray-100 text-gray-800 border-gray-200'
                } border`}>
                  {site?.approval?.status ? site.approval.status.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Pending'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Assigned Ops Manager</Label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-900 font-medium">{site?.approval?.approverDetails?.name || 'Sarah Johnson'}</p>
                    <p className="text-xs text-gray-600">{site?.approval?.approverDetails?.role || 'Operations Director'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Requested Date</Label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-900">
                      {site?.approval?.requestedAt ? new Date(site.approval.requestedAt).toLocaleString() : 'Auto-populated from Scoping'}
                    </p>
                    {site?.approval?.requestedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        {getHoursElapsed()}h ago
                        {isApprovalOverdue() && (
                          <span className="text-red-600 ml-1">
                            (Overdue by {getHoursElapsed() - approvalResponseTime}h)
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Response Time</Label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <Badge className={isApprovalOverdue() ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                      {isApprovalOverdue() ? 'Overdue' : `Within ${approvalResponseTime}h`}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Next Action</Label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center space-x-2">
                      {nextAction.icon}
                      <span className="text-sm text-gray-900">{nextAction.text}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approval Comments & Feedback */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-purple-600" />
            Approval Comments & Feedback
          </CardTitle>
          <CardDescription className="text-gray-600">
            Detailed feedback from the Ops Manager
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Approved Status Feedback */}
            {site?.approval?.status === 'approved' && (
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-green-900">Approval Granted</p>
                      <p className="text-xs text-green-600">
                        {site?.approval?.approvedAt ? new Date(site.approval.approvedAt).toLocaleString() : 'Decision Date'}
                      </p>
                    </div>
                    <p className="text-sm text-green-800 leading-relaxed">
                      {site?.approval?.comments || 'All requirements met. Budget approved. Proceed with procurement. Hardware specifications are suitable for the site requirements. Total investment of £45,000 is within budget limits.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Changes Requested Section - Only show if changes were requested */}
            {site?.approval?.status === 'changes_requested' && (
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-yellow-900">Changes Required</p>
                      <p className="text-xs text-yellow-600">
                        {site?.approval?.approvedAt ? new Date(site.approval.approvedAt).toLocaleString() : 'Decision Date'}
                      </p>
                    </div>
                    <p className="text-sm text-yellow-800 leading-relaxed">
                      {site?.approval?.comments || 'Please review hardware quantities for kiosks. Requesting 2 more units to meet peak demand requirements. Also, consider upgrading the network switch to support additional devices.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Rejection Reason - Only show if rejected */}
            {site?.approval?.status === 'rejected' && (
              <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <X className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-red-900">Rejection Reason</p>
                      <p className="text-xs text-red-600">
                        {site?.approval?.approvedAt ? new Date(site.approval.approvedAt).toLocaleString() : 'Decision Date'}
                      </p>
                    </div>
                    <p className="text-sm text-red-800 leading-relaxed">
                      {site?.approval?.comments || 'Budget constraints. Project on hold until next quarter. Current allocation exceeds available budget by £15,000. Please revise scope to fit within £30,000 budget limit.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Status Feedback */}
            {(!site?.approval?.status || site?.approval?.status === 'pending') && (
              <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-2">Awaiting Review</p>
                    <p className="text-sm text-gray-800 leading-relaxed">
                      {site?.approval?.comments || 'Site scoping submitted for review. Ops Manager will review hardware requirements, software selections, and budget allocation. Expected response within 48 hours.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Approved Items Summary */}
      {site?.approval?.status === 'approved' && (
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5 text-green-600" />
              Approved Items Summary
            </CardTitle>
            <CardDescription className="text-gray-600">
              Hardware and software approved for procurement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 border-b pb-2 mb-3">Hardware Items</h4>
                  <div className="space-y-2">
                    {site?.scoping?.selectedHardware?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">{item.id}</span>
                        <Badge variant="outline" className="text-xs">Qty: {item.quantity}</Badge>
                      </div>
                    )) || (
                      <p className="text-sm text-gray-500">No hardware items selected</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 border-b pb-2 mb-3">Software Modules</h4>
                  <div className="space-y-2">
                    {site?.scoping?.selectedSoftware?.map((softwareItem, index) => {
                      // Handle both old format (string) and new format (object with {id, quantity})
                      const softwareName = typeof softwareItem === 'string' 
                        ? softwareItem 
                        : softwareItem?.id || 'Unknown Software';
                      const softwareQuantity = typeof softwareItem === 'object' && softwareItem?.quantity 
                        ? softwareItem.quantity 
                        : 1;
                      
                      return (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-700">{softwareName}</span>
                          <Badge variant="outline" className="text-xs">
                            {softwareQuantity > 1 ? `Qty: ${softwareQuantity}` : 'Approved'}
                          </Badge>
                        </div>
                      );
                    }) || (
                      <p className="text-sm text-gray-500">No software modules selected</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Total Approved Investment</span>
                  <span className="text-lg font-bold text-green-600">
                    £{site?.scoping?.costSummary?.totalInvestment?.toLocaleString() || '0'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApprovalStep;
