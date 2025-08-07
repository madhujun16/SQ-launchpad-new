import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Building, 
  Plus, 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  Edit,
  Settings,
  FileText,
  Wrench,
  Truck,
  Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getRoleConfig } from '@/lib/roles';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Site {
  id: string;
  name: string;
  type: string;
  location: string;
  status: 'created' | 'study_in_progress' | 'study_completed' | 'hardware_scoped' | 'approved' | 'procurement' | 'deployment' | 'activated' | 'go_live';
  target_go_live_date: string;
  assigned_ops_manager?: string;
  assigned_deployment_engineer?: string;
  created_at: string;
  updated_at: string;
}

const Sites = () => {
  const { currentRole, profile } = useAuth();
  const navigate = useNavigate();
  const roleConfig = getRoleConfig(currentRole || 'admin');
  
  const [sites, setSites] = useState<Site[]>([]);
  const [filteredSites, setFilteredSites] = useState<Site[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockSites: Site[] = [
      {
        id: '1',
        name: 'London Central',
        type: 'Cafeteria',
        location: 'London, UK',
        status: 'go_live',
        target_go_live_date: '2024-01-15',
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
        status: 'deployment',
        target_go_live_date: '2024-01-20',
        assigned_ops_manager: 'Sarah Wilson',
        assigned_deployment_engineer: 'David Brown',
        created_at: '2024-01-05',
        updated_at: '2024-01-18'
      },
      {
        id: '3',
        name: 'Birmingham South',
        type: 'Cafeteria',
        location: 'Birmingham, UK',
        status: 'approved',
        target_go_live_date: '2024-01-25',
        assigned_ops_manager: 'Emma Davis',
        assigned_deployment_engineer: 'Tom Wilson',
        created_at: '2024-01-10',
        updated_at: '2024-01-16'
      },
      {
        id: '4',
        name: 'Leeds Central',
        type: 'Cafeteria',
        location: 'Leeds, UK',
        status: 'hardware_scoped',
        target_go_live_date: '2024-02-01',
        assigned_ops_manager: 'Lisa Anderson',
        assigned_deployment_engineer: 'Chris Taylor',
        created_at: '2024-01-12',
        updated_at: '2024-01-17'
      },
      {
        id: '5',
        name: 'Liverpool East',
        type: 'Cafeteria',
        location: 'Liverpool, UK',
        status: 'study_completed',
        target_go_live_date: '2024-02-05',
        assigned_ops_manager: 'Mark Thompson',
        assigned_deployment_engineer: 'Anna Garcia',
        created_at: '2024-01-15',
        updated_at: '2024-01-19'
      }
    ];

    setSites(mockSites);
    setFilteredSites(mockSites);
    setLoading(false);
  }, []);

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
      created: { label: 'Created', color: 'bg-gray-100 text-gray-800', icon: Plus },
      study_in_progress: { label: 'Study In Progress', color: 'bg-blue-100 text-blue-800', icon: FileText },
      study_completed: { label: 'Study Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      hardware_scoped: { label: 'Hardware Scoped', color: 'bg-purple-100 text-purple-800', icon: Settings },
      approved: { label: 'Approved', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
      procurement: { label: 'Procurement', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      deployment: { label: 'Deployment', color: 'bg-indigo-100 text-indigo-800', icon: Wrench },
      activated: { label: 'Activated', color: 'bg-teal-100 text-teal-800', icon: Activity },
      go_live: { label: 'Go Live', color: 'bg-green-100 text-green-800', icon: CheckCircle }
    };
    return configs[status as keyof typeof configs] || configs.created;
  };

  const handleSiteClick = (siteId: string) => {
    navigate(`/sites/${siteId}`);
  };

  const canCreateSites = currentRole === 'admin';

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'created', label: 'Created' },
    { value: 'study_in_progress', label: 'Study In Progress' },
    { value: 'study_completed', label: 'Study Completed' },
    { value: 'hardware_scoped', label: 'Hardware Scoped' },
    { value: 'approved', label: 'Approved' },
    { value: 'procurement', label: 'Procurement' },
    { value: 'deployment', label: 'Deployment' },
    { value: 'activated', label: 'Activated' },
    { value: 'go_live', label: 'Go Live' }
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading sites...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sites</h1>
          <p className="text-gray-600 mt-1">
            Manage client sites and track deployment progress
          </p>
        </div>
        {canCreateSites && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="gradient" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create New Site</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Site</DialogTitle>
                <DialogDescription>
                  Add a new client site to the deployment pipeline
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Site Name *</Label>
                  <Input id="site-name" placeholder="Enter site name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site-type">Site Type *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select site type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cafeteria">Cafeteria</SelectItem>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="food-court">Food Court</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input id="location" placeholder="Enter location" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="go-live-date">Target Go-Live Date *</Label>
                  <Input id="go-live-date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ops-manager">Ops Manager *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ops manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="john-smith">John Smith</SelectItem>
                      <SelectItem value="sarah-wilson">Sarah Wilson</SelectItem>
                      <SelectItem value="emma-davis">Emma Davis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deployment-engineer">Deployment Engineer *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select deployment engineer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mike-johnson">Mike Johnson</SelectItem>
                      <SelectItem value="david-brown">David Brown</SelectItem>
                      <SelectItem value="tom-wilson">Tom Wilson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="credentials">Credentials</Label>
                  <Textarea id="credentials" placeholder="Enter site credentials and access details" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="vendor-details">Vendor Details</Label>
                  <Textarea id="vendor-details" placeholder="Enter vendor contact information" />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button variant="gradient">
                  Create Site
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search sites by name, location, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sites Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sites ({filteredSites.length})</CardTitle>
          <CardDescription>
            {currentRole === 'admin' 
              ? 'All sites in the deployment pipeline' 
              : 'Sites assigned to you'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Target Go-Live</TableHead>
                <TableHead>Assigned Team</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSites.map((site) => {
                const statusConfig = getStatusConfig(site.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <TableRow key={site.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell>
                      <div className="font-medium">{site.name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{site.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span>{site.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusConfig.color} flex items-center space-x-1`}>
                        <StatusIcon className="h-3 w-3" />
                        <span>{statusConfig.label}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span>{new Date(site.target_go_live_date).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {site.assigned_ops_manager && (
                          <div className="text-xs">
                            <span className="font-medium">Ops:</span> {site.assigned_ops_manager}
                          </div>
                        )}
                        {site.assigned_deployment_engineer && (
                          <div className="text-xs">
                            <span className="font-medium">Deploy:</span> {site.assigned_deployment_engineer}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSiteClick(site.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSiteClick(site.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredSites.length === 0 && (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sites found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No sites have been created yet'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Sites; 