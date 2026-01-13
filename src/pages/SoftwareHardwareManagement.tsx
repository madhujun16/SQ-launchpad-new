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
  Printer,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getRoleConfig } from '@/lib/roles';
import { useNavigate, Link } from 'react-router-dom';
import { CategoryService } from '@/services/categoryService';
import { PlatformConfigService, RecommendationRule } from '@/services/platformConfigService';
import { PageLoader } from '@/components/ui/loader';

// TODO: Replace with GCP API calls
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Hardcoded categories that cannot be edited or deleted
const HARDCODED_SOFTWARE_CATEGORIES = [
  { id: 'hardcoded-food-ordering', name: 'Food Ordering App', description: 'Mobile/web app for food ordering', is_hardcoded: true },
  { id: 'hardcoded-kiosk', name: 'Kiosk', description: 'Self-service kiosk system', is_hardcoded: true },
  { id: 'hardcoded-pos', name: 'POS', description: 'Point of Sale system', is_hardcoded: true },
  { id: 'hardcoded-kitchen', name: 'Kitchen Display System', description: 'Kitchen display and order management', is_hardcoded: true },
  { id: 'hardcoded-inventory', name: 'Inventory Management', description: 'Inventory tracking and management', is_hardcoded: true }
];

const HARDCODED_HARDWARE_CATEGORIES = [
  { id: 'hardcoded-display', name: 'Display Screen', description: 'Display screens and monitors', is_hardcoded: true },
  { id: 'hardcoded-touch', name: 'Touch Screen', description: 'Touch screen displays', is_hardcoded: true },
  { id: 'hardcoded-pos-terminal', name: 'POS Terminal', description: 'Point of Sale terminals', is_hardcoded: true },
  { id: 'hardcoded-printer', name: 'Printer', description: 'Printers and printing devices', is_hardcoded: true },
  { id: 'hardcoded-scanner', name: 'Scanner', description: 'Barcode and QR scanners', is_hardcoded: true },
  { id: 'hardcoded-tablet', name: 'Tablet', description: 'Tablet devices', is_hardcoded: true },
  { id: 'hardcoded-support', name: 'Support', description: 'Mounting and support equipment', is_hardcoded: true },
  { id: 'hardcoded-accessories', name: 'Accessories', description: 'Cables, adapters, and accessories', is_hardcoded: true },
  { id: 'hardcoded-connectivity', name: 'Connectivity', description: 'Network and connectivity devices', is_hardcoded: true }
];

// Categories are now loaded dynamically from the database (in addition to hardcoded ones)

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
  subcategory?: string | null;
  manufacturer: string | null;
  configuration_notes?: string | null;
  unit_cost: number | null;
  support_type?: string | null;
  support_cost?: number | null;
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
  const [activeTab, setActiveTab] = useState<'software' | 'hardware' | 'recommendations'>('software');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [showArchived, setShowArchived] = useState(false);
  
  // Category management state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ name: string; description?: string; id?: string; type?: 'software' | 'hardware' } | null>(null);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [categoryTypeFilter, setCategoryTypeFilter] = useState<'all' | 'software' | 'hardware'>('all');
  const [showArchivedCategories, setShowArchivedCategories] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Recommendation rules state
  const [recommendationRules, setRecommendationRules] = useState<RecommendationRule[]>([]);
  const [editingRecommendationRule, setEditingRecommendationRule] = useState<RecommendationRule | null>(null);

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
    if (activeTab === 'recommendations') {
      loadRecommendationRules();
    }
  }, [currentRole, showArchived, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load software modules and hardware items from backend
      const [softwareModulesData, hardwareItemsData] = await Promise.all([
        PlatformConfigService.getAllSoftwareModules(),
        PlatformConfigService.getAllHardwareItems()
      ]);
      
      setSoftwareModules(softwareModulesData);
      setHardwareItems(hardwareItemsData);

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
      toast.error('Failed to load data');
      // Set empty arrays on error
      setSoftwareModules([]);
      setHardwareItems([]);
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
      
      let savedModule;
      if (editingSoftwareModule.id) {
        // Update existing module
        savedModule = await PlatformConfigService.updateSoftwareModule(editingSoftwareModule.id, {
          name: editingSoftwareModule.name.trim(),
          description: editingSoftwareModule.description || undefined,
          category_id: editingSoftwareModule.category_id,
          license_fee: editingSoftwareModule.license_fee || 0,
          is_active: editingSoftwareModule.is_active ?? true
        });
      } else {
        // Create new module
        savedModule = await PlatformConfigService.createSoftwareModule({
          name: editingSoftwareModule.name.trim(),
          description: editingSoftwareModule.description || undefined,
          category_id: editingSoftwareModule.category_id,
          license_fee: editingSoftwareModule.license_fee || 0,
          is_active: editingSoftwareModule.is_active ?? true
        });
      }
      
      if (savedModule) {
        toast.success(editingSoftwareModule.id ? 'Software module updated successfully' : 'Software module created successfully');
        await loadData(); // Reload data
        setEditingSoftwareModule(null); // Close modal
      } else {
        toast.error('Failed to save software module');
      }
    } catch (error) {
      console.error('Error saving software module:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to save software module: ${errorMessage}`);
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
      
      let savedItem;
      if (editingHardwareItem.id) {
        // Update existing item
        savedItem = await PlatformConfigService.updateHardwareItem(editingHardwareItem.id, {
          name: editingHardwareItem.name.trim(),
          description: editingHardwareItem.description || undefined,
          category_id: editingHardwareItem.category_id,
          subcategory: editingHardwareItem.subcategory || undefined,
          manufacturer: editingHardwareItem.manufacturer || undefined,
          configuration_notes: editingHardwareItem.configuration_notes || undefined,
          unit_cost: unitCost,
          support_type: editingHardwareItem.support_type || undefined,
          support_cost: editingHardwareItem.support_cost || undefined,
          is_active: editingHardwareItem.is_active ?? true
        });
      } else {
        // Create new item
        savedItem = await PlatformConfigService.createHardwareItem({
          name: editingHardwareItem.name.trim(),
          description: editingHardwareItem.description || undefined,
          category_id: editingHardwareItem.category_id,
          subcategory: editingHardwareItem.subcategory || undefined,
          manufacturer: editingHardwareItem.manufacturer || undefined,
          configuration_notes: editingHardwareItem.configuration_notes || undefined,
          unit_cost: unitCost,
          support_type: editingHardwareItem.support_type || undefined,
          support_cost: editingHardwareItem.support_cost || undefined,
          is_active: editingHardwareItem.is_active ?? true
        });
      }
      
      if (savedItem) {
        toast.success(editingHardwareItem.id ? 'Hardware item updated successfully' : 'Hardware item created successfully');
        await loadData(); // Reload data
        setEditingHardwareItem(null); // Close modal
      } else {
        toast.error('Failed to save hardware item');
      }
    } catch (error) {
      console.error('Error saving hardware item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to save hardware item: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSoftwareModule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this software module?')) return;

    try {
      const success = await PlatformConfigService.deleteSoftwareModule(id);
      if (success) {
        toast.success('Software module deleted successfully');
        await loadData(); // Reload data
      } else {
        toast.error('Failed to delete software module');
      }
    } catch (error) {
      console.error('Error deleting software module:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Show more detailed error message
      if (errorMessage.includes('Server error')) {
        toast.error(errorMessage, {
          duration: 5000, // Show for longer
        });
      } else {
        toast.error(`Failed to delete software module: ${errorMessage}`);
      }
    }
  };

  const handleArchiveSoftwareModule = async (id: string) => {
    if (!confirm('Are you sure you want to archive this software module?')) return;

    try {
      const success = await PlatformConfigService.archiveSoftwareModule(id, true);
      if (success) {
        toast.success('Software module archived successfully');
        await loadData(); // Reload data
      } else {
        toast.error('Failed to archive software module');
      }
    } catch (error) {
      console.error('Error archiving software module:', error);
      toast.error(`Failed to archive software module: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleArchiveHardwareItem = async (id: string) => {
    if (!confirm('Are you sure you want to archive this hardware item?')) return;

    try {
      const success = await PlatformConfigService.archiveHardwareItem(id, true);
      if (success) {
        toast.success('Hardware item archived successfully');
        await loadData(); // Reload data
      } else {
        toast.error('Failed to archive hardware item');
      }
    } catch (error) {
      console.error('Error archiving hardware item:', error);
      toast.error(`Failed to archive hardware item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleRestoreSoftwareModule = async (id: string) => {
    try {
      const success = await PlatformConfigService.archiveSoftwareModule(id, false);
      if (success) {
        toast.success('Software module restored successfully');
        await loadData(); // Reload data
      } else {
        toast.error('Failed to restore software module');
      }
    } catch (error) {
      console.error('Error restoring software module:', error);
      toast.error(`Failed to restore software module: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleRestoreHardwareItem = async (id: string) => {
    try {
      const success = await PlatformConfigService.archiveHardwareItem(id, false);
      if (success) {
        toast.success('Hardware item restored successfully');
        await loadData(); // Reload data
      } else {
        toast.error('Failed to restore hardware item');
      }
    } catch (error) {
      console.error('Error restoring hardware item:', error);
      toast.error(`Failed to restore hardware item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteHardwareItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hardware item?')) return;

    try {
      const success = await PlatformConfigService.deleteHardwareItem(id);
      if (success) {
        toast.success('Hardware item deleted successfully');
        await loadData(); // Reload data
      } else {
        toast.error('Failed to delete hardware item');
      }
    } catch (error) {
      console.error('Error deleting hardware item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Show more detailed error message
      if (errorMessage.includes('Server error')) {
        toast.error(errorMessage, {
          duration: 5000, // Show for longer
        });
      } else {
        toast.error(`Failed to delete hardware item: ${errorMessage}`);
      }
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
      return 'bg-green-100 text-green-800';
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

  // Load categories from backend (only backend data, no hardcoded)
  const loadCategories = async () => {
    try {
      console.log('Loading categories from backend...');
      
      // Load categories from backend only
      const dbCategories = await CategoryService.getAllCategories();
      console.log('✅ Loaded categories from backend:', dbCategories.length);
      
      setCategories(dbCategories);
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      toast.error('Failed to load categories from backend');
      setCategories([]);
    }
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory({ 
      name: category.name,
      description: category.description || '',
      id: category.id,
      type: category.type || 'software'
    });
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    if (!editingCategory.type) {
      toast.error('Please select a category type');
      return;
    }

    try {
      setSaving(true);
      
      console.log('Saving category:', editingCategory);
      
      // Check if category already exists (only for new categories or if name changed)
      if (!editingCategory.id || categories.find(c => c.id === editingCategory.id)?.name !== editingCategory.name.trim()) {
        const exists = await CategoryService.categoryExists(editingCategory.name.trim(), editingCategory.id);
        if (exists) {
          toast.error('Category already exists');
          return;
        }
      }

      const categoryType = editingCategory.type as 'software' | 'hardware';

      if (editingCategory.id) {
        // Update existing category
        console.log('Updating category with ID:', editingCategory.id, 'Type:', categoryType);
        await CategoryService.updateCategory(
          editingCategory.id, 
          editingCategory.name.trim(), 
          editingCategory.description?.trim(), 
          categoryType
        );
        toast.success('Category updated successfully');
      } else {
        // Create new category
        console.log('Creating new category:', editingCategory.name.trim(), 'Type:', categoryType);
        await CategoryService.createCategory(
          editingCategory.name.trim(), 
          editingCategory.description?.trim(), 
          categoryType
        );
        toast.success('Category created successfully');
      }

      // Refresh categories list
      await loadCategories();
      
      // Close modal
      setShowCategoryModal(false);
      setEditingCategory(null);
      
    } catch (error) {
      console.error('Error saving category:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to save category: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (category: any) => {
    if (!confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
      return;
    }

    try {
      if (!category || !category.id) {
        toast.error('Category not found');
        return;
      }

      const categoryType = category.type || 'software';
      await CategoryService.deleteCategory(category.id, categoryType as 'software' | 'hardware');
      toast.success('Category deleted successfully');
      
      // Refresh categories list
      await loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to delete category: ${errorMessage}`);
    }
  };

  const handleArchiveCategory = async (category: any) => {
    const action = category.is_active ? 'archive' : 'restore';
    if (!confirm(`Are you sure you want to ${action} the category "${category.name}"?`)) {
      return;
    }

    try {
      if (!category || !category.id) {
        toast.error('Category not found');
        return;
      }

      const categoryType = category.type || 'software';
      // archive=true means set is_active=false, archive=false means set is_active=true
      // So if category is active (is_active=true), we want to archive it (archive=true)
      await CategoryService.archiveCategory(category.id, category.is_active, categoryType as 'software' | 'hardware');
      toast.success(`Category ${category.is_active ? 'archived' : 'restored'} successfully`);
      
      // Refresh categories list
      await loadCategories();
    } catch (error) {
      console.error('Error archiving category:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to ${category.is_active ? 'archive' : 'restore'} category: ${errorMessage}`);
    }
  };

  // Filter categories based on search term, type, and active status
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
                         (category.description && category.description.toLowerCase().includes(categorySearchTerm.toLowerCase()));
    const matchesType = categoryTypeFilter === 'all' || category.type === categoryTypeFilter;
    const matchesActive = showArchivedCategories ? !category.is_active : category.is_active;
    return matchesSearch && matchesType && matchesActive;
  });

  // Recommendation rules management functions
  const loadRecommendationRules = async () => {
    try {
      const rules = await PlatformConfigService.getAllRecommendationRules();
      setRecommendationRules(rules);
    } catch (error) {
      console.error('Error loading recommendation rules:', error);
      toast.error('Failed to load recommendation rules');
      setRecommendationRules([]);
    }
  };

  const handleSaveRecommendationRule = async () => {
    if (!editingRecommendationRule) return;

    // Validation
    if (!editingRecommendationRule.software_category) {
      toast.error('Please select a software category');
      return;
    }
    if (!editingRecommendationRule.hardware_category) {
      toast.error('Please select a hardware category');
      return;
    }
    if (!editingRecommendationRule.quantity || editingRecommendationRule.quantity < 1) {
      toast.error('Please enter a valid quantity (must be at least 1)');
      return;
    }

    try {
      setSaving(true);
      
      let savedRule;
      if (editingRecommendationRule.id) {
        // Update existing rule
        savedRule = await PlatformConfigService.updateRecommendationRule(editingRecommendationRule.id, {
          software_category: editingRecommendationRule.software_category,
          hardware_category: editingRecommendationRule.hardware_category,
          is_mandatory: editingRecommendationRule.is_mandatory,
          quantity: editingRecommendationRule.quantity
        });
      } else {
        // Create new rule
        savedRule = await PlatformConfigService.createRecommendationRule({
          software_category: editingRecommendationRule.software_category,
          hardware_category: editingRecommendationRule.hardware_category,
          is_mandatory: editingRecommendationRule.is_mandatory,
          quantity: editingRecommendationRule.quantity
        });
      }
      
      if (savedRule) {
        toast.success(editingRecommendationRule.id ? 'Recommendation rule updated successfully' : 'Recommendation rule created successfully');
        await loadRecommendationRules();
        setEditingRecommendationRule(null);
      } else {
        toast.error('Failed to save recommendation rule');
      }
    } catch (error) {
      console.error('Error saving recommendation rule:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to save recommendation rule: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecommendationRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recommendation rule?')) return;

    try {
      const success = await PlatformConfigService.deleteRecommendationRule(id);
      if (success) {
        toast.success('Recommendation rule deleted successfully');
        await loadRecommendationRules();
      } else {
        toast.error('Failed to delete recommendation rule');
      }
    } catch (error) {
      console.error('Error deleting recommendation rule:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Show more detailed error message
      if (errorMessage.includes('Server error')) {
        toast.error(errorMessage, {
          duration: 5000, // Show for longer
        });
      } else {
        toast.error(`Failed to delete recommendation rule: ${errorMessage}`);
      }
    }
  };

  // Get category name by ID
  const getCategoryName = (categoryId: string, type: 'software' | 'hardware') => {
    const category = categories.find(c => c.id === categoryId && c.type === type);
    return category?.name || `Category ${categoryId}`;
  };

  // Get software and hardware categories separately
  const softwareCategories = categories.filter(c => !c.type || c.type === 'software');
  const hardwareCategories = categories.filter(c => !c.type || c.type === 'hardware');

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
                  subcategory: '',
                  manufacturer: '',
                  configuration_notes: '',
                  unit_cost: 0,
                  support_type: '',
                  support_cost: undefined,
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
              <div className="p-2 bg-green-100 rounded-lg">
                <Database className="h-6 w-6 text-green-600" />
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
          <Button
            variant={activeTab === 'recommendations' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('recommendations')}
            className="flex-1"
          >
            <Settings className="h-4 w-4 mr-2" />
            Recommendation Rules ({recommendationRules.length})
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
              <Button 
                variant={showArchived ? "default" : "outline"} 
                onClick={() => setShowArchived(!showArchived)}
                className="whitespace-nowrap"
              >
                {showArchived ? 'Show Active' : 'Show Archived'}
              </Button>
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
                              {showArchived ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRestoreSoftwareModule(module.id)}
                                  className="h-8 w-8 p-0 hover:bg-green-100"
                                  title="Restore Software Module"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-500 hover:text-green-700" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleArchiveSoftwareModule(module.id)}
                                  className="h-8 w-8 p-0 hover:bg-orange-100"
                                  title="Archive Software Module"
                                >
                                  <X className="h-4 w-4 text-orange-500 hover:text-orange-700" />
                                </Button>
                              )}
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
                            <Badge className="bg-green-100 text-green-800">
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
                              {showArchived ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRestoreHardwareItem(item.id)}
                                  className="h-8 w-8 p-0 hover:bg-green-100"
                                  title="Restore Hardware Item"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-500 hover:text-green-700" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleArchiveHardwareItem(item.id)}
                                  className="h-8 w-8 p-0 hover:bg-orange-100"
                                  title="Archive Hardware Item"
                                >
                                  <X className="h-4 w-4 text-orange-500 hover:text-orange-700" />
                                </Button>
                              )}
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

      {/* Recommendation Rules Tab Content */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Software Category</TableHead>
                      <TableHead>Hardware Category</TableHead>
                      <TableHead>Mandatory</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recommendationRules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12">
                          <Settings className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm text-gray-500">No recommendation rules found</p>
                          <p className="text-xs text-gray-400">Create your first recommendation rule to get started</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      recommendationRules.map((rule) => (
                        <TableRow key={rule.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            {getCategoryName(rule.software_category, 'software')}
                          </TableCell>
                          <TableCell className="font-medium">
                            {getCategoryName(rule.hardware_category, 'hardware')}
                          </TableCell>
                          <TableCell>
                            <Badge className={rule.is_mandatory ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}>
                              {rule.is_mandatory ? 'Mandatory' : 'Optional'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {rule.quantity}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingRecommendationRule(rule)}
                                className="h-8 w-8 p-0 hover:bg-gray-100"
                                title="Edit Recommendation Rule"
                              >
                                <Edit className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRecommendationRule(rule.id)}
                                className="h-8 w-8 p-0 hover:bg-red-100"
                                title="Delete Recommendation Rule"
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
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={editingSoftwareModule.category_id || ''}
                  onValueChange={(value) => setEditingSoftwareModule({
                    ...editingSoftwareModule,
                    category_id: value
                  })}
                >
                  <SelectTrigger className={!editingSoftwareModule.category_id ? 'border-red-300' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length > 0 ? categories
                      .filter(cat => !cat.type || cat.type === 'software' || !cat.type) // Prefer software categories, but allow all if no type
                      .map(category => (
                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                      )) : (
                        <SelectItem value="no-categories" disabled>No categories available. Please add categories first.</SelectItem>
                      )}
                  </SelectContent>
                </Select>
                {!editingSoftwareModule.category_id && (
                  <p className="text-sm text-red-500 mt-1">Category is required</p>
                )}
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
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={editingHardwareItem.category_id || ''}
                  onValueChange={(value) => setEditingHardwareItem({
                    ...editingHardwareItem,
                    category_id: value
                  })}
                >
                  <SelectTrigger className={!editingHardwareItem.category_id ? 'border-red-300' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length > 0 ? categories
                      .filter(cat => !cat.type || cat.type === 'hardware' || !cat.type) // Prefer hardware categories, but allow all if no type
                      .map(category => (
                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                      )) : (
                        <SelectItem value="no-categories" disabled>No categories available. Please add categories first.</SelectItem>
                      )}
                  </SelectContent>
                </Select>
                {!editingHardwareItem.category_id && (
                  <p className="text-sm text-red-500 mt-1">Category is required</p>
                )}
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
                <Label htmlFor="subcategory">Subcategory</Label>
                <Input
                  id="subcategory"
                  value={editingHardwareItem.subcategory || ''}
                  onChange={(e) => setEditingHardwareItem({
                    ...editingHardwareItem,
                    subcategory: e.target.value
                  })}
                  placeholder="Enter subcategory (optional)"
                />
              </div>
              <div>
                <Label htmlFor="unit_cost">Unit Cost *</Label>
                <Input
                  id="unit_cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingHardwareItem.unit_cost || ''}
                  onChange={(e) => setEditingHardwareItem({
                    ...editingHardwareItem,
                    unit_cost: e.target.value ? parseFloat(e.target.value) : 0
                  })}
                  placeholder="0.00"
                  className={(!editingHardwareItem.unit_cost || editingHardwareItem.unit_cost <= 0) ? 'border-red-300' : ''}
                />
                {(!editingHardwareItem.unit_cost || editingHardwareItem.unit_cost <= 0) && (
                  <p className="text-sm text-red-500 mt-1">Unit cost must be greater than 0</p>
                )}
              </div>
              <div>
                <Label htmlFor="support_type">Support Type</Label>
                <Input
                  id="support_type"
                  value={editingHardwareItem.support_type || ''}
                  onChange={(e) => setEditingHardwareItem({
                    ...editingHardwareItem,
                    support_type: e.target.value
                  })}
                  placeholder="e.g., Warranty, Maintenance (optional)"
                />
              </div>
              <div>
                <Label htmlFor="support_cost">Support Cost</Label>
                <Input
                  id="support_cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingHardwareItem.support_cost || ''}
                  onChange={(e) => setEditingHardwareItem({
                    ...editingHardwareItem,
                    support_cost: e.target.value ? parseFloat(e.target.value) : undefined
                  })}
                  placeholder="0.00 (optional)"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="configuration_notes">Configuration Notes</Label>
                <Textarea
                  id="configuration_notes"
                  value={editingHardwareItem.configuration_notes || ''}
                  onChange={(e) => setEditingHardwareItem({
                    ...editingHardwareItem,
                    configuration_notes: e.target.value
                  })}
                  placeholder="Enter configuration notes (optional)"
                  rows={2}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
            <DialogDescription>
              Add, edit, archive, or delete categories for software and hardware items.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search categories..."
                  value={categorySearchTerm}
                  onChange={(e) => setCategorySearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryTypeFilter} onValueChange={(value: any) => setCategoryTypeFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="hardware">Hardware</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant={showArchivedCategories ? "default" : "outline"} 
                onClick={() => setShowArchivedCategories(!showArchivedCategories)}
                size="sm"
              >
                {showArchivedCategories ? 'Show Active' : 'Show Archived'}
              </Button>
            </div>

            {/* Add/Edit Category Form */}
            {editingCategory && (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category_name">Category Name *</Label>
                      <Input
                        id="category_name"
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        placeholder="Enter category name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category_type">Type *</Label>
                      <Select
                        value={editingCategory.type || 'software'}
                        onValueChange={(value: 'software' | 'hardware') => setEditingCategory({ ...editingCategory, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="software">Software</SelectItem>
                          <SelectItem value="hardware">Hardware</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="category_description">Description</Label>
                      <Textarea
                        id="category_description"
                        value={editingCategory.description || ''}
                        onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                        placeholder="Enter category description (optional)"
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      onClick={handleSaveCategory}
                      disabled={saving || !editingCategory.name.trim() || !editingCategory.type}
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
                </CardContent>
              </Card>
            )}

            {/* Categories Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        <Tag className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No categories found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCategories.map((category) => (
                      <TableRow key={category.id} className={!category.is_active ? 'opacity-60' : ''}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>
                          <Badge className={category.type === 'software' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                            {category.type || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {category.description || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={category.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {category.is_active ? 'Active' : 'Archived'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCategory(category)}
                              className="h-8 w-8 p-0"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleArchiveCategory(category)}
                              className="h-8 w-8 p-0"
                              title={category.is_active ? 'Archive' : 'Restore'}
                            >
                              {category.is_active ? (
                                <X className="h-4 w-4 text-orange-500" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCategory(category)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCategoryModal(false);
                setEditingCategory(null);
                setCategorySearchTerm('');
                setCategoryTypeFilter('all');
                setShowArchivedCategories(false);
              }}
            >
              Close
            </Button>
            {!editingCategory && (
              <Button
                onClick={() => setEditingCategory({ name: '', description: '', type: 'software' })}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recommendation Rule Edit Modal */}
      {editingRecommendationRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-6">
              {editingRecommendationRule.id ? 'Edit Recommendation Rule' : 'Add Recommendation Rule'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="software_category">Software Category *</Label>
                <Select
                  value={editingRecommendationRule.software_category || ''}
                  onValueChange={(value) => setEditingRecommendationRule({
                    ...editingRecommendationRule,
                    software_category: value
                  })}
                >
                  <SelectTrigger className={!editingRecommendationRule.software_category ? 'border-red-300' : ''}>
                    <SelectValue placeholder="Select software category" />
                  </SelectTrigger>
                  <SelectContent>
                    {softwareCategories.length > 0 ? softwareCategories.map(category => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    )) : (
                      <SelectItem value="no-categories" disabled>No software categories available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {!editingRecommendationRule.software_category && (
                  <p className="text-sm text-red-500 mt-1">Software category is required</p>
                )}
              </div>
              <div>
                <Label htmlFor="hardware_category">Hardware Category *</Label>
                <Select
                  value={editingRecommendationRule.hardware_category || ''}
                  onValueChange={(value) => setEditingRecommendationRule({
                    ...editingRecommendationRule,
                    hardware_category: value
                  })}
                >
                  <SelectTrigger className={!editingRecommendationRule.hardware_category ? 'border-red-300' : ''}>
                    <SelectValue placeholder="Select hardware category" />
                  </SelectTrigger>
                  <SelectContent>
                    {hardwareCategories.length > 0 ? hardwareCategories.map(category => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    )) : (
                      <SelectItem value="no-categories" disabled>No hardware categories available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {!editingRecommendationRule.hardware_category && (
                  <p className="text-sm text-red-500 mt-1">Hardware category is required</p>
                )}
              </div>
              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={editingRecommendationRule.quantity || ''}
                  onChange={(e) => setEditingRecommendationRule({
                    ...editingRecommendationRule,
                    quantity: parseInt(e.target.value) || 1
                  })}
                  placeholder="Enter quantity"
                  className={(!editingRecommendationRule.quantity || editingRecommendationRule.quantity < 1) ? 'border-red-300' : ''}
                />
                {(!editingRecommendationRule.quantity || editingRecommendationRule.quantity < 1) && (
                  <p className="text-sm text-red-500 mt-1">Quantity must be at least 1</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_mandatory"
                  checked={editingRecommendationRule.is_mandatory || false}
                  onCheckedChange={(checked) => setEditingRecommendationRule({
                    ...editingRecommendationRule,
                    is_mandatory: checked as boolean
                  })}
                />
                <Label htmlFor="is_mandatory">Mandatory</Label>
              </div>
            </div>
            <div className="flex gap-3 mt-8 pt-6 border-t">
              <Button
                onClick={handleSaveRecommendationRule}
                disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingRecommendationRule(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}