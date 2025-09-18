import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
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
  Settings,
  Monitor,
  CreditCard,
  Activity,
  Wrench,
  Truck,
  Tag,
  X,
  Printer
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getRoleConfig } from '@/lib/roles';
import { useNavigate, Link } from 'react-router-dom';
import { CategoryService } from '@/services/categoryService';
import { supabase } from '@/integrations/supabase/client';
import { PageLoader } from '@/components/ui/loader';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Categories are now loaded dynamically from the database

// Hardware types for the type dropdown
const HARDWARE_TYPES = [
  { value: 'Display Screen', label: 'Display Screen' },
  { value: 'Touch Screen', label: 'Touch Screen' },
  { value: 'Support', label: 'Support' },
  { value: 'POS Terminal', label: 'POS Terminal' },
  { value: 'Scanner', label: 'Scanner' },
  { value: 'Printer', label: 'Printer' },
  { value: 'Tablet', label: 'Tablet' },
  { value: 'Accessories', label: 'Accessories' },
  { value: 'Connectivity', label: 'Connectivity' },
  { value: 'Other', label: 'Other' }
] as const;

// Interfaces
interface SoftwareModule {
  id: string;
  name: string;
  description: string | null;
  category_id: string;
  license_fee: number | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  category?: {
    id: string;
    name: string;
    description: string | null;
  };
}

interface HardwareItem {
  id: string;
  name: string;
  description: string | null;
  category_id: string;
  manufacturer: string | null;
  unit_cost: number | null;
  type: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  quantity?: number | null;
  total_cost?: number | null;
  category?: {
    id: string;
    name: string;
    description: string | null;
  };
}

export default function SoftwareHardwareManagement() {
  const { currentRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [softwareModules, setSoftwareModules] = useState<SoftwareModule[]>([]);
  const [hardwareItems, setHardwareItems] = useState<HardwareItem[]>([]);
  const [editingSoftwareModule, setEditingSoftwareModule] = useState<SoftwareModule | null>(null);
  const [editingHardwareItem, setEditingHardwareItem] = useState<HardwareItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'software' | 'hardware'>('software');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  
  // Category management state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ name: string; id?: string } | null>(null);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [categories, setCategories] = useState<any[]>([]);

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
    if (!currentRole) return;
    loadData();
    loadCategories();
  }, [currentRole]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load software modules with category information
      const { data: softwareData, error: softwareError } = await supabase
        .from('software_modules')
        .select(`
          *,
          category:categories(id, name, description)
        `)
        .order('name');
      
      if (softwareError) {
        console.error('Error loading software modules:', softwareError);
        toast.error('Failed to load software modules');
        setSoftwareModules([]);
      } else {
        setSoftwareModules((softwareData || []) as any);
      }

      // Load hardware items with category information
      const { data: hardwareData, error: hardwareError } = await supabase
        .from('hardware_items')
        .select(`
          *,
          category:categories(id, name, description)
        `)
        .order('name');
      
      if (hardwareError) {
        console.error('Error loading hardware items:', hardwareError);
        toast.error('Failed to load hardware items');
        setHardwareItems([]);
      } else {
        setHardwareItems((hardwareData || []) as any);
      }

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSoftwareModule = async () => {
    if (!editingSoftwareModule) return;

    // Validation
    if (!editingSoftwareModule.name?.trim()) {
      toast.error('Please enter a software module name');
      return;
    }
    if (!editingSoftwareModule.category_id?.trim()) {
      toast.error('Please select a category');
      return;
    }

    try {
      setSaving(true);
      
      console.log('Saving software module:', editingSoftwareModule);
      
      if (editingSoftwareModule.id) {
        // Update existing
        const updateData = {
          name: editingSoftwareModule.name,
          description: editingSoftwareModule.description,
          category_id: editingSoftwareModule.category_id,
          license_fee: editingSoftwareModule.license_fee,
          is_active: editingSoftwareModule.is_active
        };
        
        console.log('Updating software module with data:', updateData);
        
        const { error } = await supabase
          .from('software_modules')
          .update(updateData)
          .eq('id', editingSoftwareModule.id);

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        toast.success('Software module updated successfully');
      } else {
        // Create new
        const insertData = {
          name: editingSoftwareModule.name,
          description: editingSoftwareModule.description,
          category_id: editingSoftwareModule.category_id,
          license_fee: editingSoftwareModule.license_fee,
          is_active: editingSoftwareModule.is_active
        };
        
        console.log('Creating software module with data:', insertData);
        
        const { error } = await supabase
          .from('software_modules')
          .insert(insertData);

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        toast.success('Software module created successfully');
      }

      setEditingSoftwareModule(null);
      loadData();
    } catch (error) {
      console.error('Error saving software module:', error);
      toast.error('Failed to save software module');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveHardwareItem = async () => {
    if (!editingHardwareItem) return;

    console.log('Starting hardware item save process...');
    console.log('Editing hardware item:', editingHardwareItem);

    // Validation
    if (!editingHardwareItem.name?.trim()) {
      toast.error('Please enter a hardware item name');
      return;
    }
    if (!editingHardwareItem.category_id?.trim()) {
      toast.error('Please select a category');
      return;
    }
    const unitCost = typeof editingHardwareItem.unit_cost === 'string' 
      ? parseFloat(editingHardwareItem.unit_cost) 
      : editingHardwareItem.unit_cost;
    
    if (!unitCost || unitCost <= 0) {
      toast.error('Please enter a valid unit cost');
      return;
    }

    try {
      setSaving(true);
      
      console.log('Saving hardware item:', editingHardwareItem);
      
      if (editingHardwareItem.id) {
        // Update existing
        const updateData = {
          name: editingHardwareItem.name,
          description: editingHardwareItem.description,
          category_id: editingHardwareItem.category_id,
          manufacturer: editingHardwareItem.manufacturer,
          unit_cost: unitCost,
          type: editingHardwareItem.type || 'Other',
          is_active: editingHardwareItem.is_active,
          quantity: editingHardwareItem.quantity || 1,
          total_cost: unitCost * (editingHardwareItem.quantity || 1)
        };
        
        console.log('Updating hardware item with data:', updateData);
        
        const { error } = await supabase
          .from('hardware_items')
          .update(updateData)
          .eq('id', editingHardwareItem.id);

        if (error) {
          console.error('Supabase error:', error);
          console.error('Error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          console.error('Data being sent:', updateData);
          console.error('Full error object:', JSON.stringify(error, null, 2));
          throw error;
        }
        toast.success('Hardware item updated successfully');
      } else {
        // Create new
        const insertData = {
          name: editingHardwareItem.name,
          description: editingHardwareItem.description,
          category_id: editingHardwareItem.category_id,
          manufacturer: editingHardwareItem.manufacturer,
          unit_cost: unitCost,
          type: editingHardwareItem.type || 'Other',
          is_active: editingHardwareItem.is_active,
          quantity: editingHardwareItem.quantity || 1,
          total_cost: unitCost * (editingHardwareItem.quantity || 1)
        };
        
        console.log('Creating hardware item with data:', insertData);
        
        const { error } = await supabase
          .from('hardware_items')
          .insert(insertData);

        if (error) {
          console.error('Supabase error:', error);
          console.error('Error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          console.error('Data being sent:', insertData);
          console.error('Full error object:', JSON.stringify(error, null, 2));
          throw error;
        }
        toast.success('Hardware item created successfully');
      }

      setEditingHardwareItem(null);
      loadData();
    } catch (error) {
      console.error('Error saving hardware item:', error);
      toast.error('Failed to save hardware item');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSoftwareModule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this software module?')) return;

    try {
      const { error } = await supabase
        .from('software_modules')
        .delete()
        .eq('id', id as any);

      if (error) throw error;
      toast.success('Software module deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting software module:', error);
      toast.error('Failed to delete software module');
    }
  };

  const handleDeleteHardwareItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hardware item?')) return;

    try {
      const { error } = await supabase
        .from('hardware_items')
        .delete()
        .eq('id', id as any);

      if (error) throw error;
      toast.success('Hardware item deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting hardware item:', error);
      toast.error('Failed to delete hardware item');
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    // Dynamic icon assignment based on category name patterns
    const categoryLower = categoryName.toLowerCase();
    
    if (categoryLower.includes('kitchen') || categoryLower.includes('kds')) {
      return <Monitor className="h-4 w-4" />;
    }
    if (categoryLower.includes('support') || categoryLower.includes('sundries')) {
      return <Activity className="h-4 w-4" />;
    }
    if (categoryLower.includes('kiosk')) {
      return <Monitor className="h-4 w-4" />;
    }
    if (categoryLower.includes('pos') || categoryLower.includes('terminal')) {
      return <CreditCard className="h-4 w-4" />;
    }
    if (categoryLower.includes('customer') || categoryLower.includes('tds')) {
      return <Monitor className="h-4 w-4" />;
    }
    if (categoryLower.includes('tablet')) {
      return <Monitor className="h-4 w-4" />;
    }
    if (categoryLower.includes('printer')) {
      return <Printer className="h-4 w-4" />;
    }
    if (categoryLower.includes('scanner')) {
      return <Package className="h-4 w-4" />;
    }
    if (categoryLower.includes('accessories')) {
      return <Package className="h-4 w-4" />;
    }
    if (categoryLower.includes('connectivity')) {
      return <Activity className="h-4 w-4" />;
    }
    
    // Default fallback
    return <Package className="h-4 w-4" />;
  };

  const getCategoryColor = (categoryName: string) => {
    // Dynamic color assignment based on category name patterns
    const categoryLower = categoryName.toLowerCase();
    
    if (categoryLower.includes('kitchen') || categoryLower.includes('kds')) {
      return 'bg-blue-100 text-blue-800';
    }
    if (categoryLower.includes('support') || categoryLower.includes('sundries')) {
      return 'bg-orange-100 text-orange-800';
    }
    if (categoryLower.includes('kiosk')) {
      return 'bg-purple-100 text-purple-800';
    }
    if (categoryLower.includes('pos') || categoryLower.includes('terminal')) {
      return 'bg-indigo-100 text-indigo-800';
    }
    if (categoryLower.includes('customer') || categoryLower.includes('tds')) {
      return 'bg-green-100 text-green-800';
    }
    if (categoryLower.includes('tablet')) {
      return 'bg-cyan-100 text-cyan-800';
    }
    if (categoryLower.includes('printer')) {
      return 'bg-red-100 text-red-800';
    }
    if (categoryLower.includes('scanner')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (categoryLower.includes('accessories')) {
      return 'bg-pink-100 text-pink-800';
    }
    if (categoryLower.includes('connectivity')) {
      return 'bg-teal-100 text-teal-800';
    }
    
    // Default fallback
    return 'bg-gray-100 text-gray-800';
  };

  // Get unique categories from both software modules and hardware items, plus categories from database
  const allCategories = Array.from(new Set([
    ...softwareModules.map(sm => sm.category?.name).filter(Boolean),
    ...hardwareItems.map(hi => hi.category?.name).filter(Boolean),
    ...categories.map(cat => cat.name)
  ])).filter(category => category && category.trim() !== '');

  // Filter and paginate data (similar to other platform config pages)
  const { filteredSoftwareModules, filteredHardwareItems, totalPages, currentSoftwareModules, currentHardwareItems } = useMemo(() => {
    let filteredSoftware = softwareModules.filter(module => {
      const matchesSearch = module.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           module.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           module.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || module.category?.name === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    let filteredHardware = hardwareItems.filter(item => {
      const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category?.name === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    const totalPages = Math.ceil((activeTab === 'software' ? filteredSoftware.length : filteredHardware.length) / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    const currentSoftwareModules = filteredSoftware.slice(startIndex, endIndex);
    const currentHardwareItems = filteredHardware.slice(startIndex, endIndex);

    return { 
      filteredSoftwareModules: filteredSoftware, 
      filteredHardwareItems: filteredHardware, 
      totalPages, 
      currentSoftwareModules, 
      currentHardwareItems 
    };
  }, [softwareModules, hardwareItems, searchTerm, categoryFilter, currentPage, itemsPerPage, activeTab]);

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Category management functions
  const handleAddCategory = () => {
    setEditingCategory({ name: '' });
    setShowCategoryModal(true);
  };

  // Load categories from backend (actual categories table)
  const loadCategories = async () => {
    try {
      console.log('Loading categories from database...');
      
      // Fetch categories from the actual categories table
      const { data: categoriesData, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      console.log('Loaded categories from database:', categoriesData);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback to empty array if database fails
      console.log('Using empty categories list due to error');
      setCategories([]);
    }
  };

  const handleEditCategory = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    setEditingCategory({ 
      name: categoryName, 
      id: category?.id 
    });
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      setSaving(true);
      
      console.log('Saving category:', editingCategory);
      
      // Check if category already exists
      const exists = await CategoryService.categoryExists(editingCategory.name.trim(), editingCategory.id);
      if (exists) {
        toast.error('Category already exists');
        return;
      }

      if (editingCategory.id) {
        // Update existing category
        console.log('Updating category with ID:', editingCategory.id);
        await CategoryService.updateCategory(editingCategory.id, editingCategory.name.trim());
        toast.success('Category updated successfully');
      } else {
        // Create new category
        console.log('Creating new category:', editingCategory.name.trim());
        await CategoryService.createCategory(editingCategory.name.trim());
        toast.success('Category created successfully');
      }

      // Refresh categories list
      await loadCategories();
      
      // Close modal
      setShowCategoryModal(false);
      setEditingCategory(null);
      
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(`Failed to save category: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    if (!confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
      return;
    }

    try {
      // Find category by name to get ID
      const category = categories.find(c => c.name === categoryName);
      if (!category) {
        toast.error('Category not found');
        return;
      }

      await CategoryService.deleteCategory(category.id);
      toast.success('Category deleted successfully');
      
      // Refresh categories list
      await loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Software Hardware Management</h1>
          <p className="text-gray-600 mt-1">
            Manage software modules and hardware items for your organization
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleAddCategory}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            <Tag className="h-4 w-4 mr-2" />
            Manage Categories
          </Button>
          <Button 
            onClick={() => {
              if (activeTab === 'software') {
                setEditingSoftwareModule({
                  id: '',
                  name: '',
                  description: '',
                  category_id: '',
                  license_fee: 0,
                  is_active: true,
                  created_at: '',
                  updated_at: ''
                });
              } else {
                setEditingHardwareItem({
                  id: '',
                  name: '',
                  description: '',
                  category_id: '',
                  manufacturer: '',
                  unit_cost: 0,
                  type: 'Other',
                  is_active: true,
                  created_at: '',
                  updated_at: ''
                });
              }
            }}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {activeTab === 'software' ? 'Add Software Module' : 'Add Hardware & Support Item'}
          </Button>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Software Modules</p>
                <p className="text-2xl font-bold text-gray-900">{softwareModules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Hardware & Support</p>
                <p className="text-2xl font-bold text-gray-900">{hardwareItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{allCategories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {softwareModules.filter(sm => sm.is_active).length + hardwareItems.filter(hi => hi.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-white p-1 rounded-lg border">
          <Button
            variant={activeTab === 'software' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('software')}
            className="flex-1"
          >
            <Database className="h-4 w-4 mr-2" />
            Software Modules ({softwareModules.length})
          </Button>
          <Button
            variant={activeTab === 'hardware' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('hardware')}
            className="flex-1"
          >
            <Package className="h-4 w-4 mr-2" />
            Hardware & Support ({hardwareItems.length})
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={`Search ${activeTab === 'software' ? 'software modules' : 'hardware items'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex gap-3 md:w-auto">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="md:w-56">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {allCategories.length > 0 ? allCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  )) : (
                    <SelectItem value="no-categories" disabled>No categories available</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={clearFilters} className="whitespace-nowrap">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content based on active tab */}
      {activeTab === 'software' && (
        <div className="space-y-6">
          {/* Filters removed; using global filter bar above */}

        {/* Search and Filters removed; using global filter bar above */}

        {/* Software Modules Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>License Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentSoftwareModules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <Database className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm text-gray-500">No software modules found</p>
                        <p className="text-xs text-gray-400">Create your first software module to get started</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentSoftwareModules.map((module) => (
                      <TableRow key={module.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{module.name}</div>
                            {module.description && (
                              <div className="text-sm text-gray-500">{module.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(module.category?.name || '')}
                              <Badge className={getCategoryColor(module.category?.name || '')}>
                                {module.category?.name || 'No Category'}
                              </Badge>
                            </div>
                        </TableCell>
                        <TableCell className="text-gray-700">
                          £{(module.license_fee || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={module.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {module.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingSoftwareModule(module)}
                                className="h-8 w-8 p-0 hover:bg-gray-100"
                                title="Edit Software Module"
                              >
                                <Edit className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSoftwareModule(module.id)}
                                className="h-8 w-8 p-0 hover:bg-red-100"
                                title="Delete Software Module"
                              >
                                <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                              </Button>
                            </div>
                          </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      

      {/* Hardware Tab Content */}
      {activeTab === 'hardware' && (
        <div className="space-y-6">
          {/* Filters removed; using global filter bar above */}

          {/* Hardware & Support Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Manufacturer</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentHardwareItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm text-gray-500">No hardware items found</p>
                          <p className="text-xs text-gray-400">Create your first hardware item to get started</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentHardwareItems.map((item) => (
                        <TableRow key={item.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-semibold">{item.name}</div>
                              {item.description && (
                                <div className="text-sm text-gray-500">{item.description}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-blue-100 text-blue-800">
                              {item.type || 'Other'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(item.category?.name || '')}
                              <Badge className={getCategoryColor(item.category?.name || '')}>
                                {item.category?.name || 'No Category'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {item.manufacturer || 'N/A'}
                          </TableCell>
                          <TableCell className="text-gray-700">
                            £{(item.unit_cost || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {item.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingHardwareItem(item)}
                                className="h-8 w-8 p-0 hover:bg-gray-100"
                                title="Edit Hardware & Support Item"
                              >
                                <Edit className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteHardwareItem(item.id)}
                                className="h-8 w-8 p-0 hover:bg-red-50"
                                title="Delete Hardware & Support Item"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Summary and Pagination */}
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm text-gray-500">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, activeTab === 'software' ? filteredSoftwareModules.length : filteredHardwareItems.length)} of {activeTab === 'software' ? filteredSoftwareModules.length : filteredHardwareItems.length} {activeTab === 'software' ? 'software modules' : 'hardware items'}
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

      {/* Software Module Edit Modal */}
      {editingSoftwareModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-6">
              {editingSoftwareModule.id ? 'Edit Software Module' : 'Add Software Module'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="software_name">Software Name</Label>
                <Input
                  id="software_name"
                  value={editingSoftwareModule.name}
                  onChange={(e) => setEditingSoftwareModule({
                    ...editingSoftwareModule,
                    name: e.target.value
                  })}
                  placeholder="Enter software name"
                />
              </div>
              <div>
                <Label htmlFor="license_fee">License Fee</Label>
                <Input
                  id="license_fee"
                  type="number"
                  step="0.01"
                  value={editingSoftwareModule.license_fee || 0}
                  onChange={(e) => setEditingSoftwareModule({
                    ...editingSoftwareModule,
                    license_fee: parseFloat(e.target.value) || 0
                  })}
                  placeholder="Enter license fee"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingSoftwareModule.description || ''}
                  onChange={(e) => setEditingSoftwareModule({
                    ...editingSoftwareModule,
                    description: e.target.value
                  })}
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={editingSoftwareModule.category_id}
                  onValueChange={(value) => setEditingSoftwareModule({
                    ...editingSoftwareModule,
                    category_id: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length > 0 ? categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    )) : (
                      <SelectItem value="no-categories" disabled>No categories available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={editingSoftwareModule.is_active || false}
                  onCheckedChange={(checked) => setEditingSoftwareModule({
                    ...editingSoftwareModule,
                    is_active: checked as boolean
                  })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
            <div className="flex gap-3 mt-8 pt-6 border-t">
              <Button
                onClick={handleSaveSoftwareModule}
                disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingSoftwareModule(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hardware & Support Item Edit Modal */}
      {editingHardwareItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-6">
              {editingHardwareItem.id ? 'Edit Hardware & Support Item' : 'Add Hardware & Support Item'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="hardware_name">Item Name</Label>
                <Input
                  id="hardware_name"
                  value={editingHardwareItem.name}
                  onChange={(e) => setEditingHardwareItem({
                    ...editingHardwareItem,
                    name: e.target.value
                  })}
                  placeholder="Enter item name"
                />
              </div>
              <div>
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={editingHardwareItem.manufacturer || ''}
                  onChange={(e) => setEditingHardwareItem({
                    ...editingHardwareItem,
                    manufacturer: e.target.value
                  })}
                  placeholder="Enter manufacturer"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingHardwareItem.description || ''}
                  onChange={(e) => setEditingHardwareItem({
                    ...editingHardwareItem,
                    description: e.target.value
                  })}
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={editingHardwareItem.category_id}
                  onValueChange={(value) => setEditingHardwareItem({
                    ...editingHardwareItem,
                    category_id: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length > 0 ? categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    )) : (
                      <SelectItem value="no-categories" disabled>No categories available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={editingHardwareItem.type || 'Other'}
                  onValueChange={(value) => setEditingHardwareItem({
                    ...editingHardwareItem,
                    type: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {HARDWARE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="unit_cost">Unit Cost</Label>
                <Input
                  id="unit_cost"
                  type="number"
                  step="0.01"
                  value={editingHardwareItem.unit_cost || 0}
                  onChange={(e) => setEditingHardwareItem({
                    ...editingHardwareItem,
                    unit_cost: parseFloat(e.target.value) || 0
                  })}
                  placeholder="Enter unit cost"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={editingHardwareItem.is_active || false}
                  onCheckedChange={(checked) => setEditingHardwareItem({
                    ...editingHardwareItem,
                    is_active: checked as boolean
                  })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
            <div className="flex gap-3 mt-8 pt-6 border-t">
              <Button
                onClick={handleSaveHardwareItem}
                disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingHardwareItem(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
            <DialogDescription>
              Add, edit, or delete categories for software and hardware items.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Add/Edit Category Form */}
            {editingCategory && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    placeholder="Enter category name"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSaveCategory}
                    disabled={saving || !editingCategory.name.trim()}
                    size="sm"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingCategory(null)}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}


            {/* Categories List */}
            <div className="max-h-80 overflow-y-auto space-y-2">
              {filteredCategories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Tag className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No categories found</p>
                </div>
              ) : (
                filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="font-medium">{category.name}</div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCategory(category.name)}
                        className="h-8 w-8 p-0"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.name)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCategoryModal(false);
                setEditingCategory(null);
                setCategorySearchTerm('');
              }}
            >
              Close
            </Button>
            {!editingCategory && (
              <Button
                onClick={() => setEditingCategory({ name: '' })}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}