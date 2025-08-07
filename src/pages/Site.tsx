import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/roles';
import { useSiteContext, type Site } from '@/contexts/SiteContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Pause,
  Settings,
  Info,
  BarChart3,
  Wrench,
  Shield,
  ArrowLeft,
  ChevronRight,
  Home,
  User,
  Phone,
  Mail,
  Globe,
  Wifi,
  Zap,
  Monitor,
  Printer,
  Smartphone,
  Tv,
  Camera,
  Navigation
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
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

const SiteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { currentRole } = useAuth();
  const navigate = useNavigate();
  const { sites, setSites, setSelectedSite } = useSiteContext();
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user has permission to access sites
  useEffect(() => {
    if (currentRole && !hasPermission(currentRole, 'view_sites')) {
      toast.error('You do not have permission to access the Sites panel');
      navigate('/dashboard');
    }
  }, [currentRole, navigate]);

  // Load site data
  useEffect(() => {
    if (id) {
      // First try to get site from context
      const existingSite = sites.find(s => s.id === id);
      
      if (existingSite) {
        setSite(existingSite);
        setLoading(false);
      } else {
        // If not found in context, load from mock data (in real app, this would be an API call)
        const mockSite: Site = {
          id: id,
          name: `Site ${id}`, // This will be overridden by actual data
          organization: 'ASDA',
          foodCourt: 'ASDA Redditch',
          unitCode: 'AR004',
          goLiveDate: '2024-11-15',
          priority: 'high',
          riskLevel: 'medium',
          status: 'hardware_scoped',
          assignedOpsManager: 'Jessica Cleaver',
          assignedDeploymentEngineer: 'John Smith',
          stakeholders: [
            { name: 'Sarah Johnson', role: 'Operations Manager', email: 'sarah.johnson@asda.com', phone: '+44 7700 900123' },
            { name: 'Mike Wilson', role: 'IT Manager', email: 'mike.wilson@asda.com', phone: '+44 7700 900456' }
          ],
          notes: 'Full POS and Kiosk implementation for ASDA Redditch location',
          lastUpdated: '2024-07-30',
          description: 'Full POS and Kiosk implementation for ASDA Redditch location'
        };
        
        // Try to find site in mock data based on ID
        const mockSites = [
          {
            id: '1',
            name: 'London Central',
            organization: 'Compass Group UK',
            foodCourt: 'London Central',
            unitCode: 'LC001',
            goLiveDate: '2024-01-15',
            priority: 'high' as const,
            riskLevel: 'medium' as const,
            status: 'go_live' as const,
            assignedOpsManager: 'John Smith',
            assignedDeploymentEngineer: 'Mike Johnson',
            stakeholders: [],
            notes: 'London Central site implementation',
            description: 'London Central site implementation',
            lastUpdated: '2024-01-15'
          },
          {
            id: '2',
            name: 'Manchester North',
            organization: 'Compass Group UK',
            foodCourt: 'Manchester North',
            unitCode: 'MN002',
            goLiveDate: '2024-01-20',
            priority: 'medium' as const,
            riskLevel: 'low' as const,
            status: 'deployment' as const,
            assignedOpsManager: 'Sarah Wilson',
            assignedDeploymentEngineer: 'David Brown',
            stakeholders: [],
            notes: 'Manchester North site implementation',
            description: 'Manchester North site implementation',
            lastUpdated: '2024-01-18'
          },
          {
            id: '3',
            name: 'Birmingham South',
            organization: 'Compass Group UK',
            foodCourt: 'Birmingham South',
            unitCode: 'BS003',
            goLiveDate: '2024-01-25',
            priority: 'high' as const,
            riskLevel: 'medium' as const,
            status: 'approved' as const,
            assignedOpsManager: 'Emma Davis',
            assignedDeploymentEngineer: 'Tom Wilson',
            stakeholders: [],
            notes: 'Birmingham South site implementation',
            description: 'Birmingham South site implementation',
            lastUpdated: '2024-01-19'
          }
        ];
        
        const foundSite = mockSites.find(s => s.id === id);
        if (foundSite) {
          setSite(foundSite);
        } else {
          setSite(mockSite);
        }
        setLoading(false);
      }
    }
  }, [id, sites]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Site Not Found</h1>
          <p className="text-gray-600 mb-4">The requested site could not be found.</p>
          <Button onClick={() => navigate('/sites')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sites
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'in_study':
        return 'bg-blue-100 text-blue-800';
      case 'hardware_scoped':
        return 'bg-purple-100 text-purple-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'live':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-4 w-4" />;
      case 'in_study':
        return <Clock className="h-4 w-4" />;
      case 'hardware_scoped':
        return <Settings className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'live':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/sites" className="flex items-center space-x-1 hover:text-gray-900">
          <Home className="h-4 w-4" />
          <span>Sites</span>
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">{site.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{site.name}</h1>
          <p className="text-gray-600 mt-1">
            {site.organization} • {site.foodCourt} ({site.unitCode})
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/sites')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Sites</span>
          </Button>
          <Button variant="gradient" className="flex items-center space-x-2">
            <Edit className="h-4 w-4" />
            <span>Edit Site</span>
          </Button>
        </div>
      </div>

      {/* Site Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-full ${getStatusColor(site.status)}`}>
                {getStatusIcon(site.status)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className="text-lg font-semibold">{site.status.replace('_', ' ').toUpperCase()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Go Live Date</p>
                <p className="text-lg font-semibold">{new Date(site.goLiveDate).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Ops Manager</p>
                <p className="text-lg font-semibold">{site.assignedOpsManager}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wrench className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Deployment Engineer</p>
                <p className="text-lg font-semibold">{site.assignedDeploymentEngineer}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Site Detail Navigation */}
      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info" className="flex items-center space-x-2">
            <Info className="h-4 w-4" />
            <span>Site Info</span>
          </TabsTrigger>
          <TabsTrigger value="study" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Study Status</span>
          </TabsTrigger>
          <TabsTrigger value="activation" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Activation Status</span>
          </TabsTrigger>
          <TabsTrigger value="stakeholders" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Stakeholders</span>
          </TabsTrigger>
        </TabsList>

        {/* Site Info Tab */}
        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Information</CardTitle>
              <CardDescription>
                Basic information about the site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">General Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Organization:</span>
                      <span className="font-medium">{site.organization}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Food Court:</span>
                      <span className="font-medium">{site.foodCourt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unit Code:</span>
                      <span className="font-medium">{site.unitCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Go Live Date:</span>
                      <span className="font-medium">{new Date(site.goLiveDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Status & Priority</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge className={getStatusColor(site.status)}>
                        {site.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priority:</span>
                      <Badge className={getPriorityColor(site.priority)}>
                        {site.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Risk Level:</span>
                      <Badge variant="outline">{site.riskLevel.toUpperCase()}</Badge>
                    </div>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4">Description</h3>
                <p className="text-gray-700">{site.description}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Study Status Tab */}
        <TabsContent value="study" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Study Status</CardTitle>
              <CardDescription>
                Track the progress of site studies and assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {site.status === 'in_study' || site.status === 'draft' ? (
                <div className="space-y-6">
                  {/* Study Progress Stepper */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Study Progress</h3>
                    <div className="space-y-4">
                      {/* Step 1: General Information */}
                      <div className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">General Information</h4>
                          <p className="text-sm text-gray-600">Basic site details and contact information</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>

                      {/* Step 2: Location & Infrastructure */}
                      <div className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">Location & Infrastructure</h4>
                          <p className="text-sm text-gray-600">Site location, floor plan, and infrastructure details</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>

                      {/* Step 3: Hardware Requirements */}
                      <div className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <Package className="h-4 w-4 text-gray-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">Hardware Requirements</h4>
                          <p className="text-sm text-gray-600">Define hardware needs and specifications</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>

                      {/* Step 4: Network & Power */}
                      <div className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <Wifi className="h-4 w-4 text-gray-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">Network & Power Requirements</h4>
                          <p className="text-sm text-gray-600">Network connectivity and power specifications</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>

                      {/* Step 5: Review & Submit */}
                      <div className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <FileText className="h-4 w-4 text-gray-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">Review & Submit</h4>
                          <p className="text-sm text-gray-600">Review all information and submit study</p>
                        </div>
                        <Button variant="outline" size="sm" disabled>
                          <FileText className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Study
                    </Button>
                    <Button 
                      variant="gradient"
                      onClick={() => navigate(`/sites/${id}/study`)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Continue Study
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Site Study Management</h3>
                  <p className="text-gray-600 mb-4">
                    {site.status === 'hardware_scoped' || site.status === 'live' 
                      ? 'Site study has been completed. View the study details below.'
                      : 'Site study is not yet started or in progress.'
                    }
                  </p>
                  <Button 
                    onClick={() => navigate(`/sites/${id}/study`)}
                    className="flex items-center space-x-2 mx-auto"
                  >
                    <FileText className="h-4 w-4" />
                    <span>View Study Details</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activation Status Tab */}
        <TabsContent value="activation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activation Status</CardTitle>
              <CardDescription>
                Track the activation progress and deployment status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Deployment Progress</span>
                  <span className="text-sm text-gray-600">75%</span>
                </div>
                <Progress value={75} className="w-full" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-sm font-medium">Hardware Scoped</p>
                  </div>
                  <div className="text-center">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium">In Progress</p>
                  </div>
                  <div className="text-center">
                    <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <AlertTriangle className="h-4 w-4 text-gray-600" />
                    </div>
                    <p className="text-sm font-medium">Pending</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stakeholders Tab */}
        <TabsContent value="stakeholders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stakeholders</CardTitle>
              <CardDescription>
                Key contacts and stakeholders for this site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {site.stakeholders.map((stakeholder, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{stakeholder.name}</p>
                        <p className="text-sm text-gray-600">{stakeholder.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SiteDetail; 