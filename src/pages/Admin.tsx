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
import { toast } from 'sonner';
import Header from '@/components/Header';
import UserManagement from '@/components/UserManagement';
import RoleIndicator from '@/components/RoleIndicator';
import { getRoleConfig, hasPermission } from '@/lib/roles';
import { useNavigate } from 'react-router-dom';
import { Building, MapPin, Users, Calendar, Plus, Edit, Trash2 } from 'lucide-react';
import { Site, getStatusColor, getStatusDisplayName } from '@/lib/siteTypes';

const Admin = () => {
  const { currentRole, profile } = useAuth();
  const navigate = useNavigate();
  const [sites, setSites] = useState<Site[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isCreatingSite, setIsCreatingSite] = useState(false);
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
            study: 'completed',
            costApproval: 'in-progress',
            inventory: 'pending',
            products: 'pending',
            deployment: 'pending'
          },
          overallStatus: 'in-progress',
          assignment: {
            opsManagerId: 'user3',
            deploymentEngineerId: 'user4',
            assignedAt: '2024-02-01',
            assignedBy: 'admin1'
          },
          createdAt: '2024-02-01',
          updatedAt: '2024-07-29',
          createdBy: 'admin1',
          clientName: 'Compass Group',
          cafeteriaType: 'staff',
          capacity: 80,
          expectedFootfall: 120
        }
      ];
      setSites(mockSites);
    } catch (error) {
      toast.error('Failed to fetch sites');
    }
  };

  const fetchUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to fetch users');
        return;
      }

      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        toast.error('Failed to fetch user roles');
        return;
      }

      const usersWithRoles = profiles?.map(profile => ({
        ...profile,
        roles: userRoles?.filter(role => role.user_id === profile.user_id).map(r => r.role) || []
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      toast.error('An error occurred while fetching users');
    }
  };

  const createSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSite.name || !newSite.city || !newSite.opsManagerId || !newSite.deploymentEngineerId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // This would be replaced with actual Supabase insert
      const site: Site = {
        id: crypto.randomUUID(),
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
          assignedBy: profile?.user_id || ''
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: profile?.user_id || '',
        clientName: 'Compass Group',
        cafeteriaType: newSite.cafeteriaType,
        capacity: newSite.capacity,
        expectedFootfall: newSite.expectedFootfall,
        description: newSite.description
      };

      setSites(prev => [site, ...prev]);
      toast.success('Site created successfully');
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
      toast.error('Failed to create site');
    }
    setLoading(false);
  };

  // If user doesn't have admin permissions, show access denied
  if (currentRole && !hasPermission(currentRole, 'manage_users')) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
            <p className="text-muted-foreground">
              You do not have permission to access the Admin panel.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const roleConfig = currentRole ? getRoleConfig(currentRole) : null;
  const opsManagers = users.filter(user => user.roles.includes('ops_manager'));
  const deploymentEngineers = users.filter(user => user.roles.includes('deployment_engineer'));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="py-8">
        <div className="container mx-auto px-6">
          <div className="mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-3xl font-bold text-foreground">Site Management</h2>
                  <RoleIndicator />
                </div>
                <p className="text-muted-foreground">
                  {roleConfig?.description || 'Manage Compass Group cafeteria sites and team assignments'}
                </p>
              </div>
              <Button onClick={() => setIsCreatingSite(true)} className="bg-primary hover:bg-primary-dark">
                <Plus className="mr-2 h-4 w-4" />
                Add New Site
              </Button>
            </div>
          </div>

          {/* Sites Overview */}
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  Compass Group Cafeterias
                </CardTitle>
                <CardDescription>
                  Manage all cafeteria locations and their deployment status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Site Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sites.map((site) => (
                      <TableRow key={site.id}>
                        <TableCell className="font-medium">{site.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {site.location.city}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(site.overallStatus)}>
                            {getStatusDisplayName(site.overallStatus)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Ops: {users.find(u => u.user_id === site.assignment.opsManagerId)?.full_name || 'Unassigned'}</div>
                            <div>Engineer: {users.find(u => u.user_id === site.assignment.deploymentEngineerId)?.full_name || 'Unassigned'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {site.cafeteriaType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* User Management */}
            <UserManagement />
          </div>
        </div>
      </section>

      {/* Create New Site Modal */}
      {isCreatingSite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Add New Cafeteria Site</CardTitle>
              <CardDescription>Create a new Compass Group cafeteria location</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createSite} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="siteName">Site Name *</Label>
                    <Input
                      id="siteName"
                      value={newSite.name}
                      onChange={(e) => setNewSite(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Manchester Central Cafeteria"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cafeteriaType">Cafeteria Type</Label>
                    <Select
                      value={newSite.cafeteriaType}
                      onValueChange={(value) => setNewSite(prev => ({ ...prev, cafeteriaType: value as any }))}
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

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <UKCitySelect
                      value={newSite.city}
                      onValueChange={(value) => setNewSite(prev => ({ ...prev, city: value }))}
                      placeholder="Select a UK city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postcode">Postcode</Label>
                    <Input
                      id="postcode"
                      value={newSite.postcode}
                      onChange={(e) => setNewSite(prev => ({ ...prev, postcode: e.target.value }))}
                      placeholder="e.g., M1 1AA"
                    />
                  </div>
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
    </div>
  );
};

export default Admin;