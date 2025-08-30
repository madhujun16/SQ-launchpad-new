import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Database,
  Package,
  Home,
  ChevronRight,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Save,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getRoleConfig } from '@/lib/roles';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader } from '@/components/ui/loader';
import { Checkbox } from '@/components/ui/checkbox';

// Interfaces
interface SoftwareModule {
  id: string;
  name: string;
  description: string | null;
  category: string;
  is_active: boolean;
  monthly_fee: number | null;
  setup_fee: number | null;
  license_fee: number | null;
  created_at: string;
  updated_at: string;
}

interface HardwareItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  model: string | null;
  manufacturer: string | null;
  unit_cost: number | null;
  installation_cost: number | null;
  maintenance_cost: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function SoftwareHardwareManagement() {
  const { currentRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [softwareModules, setSoftwareModules] = useState<SoftwareModule[]>([]);
  const [hardwareItems, setHardwareItems] = useState<HardwareItem[]>([]);
  const [editingSoftwareModule, setEditingSoftwareModule] = useState<SoftwareModule | null>(null);
  const [editingHardwareItem, setEditingHardwareItem] = useState<HardwareItem | null>(null);

  const roleConfig = getRoleConfig(currentRole || 'admin');

  // Only allow admin access
  if (currentRole !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access Software & Hardware Management. Please contact an administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load software modules
      const { data: softwareData, error: softwareError } = await supabase
        .from('software_modules')
        .select('*');
      
      if (softwareError) {
        console.error('Error loading software modules:', softwareError);
        toast.error('Failed to load software modules');
        setSoftwareModules([]);
      } else {
        const mappedSoftware = (softwareData || []).map(software => ({
          ...software,
          monthly_fee: (software as any).monthly_fee || 0,
          setup_fee: (software as any).setup_fee || 0,
          license_fee: (software as any).license_fee || 0
        }));
        setSoftwareModules(mappedSoftware);
      }

      // Load hardware items
      const { data: hardwareData, error: hardwareError } = await supabase
        .from('hardware_items')
        .select('*');
      
      if (hardwareError) {
        console.error('Error loading hardware items:', hardwareError);
        toast.error('Failed to load hardware items');
        setHardwareItems([]);
      } else {
        const mappedHardware = (hardwareData || []).map(hardware => ({
          ...hardware,
          unit_cost: (hardware as any).unit_cost || (hardware as any).estimated_cost || 0,
          installation_cost: (hardware as any).installation_cost || 0,
          maintenance_cost: (hardware as any).maintenance_cost || 0
        }));
        setHardwareItems(mappedHardware);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const seedDefaultSoftware = () => {
    const defaultSoftware: SoftwareModule[] = [
      {
        id: '1',
        name: 'POS System',
        description: 'Point of Sale system for transactions',
        category: 'Payment Processing',
        is_active: true,
        monthly_fee: 25.00,
        setup_fee: 150.00,
        license_fee: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Kiosk Software',
        description: 'Self-service kiosk software',
        category: 'Self-Service',
        is_active: true,
        monthly_fee: 20.00,
        setup_fee: 100.00,
        license_fee: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    setSoftwareModules(defaultSoftware);
    toast.success('Default software modules seeded');
  };

  const seedDefaultHardware = () => {
    const defaultHardware: HardwareItem[] = [
      {
        id: '1',
        name: 'POS Terminal',
        description: 'Ingenico Telium 2 POS terminal',
        manufacturer: 'Ingenico',
        model: 'Telium 2',
        unit_cost: 2500.00,
        installation_cost: 150.00,
        maintenance_cost: 50.00,
        category: 'Payment Processing',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Thermal Printer',
        description: 'Receipt and kitchen order printer',
        manufacturer: 'Epson',
        model: 'TM-T88VI',
        unit_cost: 350.00,
        installation_cost: 75.00,
        maintenance_cost: 25.00,
        category: 'Printing',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    setHardwareItems(defaultHardware);
    toast.success('Default hardware items seeded');
  };

  const addSoftwareModule = () => {
    const newSoftware: SoftwareModule = {
      id: 'new',
      name: '',
      description: '',
      category: '',
      is_active: true,
      monthly_fee: 0,
      setup_fee: 0,
      license_fee: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setEditingSoftwareModule(newSoftware);
  };

  const editSoftwareModule = (software: SoftwareModule) => {
    setEditingSoftwareModule(software);
  };

  const saveSoftwareModule = async () => {
    if (!editingSoftwareModule) return;
    try {
      let saved: SoftwareModule | null = null;
      if (editingSoftwareModule.id && editingSoftwareModule.id !== 'new') {
        const { error } = await supabase.from('software_modules').update({
          name: editingSoftwareModule.name,
          description: editingSoftwareModule.description,
          category: editingSoftwareModule.category,
          is_active: editingSoftwareModule.is_active,
          monthly_fee: editingSoftwareModule.monthly_fee,
          setup_fee: editingSoftwareModule.setup_fee,
          license_fee: editingSoftwareModule.license_fee,
          updated_at: new Date().toISOString(),
        }).eq('id', editingSoftwareModule.id);
        if (error) throw error;
        setSoftwareModules(prev => prev.map(s => s.id === editingSoftwareModule.id ? editingSoftwareModule : s));
        saved = editingSoftwareModule;
      } else {
        const { data, error } = await supabase.from('software_modules').insert([{
          name: editingSoftwareModule.name,
          description: editingSoftwareModule.description,
          category: editingSoftwareModule.category,
          is_active: editingSoftwareModule.is_active,
          monthly_fee: editingSoftwareModule.monthly_fee,
          setup_fee: editingSoftwareModule.setup_fee,
          license_fee: editingSoftwareModule.license_fee,
        }]).select('*').single();
        if (error) throw error;
        const newEntry: SoftwareModule = {
          id: data.id,
          name: data.name,
          description: data.description,
          category: data.category,
          is_active: data.is_active,
          monthly_fee: (data as any).monthly_fee || 0,
          setup_fee: (data as any).setup_fee || 0,
          license_fee: (data as any).license_fee || 0,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
        setSoftwareModules(prev => [...prev, newEntry]);
        saved = newEntry;
      }
      setEditingSoftwareModule(null);
      toast.success('Software saved');
      return saved;
    } catch (e) {
      console.error(e);
      toast.error('Failed to save software');
    }
  };

  const deleteSoftwareModule = async (softwareId: string) => {
    try {
      const { error } = await supabase
        .from('software_modules')
        .delete()
        .eq('id', softwareId);
      
      if (error) {
        toast.error('Failed to delete software module');
      } else {
        setSoftwareModules(prev => prev.filter(s => s.id !== softwareId));
        toast.success('Software module deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting software module:', error);
      toast.error('Failed to delete software module');
    }
  };

  const addHardwareItem = () => {
    const newHardware: HardwareItem = {
      id: 'new',
      name: '',
      description: '',
      category: '',
      model: '',
      manufacturer: '',
      unit_cost: 0,
      installation_cost: 0,
      maintenance_cost: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setEditingHardwareItem(newHardware);
  };

  const editHardwareItem = (hardware: HardwareItem) => {
    setEditingHardwareItem(hardware);
  };

  const saveHardwareItem = async () => {
    if (!editingHardwareItem) return;
    try {
      let saved: HardwareItem | null = null;
      if (editingHardwareItem.id && editingHardwareItem.id !== 'new') {
        const { error } = await supabase.from('hardware_items').update({
          name: editingHardwareItem.name,
          description: editingHardwareItem.description,
          category: editingHardwareItem.category,
          model: editingHardwareItem.model,
          manufacturer: editingHardwareItem.manufacturer,
          unit_cost: editingHardwareItem.unit_cost,
          installation_cost: editingHardwareItem.installation_cost,
          maintenance_cost: editingHardwareItem.maintenance_cost,
          is_active: editingHardwareItem.is_active,
          updated_at: new Date().toISOString(),
        }).eq('id', editingHardwareItem.id);
        if (error) throw error;
        setHardwareItems(prev => prev.map(h => h.id === editingHardwareItem.id ? editingHardwareItem : h));
        saved = editingHardwareItem;
      } else {
        const { data, error } = await supabase.from('hardware_items').insert([{
          name: editingHardwareItem.name,
          description: editingHardwareItem.description,
          category: editingHardwareItem.category,
          model: editingHardwareItem.model,
          manufacturer: editingHardwareItem.manufacturer,
          unit_cost: editingHardwareItem.unit_cost,
          installation_cost: editingHardwareItem.installation_cost,
          maintenance_cost: editingHardwareItem.maintenance_cost,
          is_active: editingHardwareItem.is_active,
        }]).select('*').single();
        if (error) throw error;
        const newEntry: HardwareItem = {
          id: data.id,
          name: data.name,
          description: data.description,
          category: data.category,
          model: data.model,
          manufacturer: data.manufacturer,
          unit_cost: (data as any).unit_cost || data.estimated_cost,
          installation_cost: (data as any).installation_cost || 0,
          maintenance_cost: (data as any).maintenance_cost || 0,
          is_active: data.is_active,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
        setHardwareItems(prev => [...prev, newEntry]);
        saved = newEntry;
      }
      setEditingHardwareItem(null);
      toast.success('Hardware saved');
      return saved;
    } catch (e) {
      console.error(e);
      toast.error('Failed to save hardware');
    }
  };

  const deleteHardwareItem = async (hardwareId: string) => {
    try {
      const { error } = await supabase
        .from('hardware_items')
        .delete()
        .eq('id', hardwareId);
      
      if (error) {
        toast.error('Failed to delete hardware item');
      } else {
        setHardwareItems(prev => prev.filter(h => h.id !== hardwareId));
        toast.success('Hardware item deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting hardware item:', error);
      toast.error('Failed to delete hardware item');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader size="lg" />
            <p className="text-gray-600 mt-4">Loading software and hardware data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              className="ml-4" 
              onClick={() => {
                setError(null);
                loadData();
              }}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/dashboard" className="flex items-center space-x-1 hover:text-gray-900">
          <Home className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Software & Hardware</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Software & Hardware Management</h1>
          <p className="text-gray-600 mt-1">
            Unified management of software modules, hardware items, and their relationships
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <roleConfig.icon className="h-3 w-3" />
            <span>{roleConfig.displayName}</span>
          </Badge>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={seedDefaultSoftware}>
          Quick Add Default Software
        </Button>
        <Button variant="outline" onClick={seedDefaultHardware}>
          Quick Add Default Hardware
        </Button>
      </div>

      {/* Software Modules Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Software Modules ({softwareModules.length})</span>
          </CardTitle>
          <CardDescription>
            Manage software modules with pricing and licensing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Software Catalog</h3>
              <Button onClick={addSoftwareModule}>
                <Plus className="h-4 w-4 mr-2" />
                Add Software
              </Button>
            </div>
            
            <div className="space-y-3">
              {softwareModules.map(software => (
                <div key={software.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1 grid grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Name</Label>
                      <p className="text-sm text-gray-900">{software.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Category</Label>
                      <p className="text-sm text-gray-600">{software.category}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Monthly Fee</Label>
                      <p className="text-sm text-gray-600">£{software.monthly_fee || 0}/month</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Setup Fee</Label>
                      <p className="text-sm text-gray-600">£{software.setup_fee || 0}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => editSoftwareModule(software)}>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteSoftwareModule(software.id)}>
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hardware Items Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Hardware Items ({hardwareItems.length})</span>
          </CardTitle>
          <CardDescription>
            Manage hardware inventory with detailed costing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Hardware Catalog</h3>
              <Button onClick={addHardwareItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Hardware
              </Button>
            </div>
            
            <div className="space-y-3">
              {hardwareItems.map(hardware => (
                <div key={hardware.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1 grid grid-cols-6 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Name</Label>
                      <p className="text-sm text-gray-900">{hardware.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Category</Label>
                      <p className="text-sm text-gray-600">{hardware.category}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Unit Cost</Label>
                      <p className="text-sm text-gray-600">£{hardware.unit_cost || 0}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Installation</Label>
                      <p className="text-sm text-gray-600">£{hardware.installation_cost || 0}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Maintenance</Label>
                      <p className="text-sm text-gray-600">£{hardware.maintenance_cost || 0}/month</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <Badge variant={hardware.is_active ? "default" : "secondary"}>
                        {hardware.is_active ? 'Available' : 'Discontinued'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => editHardwareItem(hardware)}>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteHardwareItem(hardware.id)}>
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Software Module Dialog */}
      {editingSoftwareModule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-medium mb-4">
              {editingSoftwareModule.id === 'new' ? 'Add Software Module' : 'Edit Software Module'}
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="softName">Name</Label>
                <Input 
                  id="softName" 
                  value={editingSoftwareModule.name} 
                  onChange={(e) => setEditingSoftwareModule({...editingSoftwareModule!, name: e.target.value})} 
                />
              </div>
              <div>
                <Label htmlFor="softDesc">Description</Label>
                <Input 
                  id="softDesc" 
                  value={editingSoftwareModule.description || ''} 
                  onChange={(e) => setEditingSoftwareModule({...editingSoftwareModule!, description: e.target.value})} 
                />
              </div>
              <div>
                <Label htmlFor="softCat">Category</Label>
                <Input 
                  id="softCat" 
                  value={editingSoftwareModule.category} 
                  onChange={(e) => setEditingSoftwareModule({...editingSoftwareModule!, category: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="softMonthly">Monthly Fee (£)</Label>
                  <Input 
                    id="softMonthly" 
                    type="number" 
                    value={editingSoftwareModule.monthly_fee ?? 0} 
                    onChange={(e) => setEditingSoftwareModule({...editingSoftwareModule!, monthly_fee: Number(e.target.value)})} 
                  />
                </div>
                <div>
                  <Label htmlFor="softSetup">Setup Fee (£)</Label>
                  <Input 
                    id="softSetup" 
                    type="number" 
                    value={editingSoftwareModule.setup_fee ?? 0} 
                    onChange={(e) => setEditingSoftwareModule({...editingSoftwareModule!, setup_fee: Number(e.target.value)})} 
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="softActive" 
                  checked={editingSoftwareModule.is_active} 
                  onCheckedChange={(v) => setEditingSoftwareModule({...editingSoftwareModule!, is_active: Boolean(v)})} 
                />
                <Label htmlFor="softActive" className="text-sm">Active</Label>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setEditingSoftwareModule(null)}>Cancel</Button>
                <Button onClick={saveSoftwareModule}>Save</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Hardware Item Dialog */}
      {editingHardwareItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-medium mb-4">
              {editingHardwareItem.id === 'new' ? 'Add Hardware Item' : 'Edit Hardware Item'}
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="hardName">Name</Label>
                <Input 
                  id="hardName" 
                  value={editingHardwareItem.name} 
                  onChange={(e) => setEditingHardwareItem({...editingHardwareItem!, name: e.target.value})} 
                />
              </div>
              <div>
                <Label htmlFor="hardDesc">Description</Label>
                <Input 
                  id="hardDesc" 
                  value={editingHardwareItem.description || ''} 
                  onChange={(e) => setEditingHardwareItem({...editingHardwareItem!, description: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="hardCat">Category</Label>
                  <Input 
                    id="hardCat" 
                    value={editingHardwareItem.category} 
                    onChange={(e) => setEditingHardwareItem({...editingHardwareItem!, category: e.target.value})} 
                  />
                </div>
                <div>
                  <Label htmlFor="hardModel">Model</Label>
                  <Input 
                    id="hardModel" 
                    value={editingHardwareItem.model || ''} 
                    onChange={(e) => setEditingHardwareItem({...editingHardwareItem!, model: e.target.value})} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="hardUnit">Unit Cost (£)</Label>
                  <Input 
                    id="hardUnit" 
                    type="number" 
                    value={editingHardwareItem.unit_cost ?? 0} 
                    onChange={(e) => setEditingHardwareItem({...editingHardwareItem!, unit_cost: Number(e.target.value)})} 
                  />
                </div>
                <div>
                  <Label htmlFor="hardInst">Installation (£)</Label>
                  <Input 
                    id="hardInst" 
                    type="number" 
                    value={editingHardwareItem.installation_cost ?? 0} 
                    onChange={(e) => setEditingHardwareItem({...editingHardwareItem!, installation_cost: Number(e.target.value)})} 
                  />
                </div>
                <div>
                  <Label htmlFor="hardMaint">Maintenance (£/month)</Label>
                  <Input 
                    id="hardMaint" 
                    type="number" 
                    value={editingHardwareItem.maintenance_cost ?? 0} 
                    onChange={(e) => setEditingHardwareItem({...editingHardwareItem!, maintenance_cost: Number(e.target.value)})} 
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hardActive" 
                  checked={editingHardwareItem.is_active} 
                  onCheckedChange={(v) => setEditingHardwareItem({...editingHardwareItem!, is_active: Boolean(v)})} 
                />
                <Label htmlFor="hardActive" className="text-sm">Available</Label>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setEditingHardwareItem(null)}>Cancel</Button>
                <Button onClick={saveHardwareItem}>Save</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
