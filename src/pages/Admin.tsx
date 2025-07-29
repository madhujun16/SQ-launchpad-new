import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UKCitySelect } from '@/components/UKCitySelect';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import Header from '@/components/Header';

const Admin = () => {
  const { availableRoles, profile } = useAuth();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['user']);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  const roleOptions = [
    { id: 'user', label: 'User' },
    { id: 'ops_manager', label: 'Ops Manager' },
    { id: 'deployment_engineer', label: 'Deployment Engineer' },
    { id: 'admin', label: 'Admin' }
  ];

  useEffect(() => {
    if (availableRoles?.includes('admin')) {
      fetchUsers();
    }
  }, [availableRoles]);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profileError) {
        toast.error('Failed to fetch users');
        return;
      }

      // Fetch roles for each user
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        toast.error('Failed to fetch user roles');
        return;
      }

      // Combine profile data with roles
      const usersWithRoles = profiles?.map(profile => ({
        ...profile,
        roles: userRoles?.filter(role => role.user_id === profile.user_id).map(r => r.role) || []
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      toast.error('An error occurred while fetching users');
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName || selectedRoles.length === 0) {
      toast.error('Please fill in all fields and select at least one role');
      return;
    }

    setLoading(true);
    try {
      const userId = crypto.randomUUID();
      
      // Create user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ 
          user_id: userId,
          email,
          full_name: fullName,
          invited_by: profile?.user_id,
          invited_at: new Date().toISOString()
        });

      if (profileError) {
        toast.error('Failed to create user profile');
        setLoading(false);
        return;
      }

      // Create user roles
      const roleInserts = selectedRoles.map(role => ({
        user_id: userId,
        role: role as 'user' | 'ops_manager' | 'deployment_engineer' | 'admin',
        assigned_at: new Date().toISOString()
      }));

      const { error: rolesError } = await supabase
        .from('user_roles')
        .insert(roleInserts);

      if (rolesError) {
        toast.error('Failed to assign user roles');
        setLoading(false);
        return;
      }

      toast.success(`User created successfully! ${email} can now sign in using OTP`);

      // Reset form
      setEmail('');
      setFullName('');
      setSelectedCity('');
      setSelectedRoles(['user']);
      
      // Refresh users list
      fetchUsers();
    } catch (error: any) {
      toast.error('An unexpected error occurred');
    }
    setLoading(false);
  };

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(role => role !== roleId)
        : [...prev, roleId]
    );
  };

  if (!availableRoles?.includes('admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Access denied. Admin privileges required.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
              <CardDescription>
                Add a new user to the system. They can sign in immediately using email OTP.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">UK City</Label>
                  <UKCitySelect
                    value={selectedCity}
                    onValueChange={setSelectedCity}
                    placeholder="Select a UK city"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Roles</Label>
                  <div className="space-y-2">
                    {roleOptions.map(role => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={role.id}
                          checked={selectedRoles.includes(role.id)}
                          onCheckedChange={() => handleRoleToggle(role.id)}
                        />
                        <Label htmlFor={role.id} className="text-sm font-normal">
                          {role.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating User...' : 'Create User'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage existing users and their roles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.full_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles?.length > 0 ? (
                              user.roles.map((role: string) => (
                                <Badge 
                                  key={role} 
                                  variant={role === 'admin' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {role.replace('_', ' ').toUpperCase()}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                No roles assigned
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;