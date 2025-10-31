import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

interface SimpleInventoryItemFormProps {
  item?: {
    serial_number?: string;
    model?: string;
    inventory_type?: string;
    group_type?: string;
    status?: string;
    notes?: string;
  };
  onSave?: (item: {
    serial_number: string;
    model: string;
    inventory_type: string;
    group_type: string;
    status: string;
    notes: string;
  }) => void;
  onCancel?: () => void;
}

export const SimpleInventoryItemForm: React.FC<SimpleInventoryItemFormProps> = ({ 
  item, 
  onSave, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    serial_number: item?.serial_number || '',
    model: item?.model || '',
    inventory_type: item?.inventory_type || 'counter',
    group_type: item?.group_type || 'hardware',
    status: item?.status || 'available',
    notes: item?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave?.(formData);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{item ? 'Edit Item' : 'Add New Item'}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="serial_number">Serial Number</Label>
            <Input
              id="serial_number"
              value={formData.serial_number}
              onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
              placeholder="Enter serial number"
              required
            />
          </div>

          <div>
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              placeholder="Enter model"
              required
            />
          </div>

          <div>
            <Label htmlFor="inventory_type">Inventory Type</Label>
            <Select value={formData.inventory_type} onValueChange={(value) => setFormData({ ...formData, inventory_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="counter">Counter</SelectItem>
                <SelectItem value="tablet">Tablet</SelectItem>
                <SelectItem value="router">Router</SelectItem>
                <SelectItem value="cable">Cable</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="deployed">Deployed</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes"
              rows={3}
            />
          </div>

          <div className="flex space-x-2">
            <Button type="submit" className="flex-1" variant="gradient">
              {item ? 'Update' : 'Create'} Item
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};