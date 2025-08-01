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
import { Building, MapPin, Users, Calendar, Plus, Edit, Trash2, UserPlus, Save, X } from 'lucide-react';
import { getStatusColor, getStatusDisplayName } from '@/lib/siteTypes';

interface SiteData {
  id: string;
  name: string;
  food_court_unit: string;
  address: string;
  postcode: string;
  cafeteria_type: 'staff' | 'visitor' | 'mixed';
  capacity: number;
  expected_footfall: number;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  sector_name: string;
  city_name: string;
  ops_manager_name: string;
  deployment_engineer_name: string;
  study_status: string;
  cost_approval_status: string;
  inventory_status: string;
  products_status: string;
  deployment_status: string;
  overall_status: 'new' | 'in-progress' | 'active' | 'deployed';
}

const Admin = () => {
  const { currentRole, profile, createUserAsAdmin } = useAuth();
  const navigate = useNavigate();
  const [sites, setSites] = useState<SiteData[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isCreatingSite, setIsCreatingSite] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isEditingSite, setIsEditingSite] = useState(false);
  const [editingSite, setEditingSite] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state for new site
  const [newSite, setNewSite] = useState({
    name: '',
    food_court_unit: '',
    city: '',
    address: '',
    postcode: '',
    cafeteriaType: 'staff' as 'staff' | 'visitor' | 'mixed',
    capacity: 0,
    expectedFootfall: 0,
    description: '',
    opsManagerId: '',
    deploymentEngineerId: ''
  });

  // Form state for new user
  const [newUser, setNewUser] = useState({
    email: '',
    role: 'deployment_engineer' as const,
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
    if (hasPermission(currentRole || 'admin', 'manage_users')) {
      fetchSites();
      fetchUsers();
    }
  }, [currentRole]);

  const fetchSites = async () => {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select(`
          *,
          sectors(name),
          cities(name),
          site_assignments(
            ops_manager_id,
            deployment_engineer_id,
            profiles!site_assignments_ops_manager_id_fkey(full_name),
            profiles!site_assignments_deployment_engineer_id_fkey(full_name)
          ),
          site_status_tracking(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sites:', error);
        toast.error('Failed to fetch sites');
        return;
      }

      const formattedSites: SiteData[] = (data || []).map((site: any) => ({
        id: site.id,
        name: site.name,
        food_court_unit: site.food_court_unit,
        address: site.address || '',
        postcode: site.postcode || '',
        cafeteria_type: site.cafeteria_type || 'mixed',
        capacity: site.capacity || 0,
        expected_footfall: site.expected_footfall || 0,
        description: site.description || '',
        status: site.status,
        created_at: site.created_at,
        updated_at: site.updated_at,
        created_by: site.created_by,
        sector_name: site.sectors?.name || '',
        city_name: site.cities?.name || '',
        ops_manager_name: site.site_assignments?.[0]?.profiles?.full_name || '',
        deployment_engineer_name: site.site_assignments?.[0]?.profiles?.full_name || '',
        study_status: site.site_status_tracking?.[0]?.study_status || 'pending',
        cost_approval_status: site.site_status_tracking?.[0]?.cost_approval_status || 'pending',
        inventory_status: site.site_status_tracking?.[0]?.inventory_status || 'pending',
        products_status: site.site_status_tracking?.[0]?.products_status || 'pending',
        deployment_status: site.site_status_tracking?.[0]?.deployment_status || 'pending',
        overall_status: site.site_status_tracking?.[0]?.overall_status || 'new'
      }));

      setSites(formattedSites);
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
    if (!newSite.name || !newSite.food_court_unit || !newSite.city || !newSite.address || !newSite.postcode) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!newSite.opsManagerId || !newSite.deploymentEngineerId) {
      toast.error('Please assign both Ops Manager and Deployment Engineer');
      return;
    }

    setLoading(true);
    try {
      // First, get or create city
      let cityId;
      const { data: existingCity } = await supabase
        .from('cities')
        .select('id')
        .eq('name', newSite.city)
        .single();

      if (existingCity) {
        cityId = existingCity.id;
      } else {
        const { data: newCity, error: cityError } = await supabase
          .from('cities')
          .insert({ name: newSite.city, region: 'UK' })
          .select('id')
          .single();

        if (cityError) throw cityError;
        cityId = newCity.id;
      }

      // Create site
      const { data: newSiteData, error: siteError } = await supabase
        .from('sites')
        .insert({
          name: newSite.name,
          food_court_unit: newSite.food_court_unit,
          city_id: cityId,
          address: newSite.address,
          postcode: newSite.postcode,
          cafeteria_type: newSite.cafeteriaType,
          capacity: newSite.capacity,
          expected_footfall: newSite.expectedFootfall,
          description: newSite.description,
          created_by: profile?.user_id
        })
        .select('id')
        .single();

      if (siteError) throw siteError;

      // Create site assignment
      const { error: assignmentError } = await supabase
        .from('site_assignments')
        .insert({
          site_id: newSiteData.id,
          ops_manager_id: newSite.opsManagerId,
          deployment_engineer_id: newSite.deploymentEngineerId,
          assigned_by: profile?.user_id
        });

      if (assignmentError) throw assignmentError;

      // Create site status tracking
      const { error: statusError } = await supabase
        .from('site_status_tracking')
        .insert({
          site_id: newSiteData.id,
          updated_by: profile?.user_id
        });

      if (statusError) throw statusError;

      toast.success('Site created successfully!');
      setIsCreatingSite(false);
      setNewSite({
        name: '',
        food_court_unit: '',
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
      fetchSites();
    } catch (error) {
      console.error('Error creating site:', error);
      toast.error('Failed to create site');
    }
    setLoading(false);
  };

  const updateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSite) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('sites')
        .update({
          name: editingSite.name,
          food_court_unit: editingSite.food_court_unit,
          address: editingSite.address,
          postcode: editingSite.postcode,
          cafeteria_type: editingSite.cafeteria_type,
          capacity: editingSite.capacity,
          expected_footfall: editingSite.expected_footfall,
          description: editingSite.description
        })
        .eq('id', editingSite.id);

      if (error) throw error;

      toast.success('Site updated successfully!');
      setIsEditingSite(false);
      setEditingSite(null);
      fetchSites();
    } catch (error) {
      console.error('Error updating site:', error);
      toast.error('Failed to update site');
    }
    setLoading(false);
  };

  const deleteSite = async (siteId: string) => {
    if (!confirm('Are you sure you want to delete this site? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('sites')
        .delete()
        .eq('id', siteId);

      if (error) throw error;

      toast.success('Site deleted successfully!');
      fetchSites();
    } catch (error) {
      console.error('Error deleting site:', error);
      toast.error('Failed to delete site');
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.email || !newUser.fullName) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await createUserAsAdmin(newUser.email, '', newUser.role);
      
      if (error) {
        toast.error(`Failed to create user: ${error.message}`);
      } else {
        toast.success('User created successfully! They can now sign in using OTP.');
        setIsCreatingUser(false);
        setNewUser({
          email: '',
          role: 'deployment_engineer',
          fullName: ''
        });
        fetchUsers();
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

  const handleEditSite = (site: SiteData) => {
    setEditingSite(site);
    setIsEditingSite(true);
  };

  if (!hasPermission(currentRole || 'admin', 'manage_users')) {
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
                  Total Cafeterias: {sites.length} | Active: {sites.filter(s => s.overall_status === 'deployed').length} | In Progress: {sites.filter(s => s.overall_status === 'in-progress').length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Site Name</TableHead>
                      <TableHead>Food Court Unit</TableHead>
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
                        <TableCell>{site.food_court_unit}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{site.city_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(site.overall_status)}>
                            {getStatusDisplayName(site.overall_status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {site.cafeteria_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{site.capacity} seats</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditSite(site)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deleteSite(site.id)}
                            >
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
      </div>

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
                    <Label htmlFor="food_court_unit">Food Court Unit *</Label>
                    <Input
                      id="food_court_unit"
                      value={newSite.food_court_unit}
                      onChange={(e) => setNewSite(prev => ({ ...prev, food_court_unit: e.target.value }))}
                      placeholder="e.g., FC001"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
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
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <UKCitySelect
                      value={newSite.city}
                      onValueChange={(value) => setNewSite(prev => ({ ...prev, city: value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={newSite.address}
                    onChange={(e) => setNewSite(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Full address"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postcode">Postcode *</Label>
                    <Input
                      id="postcode"
                      value={newSite.postcode}
                      onChange={(e) => setNewSite(prev => ({ ...prev, postcode: e.target.value }))}
                      placeholder="e.g., M1 1AA"
                    />
                  </div>
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
                </div>

                <div className="grid md:grid-cols-2 gap-4">
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
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newSite.description}
                      onChange={(e) => setNewSite(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Additional notes about the site"
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

      {/* Edit Site Modal */}
      {isEditingSite && editingSite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Edit Cafeteria Site</CardTitle>
              <CardDescription>
                Update site information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={updateSite} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_name">Site Name *</Label>
                    <Input
                      id="edit_name"
                      value={editingSite.name}
                      onChange={(e) => setEditingSite(prev => prev ? { ...prev, name: e.target.value } : null)}
                      placeholder="e.g., Manchester Central Cafeteria"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_food_court_unit">Food Court Unit *</Label>
                    <Input
                      id="edit_food_court_unit"
                      value={editingSite.food_court_unit}
                      onChange={(e) => setEditingSite(prev => prev ? { ...prev, food_court_unit: e.target.value } : null)}
                      placeholder="e.g., FC001"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_cafeteria_type">Cafeteria Type</Label>
                    <Select
                      value={editingSite.cafeteria_type}
                      onValueChange={(value: 'staff' | 'visitor' | 'mixed') => 
                        setEditingSite(prev => prev ? { ...prev, cafeteria_type: value } : null)
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
                  <div>
                    <Label htmlFor="edit_capacity">Capacity</Label>
                    <Input
                      id="edit_capacity"
                      type="number"
                      value={editingSite.capacity}
                      onChange={(e) => setEditingSite(prev => prev ? { ...prev, capacity: parseInt(e.target.value) || 0 } : null)}
                      placeholder="Number of seats"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit_address">Address *</Label>
                  <Input
                    id="edit_address"
                    value={editingSite.address}
                    onChange={(e) => setEditingSite(prev => prev ? { ...prev, address: e.target.value } : null)}
                    placeholder="Full address"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_postcode">Postcode *</Label>
                    <Input
                      id="edit_postcode"
                      value={editingSite.postcode}
                      onChange={(e) => setEditingSite(prev => prev ? { ...prev, postcode: e.target.value } : null)}
                      placeholder="e.g., M1 1AA"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_expected_footfall">Expected Daily Footfall</Label>
                    <Input
                      id="edit_expected_footfall"
                      type="number"
                      value={editingSite.expected_footfall}
                      onChange={(e) => setEditingSite(prev => prev ? { ...prev, expected_footfall: parseInt(e.target.value) || 0 } : null)}
                      placeholder="Daily visitors"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit_description">Description</Label>
                  <Input
                    id="edit_description"
                    value={editingSite.description}
                    onChange={(e) => setEditingSite(prev => prev ? { ...prev, description: e.target.value } : null)}
                    placeholder="Additional notes about the site"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setIsEditingSite(false);
                    setEditingSite(null);
                  }}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
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
                Create a new user account for the B2B application. Users will authenticate via OTP.
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