import React, { useState, useEffect } from 'react';
// Button Style Guide for Create Site buttons across the app:
// className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm"
// Text format: "+ Create [Item]" (with plus icon)
// Mobile: w-full sm:w-auto for responsive width
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Building, 
  Eye,
  Edit,
  Trash2,
  Plus,
  Clock,
  CheckCircle,
  Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { SitesService, type Site } from '@/services/sitesService';
import { toast } from 'sonner';
import { PageLoader } from '@/components/ui/loader';
import { getStatusColor, getStatusDisplayName } from '@/lib/siteTypes';

const Sites = () => {
  const navigate = useNavigate();
  const { currentRole } = useAuth();
  
  // State
  const [sites, setSites] = useState<Site[]>([]);
  const [filteredSites, setFilteredSites] = useState<Site[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch sites
  useEffect(() => {
    const fetchSites = async () => {
      try {
        setLoading(true);
        const sitesData = await SitesService.getAllSites();
        
        // If no sites from backend, use mock data for now
        if (!sitesData || sitesData.length === 0) {
          console.log('No sites from backend, using mock data');
          const mockSites = [
            {
              id: '1',
              name: '250 ER Restaurant',
              organization_name: 'Peabody',
              location: 'London',
              status: 'deployed',
              target_live_date: '9/1/2025',
              assigned_ops_manager: 'Peabody Team',
              assigned_deployment_engineer: 'Deployment Team',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '2',
              name: 'Baxter Health Restaurant',
              organization_name: 'Baxter Health',
              location: 'Manchester',
              status: 'site_created',
              target_live_date: '5/5/2025',
              assigned_ops_manager: 'Baxter Health Team',
              assigned_deployment_engineer: 'Deployment Team',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '3',
              name: 'BP Pulse Arena',
              organization_name: 'The NEC',
              location: 'Birmingham',
              status: 'live',
              target_live_date: '8/20/2025',
              assigned_ops_manager: 'Levy Team',
              assigned_deployment_engineer: 'Deployment Team',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ];
          setSites(mockSites);
          setFilteredSites(mockSites);
        } else {
          setSites(sitesData);
          setFilteredSites(sitesData);
        }
      } catch (error) {
        console.error('Error fetching sites:', error);
        setError('Failed to load sites');
        toast.error('Failed to load sites');
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, []);

  // Filter sites
  useEffect(() => {
    let filtered = sites;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(site =>
        site.name.toLowerCase().includes(searchLower) ||
        site.organization_name?.toLowerCase().includes(searchLower) ||
        site.location?.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(site => site.status === statusFilter);
    }

    setFilteredSites(filtered);
  }, [sites, searchTerm, statusFilter]);

  // Action handlers
  const handleViewSite = (site: Site) => {
    navigate(`/sites/${site.id}?mode=view`);
  };

  const handleEditSite = (site: Site) => {
    navigate(`/sites/${site.id}?mode=edit`);
  };

  const handleDeleteSite = async (site: Site) => {
    if (window.confirm(`Are you sure you want to delete "${site.name}"?`)) {
      try {
        await SitesService.deleteSite(site.id);
        toast.success('Site deleted successfully');
        // Refresh sites
        const updatedSites = sites.filter(s => s.id !== site.id);
        setSites(updatedSites);
      } catch (error) {
        console.error('Error deleting site:', error);
        toast.error('Failed to delete site');
      }
    }
  };

  const handleCreateSite = () => {
    navigate('/sites/create');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  // Loading state
  if (loading) {
    return <PageLoader />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Sites</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sites</h1>
          <p className="text-gray-600">
            Manage client sites and track deployment progress.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          {/* Search Bar */}
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by site name, organization, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>
          
          {/* Filters and Create Button Row */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="site_created">Site Created</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="deployed">Deployed</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
                Clear Filters
              </Button>
            </div>
            <Button onClick={handleCreateSite} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              + Create Site
            </Button>
          </div>
        </div>

        {/* Sites Overview */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sites Overview</h2>
          <p className="text-gray-600 mb-4">
            Manage and track all client sites in the deployment pipeline.
          </p>
        </div>

        {/* Sites Table */}
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site Name</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Target Go-Live</TableHead>
                    <TableHead>Assigned Team</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSites.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">
                          {searchTerm || statusFilter !== 'all' 
                            ? 'No sites match your current filters' 
                            : 'No sites found'}
                        </p>
                        {(searchTerm || statusFilter !== 'all') && (
                          <Button variant="outline" onClick={clearFilters} className="mt-2">
                            Clear Filters
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSites.map((site) => (
                      <TableRow key={site.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <Building className="h-4 w-4 text-gray-500" />
                            <span>{site.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{site.organization_name || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(site.status)}>
                            {getStatusDisplayName(site.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{site.target_live_date || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{site.assigned_ops_manager || 'Unassigned'}</div>
                            <div className="text-gray-500">{site.assigned_deployment_engineer || 'Unassigned'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewSite(site)}
                              className="h-8 w-8 p-0 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSite(site)}
                              className="h-8 w-8 p-0 hover:bg-green-50"
                            >
                              <Edit className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSite(site)}
                              className="h-8 w-8 p-0 hover:bg-red-50"
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

        {/* Summary */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {filteredSites.length} of {sites.length} sites
        </div>
      </div>
    </div>
  );
};

export default Sites; 
