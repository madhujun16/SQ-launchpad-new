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
import { CreateLicenseForm, Site, InventoryItem, LICENSE_STATUS_OPTIONS, LICENSE_TYPE_OPTIONS, LicenseType, LicenseStatus } from '@/types/inventory';

const licenseSchema = z.object({
  name: z.string().min(1, 'License name is required'),
  license_key: z.string().optional(),
  license_type: z.enum(['hardware', 'software', 'service']),
  status: z.enum(['active', 'expired', 'pending_renewal', 'suspended']),
  start_date: z.string().min(1, 'Start date is required'),
  expiry_date: z.string().optional(),
  renewal_date: z.string().optional(),
  cost: z.number().optional(),
  vendor: z.string().optional(),
  site_id: z.string().optional(),
  inventory_item_id: z.string().optional(),
  notes: z.string().optional(),
});

interface LicenseFormProps {
  onSubmit: (data: CreateLicenseForm) => void;
  isLoading?: boolean;
  sites: Site[];
  inventoryItems: InventoryItem[];
  initialData?: Partial<CreateLicenseForm>;
}

export function LicenseForm({
  onSubmit,
  isLoading = false,
  sites,
  inventoryItems,
  initialData,
}: LicenseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateLicenseForm>({
    resolver: zodResolver(licenseSchema),
    defaultValues: initialData || {
      status: 'active',
      license_type: 'software',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">License Information</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">License Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Enter license name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="license_key">License Key</Label>
                <Input
                  id="license_key"
                  {...register('license_key')}
                  placeholder="Enter license key"
                />
              </div>

              <div>
                <Label htmlFor="license_type">License Type *</Label>
                <Select
                  value={watch('license_type')}
                  onValueChange={(value) => setValue('license_type', value as LicenseType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select license type" />
                  </SelectTrigger>
                  <SelectContent>
                    {LICENSE_TYPE_OPTIONS.map((option) => (
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
                  onValueChange={(value) => setValue('status', value as LicenseStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {LICENSE_STATUS_OPTIONS.map((option) => (
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

              <div>
                <Label htmlFor="vendor">Vendor</Label>
                <Input
                  id="vendor"
                  {...register('vendor')}
                  placeholder="Enter vendor name"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dates & Assignment */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Dates & Assignment</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  {...register('start_date')}
                  className={errors.start_date ? 'border-red-500' : ''}
                />
                {errors.start_date && (
                  <p className="text-sm text-red-500 mt-1">{errors.start_date.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  {...register('expiry_date')}
                />
              </div>

              <div>
                <Label htmlFor="renewal_date">Renewal Date</Label>
                <Input
                  id="renewal_date"
                  type="date"
                  {...register('renewal_date')}
                />
              </div>

              <div>
                <Label htmlFor="cost">Cost (£)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  {...register('cost', { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="site_id">Site</Label>
                <Select
                  value={watch('site_id') || 'none'}
                  onValueChange={(value) => setValue('site_id', value === 'none' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select site" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No site assigned</SelectItem>
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
                <Label htmlFor="inventory_item_id">Inventory Item</Label>
                <Select
                  value={watch('inventory_item_id') || 'none'}
                  onValueChange={(value) => setValue('inventory_item_id', value === 'none' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select inventory item" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No item assigned</SelectItem>
                    {inventoryItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        <div>
                          <div className="font-medium">{item.serial_number}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.model} - {item.inventory_type}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
          {isLoading ? 'Creating...' : 'Create License'}
        </Button>
      </div>
    </form>
  );
} 