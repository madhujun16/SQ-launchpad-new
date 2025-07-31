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
import { Badge } from '@/components/ui/badge';
import { Package, MapPin, ArrowRight, Calendar, User, Tag, Package2, Truck, CheckCircle } from 'lucide-react';
import type { DeployInventoryForm as DeployInventoryFormType, Site, InventoryItem } from '@/types/inventory';

const deploySchema = z.object({
  inventory_item_id: z.string().min(1, 'Inventory item is required'),
  to_site_id: z.string().min(1, 'Destination site is required'),
  quantity_per_counter: z.number().min(1, 'Quantity must be at least 1').optional(),
  melford_order_status: z.string().optional(),
  dispatch_date: z.string().optional(),
  delivery_date: z.string().optional(),
  installed_date: z.string().optional(),
  installer_name: z.string().optional(),
  asset_tag: z.string().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

interface DeployInventoryFormProps {
  inventoryItem?: InventoryItem | null;
  onSubmit: (data: DeployInventoryFormType) => void;
  isLoading?: boolean;
  sites: Site[];
}

export function DeployInventoryForm({
  inventoryItem,
  onSubmit,
  isLoading = false,
  sites,
}: DeployInventoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<DeployInventoryFormType>({
    resolver: zodResolver(deploySchema),
    defaultValues: {
      inventory_item_id: inventoryItem?.id || '',
    },
  });

  const watchedToSiteId = watch('to_site_id');
  const selectedSite = sites.find(site => site.id === watchedToSiteId);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Current Item Info */}
      {inventoryItem && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Item to Deploy
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{inventoryItem.serial_number}</p>
                  <p className="text-sm text-muted-foreground">{inventoryItem.model}</p>
                </div>
                <Badge variant="outline">{inventoryItem.inventory_type}</Badge>
              </div>
              
              {inventoryItem.site && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Currently at: {inventoryItem.site.name}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deployment Details */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Deployment Details
          </h3>
          <div className="space-y-4">
            {!inventoryItem && (
              <div>
                <Label htmlFor="inventory_item_id">Inventory Item *</Label>
                <Select
                  value={watch('inventory_item_id')}
                  onValueChange={(value) => setValue('inventory_item_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select inventory item" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* This would be populated with available inventory items */}
                    <SelectItem value="item1">SN001 - POS Machine</SelectItem>
                    <SelectItem value="item2">SN002 - PED Device</SelectItem>
                  </SelectContent>
                </Select>
                {errors.inventory_item_id && (
                  <p className="text-sm text-red-500 mt-1">{errors.inventory_item_id.message}</p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="to_site_id">Destination Site *</Label>
              <Select
                value={watch('to_site_id')}
                onValueChange={(value) => setValue('to_site_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select destination site" />
                </SelectTrigger>
                <SelectContent>
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
              {errors.to_site_id && (
                <p className="text-sm text-red-500 mt-1">{errors.to_site_id.message}</p>
              )}
            </div>

            {selectedSite && (
              <div className="p-4 bg-muted rounded-md">
                <h4 className="font-medium mb-2">Destination Site Details</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Name:</strong> {selectedSite.name}</p>
                  <p><strong>Food Court Unit:</strong> {selectedSite.food_court_unit}</p>
                  {selectedSite.sector && (
                    <p><strong>Sector:</strong> {selectedSite.sector.name}</p>
                  )}
                  {selectedSite.city && (
                    <p><strong>City:</strong> {selectedSite.city.name}</p>
                  )}
                  {selectedSite.address && (
                    <p><strong>Address:</strong> {selectedSite.address}</p>
                  )}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="reason">Reason for Deployment</Label>
              <Input
                id="reason"
                {...register('reason')}
                placeholder="e.g., New site setup, replacement, etc."
              />
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Any additional information about this deployment"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hardware Requirements & Deployment Details */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package2 className="h-5 w-5" />
            Hardware Requirements & Deployment Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity_per_counter">Quantity per Counter</Label>
              <Input
                id="quantity_per_counter"
                type="number"
                min="1"
                {...register('quantity_per_counter', { valueAsNumber: true })}
                placeholder="e.g., 2"
              />
              {errors.quantity_per_counter && (
                <p className="text-sm text-red-500 mt-1">{errors.quantity_per_counter.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="melford_order_status">Melford Order Status</Label>
              <Select
                value={watch('melford_order_status')}
                onValueChange={(value) => setValue('melford_order_status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select order status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="installed">Installed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="asset_tag">Asset Tag</Label>
              <Input
                id="asset_tag"
                {...register('asset_tag')}
                placeholder="e.g., AT-2024-001"
              />
            </div>

            <div>
              <Label htmlFor="installer_name">Installer Name</Label>
              <Input
                id="installer_name"
                {...register('installer_name')}
                placeholder="Name of the installer"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployment Timeline */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Deployment Timeline
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dispatch_date">Date of Dispatch</Label>
              <Input
                id="dispatch_date"
                type="date"
                {...register('dispatch_date')}
              />
            </div>

            <div>
              <Label htmlFor="delivery_date">Date of Delivery</Label>
              <Input
                id="delivery_date"
                type="date"
                {...register('delivery_date')}
              />
            </div>

            <div>
              <Label htmlFor="installed_date">Installed Date</Label>
              <Input
                id="installed_date"
                type="date"
                {...register('installed_date')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Deployment Confirmation
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Current Status:</span>
                  <Badge variant="outline">{inventoryItem?.status || 'Unknown'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>New Status:</span>
                  <Badge variant="default">Deployed</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Current Site:</span>
                  <span>{inventoryItem?.site?.name || 'Unassigned'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>New Site:</span>
                  <span>{selectedSite?.name || 'Not selected'}</span>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Hardware Type:</span>
                  <Badge variant="outline">{inventoryItem?.inventory_type || 'Unknown'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Serial Number:</span>
                  <span className="font-mono">{inventoryItem?.serial_number || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Asset Tag:</span>
                  <span>{watch('asset_tag') || 'Not assigned'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Installer:</span>
                  <span>{watch('installer_name') || 'Not assigned'}</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Deployment Timeline</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Dispatch:</span>
                  <div>{watch('dispatch_date') || 'Not set'}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Delivery:</span>
                  <div>{watch('delivery_date') || 'Not set'}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Installation:</span>
                  <div>{watch('installed_date') || 'Not set'}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !watchedToSiteId}>
          {isLoading ? 'Deploying...' : 'Deploy Item'}
        </Button>
      </div>
    </form>
  );
} 