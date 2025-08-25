import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Building, 
  Package, 
  DollarSign, 
  Plus, 
  Trash2, 
  Calculator,
  AlertCircle,
  CheckCircle,
  Send
} from 'lucide-react';
import { CostingService } from '@/services/costingService';
import { CostingItem } from '@/types/costing';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { UserService, UserWithRole } from '@/services/userService';

interface CostingSubmissionFormProps {
  siteId: string;
  siteName: string;
  onSubmissionComplete: () => void;
}

interface CostingFormItem {
  id: string;
  item_type: 'hardware' | 'software' | 'license';
  item_name: string;
  item_description: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  monthly_fee: number;
  annual_fee: number;
  is_required: boolean;
  category: string;
  manufacturer: string;
  model: string;
}

export const CostingSubmissionForm: React.FC<CostingSubmissionFormProps> = ({
  siteId,
  siteName,
  onSubmissionComplete
}) => {
  const [items, setItems] = useState<CostingFormItem[]>([]);
  const [selectedOpsManager, setSelectedOpsManager] = useState<string>('');
  const [opsManagers, setOpsManagers] = useState<UserWithRole[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Load available Ops Managers
  useEffect(() => {
    const loadOpsManagers = async () => {
      try {
        const opsManagersData = await UserService.getOpsManagers();
        setOpsManagers(opsManagersData);
      } catch (error) {
        console.error('Error loading Ops Managers:', error);
        toast.error('Failed to load Operations Managers');
      }
    };

    loadOpsManagers();
  }, []);

  const addItem = () => {
    const newItem: CostingFormItem = {
      id: crypto.randomUUID(),
      item_type: 'hardware',
      item_name: '',
      item_description: '',
      quantity: 1,
      unit_cost: 0,
      total_cost: 0,
      monthly_fee: 0,
      annual_fee: 0,
      is_required: true,
      category: '',
      manufacturer: '',
      model: ''
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof CostingFormItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Recalculate total cost
        if (field === 'quantity' || field === 'unit_cost') {
          updatedItem.total_cost = updatedItem.quantity * updatedItem.unit_cost;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateTotals = () => {
    const totals = {
      hardware: items.filter(item => item.item_type === 'hardware').reduce((sum, item) => sum + item.total_cost, 0),
      software: items.filter(item => item.item_type === 'software').reduce((sum, item) => sum + item.total_cost, 0),
      licenses: items.filter(item => item.item_type === 'license').reduce((sum, item) => sum + item.total_cost, 0),
      monthly_fees: items.reduce((sum, item) => sum + item.monthly_fee, 0),
      grand_total: items.reduce((sum, item) => sum + item.total_cost, 0)
    };
    return totals;
  };

  const validateForm = () => {
    if (!selectedOpsManager) {
      toast.error('Please select an Ops Manager');
      return false;
    }

    if (items.length === 0) {
      toast.error('Please add at least one item');
      return false;
    }

    for (const item of items) {
      if (!item.item_name.trim()) {
        toast.error('All items must have a name');
        return false;
      }
      if (item.quantity <= 0) {
        toast.error('Quantity must be greater than 0');
        return false;
      }
      if (item.unit_cost < 0) {
        toast.error('Unit cost cannot be negative');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await (CostingService.createCostingApproval as any)({
        site_id: siteId,
        ops_manager_id: selectedOpsManager,
        costing_items: items.map(item => ({
          item_type: item.item_type,
          item_name: item.item_name,
          item_description: item.item_description,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          total_cost: item.total_cost,
          monthly_fee: item.monthly_fee,
          annual_fee: item.annual_fee,
          is_required: item.is_required,
          category: item.category,
          manufacturer: item.manufacturer,
          model: item.model
        }))
      });

      toast.success('Costing approval submitted successfully!');
      onSubmissionComplete();
    } catch (error) {
      console.error('Error submitting costing approval:', error);
      toast.error('Failed to submit costing approval');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span>Submit Costing for Approval</span>
          </CardTitle>
          <CardDescription>
            Create a detailed costing breakdown for {siteName} and submit it to an Ops Manager for review
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Ops Manager Selection */}
          <div className="space-y-2">
            <Label htmlFor="ops-manager">Assign to Ops Manager *</Label>
            <Select value={selectedOpsManager} onValueChange={setSelectedOpsManager}>
              <SelectTrigger>
                <SelectValue placeholder="Select an Ops Manager" />
              </SelectTrigger>
              <SelectContent>
                {opsManagers.map((manager) => (
                  <SelectItem key={manager.id} value={manager.id}>
                    {manager.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Items Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Costing Items</h3>
              <Button onClick={addItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No items added yet</p>
                <p className="text-xs">Click "Add Item" to start building your costing</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <Card key={item.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor={`type-${item.id}`}>Type</Label>
                        <Select 
                          value={item.item_type} 
                          onValueChange={(value: 'hardware' | 'software' | 'license') => 
                            updateItem(item.id, 'item_type', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hardware">Hardware</SelectItem>
                            <SelectItem value="software">Software</SelectItem>
                            <SelectItem value="license">License</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor={`name-${item.id}`}>Item Name *</Label>
                        <Input
                          id={`name-${item.id}`}
                          value={item.item_name}
                          onChange={(e) => updateItem(item.id, 'item_name', e.target.value)}
                          placeholder="e.g., POS Terminal"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`qty-${item.id}`}>Quantity</Label>
                        <Input
                          id={`qty-${item.id}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`cost-${item.id}`}>Unit Cost (£)</Label>
                        <Input
                          id={`cost-${item.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_cost}
                          onChange={(e) => updateItem(item.id, 'unit_cost', parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`monthly-${item.id}`}>Monthly Fee (£)</Label>
                        <Input
                          id={`monthly-${item.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.monthly_fee}
                          onChange={(e) => updateItem(item.id, 'monthly_fee', parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`category-${item.id}`}>Category</Label>
                        <Input
                          id={`category-${item.id}`}
                          value={item.category}
                          onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                          placeholder="e.g., POS Equipment"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`manufacturer-${item.id}`}>Manufacturer</Label>
                        <Input
                          id={`manufacturer-${item.id}`}
                          value={item.manufacturer}
                          onChange={(e) => updateItem(item.id, 'manufacturer', e.target.value)}
                          placeholder="e.g., Ingenico"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`model-${item.id}`}>Model</Label>
                        <Input
                          id={`model-${item.id}`}
                          value={item.model}
                          onChange={(e) => updateItem(item.id, 'model', e.target.value)}
                          placeholder="e.g., iSC250"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="text-sm font-medium">
                          Total: {formatCurrency(item.total_cost)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Label htmlFor={`desc-${item.id}`}>Description</Label>
                      <Textarea
                        id={`desc-${item.id}`}
                        value={item.item_description}
                        onChange={(e) => updateItem(item.id, 'item_description', e.target.value)}
                        placeholder="Brief description of the item and its purpose..."
                        rows={2}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Cost Summary */}
          {items.length > 0 && (
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  <span>Cost Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(totals.hardware)}
                    </div>
                    <div className="text-xs text-gray-600">Hardware</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {formatCurrency(totals.software)}
                    </div>
                    <div className="text-xs text-gray-600">Software</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-lg font-bold text-purple-600">
                      {formatCurrency(totals.licenses)}
                    </div>
                    <div className="text-xs text-gray-600">Licenses</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-lg font-bold text-orange-600">
                      {formatCurrency(totals.monthly_fees)}
                    </div>
                    <div className="text-xs text-gray-600">Monthly</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">
                      {formatCurrency(totals.grand_total)}
                    </div>
                    <div className="text-xs text-gray-600">Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowSummary(true)}
              disabled={items.length === 0}
            >
              <Calculator className="h-4 w-4 mr-2" />
              Review Summary
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedOpsManager || items.length === 0 || isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Costing Summary - {siteName}</h3>
              <Button variant="outline" onClick={() => setShowSummary(false)}>
                Close
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(totals.hardware)}
                  </div>
                  <div className="text-xs text-gray-600">Hardware</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {formatCurrency(totals.software)}
                  </div>
                  <div className="text-xs text-gray-600">Software</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">
                    {formatCurrency(totals.licenses)}
                  </div>
                  <div className="text-xs text-gray-600">Licenses</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {formatCurrency(totals.monthly_fees)}
                  </div>
                  <div className="text-xs text-gray-600">Monthly</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800">
                    {formatCurrency(totals.grand_total)}
                  </div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
              </div>

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
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {item.item_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.item_name}</div>
                          {item.item_description && (
                            <div className="text-sm text-gray-500">{item.item_description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatCurrency(item.unit_cost)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(item.total_cost)}</TableCell>
                      <TableCell>
                        {item.monthly_fee > 0 ? formatCurrency(item.monthly_fee) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
