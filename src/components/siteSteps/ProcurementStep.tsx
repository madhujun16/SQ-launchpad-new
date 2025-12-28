import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  ShoppingCart, 
  Clock, 
  AlertTriangle,
  FileText,
  Loader2,
  Upload,
  X,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Site } from '@/types/siteTypes';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { DatePicker } from '@/components/ui/date-picker';
import { FileUploadService } from '@/services/fileUploadService';
import { ProcurementService } from '@/services/procurementService';

interface ProcurementStepProps {
  site: Site;
  onSiteUpdate: (updatedSite: Site) => void;
}

const ProcurementStep: React.FC<ProcurementStepProps> = ({ site, onSiteUpdate }) => {
  const { currentRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(undefined);
  const [deliveryReceipt, setDeliveryReceipt] = useState<File | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  // Check if user can mark as complete (Admin or Deployment Engineer)
  const canMarkComplete = currentRole === 'admin' || currentRole === 'deployment_engineer';

  useEffect(() => {
    loadProcurementData();
  }, [site.id]);

  const loadProcurementData = async () => {
    try {
      setLoading(true);
      const procurementData = await ProcurementService.getProcurementData(site.id);
      
      if (procurementData) {
        if (procurementData.delivery_date) {
          setDeliveryDate(new Date(procurementData.delivery_date));
        }
        if (procurementData.delivery_receipt_url) {
          setReceiptUrl(procurementData.delivery_receipt_url);
        }
        if (procurementData.summary) {
          setSummary(procurementData.summary);
        }
        setIsEditing(procurementData.status !== 'completed');
      } else {
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error loading procurement data:', error);
      toast.error('Failed to load procurement data');
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReceiptUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload an image (JPEG, PNG, GIF) or PDF.');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size exceeds 10MB limit.');
      return;
    }

    try {
      setUploadingReceipt(true);
      setDeliveryReceipt(file);

      // Upload file
      const uploadResult = await FileUploadService.uploadFile(
        file,
        `procurement-${site.id}-receipt-${Date.now()}`
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

  const handleRemoveReceipt = () => {
    setDeliveryReceipt(null);
    setReceiptUrl(null);
  };

  const handleSaveDraft = async () => {
    if (!deliveryDate) {
      toast.error('Please select a delivery date');
      return;
    }

    try {
      setSubmitting(true);
      
      await ProcurementService.updateProcurementData(site.id, {
        delivery_date: deliveryDate.toISOString(),
        delivery_receipt_url: receiptUrl || undefined,
        summary: summary || undefined,
        status: 'draft'
      });

      toast.success('Procurement data saved as draft');
      setIsEditing(false);
      await loadProcurementData();
    } catch (error: any) {
      console.error('Error saving procurement data:', error);
      toast.error(error?.message || 'Failed to save procurement data');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!deliveryDate) {
      toast.error('Please select a delivery date');
      return;
    }

    if (!receiptUrl) {
      toast.error('Please upload a delivery receipt');
      return;
    }

    if (!summary.trim()) {
      toast.error('Please provide a summary');
      return;
    }

    if (!canMarkComplete) {
      toast.error('You do not have permission to mark procurement as complete');
      return;
    }

    try {
      setSubmitting(true);
      
      await ProcurementService.markProcurementComplete(site.id, {
        delivery_date: deliveryDate.toISOString(),
        delivery_receipt_url: receiptUrl,
        summary: summary.trim()
      });

      // Update site status
      onSiteUpdate({
        ...site,
        status: 'procurement_done',
        procurement: {
          ...site.procurement,
          status: 'delivered',
          lastUpdated: new Date().toISOString(),
          summary: {
            ...site.procurement?.summary,
            completed: (site.procurement?.summary?.totalHardwareItems || 0) + (site.procurement?.summary?.totalSoftwareModules || 0)
          }
        } as any
      });

      toast.success('Procurement marked as complete');
      setIsEditing(false);
      await loadProcurementData();
    } catch (error: any) {
      console.error('Error marking procurement complete:', error);
      toast.error(error?.message || 'Failed to mark procurement as complete');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-3 text-gray-600">Loading procurement data...</span>
      </div>
    );
  }

  const isCompleted = site?.status === 'procurement_done' && !isEditing;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Procurement</h2>
          <p className="text-gray-600 mt-1">Record delivery information and mark procurement as complete</p>
        </div>
        {isCompleted && (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4 mr-1" />
            Completed
          </Badge>
        )}
      </div>

      {/* Status Card */}
      {isCompleted && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">Procurement completed</span>
            </div>
            {site?.procurement?.lastUpdated && (
              <p className="text-green-700 text-sm mt-1">
                Completed on {new Date(site.procurement.lastUpdated).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Procurement Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5 text-blue-600" />
            Delivery Information
          </CardTitle>
          <CardDescription>
            Upload delivery receipt and provide summary information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Delivery Date */}
          <div>
            <Label htmlFor="delivery-date" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Delivery Date <span className="text-red-500">*</span>
            </Label>
            <div className="mt-2">
              <DatePicker
                value={deliveryDate}
                onChange={(date) => setDeliveryDate(date || undefined)}
                placeholder="Select delivery date"
                disabled={!isEditing || isCompleted}
                allowPastDates={true}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Select the date when the delivery was received
            </p>
          </div>

          {/* Delivery Receipt Upload */}
          <div>
            <Label htmlFor="delivery-receipt" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Delivery Receipt {canMarkComplete && <span className="text-red-500">*</span>}
            </Label>
            <div className="mt-2">
              {receiptUrl ? (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">Receipt uploaded</p>
                      <a
                        href={receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View receipt
                      </a>
                    </div>
                  </div>
                  {isEditing && !isCompleted && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveReceipt}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <Label
                      htmlFor="delivery-receipt"
                      className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {uploadingReceipt ? 'Uploading...' : 'Click to upload receipt'}
                    </Label>
                    <Input
                      id="delivery-receipt"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleReceiptUpload}
                      disabled={!isEditing || isCompleted || uploadingReceipt}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Upload image (JPEG, PNG, GIF) or PDF (Max 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
            {uploadingReceipt && (
              <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading receipt...</span>
              </div>
            )}
          </div>

          {/* Summary */}
          <div>
            <Label htmlFor="summary" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Summary {canMarkComplete && <span className="text-red-500">*</span>}
            </Label>
            <div className="mt-2">
              <Textarea
                id="summary"
                placeholder="Enter a summary of the procurement and delivery..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                disabled={!isEditing || isCompleted}
                rows={6}
                className="resize-none"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Provide details about the delivery, items received, and any notes
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {!isCompleted && (
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          {!isEditing ? (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Edit
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={submitting || uploadingReceipt}
                className="flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Save as Draft
                  </>
                )}
              </Button>
              {canMarkComplete && (
                <Button
                  onClick={handleMarkComplete}
                  disabled={submitting || uploadingReceipt || !deliveryDate || !receiptUrl || !summary.trim()}
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Mark as Complete
                    </>
                  )}
                </Button>
              )}
            </>
          )}
        </div>
      )}

      {/* Info Message */}
      {!canMarkComplete && !isCompleted && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-blue-800 font-medium">Limited Access</p>
                <p className="text-blue-700 text-sm mt-1">
                  Only Admin or Deployment Engineer can mark procurement as complete. 
                  You can still save the information as a draft.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProcurementStep;
