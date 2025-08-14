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
  StickyNote
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
  type: string;
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
        type: 'Cafeteria',
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
        type: 'Cafeteria',
        location: 'Manchester, UK',
        status: 'live',
        target_live_date: '2024-01-20',
        assigned_ops_manager: 'Sarah Wilson',
        assigned_deployment_engineer: 'David Brown',
        created_at: '2024-01-05',
        updated_at: '2024-01-18'
      },
      {
        id: '3',
        name: 'Birmingham South',
        type: 'Food Court',
        location: 'Birmingham, UK',
        status: 'live',
        target_live_date: '2024-01-25',
        assigned_ops_manager: 'Emma Davis',
        assigned_deployment_engineer: 'Tom Wilson',
        created_at: '2024-01-10',
        updated_at: '2024-01-19'
      },
      {
        id: '4',
        name: 'Leeds Central',
        type: 'Cafeteria',
        location: 'Leeds, UK',
        status: 'live',
        target_live_date: '2024-02-01',
        assigned_ops_manager: 'Alex Johnson',
        assigned_deployment_engineer: 'Lisa Brown',
        created_at: '2024-01-15',
        updated_at: '2024-01-30'
      },
      {
        id: '5',
        name: 'Liverpool Docklands',
        type: 'Food Court',
        location: 'Liverpool, UK',
        status: 'live',
        target_live_date: '2024-02-05',
        assigned_ops_manager: 'Michael Wilson',
        assigned_deployment_engineer: 'Sarah Davis',
        created_at: '2024-01-20',
        updated_at: '2024-02-01'
      },
      {
        id: '6',
        name: 'Edinburgh Castle',
        type: 'Cafeteria',
        location: 'Edinburgh, UK',
        status: 'live',
        target_live_date: '2024-02-10',
        assigned_ops_manager: 'David Thompson',
        assigned_deployment_engineer: 'Emma Wilson',
        created_at: '2024-01-25',
        updated_at: '2024-02-05'
      },
      {
        id: '7',
        name: 'Cardiff Bay',
        type: 'Food Court',
        location: 'Cardiff, UK',
        status: 'live',
        target_live_date: '2024-02-15',
        assigned_ops_manager: 'Rachel Green',
        assigned_deployment_engineer: 'James Miller',
        created_at: '2024-01-30',
        updated_at: '2024-02-10'
      },
      // Approval Pending (second largest group)
      {
        id: '8',
        name: 'Glasgow Central',
        type: 'Cafeteria',
        location: 'Glasgow, UK',
        status: 'approved',
        target_live_date: '2024-03-01',
        assigned_ops_manager: 'Fiona MacDonald',
        assigned_deployment_engineer: 'Robert Campbell',
        created_at: '2024-02-01',
        updated_at: '2024-02-15'
      },
      {
        id: '9',
        name: 'Bristol Harbour',
        type: 'Food Court',
        location: 'Bristol, UK',
        status: 'approved',
        target_live_date: '2024-03-05',
        assigned_ops_manager: 'Tom Anderson',
        assigned_deployment_engineer: 'Helen White',
        created_at: '2024-02-05',
        updated_at: '2024-02-20'
      },
      {
        id: '10',
        name: 'Newcastle Quayside',
        type: 'Cafeteria',
        location: 'Newcastle, UK',
        status: 'approved',
        target_live_date: '2024-03-10',
        assigned_ops_manager: 'Peter Mitchell',
        assigned_deployment_engineer: 'Claire Roberts',
        created_at: '2024-02-10',
        updated_at: '2024-02-25'
      },
      {
        id: '11',
        name: 'Sheffield Steelworks',
        type: 'Food Court',
        location: 'Sheffield, UK',
        status: 'approved',
        target_live_date: '2024-03-15',
        assigned_ops_manager: 'Andrew Taylor',
        assigned_deployment_engineer: 'Natalie Clark',
        created_at: '2024-02-15',
        updated_at: '2024-03-01'
      },
      {
        id: '12',
        name: 'Nottingham Castle',
        type: 'Cafeteria',
        location: 'Nottingham, UK',
        status: 'approved',
        target_live_date: '2024-03-20',
        assigned_ops_manager: 'Daniel Wright',
        assigned_deployment_engineer: 'Sophie Turner',
        created_at: '2024-02-20',
        updated_at: '2024-03-05'
      },
      // New Sites with pending study (third largest group)
      {
        id: '13',
        name: 'Oxford University',
        type: 'Cafeteria',
        location: 'Oxford, UK',
        status: 'created',
        target_live_date: '2024-04-01',
        assigned_ops_manager: 'Dr. Sarah Johnson',
        assigned_deployment_engineer: 'Mark Wilson',
        created_at: '2024-03-01',
        updated_at: '2024-03-01'
      },
      {
        id: '14',
        name: 'Cambridge Science Park',
        type: 'Food Court',
        location: 'Cambridge, UK',
        status: 'study_in_progress',
        target_live_date: '2024-04-05',
        assigned_ops_manager: 'Dr. Michael Brown',
        assigned_deployment_engineer: 'Emma Davis',
        created_at: '2024-03-05',
        updated_at: '2024-03-10'
      },
      {
        id: '15',
        name: 'Durham Cathedral',
        type: 'Cafeteria',
        location: 'Durham, UK',
        status: 'created',
        target_live_date: '2024-04-10',
        assigned_ops_manager: 'Reverend James Smith',
        assigned_deployment_engineer: 'Lisa Anderson',
        created_at: '2024-03-10',
        updated_at: '2024-03-10'
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
        site.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(site => site.status === statusFilter);
    }

    setFilteredSites(filtered);
  }, [sites, searchTerm, statusFilter]);

  const getStatusConfig = (status: string) => {
    const configs = {
      created: { label: getStatusDisplayName(status), color: getStatusColor(status), icon: Plus },
      study_in_progress: { label: getStatusDisplayName(status), color: getStatusColor(status), icon: FileTextIcon },
      study_completed: { label: getStatusDisplayName(status), color: getStatusColor(status), icon: CheckCircle },
      hardware_scoped: { label: getStatusDisplayName(status), color: getStatusColor(status), icon: Settings },
      approved: { label: getStatusDisplayName(status), color: getStatusColor(status), icon: AlertCircle },
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
                <SelectTrigger>
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
              Manage and track all client sites in the deployment pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AppTable
              headers={[
                'Site Name',
                'Type',
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
                      <TableCell>{site.type}</TableCell>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/sites/${site.id}`)}
                            title="View Site Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/sites/${site.id}/study`)}
                            title="Site Study"
                          >
                            <FileTextIcon className="h-4 w-4" />
                          </Button>
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