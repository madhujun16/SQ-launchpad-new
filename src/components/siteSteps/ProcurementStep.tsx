import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  CheckCircle, 
  ShoppingCart, 
  Package, 
  Clock, 
  AlertTriangle,
  FileText,
  Wrench,
  Loader2,
  Edit,
  Save
} from 'lucide-react';
import { Site } from '@/types/siteTypes';
import { toast } from 'sonner';

// TODO: Replace with GCP API calls

interface ProcurementStepProps {
  site: Site;
  onSiteUpdate: (updatedSite: Site) => void;
}

const ProcurementStep: React.FC<ProcurementStepProps> = ({ site, onSiteUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [approvedHardware, setApprovedHardware] = useState<any[]>([]);
  const [procurementItems, setProcurementItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadApprovedHardware();
    loadProcurementItems();
  }, [site.id]);

  const loadApprovedHardware = async () => {
    try {
      setLoading(true);
      // TODO: Replace with GCP API call
      console.warn('Loading approved hardware not implemented - connect to GCP backend');
      setApprovedHardware([]);
    } catch (err) {
      console.error('Error loading approved hardware:', err);
      toast.error('Failed to load approved hardware');
    } finally {
      setLoading(false);
    }
  };

  const loadProcurementItems = async () => {
    try {
      // TODO: Replace with GCP API call
      console.warn('Loading procurement items not implemented - connect to GCP backend');
      setProcurementItems([]);
    } catch (err) {
      console.error('Error loading procurement items:', err);
      toast.error('Failed to load procurement items');
    }
  };

  const handleCreateProcurementItems = async () => {
    if (approvedHardware.length === 0) {
      toast.error('No approved hardware found');
      return;
    }

    try {
      setSubmitting(true);
      
      // Create procurement items for approved hardware
      const itemsToInsert = approvedHardware.map((hardware: any) => ({
        site_id: site.id,
        hardware_item_id: hardware.id,
        item_type: 'hardware',
        item_name: hardware.name,
        quantity: hardware.quantity,
        unit_cost: hardware.unit_cost,
        total_cost: hardware.unit_cost * hardware.quantity,
        status: 'pending',
        supplier: 'TBD',
        order_reference: '',
        notes: `Procurement item for ${hardware.name}`
      }));

      // TODO: Replace with GCP API call
      console.warn('Creating procurement items not implemented - connect to GCP backend');
      toast.error('Procurement item creation requires GCP backend connection');
    } catch (err) {
      console.error('Error creating procurement items:', err);
      toast.error('Failed to create procurement items');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateItemStatus = async (itemId: string, status: string) => {
    try {
      // TODO: Replace with GCP API call
      console.warn('Updating item status not implemented - connect to GCP backend');
      toast.error('Item status update requires GCP backend connection');
    } catch (err) {
      console.error('Error updating item status:', err);
      toast.error('Failed to update item status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'ordered': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'installed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Procurement</h2>
          <p className="text-gray-600 mt-1">Hardware and software procurement management</p>
        </div>
      </div>

      {/* Approved Hardware Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
            Approved Hardware
          </CardTitle>
          <CardDescription>
            Hardware items approved during the scoping phase
          </CardDescription>
        </CardHeader>
        <CardContent>
          {approvedHardware.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500">No approved hardware found</p>
              <p className="text-xs text-gray-400">Complete the scoping phase first</p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvedHardware.map((hardware: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{hardware.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Quantity: {hardware.quantity} | Unit Cost: £{hardware.unit_cost?.toLocaleString() || 0}
                    </div>
                    <div className="text-sm font-medium text-green-600 mt-1">
                      Total: £{(hardware.unit_cost * hardware.quantity)?.toLocaleString() || 0}
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Approved</Badge>
                </div>
              ))}
              
              {procurementItems.length === 0 && (
                <div className="flex justify-end mt-4">
                  <Button 
                    onClick={handleCreateProcurementItems}
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Procurement Items
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Procurement Items Section */}
      {procurementItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5 text-blue-600" />
              Procurement Items
            </CardTitle>
            <CardDescription>
              Track the procurement status of approved hardware items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {procurementItems.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{item.item_name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Quantity: {item.quantity} | Unit Cost: £{item.unit_cost?.toLocaleString() || 0}
                    </div>
                    <div className="text-sm font-medium text-blue-600 mt-1">
                      Total: £{item.total_cost?.toLocaleString() || 0}
                    </div>
                    {item.supplier && (
                      <div className="text-sm text-gray-500 mt-1">
                        Supplier: {item.supplier}
                      </div>
                    )}
                    {item.order_reference && (
                      <div className="text-sm text-gray-500 mt-1">
                        Order Ref: {item.order_reference}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                    <Select
                      value={item.status}
                      onValueChange={(value) => handleUpdateItemStatus(item.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="ordered">Ordered</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="installed">Installed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Section */}
      {procurementItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-purple-600" />
              Procurement Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {procurementItems.filter(item => item.status === 'pending').length}
                </div>
                <div className="text-sm text-yellow-700">Pending</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {procurementItems.filter(item => item.status === 'ordered').length}
                </div>
                <div className="text-sm text-blue-700">Ordered</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {procurementItems.filter(item => item.status === 'delivered').length}
                </div>
                <div className="text-sm text-green-700">Delivered</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {procurementItems.filter(item => item.status === 'installed').length}
                </div>
                <div className="text-sm text-purple-700">Installed</div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Procurement Value:</span>
                <span className="text-lg font-bold text-gray-900">
                  £{procurementItems.reduce((sum, item) => sum + (item.total_cost || 0), 0).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        {!isEditing ? (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save as Draft
            </Button>
            <Button
              onClick={() => setIsEditing(false)}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Mark Complete
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProcurementStep;