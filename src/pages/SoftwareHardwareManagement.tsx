import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  Search,
  Link,
  Unlink,
  Settings
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getRoleConfig } from '@/lib/roles';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PageLoader } from '@/components/ui/loader';

// Hardware category enum values
const HARDWARE_CATEGORIES = [
  { value: 'Kiosk', label: 'Kiosk' },
  { value: 'Kitchen Display System (KDS)', label: 'Kitchen Display System (KDS)' },
  { value: 'Customer Display Screen (TDS)', label: 'Customer Display Screen (TDS)' },
  { value: 'POS Terminal', label: 'POS Terminal' },
  { value: 'ORT Tablet', label: 'ORT Tablet' },
  { value: 'Accessories', label: 'Accessories' },
  { value: 'Support & Sundries', label: 'Support & Sundries' },
  { value: 'Connectivity', label: 'Connectivity' },
  { value: 'Deployment', label: 'Deployment' },
  { value: 'License Fees', label: 'License Fees' }
] as const;

const HARDWARE_SUBCATEGORIES = [
  { value: 'Wall Mounted', label: 'Wall Mounted' },
  { value: 'Floor Mounted', label: 'Floor Mounted' },
  { value: 'Desk Mounted', label: 'Desk Mounted' },
  { value: 'Free Standing', label: 'Free Standing' },
  { value: 'Fixed', label: 'Fixed' },
  { value: 'Remote Support', label: 'Remote Support' },
  { value: 'On-site Support', label: 'On-site Support' },
  { value: 'Other', label: 'Other' }
] as const;

const SUPPORT_TYPES = [
  { value: 'None', label: 'None' },
  { value: 'On-site', label: 'On-site' },
  { value: 'Remote', label: 'Remote' }
] as const;
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

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
  hardware_name: string;
  category: string;
  subcategory?: string | null;
  manufacturer?: string | null;
  configuration_notes?: string | null;
  unit_cost?: number | null;
  quantity?: number | null;
  total_cost?: number | null;
  support_type?: string | null;
  support_cost?: number | null;
  is_active?: boolean | null;
  created_at: string;
  updated_at: string;
}

interface SoftwareHardwareMapping {
  id: string;
  software_module_id: string;
  hardware_item_id: string;
  is_required: boolean;
  quantity: number;
  created_at: string;
  software_module?: SoftwareModule;
  hardware_item?: HardwareItem;
}

interface MappingItem {
  hardware_item_id: string;
  quantity: number;
  is_required: boolean;
}

export default function SoftwareHardwareManagement() {
  const { currentRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [softwareModules, setSoftwareModules] = useState<SoftwareModule[]>([]);
  const [hardwareItems, setHardwareItems] = useState<HardwareItem[]>([]);
  const [mappings, setMappings] = useState<SoftwareHardwareMapping[]>([]);
  const [editingSoftwareModule, setEditingSoftwareModule] = useState<SoftwareModule | null>(null);
  const [editingHardwareItem, setEditingHardwareItem] = useState<HardwareItem | null>(null);
  const [editingMapping, setEditingMapping] = useState<SoftwareHardwareMapping | null>(null);
  const [editingMappingItems, setEditingMappingItems] = useState<MappingItem[]>([]);
  const [selectedSoftwareModule, setSelectedSoftwareModule] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'software' | 'hardware' | 'mapping'>('software');

  const roleConfig = getRoleConfig(currentRole || 'admin');

  // Only allow admin access
  if (currentRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access Software & Hardware Management. Please contact an administrator.
          </AlertDescription>
        </Alert>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Only load if we have a current role (auth is ready)
    if (!currentRole) {
      console.log('SoftwareHardwareManagement: Waiting for auth state...', { currentRole });
      return;
    }

    console.log('SoftwareHardwareManagement: Auth ready, loading data...', { currentRole });

    loadData();
  }, [currentRole]); // Add currentRole as dependency

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load software modules
      const { data: softwareData, error: softwareError } = await supabase
        .from('software_modules')
        .select('*')
        .order('name');
      
      if (softwareError) {
        console.error('Error loading software modules:', softwareError);
        toast.error('Failed to load software modules');
        setSoftwareModules([]);
      } else {
        setSoftwareModules(softwareData || []);
      }

      // Load hardware items
      const { data: hardwareData, error: hardwareError } = await supabase
        .from('hardware_items')
        .select('*')
        .order('name');
      
      if (hardwareError) {
        console.error('Error loading hardware items:', hardwareError);
        toast.error('Failed to load hardware items');
        setHardwareItems([]);
      } else {
        setHardwareItems(hardwareData || []);
      }

      // Load mappings with joined data
      const { data: mappingData, error: mappingError } = await supabase
        .from('software_hardware_mapping')
        .select(`
          *,
          software_module:software_modules(*),
          hardware_item:hardware_items(*)
        `)
        .order('created_at', { ascending: false });
      
      if (mappingError) {
        console.error('Error loading mappings:', mappingError);
        toast.error('Failed to load software-hardware mappings');
        setMappings([]);
      } else {
        setMappings(mappingData || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
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
    
    setSaving(true);
    try {
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
        toast.success('Software module updated successfully');
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
        setSoftwareModules(prev => [...prev, data]);
        toast.success('Software module created successfully');
      }
      
      setEditingSoftwareModule(null);
      await loadData(); // Reload to get fresh data
    } catch (error) {
      console.error('Error saving software module:', error);
      toast.error('Failed to save software module');
    } finally {
      setSaving(false);
    }
  };

  const deleteSoftwareModule = async (softwareId: string) => {
    if (!confirm('Are you sure you want to delete this software module? This will also remove all associated mappings.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('software_modules')
        .delete()
        .eq('id', softwareId);
      
      if (error) {
        console.error('Error deleting software module:', error);
        toast.error('Failed to delete software module');
      } else {
        setSoftwareModules(prev => prev.filter(s => s.id !== softwareId));
        toast.success('Software module deleted successfully');
        await loadData(); // Reload to update mappings
      }
    } catch (error) {
      console.error('Error deleting software module:', error);
      toast.error('Failed to delete software module');
    }
  };

  const addHardwareItem = () => {
    const newHardware: HardwareItem = {
      id: 'new',
      hardware_name: '',
      category: '',
      subcategory: '',
      manufacturer: '',
      configuration_notes: '',
      unit_cost: 0,
      quantity: 1,
      total_cost: 0,
      support_type: 'None',
      support_cost: 0,
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
    
    setSaving(true);
    try {
      if (editingHardwareItem.id && editingHardwareItem.id !== 'new') {
        const { error } = await supabase.from('hardware_items').update({
          hardware_name: editingHardwareItem.hardware_name,
          category: editingHardwareItem.category,
          subcategory: editingHardwareItem.subcategory,
          manufacturer: editingHardwareItem.manufacturer,
          configuration_notes: editingHardwareItem.configuration_notes,
          unit_cost: editingHardwareItem.unit_cost,
          quantity: editingHardwareItem.quantity,
          total_cost: editingHardwareItem.total_cost,
          support_type: editingHardwareItem.support_type,
          support_cost: editingHardwareItem.support_cost,
          is_active: editingHardwareItem.is_active,
          updated_at: new Date().toISOString(),
        }).eq('id', editingHardwareItem.id);
        
        if (error) throw error;
        setHardwareItems(prev => prev.map(h => h.id === editingHardwareItem.id ? editingHardwareItem : h));
        toast.success('Hardware item updated successfully');
      } else {
        const { data, error } = await supabase.from('hardware_items').insert([{
          hardware_name: editingHardwareItem.hardware_name,
          category: editingHardwareItem.category,
          subcategory: editingHardwareItem.subcategory,
          manufacturer: editingHardwareItem.manufacturer,
          configuration_notes: editingHardwareItem.configuration_notes,
          unit_cost: editingHardwareItem.unit_cost,
          quantity: editingHardwareItem.quantity,
          total_cost: editingHardwareItem.total_cost,
          support_type: editingHardwareItem.support_type,
          support_cost: editingHardwareItem.support_cost,
          is_active: editingHardwareItem.is_active,
        }]).select('*').single();
        
        if (error) throw error;
        setHardwareItems(prev => [...prev, data]);
        toast.success('Hardware item created successfully');
      }
      
      setEditingHardwareItem(null);
      await loadData(); // Reload to get fresh data
    } catch (error) {
      console.error('Error saving hardware item:', error);
      toast.error('Failed to save hardware item');
    } finally {
      setSaving(false);
    }
  };

  const deleteHardwareItem = async (hardwareId: string) => {
    if (!confirm('Are you sure you want to delete this hardware item? This will also remove all associated mappings.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('hardware_items')
        .delete()
        .eq('id', hardwareId);
      
      if (error) {
        console.error('Error deleting hardware item:', error);
        toast.error('Failed to delete hardware item');
      } else {
        setHardwareItems(prev => prev.filter(h => h.id !== hardwareId));
        toast.success('Hardware item deleted successfully');
        await loadData(); // Reload to update mappings
      }
    } catch (error) {
      console.error('Error deleting hardware item:', error);
      toast.error('Failed to delete hardware item');
    }
  };

  const addMapping = () => {
    setSelectedSoftwareModule('');
    setEditingMappingItems([]);
    setEditingMapping({} as SoftwareHardwareMapping); // Just to trigger modal
  };

  const editMapping = (mapping: SoftwareHardwareMapping) => {
    setEditingMapping(mapping);
  };

  const saveMapping = async () => {
    if (!selectedSoftwareModule || editingMappingItems.length === 0) {
      toast.error('Please select a software module and at least one hardware item');
      return;
    }
    
    setSaving(true);
    try {
      // Check for existing mappings to avoid duplicates
      const existingMappings = mappings.filter(m => m.software_module_id === selectedSoftwareModule);
      const existingHardwareIds = new Set(existingMappings.map(m => m.hardware_item_id));
      
      // Filter out hardware items that already have mappings and placeholder values
      const newMappingsToInsert = editingMappingItems.filter(item => 
        item.hardware_item_id && 
        item.hardware_item_id !== 'placeholder' &&
        !existingHardwareIds.has(item.hardware_item_id)
      );
      
      const duplicateItems = editingMappingItems.filter(item => 
        existingHardwareIds.has(item.hardware_item_id)
      );
      
      if (newMappingsToInsert.length === 0) {
        toast.error('All selected hardware items already have mappings for this software module');
        return;
      }
      
      if (duplicateItems.length > 0) {
        const duplicateNames = duplicateItems.map(item => {
          const hardware = hardwareItems.find(h => h.id === item.hardware_item_id);
          return hardware?.name || 'Unknown Hardware';
        }).join(', ');
        
        toast.warning(`Skipped ${duplicateItems.length} duplicate mapping(s): ${duplicateNames}`);
      }

      // Create mappings for new hardware items only
      const mappingsToInsert = newMappingsToInsert.map(item => ({
        software_module_id: selectedSoftwareModule,
        hardware_item_id: item.hardware_item_id,
        is_required: item.is_required,
        quantity: item.quantity,
      }));

      const { data, error } = await supabase
        .from('software_hardware_mapping')
        .insert(mappingsToInsert)
        .select('*');
      
      if (error) throw error;
      
      const successMessage = `Created ${newMappingsToInsert.length} mapping(s) successfully`;
      if (duplicateItems.length > 0) {
        toast.success(`${successMessage} (${duplicateItems.length} skipped as duplicates)`);
      } else {
        toast.success(successMessage);
      }
      
      setEditingMapping(null);
      setSelectedSoftwareModule('');
      setEditingMappingItems([]);
      await loadData(); // Reload to get fresh data with joined info
    } catch (error) {
      console.error('Error saving mappings:', error);
      toast.error('Failed to save mappings');
    } finally {
      setSaving(false);
    }
  };

  const deleteMapping = async (mappingId: string) => {
    if (!confirm('Are you sure you want to delete this mapping?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('software_hardware_mapping')
        .delete()
        .eq('id', mappingId);
      
      if (error) {
        console.error('Error deleting mapping:', error);
        toast.error('Failed to delete mapping');
      } else {
        setMappings(prev => prev.filter(m => m.id !== mappingId));
        toast.success('Mapping deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting mapping:', error);
      toast.error('Failed to delete mapping');
    }
  };

  // Helper functions for managing mapping items
  const addMappingItem = () => {
    setEditingMappingItems(prev => [...prev, {
      hardware_item_id: 'placeholder', // Use a placeholder value instead of empty string
      quantity: 1,
      is_required: false
    }]);
  };

  const updateMappingItem = (index: number, field: keyof MappingItem, value: any) => {
    setEditingMappingItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const removeMappingItem = (index: number) => {
    setEditingMappingItems(prev => prev.filter((_, i) => i !== index));
  };

  // Filter and paginate data based on active tab
  const { filteredData, totalPages, currentData } = useMemo(() => {
    let filtered: any[] = [];
    
    if (activeTab === 'software') {
      filtered = softwareModules;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(item =>
          item.name.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower) ||
          item.category.toLowerCase().includes(searchLower)
        );
      }
      if (categoryFilter !== 'all') {
        filtered = filtered.filter(item => item.category === categoryFilter);
      }
    } else if (activeTab === 'hardware') {
      filtered = hardwareItems;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(item =>
          item.name.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower) ||
          item.category.toLowerCase().includes(searchLower) ||
          item.manufacturer?.toLowerCase().includes(searchLower)
        );
      }
      if (categoryFilter !== 'all') {
        filtered = filtered.filter(item => item.category === categoryFilter);
      }
    } else if (activeTab === 'mapping') {
      filtered = mappings;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(item =>
          item.software_module?.name.toLowerCase().includes(searchLower) ||
          item.hardware_item?.name.toLowerCase().includes(searchLower)
        );
      }
    }

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filtered.slice(startIndex, endIndex);

    return { filteredData: filtered, totalPages, currentData };
  }, [softwareModules, hardwareItems, mappings, searchTerm, categoryFilter, currentPage, itemsPerPage, activeTab]);

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Get unique categories for filter
  const categories = useMemo(() => {
    const allCategories = new Set<string>();
    if (activeTab === 'software') {
      softwareModules.forEach(item => allCategories.add(item.category));
    } else if (activeTab === 'hardware') {
      hardwareItems.forEach(item => allCategories.add(item.category));
    }
    return Array.from(allCategories).sort();
  }, [softwareModules, hardwareItems, activeTab]);

  // Get existing mappings for the selected software module
  const existingMappingsForSelectedSoftware = useMemo(() => {
    if (!selectedSoftwareModule) return [];
    return mappings.filter(m => m.software_module_id === selectedSoftwareModule);
  }, [mappings, selectedSoftwareModule]);

  // Get hardware items that are already mapped to the selected software
  const alreadyMappedHardwareIds = useMemo(() => {
    return new Set(existingMappingsForSelectedSoftware.map(m => m.hardware_item_id));
  }, [existingMappingsForSelectedSoftware]);

  // Show loading state
  if (loading) {
    return <PageLoader />;
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => {
                setError(null);
                loadData();
          }}>
            Try Again
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
      {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <RouterLink to="/dashboard" className="flex items-center space-x-1 hover:text-gray-900">
          <Home className="h-4 w-4" />
          <span>Dashboard</span>
          </RouterLink>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Software & Hardware</span>
      </nav>

        {/* Header with Action Buttons */}
        <div className="mb-6 flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Software & Hardware Management</h1>
            <p className="text-gray-600">
              Unified management of software modules, hardware items, and their relationships.
          </p>
        </div>
          <div className="flex items-center space-x-3">
            {activeTab === 'software' && (
              <Button 
                onClick={addSoftwareModule} 
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg text-lg"
              >
                <Plus className="h-5 w-5 mr-3" />
                Add Software
              </Button>
            )}
            {activeTab === 'hardware' && (
              <Button 
                onClick={addHardwareItem} 
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg text-lg"
              >
                <Plus className="h-5 w-5 mr-3" />
                Add Hardware
              </Button>
            )}
            {activeTab === 'mapping' && (
              <Button 
                onClick={addMapping} 
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg text-lg"
              >
                <Link className="h-5 w-5 mr-3" />
                Add Mapping
              </Button>
            )}
        </div>
      </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white p-1 rounded-lg border">
            <Button
              variant={activeTab === 'software' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('software')}
              className="flex-1"
            >
              <Package className="h-4 w-4 mr-2" />
              Software Modules ({softwareModules.length})
        </Button>
            <Button
              variant={activeTab === 'hardware' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('hardware')}
              className="flex-1"
            >
              <Database className="h-4 w-4 mr-2" />
              Hardware Items ({hardwareItems.length})
            </Button>
            <Button
              variant={activeTab === 'mapping' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('mapping')}
              className="flex-1"
            >
              <Link className="h-4 w-4 mr-2" />
              Mappings ({mappings.length})
        </Button>
          </div>
      </div>

        {/* Search and Filters */}
        <div className="mb-4">
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
            {/* Search Bar */}
            <div className="flex-1 lg:flex-none lg:w-80">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={`Search ${activeTab === 'software' ? 'software' : activeTab === 'hardware' ? 'hardware' : 'mappings'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
            
            {/* Category Filter (only for software and hardware) */}
            {activeTab !== 'mapping' && (
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.filter(category => category && category.trim() !== '').map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {/* Clear Filters Button */}
            <Button variant="outline" onClick={clearFilters} className="w-full lg:w-auto">
              Clear Filters
            </Button>
                    </div>
                    </div>

        {/* Data Table */}
        <Card className="mt-2">
          <CardContent className="p-0">
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    {activeTab === 'software' && (
                      <>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Monthly Fee</TableHead>
                        <TableHead>Setup Fee</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </>
                    )}
                    {activeTab === 'hardware' && (
                      <>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Manufacturer</TableHead>
                        <TableHead>Unit Cost</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </>
                    )}
                    {activeTab === 'mapping' && (
                      <>
                        <TableHead>Software</TableHead>
                        <TableHead>Hardware</TableHead>
                        <TableHead>Required</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={activeTab === 'mapping' ? 5 : 6} className="text-center py-12">
                        {activeTab === 'software' && <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />}
                        {activeTab === 'hardware' && <Database className="h-12 w-12 mx-auto mb-3 text-gray-300" />}
                        {activeTab === 'mapping' && <Link className="h-12 w-12 mx-auto mb-3 text-gray-300" />}
                        <p className="text-sm text-gray-500">No {activeTab === 'software' ? 'software modules' : activeTab === 'hardware' ? 'hardware items' : 'mappings'} found</p>
                        <p className="text-xs text-gray-400">Create your first {activeTab === 'software' ? 'software module' : activeTab === 'hardware' ? 'hardware item' : 'mapping'} to get started</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentData.map((item: any) => (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        {activeTab === 'software' && (
                          <>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <Package className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                                  <div className="font-medium">{item.name}</div>
                                  {item.description && (
                                    <div className="text-sm text-gray-500">{item.description}</div>
                                  )}
                    </div>
                  </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.category}</Badge>
                            </TableCell>
                            <TableCell>£{item.monthly_fee || 0}/month</TableCell>
                            <TableCell>£{item.setup_fee || 0}</TableCell>
                            <TableCell>
                              <Badge variant={item.is_active ? "default" : "secondary"}>
                                {item.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => editSoftwareModule(item)}
                                  className="h-8 w-8 p-0 hover:bg-green-50"
                                  title="Edit Software"
                                >
                                  <Edit className="h-4 w-4 text-green-600" />
                    </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteSoftwareModule(item.id)}
                                  className="h-8 w-8 p-0 hover:bg-red-50"
                                  title="Delete Software"
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                            </TableCell>
                          </>
                        )}
                        {activeTab === 'hardware' && (
                          <>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                  <Database className="h-4 w-4 text-purple-600" />
                </div>
                                <div>
                                  <div className="font-medium">{item.name}</div>
                                  {item.description && (
                                    <div className="text-sm text-gray-500">{item.description}</div>
                                  )}
            </div>
          </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.category}</Badge>
                            </TableCell>
                            <TableCell>{item.manufacturer || 'N/A'}</TableCell>
                            <TableCell>£{item.unit_cost || 0}</TableCell>
                            <TableCell>
                              <Badge variant={item.is_active ? "default" : "secondary"}>
                                {item.is_active ? 'Available' : 'Discontinued'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => editHardwareItem(item)}
                                  className="h-8 w-8 p-0 hover:bg-green-50"
                                  title="Edit Hardware"
                                >
                                  <Edit className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteHardwareItem(item.id)}
                                  className="h-8 w-8 p-0 hover:bg-red-50"
                                  title="Delete Hardware"
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
                            </TableCell>
                          </>
                        )}
                        {activeTab === 'mapping' && (
                          <>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <Package className="h-4 w-4 text-blue-600" />
                    </div>
                                <span>{item.software_module?.name || 'Unknown Software'}</span>
                    </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                  <Database className="h-4 w-4 text-purple-600" />
                    </div>
                                <span>{item.hardware_item?.name || 'Unknown Hardware'}</span>
                    </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={item.is_required ? "default" : "outline"}>
                                {item.is_required ? 'Required' : 'Optional'}
                      </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{item.quantity}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => editMapping(item)}
                                  className="h-8 w-8 p-0 hover:bg-green-50"
                                  title="Edit Mapping"
                                >
                                  <Edit className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteMapping(item.id)}
                                  className="h-8 w-8 p-0 hover:bg-red-50"
                                  title="Delete Mapping"
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                    </div>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
                  </div>
          </CardContent>
        </Card>

        {/* Summary and Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} {activeTab === 'software' ? 'software modules' : activeTab === 'hardware' ? 'hardware items' : 'mappings'}
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
                    </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                    </Button>
                ))}
                  </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
                </div>
          )}
            </div>
          </div>

      {/* Edit Software Module Dialog */}
      {editingSoftwareModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
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
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setEditingSoftwareModule(null)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={saveSoftwareModule}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Hardware Item Dialog */}
      {editingHardwareItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              {editingHardwareItem.id === 'new' ? 'Add Hardware Item' : 'Edit Hardware Item'}
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="hardwareName">Hardware Name</Label>
                <Input 
                  id="hardwareName" 
                  value={editingHardwareItem.hardware_name} 
                  onChange={(e) => setEditingHardwareItem({...editingHardwareItem!, hardware_name: e.target.value})} 
                />
              </div>
              <div>
                <Label htmlFor="configurationNotes">Configuration Notes</Label>
                <Textarea 
                  id="configurationNotes" 
                  value={editingHardwareItem.configuration_notes || ''} 
                  onChange={(e) => setEditingHardwareItem({...editingHardwareItem!, configuration_notes: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="hardCat">Category</Label>
                  <Select 
                    value={editingHardwareItem.category} 
                    onValueChange={(value) => setEditingHardwareItem({...editingHardwareItem!, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {HARDWARE_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Select 
                    value={editingHardwareItem.subcategory || ''} 
                    onValueChange={(value) => setEditingHardwareItem({...editingHardwareItem!, subcategory: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {HARDWARE_SUBCATEGORIES.map((subcategory) => (
                        <SelectItem key={subcategory.value} value={subcategory.value}>
                          {subcategory.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="hardManufacturer">Manufacturer</Label>
                <Input 
                  id="hardManufacturer" 
                  value={editingHardwareItem.manufacturer || ''} 
                  onChange={(e) => setEditingHardwareItem({...editingHardwareItem!, manufacturer: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="unitCost">Unit Cost (£)</Label>
                  <Input 
                    id="unitCost" 
                    type="number"
                    step="0.01"
                    value={editingHardwareItem.unit_cost || ''} 
                    onChange={(e) => setEditingHardwareItem({...editingHardwareItem!, unit_cost: parseFloat(e.target.value) || 0})} 
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input 
                    id="quantity" 
                    type="number"
                    value={editingHardwareItem.quantity || ''} 
                    onChange={(e) => setEditingHardwareItem({...editingHardwareItem!, quantity: parseInt(e.target.value) || 1})} 
                  />
                </div>
                <div>
                  <Label htmlFor="totalCost">Total Cost (£)</Label>
                  <Input 
                    id="totalCost" 
                    type="number"
                    step="0.01"
                    value={editingHardwareItem.total_cost || ''} 
                    onChange={(e) => setEditingHardwareItem({...editingHardwareItem!, total_cost: parseFloat(e.target.value) || 0})} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="supportType">Support Type</Label>
                  <Select 
                    value={editingHardwareItem.support_type || 'None'} 
                    onValueChange={(value) => setEditingHardwareItem({...editingHardwareItem!, support_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select support type" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORT_TYPES.map((supportType) => (
                        <SelectItem key={supportType.value} value={supportType.value}>
                          {supportType.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="supportCost">Support Cost (£)</Label>
                  <Input 
                    id="supportCost" 
                    type="number"
                    step="0.01"
                    value={editingHardwareItem.support_cost || ''} 
                    onChange={(e) => setEditingHardwareItem({...editingHardwareItem!, support_cost: parseFloat(e.target.value) || 0})} 
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
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setEditingHardwareItem(null)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={saveHardwareItem}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Mapping Dialog */}
      {editingMapping && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">Add Software-Hardware Mappings</h3>
            <div className="space-y-4">
                             <div>
                 <Label htmlFor="mappingSoftware">Software Module</Label>
                 <Select 
                   value={selectedSoftwareModule} 
                   onValueChange={setSelectedSoftwareModule}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Select software module" />
                   </SelectTrigger>
                   <SelectContent>
                     {softwareModules.filter(software => software.id && software.name).map(software => (
                       <SelectItem key={software.id} value={software.id}>
                         {software.name}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>

               {/* Show existing mappings for selected software */}
               {selectedSoftwareModule && existingMappingsForSelectedSoftware.length > 0 && (
                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                   <h4 className="text-sm font-medium text-blue-900 mb-2">
                     Existing Mappings for {softwareModules.find(s => s.id === selectedSoftwareModule)?.name}:
                   </h4>
                   <div className="space-y-1">
                     {existingMappingsForSelectedSoftware.map((mapping, index) => {
                       const hardware = hardwareItems.find(h => h.id === mapping.hardware_item_id);
                       return (
                         <div key={index} className="flex items-center justify-between text-sm">
                           <span className="text-blue-800">
                             {hardware?.name || 'Unknown Hardware'}
                           </span>
                           <div className="flex items-center space-x-2">
                             <Badge variant="outline" className="text-xs">
                               Qty: {mapping.quantity}
                             </Badge>
                             <Badge variant={mapping.is_required ? "default" : "outline"} className="text-xs">
                               {mapping.is_required ? 'Required' : 'Optional'}
                             </Badge>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 </div>
               )}

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Hardware Items</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addMappingItem}
                    className="h-8"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Hardware Item
                  </Button>
                </div>
                
                {editingMappingItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Database className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No hardware items added yet</p>
                    <p className="text-sm">Click "Add Hardware Item" to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {editingMappingItems.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium">Hardware Item {index + 1}</h4>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeMappingItem(index)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <Label className="text-sm">Hardware Item</Label>
                            <Select 
                              value={item.hardware_item_id} 
                              onValueChange={(value) => updateMappingItem(index, 'hardware_item_id', value)}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Select hardware" />
                              </SelectTrigger>
                                                             <SelectContent>
                                 {hardwareItems.filter(hardware => hardware.id && hardware.name).map(hardware => {
                                   const isAlreadyMapped = alreadyMappedHardwareIds.has(hardware.id);
                                   return (
                                     <SelectItem 
                                       key={hardware.id} 
                                       value={hardware.id}
                                       disabled={isAlreadyMapped}
                                       className={isAlreadyMapped ? 'opacity-50' : ''}
                                     >
                                       <div className="flex items-center justify-between w-full">
                                         <span>{hardware.name}</span>
                                         {isAlreadyMapped && (
                                           <Badge variant="outline" className="ml-2 text-xs">
                                             Already Mapped
                                           </Badge>
                                         )}
                                       </div>
                                     </SelectItem>
                                   );
                                 })}
                               </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label className="text-sm">Quantity</Label>
                            <Input 
                              type="number" 
                              min="1"
                              value={item.quantity} 
                              onChange={(e) => updateMappingItem(index, 'quantity', Number(e.target.value))}
                              className="h-9"
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2 pt-6">
                            <Checkbox 
                              checked={item.is_required} 
                              onCheckedChange={(v) => updateMappingItem(index, 'is_required', Boolean(v))} 
                            />
                            <Label className="text-sm">Required</Label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingMapping(null);
                    setSelectedSoftwareModule('');
                    setEditingMappingItems([]);
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={saveMapping}
                  disabled={saving || !selectedSoftwareModule || editingMappingItems.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {saving ? 'Saving...' : 'Save Mappings'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
