import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building,
  FileText,
  Home,
  ChevronRight,
  AlertCircle,
  Plus,
  Eye,
  Edit,
  Users,
  Database,
  Settings,
  Package,
  Monitor,
  Calculator,
  Trash2,
  Save
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ContentLoader } from '@/components/ui/loader';
import { getRoleConfig } from '@/lib/roles';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

// Interfaces for recommendation rules
interface SoftwareModule {
  id: string;
  name: string;
  description: string;
  monthlyFee: number;
  setupFee: number;
  category: string;
  status: 'active' | 'inactive';
}

interface HardwareItem {
  id: string;
  name: string;
  description: string;
  manufacturer: string;
  model: string;
  unitCost: number;
  category: string;
  status: 'available' | 'discontinued';
}

interface RecommendationRule {
  id: string;
  softwareModuleId: string;
  hardwareItemId: string;
  defaultQuantity: number;
  isRequired: boolean;
  reason: string;
  costMultiplier: number;
}

interface BusinessRule {
  id: string;
  name: string;
  description: string;
  ruleType: 'dependency' | 'exclusion' | 'quantity' | 'cost';
  softwareModuleIds: string[];
  hardwareItemIds: string[];
  ruleValue: string;
  priority: number;
}

export default function PlatformConfiguration() {
  const { currentRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('organizations');

  // State for recommendation rules
  const [softwareModules, setSoftwareModules] = useState<SoftwareModule[]>([]);
  const [hardwareItems, setHardwareItems] = useState<HardwareItem[]>([]);
  const [recommendationRules, setRecommendationRules] = useState<RecommendationRule[]>([]);
  const [businessRules, setBusinessRules] = useState<BusinessRule[]>([]);
  const [editingRule, setEditingRule] = useState<RecommendationRule | null>(null);
  const [editingBusinessRule, setEditingBusinessRule] = useState<BusinessRule | null>(null);

  const roleConfig = getRoleConfig(currentRole || 'admin');

  // Only allow admin access
  if (currentRole !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access the Platform Configuration. Please contact an administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  useEffect(() => {
    loadConfigurationData();
  }, []);

  const loadConfigurationData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API calls
      const mockSoftwareModules: SoftwareModule[] = [
        {
          id: 'pos-system',
          name: 'POS System',
          description: 'Point of Sale system for transactions',
          monthlyFee: 25,
          setupFee: 150,
          category: 'Payment Processing',
          status: 'active'
        },
        {
          id: 'kiosk-software',
          name: 'Kiosk Software',
          description: 'Self-service kiosk software',
          monthlyFee: 20,
          setupFee: 100,
          category: 'Self-Service',
          status: 'active'
        },
        {
          id: 'kitchen-display',
          name: 'Kitchen Display',
          description: 'Kitchen display system for orders',
          monthlyFee: 20,
          setupFee: 100,
          category: 'Kitchen Management',
          status: 'active'
        },
        {
          id: 'inventory-management',
          name: 'Inventory Management',
          description: 'Inventory tracking and management',
          monthlyFee: 15,
          setupFee: 75,
          category: 'Inventory',
          status: 'active'
        }
      ];

      const mockHardwareItems: HardwareItem[] = [
        {
          id: 'pos-terminal',
          name: 'POS Terminal',
          description: 'Ingenico Telium 2 POS terminal',
          manufacturer: 'Ingenico',
          model: 'Telium 2',
          unitCost: 2500,
          category: 'Payment Processing',
          status: 'available'
        },
        {
          id: 'printer',
          name: 'Thermal Printer',
          description: 'Receipt and kitchen order printer',
          manufacturer: 'Epson',
          model: 'TM-T88VI',
          unitCost: 350,
          category: 'Printing',
          status: 'available'
        },
        {
          id: 'cash-drawer',
          name: 'Cash Drawer',
          description: 'Electronic cash drawer',
          manufacturer: 'APG',
          model: 'CashDrawer-2000',
          unitCost: 200,
          category: 'Payment Processing',
          status: 'available'
        },
        {
          id: 'kiosk-display',
          name: 'Kiosk Display',
          description: 'Touch screen display for kiosk',
          manufacturer: 'Elo',
          model: 'TouchScreen-22',
          unitCost: 800,
          category: 'Display',
          status: 'available'
        },
        {
          id: 'touch-screen',
          name: 'Touch Screen',
          description: 'Touch screen interface',
          manufacturer: 'Elo',
          model: 'TouchScreen-15',
          unitCost: 600,
          category: 'Display',
          status: 'available'
        },
        {
          id: 'kitchen-display',
          name: 'Kitchen Display',
          description: 'Digital display for kitchen orders',
          manufacturer: 'Sony',
          model: 'KD-55X80K',
          unitCost: 1200,
          category: 'Display',
          status: 'available'
        },
        {
          id: 'tablet',
          name: 'Tablet',
          description: 'iPad for inventory management',
          manufacturer: 'Apple',
          model: 'iPad Air',
          unitCost: 800,
          category: 'Mobile Device',
          status: 'available'
        },
        {
          id: 'barcode-scanner',
          name: 'Barcode Scanner',
          description: 'USB barcode scanner',
          manufacturer: 'Honeywell',
          model: 'Scanner-1900',
          unitCost: 150,
          category: 'Input Device',
          status: 'available'
        }
      ];

      const mockRecommendationRules: RecommendationRule[] = [
        {
          id: '1',
          softwareModuleId: 'pos-system',
          hardwareItemId: 'pos-terminal',
          defaultQuantity: 1,
          isRequired: true,
          reason: 'Core POS functionality',
          costMultiplier: 1.0
        },
        {
          id: '2',
          softwareModuleId: 'pos-system',
          hardwareItemId: 'printer',
          defaultQuantity: 1,
          isRequired: true,
          reason: 'Receipt printing',
          costMultiplier: 1.0
        },
        {
          id: '3',
          softwareModuleId: 'pos-system',
          hardwareItemId: 'cash-drawer',
          defaultQuantity: 1,
          isRequired: true,
          reason: 'Cash management',
          costMultiplier: 1.0
        },
        {
          id: '4',
          softwareModuleId: 'kiosk-software',
          hardwareItemId: 'kiosk-display',
          defaultQuantity: 1,
          isRequired: true,
          reason: 'Kiosk interface',
          costMultiplier: 1.0
        },
        {
          id: '5',
          softwareModuleId: 'kiosk-software',
          hardwareItemId: 'touch-screen',
          defaultQuantity: 1,
          isRequired: true,
          reason: 'Touch interaction',
          costMultiplier: 1.0
        },
        {
          id: '6',
          softwareModuleId: 'kitchen-display',
          hardwareItemId: 'kitchen-display',
          defaultQuantity: 1,
          isRequired: true,
          reason: 'Kitchen order display',
          costMultiplier: 1.0
        },
        {
          id: '7',
          softwareModuleId: 'inventory-management',
          hardwareItemId: 'tablet',
          defaultQuantity: 1,
          isRequired: true,
          reason: 'Mobile inventory management',
          costMultiplier: 1.0
        },
        {
          id: '8',
          softwareModuleId: 'inventory-management',
          hardwareItemId: 'barcode-scanner',
          defaultQuantity: 1,
          isRequired: true,
          reason: 'Barcode scanning',
          costMultiplier: 1.0
        }
      ];

      const mockBusinessRules: BusinessRule[] = [
        {
          id: '1',
          name: 'POS Hardware Dependency',
          description: 'POS System requires POS Terminal, Printer, and Cash Drawer',
          ruleType: 'dependency',
          softwareModuleIds: ['pos-system'],
          hardwareItemIds: ['pos-terminal', 'printer', 'cash-drawer'],
          ruleValue: 'required',
          priority: 1
        },
        {
          id: '2',
          name: 'Kiosk Display Requirement',
          description: 'Kiosk Software requires touch screen display',
          ruleType: 'dependency',
          softwareModuleIds: ['kiosk-software'],
          hardwareItemIds: ['kiosk-display', 'touch-screen'],
          ruleValue: 'required',
          priority: 2
        },
        {
          id: '3',
          name: 'Kitchen Display Quantity',
          description: 'Kitchen Display software requires exactly one display unit',
          ruleType: 'quantity',
          softwareModuleIds: ['kitchen-display'],
          hardwareItemIds: ['kitchen-display'],
          ruleValue: '1',
          priority: 3
        }
      ];

      setSoftwareModules(mockSoftwareModules);
      setHardwareItems(mockHardwareItems);
      setRecommendationRules(mockRecommendationRules);
      setBusinessRules(mockBusinessRules);
      setLoading(false);
    } catch (error) {
      console.error('Error loading configuration data:', error);
      setLoading(false);
    }
  };

  const addRecommendationRule = () => {
    const newRule: RecommendationRule = {
      id: crypto.randomUUID(),
      softwareModuleId: '',
      hardwareItemId: '',
      defaultQuantity: 1,
      isRequired: true,
      reason: '',
      costMultiplier: 1.0
    };
    setEditingRule(newRule);
  };

  const editRecommendationRule = (rule: RecommendationRule) => {
    setEditingRule(rule);
  };

  const deleteRecommendationRule = (ruleId: string) => {
    setRecommendationRules(prev => prev.filter(r => r.id !== ruleId));
  };

  const saveRecommendationRule = () => {
    if (editingRule) {
      if (editingRule.id && editingRule.id !== 'new') {
        // Update existing rule
        setRecommendationRules(prev => 
          prev.map(r => r.id === editingRule.id ? editingRule : r)
        );
      } else {
        // Add new rule
        const newRule = { ...editingRule, id: crypto.randomUUID() };
        setRecommendationRules(prev => [...prev, newRule]);
      }
      setEditingRule(null);
    }
  };

  const addBusinessRule = () => {
    const newRule: BusinessRule = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      ruleType: 'dependency',
      softwareModuleIds: [],
      hardwareItemIds: [],
      ruleValue: '',
      priority: 1
    };
    setEditingBusinessRule(newRule);
  };

  const editBusinessRule = (rule: BusinessRule) => {
    setEditingBusinessRule(rule);
  };

  const deleteBusinessRule = (ruleId: string) => {
    setBusinessRules(prev => prev.filter(r => r.id !== ruleId));
  };

  const saveBusinessRule = () => {
    if (editingBusinessRule) {
      if (editingBusinessRule.id && editingBusinessRule.id !== 'new') {
        // Update existing rule
        setBusinessRules(prev => 
          prev.map(r => r.id === editingBusinessRule.id ? editingBusinessRule : r)
        );
      } else {
        // Add new rule
        const newRule = { ...editingBusinessRule, id: crypto.randomUUID() };
        setBusinessRules(prev => [...prev, newRule]);
      }
      setEditingBusinessRule(null);
    }
  };

  const saveAllConfigurations = async () => {
    try {
      // Save to backend - replace with actual API calls
      const configurationData = {
        softwareModules,
        hardwareItems,
        recommendationRules,
        businessRules,
        updatedAt: new Date().toISOString(),
        updatedBy: currentRole
      };

      // Log to audit system instead of console in production
      if (import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true') {
        console.log('Saving configuration data:', configurationData);
      }
      
      // TODO: Replace with actual API call
      // await saveConfigurationToBackend(configurationData);
      
      toast.success('Configuration saved successfully');
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Failed to save configuration');
    }
  };

  if (loading) {
    return <ContentLoader />;
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
        <span className="text-gray-900 font-medium">Platform Configuration</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Configuration</h1>
          <p className="text-gray-600 mt-1">
            Manage platform-level settings, organizations, users, and system configurations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <roleConfig.icon className="h-3 w-3" />
            <span>{roleConfig.displayName}</span>
          </Badge>
        </div>
      </div>

      {/* Main Configuration Interface */}
      <div className="w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="organizations" className="flex items-center space-x-2">
              <Building className="h-4 w-4" />
              <span>Organizations</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>User Management</span>
            </TabsTrigger>
            <TabsTrigger value="software" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Software & Hardware</span>
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Recommendation Rules</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Audit & Logs</span>
            </TabsTrigger>
          </TabsList>

          {/* Organizations Tab */}
          <TabsContent value="organizations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>Organization Management</span>
                </CardTitle>
                <CardDescription>
                  Manage organizations, their details, and configurations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Organizations</h3>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Organization
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Building className="h-5 w-5 text-blue-600" />
                          <h4 className="font-medium">SmartQ Solutions</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">Primary organization for SmartQ LaunchPad</p>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>User Management</span>
                </CardTitle>
                <CardDescription>
                  Manage user accounts, roles, and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">User Accounts</h3>
                    <Button onClick={() => navigate('/platform-configuration/admin')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Users className="h-5 w-5 text-green-600" />
                          <h4 className="font-medium">Admin Users</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">Full system access and configuration rights</p>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Software & Hardware Tab */}
          <TabsContent value="software" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <span>Software & Hardware Catalog</span>
                </CardTitle>
                <CardDescription>
                  Manage software modules and hardware inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Software Modules</h3>
                      <div className="space-y-2">
                        {softwareModules.map(software => (
                          <div key={software.id} className="flex items-center justify-between p-2 border rounded">
                            <span>{software.name}</span>
                            <Badge variant="outline">{software.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-3">Hardware Items</h3>
                      <div className="space-y-2">
                        {hardwareItems.map(hardware => (
                          <div key={hardware.id} className="flex items-center justify-between p-2 border rounded">
                            <span>{hardware.name}</span>
                            <Badge variant="outline">{hardware.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendation Rules Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recommendation Rules</h2>
                <p className="text-gray-600 mt-1">Manage hardware/software mappings, dependencies, and business logic</p>
              </div>
              <Button onClick={() => toast.success('Configuration saved successfully')} className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Save All Changes</span>
              </Button>
            </div>

            {/* Recommendation Rules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-4 w-4" />
                  <span>Hardware-Software Mappings</span>
                </CardTitle>
                <CardDescription>
                  Define which hardware items are recommended for each software module
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Recommendation Rules</h3>
                    <Button onClick={() => toast.info('Add rule functionality coming soon')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Rule
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 grid grid-cols-4 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Software</Label>
                          <p className="text-sm text-gray-600">POS System</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Hardware</Label>
                          <p className="text-sm text-gray-600">POS Terminal</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Default Qty</Label>
                          <p className="text-sm text-gray-600">1</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Required</Label>
                          <Badge variant="default">Yes</Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => toast.info('Edit functionality coming soon')}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => toast.info('Delete functionality coming soon')}>
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 grid grid-cols-4 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Software</Label>
                          <p className="text-sm text-gray-600">POS System</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Hardware</Label>
                          <p className="text-sm text-gray-600">Thermal Printer</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Default Qty</Label>
                          <p className="text-sm text-gray-600">1</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Required</Label>
                          <Badge variant="default">Yes</Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => toast.info('Edit functionality coming soon')}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => toast.info('Delete functionality coming soon')}>
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 grid grid-cols-4 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Software</Label>
                          <p className="text-sm text-gray-600">Kiosk Software</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Hardware</Label>
                          <p className="text-sm text-gray-600">Touch Screen</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Default Qty</Label>
                          <p className="text-sm text-gray-600">1</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Required</Label>
                          <Badge variant="default">Yes</Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => toast.info('Edit functionality coming soon')}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => toast.info('Delete functionality coming soon')}>
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Rules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Business Rules & Dependencies</span>
                </CardTitle>
                <CardDescription>
                  Define complex business logic, dependencies, and exclusions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Business Rules</h3>
                    <Button onClick={() => toast.info('Add business rule functionality coming soon')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Rule
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">POS Hardware Dependency</h4>
                        <p className="text-sm text-gray-600">POS System requires POS Terminal, Printer, and Cash Drawer</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <Badge variant="outline">dependency</Badge>
                          <span>Priority: 1</span>
                          <span>Value: required</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => toast.info('Edit functionality coming soon')}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => toast.info('Delete functionality coming soon')}>
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">Kiosk Display Requirement</h4>
                        <p className="text-sm text-gray-600">Kiosk Software requires touch screen display</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <Badge variant="outline">dependency</Badge>
                          <span>Priority: 2</span>
                          <span>Value: required</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => toast.info('Edit functionality coming soon')}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => toast.info('Delete functionality coming soon')}>
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit & Logs Tab */}
          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Audit & System Logs</span>
                </CardTitle>
                <CardDescription>
                  View system logs, audit trails, and activity records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">System Logs</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 border rounded">
                          <span>User login</span>
                          <Badge variant="outline">Info</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded">
                          <span>Configuration change</span>
                          <Badge variant="outline">Warning</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded">
                          <span>System backup</span>
                          <Badge variant="outline">Info</Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-3">Activity Logs</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 border rounded">
                          <span>User management</span>
                          <Badge variant="outline">Admin</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded">
                          <span>Configuration update</span>
                          <Badge variant="outline">Admin</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded">
                          <span>System maintenance</span>
                          <Badge variant="outline">System</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Recommendation Rule Dialog */}
      {editingRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Edit Recommendation Rule</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="softwareModule">Software Module</Label>
                <Select value={editingRule.softwareModuleId} onValueChange={(value) => setEditingRule({...editingRule, softwareModuleId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select software module" />
                  </SelectTrigger>
                  <SelectContent>
                    {softwareModules.map(software => (
                      <SelectItem key={software.id} value={software.id}>
                        {software.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="hardwareItem">Hardware Item</Label>
                <Select value={editingRule.hardwareItemId} onValueChange={(value) => setEditingRule({...editingRule, hardwareItemId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hardware item" />
                  </SelectTrigger>
                  <SelectContent>
                    {hardwareItems.map(hardware => (
                      <SelectItem key={hardware.id} value={hardware.id}>
                        {hardware.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="defaultQuantity">Default Quantity</Label>
                <Input
                  type="number"
                  value={editingRule.defaultQuantity}
                  onChange={(e) => setEditingRule({...editingRule, defaultQuantity: parseInt(e.target.value) || 1})}
                  min="1"
                />
              </div>
              
              <div>
                <Label htmlFor="reason">Reason</Label>
                <Input
                  value={editingRule.reason}
                  onChange={(e) => setEditingRule({...editingRule, reason: e.target.value})}
                  placeholder="Why is this hardware required?"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={editingRule.isRequired}
                  onChange={(e) => setEditingRule({...editingRule, isRequired: e.target.checked})}
                />
                <Label htmlFor="isRequired">Required (cannot be removed)</Label>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={saveRecommendationRule} className="flex-1">Save</Button>
                <Button variant="outline" onClick={() => setEditingRule(null)} className="flex-1">Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Business Rule Dialog */}
      {editingBusinessRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Edit Business Rule</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="ruleName">Rule Name</Label>
                <Input
                  value={editingBusinessRule.name}
                  onChange={(e) => setEditingBusinessRule({...editingBusinessRule, name: e.target.value})}
                  placeholder="Enter rule name"
                />
              </div>
              
              <div>
                <Label htmlFor="ruleDescription">Description</Label>
                <Input
                  value={editingBusinessRule.description}
                  onChange={(e) => setEditingBusinessRule({...editingBusinessRule, description: e.target.value})}
                  placeholder="Enter rule description"
                />
              </div>
              
              <div>
                <Label htmlFor="ruleType">Rule Type</Label>
                <Select value={editingBusinessRule.ruleType} onValueChange={(value: any) => setEditingBusinessRule({...editingBusinessRule, ruleType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dependency">Dependency</SelectItem>
                    <SelectItem value="exclusion">Exclusion</SelectItem>
                    <SelectItem value="quantity">Quantity</SelectItem>
                    <SelectItem value="cost">Cost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="ruleValue">Rule Value</Label>
                <Input
                  value={editingBusinessRule.ruleValue}
                  onChange={(e) => setEditingBusinessRule({...editingBusinessRule, ruleValue: e.target.value})}
                  placeholder="Enter rule value"
                />
              </div>
              
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Input
                  type="number"
                  value={editingBusinessRule.priority}
                  onChange={(e) => setEditingBusinessRule({...editingBusinessRule, priority: parseInt(e.target.value) || 1})}
                  min="1"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={saveBusinessRule} className="flex-1">Save</Button>
                <Button variant="outline" onClick={() => setEditingBusinessRule(null)} className="flex-1">Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 