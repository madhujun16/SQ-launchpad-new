import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Wrench, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Filter,
  Eye,
  Truck,
  MapPin,
  Users,
  FileText,
  Activity,
  Play,
  Pause,
  Square,
  CheckSquare
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getRoleConfig } from '@/lib/roles';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

interface Deployment {
  id: string;
  site_name: string;
  site_id: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  deployment_date: string;
  assigned_deployment_engineer: string;
  assigned_ops_manager: string;
  progress_percentage: number;
  checklist_items: ChecklistItem[];
  notes?: string;
  hardware_delivered: boolean;
  installation_started: boolean;
  testing_completed: boolean;
  go_live_ready: boolean;
  created_at: string;
  updated_at: string;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completed_by?: string;
  completed_at?: string;
  category: 'pre_deployment' | 'installation' | 'testing' | 'post_deployment';
}

const Deployment = () => {
  const { currentRole, profile } = useAuth();
  const roleConfig = getRoleConfig(currentRole || 'admin');
  
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [filteredDeployments, setFilteredDeployments] = useState<Deployment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null);
  const [showChecklistDialog, setShowChecklistDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockDeployments: Deployment[] = [
      {
        id: '1',
        site_name: 'Manchester North',
        site_id: '2',
        status: 'in_progress',
        deployment_date: '2024-01-20',
        assigned_deployment_engineer: 'David Brown',
        assigned_ops_manager: 'Sarah Wilson',
        progress_percentage: 65,
        checklist_items: [
          { id: '1-1', title: 'Hardware Inventory Check', description: 'Verify all hardware items are present', completed: true, completed_by: 'David Brown', completed_at: '2024-01-20T09:00:00Z', category: 'pre_deployment' },
          { id: '1-2', title: 'Network Connectivity Test', description: 'Test network connectivity and bandwidth', completed: true, completed_by: 'David Brown', completed_at: '2024-01-20T10:30:00Z', category: 'pre_deployment' },
          { id: '1-3', title: 'POS Terminal Installation', description: 'Install and configure POS terminals', completed: true, completed_by: 'David Brown', completed_at: '2024-01-20T11:45:00Z', category: 'installation' },
          { id: '1-4', title: 'Display Screen Setup', description: 'Install and configure display screens', completed: false, category: 'installation' },
          { id: '1-5', title: 'System Integration Test', description: 'Test integration between all systems', completed: false, category: 'testing' },
          { id: '1-6', title: 'User Training', description: 'Conduct user training session', completed: false, category: 'post_deployment' }
        ],
        notes: 'Hardware delivery completed on time. Installation proceeding as scheduled.',
        hardware_delivered: true,
        installation_started: true,
        testing_completed: false,
        go_live_ready: false,
        created_at: '2024-01-15',
        updated_at: '2024-01-20'
      },
      {
        id: '2',
        site_name: 'Birmingham South',
        site_id: '3',
        status: 'scheduled',
        deployment_date: '2024-01-25',
        assigned_deployment_engineer: 'Tom Wilson',
        assigned_ops_manager: 'Emma Davis',
        progress_percentage: 0,
        checklist_items: [
          { id: '2-1', title: 'Hardware Inventory Check', description: 'Verify all hardware items are present', completed: false, category: 'pre_deployment' },
          { id: '2-2', title: 'Network Connectivity Test', description: 'Test network connectivity and bandwidth', completed: false, category: 'pre_deployment' },
          { id: '2-3', title: 'POS Terminal Installation', description: 'Install and configure POS terminals', completed: false, category: 'installation' },
          { id: '2-4', title: 'Display Screen Setup', description: 'Install and configure display screens', completed: false, category: 'installation' },
          { id: '2-5', title: 'System Integration Test', description: 'Test integration between all systems', completed: false, category: 'testing' },
          { id: '2-6', title: 'User Training', description: 'Conduct user training session', completed: false, category: 'post_deployment' }
        ],
        notes: 'Hardware procurement completed. Ready for deployment.',
        hardware_delivered: false,
        installation_started: false,
        testing_completed: false,
        go_live_ready: false,
        created_at: '2024-01-16',
        updated_at: '2024-01-19'
      },
      {
        id: '3',
        site_name: 'Leeds Central',
        site_id: '4',
        status: 'completed',
        deployment_date: '2024-01-18',
        assigned_deployment_engineer: 'Chris Taylor',
        assigned_ops_manager: 'Lisa Anderson',
        progress_percentage: 100,
        checklist_items: [
          { id: '3-1', title: 'Hardware Inventory Check', description: 'Verify all hardware items are present', completed: true, completed_by: 'Chris Taylor', completed_at: '2024-01-18T08:30:00Z', category: 'pre_deployment' },
          { id: '3-2', title: 'Network Connectivity Test', description: 'Test network connectivity and bandwidth', completed: true, completed_by: 'Chris Taylor', completed_at: '2024-01-18T09:15:00Z', category: 'pre_deployment' },
          { id: '3-3', title: 'POS Terminal Installation', description: 'Install and configure POS terminals', completed: true, completed_by: 'Chris Taylor', completed_at: '2024-01-18T10:45:00Z', category: 'installation' },
          { id: '3-4', title: 'Display Screen Setup', description: 'Install and configure display screens', completed: true, completed_by: 'Chris Taylor', completed_at: '2024-01-18T11:30:00Z', category: 'installation' },
          { id: '3-5', title: 'System Integration Test', description: 'Test integration between all systems', completed: true, completed_by: 'Chris Taylor', completed_at: '2024-01-18T14:20:00Z', category: 'testing' },
          { id: '3-6', title: 'User Training', description: 'Conduct user training session', completed: true, completed_by: 'Chris Taylor', completed_at: '2024-01-18T16:00:00Z', category: 'post_deployment' }
        ],
        notes: 'Deployment completed successfully. Site is live and operational.',
        hardware_delivered: true,
        installation_started: true,
        testing_completed: true,
        go_live_ready: true,
        created_at: '2024-01-12',
        updated_at: '2024-01-18'
      }
    ];

    setDeployments(mockDeployments);
    setFilteredDeployments(mockDeployments);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = deployments;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(deployment =>
        deployment.site_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deployment.assigned_deployment_engineer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(deployment => deployment.status === statusFilter);
    }

    setFilteredDeployments(filtered);
  }, [deployments, searchTerm, statusFilter]);

  const getStatusConfig = (status: string) => {
    const configs = {
      scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800', icon: Calendar },
      in_progress: { label: 'In Progress', color: 'bg-orange-100 text-orange-800', icon: Activity },
      completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      on_hold: { label: 'On Hold', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: AlertCircle }
    };
    return configs[status as keyof typeof configs] || configs.scheduled;
  };

  const handleChecklistToggle = (deploymentId: string, itemId: string, completed: boolean) => {
    setDeployments(prev => prev.map(deployment => {
      if (deployment.id === deploymentId) {
        return {
          ...deployment,
          checklist_items: deployment.checklist_items.map(item => {
            if (item.id === itemId) {
              return {
                ...item,
                completed,
                completed_by: completed ? profile?.full_name : undefined,
                completed_at: completed ? new Date().toISOString() : undefined
              };
            }
            return item;
          })
        };
      }
      return deployment;
    }));
  };

  const handleGoLive = (deploymentId: string) => {
    setDeployments(prev => prev.map(deployment => {
      if (deployment.id === deploymentId) {
        return {
          ...deployment,
          status: 'completed' as Deployment['status'],
          progress_percentage: 100,
          go_live_ready: true
        };
      }
      return deployment;
    }));
  };

  const canUpdateDeployment = currentRole === 'deployment_engineer' || currentRole === 'ops_manager';

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading deployments...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Deployment</h1>
          <p className="text-gray-600 mt-1">
            Real-time deployment control and status tracking
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <roleConfig.icon className="h-3 w-3" />
            <span>{roleConfig.displayName}</span>
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by site or engineer..."
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
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Clear Filters</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schedule">Deployment Schedule</TabsTrigger>
          <TabsTrigger value="tracking">Dispatch Tracking</TabsTrigger>
          <TabsTrigger value="checklists">Installation Checklists</TabsTrigger>
          <TabsTrigger value="progress">Deployment Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Schedule</CardTitle>
              <CardDescription>
                Scheduled and upcoming deployments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Deployment Date</TableHead>
                    <TableHead>Assigned Team</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeployments.map((deployment) => {
                    const statusConfig = getStatusConfig(deployment.status);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <TableRow key={deployment.id}>
                        <TableCell>
                          <div className="font-medium">{deployment.site_name}</div>
                          <div className="text-sm text-gray-500">{deployment.assigned_deployment_engineer}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span>{new Date(deployment.deployment_date).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-xs">
                              <span className="font-medium">Engineer:</span> {deployment.assigned_deployment_engineer}
                            </div>
                            <div className="text-xs">
                              <span className="font-medium">Ops:</span> {deployment.assigned_ops_manager}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusConfig.color} flex items-center space-x-1`}>
                            <StatusIcon className="h-3 w-3" />
                            <span>{statusConfig.label}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Progress</span>
                              <span>{deployment.progress_percentage}%</span>
                            </div>
                            <Progress value={deployment.progress_percentage} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedDeployment(deployment);
                                setShowChecklistDialog(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {canUpdateDeployment && deployment.status === 'in_progress' && (
                              <Button
                                variant="gradient"
                                size="sm"
                                onClick={() => handleGoLive(deployment.id)}
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Go Live
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dispatch Tracking</CardTitle>
              <CardDescription>
                Track hardware dispatch status and delivery progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Hardware Status</TableHead>
                    <TableHead>Expected Delivery</TableHead>
                    <TableHead>Installation Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeployments.map((deployment) => (
                    <TableRow key={deployment.id}>
                      <TableCell>
                        <div className="font-medium">{deployment.site_name}</div>
                        <div className="text-sm text-gray-500">{deployment.assigned_deployment_engineer}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={deployment.hardware_delivered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          <Truck className="h-3 w-3 mr-1" />
                          {deployment.hardware_delivered ? 'Delivered' : 'In Transit'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span>{new Date(deployment.deployment_date).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={deployment.installation_started ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                          <Wrench className="h-3 w-3 mr-1" />
                          {deployment.installation_started ? 'Started' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklists" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Installation Checklists</CardTitle>
              <CardDescription>
                Digital checklists for deployment verification and sign-off
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDeployments.map((deployment) => (
                  <Card key={deployment.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{deployment.site_name}</CardTitle>
                      <CardDescription>
                        {deployment.assigned_deployment_engineer} • {new Date(deployment.deployment_date).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {deployment.checklist_items.map((item) => (
                          <div key={item.id} className="flex items-start space-x-3">
                            <Checkbox
                              checked={item.completed}
                              onCheckedChange={(checked) => 
                                handleChecklistToggle(deployment.id, item.id, checked as boolean)
                              }
                              disabled={!canUpdateDeployment}
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium">{item.title}</div>
                              <div className="text-xs text-gray-500">{item.description}</div>
                              {item.completed && item.completed_by && (
                                <div className="text-xs text-green-600 mt-1">
                                  ✓ Completed by {item.completed_by}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm text-gray-500">
                            {deployment.checklist_items.filter(item => item.completed).length} / {deployment.checklist_items.length}
                          </span>
                        </div>
                        <Progress 
                          value={(deployment.checklist_items.filter(item => item.completed).length / deployment.checklist_items.length) * 100} 
                          className="h-2 mt-2" 
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Status Progress</CardTitle>
              <CardDescription>
                Real-time updates of deployment milestones and lifecycle phases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredDeployments.map((deployment) => (
                  <div key={deployment.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium">{deployment.site_name}</h3>
                        <p className="text-sm text-gray-500">{deployment.assigned_deployment_engineer}</p>
                      </div>
                      <Badge className={`${getStatusConfig(deployment.status).color} flex items-center space-x-1`}>
                        {React.createElement(getStatusConfig(deployment.status).icon, { className: "h-3 w-3" })}
                        <span>{getStatusConfig(deployment.status).label}</span>
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                          deployment.hardware_delivered ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Truck className="h-4 w-4" />
                        </div>
                        <div className="text-xs font-medium">Hardware Delivered</div>
                      </div>
                      
                      <div className="text-center">
                        <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                          deployment.installation_started ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Wrench className="h-4 w-4" />
                        </div>
                        <div className="text-xs font-medium">Installation Started</div>
                      </div>
                      
                      <div className="text-center">
                        <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                          deployment.testing_completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <CheckCircle className="h-4 w-4" />
                        </div>
                        <div className="text-xs font-medium">Testing Completed</div>
                      </div>
                      
                      <div className="text-center">
                        <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                          deployment.go_live_ready ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Activity className="h-4 w-4" />
                        </div>
                        <div className="text-xs font-medium">Go-Live Ready</div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Overall Progress</span>
                        <span>{deployment.progress_percentage}%</span>
                      </div>
                      <Progress value={deployment.progress_percentage} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Checklist Dialog */}
      <Dialog open={showChecklistDialog} onOpenChange={setShowChecklistDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDeployment?.site_name} - Deployment Checklist
            </DialogTitle>
            <DialogDescription>
              Installation checklist for {selectedDeployment?.assigned_deployment_engineer}
            </DialogDescription>
          </DialogHeader>
          {selectedDeployment && (
            <div className="space-y-4">
              {selectedDeployment.checklist_items.map((item) => (
                <div key={item.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={(checked) => 
                      handleChecklistToggle(selectedDeployment.id, item.id, checked as boolean)
                    }
                    disabled={!canUpdateDeployment}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.title}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                    {item.completed && item.completed_by && (
                      <div className="text-xs text-green-600 mt-1">
                        ✓ Completed by {item.completed_by} on {new Date(item.completed_at!).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-gray-500">
                    {selectedDeployment.checklist_items.filter(item => item.completed).length} / {selectedDeployment.checklist_items.length}
                  </span>
                </div>
                <Progress 
                  value={(selectedDeployment.checklist_items.filter(item => item.completed).length / selectedDeployment.checklist_items.length) * 100} 
                  className="h-2" 
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Deployment; 