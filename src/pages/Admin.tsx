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
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Administration</h1>
              <p className="text-gray-600">Manage users, organizations, software modules, and hardware inventory</p>
            </div>
          </div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                User Accounts
              </TabsTrigger>
              <TabsTrigger value="organizations" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Organizations
              </TabsTrigger>
              <TabsTrigger value="software" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Software Modules
              </TabsTrigger>
              <TabsTrigger value="hardware" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Hardware Catalog
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-gray-700">Total Users</CardTitle>
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                    <p className="text-xs text-gray-500 mt-1">
                      All registered users
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-gray-700">Admins</CardTitle>
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <Crown className="h-4 w-4 text-red-600" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold text-gray-900">{stats.admins}</div>
                    <p className="text-xs text-gray-500 mt-1">
                      System administrators
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-gray-700">Ops Managers</CardTitle>
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Wrench className="h-4 w-4 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold text-gray-900">{stats.opsManagers}</div>
                    <p className="text-xs text-gray-500 mt-1">
                      Operations managers
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-gray-700">Deployment Engineers</CardTitle>
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Truck className="h-4 w-4 text-purple-600" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold text-gray-900">{stats.deploymentEngineers}</div>
                    <p className="text-xs text-gray-500 mt-1">
                      Field engineers
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-gray-700">No Role</CardTitle>
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <UserX className="h-4 w-4 text-gray-600" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold text-gray-900">{stats.noRole}</div>
                    <p className="text-xs text-gray-500 mt-1">
                      Unassigned users
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center py-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">User Accounts</h2>
                  <p className="text-gray-600 mt-1">Manage user accounts and role assignments</p>
                </div>
                <Button onClick={() => setShowCreateUserDialog(true)} variant="gradient" className="h-10 px-6">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New User
                </Button>
              </div>

              {/* Filters */}
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="search" className="text-sm font-medium">Search Users</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="search"
                          placeholder="Search by email or name..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 h-10"
                          aria-label="Search users"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role-filter" className="text-sm font-medium">Filter by Role</Label>
                      <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="h-10">
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
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Users ({filteredUsers.length})</CardTitle>
                  <CardDescription>
                    All registered users in the system
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="px-6 py-4 font-semibold text-gray-900">Name</TableHead>
                          <TableHead className="px-6 py-4 font-semibold text-gray-900">Email</TableHead>
                          <TableHead className="px-6 py-4 font-semibold text-gray-900">Roles</TableHead>
                          <TableHead className="px-6 py-4 font-semibold text-gray-900">Created</TableHead>
                          <TableHead className="px-6 py-4 font-semibold text-gray-900 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id} className="hover:bg-gray-50 transition-colors">
                            <TableCell className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                  <User className="h-4 w-4 text-gray-600" />
                                </div>
                                <span className="font-medium text-gray-900">{user.full_name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-700">{user.email}</span>
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <div className="flex flex-wrap gap-2">
                                {user.user_roles.length === 0 ? (
                                  <Badge variant="secondary" className="text-gray-500 bg-gray-100">
                                    <UserX className="h-3 w-3 mr-1" />
                                    No Role
                                  </Badge>
                                ) : (
                                  user.user_roles.map((role, index) => (
                                    <Badge 
                                      key={index} 
                                      variant="outline" 
                                      className={`${getRoleColor(role.role)} flex items-center gap-1 px-2 py-1`}
                                    >
                                      {getRoleIcon(role.role)}
                                      {getRoleConfig(role.role).displayName}
                                    </Badge>
                                  ))
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-700">{new Date(user.created_at).toLocaleDateString()}</span>
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openEditUserDialog(user)}
                                  aria-label={`Edit user ${user.full_name}`}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.user_id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
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
                      <div className="text-center py-12 text-gray-500">
                        <UserX className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm font-medium">
                          {users.length === 0 ? 'No users found' : 'No users match your filters'}
                        </p>
                        {users.length === 0 && (
                          <p className="text-xs text-gray-400 mt-1">Create your first user to get started</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="organizations" className="space-y-6">
              <div className="flex justify-between items-center py-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Organization Management</h2>
                  <p className="text-gray-600 mt-1">Manage organizations for site mapping</p>
                </div>
                <Button onClick={() => setShowCreateOrgDialog(true)} variant="gradient" className="h-10 px-6">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Organization
                </Button>
              </div>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Organizations ({organizations.length})</CardTitle>
                  <CardDescription>
                    Manage organizations for site mapping
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="px-6 py-4 font-semibold text-gray-900">Name</TableHead>
                          <TableHead className="px-6 py-4 font-semibold text-gray-900">Description</TableHead>
                          <TableHead className="px-6 py-4 font-semibold text-gray-900">Sector</TableHead>
                          <TableHead className="px-6 py-4 font-semibold text-gray-900">Created</TableHead>
                          <TableHead className="px-6 py-4 font-semibold text-gray-900 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {organizations.map((org) => (
                          <TableRow key={org.id} className="hover:bg-gray-50 transition-colors">
                            <TableCell className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                  <Building className="h-4 w-4 text-gray-600" />
                                </div>
                                <span className="font-medium text-gray-900">{org.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-gray-700">{org.description}</TableCell>
                            <TableCell className="px-6 py-4">
                              <Badge variant="outline" className="text-sm bg-gray-100">
                                {org.sector || 'Not specified'}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-700">{new Date(org.created_at).toLocaleDateString()}</span>
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openEditOrgDialog(org)}
                                  aria-label={`Edit organization ${org.name}`}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDeleteOrganization(org.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
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
                      <div className="text-center py-12 text-gray-500">
                        <Building className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm font-medium">No organizations found</p>
                        <p className="text-xs text-gray-400 mt-1">Create your first organization to get started</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="software" className="space-y-6">
              <div className="flex justify-between items-center py-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Software Management</h2>
                  <p className="text-gray-600 mt-1">Manage SmartQ software modules for site deployment</p>
                </div>
                <Button onClick={() => setShowCreateSoftwareDialog(true)} variant="gradient" className="h-10 px-6">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Software Module
                </Button>
              </div>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Software Modules ({softwareModules.length})</CardTitle>
                  <CardDescription>
                    Manage SmartQ software modules for site deployment
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="px-6 py-4 font-semibold text-gray-900">Name</TableHead>
                          <TableHead className="px-6 py-4 font-semibold text-gray-900">Description</TableHead>
                          <TableHead className="px-6 py-4 font-semibold text-gray-900">Category</TableHead>
                          <TableHead className="px-6 py-4 font-semibold text-gray-900">Status</TableHead>
                          <TableHead className="px-6 py-4 font-semibold text-gray-900">Created</TableHead>
                          <TableHead className="px-6 py-4 font-semibold text-gray-900 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {softwareModules.map((software) => (
                          <TableRow key={software.id} className="hover:bg-gray-50 transition-colors">
                            <TableCell className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <Settings className="h-4 w-4 text-blue-600" />
                                </div>
                                <span className="font-medium text-gray-900">{software.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-gray-700">{software.description || 'No description'}</TableCell>
                            <TableCell className="px-6 py-4">
                              <Badge variant="outline" className="text-sm bg-blue-100">
                                {software.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <Badge variant={software.is_active ? "default" : "secondary"} className="text-sm">
                                {software.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-700">{new Date(software.created_at).toLocaleDateString()}</span>
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openEditSoftwareDialog(software)}
                                  aria-label={`Edit software module ${software.name}`}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDeleteSoftware(software.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
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
                      <div className="text-center py-12 text-gray-500">
                        <Settings className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm font-medium">No software modules found</p>
                        <p className="text-xs text-gray-400 mt-1">Create your first software module to get started</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hardware" className="space-y-6">
              <div className="flex justify-between items-center py-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Hardware Management</h2>
                  <p className="text-gray-600 mt-1">Manage hardware items for site deployment</p>
                </div>
                <Button onClick={() => setShowCreateHardwareDialog(true)} variant="gradient" className="h-10 px-6">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Hardware Item
                </Button>
              </div>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Hardware Items ({hardwareItems.length})</CardTitle>
                  <CardDescription>
                    Manage hardware items for site deployment
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="px-6 py-4 font-semibold text-gray-900">Name</TableHead>
                          <TableHead className="px-6 py-4 font-semibold text-gray-900">Description</TableHead>
                          <TableHead className="px-6 py-4 font-semibold text-gray-900">Category</TableHead>
                          <TableHead className="px-6 py-4 font-semibold text-gray-900">Model</TableHead>
                          <TableHead className="px-6 py-4 font-semibold text-gray-900">Manufacturer</TableHead>
                          <TableHead className="px-6 py-4 font-semibold text-gray-900">Estimated Cost</TableHead>
                          <TableHead className="px-6 py-4 font-semibold text-gray-900">Status</TableHead>
                          <TableHead className="px-6 py-4 font-semibold text-gray-900 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {hardwareItems.map((hardware) => (
                          <TableRow key={hardware.id} className="hover:bg-gray-50 transition-colors">
                            <TableCell className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                  <Wrench className="h-4 w-4 text-purple-600" />
                                </div>
                                <span className="font-medium text-gray-900">{hardware.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-gray-700">{hardware.description || 'No description'}</TableCell>
                            <TableCell className="px-6 py-4">
                              <Badge variant="outline" className="text-sm bg-purple-100">
                                {hardware.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-gray-700">{hardware.model || 'N/A'}</TableCell>
                            <TableCell className="px-6 py-4 text-gray-700">{hardware.manufacturer || 'N/A'}</TableCell>
                            <TableCell className="px-6 py-4">
                              <span className="font-medium text-gray-900">
                                {hardware.estimated_cost ? `£${hardware.estimated_cost.toFixed(2)}` : 'N/A'}
                              </span>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <Badge variant={hardware.is_active ? "default" : "secondary"} className="text-sm">
                                {hardware.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openEditHardwareDialog(hardware)}
                                  aria-label={`Edit hardware item ${hardware.name}`}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDeleteHardware(hardware.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
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
                      <div className="text-center py-12 text-gray-500">
                        <Wrench className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm font-medium">No hardware items found</p>
                        <p className="text-xs text-gray-400 mt-1">Create your first hardware item to get started</p>
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
          <form onSubmit={handleCreateUser} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={createUserForm.email}
                onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                placeholder="user@example.com"
                required
                aria-describedby="email-help"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-sm font-medium">Full Name</Label>
              <Input
                id="full_name"
                value={createUserForm.full_name}
                onChange={(e) => setCreateUserForm({ ...createUserForm, full_name: e.target.value })}
                placeholder="John Doe"
                required
                aria-describedby="name-help"
                className="h-10"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium">Roles</Label>
              <div className="space-y-4">
                {Object.values(ROLES).map((role) => (
                  <div key={role.key} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
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
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getRoleIcon(role.key)}
                        <Label htmlFor={role.key} className="text-sm font-medium cursor-pointer">
                          {role.displayName}
                        </Label>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{role.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
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
          <form onSubmit={handleEditUser} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="edit_email" className="text-sm font-medium">Email</Label>
              <Input
                id="edit_email"
                type="email"
                value={createUserForm.email}
                onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                placeholder="user@example.com"
                required
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_full_name" className="text-sm font-medium">Full Name</Label>
              <Input
                id="edit_full_name"
                value={createUserForm.full_name}
                onChange={(e) => setCreateUserForm({ ...createUserForm, full_name: e.target.value })}
                placeholder="John Doe"
                required
                className="h-10"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium">Roles</Label>
              <div className="space-y-4">
                {Object.values(ROLES).map((role) => (
                  <div key={role.key} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
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
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getRoleIcon(role.key)}
                        <Label htmlFor={`edit_${role.key}`} className="text-sm font-medium cursor-pointer">
                          {role.displayName}
                        </Label>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{role.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
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
          <form onSubmit={handleCreateOrganization} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="org_name" className="text-sm font-medium">Name</Label>
              <Input
                id="org_name"
                value={createOrgForm.name}
                onChange={(e) => setCreateOrgForm({ ...createOrgForm, name: e.target.value })}
                placeholder="Organization name"
                required
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org_description" className="text-sm font-medium">Description</Label>
              <Input
                id="org_description"
                value={createOrgForm.description}
                onChange={(e) => setCreateOrgForm({ ...createOrgForm, description: e.target.value })}
                placeholder="Organization description"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org_sector" className="text-sm font-medium">Sector</Label>
              <Select
                value={createOrgForm.sector}
                onValueChange={(value) => setCreateOrgForm({ ...createOrgForm, sector: value })}
              >
                <SelectTrigger className="h-10">
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
            <div className="flex justify-end gap-3 pt-4 border-t">
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
          <form onSubmit={handleEditOrganization} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="edit_org_name" className="text-sm font-medium">Name</Label>
              <Input
                id="edit_org_name"
                value={createOrgForm.name}
                onChange={(e) => setCreateOrgForm({ ...createOrgForm, name: e.target.value })}
                placeholder="Organization name"
                required
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_org_description" className="text-sm font-medium">Description</Label>
              <Input
                id="edit_org_description"
                value={createOrgForm.description}
                onChange={(e) => setCreateOrgForm({ ...createOrgForm, description: e.target.value })}
                placeholder="Organization description"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_org_sector" className="text-sm font-medium">Sector</Label>
              <Select
                value={createOrgForm.sector}
                onValueChange={(value) => setCreateOrgForm({ ...createOrgForm, sector: value })}
              >
                <SelectTrigger className="h-10">
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
            <div className="flex justify-end gap-3 pt-4 border-t">
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
          <form onSubmit={handleCreateSoftware} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="software_name" className="text-sm font-medium">Name</Label>
              <Input
                id="software_name"
                value={createSoftwareForm.name}
                onChange={(e) => setCreateSoftwareForm({ ...createSoftwareForm, name: e.target.value })}
                placeholder="e.g., SmartQ POS System"
                required
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="software_description" className="text-sm font-medium">Description</Label>
              <Input
                id="software_description"
                value={createSoftwareForm.description}
                onChange={(e) => setCreateSoftwareForm({ ...createSoftwareForm, description: e.target.value })}
                placeholder="Software module description"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="software_category" className="text-sm font-medium">Category</Label>
              <Input
                id="software_category"
                value={createSoftwareForm.category}
                onChange={(e) => setCreateSoftwareForm({ ...createSoftwareForm, category: e.target.value })}
                placeholder="e.g., POS, KMS, QR, Kiosk"
                required
                className="h-10"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
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
          <form onSubmit={handleEditSoftware} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="edit_software_name" className="text-sm font-medium">Name</Label>
              <Input
                id="edit_software_name"
                value={createSoftwareForm.name}
                onChange={(e) => setCreateSoftwareForm({ ...createSoftwareForm, name: e.target.value })}
                placeholder="e.g., SmartQ POS System"
                required
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_software_description" className="text-sm font-medium">Description</Label>
              <Input
                id="edit_software_description"
                value={createSoftwareForm.description}
                onChange={(e) => setCreateSoftwareForm({ ...createSoftwareForm, description: e.target.value })}
                placeholder="Software module description"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_software_category" className="text-sm font-medium">Category</Label>
              <Input
                id="edit_software_category"
                value={createSoftwareForm.category}
                onChange={(e) => setCreateSoftwareForm({ ...createSoftwareForm, category: e.target.value })}
                placeholder="e.g., POS, KMS, QR, Kiosk"
                required
                className="h-10"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
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
          <form onSubmit={handleCreateHardware} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="hardware_name" className="text-sm font-medium">Name</Label>
              <Input
                id="hardware_name"
                value={createHardwareForm.name}
                onChange={(e) => setCreateHardwareForm({ ...createHardwareForm, name: e.target.value })}
                placeholder="e.g., Android Tablet"
                required
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hardware_description" className="text-sm font-medium">Description</Label>
              <Input
                id="hardware_description"
                value={createHardwareForm.description}
                onChange={(e) => setCreateHardwareForm({ ...createHardwareForm, description: e.target.value })}
                placeholder="Hardware item description"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hardware_category" className="text-sm font-medium">Category</Label>
              <Input
                id="hardware_category"
                value={createHardwareForm.category}
                onChange={(e) => setCreateHardwareForm({ ...createHardwareForm, category: e.target.value })}
                placeholder="e.g., Tablet, POS Terminal, Printer"
                required
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hardware_model" className="text-sm font-medium">Model</Label>
              <Input
                id="hardware_model"
                value={createHardwareForm.model}
                onChange={(e) => setCreateHardwareForm({ ...createHardwareForm, model: e.target.value })}
                placeholder="e.g., Samsung Galaxy Tab A"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hardware_manufacturer" className="text-sm font-medium">Manufacturer</Label>
              <Input
                id="hardware_manufacturer"
                value={createHardwareForm.manufacturer}
                onChange={(e) => setCreateHardwareForm({ ...createHardwareForm, manufacturer: e.target.value })}
                placeholder="e.g., Samsung, Apple, HP"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hardware_cost" className="text-sm font-medium">Estimated Cost (£)</Label>
              <Input
                id="hardware_cost"
                type="number"
                step="0.01"
                value={createHardwareForm.estimated_cost}
                onChange={(e) => setCreateHardwareForm({ ...createHardwareForm, estimated_cost: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                className="h-10"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
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
          <form onSubmit={handleEditHardware} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="edit_hardware_name" className="text-sm font-medium">Name</Label>
              <Input
                id="edit_hardware_name"
                value={createHardwareForm.name}
                onChange={(e) => setCreateHardwareForm({ ...createHardwareForm, name: e.target.value })}
                placeholder="e.g., Android Tablet"
                required
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_hardware_description" className="text-sm font-medium">Description</Label>
              <Input
                id="edit_hardware_description"
                value={createHardwareForm.description}
                onChange={(e) => setCreateHardwareForm({ ...createHardwareForm, description: e.target.value })}
                placeholder="Hardware item description"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_hardware_category" className="text-sm font-medium">Category</Label>
              <Input
                id="edit_hardware_category"
                value={createHardwareForm.category}
                onChange={(e) => setCreateHardwareForm({ ...createHardwareForm, category: e.target.value })}
                placeholder="e.g., Tablet, POS Terminal, Printer"
                required
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_hardware_model" className="text-sm font-medium">Model</Label>
              <Input
                id="edit_hardware_model"
                value={createHardwareForm.model}
                onChange={(e) => setCreateHardwareForm({ ...createHardwareForm, model: e.target.value })}
                placeholder="e.g., Samsung Galaxy Tab A"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_hardware_manufacturer" className="text-sm font-medium">Manufacturer</Label>
              <Input
                id="edit_hardware_manufacturer"
                value={createHardwareForm.manufacturer}
                onChange={(e) => setCreateHardwareForm({ ...createHardwareForm, manufacturer: e.target.value })}
                placeholder="e.g., Samsung, Apple, HP"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_hardware_cost" className="text-sm font-medium">Estimated Cost (£)</Label>
              <Input
                id="edit_hardware_cost"
                type="number"
                step="0.01"
                value={createHardwareForm.estimated_cost}
                onChange={(e) => setCreateHardwareForm({ ...createHardwareForm, estimated_cost: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                className="h-10"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
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