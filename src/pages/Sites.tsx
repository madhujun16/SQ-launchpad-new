import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AppTable } from '@/components/ui/AppTable';
import { AppIcons } from '@/lib/icons';
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
  CheckSquare
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { AccessDenied } from '@/components/AccessDenied';
import { ContentLoader } from '@/components/ui/loader';
import { getRoleConfig } from '@/lib/roles';
import { useNavigate } from 'react-router-dom';
import { getStatusColor, getStatusDisplayName, type UnifiedSiteStatus } from '@/lib/siteTypes';
import { GlobalSiteNotesModal } from '@/components/GlobalSiteNotesModal';

interface Site {
  id: string;
  name: string;
  organization: string;
  location: string;
  status: UnifiedSiteStatus;
  target_live_date: string;
  assigned_ops_manager?: string;
  assigned_deployment_engineer?: string;
  created_at: string;
  updated_at: string;
}

const Sites = () => {
  const { currentRole, profile } = useAuth();
  const { getTabAccess } = useRoleAccess();
  const navigate = useNavigate();
  
  const [sites, setSites] = useState<Site[]>([]);
  const [filteredSites, setFilteredSites] = useState<Site[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  // Check access permissions
  const tabAccess = getTabAccess('/sites');
  
  if (!tabAccess.canAccess) {
    return (
      <AccessDenied 
        pageName="Sites"
        customMessage="You don't have permission to access the Sites page."
      />
    );
  }

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockSites: Site[] = [
      // Live Sites (largest group)
      {
        id: '1',
        name: 'London Central',
        organization: 'Costa Coffee',
        location: 'London, UK',
        status: 'live',
        target_live_date: '2024-01-15',
        assigned_ops_manager: 'John Smith',
        assigned_deployment_engineer: 'Mike Johnson',
        created_at: '2024-01-01',
        updated_at: '2024-01-15'
      },
      {
        id: '2',
        name: 'Manchester North',
        organization: 'Costa Coffee',
        location: 'Manchester, UK',
        status: 'live',
        target_live_date: '2024-01-20',
        assigned_ops_manager: 'Sarah Wilson',
        assigned_deployment_engineer: 'David Brown',
        created_at: '2024-01-05',
        updated_at: '2024-01-20'
      },
      {
        id: '3',
        name: 'Birmingham Central',
        organization: 'Starbucks',
        location: 'Birmingham, UK',
        status: 'live',
        target_live_date: '2024-01-25',
        assigned_ops_manager: 'Emma Davis',
        assigned_deployment_engineer: 'Tom Wilson',
        created_at: '2024-01-10',
        updated_at: '2024-01-25'
      },
      {
        id: '4',
        name: 'Leeds West',
        organization: 'Costa Coffee',
        location: 'Leeds, UK',
        status: 'live',
        target_live_date: '2024-01-30',
        assigned_ops_manager: 'James Brown',
        assigned_deployment_engineer: 'Lisa Anderson',
        created_at: '2024-01-15',
        updated_at: '2024-01-30'
      },
      {
        id: '5',
        name: 'Liverpool One',
        organization: 'Starbucks',
        location: 'Liverpool, UK',
        status: 'live',
        target_live_date: '2024-02-05',
        assigned_ops_manager: 'Michael White',
        assigned_deployment_engineer: 'Rachel Green',
        created_at: '2024-01-20',
        updated_at: '2024-02-05'
      },
      {
        id: '6',
        name: 'Newcastle Central',
        organization: 'Costa Coffee',
        location: 'Newcastle, UK',
        status: 'live',
        target_live_date: '2024-02-10',
        assigned_ops_manager: 'David Clark',
        assigned_deployment_engineer: 'Sophie Turner',
        created_at: '2024-01-25',
        updated_at: '2024-02-10'
      },
      {
        id: '7',
        name: 'Sheffield South',
        organization: 'Starbucks',
        location: 'Sheffield, UK',
        status: 'live',
        target_live_date: '2024-02-15',
        assigned_ops_manager: 'Anna Johnson',
        assigned_deployment_engineer: 'Chris Martin',
        created_at: '2024-01-30',
        updated_at: '2024-02-15'
      },
      {
        id: '8',
        name: 'Bristol Harbour',
        organization: 'Costa Coffee',
        location: 'Bristol, UK',
        status: 'live',
        target_live_date: '2024-02-20',
        assigned_ops_manager: 'Robert Taylor',
        assigned_deployment_engineer: 'Emma Wilson',
        created_at: '2024-02-05',
        updated_at: '2024-02-20'
      },
      {
        id: '9',
        name: 'Cardiff Bay',
        organization: 'Starbucks',
        location: 'Cardiff, UK',
        status: 'live',
        target_live_date: '2024-02-25',
        assigned_ops_manager: 'Jennifer Lee',
        assigned_deployment_engineer: 'Mark Davis',
        created_at: '2024-02-10',
        updated_at: '2024-02-25'
      },
      {
        id: '10',
        name: 'Edinburgh Castle',
        organization: 'Costa Coffee',
        location: 'Edinburgh, UK',
        status: 'live',
        target_live_date: '2024-03-01',
        assigned_ops_manager: 'William Scott',
        assigned_deployment_engineer: 'Hannah Brown',
        created_at: '2024-02-15',
        updated_at: '2024-03-01'
      },
      {
        id: '11',
        name: 'Glasgow Central',
        organization: 'Starbucks',
        location: 'Glasgow, UK',
        status: 'live',
        target_live_date: '2024-03-05',
        assigned_ops_manager: 'Andrew Wilson',
        assigned_deployment_engineer: 'Laura Smith',
        created_at: '2024-02-20',
        updated_at: '2024-03-05'
      },
      {
        id: '12',
        name: 'Dublin Temple Bar',
        organization: 'Costa Coffee',
        location: 'Dublin, Ireland',
        status: 'live',
        target_live_date: '2024-03-10',
        assigned_ops_manager: 'Sean O\'Connor',
        assigned_deployment_engineer: 'Mairead Kelly',
        created_at: '2024-02-25',
        updated_at: '2024-03-10'
      },

      // Sites in Progress
      {
        id: '13',
        name: 'Belfast City',
        organization: 'Starbucks',
        location: 'Belfast, UK',
        status: 'study_in_progress',
        target_live_date: '2024-03-20',
        assigned_ops_manager: 'Patrick Murphy',
        assigned_deployment_engineer: 'Fiona O\'Neill',
        created_at: '2024-03-01',
        updated_at: '2024-03-01'
      },
      {
        id: '14',
        name: 'Aberdeen Union',
        organization: 'Costa Coffee',
        location: 'Aberdeen, UK',
        status: 'study_in_progress',
        target_live_date: '2024-03-25',
        assigned_ops_manager: 'Gordon Stewart',
        assigned_deployment_engineer: 'Morag Campbell',
        created_at: '2024-03-05',
        updated_at: '2024-03-05'
      },

      // Sites in Planning
      {
        id: '15',
        name: 'Southampton Docks',
        organization: 'Starbucks',
        location: 'Southampton, UK',
        status: 'created',
        target_live_date: '2024-04-01',
        assigned_ops_manager: 'Thomas Jones',
        assigned_deployment_engineer: 'Victoria Adams',
        created_at: '2024-03-10',
        updated_at: '2024-03-10'
      },
      {
        id: '16',
        name: 'Plymouth Hoe',
        organization: 'Costa Coffee',
        location: 'Plymouth, UK',
        status: 'created',
        target_live_date: '2024-04-05',
        assigned_ops_manager: 'Richard Brown',
        assigned_deployment_engineer: 'Sarah Miller',
        created_at: '2024-03-15',
        updated_at: '2024-03-15'
      },

      // Sites in Scoping
      {
        id: '17',
        name: 'Exeter Cathedral',
        organization: 'Starbucks',
        location: 'Exeter, UK',
        status: 'hardware_scoped',
        target_live_date: '2024-04-10',
        assigned_ops_manager: 'Daniel White',
        assigned_deployment_engineer: 'Emily Davis',
        created_at: '2024-03-20',
        updated_at: '2024-03-20'
      },
      {
        id: '18',
        name: 'Truro City',
        organization: 'Costa Coffee',
        location: 'Truro, UK',
        status: 'hardware_scoped',
        target_live_date: '2024-04-15',
        assigned_ops_manager: 'Christopher Green',
        assigned_deployment_engineer: 'Jessica Wilson',
        created_at: '2024-03-25',
        updated_at: '2024-03-25'
      },

      // Sites in Procurement
      {
        id: '19',
        name: 'St Austell',
        organization: 'Starbucks',
        location: 'St Austell, UK',
        status: 'procurement',
        target_live_date: '2024-04-20',
        assigned_ops_manager: 'Matthew Taylor',
        assigned_deployment_engineer: 'Amanda Clark',
        created_at: '2024-03-30',
        updated_at: '2024-03-30'
      },
      {
        id: '20',
        name: 'Falmouth Harbour',
        organization: 'Costa Coffee',
        location: 'Falmouth, UK',
        status: 'procurement',
        target_live_date: '2024-04-25',
        assigned_ops_manager: 'Jonathan Smith',
        assigned_deployment_engineer: 'Rebecca Brown',
        created_at: '2024-04-05',
        updated_at: '2024-04-05'
      }
    ];

    // Filter sites based on user role and access level
    let filteredSitesData = mockSites;
    
    if (currentRole === 'ops_manager' || currentRole === 'deployment_engineer') {
      // For non-admin users, only show assigned sites
      const currentUserName = profile?.full_name || profile?.email || '';
      filteredSitesData = mockSites.filter(site => 
        site.assigned_ops_manager === currentUserName || 
        site.assigned_deployment_engineer === currentUserName
      );
    }

    setSites(filteredSitesData);
    setFilteredSites(filteredSitesData);
    setLoading(false);
  }, [currentRole, profile]);

  useEffect(() => {
    let filtered = sites;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(site =>
        site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(site => site.status === statusFilter);
    }

    setFilteredSites(filtered);
  }, [sites, searchTerm, statusFilter]);

  const getStatusConfig = (status: UnifiedSiteStatus) => {
    const configs = {
      created: { label: getStatusDisplayName(status), color: getStatusColor(status), icon: PlusCircle },
      study_in_progress: { label: getStatusDisplayName(status), color: getStatusColor(status), icon: FileTextIcon },
      study_completed: { label: getStatusDisplayName(status), color: getStatusColor(status), icon: CheckSquare },
      hardware_scoped: { label: getStatusDisplayName(status), color: getStatusColor(status), icon: Package },
      approved: { label: getStatusDisplayName(status), color: getStatusColor(status), icon: CheckCircle },
      procurement: { label: getStatusDisplayName(status), color: getStatusColor(status), icon: Clock },
      deployment: { label: getStatusDisplayName(status), color: getStatusColor(status), icon: Wrench },
      activated: { label: getStatusDisplayName(status), color: getStatusColor(status), icon: Activity },
      live: { label: getStatusDisplayName(status), color: getStatusColor(status), icon: CheckCircle }
    };
    return configs[status as keyof typeof configs] || configs.created;
  };

  const canCreateSites = currentRole === 'admin';

  if (loading) {
    return <ContentLoader />;
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sites</h1>
          <p className="text-gray-600 mt-1">
            Manage client sites and track deployment progress
            {tabAccess.message && (
              <span className="block text-sm text-blue-600 mt-1">
                {tabAccess.message}
              </span>
            )}
          </p>
        </div>
        {canCreateSites && (
          <Button 
            variant="gradient" 
            className="flex items-center space-x-2"
            onClick={() => navigate('/sites/create')}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create New Site</span>
          </Button>
        )}
      </div>

      {/* Sites List */}
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by site name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="study_in_progress">Study In Progress</SelectItem>
                  <SelectItem value="study_completed">Study Completed</SelectItem>
                  <SelectItem value="hardware_scoped">Hardware Scoped</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="procurement">Procurement</SelectItem>
                  <SelectItem value="deployment">Deployment</SelectItem>
                  <SelectItem value="activated">Activated</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Clear Filters</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sites Table */}
        <Card>
          <CardHeader>
            <CardTitle>Sites Overview</CardTitle>
            <CardDescription>
              Manage and track all client sites in the deployment pipeline.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AppTable
              headers={[
                'Site Name',
                'Organization',
                'Location',
                'Status',
                'Target Go-Live',
                'Assigned Team',
                'Actions',
              ]}
            >
                {filteredSites.map((site) => {
                  const statusConfig = getStatusConfig(site.status);
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <TableRow key={site.id}>
                      <TableCell className="font-medium">{site.name}</TableCell>
                      <TableCell>{site.organization}</TableCell>
                      <TableCell>{site.location}</TableCell>
                      <TableCell>
                        <Badge className={statusConfig.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(site.target_live_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3 text-gray-400" />
                            <span>{site.assigned_ops_manager}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Wrench className="h-3 w-3 text-gray-400" />
                            <span>{site.assigned_deployment_engineer}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {/* View Button - Only shown for Live sites (read-only access) */}
                          {site.status === 'live' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/sites/${site.id}`)}
                              title="View Site Details (Read Only)"
                              className="text-gray-600 hover:text-gray-800"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Edit Button - Only shown for non-Live sites */}
                          {site.status !== 'live' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/sites/${site.id}`)}
                              title="Edit Site"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Site Notes Button - Always shown */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSite(site);
                              setShowNotesModal(true);
                            }}
                            title="Site Notes"
                          >
                            <StickyNote className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </AppTable>
          </CardContent>
        </Card>
      </div>

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