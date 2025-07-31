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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Header from '@/components/Header';
import UserManagement from '@/components/UserManagement';
import RoleIndicator from '@/components/RoleIndicator';
import { getRoleConfig, hasPermission, ROLES } from '@/lib/roles';
import { useNavigate } from 'react-router-dom';
import { Building, MapPin, Users, Calendar, Plus, Edit, Trash2, UserPlus } from 'lucide-react';
import { Site, getStatusColor, getStatusDisplayName } from '@/lib/siteTypes';

const Admin = () => {
  const { currentRole, profile, createUserAsAdmin } = useAuth();
  const navigate = useNavigate();
  const [sites, setSites] = useState<Site[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isCreatingSite, setIsCreatingSite] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state for new site
  const [newSite, setNewSite] = useState({
    name: '',
    city: '',
    address: '',
    postcode: '',
    cafeteriaType: 'staff' as const,
    capacity: 0,
    expectedFootfall: 0,
    description: '',
    opsManagerId: '',
    deploymentEngineerId: ''
  });

  // Form state for new user
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' as const,
    fullName: ''
  });

  // Check if user has admin permissions
  React.useEffect(() => {
    if (currentRole && !hasPermission(currentRole, 'manage_users')) {
      toast.error('You do not have permission to access the Admin panel');
      navigate('/dashboard');
    }
  }, [currentRole, navigate]);

  useEffect(() => {
    if (hasPermission(currentRole || 'user', 'manage_users')) {
      fetchSites();
      fetchUsers();
    }
  }, [currentRole]);

  const fetchSites = async () => {
    try {
      // This would be replaced with actual Supabase query
      const mockSites: Site[] = [
        {
          id: '1',
          name: 'Manchester Central Cafeteria',
          location: {
            address: '123 Main Street',
            city: 'Manchester',
            postcode: 'M1 1AA'
          },
          status: {
            study: 'completed',
            costApproval: 'completed',
            inventory: 'completed',
            products: 'completed',
            deployment: 'completed'
          },
          overallStatus: 'deployed',
          assignment: {
            opsManagerId: 'user1',
            deploymentEngineerId: 'user2',
            assignedAt: '2024-01-15',
            assignedBy: 'admin1'
          },
          createdAt: '2024-01-01',
          updatedAt: '2024-07-30',
          createdBy: 'admin1',
          clientName: 'Compass Group',
          cafeteriaType: 'mixed',
          capacity: 150,
          expectedFootfall: 300
        },
        {
          id: '2',
          name: 'Birmingham Office Cafeteria',
          location: {
            address: '456 Business Park',
            city: 'Birmingham',
            postcode: 'B1 1BB'
          },
          status: {
            study: 'in-progress',
            costApproval: 'pending',
            inventory: 'pending',
            products: 'pending',
            deployment: 'pending'
          },
          overallStatus: 'in-progress',
          assignment: {
            opsManagerId: 'user3',
            deploymentEngineerId: 'user4',
            assignedAt: '2024-01-20',
            assignedBy: 'admin1'
          },
          createdAt: '2024-01-15',
          updatedAt: '2024-07-30',
          createdBy: 'admin1',
          clientName: 'Compass Group',
          cafeteriaType: 'staff',
          capacity: 80,
          expectedFootfall: 120
        }
      ];
      setSites(mockSites);
    } catch (error) {
      console.error('Error fetching sites:', error);
      toast.error('Failed to fetch sites');
    }
  };

  const fetchUsers = async () => {
    try {
      const { data: usersData, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            role
          )
        `);

      if (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to fetch users');
        return;
      }

      setUsers(usersData || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const createSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSite.name || !newSite.city || !newSite.address || !newSite.postcode) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!newSite.opsManagerId || !newSite.deploymentEngineerId) {
      toast.error('Please assign both Ops Manager and Deployment Engineer');
      return;
    }

    setLoading(true);
    try {
      // This would be replaced with actual Supabase insert
      const newSiteData: Site = {
        id: Date.now().toString(),
        name: newSite.name,
        location: {
          address: newSite.address,
          city: newSite.city,
          postcode: newSite.postcode
        },
        status: {
          study: 'pending',
          costApproval: 'pending',
          inventory: 'pending',
          products: 'pending',
          deployment: 'pending'
        },
        overallStatus: 'new',
        assignment: {
          opsManagerId: newSite.opsManagerId,
          deploymentEngineerId: newSite.deploymentEngineerId,
          assignedAt: new Date().toISOString(),
          assignedBy: profile?.user_id || 'admin'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: profile?.user_id || 'admin',
        clientName: 'Compass Group',
        cafeteriaType: newSite.cafeteriaType,
        capacity: newSite.capacity,
        expectedFootfall: newSite.expectedFootfall,
        description: newSite.description
      };

      setSites(prev => [...prev, newSiteData]);
      toast.success('Site created successfully!');
      setIsCreatingSite(false);
      setNewSite({
        name: '',
        city: '',
        address: '',
        postcode: '',
        cafeteriaType: 'staff',
        capacity: 0,
        expectedFootfall: 0,
        description: '',
        opsManagerId: '',
        deploymentEngineerId: ''
      });
    } catch (error) {
      console.error('Error creating site:', error);
      toast.error('Failed to create site');
    }
    setLoading(false);
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.email || !newUser.password || !newUser.confirmPassword || !newUser.fullName) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newUser.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const { error } = await createUserAsAdmin(newUser.email, newUser.password, newUser.role);
      
      if (error) {
        toast.error(`Failed to create user: ${error.message}`);
      } else {
        toast.success('User created successfully!');
        setIsCreatingUser(false);
        setNewUser({
          email: '',
          password: '',
          confirmPassword: '',
          role: 'user',
          fullName: ''
        });
        fetchUsers(); // Refresh user list
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    }
    setLoading(false);
  };

  const opsManagers = users.filter(user => 
    user.user_roles?.some((role: any) => role.role === 'ops_manager')
  );

  const deploymentEngineers = users.filter(user => 
    user.user_roles?.some((role: any) => role.role === 'deployment_engineer')
  );

  if (!hasPermission(currentRole || 'user', 'manage_users')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You do not have permission to access the Admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage sites and users</p>
          </div>
          <RoleIndicator />
        </div>

        <Tabs defaultValue="sites" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sites">Cafeteria Sites</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>

          <TabsContent value="sites" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Compass Group Cafeterias</h2>
              <Button onClick={() => setIsCreatingSite(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Site
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Site Overview</CardTitle>
                <CardDescription>
                  Total Cafeterias: {sites.length} | Active: {sites.filter(s => s.overallStatus === 'deployed').length} | In Progress: {sites.filter(s => s.overallStatus === 'in-progress').length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Site Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sites.map((site) => (
                      <TableRow key={site.id}>
                        <TableCell className="font-medium">{site.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{site.location.city}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(site.overallStatus)}>
                            {getStatusDisplayName(site.overallStatus)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {site.cafeteriaType}
                          </Badge>
                        </TableCell>
                        <TableCell>{site.capacity} seats</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">User Management</h2>
              <Button onClick={() => setIsCreatingUser(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add New User
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Users Overview</CardTitle>
                <CardDescription>
                  Total Users: {users.length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell className="font-medium">{user.full_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.user_roles?.map((role: any, index: number) => (
                            <Badge key={index} className={getRoleConfig(role.role).color}>
                              {getRoleConfig(role.role).displayName}
                            </Badge>
                          ))}
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      {/* Create Site Modal */}
      {isCreatingSite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Add New Cafeteria Site</CardTitle>
              <CardDescription>
                Create a new Compass Group cafeteria location
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createSite} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Site Name *</Label>
                    <Input
                      id="name"
                      value={newSite.name}
                      onChange={(e) => setNewSite(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Manchester Central Cafeteria"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cafeteriaType">Cafeteria Type</Label>
                    <Select
                      value={newSite.cafeteriaType}
                      onValueChange={(value: 'staff' | 'visitor' | 'mixed') => 
                        setNewSite(prev => ({ ...prev, cafeteriaType: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Staff Only</SelectItem>
                        <SelectItem value="visitor">Visitor Only</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="city">City *</Label>
                  <UKCitySelect
                    value={newSite.city}
                    onValueChange={(value) => setNewSite(prev => ({ ...prev, city: value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newSite.address}
                    onChange={(e) => setNewSite(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Full address"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={newSite.capacity}
                      onChange={(e) => setNewSite(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                      placeholder="Number of seats"
                    />
                  </div>
                  <div>
                    <Label htmlFor="footfall">Expected Daily Footfall</Label>
                    <Input
                      id="footfall"
                      type="number"
                      value={newSite.expectedFootfall}
                      onChange={(e) => setNewSite(prev => ({ ...prev, expectedFootfall: parseInt(e.target.value) || 0 }))}
                      placeholder="Daily visitors"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="opsManager">Ops Manager *</Label>
                    <Select
                      value={newSite.opsManagerId}
                      onValueChange={(value) => setNewSite(prev => ({ ...prev, opsManagerId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Ops Manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {opsManagers.map((user) => (
                          <SelectItem key={user.user_id} value={user.user_id}>
                            {user.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="deploymentEngineer">Deployment Engineer *</Label>
                    <Select
                      value={newSite.deploymentEngineerId}
                      onValueChange={(value) => setNewSite(prev => ({ ...prev, deploymentEngineerId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Deployment Engineer" />
                      </SelectTrigger>
                      <SelectContent>
                        {deploymentEngineers.map((user) => (
                          <SelectItem key={user.user_id} value={user.user_id}>
                            {user.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newSite.description}
                    onChange={(e) => setNewSite(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Additional notes about the site"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreatingSite(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Site'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create User Modal */}
      {isCreatingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New User</CardTitle>
              <CardDescription>
                Create a new user account for the B2B application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createUser} className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value: any) => setNewUser(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ROLES).map((role) => (
                        <SelectItem key={role.key} value={role.key}>
                          {role.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="password">Initial Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Set initial password"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    User can change this password later using "Forgot Password"
                  </p>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={newUser.confirmPassword}
                    onChange={(e) => setNewUser(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm password"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreatingUser(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create User'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Admin;