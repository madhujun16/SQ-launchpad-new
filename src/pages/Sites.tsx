import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Building,
  Trash2,
  Archive
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { AccessDenied } from '@/components/AccessDenied';
import { Loader } from '@/components/ui/loader';
import { getRoleConfig } from '@/lib/roles';
import { useNavigate } from 'react-router-dom';
import { getStatusColor, getStatusDisplayName, type UnifiedSiteStatus } from '@/lib/siteTypes';
import { GlobalSiteNotesModal } from '@/components/GlobalSiteNotesModal';
import { SitesService, type Site } from '@/services/sitesService';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Memoized Site Row Component for better performance
const SiteRow = React.memo(({ 
  site, 
  onView, 
  onEdit, 
  onNotes, 
  onArchive, 
  onDelete 
}: {
  site: Site;
  onView: (site: Site) => void;
  onEdit: (site: Site) => void;
  onNotes: (site: Site) => void;
  onArchive: (site: Site) => void;
  onDelete: (site: Site) => void;
}) => {
  const statusColor = useMemo(() => getStatusColor(site.status), [site.status]);
  const statusDisplay = useMemo(() => getStatusDisplayName(site.status), [site.status]);
  
  return (
    <TableRow key={site.id} className="hover:bg-gray-50">
      <TableCell className="font-medium">
        <div className="flex items-center space-x-2">
          <Building className="h-4 w-4 text-gray-500" />
          <span>{site.name}</span>
        </div>
      </TableCell>
      <TableCell>{site.organization_name}</TableCell>
      <TableCell>{site.location}</TableCell>
      <TableCell>
        <Badge className={statusColor}>
          {statusDisplay}
        </Badge>
      </TableCell>
      <TableCell>{site.assigned_ops_manager}</TableCell>
      <TableCell>{site.assigned_deployment_engineer}</TableCell>
      <TableCell>{site.target_live_date}</TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(site)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(site)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNotes(site)}
            className="h-8 w-8 p-0"
          >
            <StickyNote className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onArchive(site)}
            className="h-8 w-8 p-0"
          >
            <Archive className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(site)}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

SiteRow.displayName = 'SiteRow';

// Memoized Search and Filter Component
const SearchAndFilters = React.memo(({ 
  searchTerm, 
  statusFilter, 
  onSearchChange, 
  onStatusFilterChange, 
  onClearFilters 
}: {
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusFilterChange: (value: string) => void;
  onClearFilters: () => void;
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search sites by name, location, or organization..."
            value={searchTerm}
            onChange={onSearchChange}
            className="pl-10"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="deployed">Deployed</SelectItem>
            <SelectItem value="live">Live</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={onClearFilters}>
          <Filter className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>
    </div>
  );
});

SearchAndFilters.displayName = 'SearchAndFilters';

const Sites = () => {
  const navigate = useNavigate();
  const { currentRole, loading: authLoading } = useAuth();
  const { getTabAccess } = useRoleAccess();
  
  // State management
  const [sites, setSites] = useState<Site[]>([]);
  const [filteredSites, setFilteredSites] = useState<Site[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  
  // Modal states
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [archiveReason, setArchiveReason] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [otherArchiveReason, setOtherArchiveReason] = useState('');
  const [otherDeleteReason, setOtherDeleteReason] = useState('');

  // Check access permissions
  const tabAccess = useMemo(() => getTabAccess('/sites'), [getTabAccess]);
  
  if (!tabAccess.canAccess) {
    return <AccessDenied />;
  }

  // Memoized filtered sites to prevent unnecessary recalculations
  const memoizedFilteredSites = useMemo(() => {
    let filtered = sites;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(site =>
        site.name.toLowerCase().includes(searchLower) ||
        site.location.toLowerCase().includes(searchLower) ||
        site.organization_name.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(site => site.status === statusFilter);
    }

    return filtered;
  }, [sites, searchTerm, statusFilter]);

  // Update filtered sites when memoized result changes
  useEffect(() => {
    setFilteredSites(memoizedFilteredSites);
  }, [memoizedFilteredSites]);

  // Fetch sites from database - optimized with error handling
  useEffect(() => {
    const fetchSites = async () => {
      if (authLoading) return; // Wait for auth to complete
      
      try {
        console.log('🔍 Starting to fetch sites...');
        setLoading(true);
        setError(null);
        
        const sitesData = await SitesService.getAllSites();
        console.log('🔍 Fetched sites from database:', sitesData.length);
        
        setSites(sitesData);
        
        if (sitesData.length === 0) {
          console.log('⚠️ No sites returned from service');
        }
      } catch (error) {
        console.error('❌ Error fetching sites:', error);
        setError('Failed to load sites. Please try again.');
        toast.error('Failed to load sites');
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, [authLoading]);

  // Memoized event handlers to prevent unnecessary re-renders
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
  }, []);

  const handleViewSite = useCallback((site: Site) => {
    navigate(`/sites/${site.id}?mode=view`);
  }, [navigate]);

  const handleEditSite = useCallback((site: Site) => {
    navigate(`/sites/${site.id}?mode=edit`);
  }, [navigate]);

  const handleSiteNotes = useCallback((site: Site) => {
    setSelectedSite(site);
    setShowNotesModal(true);
  }, []);

  const handleArchiveSite = useCallback((site: Site) => {
    setSelectedSite(site);
    setArchiveReason('');
    setOtherArchiveReason('');
    setShowArchiveModal(true);
  }, []);

  const handleDeleteSite = useCallback((site: Site) => {
    setSelectedSite(site);
    setDeleteReason('');
    setOtherDeleteReason('');
    setShowDeleteModal(true);
  }, []);

  const handleCreateSite = useCallback(() => {
    navigate('/sites/create');
  }, [navigate]);

  // Confirm archive site
  const confirmArchiveSite = useCallback(async () => {
    if (!selectedSite || !archiveReason) {
      toast.error('Please select a reason for archiving');
      return;
    }

    if (archiveReason === 'other' && !otherArchiveReason.trim()) {
      toast.error('Please provide details for the "Other" reason');
      return;
    }

    try {
      const finalReason = archiveReason === 'other' ? otherArchiveReason : archiveReason;
      
      // Here you would typically call the API to archive the site
      // For now, we'll just remove it from the local state
      setSites(prevSites => prevSites.filter(s => s.id !== selectedSite!.id));
      setFilteredSites(prevSites => prevSites.filter(s => s.id !== selectedSite!.id));
      
      toast.success('Site archived successfully');
      setShowArchiveModal(false);
      setSelectedSite(null);
    } catch (error) {
      console.error('Error archiving site:', error);
      toast.error('Failed to archive site');
    }
  }, [selectedSite, archiveReason, otherArchiveReason]);

  // Confirm delete site
  const confirmDeleteSite = useCallback(async () => {
    if (!selectedSite || !deleteReason) {
      toast.error('Please select a reason for deletion');
      return;
    }

    if (deleteReason === 'other' && !otherDeleteReason.trim()) {
      toast.error('Please provide details for the "Other" reason');
      return;
    }

    try {
      const finalReason = deleteReason === 'other' ? otherDeleteReason : deleteReason;
      
      // Here you would typically call the API to delete the site
      // For now, we'll just remove it from the local state
      setSites(prevSites => prevSites.filter(s => s.id !== selectedSite!.id));
      setFilteredSites(prevSites => prevSites.filter(s => s.id !== selectedSite!.id));
      
      toast.success('Site deleted successfully');
      setShowDeleteModal(false);
      setSelectedSite(null);
    } catch (error) {
      console.error('Error deleting site:', error);
      toast.error('Failed to delete site');
    }
  }, [selectedSite, deleteReason, otherDeleteReason]);

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading sites...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sites Management</h1>
          <p className="text-gray-600">
            Manage and monitor all your deployment sites
          </p>
        </div>
        <Button onClick={handleCreateSite} className="mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          Create New Site
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sites</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sites.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all organizations
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sites</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sites.filter(site => ['in_progress', 'review'].includes(site.status)).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Sites</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sites.filter(site => site.status === 'live').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully deployed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sites.filter(site => site.status === 'review').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <SearchAndFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        onSearchChange={handleSearchChange}
        onStatusFilterChange={handleStatusFilterChange}
        onClearFilters={clearFilters}
      />

      {/* Sites Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sites</CardTitle>
          <CardDescription>
            {filteredSites.length} of {sites.length} sites
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSites.length === 0 ? (
            <div className="text-center py-8">
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
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site Name</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ops Manager</TableHead>
                    <TableHead>Deployment Engineer</TableHead>
                    <TableHead>Target Live Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSites.map((site) => (
                    <SiteRow
                      key={site.id}
                      site={site}
                      onView={handleViewSite}
                      onEdit={handleEditSite}
                      onNotes={handleSiteNotes}
                      onArchive={handleArchiveSite}
                      onDelete={handleDeleteSite}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

             {/* Modals */}
       {selectedSite && (
         <GlobalSiteNotesModal
           isOpen={showNotesModal}
           onClose={() => setShowNotesModal(false)}
           siteId={selectedSite.id}
           siteName={selectedSite.name}
         />
       )}

      {/* Archive Modal */}
      <Dialog open={showArchiveModal} onOpenChange={setShowArchiveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Site</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive "{selectedSite?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for archiving</Label>
              <RadioGroup value={archiveReason} onValueChange={setArchiveReason}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="completed" id="completed" />
                  <Label htmlFor="completed">Project completed</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cancelled" id="cancelled" />
                  <Label htmlFor="cancelled">Project cancelled</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other</Label>
                </div>
              </RadioGroup>
              {archiveReason === 'other' && (
                <Textarea
                  placeholder="Please provide details..."
                  value={otherArchiveReason}
                  onChange={(e) => setOtherArchiveReason(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowArchiveModal(false)}>
              Cancel
            </Button>
            <Button onClick={confirmArchiveSite}>
              Archive Site
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Site</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete "{selectedSite?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for deletion</Label>
              <RadioGroup value={deleteReason} onValueChange={setDeleteReason}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="duplicate" id="duplicate" />
                  <Label htmlFor="duplicate">Duplicate entry</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="error" id="error" />
                  <Label htmlFor="error">Data entry error</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other</Label>
                </div>
              </RadioGroup>
              {deleteReason === 'other' && (
                <Textarea
                  placeholder="Please provide details..."
                  value={otherDeleteReason}
                  onChange={(e) => setOtherDeleteReason(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteSite}>
              Delete Site
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sites; 
