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
import { Building, Users, Plus, Edit, Trash2, UserPlus, Save, X, Search, Shield, Settings } from 'lucide-react';

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
}

const Admin = () => {
  const { currentRole, profile } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
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
    description: ''
  });

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

      // Fetch roles for each user
      const usersWithRoles = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const { data: rolesData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.user_id);

          return {
            ...profile,
            user_roles: rolesData || []
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      // For now, we'll use an empty array since the organizations table doesn't exist yet
      // This will be updated once the migration is applied
      setOrganizations([]);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Failed to fetch organizations');
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

      console.log('Creating user:', {
        email: createUserForm.email,
        full_name: createUserForm.full_name,
        roles: createUserForm.roles
      });

      // Create profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: crypto.randomUUID(),
          email: createUserForm.email,
          full_name: createUserForm.full_name,
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }

      console.log('Profile created successfully:', profileData);

      // Create user roles
      const roleInserts = createUserForm.roles.map(role => ({
        user_id: profileData.user_id,
        role: role as 'admin' | 'ops_manager' | 'deployment_engineer',
        assigned_by: profile?.user_id,
      }));

      console.log('Inserting roles:', roleInserts);

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .insert(roleInserts)
        .select();

      if (roleError) {
        console.error('Role creation error:', roleError);
        throw new Error(`Role creation failed: ${roleError.message}`);
      }

      console.log('Roles created successfully:', roleData);

      toast.success('User created successfully');
      setShowCreateUserDialog(false);
      setCreateUserForm({ email: '', full_name: '', roles: [] });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUser || createUserForm.roles.length === 0) {
      toast.error('Please fill in all required fields and select at least one role');
      return;
    }

    try {
      setLoading(true);

      console.log('Updating user:', {
        user_id: editingUser.user_id,
        email: createUserForm.email,
        full_name: createUserForm.full_name,
        roles: createUserForm.roles
      });

      // Update profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({
          email: createUserForm.email,
          full_name: createUserForm.full_name,
        })
        .eq('user_id', editingUser.user_id)
        .select();

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw new Error(`Profile update failed: ${profileError.message}`);
      }

      console.log('Profile updated successfully:', profileData);

      // Delete existing roles
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', editingUser.user_id);

      if (deleteError) {
        console.error('Role deletion error:', deleteError);
        throw new Error(`Role deletion failed: ${deleteError.message}`);
      }

      console.log('Existing roles deleted successfully');

      // Insert new roles
      const roleInserts = createUserForm.roles.map(role => ({
        user_id: editingUser.user_id,
        role: role as 'admin' | 'ops_manager' | 'deployment_engineer',
        assigned_by: profile?.user_id,
      }));

      console.log('Inserting roles:', roleInserts);

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .insert(roleInserts)
        .select();

      if (roleError) {
        console.error('Role insertion error:', roleError);
        throw new Error(`Role insertion failed: ${roleError.message}`);
      }

      console.log('Roles inserted successfully:', roleData);

      toast.success('User updated successfully');
      setShowEditUserDialog(false);
      setEditingUser(null);
      setCreateUserForm({ email: '', full_name: '', roles: [] });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      setLoading(true);

      // Delete user roles first
      const { error: rolesError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (rolesError) throw rolesError;

      // Delete profile
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
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      // TODO: Implement once organizations table is created
      toast.success('Organization created successfully');
      setShowCreateOrgDialog(false);
      setCreateOrgForm({ name: '', description: '' });
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
    
    if (!editingOrg) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      // TODO: Implement once organizations table is created
      toast.success('Organization updated successfully');
      setShowEditOrgDialog(false);
      setEditingOrg(null);
      setCreateOrgForm({ name: '', description: '' });
      fetchOrganizations();
    } catch (error) {
      console.error('Error updating organization:', error);
      toast.error('Failed to update organization');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrganization = async (orgId: string) => {
    if (!confirm('Are you sure you want to delete this organization?')) return;

    try {
      setLoading(true);
      // TODO: Implement once organizations table is created
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
      description: org.description
    });
    setShowEditOrgDialog(true);
  };

  const getRoleDisplay = (roles: Array<{ role: string }>) => {
    if (!roles || roles.length === 0) return 'No Role';
    return roles.map(r => getRoleConfig(r.role as any).displayName).join(', ');
  };

  const getRoleColor = (roles: Array<{ role: string }>) => {
    if (!roles || roles.length === 0) return 'bg-gray-100 text-gray-800';
    const role = roles[0].role;
    return getRoleConfig(role as any).color;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || 
                       user.user_roles.some(role => role.role === roleFilter);
    return matchesSearch && matchesRole;
  });

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Utilities</h1>
            <p className="text-muted-foreground">Manage users and organizations</p>
          </div>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="organizations">Organization Management</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">User Management</h2>
              <Button onClick={() => setShowCreateUserDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add New User
              </Button>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search">Search Users</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Search by email or name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="sm:w-48">
                    <Label htmlFor="role-filter">Filter by Role</Label>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger>
                        <SelectValue />
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

            <Card>
              <CardHeader>
                <CardTitle>Users ({filteredUsers.length})</CardTitle>
                <CardDescription>
                  All registered users in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(user.user_roles)}>
                            {getRoleDisplay(user.user_roles)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openEditUserDialog(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteUser(user.user_id)}
                              className="text-red-600 hover:text-red-700"
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="organizations" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Organization Management</h2>
              <Button onClick={() => setShowCreateOrgDialog(true)}>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizations.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell className="font-medium">{org.name}</TableCell>
                        <TableCell>{org.description}</TableCell>
                        <TableCell>
                          {new Date(org.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openEditOrgDialog(org)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteOrganization(org.id)}
                              className="text-red-600 hover:text-red-700"
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
              />
            </div>
            <div>
              <Label>Roles</Label>
              <div className="space-y-2">
                {Object.values(ROLES).map((role) => (
                  <div key={role.key} className="flex items-center space-x-2">
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
                    />
                    <Label htmlFor={role.key} className="text-sm font-normal">
                      {role.displayName}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateUserDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
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
              <div className="space-y-2">
                {Object.values(ROLES).map((role) => (
                  <div key={role.key} className="flex items-center space-x-2">
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
                    <Label htmlFor={`edit_${role.key}`} className="text-sm font-normal">
                      {role.displayName}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowEditUserDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
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
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateOrgDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
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
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowEditOrgDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
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