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
  Users,
  Home,
  ChevronRight,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Search,
  Shield,
  Wrench,
  User,
  Mail,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getRoleConfig } from '@/lib/roles';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { formatDate } from '@/lib/dateUtils';
import { PageLoader } from '@/components/ui/loader';

// Interfaces
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

export default function UserManagement() {
  const { currentRole, createUserAsAdmin, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [saving, setSaving] = useState(false);
  const [userStats, setUserStats] = useState({
    total_users: 0,
    admin_count: 0,
    ops_manager_count: 0,
    deployment_engineer_count: 0
  });

  const roleConfig = getRoleConfig(currentRole || 'admin');

  // Only allow admin access
  if (currentRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You do not have permission to access User Management. Please contact an administrator.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Only load if we have a current role (auth is ready)
    if (!currentRole) {
      console.log('UserManagement: Waiting for auth state...', { currentRole });
      return;
    }

    console.log('UserManagement: Auth ready, loading users...', { currentRole });

    loadUsers();
  }, [currentRole]); // Add currentRole as dependency

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // OPTIMIZED: Load all users with their roles in a single query using JOIN
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          email,
          full_name,
          created_at,
          updated_at,
          user_roles!inner(role)
        `)
        .order('created_at', { ascending: false });
      
      if (usersError) {
        console.error('Error loading users:', usersError);
        toast.error('Failed to load users');
        setUsers([]);
        return;
      }

      if (usersData && usersData.length > 0) {
        // Transform the data to match the expected format
        const usersWithRoles = usersData.map((user: any) => ({
          id: user.id,
          user_id: user.user_id,
          email: user.email,
          full_name: user.full_name,
          created_at: user.created_at,
          updated_at: user.updated_at,
          user_roles: user.user_roles || []
        }));
        
        setUsers(usersWithRoles);
        
        // Calculate user statistics from the loaded data
        const stats = {
          total_users: usersWithRoles.length,
          admin_count: 0,
          ops_manager_count: 0,
          deployment_engineer_count: 0
        };

        usersWithRoles.forEach(user => {
          user.user_roles.forEach((role: any) => {
            if (role.role === 'admin') stats.admin_count++;
            if (role.role === 'ops_manager') stats.ops_manager_count++;
            if (role.role === 'deployment_engineer') stats.deployment_engineer_count++;
          });
        });

        setUserStats(stats);
      } else {
        setUsers([]);
        setUserStats({
          total_users: 0,
          admin_count: 0,
          ops_manager_count: 0,
          deployment_engineer_count: 0
        });
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const addUser = () => {
    const newUser: User = {
      id: 'new',
      user_id: 'new',
      email: '',
      full_name: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_roles: []
    };
    setEditingUser(newUser);
  };

  const editUser = (user: User) => {
    setEditingUser(user);
  };

  const saveUser = async () => {
    if (!editingUser) return;
    
    setSaving(true);
    try {
      const isNewUser = editingUser.id === 'new';
      let profileId = editingUser.id;
      
      // Check if this is a new user (id === 'new')
      if (isNewUser) {
        // Validate required fields
        if (!editingUser.email || !editingUser.email.trim()) {
          toast.error('Email is required');
          setSaving(false);
          return;
        }
        
        if (!editingUser.full_name || !editingUser.full_name.trim()) {
          toast.error('Full name is required');
          setSaving(false);
          return;
        }
        
        if (editingUser.user_roles.length === 0) {
          toast.error('At least one role is required');
          setSaving(false);
          return;
        }
        
        // Get the primary role for auth user creation
        const primaryRole = editingUser.user_roles[0]?.role || 'admin';
        
        // Create user via edge function (handles auth user, profile, and roles)
        const { data: createdAuthUser, error: authError } = await createUserAsAdmin(
          editingUser.email,
          undefined, // No password - OTP based login
          primaryRole,
          editingUser.full_name,
          editingUser.user_roles
        );
        
        if (authError) {
          console.error('Error creating user:', authError);
          toast.error(`Failed to create user: ${authError}`);
          setSaving(false);
          return;
        }
        
        if (!createdAuthUser?.user?.id) {
          console.error('Created user ID not found');
          toast.error('Failed to get created user ID');
          setSaving(false);
          return;
        }
        
        const newUserId = createdAuthUser.user.id;
        
        // Reload users to get the newly created profile data
        await loadUsers();
        
        // Find the newly created user to get the profile ID
        const { data: usersData } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', newUserId)
          .single();
        
        if (usersData) {
          profileId = (usersData as any)?.id || '';
          editingUser.id = profileId;
          editingUser.user_id = newUserId;
        }
      } else {
        // Update existing user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: editingUser.full_name,
            updated_at: new Date().toISOString()
          } as any)
          .eq('id', editingUser.id as any);
        
        if (profileError) {
          console.error('Error updating profile:', profileError);
          toast.error('Failed to update user profile');
          setSaving(false);
          return;
        }
      }
      
      // Update user roles (only for existing users - new users have roles created by edge function)
      if (!isNewUser && editingUser.user_roles.length > 0) {
        // Get the current admin user's ID for assigned_by
        const assignedByUserId = currentUser?.id || editingUser.user_id;
        
        // First, delete existing roles
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', editingUser.user_id as any);
        
        // Then insert new roles
        const rolesToInsert = editingUser.user_roles.map(role => ({
          user_id: editingUser.user_id,
          role: role.role as Database["public"]["Enums"]["app_role"],
          assigned_by: assignedByUserId,
          assigned_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }));
        
        const { error: rolesError } = await supabase
          .from('user_roles')
          .insert(rolesToInsert as any);
        
        if (rolesError) {
          console.error('Error updating roles:', rolesError);
          toast.error('Failed to update user roles');
          setSaving(false);
          return;
        }
      }
      
      setEditingUser(null);
      
      if (isNewUser) {
        toast.success('User created successfully! They can now log in using OTP.');
      } else {
        toast.success('User updated successfully');
      }
      
      // Reload users to get fresh data
      await loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      // First delete user roles
      const { error: rolesError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId as any);
      
      if (rolesError) {
        console.error('Error deleting user roles:', rolesError);
      }
      
      // Then delete user profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId as any);
      
      if (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      } else {
        setUsers(prev => prev.filter(u => u.id !== userId));
        toast.success('User deleted successfully');
        await loadUsers(); // Reload to update stats
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  // Filter and paginate users (similar to Sites page)
  const { filteredUsers, totalPages, currentUsers } = useMemo(() => {
    let filtered = users;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.full_name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => 
        user.user_roles.some(r => r.role === roleFilter)
      );
    }

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = filtered.slice(startIndex, endIndex);

    return { filteredUsers: filtered, totalPages, currentUsers };
  }, [users, searchTerm, roleFilter, currentPage, itemsPerPage]);

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Show loading state
  if (loading) {
    return <PageLoader />;
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Users</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => {
            setError(null);
            loadUsers();
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
          <Link to="/dashboard" className="flex items-center space-x-1 hover:text-gray-900">
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">User Management</span>
        </nav>

        {/* Header with Add User Button */}
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
            <p className="text-gray-600">
              Manage user accounts, roles, and permissions.
            </p>
          </div>
          <Button 
            onClick={addUser} 
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg text-lg"
          >
            <Plus className="h-5 w-5 mr-3" />
            Add User
          </Button>
        </div>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="card-surface">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{userStats.total_users}</p>
                  <p className="text-sm text-gray-600">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-surface">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{userStats.admin_count}</p>
                  <p className="text-sm text-gray-600">Admins</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-surface">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{userStats.ops_manager_count}</p>
                  <p className="text-sm text-gray-600">Ops Managers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-surface">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Wrench className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{userStats.deployment_engineer_count}</p>
                  <p className="text-sm text-gray-600">Deployment Engineers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters - All in One Line (Desktop) */}
        <div className="mb-4">
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
            {/* Search Bar */}
            <div className="flex-1 lg:flex-none lg:w-80">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
            
            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="ops_manager">Ops Manager</SelectItem>
                <SelectItem value="deployment_engineer">Deployment Engineer</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Clear Filters Button */}
            <Button variant="outline" onClick={clearFilters} className="w-full lg:w-auto">
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Users Table */}
        <Card className="mt-2">
          <CardContent className="p-0">
            <div className="overflow-hidden">
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
                  {currentUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm text-gray-500">No users found</p>
                        <p className="text-xs text-gray-400">Create your first user to get started</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentUsers.map(user => (
                      <TableRow key={user.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-500" />
                            </div>
                            <span>{user.full_name || 'Unnamed User'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span>{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.user_roles.length === 0 ? (
                              <Badge variant="outline" className="text-gray-500">
                                No Roles
                              </Badge>
                            ) : (
                              user.user_roles.map((role, index) => {
                                const roleConfig = getRoleConfig(role.role);
                                const badgeColors = {
                                  admin: 'bg-red-100 text-red-800 border-red-200',
                                  ops_manager: 'bg-green-100 text-green-800 border-green-200',
                                  deployment_engineer: 'bg-green-100 text-green-800 border-green-200'
                                };
                                return (
                                  <Badge 
                                    key={index} 
                                    variant="outline"
                                    className={badgeColors[role.role] || 'bg-gray-100 text-gray-800 border-gray-200'}
                                  >
                                    {roleConfig.displayName}
                                  </Badge>
                                );
                              })
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{formatDate(user.created_at)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => editUser(user)}
                              className="h-8 w-8 p-0 hover:bg-green-50"
                              title="Edit User"
                            >
                              <Edit className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteUser(user.id)}
                              className="h-8 w-8 p-0 hover:bg-red-50"
                              title="Delete User"
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

        {/* Summary and Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
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

      {/* Edit User Dialog */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              {editingUser.id === 'new' ? 'Add User' : 'Edit User'}
            </h3>
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
                  disabled={editingUser.id !== 'new'} // Disable email editing for existing users
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
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setEditingUser(null)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={saveUser}
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
    </div>
  );
}
