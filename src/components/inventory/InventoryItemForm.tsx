import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { CreateInventoryItemForm, Sector, City, Site, INVENTORY_STATUS_OPTIONS, INVENTORY_TYPE_OPTIONS, GROUP_TYPE_OPTIONS } from '@/types/inventory';

const inventoryItemSchema = z.object({
  serial_number: z.string().min(1, 'Serial number is required'),
  model: z.string().min(1, 'Model is required'),
  manufacturer: z.string().optional(),
  inventory_type: z.enum(['pos_machine', 'ped', 'kiosk', 'cash_drawer', 'printer', 'kds_screen', 'kitchen_printer']),
  group_type: z.enum(['POS', 'KMS', 'KIOSK']),
  status: z.enum(['available', 'deployed', 'maintenance', 'retired', 'lost', 'damaged']),
  site_id: z.string().optional(),
  assigned_to: z.string().optional(),
  purchase_date: z.string().optional(),
  warranty_expiry: z.string().optional(),
  notes: z.string().optional(),
});

interface InventoryItemFormProps {
  onSubmit: (data: CreateInventoryItemForm) => void;
  isLoading?: boolean;
  sectors: Sector[];
  cities: City[];
  sites: Site[];
  initialData?: Partial<CreateInventoryItemForm>;
}

export function InventoryItemForm({
  onSubmit,
  isLoading = false,
  sectors,
  cities,
  sites,
  initialData,
}: InventoryItemFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateInventoryItemForm>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: initialData || {
      status: 'available',
      group_type: 'POS',
      inventory_type: 'pos_machine',
    },
  });

  const watchedGroupType = watch('group_type');
  const watchedInventoryType = watch('inventory_type');

  // Filter inventory types based on group type
  const filteredInventoryTypes = INVENTORY_TYPE_OPTIONS.filter(
    option => option.group === watchedGroupType
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="serial_number">Serial Number *</Label>
                <Input
                  id="serial_number"
                  {...register('serial_number')}
                  placeholder="Enter serial number"
                  className={errors.serial_number ? 'border-red-500' : ''}
                />
                {errors.serial_number && (
                  <p className="text-sm text-red-500 mt-1">{errors.serial_number.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  {...register('model')}
                  placeholder="Enter model name"
                  className={errors.model ? 'border-red-500' : ''}
                />
                {errors.model && (
                  <p className="text-sm text-red-500 mt-1">{errors.model.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  {...register('manufacturer')}
                  placeholder="Enter manufacturer"
                />
              </div>

              <div>
                <Label htmlFor="group_type">Group Type *</Label>
                <Select
                  value={watchedGroupType}
                  onValueChange={(value) => setValue('group_type', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select group type" />
                  </SelectTrigger>
                  <SelectContent>
                    {GROUP_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-muted-foreground">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="inventory_type">Inventory Type *</Label>
                <Select
                  value={watchedInventoryType}
                  onValueChange={(value) => setValue('inventory_type', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select inventory type" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredInventoryTypes.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={watch('status')}
                  onValueChange={(value) => setValue('status', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {INVENTORY_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full bg-${option.color}-500`}></div>
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignment & Dates */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Assignment & Dates</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="site_id">Site</Label>
                <Select
                  value={watch('site_id') || ''}
                  onValueChange={(value) => setValue('site_id', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select site" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No site assigned</SelectItem>
                    {sites.map((site) => (
                      <SelectItem key={site.id} value={site.id}>
                        <div>
                          <div className="font-medium">{site.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {site.food_court_unit}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="purchase_date">Purchase Date</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  {...register('purchase_date')}
                />
              </div>

              <div>
                <Label htmlFor="warranty_expiry">Warranty Expiry Date</Label>
                <Input
                  id="warranty_expiry"
                  type="date"
                  {...register('warranty_expiry')}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Enter any additional notes"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Item'}
        </Button>
      </div>
    </form>
  );
} 