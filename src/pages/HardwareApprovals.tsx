import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/roles';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Building, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  Copy,
  MoreHorizontal,
  ArrowUpDown,
  FileText,
  Package,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Play,
  Pause,
  Shield,
  Wrench,
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Truck,
  Settings,
  BarChart3,
  Activity
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ApprovalRequest {
  id: string;
  siteName: string;
  organization: string;
  requestType: 'hardware_scoping' | 'deployment' | 'maintenance' | 'upgrade';
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requestedBy: string;
  requestedDate: string;
  assignedTo: string;
  estimatedCost: number;
  description: string;
  hardwareItems: HardwareItem[];
  notes: string;
  lastUpdated: string;
}

interface HardwareItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  specifications: string;
}

const HardwareApprovals = () => {
  const { currentRole } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('requestedDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Check if user has permission to access approvals
  useEffect(() => {
    console.log('Current role:', currentRole);
    console.log('Has manage_approvals permission:', hasPermission(currentRole || 'admin', 'manage_approvals'));
    
    // Only check if user has a role and doesn't have the permission
    if (currentRole && !hasPermission(currentRole, 'manage_approvals')) {
      console.log('Permission denied for role:', currentRole);
      toast.error('You do not have permission to access the Approvals panel');
      navigate('/dashboard');
    }
  }, [currentRole, navigate]);

  // Mock data for approval requests
  useEffect(() => {
    // This would typically come from an API
    const mockRequests: ApprovalRequest[] = [
      {
        id: '1',
        siteName: 'ASDA Redditch SmartQ Implementation',
        organization: 'ASDA',
        requestType: 'hardware_scoping',
        status: 'pending',
        priority: 'high',
        requestedBy: 'John Smith',
        requestedDate: '2024-07-30',
        assignedTo: 'Jessica Cleaver',
        estimatedCost: 45000,
        description: 'Complete hardware scoping for ASDA Redditch location including POS systems, kiosks, and networking equipment',
        hardwareItems: [
          {
            id: '1',
            name: 'SmartQ POS Terminal',
            category: 'POS Systems',
            quantity: 8,
            unitCost: 2500,
            totalCost: 20000,
            specifications: 'Touch screen, card reader, receipt printer'
          },
          {
            id: '2',
            name: 'Self-Service Kiosk',
            category: 'Kiosks',
            quantity: 4,
            unitCost: 3500,
            totalCost: 14000,
            specifications: 'Large touch screen, payment terminal, thermal printer'
          },
          {
            id: '3',
            name: 'Network Switch',
            category: 'Networking',
            quantity: 2,
            unitCost: 5500,
            totalCost: 11000,
            specifications: '24-port PoE switch, managed'
          }
        ],
        notes: 'Urgent request for Q4 implementation. Site visit completed.',
        lastUpdated: '2024-07-30'
      },
      {
        id: '2',
        siteName: 'HSBC Canary Wharf Food Court',
        organization: 'HSBC',
        requestType: 'deployment',
        status: 'approved',
        priority: 'medium',
        requestedBy: 'Emma Wilson',
        requestedDate: '2024-07-29',
        assignedTo: 'Mike Thompson',
        estimatedCost: 32000,
        description: 'Deployment approval for multi-vendor food court hardware setup',
        hardwareItems: [
          {
            id: '4',
            name: 'Vendor POS System',
            category: 'POS Systems',
            quantity: 12,
            unitCost: 1800,
            totalCost: 21600,
            specifications: 'Basic POS with card reader'
          },
          {
            id: '5',
            name: 'Kitchen Display System',
            category: 'Kitchen Equipment',
            quantity: 6,
            unitCost: 1200,
            totalCost: 7200,
            specifications: 'Digital order display for kitchen'
          },
          {
            id: '6',
            name: 'Network Infrastructure',
            category: 'Networking',
            quantity: 1,
            unitCost: 3200,
            totalCost: 3200,
            specifications: 'Complete network setup'
          }
        ],
        notes: 'Approved for deployment. All hardware confirmed available.',
        lastUpdated: '2024-07-29'
      },
      {
        id: '3',
        siteName: 'Manchester Central Food Court',
        organization: 'Compass Group UK',
        requestType: 'maintenance',
        status: 'under_review',
        priority: 'urgent',
        requestedBy: 'David Brown',
        requestedDate: '2024-07-28',
        assignedTo: 'Sarah Johnson',
        estimatedCost: 8500,
        description: 'Emergency maintenance request for failing POS terminals',
        hardwareItems: [
          {
            id: '7',
            name: 'POS Terminal Replacement',
            category: 'POS Systems',
            quantity: 3,
            unitCost: 2000,
            totalCost: 6000,
            specifications: 'Replacement for failing terminals'
          },
          {
            id: '8',
            name: 'Network Cable',
            category: 'Networking',
            quantity: 50,
            unitCost: 50,
            totalCost: 2500,
            specifications: 'Cat6 cable for network repairs'
          }
        ],
        notes: 'Critical system failure affecting operations. Immediate attention required.',
        lastUpdated: '2024-07-28'
      },
      {
        id: '4',
        siteName: 'London Bridge Hub Implementation',
        organization: 'Compass Group UK',
        requestType: 'upgrade',
        status: 'rejected',
        priority: 'low',
        requestedBy: 'Jessica Cleaver',
        requestedDate: '2024-07-27',
        assignedTo: 'Mike Thompson',
        estimatedCost: 28000,
        description: 'System upgrade request for enhanced functionality',
        hardwareItems: [
          {
            id: '9',
            name: 'Advanced POS System',
            category: 'POS Systems',
            quantity: 6,
            unitCost: 3500,
            totalCost: 21000,
            specifications: 'Advanced features, analytics dashboard'
          },
          {
            id: '10',
            name: 'Digital Menu Boards',
            category: 'Display Systems',
            quantity: 4,
            unitCost: 1750,
            totalCost: 7000,
            specifications: 'Interactive digital menu displays'
          }
        ],
        notes: 'Rejected due to budget constraints. Consider for next fiscal year.',
        lastUpdated: '2024-07-27'
      },
      {
        id: '5',
        siteName: 'Birmingham Office Complex',
        organization: 'Compass Group UK',
        requestType: 'hardware_scoping',
        status: 'pending',
        priority: 'medium',
        requestedBy: 'Emma Wilson',
        requestedDate: '2024-07-26',
        assignedTo: 'John Smith',
        estimatedCost: 18500,
        description: 'Initial hardware scoping for new cafeteria implementation',
        hardwareItems: [
          {
            id: '11',
            name: 'Basic POS System',
            category: 'POS Systems',
            quantity: 4,
            unitCost: 1500,
            totalCost: 6000,
            specifications: 'Standard POS with basic features'
          },
          {
            id: '12',
            name: 'Kitchen Equipment',
            category: 'Kitchen Equipment',
            quantity: 1,
            unitCost: 12500,
            totalCost: 12500,
            specifications: 'Complete kitchen setup package'
          }
        ],
        notes: 'Standard cafeteria setup. Site survey completed.',
        lastUpdated: '2024-07-26'
      }
    ];

    // In a real app, this would be stored in state management
    console.log('Loaded approval requests:', mockRequests);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'under_review': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'high': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hardware_scoping': return 'bg-indigo-100 text-indigo-800';
      case 'deployment': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'upgrade': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (request: ApprovalRequest) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
  };

  const handleApprove = (requestId: string) => {
    toast.success('Request approved successfully');
    // In a real app, this would update the database
  };

  const handleReject = (requestId: string) => {
    toast.error('Request rejected');
    // In a real app, this would update the database
  };

  const handleDownloadPDF = (request: ApprovalRequest) => {
    toast.success(`Downloading PDF for ${request.siteName}`);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Mock data for demonstration
  const approvalRequests: ApprovalRequest[] = [
    {
      id: '1',
      siteName: 'ASDA Redditch SmartQ Implementation',
      organization: 'ASDA',
      requestType: 'hardware_scoping',
      status: 'pending',
      priority: 'high',
      requestedBy: 'John Smith',
      requestedDate: '2024-07-30',
      assignedTo: 'Jessica Cleaver',
      estimatedCost: 45000,
      description: 'Complete hardware scoping for ASDA Redditch location including POS systems, kiosks, and networking equipment',
      hardwareItems: [
        {
          id: '1',
          name: 'SmartQ POS Terminal',
          category: 'POS Systems',
          quantity: 8,
          unitCost: 2500,
          totalCost: 20000,
          specifications: 'Touch screen, card reader, receipt printer'
        },
        {
          id: '2',
          name: 'Self-Service Kiosk',
          category: 'Kiosks',
          quantity: 4,
          unitCost: 3500,
          totalCost: 14000,
          specifications: 'Large touch screen, payment terminal, thermal printer'
        },
        {
          id: '3',
          name: 'Network Switch',
          category: 'Networking',
          quantity: 2,
          unitCost: 5500,
          totalCost: 11000,
          specifications: '24-port PoE switch, managed'
        }
      ],
      notes: 'Urgent request for Q4 implementation. Site visit completed.',
      lastUpdated: '2024-07-30'
    },
    {
      id: '2',
      siteName: 'HSBC Canary Wharf Food Court',
      organization: 'HSBC',
      requestType: 'deployment',
      status: 'approved',
      priority: 'medium',
      requestedBy: 'Emma Wilson',
      requestedDate: '2024-07-29',
      assignedTo: 'Mike Thompson',
      estimatedCost: 32000,
      description: 'Deployment approval for multi-vendor food court hardware setup',
      hardwareItems: [
        {
          id: '4',
          name: 'Vendor POS System',
          category: 'POS Systems',
          quantity: 12,
          unitCost: 1800,
          totalCost: 21600,
          specifications: 'Basic POS with card reader'
        },
        {
          id: '5',
          name: 'Kitchen Display System',
          category: 'Kitchen Equipment',
          quantity: 6,
          unitCost: 1200,
          totalCost: 7200,
          specifications: 'Digital order display for kitchen'
        },
        {
          id: '6',
          name: 'Network Infrastructure',
          category: 'Networking',
          quantity: 1,
          unitCost: 3200,
          totalCost: 3200,
          specifications: 'Complete network setup'
        }
      ],
      notes: 'Approved for deployment. All hardware confirmed available.',
      lastUpdated: '2024-07-29'
    },
    {
      id: '3',
      siteName: 'Manchester Central Food Court',
      organization: 'Compass Group UK',
      requestType: 'maintenance',
      status: 'under_review',
      priority: 'urgent',
      requestedBy: 'David Brown',
      requestedDate: '2024-07-28',
      assignedTo: 'Sarah Johnson',
      estimatedCost: 8500,
      description: 'Emergency maintenance request for failing POS terminals',
      hardwareItems: [
        {
          id: '7',
          name: 'POS Terminal Replacement',
          category: 'POS Systems',
          quantity: 3,
          unitCost: 2000,
          totalCost: 6000,
          specifications: 'Replacement for failing terminals'
        },
        {
          id: '8',
          name: 'Network Cable',
          category: 'Networking',
          quantity: 50,
          unitCost: 50,
          totalCost: 2500,
          specifications: 'Cat6 cable for network repairs'
        }
      ],
      notes: 'Critical system failure affecting operations. Immediate attention required.',
      lastUpdated: '2024-07-28'
    },
    {
      id: '4',
      siteName: 'London Bridge Hub Implementation',
      organization: 'Compass Group UK',
      requestType: 'upgrade',
      status: 'rejected',
      priority: 'low',
      requestedBy: 'Jessica Cleaver',
      requestedDate: '2024-07-27',
      assignedTo: 'Mike Thompson',
      estimatedCost: 28000,
      description: 'System upgrade request for enhanced functionality',
      hardwareItems: [
        {
          id: '9',
          name: 'Advanced POS System',
          category: 'POS Systems',
          quantity: 6,
          unitCost: 3500,
          totalCost: 21000,
          specifications: 'Advanced features, analytics dashboard'
        },
        {
          id: '10',
          name: 'Digital Menu Boards',
          category: 'Display Systems',
          quantity: 4,
          unitCost: 1750,
          totalCost: 7000,
          specifications: 'Interactive digital menu displays'
        }
      ],
      notes: 'Rejected due to budget constraints. Consider for next fiscal year.',
      lastUpdated: '2024-07-27'
    },
    {
      id: '5',
      siteName: 'Birmingham Office Complex',
      organization: 'Compass Group UK',
      requestType: 'hardware_scoping',
      status: 'pending',
      priority: 'medium',
      requestedBy: 'Emma Wilson',
      requestedDate: '2024-07-26',
      assignedTo: 'John Smith',
      estimatedCost: 18500,
      description: 'Initial hardware scoping for new cafeteria implementation',
      hardwareItems: [
        {
          id: '11',
          name: 'Basic POS System',
          category: 'POS Systems',
          quantity: 4,
          unitCost: 1500,
          totalCost: 6000,
          specifications: 'Standard POS with basic features'
        },
        {
          id: '12',
          name: 'Kitchen Equipment',
          category: 'Kitchen Equipment',
          quantity: 1,
          unitCost: 12500,
          totalCost: 12500,
          specifications: 'Complete kitchen setup package'
        }
      ],
      notes: 'Standard cafeteria setup. Site survey completed.',
      lastUpdated: '2024-07-26'
    }
  ];

  const filteredRequests = approvalRequests.filter(request => {
    const matchesSearch = request.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || request.priority === filterPriority;
    const matchesType = filterType === 'all' || request.requestType === filterType;
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    let aValue = a[sortBy as keyof ApprovalRequest];
    let bValue = b[sortBy as keyof ApprovalRequest];
    
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

  const pendingCount = approvalRequests.filter(r => r.status === 'pending').length;
  const approvedCount = approvalRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = approvalRequests.filter(r => r.status === 'rejected').length;
  const underReviewCount = approvalRequests.filter(r => r.status === 'under_review').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <div className="w-full max-w-none px-2 sm:px-4 lg:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Hardware Approvals</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage and review hardware requests, deployments, and maintenance approvals
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Under Review</p>
                  <p className="text-2xl font-bold text-blue-600">{underReviewCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search requests..."
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
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
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
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="hardware_scoping">Hardware Scoping</SelectItem>
                      <SelectItem value="deployment">Deployment</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="upgrade">Upgrade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">
                      <Button variant="ghost" onClick={() => handleSort('siteName')} className="h-auto p-0 font-semibold">
                        Site Name
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">Type & Priority</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Requested By</TableHead>
                    <TableHead className="font-semibold text-gray-700">Cost</TableHead>
                    <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRequests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium text-gray-900">
                        <div>
                          <div className="font-semibold">{request.siteName}</div>
                          <div className="text-sm text-gray-500">{request.organization}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge className={getTypeColor(request.requestType)}>
                            {request.requestType.replace('_', ' ')}
                          </Badge>
                          <Badge className={getPriorityColor(request.priority)}>
                            {request.priority}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(request.status)}
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{request.requestedBy}</div>
                          <div className="text-gray-500">{request.requestedDate}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700">
                        £{request.estimatedCost.toLocaleString()}
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
                            <DropdownMenuItem onClick={() => handleViewDetails(request)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {request.status === 'pending' && (
                              <>
                                <DropdownMenuItem onClick={() => handleApprove(request.id)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleReject(request.id)}>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem onClick={() => handleDownloadPDF(request)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
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

        {sortedRequests.length === 0 && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No approval requests found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || filterType !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No approval requests are currently available'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Approval Request Details
            </DialogTitle>
            <DialogDescription>
              Review the complete details of this approval request
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Request Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Site Name</p>
                      <p className="text-lg font-semibold">{selectedRequest.siteName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Organization</p>
                      <p className="text-lg">{selectedRequest.organization}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Request Type</p>
                      <Badge className={getTypeColor(selectedRequest.requestType)}>
                        {selectedRequest.requestType.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Priority</p>
                      <Badge className={getPriorityColor(selectedRequest.priority)}>
                        {selectedRequest.priority}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Status</p>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(selectedRequest.status)}
                        <Badge className={getStatusColor(selectedRequest.status)}>
                          {selectedRequest.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Estimated Cost</p>
                      <p className="text-lg font-semibold text-green-600">
                        £{selectedRequest.estimatedCost.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Description</p>
                    <p className="text-gray-700">{selectedRequest.description}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Notes</p>
                    <p className="text-gray-700">{selectedRequest.notes}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Hardware Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Hardware Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Cost</TableHead>
                        <TableHead>Total Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedRequest.hardwareItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div>{item.name}</div>
                              <div className="text-sm text-gray-500">{item.specifications}</div>
                            </div>
                          </TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>£{item.unitCost.toLocaleString()}</TableCell>
                          <TableCell className="font-semibold">£{item.totalCost.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Approval Actions */}
              {selectedRequest.status === 'pending' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Approval Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      <Button 
                        onClick={() => handleApprove(selectedRequest.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Request
                      </Button>
                      <Button 
                        onClick={() => handleReject(selectedRequest.id)}
                        variant="destructive"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Request
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HardwareApprovals; 