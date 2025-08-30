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
  Building,
  Home,
  ChevronRight,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Database,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getRoleConfig } from '@/lib/roles';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader } from '@/components/ui/loader';

// Interfaces
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

export default function OrganizationsManagement() {
  const { currentRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');

  const roleConfig = getRoleConfig(currentRole || 'admin');

  // Only allow admin access
  if (currentRole !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access Organizations Management. Please contact an administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const { data: orgsData, error: orgsError } = await supabase
        .from('organizations')
        .select('*');
      
      if (orgsError) {
        console.error('Error loading organizations:', orgsError);
        toast.error('Failed to load organizations');
        setOrganizations([]);
      } else {
        if (orgsData && orgsData.length > 0) {
          const mappedOrgs = orgsData.map((org: any) => ({
            id: org.id,
            name: org.name,
            description: org.description || '',
            sector: org.sector || '',
            unit_code: org.unit_code || '',
            created_by: org.created_by || 'system',
            created_on: org.created_on || org.created_at || new Date().toISOString(),
            updated_at: org.updated_at || new Date().toISOString()
          }));
          setOrganizations(mappedOrgs);
        } else {
          // No organizations found, seed defaults
          await seedDefaultOrganizations();
        }
      }
    } catch (error) {
      console.error('Error loading organizations:', error);
      setError('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const seedDefaultOrganizations = async () => {
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
      },
      {
        id: 'org-bi',
        name: 'B&I',
        description: 'Business and Industry food services',
        sector: 'Business & Industry',
        unit_code: 'BI',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'org-compass-one',
        name: 'Compass One',
        description: 'Specialized food service solutions',
        sector: 'Business & Industry',
        unit_code: 'COM',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'org-minley-station',
        name: 'Minley Station',
        description: 'Defence sector food services',
        sector: 'Defence',
        unit_code: 'MIN',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'org-peabody',
        name: 'Peabody',
        description: 'Housing and community services',
        sector: 'Business & Industry',
        unit_code: 'PEA',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'org-ra',
        name: 'RA',
        description: 'Restaurant Associates - premium dining',
        sector: 'Business & Industry',
        unit_code: 'RA',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'org-sse',
        name: 'SSE',
        description: 'Energy and utilities sector',
        sector: 'Business & Industry',
        unit_code: 'SSE',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'org-jlr-whitley',
        name: 'JLR - Whitley',
        description: 'Jaguar Land Rover manufacturing',
        sector: 'Business & Industry',
        unit_code: 'JLR',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'org-baxter-health',
        name: 'Baxter Health',
        description: 'Healthcare and medical services',
        sector: 'Healthcare & Senior Living',
        unit_code: 'BXT',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'org-next',
        name: 'NEXT',
        description: 'Retail and fashion sector',
        sector: 'Business & Industry',
        unit_code: 'NEXT',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'org-porsche',
        name: 'Porsche',
        description: 'Automotive luxury brand',
        sector: 'Business & Industry',
        unit_code: 'POR',
        created_by: 'admin',
        created_on: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];

    try {
      const { error } = await supabase
        .from('organizations')
        .insert(defaults);
      
      if (error) {
        console.error('Error seeding organizations to database:', error);
        setOrganizations(defaults);
      } else {
        const { data: orgsData } = await supabase
          .from('organizations')
          .select('*');
        setOrganizations(orgsData || defaults);
      }
    } catch (error) {
      console.error('Error seeding organizations:', error);
      setOrganizations(defaults);
    }

    toast.success('Default organizations seeded successfully');
  };

  const addOrganization = () => {
    const newOrg: Organization = {
      id: 'new',
      name: '',
      description: '',
      sector: '',
      unit_code: '',
      created_by: '',
      created_on: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setEditingOrganization(newOrg);
  };

  const editOrganization = (org: Organization) => {
    setEditingOrganization(org);
  };

  const deleteOrganization = async (orgId: string) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgId);
      
      if (error) {
        toast.error('Failed to delete organization');
      } else {
        setOrganizations(prev => prev.filter(o => o.id !== orgId));
        toast.success('Organization deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast.error('Failed to delete organization');
    }
  };

  const saveOrganization = async () => {
    if (!editingOrganization) return;
    
    try {
      if (editingOrganization.id && editingOrganization.id !== 'new') {
        // Update existing organization
        const { error } = await supabase
          .from('organizations')
          .update({
            name: editingOrganization.name,
            description: editingOrganization.description,
            sector: editingOrganization.sector,
            unit_code: editingOrganization.unit_code,
            created_by: editingOrganization.created_by,
            created_on: editingOrganization.created_on,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingOrganization.id);
        
        if (error) {
          toast.error('Failed to update organization');
          return;
        }
        
        setOrganizations(prev => 
          prev.map(o => o.id === editingOrganization.id ? editingOrganization : o)
        );
      } else {
        // Add new organization
        const { data, error } = await supabase
          .from('organizations')
          .insert([{
            name: editingOrganization.name,
            description: editingOrganization.description,
            sector: editingOrganization.sector,
            unit_code: editingOrganization.unit_code,
            created_by: editingOrganization.created_by,
            created_on: editingOrganization.created_on
          }])
          .select()
          .single();
        
        if (error) {
          toast.error('Failed to create organization');
          return;
        }
        
        const newOrg: Organization = {
          id: data.id,
          name: data.name,
          description: data.description,
          sector: data.sector || '',
          unit_code: data.unit_code || '',
          created_by: data.created_by || '',
          created_on: data.created_on || '',
          updated_at: data.updated_at
        };
        
        setOrganizations(prev => [...prev, newOrg]);
      }
      
      setEditingOrganization(null);
      toast.success('Organization saved successfully');
    } catch (error) {
      console.error('Error saving organization:', error);
      toast.error('Failed to save organization');
    }
  };

  // Filter organizations based on search and sector
  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.unit_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = sectorFilter === 'all' || org.sector === sectorFilter;
    return matchesSearch && matchesSector;
  });

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader size="lg" />
            <p className="text-gray-600 mt-4">Loading organizations...</p>
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
                loadOrganizations();
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
        <span className="text-gray-900 font-medium">Organizations</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organizations Management</h1>
          <p className="text-gray-600 mt-1">
            Manage organizations, their details, and configurations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <roleConfig.icon className="h-3 w-3" />
            <span>{roleConfig.displayName}</span>
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>Organization Directory</span>
          </CardTitle>
          <CardDescription>
            Manage organizations, their details, and configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, description, or unit code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={sectorFilter} onValueChange={setSectorFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Sectors" />
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
                <Button variant="outline" onClick={seedDefaultOrganizations}>
                  <Database className="h-4 w-4 mr-2" />
                  Seed from Excel Data
                </Button>
                <Button onClick={addOrganization}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Organization
                </Button>
              </div>
            </div>

            {/* Organizations Count */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">
                Organizations ({filteredOrganizations.length})
              </h3>
            </div>

            {/* Organizations Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[25%]">Organization</TableHead>
                    <TableHead className="w-[35%]">Description</TableHead>
                    <TableHead className="w-[20%]">Sector</TableHead>
                    <TableHead className="w-[10%]">Unit Code</TableHead>
                    <TableHead className="w-[10%] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrganizations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        <Building className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">No organizations found</p>
                        <p className="text-xs">Create your first organization to get started</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrganizations.map(org => (
                      <TableRow key={org.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Building className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">{org.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{org.description}</span>
                        </TableCell>
                        <TableCell>
                          {org.sector && (
                            <Badge variant="outline">
                              {org.sector}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">{org.unit_code}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm" onClick={() => editOrganization(org)}>
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => deleteOrganization(org.id)}
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

      {/* Edit Organization Dialog */}
      {editingOrganization && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              {editingOrganization.id === 'new' ? 'Add Organization' : 'Edit Organization'}
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  value={editingOrganization.name}
                  onChange={(e) => setEditingOrganization({...editingOrganization, name: e.target.value})}
                  placeholder="Enter organization name"
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
                <Label htmlFor="orgSector">Sector</Label>
                <Select value={editingOrganization.sector} onValueChange={(value) => setEditingOrganization({...editingOrganization, sector: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sector" />
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
                <Label htmlFor="orgUnitCode">Unit Code</Label>
                <Input
                  id="orgUnitCode"
                  value={editingOrganization.unit_code}
                  onChange={(e) => setEditingOrganization({...editingOrganization, unit_code: e.target.value})}
                  placeholder="Enter unit code"
                />
              </div>
              
              <div>
                <Label htmlFor="orgCreatedBy">Created By</Label>
                <Input
                  id="orgCreatedBy"
                  value={editingOrganization.created_by}
                  onChange={(e) => setEditingOrganization({...editingOrganization, created_by: e.target.value})}
                  placeholder="Enter creator's name"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={saveOrganization} className="flex-1">Save</Button>
                <Button variant="outline" onClick={() => setEditingOrganization(null)} className="flex-1">Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
