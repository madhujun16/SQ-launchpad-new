import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Package, 
  User,
  Eye,
  Plus,
  FileText,
  Activity,
  Wrench,
  Settings,
  PlusCircle,
  FileText as FileTextIcon,
  StickyNote,
  Edit,
  CheckSquare,
  Building
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { AccessDenied } from '@/components/AccessDenied';
import { ContentLoader } from '@/components/ui/loader';
import { getRoleConfig } from '@/lib/roles';
import { useNavigate } from 'react-router-dom';
import { getStatusColor, getStatusDisplayName, type UnifiedSiteStatus } from '@/lib/siteTypes';
import { GlobalSiteNotesModal } from '@/components/GlobalSiteNotesModal';
import { SitesService, type Site } from '@/services/sitesService';

const Sites = () => {
  const navigate = useNavigate();
  const { currentRole, loading: authLoading } = useAuth();
  const { getTabAccess } = useRoleAccess();
  const [sites, setSites] = useState<Site[]>([]);
  const [filteredSites, setFilteredSites] = useState<Site[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);

  // Check access permissions
  const tabAccess = getTabAccess('/sites');
  if (!tabAccess.canAccess) {
    return <AccessDenied />;
  }

  // Fetch sites from database
  useEffect(() => {
    const fetchSites = async () => {
      try {
        setLoading(true);
        const sitesData = await SitesService.getAllSites();
        console.log('Fetched sites from database:', sitesData);
        setSites(sitesData);
        setFilteredSites(sitesData);
      } catch (error) {
        console.error('Error fetching sites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, []);

  // Filter sites based on search term and status
  useEffect(() => {
    let filtered = sites;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(site =>
        site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.organization_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(site => site.status === statusFilter);
    }

    setFilteredSites(filtered);
  }, [sites, searchTerm, statusFilter]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  // Handle site actions
  const handleViewSite = (site: Site) => {
    navigate(`/sites/${site.id}`);
  };

  const handleEditSite = (site: Site) => {
    navigate(`/sites/${site.id}/edit`);
  };

  const handleSiteNotes = (site: Site) => {
    setSelectedSite(site);
    setShowNotesModal(true);
  };

  // Get unique statuses for filter dropdown
  const uniqueStatuses = Array.from(new Set(sites.map(site => site.status))).sort();

  // Map database statuses to display names and colors
  const getStatusDisplayNameFromDB = (status: string) => {
    const statusMap: Record<string, { name: string; color: string }> = {
      'site_creation': { 
        name: 'Site Creation', 
        color: 'bg-blue-100 text-blue-800 border-blue-200' 
      },
      'site_study': { 
        name: 'Site Study', 
        color: 'bg-purple-100 text-purple-800 border-purple-200' 
      },
      'software_scoping': { 
        name: 'Software Scoping', 
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200' 
      },
      'hardware_scoping': { 
        name: 'Hardware Scoping', 
        color: 'bg-orange-100 text-orange-800 border-orange-200' 
      },
      'approval': { 
        name: 'Approval', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200' 
      },
      'procurement': { 
        name: 'Procurement', 
        color: 'bg-pink-100 text-pink-800 border-pink-200' 
      },
      'deployment': { 
        name: 'Deployment', 
        color: 'bg-cyan-100 text-cyan-800 border-cyan-200' 
      },
      'go_live': { 
        name: 'Go-Live', 
        color: 'bg-green-100 text-green-800 border-green-200' 
      },
      'live': { 
        name: 'Live', 
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200' 
      },
      'created': { 
        name: 'Site Creation', 
        color: 'bg-blue-100 text-blue-800 border-blue-200' 
      },
      'configuration_in_progress': { 
        name: 'Software Scoping', 
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200' 
      },
      'on_hold': { 
        name: 'Site Creation', 
        color: 'bg-blue-100 text-blue-800 border-blue-200' 
      }
    };
    return statusMap[status] || { name: status, color: 'bg-gray-100 text-gray-800 border-gray-200' };
  };

  if (loading) {
    return <ContentLoader />;
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Sites</h1>
        <p className="text-gray-600">Manage client sites and track deployment progress</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by site name, organization, or location..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {uniqueStatuses.map(status => (
                <SelectItem key={status} value={status}>
                  {getStatusDisplayNameFromDB(status).name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Sites Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Sites Overview</CardTitle>
          <CardDescription>
            Manage and track all client sites in the deployment pipeline.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              {filteredSites.map((site) => (
                <TableRow key={site.id}>
                  <TableCell className="font-medium">
                    {site.name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none" className="h-4 w-4 text-gray-600">
                        <g fill="currentColor">
                          <path fillRule="evenodd" d="M1 3.25A2.25 2.25 0 013.25 1h6.5A2.25 2.25 0 0112 3.25v2.112l2.05 1.453A2.25 2.25 0 0115 8.65v5.1c0 .69-.56 1.25-1.25 1.25h-2.5a.748.748 0 01-.75-.751v-11a.75.75 0 00-.75-.75h-6.5a.75.75 0 00-.75.75v11a.75.75 0 01-1.5 0v-11zM12 13.5V7.2l1.184.839a.75.75 0 01.316.612v4.85H12z" clipRule="evenodd"/>
                          <path d="M4.75 10.55a.7.7 0 00-.7.7v3a.7.7 0 101.4 0v-2.3h2.1v2.3a.7.7 0 101.4 0v-3a.7.7 0 00-.7-.7h-3.5zM4.25 4.75A.75.75 0 015 4h.25a.75.75 0 010 1.5H5a.75.75 0 01-.75-.75zM7.75 4a.75.75 0 000 1.5H8A.75.75 0 008 4h-.25zM4.25 6.75A.75.75 0 015 6h.25a.75.75 0 010 1.5H5a.75.75 0 01-.75-.75zM7.75 6a.75.75 0 000 1.5H8A.75.75 0 008 6h-.25zM4.25 8.75A.75.75 0 015 8h.25a.75.75 0 010 1.5H5a.75.75 0 01-.75-.75zM7.75 8a.75.75 0 000 1.5H8A.75.75 0 008 8h-.25z"/>
                        </g>
                      </svg>
                      <span>{site.organization_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`${getStatusDisplayNameFromDB(site.status).color}`}
                    >
                      {getStatusDisplayNameFromDB(site.status).name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {site.target_live_date ? new Date(site.target_live_date).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3 text-gray-400" />
                        <span>{site.assigned_ops_manager || 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Wrench className="h-3 w-3 text-gray-400" />
                        <span>{site.assigned_deployment_engineer || 'Unassigned'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewSite(site)}
                        title="View Site"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSiteNotes(site)}
                        title="Site Notes"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      {site.status !== 'go_live' && site.status !== 'live' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSite(site)}
                          title="Edit Site"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Global Site Notes Modal */}
      {selectedSite && (
        <GlobalSiteNotesModal
          isOpen={showNotesModal}
          onClose={() => {
            setShowNotesModal(false);
            setSelectedSite(null);
          }}
          siteId={selectedSite.id}
          siteName={selectedSite.name}
        />
      )}
    </div>
  );
};

export default Sites;
