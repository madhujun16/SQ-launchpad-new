import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/roles';
import { useSiteContext, type Site } from '@/contexts/SiteContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Building, 
  MapPin, 
  Search, 
  Plus, 
  Filter, 
  Calendar, 
  Users, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  Copy,
  MoreHorizontal,
  ArrowUpDown,
  FileText,
  Package,
  CheckCircle,
  Clock,
  AlertTriangle,
  Play,
  Pause
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Using the Site interface from context instead of local definition

const Site = () => {
  const { currentRole } = useAuth();
  const navigate = useNavigate();
  const { sites, setSites, setSelectedSite } = useSiteContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Check if user has permission to access sites
  useEffect(() => {
    if (currentRole && !hasPermission(currentRole, 'view_sites')) {
      toast.error('You do not have permission to access the Sites panel');
      navigate('/dashboard');
    }
  }, [currentRole, navigate]);

  // Mock data for sites
  useEffect(() => {
    const mockSites: Site[] = [
      {
        id: '1',
        name: 'ASDA Redditch SmartQ Implementation',
        organization: 'ASDA',
        foodCourt: 'ASDA Redditch',
        unitCode: 'AR004',
        goLiveDate: '2024-11-15',
        priority: 'high',
        riskLevel: 'medium',
        status: 'hardware_scoped',
        assignedOpsManager: 'Jessica Cleaver',
        assignedDeploymentEngineer: 'John Smith',
        stakeholders: [],
        notes: 'Full POS and Kiosk implementation for ASDA Redditch location',
        lastUpdated: '2024-07-30',
        description: 'Full POS and Kiosk implementation for ASDA Redditch location'
      },
      {
        id: '2',
        name: 'HSBC Canary Wharf Food Court',
        organization: 'HSBC',
        foodCourt: 'HSBC Canary Wharf',
        unitCode: 'HC005',
        goLiveDate: '2024-12-01',
        priority: 'medium',
        riskLevel: 'low',
        status: 'in_study',
        assignedOpsManager: 'Mike Thompson',
        assignedDeploymentEngineer: 'Emma Wilson',
        stakeholders: [],
        notes: 'Multi-vendor food court with various cuisines',
        lastUpdated: '2024-07-29',
        description: 'Multi-vendor food court with various cuisines'
      },
      {
        id: '3',
        name: 'Manchester Central Food Court',
        organization: 'Compass Group UK',
        foodCourt: 'Manchester Central Food Court',
        unitCode: 'MC001',
        goLiveDate: '2024-10-20',
        priority: 'high',
        riskLevel: 'high',
        status: 'live',
        assignedOpsManager: 'Sarah Johnson',
        assignedDeploymentEngineer: 'David Brown',
        stakeholders: [],
        notes: 'Executive restaurant for senior staff',
        lastUpdated: '2024-07-28',
        description: 'Executive restaurant for senior staff'
      },
      {
        id: '4',
        name: 'London Bridge Hub Implementation',
        organization: 'Sodexo UK',
        foodCourt: 'London Bridge Hub',
        unitCode: 'LB002',
        goLiveDate: '2024-09-30',
        priority: 'medium',
        riskLevel: 'medium',
        status: 'draft',
        assignedOpsManager: 'Jessica Cleaver',
        assignedDeploymentEngineer: 'John Smith',
        stakeholders: [],
        notes: 'New food service implementation at London Bridge',
        lastUpdated: '2024-07-27',
        description: 'New food service implementation at London Bridge'
      },
      {
        id: '5',
        name: 'Birmingham Office Complex',
        organization: 'Aramark UK',
        foodCourt: 'Birmingham Office Complex',
        unitCode: 'BO003',
        goLiveDate: '2024-11-30',
        priority: 'low',
        riskLevel: 'low',
        status: 'draft',
        assignedOpsManager: 'Mike Thompson',
        assignedDeploymentEngineer: 'Emma Wilson',
        stakeholders: [],
        notes: 'Standard cafeteria implementation',
        lastUpdated: '2024-07-26',
        description: 'Standard cafeteria implementation'
      }
    ];
    setSites(mockSites);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'in_study': return 'bg-blue-100 text-blue-800';
      case 'hardware_scoped': return 'bg-yellow-100 text-yellow-800';
      case 'live': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'in_study': return <Clock className="h-4 w-4" />;
      case 'hardware_scoped': return <Package className="h-4 w-4" />;
      case 'live': return <CheckCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewSite = (site: Site) => {
    navigate(`/site/${site.id}`);
  };

  const handleEditSite = (site: Site) => {
    navigate(`/site/${site.id}/edit`);
  };

  const handleDeleteSite = (site: Site) => {
    if (confirm(`Are you sure you want to delete ${site.name}?`)) {
      setSites(sites.filter(s => s.id !== site.id));
      toast.success('Site deleted successfully');
    }
  };

  const handleDownloadPDF = (site: Site) => {
    toast.success(`Downloading PDF for ${site.name}`);
  };

  const handleDuplicateSite = (site: Site) => {
    const newSite = {
      ...site,
      id: Date.now().toString(),
      name: `${site.name} (Copy)`,
      status: 'draft' as const,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setSites([...sites, newSite]);
    toast.success('Site duplicated successfully');
  };

  const filteredSites = sites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         site.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         site.foodCourt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || site.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || site.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const sortedSites = [...filteredSites].sort((a, b) => {
    let aValue = a[sortBy as keyof Site];
    let bValue = b[sortBy as keyof Site];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="w-full max-w-none px-2 sm:px-4 lg:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Site Management</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            View and manage all site projects across organizations
          </p>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search sites..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="in_study">In Study</SelectItem>
                      <SelectItem value="hardware_scoped">Hardware Scoped</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                >
                  Cards
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  Table
                </Button>
                <Button onClick={() => navigate('/site-creation')} variant="gradient">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Site
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sites Display */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedSites.map((site) => (
              <Card key={site.id} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-2">{site.name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Building className="h-4 w-4" />
                        <span>{site.organization}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{site.foodCourt} ({site.unitCode})</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewSite(site)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditSite(site)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadPDF(site)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateSite(site)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteSite(site)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(site.status)}
                      <Badge className={getStatusColor(site.status)}>
                        {site.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Badge className={getPriorityColor(site.priority)}>
                        {site.priority}
                      </Badge>
                      <Badge className={getRiskColor(site.riskLevel)}>
                        {site.riskLevel}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Go-Live:</span>
                      <span className="font-medium">{site.goLiveDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ops Manager:</span>
                      <span className="font-medium">{site.assignedOpsManager}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Engineer:</span>
                      <span className="font-medium">{site.assignedDeploymentEngineer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stakeholders:</span>
                      <span className="font-medium">
                        {site.stakeholders.map((stakeholder, index) => (
                          <span key={index}>
                            {stakeholder.name}
                            {index < site.stakeholders.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600 line-clamp-2">{site.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold text-gray-700">
                        <Button variant="ghost" onClick={() => handleSort('name')} className="h-auto p-0 font-semibold">
                          Site Name
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">Org & Food Court</TableHead>
                      <TableHead className="font-semibold text-gray-700">Go-Live Date</TableHead>
                      <TableHead className="font-semibold text-gray-700">Priority / Risk</TableHead>
                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="font-semibold text-gray-700">Team</TableHead>
                      <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedSites.map((site) => (
                      <TableRow key={site.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="font-medium text-gray-900">
                          <div>
                            <div className="font-semibold">{site.name}</div>
                            <div className="text-sm text-gray-500">Unit: {site.unitCode}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{site.organization}</div>
                            <div className="text-sm text-gray-500">{site.foodCourt}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-700">{site.goLiveDate}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Badge className={getPriorityColor(site.priority)}>
                              {site.priority}
                            </Badge>
                            <Badge className={getRiskColor(site.riskLevel)}>
                              {site.riskLevel}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(site.status)}
                            <Badge className={getStatusColor(site.status)}>
                              {site.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{site.assignedOpsManager}</div>
                            <div className="text-gray-500">{site.assignedDeploymentEngineer}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewSite(site)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditSite(site)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownloadPDF(site)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicateSite(site)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteSite(site)} className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {sortedSites.length === 0 && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No sites found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first site project'
                }
              </p>
              <Button onClick={() => navigate('/site-creation')} variant="gradient">
                <Plus className="h-4 w-4 mr-2" />
                Create First Site
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Site; 