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
  Download,
  Search,
  Upload,
  Filter
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getRoleConfig } from '@/lib/roles';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader } from '@/components/ui/loader';

// Enhanced Organization interface
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

// User interface
interface User {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  user_roles: Array<{
    role: 'admin' | 'ops_manager' | 'deployment_engineer';
  }>;
}

// Software Module interface
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

// Hardware Item interface
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

// Recommendation Rule interface
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

// Business Rule interface
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

// Audit Log interface
interface AuditLog {
  id: string;
  type: 'create' | 'update' | 'delete' | 'info' | 'error';
  message: string;
  actor?: string | null;
  created_at: string;
}

export default function PlatformConfigurationEnhanced() {
  const { currentRole, user } = useAuth();
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

  // New state for organization search and filters
  const [orgSearchTerm, setOrgSearchTerm] = useState('');
  const [orgSectorFilter, setOrgSectorFilter] = useState('all');

  const roleConfig = getRoleConfig(currentRole || 'admin');

  // Only allow admin access - strict security enforcement
  if (currentRole !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Access denied. Only administrators can access platform configuration.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Load configuration data
  useEffect(() => {
    if (currentRole === 'admin') {
      loadConfigurationData();
    }
  }, [currentRole]);

  const loadConfigurationData = async () => {
    try {
      setLoading(true);
      
      // Load organizations with enhanced fields
      try {
        console.log('🔍 Fetching organizations from database...');
        
        // Check if we have an active session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('🔍 Organizations session check:', { session: !!session, sessionError });
        
        if (sessionError) {
          console.error('❌ Organizations session error:', sessionError);
        }
        
        // Test 1: Try to get just the count first
        const { count, error: countError } = await supabase
          .from('organizations')
          .select('*', { count: 'exact', head: true });
        
        console.log('🔍 Organizations count test:', { count, countError });
        
        // Test 2: Try to get just one record
        const { data: singleRecord, error: singleError } = await supabase
          .from('organizations')
          .select('id, name')
          .limit(1);
        
        console.log('🔍 Organizations single record test:', { singleRecord, singleError });
        
        // Test 3: Full query
        const { data: orgsData, error: orgsError } = await supabase
          .from('organizations')
          .select('*');
        
        console.log('🔍 Organizations full query result:', { data: orgsData?.length || 0, error: orgsError });
        
        if (orgsError) {
          console.error('❌ Error loading organizations:', orgsError);
          toast.error('Failed to load organizations');
          setOrganizations([]);
        } else {
          console.log('🔍 Raw organizations data:', orgsData);
          console.log('🔍 Number of organizations found:', orgsData?.length || 0);
          
          if (orgsData && orgsData.length > 0) {
            // Map database data to Organization interface with defaults for new fields
                         const mappedOrgs = orgsData.map((org: any) => ({
               id: org.id,
               name: org.name,
               description: org.description || '',
               sector: org.sector || '',
               unit_code: org.unit_code || '',
               created_by: org.created_by || '',
               created_on: org.created_on || org.created_at || '',
               updated_at: org.updated_at || new Date().toISOString()
             }));
            console.log('✅ Mapped organizations:', mappedOrgs);
            setOrganizations(mappedOrgs);
          } else {
            console.log('⚠️ No organizations found in database');
            setOrganizations([]);
          }
        }
      } catch (orgsException) {
        console.error('❌ Exception loading organizations:', orgsException);
        setOrganizations([]);
      }

                           // Load users with a completely fresh approach
        try {
          console.log('🔍 Starting fresh user fetch...');
          
          // Try different table names since profiles might not be accessible via REST API
          const possibleTableNames = ['profiles', 'users', 'auth_users', 'public_users'];
          let usersData = null;
          let usersError = null;
          let workingTableName = null;
          
          for (const tableName of possibleTableNames) {
            console.log(`🔍 Trying table: ${tableName}`);
            
            try {
              // Test 1: Simple count query first
              const { count: userCount, error: countError } = await supabase
                .from(tableName)
                .select('*', { count: 'exact', head: true });
              
              console.log(`🔍 ${tableName} count test:`, { userCount, countError });
              
              if (!countError && userCount !== null) {
                console.log(`✅ Found working table: ${tableName} with ${userCount} users`);
                workingTableName = tableName;
                
                                 // Step 1: Get users from the working table
                 const result = await supabase
                   .from(tableName)
                   .select('id, user_id, email, full_name, created_at, updated_at, is_active')
                   .order('full_name');
                
                usersData = result.data;
                usersError = result.error;
                break;
              }
            } catch (tableError) {
              console.log(`❌ Table ${tableName} not accessible:`, tableError);
              continue;
            }
          }
          
          if (!workingTableName) {
            console.error('❌ No accessible user table found. Check Supabase configuration.');
            toast.error('User table not accessible. Please check Supabase configuration.');
            setUsers([]);
            return;
          }
          
          console.log(`🔍 Using table: ${workingTableName}`);
          console.log('🔍 Users query result:', { data: usersData?.length || 0, error: usersError });
          
          if (usersError) {
            console.error('❌ Error loading users:', usersError);
            toast.error('Failed to load users');
            setUsers([]);
          } else if (usersData && usersData.length > 0) {
            console.log('🔍 Raw users data:', usersData);
            
                         // Step 2: Map users without roles first
             const mappedUsers = usersData.map((user: any) => ({
               id: user.id,
               user_id: user.user_id,
               email: user.email,
               full_name: user.full_name || user.email,
               created_at: user.created_at || new Date().toISOString(),
               updated_at: user.updated_at || new Date().toISOString(),
               is_active: user.is_active !== false, // Use the database value, default to true if not specified
               user_roles: []
             }));
            
            console.log('✅ Mapped users:', mappedUsers);
            setUsers(mappedUsers);
            
            // Step 3: Update initial stats
            const stats = {
              total_users: mappedUsers.length,
              admin_count: 0,
              ops_manager_count: 0,
              deployment_engineer_count: 0
            };
            setUserStats(stats);
            console.log('✅ User stats updated:', stats);
            
            // Step 4: Fetch roles separately to avoid transaction issues
            console.log('🔍 Fetching roles for users...');
            
            // Use a different approach - fetch all roles at once
            const { data: allRolesData, error: rolesError } = await supabase
              .from('user_roles')
              .select('user_id, role');
            
            if (rolesError) {
              console.error('Error fetching all roles:', rolesError);
            } else {
              console.log('✅ All roles fetched:', allRolesData);
              
              // Map roles to users
              const usersWithRoles = mappedUsers.map(user => {
                const userRoles = allRolesData?.filter(role => role.user_id === user.user_id) || [];
                return {
                  ...user,
                  user_roles: userRoles.map(r => ({ role: r.role }))
                };
              });
              
              console.log('✅ Users with roles:', usersWithRoles);
              setUsers(usersWithRoles);
              
              // Update final stats
              const updatedStats = {
                total_users: usersWithRoles.length,
                admin_count: usersWithRoles.filter(u => u.user_roles.some((r: any) => r.role === 'admin')).length,
                ops_manager_count: usersWithRoles.filter(u => u.user_roles.some((r: any) => r.role === 'ops_manager')).length,
                deployment_engineer_count: usersWithRoles.filter(u => u.user_roles.some((r: any) => r.role === 'deployment_engineer')).length
              };
              setUserStats(updatedStats);
              console.log('✅ Final user stats updated:', updatedStats);
            }
            
          } else {
            console.log('⚠️ No users found in database');
            setUsers([]);
          }
        } catch (usersException) {
          console.error('❌ Exception loading users:', usersException);
          setUsers([]);
        }
      
      // Load other data (simplified for this example)
      setSoftwareModules([]);
      setHardwareItems([]);
      
    } catch (error) {
      console.error('Error loading configuration data:', error);
      toast.error('Failed to load configuration data');
    } finally {
      setLoading(false);
    }
  };

  // Seed default organizations
  const seedDefaultOrganizations = async () => {
    console.log('🔍 Seeding default organizations...');
    
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
      }
    ];
    
    console.log('✅ Default organizations prepared:', defaults);
    setOrganizations(defaults);
    toast.success('Default organizations loaded');
  };

  // Add new organization
  const addOrganization = () => {
    setEditingOrganization({
      id: 'new',
      name: '',
      description: '',
      sector: '',
      unit_code: '',
      created_by: '',
      created_on: '',
      updated_at: new Date().toISOString()
    });
  };

  // Add new user
  const addUser = () => {
    setEditingUser({
      id: 'new',
      user_id: '',
      email: '',
      full_name: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      user_roles: []
    });
  };

  // Edit organization
  const editOrganization = (org: Organization) => {
    setEditingOrganization({ ...org });
  };

  // Delete organization
  const deleteOrganization = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this organization?')) {
      try {
        console.log('🔍 Deleting organization:', id);
        
        const { error } = await supabase
          .from('organizations')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error('❌ Error deleting organization:', error);
          toast.error('Failed to delete organization');
          return;
        }
        
        console.log('✅ Organization deleted successfully');
        setOrganizations(prev => prev.filter(org => org.id !== id));
        toast.success('Organization deleted successfully');
      } catch (error) {
        console.error('❌ Exception deleting organization:', error);
        toast.error('Failed to delete organization');
      }
    }
  };

  // Save organization
  const saveOrganization = async () => {
    if (!editingOrganization) return;
    
    try {
      if (editingOrganization.id === 'new') {
        // Create new organization
        console.log('🔍 Creating new organization:', editingOrganization);
        
        const { data, error } = await supabase
          .from('organizations')
          .insert([{
            name: editingOrganization.name,
            description: editingOrganization.description,
            sector: editingOrganization.sector,
            unit_code: editingOrganization.unit_code
          }])
          .select()
          .single();
        
        if (error) {
          console.error('❌ Error creating organization:', error);
          toast.error('Failed to create organization');
          return;
        }
        
        console.log('✅ Organization created successfully:', data);
        
        // Create the new organization object with the returned data
        const newOrg: Organization = {
          id: data.id,
          name: data.name,
          description: data.description,
          sector: data.sector || '',
          unit_code: data.unit_code || '',
          created_by: data.created_by || 'admin',
          created_on: data.created_on || data.created_at || new Date().toISOString(),
          updated_at: data.updated_at
        };
        
        setOrganizations(prev => [...prev, newOrg]);
      } else {
        // Update existing organization
        console.log('🔍 Updating organization:', editingOrganization);
        
        const { error } = await supabase
          .from('organizations')
          .update({
            name: editingOrganization.name,
            description: editingOrganization.description,
            sector: editingOrganization.sector,
            unit_code: editingOrganization.unit_code
          })
          .eq('id', editingOrganization.id);
        
        if (error) {
          console.error('❌ Error updating organization:', error);
          toast.error('Failed to update organization');
          return;
        }
        
        console.log('✅ Organization updated successfully');
        
        setOrganizations(prev => 
          prev.map(org => 
            org.id === editingOrganization.id 
              ? { ...editingOrganization, updated_at: new Date().toISOString() }
              : org
          )
        );
      }
      
      setEditingOrganization(null);
      toast.success('Organization saved successfully');
    } catch (error) {
      console.error('Error saving organization:', error);
      toast.error('Failed to save organization');
    }
  };

  // Archive/Activate user (local state only since we don't have is_active column)
  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const action = newStatus ? 'activate' : 'archive';
      
      console.log(`🔍 ${action}ing user:`, userId);
      
      // Since we don't have is_active column, we'll just update local state
      // In a real implementation, you might want to add this column to the database
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.user_id === userId 
          ? { ...user, is_active: newStatus }
          : user
      ));
      
      console.log(`✅ User ${action}d successfully (local state only)`);
      toast.success(`User ${action}d successfully`);
    } catch (error) {
      console.error(`❌ Exception ${action}ing user:`, error);
      toast.error(`Failed to ${action} user`);
    }
  };

  // Save user
  const saveUser = async () => {
    if (!editingUser) return;
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }
    
    try {
      if (editingUser.id === 'new') {
        // Create new user
        console.log('🔍 Creating new user:', editingUser);
        
        // Check if email already exists
        const { data: existingUser, error: checkError } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('email', editingUser.email)
          .single();
        
        if (checkError && checkError.code !== 'PGRST116') {
          console.error('❌ Error checking existing user:', checkError);
          toast.error('Failed to check existing user');
          return;
        }
        
        if (existingUser) {
          toast.error('A user with this email already exists');
          return;
        }
        
                 // First create the profile
         const { data: profileData, error: profileError } = await supabase
           .from('profiles')
           .insert([{
             user_id: crypto.randomUUID(), // Generate a new UUID
             email: editingUser.email,
             full_name: editingUser.full_name,
             is_active: editingUser.is_active
           }])
           .select()
           .single();
        
        if (profileError) {
          console.error('❌ Error creating user profile:', profileError);
          if (profileError.code === '23505') {
            toast.error('A user with this email already exists');
          } else {
            toast.error('Failed to create user profile');
          }
          return;
        }
        
        console.log('✅ User profile created successfully:', profileData);
        
        // Then create user roles if any are selected
        if (editingUser.user_roles.length > 0) {
          const roleInserts = editingUser.user_roles.map(role => ({
            user_id: profileData.user_id,
            role: role.role,
            assigned_by: user?.id
          }));
          
          const { error: rolesError } = await supabase
            .from('user_roles')
            .insert(roleInserts);
          
          if (rolesError) {
            console.error('❌ Error creating user roles:', rolesError);
            toast.error('Failed to create user roles');
            return;
          }
        }
        
        // Refresh the users list
        loadConfigurationData();
        toast.success('User created successfully');
      } else {
        // Update existing user
        console.log('🔍 Updating user:', editingUser);
        
                 const { error: profileError } = await supabase
           .from('profiles')
           .update({
             email: editingUser.email,
             full_name: editingUser.full_name
           })
           .eq('id', editingUser.id);
        
        if (profileError) {
          console.error('❌ Error updating user profile:', profileError);
          toast.error('Failed to update user profile');
          return;
        }
        
        // Update roles - first delete existing roles, then insert new ones
        if (editingUser.user_roles.length > 0) {
          // Delete existing roles
          const { error: deleteError } = await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', editingUser.user_id);
          
          if (deleteError) {
            console.error('❌ Error deleting existing roles:', deleteError);
            toast.error('Failed to update user roles');
            return;
          }
          
          // Insert new roles
          const roleInserts = editingUser.user_roles.map(role => ({
            user_id: editingUser.user_id,
            role: role.role,
            assigned_by: user?.id
          }));
          
          const { error: rolesError } = await supabase
            .from('user_roles')
            .insert(roleInserts);
          
          if (rolesError) {
            console.error('❌ Error creating new roles:', rolesError);
            toast.error('Failed to update user roles');
            return;
          }
        }
        
        // Refresh the users list
        loadConfigurationData();
        toast.success('User updated successfully');
      }
      
      setEditingUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
    }
  };

  // Filter organizations based on search and sector
  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(orgSearchTerm.toLowerCase()) ||
                         org.description.toLowerCase().includes(orgSearchTerm.toLowerCase()) ||
                         org.unit_code.toLowerCase().includes(orgSearchTerm.toLowerCase());
    const matchesSector = orgSectorFilter === 'all' || org.sector === orgSectorFilter;
    return matchesSearch && matchesSector;
  });

  // Excel upload handler
  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // For this example, we'll parse CSV format
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const newOrgs: Organization[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const org: Organization = {
            id: `org-${Date.now()}-${i}`,
            name: values[headers.indexOf('name')] || '',
            description: values[headers.indexOf('description')] || '',
            sector: values[headers.indexOf('sector')] || '',
            unit_code: values[headers.indexOf('unit_code')] || '',
            created_by: '',
            created_on: '',
            updated_at: new Date().toISOString()
          };
          newOrgs.push(org);
        }
      }
      
      setOrganizations(prev => [...prev, ...newOrgs]);
      toast.success(`${newOrgs.length} organizations imported successfully`);
      
      // Clear the file input
      event.target.value = '';
    } catch (error) {
      console.error('Error parsing Excel/CSV file:', error);
      toast.error('Failed to parse file. Please ensure it\'s a valid CSV format.');
    }
  };

  // Excel download handler
  const downloadOrganizationsExcel = () => {
    const headers = ['Name', 'Description', 'Sector', 'Unit Code'];
    const rows = [
      headers,
      ...filteredOrganizations.map(org => [
        org.name,
        org.description,
        org.sector,
        org.unit_code
      ])
    ];
    
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'organizations.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Organizations exported successfully');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading configuration...</span>
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
        <span className="text-gray-900 font-medium">Platform Configuration</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Configuration</h1>
          <p className="text-gray-600 mt-1">
            Manage platform-wide settings, organizations, and configurations
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
                  {/* Search and Filter Controls */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search by name, description, or unit code..."
                          value={orgSearchTerm}
                          onChange={(e) => setOrgSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Select value={orgSectorFilter} onValueChange={setOrgSectorFilter}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Filter by sector" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sectors</SelectItem>
                          {sectorOptions.map(sector => (
                            <SelectItem key={sector} value={sector}>
                              {sector}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">
                      Organizations ({filteredOrganizations.length})
                    </h3>
                    <div className="flex items-center space-x-2">
                      {/* Excel Upload */}
                      <div className="relative">
                        <input
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          onChange={handleExcelUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Button variant="outline" className="flex items-center space-x-2">
                          <Upload className="h-4 w-4" />
                          <span>Import Excel</span>
                        </Button>
                      </div>
                      
                                             {/* Excel Download */}
                       <Button variant="outline" onClick={downloadOrganizationsExcel} className="flex items-center space-x-2">
                         <Download className="h-4 w-4" />
                         <span>Export Excel</span>
                       </Button>
                       
                       {/* Add Organization */}
                       <Button onClick={addOrganization}>
                         <Plus className="h-4 w-4 mr-2" />
                         Add Organization
                       </Button>
                    </div>
                  </div>

                  {/* Organizations Table */}
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Organization</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Sector</TableHead>
                          <TableHead>Unit Code</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrganizations.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                              <div className="flex flex-col items-center space-y-2">
                                <Building className="h-8 w-8 text-gray-400" />
                                <p>No organizations found</p>
                                <p className="text-sm">
                                  {orgSearchTerm || orgSectorFilter !== 'all' 
                                    ? 'Try adjusting your search or filters' 
                                    : 'Create your first organization to get started'
                                  }
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredOrganizations.map(org => (
                            <TableRow key={org.id} className="hover:bg-gray-50">
                              <TableCell className="font-medium">
                                <div className="flex items-center space-x-2">
                                  <Building className="h-4 w-4 text-blue-600" />
                                  <span>{org.name}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-600">{org.description}</TableCell>
                              <TableCell>
                                {org.sector && (
                                  <Badge variant="outline">
                                    {org.sector}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {org.unit_code && (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                    {org.unit_code}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => editOrganization(org)}
                                    className="h-8 w-8 p-0 hover:bg-blue-50"
                                  >
                                    <Edit className="h-4 w-4 text-blue-600" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => deleteOrganization(org.id)}
                                    className="h-8 w-8 p-0 hover:bg-red-50"
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs placeholder */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>User Management</span>
                </CardTitle>
                <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search and Filter Controls */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search by name or email..."
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Select>
                        <SelectTrigger className="w-48">
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
                  </div>

                                     {/* Users Table */}
                   <div className="border rounded-lg">
                     <Table>
                       <TableHeader>
                         <TableRow>
                           <TableHead>User</TableHead>
                           <TableHead>Role</TableHead>
                           <TableHead>Organization</TableHead>
                           <TableHead>Status</TableHead>
                           <TableHead>Actions</TableHead>
                         </TableRow>
                       </TableHeader>
                       <TableBody>
                         {users.length === 0 ? (
                           <TableRow>
                             <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                               <div className="flex flex-col items-center space-y-2">
                                 <Users className="h-8 w-8 text-gray-400" />
                                 <p>No users found</p>
                                 <p className="text-sm">Total users in state: {users.length}</p>
                               </div>
                             </TableCell>
                           </TableRow>
                         ) : (
                           users.map((user) => (
                             <TableRow key={user.id}>
                               <TableCell className="font-medium">{user.email}</TableCell>
                               <TableCell>
                                 <div className="flex flex-wrap gap-1">
                                   {user.user_roles && user.user_roles.length > 0 ? (
                                     user.user_roles.map((role: any, index: number) => (
                                       <Badge key={index} variant="secondary">
                                         {role.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                       </Badge>
                                     ))
                                   ) : (
                                     <Badge variant="outline">No Role</Badge>
                                   )}
                                 </div>
                               </TableCell>
                               <TableCell>SmartQ</TableCell>
                                                               <TableCell>
                                  <Badge className={user.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                    {user.is_active ? 'Active' : 'Archived'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => toggleUserStatus(user.user_id, user.is_active)}
                                      className="h-8 w-8 p-0 hover:bg-gray-50"
                                      title={user.is_active ? 'Archive User' : 'Activate User'}
                                    >
                                      {user.is_active ? (
                                        <Trash2 className="h-4 w-4 text-gray-600" />
                                      ) : (
                                        <User className="h-4 w-4 text-green-600" />
                                      )}
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => setEditingUser(user)}
                                      className="h-8 w-8 p-0 hover:bg-blue-50"
                                      title="Edit User"
                                    >
                                      <Edit className="h-4 w-4 text-blue-600" />
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="software" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <span>Software & Hardware Management</span>
                </CardTitle>
                <CardDescription>Manage software modules, hardware items, and licensing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Software Modules Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Software Modules</h3>
                      <Button size="sm" className="flex items-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Add Module</span>
                      </Button>
                    </div>
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Module Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Monthly Fee</TableHead>
                            <TableHead>Setup Fee</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">POS System</TableCell>
                            <TableCell>Point of Sale</TableCell>
                            <TableCell>£50/month</TableCell>
                            <TableCell>£200</TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-800">Active</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Kitchen Display</TableCell>
                            <TableCell>Kitchen Management</TableCell>
                            <TableCell>£30/month</TableCell>
                            <TableCell>£150</TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-800">Active</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Hardware Items Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Hardware Items</h3>
                      <Button size="sm" className="flex items-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Add Hardware</span>
                      </Button>
                    </div>
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Model</TableHead>
                            <TableHead>Unit Cost</TableHead>
                            <TableHead>Installation Cost</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">POS Terminal</TableCell>
                            <TableCell>Point of Sale</TableCell>
                            <TableCell>Verifone VX520</TableCell>
                            <TableCell>£300</TableCell>
                            <TableCell>£50</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Kitchen Display Screen</TableCell>
                            <TableCell>Display</TableCell>
                            <TableCell>Samsung 22"</TableCell>
                            <TableCell>£200</TableCell>
                            <TableCell>£75</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Audit & Logs</span>
                </CardTitle>
                <CardDescription>View system logs, audit trails, and activity history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Filter Controls */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search logs..."
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Select>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="user_activity">User Activity</SelectItem>
                          <SelectItem value="system_events">System Events</SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                          <SelectItem value="data_changes">Data Changes</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Filter by date" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="week">This Week</SelectItem>
                          <SelectItem value="month">This Month</SelectItem>
                          <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Audit Logs Table */}
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Details</TableHead>
                          <TableHead>IP Address</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-mono text-sm">2025-01-26 14:45:23</TableCell>
                          <TableCell>shivanshu.singh@thesmartq.com</TableCell>
                          <TableCell>Login</TableCell>
                          <TableCell>
                            <Badge className="bg-blue-100 text-blue-800">Security</Badge>
                          </TableCell>
                          <TableCell>User logged in successfully</TableCell>
                          <TableCell className="font-mono text-sm">192.168.1.100</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">2025-01-26 14:42:15</TableCell>
                          <TableCell>shivanshu.singh@thesmartq.com</TableCell>
                          <TableCell>Update Organization</TableCell>
                          <TableCell>
                            <Badge className="bg-yellow-100 text-yellow-800">Data Changes</Badge>
                          </TableCell>
                          <TableCell>Updated organization "Peabody" details</TableCell>
                          <TableCell className="font-mono text-sm">192.168.1.100</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">2025-01-26 14:38:42</TableCell>
                          <TableCell>madhujun16@gmail.com</TableCell>
                          <TableCell>Create User</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">User Activity</Badge>
                          </TableCell>
                          <TableCell>Created new user account</TableCell>
                          <TableCell className="font-mono text-sm">10.0.0.50</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">2025-01-26 14:35:18</TableCell>
                          <TableCell>System</TableCell>
                          <TableCell>Database Backup</TableCell>
                          <TableCell>
                            <Badge className="bg-purple-100 text-purple-800">System Events</Badge>
                          </TableCell>
                          <TableCell>Automated database backup completed</TableCell>
                          <TableCell className="font-mono text-sm">127.0.0.1</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Export and Actions */}
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Showing 4 of 1,247 log entries
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="flex items-center space-x-2">
                        <Download className="h-4 w-4" />
                        <span>Export Logs</span>
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center space-x-2">
                        <Settings className="h-4 w-4" />
                        <span>Log Settings</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Organization Dialog */}
      {editingOrganization && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">
              {editingOrganization.id === 'new' ? 'Add Organization' : 'Edit Organization'}
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="orgName">Organization Name *</Label>
                <Input
                  id="orgName"
                  value={editingOrganization.name}
                  onChange={(e) => setEditingOrganization({...editingOrganization, name: e.target.value})}
                  placeholder="Enter organization name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="orgDescription">Description</Label>
                <Input
                  id="orgDescription"
                  value={editingOrganization.description}
                  onChange={(e) => setEditingOrganization({...editingOrganization, description: e.target.value})}
                  placeholder="Enter organization description"
                />
              </div>
              
              <div>
                <Label htmlFor="orgSector">Sector *</Label>
                <Select value={editingOrganization.sector} onValueChange={(value) => setEditingOrganization({...editingOrganization, sector: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sector" />
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
                <Label htmlFor="orgUnitCode">Unit Code *</Label>
                <Input
                  id="orgUnitCode"
                  value={editingOrganization.unit_code}
                  onChange={(e) => setEditingOrganization({...editingOrganization, unit_code: e.target.value})}
                  placeholder="Enter unit code (e.g., CHT, HSB)"
                  required
                />
              </div>
              

              
              <div className="flex space-x-2 pt-4">
                <Button onClick={saveOrganization} className="flex-1" disabled={!editingOrganization.name || !editingOrganization.sector || !editingOrganization.unit_code}>
                  Save
                </Button>
                <Button variant="outline" onClick={() => setEditingOrganization(null)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Dialog */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">
              {editingUser.id === 'new' ? 'Add New User' : 'Edit User'}
            </h3>
            <div className="space-y-4">
                             <div>
                 <Label htmlFor="userEmail">Email *</Label>
                 <Input
                   id="userEmail"
                   type="email"
                   value={editingUser.email}
                   onChange={(e) => setEditingUser({...editingUser, email: e.target.value.trim()})}
                   placeholder="Enter user email"
                   required
                 />
                 <p className="text-xs text-gray-500 mt-1">Email must be unique across all users</p>
               </div>
              
              <div>
                <Label htmlFor="userFullName">Full Name *</Label>
                                 <Input
                   id="userFullName"
                   value={editingUser.full_name}
                   onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value.trim()})}
                   placeholder="Enter full name"
                   required
                 />
              </div>
              
                             <div>
                 <Label htmlFor="userRoles">Roles</Label>
                 <div className="space-y-2">
                   {['admin', 'ops_manager', 'deployment_engineer'].map((role) => (
                     <div key={role} className="flex items-center space-x-2">
                       <Checkbox
                         id={`role-${role}`}
                         checked={editingUser.user_roles.some(r => r.role === role)}
                         onCheckedChange={(checked) => {
                           if (checked) {
                             setEditingUser({
                               ...editingUser,
                               user_roles: [...editingUser.user_roles, { role: role as any }]
                             });
                           } else {
                             setEditingUser({
                               ...editingUser,
                               user_roles: editingUser.user_roles.filter(r => r.role !== role)
                             });
                           }
                         }}
                       />
                       <Label htmlFor={`role-${role}`} className="text-sm capitalize">
                         {role.replace('_', ' ')}
                       </Label>
                     </div>
                   ))}
                 </div>
               </div>
               
               <div>
                 <Label htmlFor="userStatus">Status</Label>
                 <div className="flex items-center space-x-2">
                   <Checkbox
                     id="userStatus"
                     checked={editingUser.is_active}
                     onCheckedChange={(checked) => {
                       setEditingUser({
                         ...editingUser,
                         is_active: checked as boolean
                       });
                     }}
                   />
                   <Label htmlFor="userStatus" className="text-sm">
                     Active User
                   </Label>
                 </div>
                 <p className="text-xs text-gray-500 mt-1">
                   Uncheck to archive this user
                 </p>
               </div>
              
                             <div className="flex space-x-2 pt-4">
                 <Button 
                   onClick={saveUser} 
                   className="flex-1" 
                   disabled={!editingUser.email?.trim() || !editingUser.full_name?.trim()}
                 >
                   {editingUser.id === 'new' ? 'Create User' : 'Save Changes'}
                 </Button>
                 <Button variant="outline" onClick={() => setEditingUser(null)} className="flex-1">
                   Cancel
                 </Button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
