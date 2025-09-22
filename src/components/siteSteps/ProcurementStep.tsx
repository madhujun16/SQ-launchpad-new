import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Calendar,
  FileText,
  Wrench
} from 'lucide-react';
import { Site } from '@/types/siteTypes';
import { PlatformConfigService, HardwareItem } from '@/services/platformConfigService';
import { toast } from 'sonner';

interface ProcurementStepProps {
  site: Site;
  onSiteUpdate: (updatedSite: Site) => void;
}

interface ProcurementItem {
  id: string;
  name: string;
  category: string;
  type: 'hardware' | 'support';
  quantity: number;
  unitCost: number;
  totalCost: number;
  status: 'pending' | 'ordered' | 'delivered';
  orderDate?: string;
  deliveryDate?: string;
  notes?: string;
}

const ProcurementStep: React.FC<ProcurementStepProps> = ({ site, onSiteUpdate }) => {
  const [procurementStarted, setProcurementStarted] = useState(false);
  const [procurementStartDate, setProcurementStartDate] = useState('');
  const [procurementNote, setProcurementNote] = useState('Request Raised to Melford');
  const [procurementItems, setProcurementItems] = useState<ProcurementItem[]>([]);
  const [availableHardwareItems, setAvailableHardwareItems] = useState<HardwareItem[]>([]);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItem, setNewItem] = useState<Partial<ProcurementItem>>({});
  const [loading, setLoading] = useState(true);

  // Initialize procurement data
  useEffect(() => {
    if (site?.procurement) {
      setProcurementStarted(site.procurement.status !== 'pending');
      setProcurementStartDate(site.procurement.lastUpdated || '');
      // Convert procurement hardware items to ProcurementItem format
      const items: ProcurementItem[] = (site.procurement.hardwareItems || []).map((item, index) => ({
        id: item.name || `item-${index}`,
        name: item.name || 'Unknown Item',
        category: 'Hardware',
        type: 'hardware' as const,
        quantity: item.quantity || 1,
        unitCost: 0, // This should come from the hardware item
        totalCost: 0,
        status: item.status || 'pending',
        orderDate: item.orderDate,
        deliveryDate: item.deliveryDate,
        notes: item.trackingNumber
      }));
      setProcurementItems(items);
    } else if (site?.scoping?.selectedHardware) {
      // Initialize from scoping data
      const items: ProcurementItem[] = site.scoping.selectedHardware.map((item, index) => ({
        id: `item-${index}`,
        name: item.id, // This should be the hardware name
        category: 'Hardware', // This should come from the hardware item
        type: 'hardware' as const,
        quantity: item.quantity,
        unitCost: 0, // This should come from the hardware item
        totalCost: 0,
        status: 'pending' as const,
        notes: item.customizations
      }));
      setProcurementItems(items);
    }
  }, [site]);

  // Fetch available hardware items for adding new items
  useEffect(() => {
    const fetchHardwareItems = async () => {
      try {
        setLoading(true);
        const hardwareItems = await PlatformConfigService.getAllActiveHardwareItems();
        setAvailableHardwareItems(hardwareItems);
      } catch (error) {
        console.error('Error fetching hardware items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHardwareItems();
  }, []);

  // Group items by category
  const groupedItems = procurementItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ProcurementItem[]>);

  // Check if all items are delivered
  const allItemsDelivered = procurementItems.length > 0 && 
    procurementItems.every(item => item.status === 'delivered');

  // Handle procurement start
  const handleProcurementStart = () => {
    const updatedSite = {
      ...site,
      procurement: {
        ...site.procurement,
        status: 'ordered' as const,
        lastUpdated: new Date().toISOString(),
        hardwareItems: procurementItems,
        summary: {
          totalSoftwareModules: 0,
          totalHardwareItems: procurementItems.length,
          inProgress: procurementItems.filter(item => item.status === 'ordered').length,
          completed: procurementItems.filter(item => item.status === 'delivered').length
        }
      }
    };
    
    onSiteUpdate(updatedSite);
    setProcurementStarted(true);
    setProcurementStartDate(new Date().toISOString());
    toast.success('Procurement started successfully');
  };

  // Handle item status update
  const handleItemStatusUpdate = (itemId: string, status: 'pending' | 'ordered' | 'delivered') => {
    const updatedItems = procurementItems.map(item => 
      item.id === itemId ? { ...item, status } : item
    );
    
    setProcurementItems(updatedItems);
    
    const updatedSite = {
      ...site,
      procurement: {
        ...site.procurement,
        hardwareItems: updatedItems,
        summary: {
          totalSoftwareModules: 0,
          totalHardwareItems: updatedItems.length,
          inProgress: updatedItems.filter(item => item.status === 'ordered').length,
          completed: updatedItems.filter(item => item.status === 'delivered').length
        }
      }
    };
    
    onSiteUpdate(updatedSite);
    toast.success(`Item status updated to ${status}`);
  };

  // Handle add new item
  const handleAddItem = () => {
    if (!newItem.name || !newItem.quantity || !newItem.unitCost) {
      toast.error('Please fill in all required fields');
      return;
    }

    const totalCost = newItem.quantity! * newItem.unitCost!;
    
    // Check if approval required (> £2000)
    if (totalCost > 2000) {
      toast.warning('Approval required for items over £2000. Sending approval request to Ops Manager.');
      // TODO: Send approval request to assigned Ops Manager
    }

    const item: ProcurementItem = {
      id: `item-${Date.now()}`,
      name: newItem.name!,
      category: newItem.category || 'Hardware',
      type: newItem.type || 'hardware',
      quantity: newItem.quantity!,
      unitCost: newItem.unitCost!,
      totalCost,
      status: 'pending',
      notes: newItem.notes
    };

    const updatedItems = [...procurementItems, item];
    setProcurementItems(updatedItems);
    
    const updatedSite = {
      ...site,
      procurement: {
        ...site.procurement,
        hardwareItems: updatedItems,
        summary: {
          totalSoftwareModules: 0,
          totalHardwareItems: updatedItems.length,
          inProgress: updatedItems.filter(item => item.status === 'ordered').length,
          completed: updatedItems.filter(item => item.status === 'delivered').length
        }
      }
    };
    
    onSiteUpdate(updatedSite);
    setShowAddItemModal(false);
    setNewItem({});
    toast.success('Item added successfully');
  };

  // Handle mark complete
  const handleMarkComplete = () => {
    const updatedSite = {
      ...site,
      procurement: {
        ...site.procurement,
        status: 'delivered' as const,
        lastUpdated: new Date().toISOString(),
        hardwareItems: procurementItems,
        summary: {
          totalSoftwareModules: 0,
          totalHardwareItems: procurementItems.length,
          inProgress: 0,
          completed: procurementItems.length
        }
      }
    };
    
    onSiteUpdate(updatedSite);
    toast.success('Procurement marked as complete');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'ordered': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'ordered': return <Clock className="h-4 w-4" />;
      case 'pending': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-3 text-gray-600">Loading procurement data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Procurement</h2>
          <p className="text-gray-600 mt-1">Track equipment and materials acquisition</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showAddItemModal} onOpenChange={setShowAddItemModal}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Procurement Item</DialogTitle>
                <DialogDescription>
                  Add hardware or support items to the procurement list
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="item-type">Item Type</Label>
                    <Select 
                      value={newItem.type} 
                      onValueChange={(value) => setNewItem({...newItem, type: value as 'hardware' | 'support'})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hardware">Hardware</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="item-category">Category</Label>
                    <Select 
                      value={newItem.category} 
                      onValueChange={(value) => setNewItem({...newItem, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hardware">Hardware</SelectItem>
                        <SelectItem value="Support">Support</SelectItem>
                        <SelectItem value="Cabling">Cabling</SelectItem>
                        <SelectItem value="Networking">Networking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="item-name">Item Name</Label>
                  <Input
                    id="item-name"
                    value={newItem.name || ''}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    placeholder="Enter item name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newItem.quantity || ''}
                      onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                      placeholder="Enter quantity"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit-cost">Unit Cost (£)</Label>
                    <Input
                      id="unit-cost"
                      type="number"
                      value={newItem.unitCost || ''}
                      onChange={(e) => setNewItem({...newItem, unitCost: parseFloat(e.target.value)})}
                      placeholder="Enter unit cost"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newItem.notes || ''}
                    onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                    placeholder="Additional notes (optional)"
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddItemModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddItem}>
                    Add Item
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {allItemsDelivered && (
            <Button size="sm" onClick={handleMarkComplete}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark Complete
            </Button>
          )}
        </div>
      </div>

      {/* Procurement Start Section */}
      {!procurementStarted ? (
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5 text-blue-600" />
              Start Procurement
            </CardTitle>
            <CardDescription>
              Begin the procurement process for approved items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="start-date">Procurement Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={procurementStartDate}
                  onChange={(e) => setProcurementStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="procurement-note">Notes</Label>
                <Textarea
                  id="procurement-note"
                  value={procurementNote}
                  onChange={(e) => setProcurementNote(e.target.value)}
                  placeholder="Add procurement notes"
                />
              </div>
              <Button onClick={handleProcurementStart} className="w-full">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Start Procurement
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5 text-green-600" />
              Procurement Status
            </CardTitle>
            <CardDescription>
              Procurement started on {new Date(procurementStartDate).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Note:</strong> {procurementNote}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hardware Items by Category */}
      {procurementItems.length > 0 && (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, items]) => (
            <Card key={category} className="shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5 text-blue-600" />
                  {category}
                </CardTitle>
                <CardDescription>
                  {items.length} item{items.length !== 1 ? 's' : ''} in this category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity} | Cost: £{item.totalCost.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(item.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(item.status)}
                              <span>{item.status}</span>
                            </div>
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <Button
                          size="sm"
                          variant={item.status === 'pending' ? 'default' : 'outline'}
                          onClick={() => handleItemStatusUpdate(item.id, 'pending')}
                        >
                          Pending
                        </Button>
                        <Button
                          size="sm"
                          variant={item.status === 'ordered' ? 'default' : 'outline'}
                          onClick={() => handleItemStatusUpdate(item.id, 'ordered')}
                        >
                          Ordered
                        </Button>
                        <Button
                          size="sm"
                          variant={item.status === 'delivered' ? 'default' : 'outline'}
                          onClick={() => handleItemStatusUpdate(item.id, 'delivered')}
                        >
                          Delivered
                        </Button>
                      </div>
                      
                      {item.type === 'support' && item.status === 'delivered' && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-800 font-medium">
                              Support item completed
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {item.notes && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <strong>Notes:</strong> {item.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {procurementItems.length === 0 && (
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="py-12">
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Items Added</h3>
              <p className="text-gray-600 mb-4">
                Start by adding hardware and support items to track procurement
              </p>
              <Button onClick={() => setShowAddItemModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Item
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProcurementStep;