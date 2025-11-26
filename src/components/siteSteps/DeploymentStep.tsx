import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Edit, 
  CheckCircle, 
  BarChart3 as ProgressIcon, 
  CalendarDays, 
  Clock, 
  AlertCircle,
  Plus,
  Package
} from 'lucide-react';
import { Site } from '@/types/siteTypes';
import { toast } from 'sonner';

// TODO: Replace with GCP API calls

interface DeploymentStepProps {
  site: Site;
  onSiteUpdate: (updatedSite: Site) => void;
}

interface HardwareDevice {
  id: string;
  name: string;
  description: string | null;
  category_id: string;
  manufacturer: string | null;
  unit_cost: number | null;
  type: string | null;
  is_active: boolean | null;
  category?: {
    id: string;
    name: string;
    description: string | null;
  };
}

interface Asset {
  id: string;
  name: string;
  type: string;
  serial_number: string | null;
  site_id: string | null;
  site_name: string | null;
  status: 'in_stock' | 'assigned' | 'deployed' | 'in_maintenance' | 'retired' | 'pending' | 'installed' | 'active';
  location: string | null;
  assigned_to: string | null;
  purchase_date: string | null;
  warranty_expiry: string | null;
  last_maintenance: string | null;
  next_maintenance: string | null;
  maintenance_schedule: string | null;
  license_key: string | null;
  license_expiry: string | null;
  cost: number;
  manufacturer: string | null;
  model: string | null;
  notes: string | null;
  hardware_item_id: string | null;
  model_number: string | null;
  service_cycle_months: number | null;
  created_at: string;
  updated_at: string;
}

const DeploymentStep: React.FC<DeploymentStepProps> = ({ site, onSiteUpdate }) => {
  const [procuredHardware, setProcuredHardware] = useState<any[]>([]);
  const [siteAssets, setSiteAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [selectedHardware, setSelectedHardware] = useState<HardwareDevice | null>(null);
  const [assetForm, setAssetForm] = useState({
    model_number: '',
    service_cycle_months: 12
  });

  useEffect(() => {
    loadProcuredHardware();
    loadSiteAssets();
  }, [site.id]);

  const loadProcuredHardware = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with GCP API call
      console.warn('Loading procured hardware not implemented - connect to GCP backend');
      setProcuredHardware([]);
    } catch (err) {
      console.error('Error loading procured hardware:', err);
      toast.error('Failed to load procured hardware');
    } finally {
      setLoading(false);
    }
  };

  const loadSiteAssets = async () => {
    try {
      // TODO: Replace with GCP API call
      console.warn('Loading site assets not implemented - connect to GCP backend');
      setSiteAssets([]);
    } catch (err) {
      console.error('Error loading site assets:', err);
      toast.error('Failed to load site assets');
    }
  };

  const handleAddAsset = (procurementItem: any) => {
    setSelectedHardware({
      id: procurementItem.hardware_item_id,
      name: procurementItem.item_name,
      description: procurementItem.hardware_item?.description,
      category_id: procurementItem.hardware_item?.category?.id,
      manufacturer: procurementItem.hardware_item?.manufacturer,
      unit_cost: procurementItem.unit_cost,
      type: procurementItem.hardware_item?.type,
      is_active: true,
      category: procurementItem.hardware_item?.category
    });
    setAssetForm({
      model_number: '',
      service_cycle_months: 12
    });
    setShowAssetModal(true);
  };

  const handleSaveAsset = async () => {
    if (!selectedHardware || !assetForm.model_number.trim()) {
      toast.error('Please enter a model number');
      return;
    }

    try {
      // Find the procurement item to get the quantity
      const procurementItem = procuredHardware.find(item => item.hardware_item_id === selectedHardware.id);
      if (!procurementItem) {
        toast.error('Procurement item not found');
        return;
      }

      // Create assets based on quantity
      // TODO: Replace with GCP API call
      console.warn('Saving assets not implemented - connect to GCP backend');
      toast.error('Asset creation requires GCP backend connection');
      return;
    } catch (err) {
      console.error('Error saving assets:', err);
      toast.error('Failed to save assets');
    }
  };

  const getAssetCount = (hardwareId: string) => {
    return siteAssets.filter(asset => asset.hardware_item_id === hardwareId).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Deployment</h2>
          <p className="text-gray-600 mt-1">Hardware installation and system deployment</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-1" />
            Update Progress
          </Button>
          <Button size="sm">
            <CheckCircle className="h-4 w-4 mr-1" />
            Mark Complete
          </Button>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Deployment Progress */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ProgressIcon className="mr-2 h-5 w-5 text-green-600" />
              Deployment Progress
            </CardTitle>
            <CardDescription className="text-gray-600">
              Current deployment status and progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Overall Progress</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{site?.deployment?.progress?.overallProgress || 0}%</span>
                  </div>
                  <Progress value={site?.deployment?.progress?.overallProgress || 0} className="h-2" />
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Task Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Hardware Delivered</p>
                        <p className="text-sm text-gray-600">All hardware received on site</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Installation In Progress</p>
                        <p className="text-sm text-gray-600">POS terminals being installed</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">In Progress</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium">Testing Pending</p>
                        <p className="text-sm text-gray-600">System testing and validation</p>
                      </div>
                    </div>
                    <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deployment Details */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarDays className="mr-2 h-5 w-5 text-cyan-600" />
              Deployment Details
            </CardTitle>
            <CardDescription className="text-gray-600">
              Key deployment information and timeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Team Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deployment-engineer">Deployment Engineer</Label>
                    <Input id="deployment-engineer" value={site?.deployment?.assignedEngineer || ""} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deployment-team">Deployment Team</Label>
                    <Input id="deployment-team" value="" readOnly className="bg-gray-50" />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Timeline Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input id="start-date" value={site?.deployment?.startDate ? new Date(site.deployment.startDate).toLocaleDateString() : "20th January 2025"} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expected-completion">Expected Completion</Label>
                    <Input id="expected-completion" value={site?.deployment?.endDate ? new Date(site.deployment.endDate).toLocaleDateString() : "25th January 2025"} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="current-phase">Current Phase</Label>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-800">Installation</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Procured Hardware Devices List */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5 text-blue-600" />
              Procured Hardware Devices
            </CardTitle>
            <CardDescription className="text-gray-600">
              Hardware devices that have been procured and are ready for deployment
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading procured hardware...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {procuredHardware.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm text-gray-500">No procured hardware found</p>
                    <p className="text-xs text-gray-400">Complete the procurement phase first</p>
                  </div>
                ) : (
                  procuredHardware.map((procurementItem: any) => (
                    <div key={procurementItem.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{procurementItem.item_name}</h4>
                            {procurementItem.hardware_item?.description && (
                              <p className="text-sm text-gray-600">{procurementItem.hardware_item.description}</p>
                            )}
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">
                            {procurementItem.hardware_item?.type || 'Hardware'}
                          </Badge>
                          {procurementItem.hardware_item?.category && (
                            <Badge variant="outline">
                              {procurementItem.hardware_item.category.name}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>Quantity: {procurementItem.quantity}</span>
                          {procurementItem.hardware_item?.manufacturer && (
                            <span>Manufacturer: {procurementItem.hardware_item.manufacturer}</span>
                          )}
                          <span>Unit Cost: £{procurementItem.unit_cost?.toLocaleString() || 0}</span>
                          <span>Total: £{procurementItem.total_cost?.toLocaleString() || 0}</span>
                          <span>Assets: {getAssetCount(procurementItem.hardware_item_id)}</span>
                        </div>
                        <div className="mt-2">
                          <Badge className={
                            procurementItem.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                            procurementItem.status === 'installed' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {procurementItem.status}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleAddAsset(procurementItem)}
                        size="sm"
                        className="ml-4"
                        disabled={procurementItem.status !== 'delivered' && procurementItem.status !== 'installed'}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Assets
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Asset Modal */}
        <Dialog open={showAssetModal} onOpenChange={setShowAssetModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Assets</DialogTitle>
              <DialogDescription>
                Add assets for {selectedHardware?.name}
                {selectedHardware && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                    <strong>Quantity:</strong> {procuredHardware.find(item => item.hardware_item_id === selectedHardware.id)?.quantity || 0} units
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="model_number">Base Model Number</Label>
                <Input
                  id="model_number"
                  value={assetForm.model_number}
                  onChange={(e) => setAssetForm(prev => ({ ...prev, model_number: e.target.value }))}
                  placeholder="Enter base model number (e.g., SQ-POS)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Assets will be numbered automatically (e.g., SQ-POS-001, SQ-POS-002, etc.)
                </p>
              </div>
              <div>
                <Label htmlFor="service_cycle">Service Cycle (months)</Label>
                <Input
                  id="service_cycle"
                  type="number"
                  min="1"
                  max="120"
                  value={assetForm.service_cycle_months}
                  onChange={(e) => setAssetForm(prev => ({ ...prev, service_cycle_months: parseInt(e.target.value) || 12 }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAssetModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveAsset}>
                Add {procuredHardware.find(item => item.hardware_item_id === selectedHardware?.id)?.quantity || 0} Assets
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="text-right">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-1" />
            Update Progress
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeploymentStep;
