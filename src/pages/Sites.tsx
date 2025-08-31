import React, { useState, useEffect, useMemo } from 'react';
// TODO: Backend needs to provide proper data for:
// - suggested_go_live (from site study step) - currently showing in Target Go-Live column
// - target_live_date (original target date) - removed from display
// - status (user-friendly names from backend) - currently using getStatusDisplayName

// Organization Logo Component with Error Handling
const OrganizationLogo: React.FC<{ src?: string | null; alt: string }> = ({ src, alt }) => {
  const [imageError, setImageError] = useState(false);

  // Check if src is valid - if it's null, undefined, empty, or looks like a malformed URL
  const isValidUrl = src && 
    src.trim() !== '' && 
    !src.includes('FFFFFF?text=') && 
    !src.includes('placeholder.com') &&
    (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:'));

  // If src is invalid or there was a previous error, show fallback
  if (!isValidUrl || imageError) {
    return (
      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
        <Building className="h-4 w-4 text-gray-500" />
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt}
      className="h-8 w-8 rounded-full object-cover"
      onError={() => setImageError(true)}
    />
  );
};
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
  Archive,
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const Sites = () => {
  const navigate = useNavigate();
  const { currentRole } = useAuth();
  
  // State
  const [sites, setSites] = useState<Site[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [archiveReason, setArchiveReason] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  // Fetch sites from backend only
  useEffect(() => {
    const fetchSites = async () => {
      try {
        setLoading(true);
        // Clear cache to force fresh data fetch
        SitesService.clearCache();
        const sitesData = await SitesService.getAllSites();
        setSites(sitesData);
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

  // Filter and paginate sites
  const { filteredSites, totalPages, currentSites } = useMemo(() => {
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

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentSites = filtered.slice(startIndex, endIndex);

    return { filteredSites: filtered, totalPages, currentSites };
  }, [sites, searchTerm, statusFilter, currentPage, itemsPerPage]);

  // Action handlers
  const handleViewSite = (site: Site) => {
    navigate(`/sites/${site.id}?mode=view`);
  };

  const handleEditSite = (site: Site) => {
    navigate(`/sites/${site.id}?mode=edit`);
  };

  const handleDeleteSite = (site: Site) => {
    setSelectedSite(site);
    setDeleteReason('');
    setDeleteModalOpen(true);
  };

  const handleArchiveSite = (site: Site) => {
    setSelectedSite(site);
    setArchiveReason('');
    setArchiveModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedSite || !deleteReason) return;
    
    try {
      // Archive the site instead of hard deleting
      await SitesService.archiveSite(selectedSite.id, deleteReason);
      toast.success('Site archived successfully');
      
      // Refresh sites
      const updatedSites = sites.filter(s => s.id !== selectedSite.id);
      setSites(updatedSites);
      setDeleteModalOpen(false);
      setSelectedSite(null);
      setDeleteReason('');
    } catch (error) {
      console.error('Error archiving site:', error);
      toast.error('Failed to archive site');
    }
  };

  const confirmArchive = async () => {
    if (!selectedSite || !archiveReason) return;
    
    try {
      // Archive the site using the new archiving method
      await SitesService.archiveSite(selectedSite.id, archiveReason);
      toast.success('Site archived successfully');
      
      // Refresh sites
      const updatedSites = sites.filter(s => s.id !== selectedSite.id);
      setSites(updatedSites);
      setArchiveModalOpen(false);
      setSelectedSite(null);
      setArchiveReason('');
    } catch (error) {
      console.error('Error archiving site:', error);
      toast.error('Failed to archive site');
    }
  };

  const handleCreateSite = () => {
    navigate('/sites/create');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Get action buttons based on site status
  // Archive/Delete is only allowed for: Created, In Progress, Planning, and Live sites
  // Deployed sites can only be edited (no archive/delete)
  // All other statuses can only be edited and viewed (no archive/delete)
  const getActionButtons = (site: Site) => {
    const isLive = site.status === 'live';
    const isDeployed = site.status === 'deployed';
    const isCreated = site.status === 'Created';
    const isInProgress = site.status === 'In Progress' || site.status === 'Planning';
    
    if (isLive) {
      // Live sites: View + Archive (2 buttons)
      return (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewSite(site)}
            className="h-8 w-8 p-0 hover:bg-blue-50"
            title="View Site"
          >
            <Eye className="h-4 w-4 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleArchiveSite(site)}
            className="h-8 w-8 p-0 hover:bg-orange-50"
            title="Archive Site"
          >
            <Archive className="h-4 w-4 text-orange-600" />
          </Button>
        </>
      );
    } else if (isDeployed) {
      // Deployed sites: Edit only (1 button)
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleEditSite(site)}
          className="h-8 w-8 p-0 hover:bg-green-50"
          title="Edit Site"
        >
          <Edit className="h-4 w-4 text-green-600" />
        </Button>
      );
    } else if (isCreated || isInProgress) {
      // Created or In Progress sites: Edit + Archive (2 buttons)
      return (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditSite(site)}
            className="h-8 w-8 p-0 hover:bg-green-50"
            title="Edit Site"
          >
            <Edit className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteSite(site)}
            className="h-8 w-8 p-0 hover:bg-red-50"
            title="Archive Site"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </>
      );
    } else {
      // All other statuses: Edit + View (2 buttons) - no delete/archive
      return (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditSite(site)}
            className="h-8 w-8 p-0 hover:bg-green-50"
            title="Edit Site"
          >
            <Edit className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewSite(site)}
            className="h-8 w-8 p-0 hover:bg-blue-50"
            title="View Site"
          >
            <Eye className="h-4 w-4 text-blue-600" />
          </Button>
        </>
      );
    }
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
            {/* Header with Create Site Button */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sites</h1>
          <p className="text-gray-600">
            Manage client sites and track deployment progress.
          </p>
        </div>
        <Button 
          onClick={handleCreateSite} 
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg text-lg"
        >
          <Plus className="h-5 w-5 mr-3" />
          Create Site
        </Button>
      </div>

      {/* Search and Filters - All in One Line (Desktop) */}
      <div className="mb-4">
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
          {/* Search Bar */}
          <div className="flex-1 lg:flex-none lg:w-80">
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
          
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
                              <SelectItem value="site_created">Created</SelectItem>
              <SelectItem value="site_study_done">Site Study Done</SelectItem>
              <SelectItem value="scoping_done">Scoping Done</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="procurement_done">Procurement Done</SelectItem>
              <SelectItem value="deployed">Deployed</SelectItem>
              <SelectItem value="live">Live</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Clear Filters Button */}
          <Button variant="outline" onClick={clearFilters} className="w-full lg:w-auto">
            Clear Filters
          </Button>
            </div>
      </div>



      {/* Sites Table */}
        <Card className="shadow-sm mt-2">
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
                  {currentSites.length === 0 ? (
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
                    currentSites.map((site) => (
                      <TableRow key={site.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-3">
                            {site.organization_logo ? (
                              <OrganizationLogo 
                                src={site.organization_logo} 
                                alt={`${site.organization_name} logo`}
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <Building className="h-4 w-4 text-gray-500" />
                              </div>
                            )}
                            <span>{site.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{site.organization_name || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(site.status)}>
                            {getStatusDisplayName(site.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{site.suggested_go_live || site.target_live_date || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{site.assigned_ops_manager || 'Unassigned'}</div>
                            <div className="text-gray-500">{site.assigned_deployment_engineer || 'Unassigned'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getActionButtons(site)}
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
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredSites.length)} of {filteredSites.length} sites
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

      {/* Archive Site Modal (Delete Button) */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Please specify the reason for archiving this site</DialogTitle>
            <DialogDescription>
              Select the primary reason for archiving "{selectedSite?.name}". This action will be logged for audit purposes.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup value={deleteReason} onValueChange={setDeleteReason}>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="created_by_mistake" id="reason1" />
                  <Label htmlFor="reason1">Created by mistake (erroneous site creation)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lost_contract" id="reason2" />
                  <Label htmlFor="reason2">Lost contract or business cancellation</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="duplicate_record" id="reason3" />
                  <Label htmlFor="reason3">Duplicate site record in the system</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="data_cleanup" id="reason4" />
                  <Label htmlFor="reason4">Data cleanup (removal of outdated, incomplete, or incorrect information)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="regulatory_mandate" id="reason5" />
                  <Label htmlFor="reason5">Regulatory or legal mandate for data deletion (e.g., right to erasure)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="reason6" />
                  <Label htmlFor="reason6">Other</Label>
                </div>
                </div>
              </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={!deleteReason}
            >
              Archive Site
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Site Modal */}
      <Dialog open={archiveModalOpen} onOpenChange={setArchiveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Please specify the reason for archiving this site</DialogTitle>
            <DialogDescription>
              Select the primary reason for archiving "{selectedSite?.name}". This information will be logged for audit purposes.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup value={archiveReason} onValueChange={setArchiveReason}>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="site_closed" id="archive1" />
                  <Label htmlFor="archive1">Site getting closed (e.g., permanent shutdown)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lost_contract" id="archive2" />
                  <Label htmlFor="archive2">Lost contract or business (e.g., client contract ended)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="business_restructuring" id="archive3" />
                  <Label htmlFor="archive3">Business restructuring (merger, acquisition, organisational changes)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="site_replaced" id="archive4" />
                  <Label htmlFor="archive4">Site replaced or consolidated with another location</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="regulatory_compliance" id="archive5" />
                  <Label htmlFor="archive5">Regulatory/compliance requirement (e.g., legal hold, audit requirement)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="temporary_pause" id="archive6" />
                  <Label htmlFor="archive6">Temporary operational pause (e.g., seasonal or strategic pause)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="archive7" />
                  <Label htmlFor="archive7">Other</Label>
                </div>
                </div>
              </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchiveModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmArchive}
              disabled={!archiveReason}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Archive Site
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sites; 
