import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Crown,
  Wrench,
  Truck,
  User,
  Mail,
  Calendar,
  Filter
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getRoleConfig } from '@/lib/roles';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader } from '@/components/ui/loader';

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
  const { currentRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
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
      <div className="container mx-auto px-4 py-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access User Management. Please contact an administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Load users with their actual roles
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
      user_id: '',
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
      loadUsers();
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

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || 
                       user.user_roles.some(r => r.role === selectedRole);
    return matchesSearch && matchesRole;
  });

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader size="lg" />
            <p className="text-gray-600 mt-4">Loading users...</p>
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
                loadUsers();
              }}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
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
        <span className="text-gray-900 font-medium">User Management</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <roleConfig.icon className="h-3 w-3" />
            <span>{roleConfig.displayName}</span>
          </Badge>
        </div>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{userStats.total_users}</p>
                <p className="text-sm text-gray-600">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{userStats.admin_count}</p>
                <p className="text-sm text-gray-600">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{userStats.ops_manager_count}</p>
                <p className="text-sm text-gray-600">Ops Managers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
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

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>User Directory</span>
          </CardTitle>
          <CardDescription>
            Manage user accounts, roles, and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="ops_manager">Ops Manager</SelectItem>
                    <SelectItem value="deployment_engineer">Deployment Engineer</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addUser}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>

            {/* Users Count */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">
                User Accounts ({filteredUsers.length})
              </h3>
            </div>

            {/* Users Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[28%]">Name</TableHead>
                    <TableHead className="w-[28%]">Email</TableHead>
                    <TableHead className="w-[22%]">Roles</TableHead>
                    <TableHead className="w-[14%]">Created</TableHead>
                    <TableHead className="w-[8%] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">No users found</p>
                        <p className="text-xs">Create your first user to get started</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map(user => (
                      <TableRow key={user.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-2 min-w-0">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="truncate">{user.full_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2 min-w-0">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="truncate">{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
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
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{new Date(user.created_at).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

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
