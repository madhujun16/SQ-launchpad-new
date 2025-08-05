import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { getRoleConfig, hasPermission, ROLES } from '@/lib/roles';
import { useNavigate } from 'react-router-dom';
import { 
  Building, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  UserPlus, 
  Save, 
  X, 
  Search, 
  Shield, 
  Settings,
  User,
  UserCheck,
  UserX,
  Calendar,
  Mail,
  Crown,
  Wrench,
  Truck
} from 'lucide-react';

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
  created_at: string;
  updated_at: string;
}

interface CreateUserForm {
  email: string;
  full_name: string;
  roles: string[];
}

interface CreateOrganizationForm {
  name: string;
  description: string;
  sector: string;
}

interface SoftwareModule {
  id: string;
  name: string;
  description: string | null;
  category: string;
  is_active: boolean;
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
  estimated_cost: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateSoftwareForm {
  name: string;
  description: string;
  category: string;
}

interface CreateHardwareForm {
  name: string;
  description: string;
  category: string;
  model: string;
  manufacturer: string;
  estimated_cost: number;
}

const Admin = () => {
  const { currentRole, profile } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [softwareModules, setSoftwareModules] = useState<SoftwareModule[]>([]);
  const [hardwareItems, setHardwareItems] = useState<HardwareItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // User management states
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [createUserForm, setCreateUserForm] = useState<CreateUserForm>({
    email: '',
    full_name: '',
    roles: []
  });

  // Organization management states
  const [showCreateOrgDialog, setShowCreateOrgDialog] = useState(false);
  const [showEditOrgDialog, setShowEditOrgDialog] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [createOrgForm, setCreateOrgForm] = useState<CreateOrganizationForm>({
    name: '',
    description: '',
    sector: ''
  });

  // Software management states
  const [showCreateSoftwareDialog, setShowCreateSoftwareDialog] = useState(false);
  const [showEditSoftwareDialog, setShowEditSoftwareDialog] = useState(false);
  const [editingSoftware, setEditingSoftware] = useState<SoftwareModule | null>(null);
  const [createSoftwareForm, setCreateSoftwareForm] = useState<CreateSoftwareForm>({
    name: '',
    description: '',
    category: ''
  });

  // Hardware management states
  const [showCreateHardwareDialog, setShowCreateHardwareDialog] = useState(false);
  const [showEditHardwareDialog, setShowEditHardwareDialog] = useState(false);
  const [editingHardware, setEditingHardware] = useState<HardwareItem | null>(null);
  const [createHardwareForm, setCreateHardwareForm] = useState<CreateHardwareForm>({
    name: '',
    description: '',
    category: '',
    model: '',
    manufacturer: '',
    estimated_cost: 0
  });

  // Predefined sector options
  const sectorOptions = [
    'Business & Industry',
    'Healthcare & Senior Living',
    'Education',
    'Sports & Leisure',
    'Defence',
    'Offshore & Remote'
  ];

  // Check if user has admin permissions
  React.useEffect(() => {
    if (currentRole && !hasPermission(currentRole, 'manage_users')) {
      toast.error('You do not have permission to access the Admin panel');
      navigate('/dashboard');
    }
  }, [currentRole, navigate]);

  useEffect(() => {
    if (hasPermission(currentRole || 'admin', 'manage_users')) {
      fetchUsers();
      fetchOrganizations();
      fetchSoftwareModules();
      fetchHardwareItems();
    }
  }, [currentRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (userRolesError) throw userRolesError;

      // Combine profiles with their roles
      const usersWithRoles = profilesData.map(profile => ({
        id: profile.id,
        user_id: profile.user_id,
        email: profile.email,
        full_name: profile.full_name,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        user_roles: userRolesData.filter(role => role.user_id === profile.user_id)
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrganizations(data || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Failed to load organizations');
    }
  };

  const fetchSoftwareModules = async () => {
    try {
      const { data, error } = await supabase
        .from('software_modules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSoftwareModules(data || []);
    } catch (error) {
      console.error('Error fetching software modules:', error);
      toast.error('Failed to load software modules');
    }
  };

  const fetchHardwareItems = async () => {
    try {
      const { data, error } = await supabase
        .from('hardware_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHardwareItems(data || []);
    } catch (error) {
      console.error('Error fetching hardware items:', error);
      toast.error('Failed to load hardware items');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createUserForm.email || !createUserForm.full_name || createUserForm.roles.length === 0) {
      toast.error('Please fill in all required fields and select at least one role');
      return;
    }

    try {
      setLoading(true);

      // Create user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: crypto.randomUUID(), // Generate a unique user_id
            email: createUserForm.email,
            full_name: createUserForm.full_name,
            invited_at: new Date().toISOString(),
            invited_by: profile?.user_id
          }
        ])
        .select()
        .single();

      if (profileError) throw profileError;

      // Insert roles for the user
      const roleInserts = createUserForm.roles.map(role => ({
        user_id: profileData.user_id,
        role: role as 'admin' | 'ops_manager' | 'deployment_engineer',
        assigned_by: profile?.user_id,
      }));

      const { error: rolesError } = await supabase
        .from('user_roles')
        .insert(roleInserts);

      if (rolesError) throw rolesError;

      toast.success('User created successfully');
      setShowCreateUserDialog(false);
      setCreateUserForm({ email: '', full_name: '', roles: [] });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUser) return;

    try {
      setLoading(true);

      // Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          email: createUserForm.email,
          full_name: createUserForm.full_name,
        })
        .eq('user_id', editingUser.user_id);

      if (profileError) throw profileError;

      // Delete existing roles
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', editingUser.user_id);

      if (deleteError) throw deleteError;

      // Insert new roles
      const roleInserts = createUserForm.roles.map(role => ({
        user_id: editingUser.user_id,
        role: role as 'admin' | 'ops_manager' | 'deployment_engineer',
        assigned_by: profile?.user_id,
      }));

      const { error: rolesError } = await supabase
        .from('user_roles')
        .insert(roleInserts);

      if (rolesError) throw rolesError;

      toast.success('User updated successfully');
      setShowEditUserDialog(false);
      setEditingUser(null);
      setCreateUserForm({ email: '', full_name: '', roles: [] });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);

      // Delete user roles first
      const { error: rolesError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (rolesError) throw rolesError;

      // Delete user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (profileError) throw profileError;

      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createOrgForm.name) {
      toast.error('Please enter an organization name');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('organizations')
        .insert([createOrgForm]);

      if (error) throw error;

      toast.success('Organization created successfully');
      setShowCreateOrgDialog(false);
      setCreateOrgForm({ name: '', description: '', sector: '' });
      fetchOrganizations();
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  const handleEditOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingOrg) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('organizations')
        .update(createOrgForm)
        .eq('id', editingOrg.id);

      if (error) throw error;

      toast.success('Organization updated successfully');
      setShowEditOrgDialog(false);
      setEditingOrg(null);
      setCreateOrgForm({ name: '', description: '', sector: '' });
      fetchOrganizations();
    } catch (error) {
      console.error('Error updating organization:', error);
      toast.error('Failed to update organization');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrganization = async (orgId: string) => {
    if (!confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgId);

      if (error) throw error;

      toast.success('Organization deleted successfully');
      fetchOrganizations();
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast.error('Failed to delete organization');
    } finally {
      setLoading(false);
    }
  };

  const openEditUserDialog = (user: User) => {
    setEditingUser(user);
    setCreateUserForm({
      email: user.email,
      full_name: user.full_name,
      roles: user.user_roles.map(r => r.role)
    });
    setShowEditUserDialog(true);
  };

  const openEditOrgDialog = (org: Organization) => {
    setEditingOrg(org);
    setCreateOrgForm({
      name: org.name,
      description: org.description,
      sector: org.sector || ''
    });
    setShowEditOrgDialog(true);
  };

  // Software management functions
  const handleCreateSoftware = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createSoftwareForm.name || !createSoftwareForm.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('software_modules')
        .insert([createSoftwareForm]);

      if (error) throw error;

      toast.success('Software module created successfully');
      setShowCreateSoftwareDialog(false);
      setCreateSoftwareForm({ name: '', description: '', category: '' });
      fetchSoftwareModules();
    } catch (error) {
      console.error('Error creating software module:', error);
      toast.error('Failed to create software module');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSoftware = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingSoftware || !createSoftwareForm.name || !createSoftwareForm.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('software_modules')
        .update(createSoftwareForm)
        .eq('id', editingSoftware.id);

      if (error) throw error;

      toast.success('Software module updated successfully');
      setShowEditSoftwareDialog(false);
      setEditingSoftware(null);
      setCreateSoftwareForm({ name: '', description: '', category: '' });
      fetchSoftwareModules();
    } catch (error) {
      console.error('Error updating software module:', error);
      toast.error('Failed to update software module');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSoftware = async (softwareId: string) => {
    if (!confirm('Are you sure you want to delete this software module? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('software_modules')
        .delete()
        .eq('id', softwareId);

      if (error) throw error;

      toast.success('Software module deleted successfully');
      fetchSoftwareModules();
    } catch (error) {
      console.error('Error deleting software module:', error);
      toast.error('Failed to delete software module');
    } finally {
      setLoading(false);
    }
  };

  const openEditSoftwareDialog = (software: SoftwareModule) => {
    setEditingSoftware(software);
    setCreateSoftwareForm({
      name: software.name,
      description: software.description || '',
      category: software.category
    });
    setShowEditSoftwareDialog(true);
  };

  // Hardware management functions
  const handleCreateHardware = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createHardwareForm.name || !createHardwareForm.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('hardware_items')
        .insert([createHardwareForm]);

      if (error) throw error;

      toast.success('Hardware item created successfully');
      setShowCreateHardwareDialog(false);
      setCreateHardwareForm({ 
        name: '', 
        description: '', 
        category: '', 
        model: '', 
        manufacturer: '', 
        estimated_cost: 0 
      });
      fetchHardwareItems();
    } catch (error) {
      console.error('Error creating hardware item:', error);
      toast.error('Failed to create hardware item');
    } finally {
      setLoading(false);
    }
  };

  const handleEditHardware = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingHardware || !createHardwareForm.name || !createHardwareForm.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('hardware_items')
        .update(createHardwareForm)
        .eq('id', editingHardware.id);

      if (error) throw error;

      toast.success('Hardware item updated successfully');
      setShowEditHardwareDialog(false);
      setEditingHardware(null);
      setCreateHardwareForm({ 
        name: '', 
        description: '', 
        category: '', 
        model: '', 
        manufacturer: '', 
        estimated_cost: 0 
      });
      fetchHardwareItems();
    } catch (error) {
      console.error('Error updating hardware item:', error);
      toast.error('Failed to update hardware item');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHardware = async (hardwareId: string) => {
    if (!confirm('Are you sure you want to delete this hardware item? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('hardware_items')
        .delete()
        .eq('id', hardwareId);

      if (error) throw error;

      toast.success('Hardware item deleted successfully');
      fetchHardwareItems();
    } catch (error) {
      console.error('Error deleting hardware item:', error);
      toast.error('Failed to delete hardware item');
    } finally {
      setLoading(false);
    }
  };

  const openEditHardwareDialog = (hardware: HardwareItem) => {
    setEditingHardware(hardware);
    setCreateHardwareForm({
      name: hardware.name,
      description: hardware.description || '',
      category: hardware.category,
      model: hardware.model || '',
      manufacturer: hardware.manufacturer || '',
      estimated_cost: hardware.estimated_cost || 0
    });
    setShowEditHardwareDialog(true);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-3 w-3" />;
      case 'ops_manager':
        return <Wrench className="h-3 w-3" />;
      case 'deployment_engineer':
        return <Truck className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ops_manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'deployment_engineer':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || 
                       user.user_roles.some(role => role.role === roleFilter);
    return matchesSearch && matchesRole;
  });

  // Calculate stats
  const stats = {
    total: users.length,
    admins: users.filter(u => u.user_roles.some(r => r.role === 'admin')).length,
    opsManagers: users.filter(u => u.user_roles.some(r => r.role === 'ops_manager')).length,
    deploymentEngineers: users.filter(u => u.user_roles.some(r => r.role === 'deployment_engineer')).length,
    noRole: users.filter(u => u.user_roles.length === 0).length
  };

  if (!hasPermission(currentRole || 'admin', 'manage_users')) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              You do not have permission to access the Admin panel.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Utilities</h1>
              <p className="text-gray-600">Manage users and organizations</p>
            </div>
          </div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                User Management
              </TabsTrigger>
              <TabsTrigger value="organizations" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Organization Management
              </TabsTrigger>
              <TabsTrigger value="software" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Software Management
              </TabsTrigger>
              <TabsTrigger value="hardware" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Hardware Management
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <p className="text-xs text-muted-foreground">
                      All registered users
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Admins</CardTitle>
                    <Crown className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.admins}</div>
                    <p className="text-xs text-muted-foreground">
                      System administrators
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ops Managers</CardTitle>
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.opsManagers}</div>
                    <p className="text-xs text-muted-foreground">
                      Operations managers
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Deployment Engineers</CardTitle>
                    <Truck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.deploymentEngineers}</div>
                    <p className="text-xs text-muted-foreground">
                      Field engineers
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">No Role</CardTitle>
                    <UserX className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.noRole}</div>
                    <p className="text-xs text-muted-foreground">
                      Unassigned users
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">User Management</h2>
                <Button onClick={() => setShowCreateUserDialog(true)} variant="gradient">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New User
                </Button>
              </div>

              {/* Filters */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="search">Search Users</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="search"
                          placeholder="Search by email or name..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                          aria-label="Search users"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="role-filter">Filter by Role</Label>
                      <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All roles" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="ops_manager">Ops Manager</SelectItem>
                          <SelectItem value="deployment_engineer">Deployment Engineer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Users Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Users ({filteredUsers.length})</CardTitle>
                  <CardDescription>
                    All registered users in the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Roles</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                {user.full_name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                {user.email}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {user.user_roles.length === 0 ? (
                                  <Badge variant="secondary" className="text-gray-500">
                                    <UserX className="h-3 w-3 mr-1" />
                                    No Role
                                  </Badge>
                                ) : (
                                  user.user_roles.map((role, index) => (
                                    <Badge 
                                      key={index} 
                                      variant="outline" 
                                      className={`${getRoleColor(role.role)} flex items-center gap-1`}
                                    >
                                      {getRoleIcon(role.role)}
                                      {getRoleConfig(role.role).displayName}
                                    </Badge>
                                  ))
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                {new Date(user.created_at).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openEditUserDialog(user)}
                                  aria-label={`Edit user ${user.full_name}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.user_id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  aria-label={`Delete user ${user.full_name}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {filteredUsers.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        {users.length === 0 ? 'No users found' : 'No users match your filters'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="organizations" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Organization Management</h2>
                <Button onClick={() => setShowCreateOrgDialog(true)} variant="gradient">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Organization
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Organizations ({organizations.length})</CardTitle>
                  <CardDescription>
                    Manage organizations for site mapping
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Sector</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {organizations.map((org) => (
                          <TableRow key={org.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-gray-400" />
                                {org.name}
                              </div>
                            </TableCell>
                            <TableCell>{org.description}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-sm">
                                {org.sector || 'Not specified'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                {new Date(org.created_at).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openEditOrgDialog(org)}
                                  aria-label={`Edit organization ${org.name}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDeleteOrganization(org.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  aria-label={`Delete organization ${org.name}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {organizations.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No organizations found
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="software" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Software Management</h2>
                <Button onClick={() => setShowCreateSoftwareDialog(true)} variant="gradient">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Software Module
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Software Modules ({softwareModules.length})</CardTitle>
                  <CardDescription>
                    Manage SmartQ software modules for site deployment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {softwareModules.map((software) => (
                          <TableRow key={software.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Settings className="h-4 w-4 text-gray-400" />
                                {software.name}
                              </div>
                            </TableCell>
                            <TableCell>{software.description || 'No description'}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-sm">
                                {software.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={software.is_active ? "default" : "secondary"}>
                                {software.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                {new Date(software.created_at).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openEditSoftwareDialog(software)}
                                  aria-label={`Edit software module ${software.name}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDeleteSoftware(software.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  aria-label={`Delete software module ${software.name}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {softwareModules.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No software modules found
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hardware" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Hardware Management</h2>
                <Button onClick={() => setShowCreateHardwareDialog(true)} variant="gradient">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Hardware Item
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Hardware Items ({hardwareItems.length})</CardTitle>
                  <CardDescription>
                    Manage hardware items for site deployment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Model</TableHead>
                          <TableHead>Manufacturer</TableHead>
                          <TableHead>Estimated Cost</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {hardwareItems.map((hardware) => (
                          <TableRow key={hardware.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Wrench className="h-4 w-4 text-gray-400" />
                                {hardware.name}
                              </div>
                            </TableCell>
                            <TableCell>{hardware.description || 'No description'}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-sm">
                                {hardware.category}
                              </Badge>
                            </TableCell>
                            <TableCell>{hardware.model || 'N/A'}</TableCell>
                            <TableCell>{hardware.manufacturer || 'N/A'}</TableCell>
                            <TableCell>
                              {hardware.estimated_cost ? `£${hardware.estimated_cost.toFixed(2)}` : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={hardware.is_active ? "default" : "secondary"}>
                                {hardware.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openEditHardwareDialog(hardware)}
                                  aria-label={`Edit hardware item ${hardware.name}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDeleteHardware(hardware.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  aria-label={`Delete hardware item ${hardware.name}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {hardwareItems.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No hardware items found
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create User Modal */}
      <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system with appropriate role assignments.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={createUserForm.email}
                onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                placeholder="user@example.com"
                required
                aria-describedby="email-help"
              />
            </div>
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={createUserForm.full_name}
                onChange={(e) => setCreateUserForm({ ...createUserForm, full_name: e.target.value })}
                placeholder="John Doe"
                required
                aria-describedby="name-help"
              />
            </div>
            <div>
              <Label>Roles</Label>
              <div className="space-y-3">
                {Object.values(ROLES).map((role) => (
                  <div key={role.key} className="flex items-center space-x-3">
                    <Checkbox
                      id={role.key}
                      checked={createUserForm.roles.includes(role.key)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setCreateUserForm({
                            ...createUserForm,
                            roles: [...createUserForm.roles, role.key]
                          });
                        } else {
                          setCreateUserForm({
                            ...createUserForm,
                            roles: createUserForm.roles.filter(r => r !== role.key)
                          });
                        }
                      }}
                      aria-describedby={`${role.key}-help`}
                    />
                    <div className="flex items-center gap-2">
                      {getRoleIcon(role.key)}
                      <Label htmlFor={role.key} className="text-sm font-normal cursor-pointer">
                        {role.displayName}
                      </Label>
                    </div>
                    <p className="text-xs text-gray-500">{role.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateUserDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} variant="gradient">
                {loading ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and roles.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4">
            <div>
              <Label htmlFor="edit_email">Email</Label>
              <Input
                id="edit_email"
                type="email"
                value={createUserForm.email}
                onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                placeholder="user@example.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_full_name">Full Name</Label>
              <Input
                id="edit_full_name"
                value={createUserForm.full_name}
                onChange={(e) => setCreateUserForm({ ...createUserForm, full_name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <Label>Roles</Label>
              <div className="space-y-3">
                {Object.values(ROLES).map((role) => (
                  <div key={role.key} className="flex items-center space-x-3">
                    <Checkbox
                      id={`edit_${role.key}`}
                      checked={createUserForm.roles.includes(role.key)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setCreateUserForm({
                            ...createUserForm,
                            roles: [...createUserForm.roles, role.key]
                          });
                        } else {
                          setCreateUserForm({
                            ...createUserForm,
                            roles: createUserForm.roles.filter(r => r !== role.key)
                          });
                        }
                      }}
                    />
                    <div className="flex items-center gap-2">
                      {getRoleIcon(role.key)}
                      <Label htmlFor={`edit_${role.key}`} className="text-sm font-normal cursor-pointer">
                        {role.displayName}
                      </Label>
                    </div>
                    <p className="text-xs text-gray-500">{role.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowEditUserDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} variant="gradient">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Organization Modal */}
      <Dialog open={showCreateOrgDialog} onOpenChange={setShowCreateOrgDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Add a new organization for site mapping.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateOrganization} className="space-y-4">
            <div>
              <Label htmlFor="org_name">Name</Label>
              <Input
                id="org_name"
                value={createOrgForm.name}
                onChange={(e) => setCreateOrgForm({ ...createOrgForm, name: e.target.value })}
                placeholder="Organization name"
                required
              />
            </div>
            <div>
              <Label htmlFor="org_description">Description</Label>
              <Input
                id="org_description"
                value={createOrgForm.description}
                onChange={(e) => setCreateOrgForm({ ...createOrgForm, description: e.target.value })}
                placeholder="Organization description"
              />
            </div>
            <div>
              <Label htmlFor="org_sector">Sector</Label>
              <Select
                value={createOrgForm.sector}
                onValueChange={(value) => setCreateOrgForm({ ...createOrgForm, sector: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a sector" />
                </SelectTrigger>
                <SelectContent>
                  {sectorOptions.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateOrgDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} variant="gradient">
                {loading ? 'Creating...' : 'Create Organization'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Organization Modal */}
      <Dialog open={showEditOrgDialog} onOpenChange={setShowEditOrgDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>
              Update organization information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditOrganization} className="space-y-4">
            <div>
              <Label htmlFor="edit_org_name">Name</Label>
              <Input
                id="edit_org_name"
                value={createOrgForm.name}
                onChange={(e) => setCreateOrgForm({ ...createOrgForm, name: e.target.value })}
                placeholder="Organization name"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_org_description">Description</Label>
              <Input
                id="edit_org_description"
                value={createOrgForm.description}
                onChange={(e) => setCreateOrgForm({ ...createOrgForm, description: e.target.value })}
                placeholder="Organization description"
              />
            </div>
            <div>
              <Label htmlFor="edit_org_sector">Sector</Label>
              <Select
                value={createOrgForm.sector}
                onValueChange={(value) => setCreateOrgForm({ ...createOrgForm, sector: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a sector" />
                </SelectTrigger>
                <SelectContent>
                  {sectorOptions.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowEditOrgDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} variant="gradient">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Software Modal */}
      <Dialog open={showCreateSoftwareDialog} onOpenChange={setShowCreateSoftwareDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Software Module</DialogTitle>
            <DialogDescription>
              Add a new SmartQ software module for site deployment.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSoftware} className="space-y-4">
            <div>
              <Label htmlFor="software_name">Name</Label>
              <Input
                id="software_name"
                value={createSoftwareForm.name}
                onChange={(e) => setCreateSoftwareForm({ ...createSoftwareForm, name: e.target.value })}
                placeholder="e.g., SmartQ POS System"
                required
              />
            </div>
            <div>
              <Label htmlFor="software_description">Description</Label>
              <Input
                id="software_description"
                value={createSoftwareForm.description}
                onChange={(e) => setCreateSoftwareForm({ ...createSoftwareForm, description: e.target.value })}
                placeholder="Software module description"
              />
            </div>
            <div>
              <Label htmlFor="software_category">Category</Label>
              <Input
                id="software_category"
                value={createSoftwareForm.category}
                onChange={(e) => setCreateSoftwareForm({ ...createSoftwareForm, category: e.target.value })}
                placeholder="e.g., POS, KMS, QR, Kiosk"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateSoftwareDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} variant="gradient">
                {loading ? 'Creating...' : 'Create Software Module'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Software Modal */}
      <Dialog open={showEditSoftwareDialog} onOpenChange={setShowEditSoftwareDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Software Module</DialogTitle>
            <DialogDescription>
              Update software module information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSoftware} className="space-y-4">
            <div>
              <Label htmlFor="edit_software_name">Name</Label>
              <Input
                id="edit_software_name"
                value={createSoftwareForm.name}
                onChange={(e) => setCreateSoftwareForm({ ...createSoftwareForm, name: e.target.value })}
                placeholder="e.g., SmartQ POS System"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_software_description">Description</Label>
              <Input
                id="edit_software_description"
                value={createSoftwareForm.description}
                onChange={(e) => setCreateSoftwareForm({ ...createSoftwareForm, description: e.target.value })}
                placeholder="Software module description"
              />
            </div>
            <div>
              <Label htmlFor="edit_software_category">Category</Label>
              <Input
                id="edit_software_category"
                value={createSoftwareForm.category}
                onChange={(e) => setCreateSoftwareForm({ ...createSoftwareForm, category: e.target.value })}
                placeholder="e.g., POS, KMS, QR, Kiosk"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowEditSoftwareDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} variant="gradient">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Hardware Modal */}
      <Dialog open={showCreateHardwareDialog} onOpenChange={setShowCreateHardwareDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Hardware Item</DialogTitle>
            <DialogDescription>
              Add a new hardware item for site deployment.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateHardware} className="space-y-4">
            <div>
              <Label htmlFor="hardware_name">Name</Label>
              <Input
                id="hardware_name"
                value={createHardwareForm.name}
                onChange={(e) => setCreateHardwareForm({ ...createHardwareForm, name: e.target.value })}
                placeholder="e.g., Android Tablet"
                required
              />
            </div>
            <div>
              <Label htmlFor="hardware_description">Description</Label>
              <Input
                id="hardware_description"
                value={createHardwareForm.description}
                onChange={(e) => setCreateHardwareForm({ ...createHardwareForm, description: e.target.value })}
                placeholder="Hardware item description"
              />
            </div>
            <div>
              <Label htmlFor="hardware_category">Category</Label>
              <Input
                id="hardware_category"
                value={createHardwareForm.category}
                onChange={(e) => setCreateHardwareForm({ ...createHardwareForm, category: e.target.value })}
                placeholder="e.g., Tablet, POS Terminal, Printer"
                required
              />
            </div>
            <div>
              <Label htmlFor="hardware_model">Model</Label>
              <Input
                id="hardware_model"
                value={createHardwareForm.model}
                onChange={(e) => setCreateHardwareForm({ ...createHardwareForm, model: e.target.value })}
                placeholder="e.g., Samsung Galaxy Tab A"
              />
            </div>
            <div>
              <Label htmlFor="hardware_manufacturer">Manufacturer</Label>
              <Input
                id="hardware_manufacturer"
                value={createHardwareForm.manufacturer}
                onChange={(e) => setCreateHardwareForm({ ...createHardwareForm, manufacturer: e.target.value })}
                placeholder="e.g., Samsung, Apple, HP"
              />
            </div>
            <div>
              <Label htmlFor="hardware_cost">Estimated Cost (£)</Label>
              <Input
                id="hardware_cost"
                type="number"
                step="0.01"
                value={createHardwareForm.estimated_cost}
                onChange={(e) => setCreateHardwareForm({ ...createHardwareForm, estimated_cost: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateHardwareDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} variant="gradient">
                {loading ? 'Creating...' : 'Create Hardware Item'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Hardware Modal */}
      <Dialog open={showEditHardwareDialog} onOpenChange={setShowEditHardwareDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Hardware Item</DialogTitle>
            <DialogDescription>
              Update hardware item information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditHardware} className="space-y-4">
            <div>
              <Label htmlFor="edit_hardware_name">Name</Label>
              <Input
                id="edit_hardware_name"
                value={createHardwareForm.name}
                onChange={(e) => setCreateHardwareForm({ ...createHardwareForm, name: e.target.value })}
                placeholder="e.g., Android Tablet"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_hardware_description">Description</Label>
              <Input
                id="edit_hardware_description"
                value={createHardwareForm.description}
                onChange={(e) => setCreateHardwareForm({ ...createHardwareForm, description: e.target.value })}
                placeholder="Hardware item description"
              />
            </div>
            <div>
              <Label htmlFor="edit_hardware_category">Category</Label>
              <Input
                id="edit_hardware_category"
                value={createHardwareForm.category}
                onChange={(e) => setCreateHardwareForm({ ...createHardwareForm, category: e.target.value })}
                placeholder="e.g., Tablet, POS Terminal, Printer"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_hardware_model">Model</Label>
              <Input
                id="edit_hardware_model"
                value={createHardwareForm.model}
                onChange={(e) => setCreateHardwareForm({ ...createHardwareForm, model: e.target.value })}
                placeholder="e.g., Samsung Galaxy Tab A"
              />
            </div>
            <div>
              <Label htmlFor="edit_hardware_manufacturer">Manufacturer</Label>
              <Input
                id="edit_hardware_manufacturer"
                value={createHardwareForm.manufacturer}
                onChange={(e) => setCreateHardwareForm({ ...createHardwareForm, manufacturer: e.target.value })}
                placeholder="e.g., Samsung, Apple, HP"
              />
            </div>
            <div>
              <Label htmlFor="edit_hardware_cost">Estimated Cost (£)</Label>
              <Input
                id="edit_hardware_cost"
                type="number"
                step="0.01"
                value={createHardwareForm.estimated_cost}
                onChange={(e) => setCreateHardwareForm({ ...createHardwareForm, estimated_cost: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowEditHardwareDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} variant="gradient">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;