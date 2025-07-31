import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, MapPin, User, Calendar, Wrench, Edit, Trash2, Activity, Shield, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { InventoryItem, INVENTORY_STATUS_OPTIONS, INVENTORY_TYPE_OPTIONS, GROUP_TYPE_OPTIONS } from '@/types/inventory';

interface InventoryItemDetailsProps {
  item: InventoryItem;
  onClose: () => void;
  onStatusChange: (itemId: string, newStatus: string) => void;
}

export function InventoryItemDetails({
  item,
  onClose,
  onStatusChange,
}: InventoryItemDetailsProps) {
  const getStatusColor = (status: string) => {
    const statusOption = INVENTORY_STATUS_OPTIONS.find(option => option.value === status);
    return statusOption?.color || 'gray';
  };

  const getStatusLabel = (status: string) => {
    const statusOption = INVENTORY_STATUS_OPTIONS.find(option => option.value === status);
    return statusOption?.label || status;
  };

  const getGroupTypeLabel = (groupType: string) => {
    const groupOption = GROUP_TYPE_OPTIONS.find(option => option.value === groupType);
    return groupOption?.label || groupType;
  };

  const getInventoryTypeLabel = (type: string) => {
    const typeOption = INVENTORY_TYPE_OPTIONS.find(option => option.value === type);
    return typeOption?.label || type;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Inventory Item Details
          </h2>
          <p className="text-slate-600 mt-1">Serial: {item.serial_number}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="shadow-sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="shadow-sm hover:bg-red-50 hover:text-red-600">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Activity className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="deployment" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <MapPin className="h-4 w-4 mr-2" />
            Deployment History
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Wrench className="h-4 w-4 mr-2" />
            Maintenance Log
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Serial Number</label>
                    <p className="font-mono text-lg font-semibold">{item.serial_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Model</label>
                    <p className="text-lg font-semibold">{item.model}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Manufacturer</label>
                    <p className="text-lg">{item.manufacturer || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Inventory Type</label>
                    <Badge variant="outline" className="font-medium">
                      {getInventoryTypeLabel(item.inventory_type)}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Group Type</label>
                    <Badge variant="secondary" className="font-medium">
                      {getGroupTypeLabel(item.group_type)}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Status</label>
                    <Badge 
                      variant={getStatusColor(item.status) as any}
                      className="font-medium"
                    >
                      {getStatusLabel(item.status)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location & Assignment */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-green-600" />
                  Location & Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Current Site</label>
                  <p className="text-lg font-semibold">{item.site?.name || 'Unassigned'}</p>
                  {item.site && (
                    <p className="text-sm text-slate-500">{item.site.food_court_unit}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">Assigned To</label>
                  <p className="text-lg">{item.assigned_to_profile?.full_name || 'Not assigned'}</p>
                </div>

                {item.site?.address && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Address</label>
                    <p className="text-sm text-slate-600">{item.site.address}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dates & Warranty */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Dates & Warranty
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Purchase Date</label>
                    <p className="text-lg">{formatDate(item.purchase_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Warranty Expiry</label>
                    <p className="text-lg">{formatDate(item.warranty_expiry)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Last Maintenance</label>
                    <p className="text-lg">{formatDate(item.last_maintenance_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Next Maintenance</label>
                    <p className="text-lg">{formatDate(item.next_maintenance_date)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="h-5 w-5 text-orange-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-sm"
                  onClick={() => {/* Handle deploy */}}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Deploy to Site
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full shadow-sm hover:shadow-md transition-shadow"
                  onClick={() => {/* Handle maintenance */}}
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  Log Maintenance
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full shadow-sm hover:shadow-md transition-shadow"
                  onClick={() => {/* Handle edit */}}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Details
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Notes Section */}
          {item.notes && (
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">{item.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Deployment History Tab */}
        <TabsContent value="deployment" className="space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-blue-600" />
                Deployment History
              </CardTitle>
              <CardDescription>Track all deployments for this item</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-slate-500">
                <MapPin className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">No Deployment History</h3>
                <p className="text-sm">Deployment history will be displayed here when available</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Log Tab */}
        <TabsContent value="maintenance" className="space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wrench className="h-5 w-5 text-yellow-600" />
                Maintenance Log
              </CardTitle>
              <CardDescription>Track all maintenance activities for this item</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-slate-500">
                <Wrench className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">No Maintenance Log</h3>
                <p className="text-sm">Maintenance logs will be displayed here when available</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 