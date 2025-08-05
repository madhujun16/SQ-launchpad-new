import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, MapPin, User, Calendar } from 'lucide-react';

interface SimpleInventoryItemDetailsProps {
  item?: any;
}

export const SimpleInventoryItemDetails: React.FC<SimpleInventoryItemDetailsProps> = ({ item }) => {
  if (!item) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Select an item to view details</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            {item.model || 'Unknown Model'}
          </CardTitle>
          <Badge variant="outline">
            {item.status || 'Unknown'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Serial Number</p>
            <p>{item.serial_number || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Type</p>
            <p className="capitalize">{item.inventory_type || 'N/A'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{item.site?.name || 'No site assigned'}</span>
        </div>

        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{item.assigned_user?.full_name || 'Unassigned'}</span>
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            Added {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Unknown'}
          </span>
        </div>

        <div className="pt-4">
          <Button className="w-full" variant="gradient">Edit Item</Button>
        </div>
      </CardContent>
    </Card>
  );
};