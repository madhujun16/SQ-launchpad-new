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
  
  // New state for Archive and Delete modals
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [archiveReason, setArchiveReason] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [otherArchiveReason, setOtherArchiveReason] = useState('');
  const [otherDeleteReason, setOtherDeleteReason] = useState('');

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

  // Handle view site (read-only mode for Live sites)
  const handleViewSite = (site: Site) => {
    navigate(`/sites/${site.id}?mode=view`);
  };

  // Handle edit site (with stepper flow based on status)
  const handleEditSite = (site: Site) => {
    navigate(`/sites/${site.id}?mode=edit`);
  };

  // Handle site notes
  const handleSiteNotes = (site: Site) => {
    setSelectedSite(site);
    setShowNotesModal(true);
  };

  // Handle archive site
  const handleArchiveSite = (site: Site) => {
    setSelectedSite(site);
    setArchiveReason('');
    setOtherArchiveReason('');
    setShowArchiveModal(true);
  };

  // Handle delete site
  const handleDeleteSite = (site: Site) => {
    setSelectedSite(site);
    setDeleteReason('');
    setOtherDeleteReason('');
    setShowDeleteModal(true);
  };

  // Handle create new site
  const handleCreateSite = () => {
    navigate('/sites/create');
  };

  // Confirm archive site
  const confirmArchiveSite = async () => {
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
      
      toast.success(`Site "${selectedSite!.name}" has been archived successfully`);
      setShowArchiveModal(false);
      setSelectedSite(null);
      setArchiveReason('');
      setOtherArchiveReason('');
    } catch (error) {
      console.error('Error archiving site:', error);
      toast.error('Failed to archive site. Please try again.');
    }
  };

  // Confirm delete site
  const confirmDeleteSite = async () => {
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
      
      toast.success(`Site "${selectedSite!.name}" has been deleted successfully`);
      setShowDeleteModal(false);
      setSelectedSite(null);
      setDeleteReason('');
      setOtherDeleteReason('');
    } catch (error) {
      console.error('Error deleting site:', error);
      toast.error('Failed to delete site. Please try again.');
    }
  };

  // Check if site is live (deployed and operational)
  const isSiteLive = (status: string) => {
    return status === 'live' || status === 'go_live' || status === 'activated';
  };

  // Check if site is not yet deployed
  const isSiteNotDeployed = (status: string) => {
    return status === 'site_created' || status === 'site_creation' || 
           status === 'site_study_done' || status === 'scoping_done' || 
           status === 'approved' || status === 'procurement_done';
  };

  // Get unique statuses for filter dropdown
  const uniqueStatuses = Array.from(new Set(sites.map(site => site.status))).sort();

  // Map database statuses to display names and colors
  const getStatusDisplayNameFromDB = (status: string) => {
    const statusMap: Record<string, { name: string; color: string }> = {
      // New finalized statuses
      'site_created': { 
        name: 'Site Created', 
        color: 'bg-gray-100 text-gray-800 border-gray-200' 
      },
      'site_study_done': { 
        name: 'Site Study Done', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200' 
      },
      'scoping_done': { 
        name: 'Scoping Done', 
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200' 
      },
      'approved': { 
        name: 'Approved', 
        color: 'bg-purple-100 text-purple-800 border-purple-200' 
      },
      'procurement_done': { 
        name: 'Procurement Done', 
        color: 'bg-blue-100 text-blue-800 border-blue-200' 
      },
      'deployed': { 
        name: 'Deployed', 
        color: 'bg-green-100 text-green-800 border-green-200' 
      },
      'live': { 
        name: 'Live', 
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200' 
      },
      // Legacy status mappings for backward compatibility
      'created': { 
        name: 'Site Created', 
        color: 'bg-gray-100 text-gray-800 border-gray-200' 
      },
      'site_creation': { 
        name: 'Site Created', 
        color: 'bg-gray-100 text-gray-800 border-gray-200' 
      },
      'site_study': { 
        name: 'Site Study Done', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200' 
      },
      'study_completed': { 
        name: 'Site Study Done', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200' 
      },
      'software_scoping': { 
        name: 'Scoping Done', 
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200' 
      },
      'hardware_scoping': { 
        name: 'Scoping Done', 
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200' 
      },
      'hardware_scoped': { 
        name: 'Scoping Done', 
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200' 
      },
      'approval': { 
        name: 'Approved', 
        color: 'bg-purple-100 text-purple-800 border-purple-200' 
      },
      'procurement': { 
        name: 'Procurement Done', 
        color: 'bg-blue-100 text-blue-800 border-blue-200' 
      },
      'deployment': { 
        name: 'Deployed', 
        color: 'bg-green-100 text-green-800 border-green-200' 
      },
      'go_live': { 
        name: 'Live', 
        color: 'bg-blue-100 text-blue-800 border-blue-200' 
      },
      'activated': { 
        name: 'Live', 
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200' 
      },
      'configuration_in_progress': { 
        name: 'Scoping Done', 
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200' 
      },
      'on_hold': { 
        name: 'Site Created', 
        color: 'bg-gray-100 text-gray-800 border-gray-200' 
      }
    };
    return statusMap[status] || { name: status, color: 'bg-gray-100 text-gray-800 border-gray-200' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white/90">
        <div className="text-center">
          <Loader size="lg" />
          <p className="text-gray-600 mt-4">Loading sites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Page Header with Create Site Button */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Sites</h1>
          <p className="text-gray-600">Manage client sites and track deployment progress</p>
        </div>
        
        {/* Create Site Button - Only visible to Admin users */}
        {currentRole === 'admin' && (
          <Button 
            onClick={handleCreateSite}
            className="bg-gradient-to-r from-black to-green-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 hover:from-gray-900 hover:to-green-700 transition-all duration-200 shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span>Create Site</span>
          </Button>
        )}
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
              <SelectItem value="site_created">Site Created</SelectItem>
              <SelectItem value="site_study_done">Site Study Done</SelectItem>
              <SelectItem value="scoping_done">Scoping Done</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="procurement_done">Procurement Done</SelectItem>
              <SelectItem value="deployed">Deployed</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
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
                      {site.organization_logo ? (
                        <img 
                          src={site.organization_logo} 
                          alt={`${site.organization_name} logo`}
                          className="h-6 w-6 object-contain rounded"
                          onError={(e) => {
                            // Hide the image if it fails to load
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Building className="h-4 w-4 text-gray-600" />
                      )}
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
                          {/* Notes icon - Always visible */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSiteNotes(site)}
                            title="Site Notes"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          
                          {/* For Live sites: Show View and Archive */}
                          {isSiteLive(site.status) && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewSite(site)}
                                title="View Site (Read-only)"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleArchiveSite(site)}
                                title="Archive Site"
                                className="text-orange-600 hover:text-orange-800"
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          
                          {/* For non-Live sites: Show Edit only */}
                          {!isSiteLive(site.status) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSite(site)}
                              title="Edit Site (with Stepper Flow)"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Delete icon - Only for sites not yet deployed and admin users */}
                          {isSiteNotDeployed(site.status) && currentRole === 'admin' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSite(site)}
                              title="Delete Site"
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
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

      {/* Archive Site Modal */}
      <Dialog open={showArchiveModal} onOpenChange={setShowArchiveModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Please specify the reason for archiving this site</DialogTitle>
            <DialogDescription>
              Select the primary reason for archiving "{selectedSite?.name}". This information will be logged for audit purposes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <RadioGroup value={archiveReason} onValueChange={setArchiveReason}>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="site_closed" id="archive-reason-1" />
                  <Label htmlFor="archive-reason-1">Site getting closed (e.g., permanent shutdown)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lost_contract" id="archive-reason-2" />
                  <Label htmlFor="archive-reason-2">Lost contract or business (e.g., client contract ended)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="business_restructuring" id="archive-reason-3" />
                  <Label htmlFor="archive-reason-3">Business restructuring (merger, acquisition, organisational changes)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="site_replaced" id="archive-reason-4" />
                  <Label htmlFor="archive-reason-4">Site replaced or consolidated with another location</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="regulatory_compliance" id="archive-reason-5" />
                  <Label htmlFor="archive-reason-5">Regulatory/compliance requirement (e.g., legal hold, audit requirement)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="temporary_pause" id="archive-reason-6" />
                  <Label htmlFor="archive-reason-6">Temporary operational pause (e.g., seasonal or strategic pause)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="archive-reason-7" />
                  <Label htmlFor="archive-reason-7">Other</Label>
                </div>
              </div>
            </RadioGroup>
            
            {archiveReason === 'other' && (
              <div className="space-y-2">
                <Label htmlFor="other-archive-reason">Please provide details</Label>
                <Textarea
                  id="other-archive-reason"
                  placeholder="Please describe the reason for archiving this site..."
                  value={otherArchiveReason}
                  onChange={(e) => setOtherArchiveReason(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowArchiveModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmArchiveSite}
              disabled={!archiveReason || (archiveReason === 'other' && !otherArchiveReason.trim())}
            >
              Archive Site
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Site Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Please specify the reason for deleting this site</DialogTitle>
            <DialogDescription>
              Select the primary reason for deleting "{selectedSite?.name}". This action cannot be undone and will be logged for audit purposes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <RadioGroup value={deleteReason} onValueChange={setDeleteReason}>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="created_mistake" id="delete-reason-1" />
                  <Label htmlFor="delete-reason-1">Created by mistake (erroneous site creation)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lost_contract" id="delete-reason-2" />
                  <Label htmlFor="delete-reason-2">Lost contract or business cancellation</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="duplicate_record" id="delete-reason-3" />
                  <Label htmlFor="delete-reason-3">Duplicate site record in the system</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="data_cleanup" id="delete-reason-4" />
                  <Label htmlFor="delete-reason-4">Data cleanup (removal of outdated, incomplete, or incorrect information)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="regulatory_legal" id="delete-reason-5" />
                  <Label htmlFor="delete-reason-5">Regulatory or legal mandate for data deletion (e.g., right to erasure)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="delete-reason-6" />
                  <Label htmlFor="delete-reason-6">Other</Label>
                </div>
              </div>
            </RadioGroup>
            
            {deleteReason === 'other' && (
              <div className="space-y-2">
                <Label htmlFor="other-delete-reason">Please provide details</Label>
                <Textarea
                  id="other-delete-reason"
                  placeholder="Please describe the reason for deleting this site..."
                  value={otherDeleteReason}
                  onChange={(e) => setOtherDeleteReason(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmDeleteSite}
              disabled={!deleteReason || (deleteReason === 'other' && !otherDeleteReason.trim())}
              variant="destructive"
            >
              Delete Site
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sites; 
