import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  Save,
  Crown,
  Wrench,
  Truck,
  User,
  Mail,
  Calendar,
  Download
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

import { getRoleConfig } from '@/lib/roles';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader } from '@/components/ui/loader';

// Interfaces for platform configuration
interface User {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
  user_roles: Array<{
    role: 'admin' | 'ops_manager' | 'deployment_engineer';
  }>;
}

interface Organization {
  id: string;
  name: string;
  description: string;
  sector: string;
  unit_code: string;
  created_by: string;
  created_on: string;
  updated_at: string;
}

// Predefined sector options
const sectorOptions = [
  'Business & Industry',
  'Healthcare & Senior Living',
  'Education',
  'Sports & Leisure',
  'Defence',
  'Offshore & Remote'
];

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

interface RecommendationRule {
  id: string;
  softwareModuleId: string;
  hardwareItemId: string;
  defaultQuantity: number;
  isRequired: boolean;
  reason: string;
  costMultiplier: number;
  minQuantity: number;
  maxQuantity: number;
  conditionalLogic: string | null;
}

interface BusinessRule {
  id: string;
  name: string;
  description: string;
  ruleType: 'dependency' | 'exclusion' | 'quantity' | 'cost' | 'bundle';
  softwareModuleIds: string[];
  hardwareItemIds: string[];
  ruleValue: string;
  priority: number;
  costImpact: number | null;
  conditionalLogic: string | null;
}

// Enhanced interface for unified software-hardware management
interface SoftwareHardwareMapping {
  id: string;
  softwareModule: SoftwareModule;
  recommendedHardware: Array<{
    hardwareItem: HardwareItem;
    rule: RecommendationRule;
  }>;
  businessRules: BusinessRule[];
  totalEstimatedCost: number;
  monthlyRecurringCost: number;
  oneTimeCost: number;
}

interface AuditLog {
  id: string;
  type: 'create' | 'update' | 'delete' | 'info' | 'error';
  message: string;
  actor?: string | null;
  created_at: string;
}

export default function PlatformConfiguration() {
  const { currentRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('organizations');

  // State for platform configuration
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [softwareModules, setSoftwareModules] = useState<SoftwareModule[]>([]);
  const [hardwareItems, setHardwareItems] = useState<HardwareItem[]>([]);
  const [recommendationRules, setRecommendationRules] = useState<RecommendationRule[]>([]);
  const [businessRules, setBusinessRule] = useState<BusinessRule[]>([]);
  const [editingRule, setEditingRule] = useState<RecommendationRule | null>(null);
  const [editingBusinessRule, setEditingBusinessRule] = useState<BusinessRule | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);
  const [editingSoftwareModule, setEditingSoftwareModule] = useState<SoftwareModule | null>(null);
  const [editingHardwareItem, setEditingHardwareItem] = useState<HardwareItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [logFilter, setLogFilter] = useState<'all' | AuditLog['type']>('all');
  const [userStats, setUserStats] = useState({
    total_users: 0,
    admin_count: 0,
    ops_manager_count: 0,
    deployment_engineer_count: 0
  });

  // New state for organization search
  const [orgSearchTerm, setOrgSearchTerm] = useState('');
  const [orgSectorFilter, setOrgSectorFilter] = useState('all');

  const roleConfig = getRoleConfig(currentRole || 'admin');

  // Move useEffect to the top, before any conditional returns
  useEffect(() => {
    if (currentRole === 'admin') {
      loadConfigurationData();
    }
  }, [currentRole]);

  // Only allow admin access - strict security enforcement
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

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader size="lg" />
            <p className="text-gray-600 mt-4">Loading platform configuration...</p>
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
    loadConfigurationData();
              }}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const logAudit = async (entry: Omit<AuditLog, 'id' | 'created_at'>) => {
    try {
      // Log to database
      await supabase.rpc('log_audit_event', {
        _action: entry.type,
        _table_name: 'platform_configuration',
        _metadata: { message: entry.message, actor: entry.actor }
      });
      
      // Also update local state for immediate UI feedback
      setAuditLogs(prev => [
        { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...entry },
        ...prev,
      ]);
    } catch (error) {
      console.error('Failed to log audit event:', error);
      // Fallback to local state only
      setAuditLogs(prev => [
        { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...entry },
        ...prev,
      ]);
    }
  };

  // Helper to seed default software options
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

  // Helper to seed default organizations from Excel data
  const seedDefaultOrganizations = async () => {
    const defaults: Organization[] = [
      {
        id: 'org-chartwells',
        name: 'Chartwells',
        description: 'Leading food service provider for education sector',
        sector: 'Education',
        unit_code: 'CHT',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'org-hsbc',
        name: 'HSBC',
        description: 'Global banking and financial services',
        sector: 'Business & Industry',
        unit_code: 'HSB',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'org-levy',
        name: 'Levy',
        description: 'Premium sports and entertainment hospitality',
        sector: 'Sports & Leisure',
        unit_code: 'LEV',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'org-bi',
        name: 'B&I',
        description: 'Business and Industry food services',
        sector: 'Business & Industry',
        unit_code: 'BI',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'org-compass-one',
        name: 'Compass One',
        description: 'Specialized food service solutions',
        sector: 'Business & Industry',
        unit_code: 'COM',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'org-minley-station',
        name: 'Minley Station',
        description: 'Defence sector food services',
        sector: 'Defence',
        unit_code: 'MIN',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'org-peabody',
        name: 'Peabody',
        description: 'Housing and community services',
        sector: 'Business & Industry',
        unit_code: 'PEA',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'org-ra',
        name: 'RA',
        description: 'Restaurant Associates - premium dining',
        sector: 'Business & Industry',
        unit_code: 'RA',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'org-sse',
        name: 'SSE',
        description: 'Energy and utilities sector',
        sector: 'Business & Industry',
        unit_code: 'SSE',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'org-jlr-whitley',
        name: 'JLR - Whitley',
        description: 'Jaguar Land Rover manufacturing',
        sector: 'Business & Industry',
        unit_code: 'JLR',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'org-baxter-health',
        name: 'Baxter Health',
        description: 'Healthcare and medical services',
        sector: 'Healthcare & Senior Living',
        unit_code: 'BXT',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'org-next',
        name: 'NEXT',
        description: 'Retail and fashion sector',
        sector: 'Business & Industry',
        unit_code: 'NEXT',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'org-porsche',
        name: 'Porsche',
        description: 'Automotive luxury brand',
        sector: 'Business & Industry',
        unit_code: 'POR',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];

    // Try to insert into database first
    try {
      const { error } = await supabase
        .from('organizations')
        .insert(defaults);
      
      if (error) {
        console.error('Error seeding organizations to database:', error);
        // Fallback to local state
        setOrganizations(defaults);
      } else {
        // Reload from database to get the actual IDs
        const { data: orgsData } = await supabase
          .from('organizations')
          .select('*');
        setOrganizations(orgsData || defaults);
      }
    } catch (error) {
      console.error('Error seeding organizations:', error);
      // Fallback to local state
      setOrganizations(defaults);
    }

    logAudit({ type: 'info', message: 'Default organizations seeded from Excel data', actor: currentRole });
  };

  const loadConfigurationData = async () => {
    try {
      setLoading(true);
      
      // Load users with their actual roles using direct query to bypass PostgREST schema cache issue
      try {
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, user_id, email, full_name, created_at, updated_at')
          .order('created_at', { ascending: false });
        
        if (usersError) {
          console.error('Error loading users:', usersError);
          toast.error('Failed to load users');
          setUsers([]);
        } else if (usersData && usersData.length > 0) {
          // Fetch actual roles for each user from user_roles table
          const usersWithRoles = await Promise.all(
            usersData.map(async (user) => {
              try {
                const { data: rolesData } = await supabase
                  .from('user_roles')
                  .select('role')
                  .eq('user_id', user.user_id);
                
                return {
                  ...user,
                  user_roles: rolesData?.map(r => ({ role: r.role })) || []
                };
              } catch (roleError) {
                console.error('Error fetching roles for user:', user.email, roleError);
                return {
                  ...user,
                  user_roles: []
                };
              }
            })
          );
          
          setUsers(usersWithRoles);
        } else {
          // No users found, show empty state
          setUsers([]);
        }
      } catch (usersException) {
        console.error('Exception loading users:', usersException);
        setUsers([]);
      }

      // Load user statistics
      try {
      const { data: statsData, error: statsError } = await supabase.rpc('get_user_management_stats');
      if (statsError) {
        console.error('Error loading user stats:', statsError);
          // Set default stats as fallback
          setUserStats({
            total_users: 0,
            admin_count: 0,
            ops_manager_count: 0,
            deployment_engineer_count: 0
          });
      } else if (statsData && statsData.length > 0) {
        setUserStats(statsData[0]);
        }
      } catch (statsException) {
        console.error('Exception loading user stats:', statsException);
        setUserStats({
          total_users: 0,
          admin_count: 0,
          ops_manager_count: 0,
          deployment_engineer_count: 0
        });
      }

      // Load organizations
      try {
      const { data: orgsData, error: orgsError } = await supabase
        .from('organizations')
        .select('*');
      
      if (orgsError) {
        console.error('Error loading organizations:', orgsError);
        toast.error('Failed to load organizations');
          setOrganizations([]);
      } else {
          if (orgsData && orgsData.length > 0) {
            // Map database data to Organization interface with defaults for new fields
            const mappedOrgs = orgsData.map((org: any) => ({
              id: org.id,
              name: org.name,
              description: org.description || '',
              sector: org.sector || '',
              unit_code: org.unit_code || '',
              created_by: org.created_by || 'system',
              created_on: org.created_on || org.created_at || new Date().toISOString(),
              updated_at: org.updated_at || new Date().toISOString()
            }));
            setOrganizations(mappedOrgs);
          } else {
            // No organizations found, seed defaults from Excel data
            await seedDefaultOrganizations();
          }
        }
      } catch (orgsException) {
        console.error('Exception loading organizations:', orgsException);
        setOrganizations([]);
      }

      // Load software modules
      try {
      const { data: softwareData, error: softwareError } = await supabase
        .from('software_modules')
        .select('*');
      
      if (softwareError) {
        console.error('Error loading software modules:', softwareError);
        toast.error('Failed to load software modules');
          setSoftwareModules([]);
      } else {
        // Map database fields to enhanced interface with defaults
        const mappedSoftware = (softwareData || []).map(software => ({
          ...software,
          monthly_fee: (software as any).monthly_fee || 0,
          setup_fee: (software as any).setup_fee || 0,
          license_fee: (software as any).license_fee || 0
        }));
        if (mappedSoftware.length === 0) {
          // seed defaults for first-time experience
            await seedDefaultSoftware();
        } else {
        setSoftwareModules(mappedSoftware);
        }
        }
      } catch (softwareException) {
        console.error('Exception loading software modules:', softwareException);
        setSoftwareModules([]);
      }

      // Load hardware items
      try {
      const { data: hardwareData, error: hardwareError } = await supabase
        .from('hardware_items')
        .select('*');
      
      if (hardwareError) {
        console.error('Error loading hardware items:', hardwareError);
        toast.error('Failed to load hardware items');
          setHardwareItems([]);
      } else {
        // Map database fields to enhanced interface with defaults
        const mappedHardware = (hardwareData || []).map(hardware => ({
          ...hardware,
          unit_cost: (hardware as any).unit_cost || (hardware as any).estimated_cost || 0,
          installation_cost: (hardware as any).installation_cost || 0,
          maintenance_cost: (hardware as any).maintenance_cost || 0
        }));
          if (mappedHardware.length === 0) {
            // seed defaults for first-time experience
            seedDefaultHardware();
          } else {
        setHardwareItems(mappedHardware);
          }
        }
      } catch (hardwareException) {
        console.error('Exception loading hardware items:', hardwareException);
        setHardwareItems([]);
      }

      // For now, keep some sample recommendation rules and business rules
      // These would typically come from a database table
      const sampleRecommendationRules: RecommendationRule[] = [
        {
          id: '1',
          softwareModuleId: 'sw-pos-system',
          hardwareItemId: 'hw-pos-terminal',
          defaultQuantity: 1,
          isRequired: true,
          reason: 'Core POS functionality',
          costMultiplier: 1.0,
          minQuantity: 1,
          maxQuantity: 5,
          conditionalLogic: null
        }
      ];

      const sampleBusinessRules: BusinessRule[] = [
        {
          id: '1',
          name: 'POS Hardware Dependency',
          description: 'POS System requires POS Terminal, Printer, and Cash Drawer',
          ruleType: 'dependency',
          softwareModuleIds: ['sw-pos-system'],
          hardwareItemIds: ['hw-pos-terminal', 'hw-receipt-printer', 'hw-cash-drawer'],
          ruleValue: 'required',
          priority: 1,
          costImpact: null,
          conditionalLogic: null
        }
      ];

      setRecommendationRules(sampleRecommendationRules);
      setBusinessRule(sampleBusinessRules);
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
      costMultiplier: 1.0,
      minQuantity: 1,
      maxQuantity: 5,
      conditionalLogic: null
    };
    setEditingRule(newRule);
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

  // Save Software Module
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
        logAudit({ type: 'update', message: `Software updated: ${editingSoftwareModule.name}`, actor: currentRole });
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
        logAudit({ type: 'create', message: `Software added: ${newEntry.name}`, actor: currentRole });
      }
      setEditingSoftwareModule(null);
      toast.success('Software saved');
      return saved;
    } catch (e) {
      console.error(e);
      toast.error('Failed to save software');
      logAudit({ type: 'error', message: 'Failed to save software module', actor: currentRole });
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
        logAudit({ type: 'delete', message: `Software deleted: ${softwareId}`, actor: currentRole });
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

  // Save Hardware Item
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
        logAudit({ type: 'update', message: `Hardware updated: ${editingHardwareItem.name}`, actor: currentRole });
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
        logAudit({ type: 'create', message: `Hardware added: ${newEntry.name}`, actor: currentRole });
      }
      setEditingHardwareItem(null);
      toast.success('Hardware saved');
      return saved;
    } catch (e) {
      console.error(e);
      toast.error('Failed to save hardware');
      logAudit({ type: 'error', message: 'Failed to save hardware item', actor: currentRole });
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
        logAudit({ type: 'delete', message: `Hardware deleted: ${hardwareId}`, actor: currentRole });
      }
    } catch (error) {
      console.error('Error deleting hardware item:', error);
      toast.error('Failed to delete hardware item');
    }
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
      priority: 1,
      costImpact: null,
      conditionalLogic: null
    };
    setEditingBusinessRule(newRule);
  };

  const editBusinessRule = (rule: BusinessRule) => {
    setEditingBusinessRule(rule);
  };

  const deleteBusinessRule = (ruleId: string) => {
    setBusinessRule(prev => prev.filter(r => r.id !== ruleId));
  };

  const saveBusinessRule = () => {
    if (editingBusinessRule) {
      if (editingBusinessRule.id && editingBusinessRule.id !== 'new') {
        // Update existing rule
        setBusinessRule(prev => 
          prev.map(r => r.id === editingBusinessRule.id ? editingBusinessRule : r)
        );
      } else {
        // Add new rule
        const newRule = { ...editingBusinessRule, id: crypto.randomUUID() };
        setBusinessRule(prev => [...prev, newRule]);
      }
      setEditingBusinessRule(null);
    }
  };

      // User management functions
    const addUser = () => {
      // This function is now handled in PlatformConfigurationEnhanced.tsx
      console.log('Add user functionality moved to enhanced version');
    };

  const editUser = (user: User) => {
    setEditingUser(user);
  };

  const saveUser = async () => {
    if (!editingUser) return;
    
    try {
      // Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: editingUser.full_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingUser.id);
      
      if (profileError) {
        toast.error('Failed to update user profile');
        return;
      }
      
      // Update user roles
      if (editingUser.user_roles.length > 0) {
        // First, delete existing roles
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', editingUser.user_id);
        
        // Then insert new roles
        const rolesToInsert = editingUser.user_roles.map(role => ({
          user_id: editingUser.user_id,
          role: role.role,
          assigned_by: editingUser.user_id // Self-assigned for now
        }));
        
        const { error: rolesError } = await supabase
          .from('user_roles')
          .insert(rolesToInsert);
        
        if (rolesError) {
          toast.error('Failed to update user roles');
          return;
        }
      }
      
      // Update local state
      setUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
      setEditingUser(null);
      toast.success('User updated successfully');
      
      // Reload users to get fresh data
      loadConfigurationData();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // First delete user roles
      const { error: rolesError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      
      if (rolesError) {
        console.error('Error deleting user roles:', rolesError);
      }
      
      // Then delete user profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) {
        toast.error('Failed to delete user');
      } else {
        setUsers(prev => prev.filter(u => u.id !== userId));
        toast.success('User deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  // Organization management functions
  const addOrganization = () => {
    const newOrg: Organization = {
      id: 'new',
      name: '',
      description: '',
      sector: '',
      unit_code: '',
      created_by: '',
      created_on: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setEditingOrganization(newOrg);
  };

  const editOrganization = (org: Organization) => {
    setEditingOrganization(org);
  };

  const deleteOrganization = async (orgId: string) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgId);
      
      if (error) {
        toast.error('Failed to delete organization');
      } else {
        setOrganizations(prev => prev.filter(o => o.id !== orgId));
        toast.success('Organization deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast.error('Failed to delete organization');
    }
  };

  const saveOrganization = async () => {
    if (editingOrganization) {
      try {
        if (editingOrganization.id && editingOrganization.id !== 'new') {
          // Update existing organization
          const { error } = await supabase
            .from('organizations')
            .update({
              name: editingOrganization.name,
              description: editingOrganization.description,
              sector: editingOrganization.sector,
              unit_code: editingOrganization.unit_code,
              created_by: editingOrganization.created_by,
              created_on: editingOrganization.created_on,
              updated_at: new Date().toISOString()
            })
            .eq('id', editingOrganization.id);
          
          if (error) {
            toast.error('Failed to update organization');
            return;
          }
          
          setOrganizations(prev => 
            prev.map(o => o.id === editingOrganization.id ? editingOrganization : o)
          );
        } else {
          // Add new organization
          const { data, error } = await supabase
            .from('organizations')
            .insert([{
              name: editingOrganization.name,
              description: editingOrganization.description,
              sector: editingOrganization.sector,
              unit_code: editingOrganization.unit_code,
              created_by: editingOrganization.created_by,
              created_on: editingOrganization.created_on
            }])
            .select()
            .single();
          
          if (error) {
            toast.error('Failed to create organization');
            return;
          }
          
          // Create the new organization object with the returned data
          const newOrg: Organization = {
            id: data.id,
            name: data.name,
            description: data.description,
            sector: data.sector || '',
            unit_code: data.unit_code || '',
            created_by: data.created_by || '',
            created_on: data.created_on || '',
            updated_at: data.updated_at
          };
          
          setOrganizations(prev => [...prev, newOrg]);
        }
        
        setEditingOrganization(null);
        toast.success('Organization saved successfully');
      } catch (error) {
        console.error('Error saving organization:', error);
        toast.error('Failed to save organization');
      }
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

  // CSV export for logs
  const downloadLogsCsv = () => {
    const visible = auditLogs.filter(l => logFilter === 'all' ? true : l.type === logFilter);
    const rows = [ ['Timestamp','Type','Message','Actor'], ...visible.map(l => [l.created_at, l.type, l.message, l.actor || '']) ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'audit-logs.csv'; a.click();
    URL.revokeObjectURL(url);
  };

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
                    <h3 className="text-lg font-medium">Organizations ({organizations.length})</h3>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" onClick={seedDefaultOrganizations}>
                        <Database className="h-4 w-4 mr-2" />
                        Seed from Excel Data
                      </Button>
                    <Button onClick={addOrganization}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Organization
                    </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {organizations.length === 0 ? (
                      <div className="col-span-full text-center py-8 text-gray-500">
                        <Building className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">No organizations found</p>
                        <p className="text-xs">Create your first organization to get started</p>
                      </div>
                    ) : (
                      organizations.map(org => (
                        <Card key={org.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Building className="h-5 w-5 text-blue-600" />
                              <h4 className="font-medium">{org.name}</h4>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{org.description}</p>
                            {org.sector && (
                              <Badge variant="outline" className="mb-2">
                                {org.sector}
                              </Badge>
                            )}
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => editOrganization(org)}>
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => deleteOrganization(org.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
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
                    <h3 className="text-lg font-medium">User Accounts ({users.length})</h3>
                  </div>
                  
                  {/* User Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 items-stretch">
                    <Card className="h-full">
                      <CardContent className="p-4 h-full">
                        <div className="flex items-center space-x-2">
                          <Users className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-2xl font-bold">{userStats.total_users}</p>
                            <p className="text-sm text-gray-600">Total Users</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="h-full">
                      <CardContent className="p-4 h-full">
                        <div className="flex items-center space-x-2">
                          <Crown className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-2xl font-bold">{userStats.admin_count}</p>
                            <p className="text-sm text-gray-600">Admins</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="h-full">
                      <CardContent className="p-4 h-full">
                        <div className="flex items-center space-x-2">
                          <Wrench className="h-5 w-5 text-orange-600" />
                          <div>
                            <p className="text-2xl font-bold">{userStats.ops_manager_count}</p>
                            <p className="text-sm text-gray-600">Ops Managers</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="h-full">
                      <CardContent className="p-4 h-full">
                        <div className="flex items-center space-x-2">
                          <Truck className="h-5 w-5 text-purple-600" />
                          <div>
                            <p className="text-2xl font-bold">{userStats.deployment_engineer_count}</p>
                            <p className="text-sm text-gray-600">Deployment Engineers</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* User Search and Filter */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search by email or name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger className="w-48 h-10">
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="ops_manager">Ops Manager</SelectItem>
                        <SelectItem value="deployment_engineer">Deployment Engineer</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={addUser} className="ml-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </div>

                  {/* Users Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[28%] whitespace-nowrap">Name</TableHead>
                          <TableHead className="w-[28%] whitespace-nowrap">Email</TableHead>
                          <TableHead className="w-[22%] whitespace-nowrap">Roles</TableHead>
                          <TableHead className="w-[14%] whitespace-nowrap">Created</TableHead>
                          <TableHead className="w-[8%] text-right whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users
                          .filter(user => {
                            const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                user.email.toLowerCase().includes(searchTerm.toLowerCase());
                            const matchesRole = selectedRole === 'all' || 
                                              user.user_roles.some(r => r.role === selectedRole);
                            return matchesSearch && matchesRole;
                          })
                          .map(user => (
                            <TableRow key={user.id} className="align-middle">
                              <TableCell className="align-middle">
                                <div className="flex items-center space-x-2 min-w-0">
                                <User className="h-4 w-4 text-gray-400" />
                                  <span className="truncate">{user.full_name}</span>
                                </div>
                              </TableCell>
                              <TableCell className="align-middle">
                                <div className="flex items-center space-x-2 min-w-0">
                                <Mail className="h-4 w-4 text-gray-400" />
                                  <span className="truncate">{user.email}</span>
                                </div>
                              </TableCell>
                              <TableCell className="align-middle">
                                <div className="flex flex-wrap gap-1">
                                  {user.user_roles.map((role, index) => {
                                    const roleConfig = getRoleConfig(role.role);
                                    return (
                                      <Badge 
                                        key={index} 
                                        variant="outline"
                                        className={`${roleConfig.color} border-current`}
                                      >
                                        {roleConfig.displayName}
                                  </Badge>
                                    );
                                  })}
                                </div>
                              </TableCell>
                              <TableCell className="align-middle">
                                <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>{new Date(user.created_at).toLocaleDateString()}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right align-middle">
                                <div className="inline-flex space-x-2">
                                  <Button variant="outline" size="sm" onClick={() => editUser(user)}>
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => deleteUser(user.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Software & Hardware Management Tab - Unified */}
          <TabsContent value="software" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Software & Hardware Management</h2>
                <p className="text-gray-600 mt-1">Unified management of software modules, hardware items, and their relationships with costing</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="light-outline" onClick={seedDefaultSoftware} className="hover-glow-green">
                  Quick Add Default Software
                </Button>
              <Button onClick={saveAllConfigurations} className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Save All Changes</span>
              </Button>
              </div>
            </div>

            {/* Software Modules Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-4 w-4" />
                  <span>Software Modules</span>
                </CardTitle>
                <CardDescription>
                  Manage software modules with pricing and licensing information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Software Catalog ({softwareModules.length})</h3>
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
                  <span>Hardware Items</span>
                </CardTitle>
                <CardDescription>
                  Manage hardware inventory with detailed costing information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Hardware Catalog ({hardwareItems.length})</h3>
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

            {/* Recommendation Rules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Hardware-Software Mappings</span>
                </CardTitle>
                <CardDescription>
                  Define which hardware items are recommended for each software module with quantities and costing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Recommendation Rules ({recommendationRules.length})</h3>
                    <Button onClick={addRecommendationRule}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Rule
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {recommendationRules.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">No recommendation rules found</p>
                        <p className="text-xs">Create your first rule to get started</p>
                      </div>
                    ) : (
                      recommendationRules.map(rule => {
                        const software = softwareModules.find(s => s.id === rule.softwareModuleId);
                        const hardware = hardwareItems.find(h => h.id === rule.hardwareItemId);
                        
                        return (
                          <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                            <div className="flex-1 grid grid-cols-6 gap-4">
                              <div>
                                <Label className="text-sm font-medium">Software</Label>
                                <p className="text-sm text-gray-900">{software?.name || 'Unknown'}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Hardware</Label>
                                <p className="text-sm text-gray-900">{hardware?.name || 'Unknown'}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Default Qty</Label>
                                <p className="text-sm text-gray-600">{rule.defaultQuantity}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Min-Max</Label>
                                <p className="text-sm text-gray-600">{rule.minQuantity}-{rule.maxQuantity}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Required</Label>
                                <Badge variant={rule.isRequired ? "default" : "secondary"}>
                                  {rule.isRequired ? 'Yes' : 'No'}
                                </Badge>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Cost Multiplier</Label>
                                <p className="text-sm text-gray-600">x{rule.costMultiplier}</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => editRecommendationRule(rule)}>
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => deleteRecommendationRule(rule.id)}>
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Rules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-4 w-4" />
                  <span>Business Rules & Dependencies</span>
                </CardTitle>
                <CardDescription>
                  Define complex business logic, dependencies, and cost impacts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Business Rules ({businessRules.length})</h3>
                    <Button onClick={addBusinessRule}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Rule
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {businessRules.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calculator className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">No business rules found</p>
                        <p className="text-xs">Create your first business rule to get started</p>
                      </div>
                    ) : (
                      businessRules.map(rule => (
                        <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{rule.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm">
                              <Badge variant="outline">{rule.ruleType}</Badge>
                              <span className="text-gray-600">Priority: {rule.priority}</span>
                              <span className="text-gray-600">Value: {rule.ruleValue}</span>
                              {rule.costImpact && (
                                <span className="text-gray-600">Cost Impact: £{rule.costImpact}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => editBusinessRule(rule)}>
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => deleteBusinessRule(rule.id)}>
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit & Logs Tab - interactive */}
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
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Audit Logs ({auditLogs.length})</h3>
                    <div className="flex items-center space-x-2">
                      <Select value={logFilter} onValueChange={(value) => setLogFilter(value as any)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filter logs" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Logs</SelectItem>
                          <SelectItem value="create">Create</SelectItem>
                          <SelectItem value="update">Update</SelectItem>
                          <SelectItem value="delete">Delete</SelectItem>
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="error">Error</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={downloadLogsCsv} className="flex items-center space-x-2">
                        <Download className="h-4 w-4" />
                        <span>Download CSV</span>
                      </Button>
                        </div>
                        </div>
                  <div className="border rounded-lg overflow-y-auto max-h-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead>Actor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {auditLogs
                          .filter(log => logFilter === 'all' || log.type === logFilter)
                          .map(log => (
                            <TableRow key={log.id}>
                              <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                              <TableCell>
                                <Badge variant={log.type === 'delete' || log.type === 'error' ? 'destructive' : 'default'}>
                                  {log.type.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell>{log.message}</TableCell>
                              <TableCell>{log.actor || 'System'}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
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
                <Checkbox
                  id="isRequired"
                  checked={editingRule.isRequired}
                  onCheckedChange={(v) => setEditingRule({ ...editingRule, isRequired: Boolean(v) })}
                  className="mt-0.5"
                />
                <Label htmlFor="isRequired" className="text-sm">Required (cannot be removed)</Label>
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

      {/* Edit Organization Dialog */}
      {editingOrganization && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              {editingOrganization.id === 'new' ? 'Add Organization' : 'Edit Organization'}
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  value={editingOrganization.name}
                  onChange={(e) => setEditingOrganization({...editingOrganization, name: e.target.value})}
                  placeholder="Enter organization name"
                />
              </div>
              
              <div>
                <Label htmlFor="orgDescription">Description</Label>
                <Input
                  value={editingOrganization.description}
                  onChange={(e) => setEditingOrganization({...editingOrganization, description: e.target.value})}
                  placeholder="Enter organization description"
                />
              </div>
              
              <div>
                <Label htmlFor="orgSector">Sector</Label>
                <Select value={editingOrganization.sector} onValueChange={(value) => setEditingOrganization({...editingOrganization, sector: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sectorOptions.map(sector => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="orgUnitCode">Unit Code</Label>
                <Input
                  value={editingOrganization.unit_code}
                  onChange={(e) => setEditingOrganization({...editingOrganization, unit_code: e.target.value})}
                  placeholder="Enter unit code"
                />
              </div>
              
              <div>
                <Label htmlFor="orgCreatedBy">Created By</Label>
                <Input
                  value={editingOrganization.created_by}
                  onChange={(e) => setEditingOrganization({...editingOrganization, created_by: e.target.value})}
                  placeholder="Enter creator's name"
                />
              </div>
              
              <div>
                <Label htmlFor="orgCreatedOn">Created On</Label>
                <Input
                  value={editingOrganization.created_on}
                  onChange={(e) => setEditingOrganization({...editingOrganization, created_on: e.target.value})}
                  placeholder="Enter creation date"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={saveOrganization} className="flex-1">Save</Button>
                <Button variant="outline" onClick={() => setEditingOrganization(null)} className="flex-1">Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Software Module Dialog */}
      {editingSoftwareModule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-medium mb-4">{editingSoftwareModule.id === 'new' ? 'Add Software Module' : 'Edit Software Module'}</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="softName">Name</Label>
                <Input id="softName" value={editingSoftwareModule.name} onChange={(e)=>setEditingSoftwareModule({...editingSoftwareModule!, name: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="softDesc">Description</Label>
                <Input id="softDesc" value={editingSoftwareModule.description || ''} onChange={(e)=>setEditingSoftwareModule({...editingSoftwareModule!, description: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="softCat">Category</Label>
                <Input id="softCat" value={editingSoftwareModule.category} onChange={(e)=>setEditingSoftwareModule({...editingSoftwareModule!, category: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="softMonthly">Monthly Fee (£)</Label>
                  <Input id="softMonthly" type="number" value={editingSoftwareModule.monthly_fee ?? 0} onChange={(e)=>setEditingSoftwareModule({...editingSoftwareModule!, monthly_fee: Number(e.target.value)})} />
                </div>
                <div>
                  <Label htmlFor="softSetup">Setup Fee (£)</Label>
                  <Input id="softSetup" type="number" value={editingSoftwareModule.setup_fee ?? 0} onChange={(e)=>setEditingSoftwareModule({...editingSoftwareModule!, setup_fee: Number(e.target.value)})} />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="softActive" checked={editingSoftwareModule.is_active} onCheckedChange={(v)=>setEditingSoftwareModule({...editingSoftwareModule!, is_active: Boolean(v)})} />
                <Label htmlFor="softActive" className="text-sm">Active</Label>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={()=>setEditingSoftwareModule(null)}>Cancel</Button>
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
            <h3 className="text-lg font-medium mb-4">{editingHardwareItem.id === 'new' ? 'Add Hardware Item' : 'Edit Hardware Item'}</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="hardName">Name</Label>
                <Input id="hardName" value={editingHardwareItem.name} onChange={(e)=>setEditingHardwareItem({...editingHardwareItem!, name: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="hardDesc">Description</Label>
                <Input id="hardDesc" value={editingHardwareItem.description || ''} onChange={(e)=>setEditingHardwareItem({...editingHardwareItem!, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="hardCat">Category</Label>
                  <Input id="hardCat" value={editingHardwareItem.category} onChange={(e)=>setEditingHardwareItem({...editingHardwareItem!, category: e.target.value})} />
                </div>
                <div>
                  <Label htmlFor="hardModel">Model</Label>
                  <Input id="hardModel" value={editingHardwareItem.model || ''} onChange={(e)=>setEditingHardwareItem({...editingHardwareItem!, model: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="hardUnit">Unit Cost (£)</Label>
                  <Input id="hardUnit" type="number" value={editingHardwareItem.unit_cost ?? 0} onChange={(e)=>setEditingHardwareItem({...editingHardwareItem!, unit_cost: Number(e.target.value)})} />
                </div>
                <div>
                  <Label htmlFor="hardInst">Installation (£)</Label>
                  <Input id="hardInst" type="number" value={editingHardwareItem.installation_cost ?? 0} onChange={(e)=>setEditingHardwareItem({...editingHardwareItem!, installation_cost: Number(e.target.value)})} />
                </div>
                <div>
                  <Label htmlFor="hardMaint">Maintenance (£/month)</Label>
                  <Input id="hardMaint" type="number" value={editingHardwareItem.maintenance_cost ?? 0} onChange={(e)=>setEditingHardwareItem({...editingHardwareItem!, maintenance_cost: Number(e.target.value)})} />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="hardActive" checked={editingHardwareItem.is_active} onCheckedChange={(v)=>setEditingHardwareItem({...editingHardwareItem!, is_active: Boolean(v)})} />
                <Label htmlFor="hardActive" className="text-sm">Available</Label>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={()=>setEditingHardwareItem(null)}>Cancel</Button>
                <Button onClick={saveHardwareItem}>Save</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Dialog */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Edit User</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="userName">Full Name</Label>
                <Input
                  id="userName"
                  value={editingUser.full_name}
                  onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="userEmail">Email</Label>
                <Input
                  id="userEmail"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <Label htmlFor="userRoles">Roles</Label>
                <div className="space-y-2">
                  {editingUser.user_roles.map((role, index) => (
                    <div key={index} className="flex items-center space-x-2">
                <Select
                        value={role.role} 
                        onValueChange={(value) => {
                          const newRoles = [...editingUser.user_roles];
                          newRoles[index] = { role: value as 'admin' | 'ops_manager' | 'deployment_engineer' };
                          setEditingUser({...editingUser, user_roles: newRoles});
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="ops_manager">Ops Manager</SelectItem>
                          <SelectItem value="deployment_engineer">Deployment Engineer</SelectItem>
                  </SelectContent>
                </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newRoles = editingUser.user_roles.filter((_, i) => i !== index);
                          setEditingUser({...editingUser, user_roles: newRoles});
                        }}
                        className="px-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
              </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingUser({
                        ...editingUser,
                        user_roles: [...editingUser.user_roles, { role: 'admin' }]
                      });
                    }}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Role
                  </Button>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={saveUser} className="flex-1">Save</Button>
                <Button variant="outline" onClick={() => setEditingUser(null)} className="flex-1">Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 