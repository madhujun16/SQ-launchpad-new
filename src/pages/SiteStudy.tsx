import React, { useState } from 'react';
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building, 
  MapPin, 
  Users, 
  Calendar,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  Target,
  BarChart3,
  Settings,
  Wifi,
  HardDrive,
  Monitor,
  Server,
  Database,
  Globe,
  Shield,
  Activity,
  TrendingUp,
  Navigation
} from "lucide-react";
import { UKCitySelect } from "@/components/UKCitySelect";
import { useAuth } from "@/hooks/useAuth";
import { getRoleConfig, hasPermission } from "@/lib/roles";
import { useNavigate } from "react-router-dom";
import RoleIndicator from "@/components/RoleIndicator";
import { toast } from "sonner";
import { Site, getStatusColor, getStatusDisplayName } from "@/lib/siteTypes";

interface SiteStudyData {
  id: string;
  siteId: string;
  siteName: string;
  location: {
    address: string;
    city: string;
    postcode: string;
    latitude?: number;
    longitude?: number;
  };
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  findings: {
    infrastructure: string[];
    requirements: string[];
    challenges: string[];
    recommendations: string[];
  };
  geolocation?: {
    latitude: number;
    longitude: number;
    addedBy: string;
    addedAt: string;
  };
}

const SiteStudy = () => {
  const { currentRole } = useAuth();
  const navigate = useNavigate();
  const [selectedStudy, setSelectedStudy] = useState<SiteStudyData | null>(null);
  const [isAddingGeolocation, setIsAddingGeolocation] = useState(false);
  const [geolocationData, setGeolocationData] = useState({
    latitude: '',
    longitude: ''
  });

  // Check if user has access to site study
  React.useEffect(() => {
    if (currentRole && !hasPermission(currentRole, 'conduct_site_studies') && !hasPermission(currentRole, 'create_sites')) {
      toast.error('You do not have permission to access the Site Study panel');
      navigate('/dashboard');
    }
  }, [currentRole, navigate]);

  const siteStudies: SiteStudyData[] = [
    {
      id: "1",
      siteId: "1",
      siteName: "Manchester Central Cafeteria",
      location: {
        address: "123 Main Street",
        city: "Manchester",
        postcode: "M1 1AA"
      },
      status: "completed",
      assignedTo: "Sarah Johnson",
      dueDate: "2024-08-15",
      priority: "high",
      description: "Large cafeteria with high foot traffic. Requires comprehensive network infrastructure and multiple POS systems.",
      findings: {
        infrastructure: ["Existing WiFi network", "POS terminals", "Kitchen equipment", "Seating area"],
        requirements: ["High-speed WiFi upgrade", "Additional POS terminals", "Digital signage", "Security cameras"],
        challenges: ["Limited parking space", "Complex network requirements", "High security needs"],
        recommendations: ["Extend timeline by 2 weeks", "Add additional network capacity", "Implement phased deployment"]
      },
      geolocation: {
        latitude: 53.4808,
        longitude: -2.2426,
        addedBy: "Sarah Johnson",
        addedAt: "2024-07-15"
      }
    },
    {
      id: "2",
      siteId: "2",
      siteName: "Birmingham Office Cafeteria",
      location: {
        address: "456 Business Park",
        city: "Birmingham",
        postcode: "B1 1BB"
      },
      status: "in-progress",
      assignedTo: "Mike Thompson",
      dueDate: "2024-09-01",
      priority: "medium",
      description: "Office cafeteria environment with staff dining requirements.",
      findings: {
        infrastructure: ["Basic kitchen setup", "Limited seating", "No existing POS"],
        requirements: ["Complete POS system", "Kitchen equipment", "Seating expansion"],
        challenges: ["Space constraints", "Budget limitations"],
        recommendations: ["Phased implementation", "Space optimization"]
      }
    }
  ];

  // If user doesn't have site study permissions, show access denied
  if (currentRole && !hasPermission(currentRole, 'conduct_site_studies') && !hasPermission(currentRole, 'create_sites')) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
            <p className="text-muted-foreground">
              You do not have permission to access the Site Study panel.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const roleConfig = currentRole ? getRoleConfig(currentRole) : null;
  const isDeploymentEngineer = currentRole === 'deployment_engineer';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'pending': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const addGeolocation = async (studyId: string) => {
    if (!geolocationData.latitude || !geolocationData.longitude) {
      toast.error('Please enter both latitude and longitude');
      return;
    }

    try {
      // This would be replaced with actual Supabase update
      const updatedStudies = siteStudies.map(study => {
        if (study.id === studyId) {
          return {
            ...study,
            geolocation: {
              latitude: parseFloat(geolocationData.latitude),
              longitude: parseFloat(geolocationData.longitude),
              addedBy: "Current User",
              addedAt: new Date().toISOString()
            }
          };
        }
        return study;
      });

      toast.success('Geolocation added successfully');
      setIsAddingGeolocation(false);
      setGeolocationData({ latitude: '', longitude: '' });
    } catch (error) {
      toast.error('Failed to add geolocation');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">Site Study Management</h1>
            <RoleIndicator />
          </div>
          <p className="text-muted-foreground">
            {roleConfig?.description || 'Conduct site studies for Compass Group cafeteria deployments'}
          </p>
        </div>

        {/* Site Studies Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {siteStudies.map((study) => (
            <Card 
              key={study.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedStudy(study)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{study.siteName}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {study.location.city}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(study.status)} text-white`}>
                      {study.status.replace('-', ' ')}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getPriorityColor(study.priority)} text-white`}>
                      {study.priority}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Assigned to</span>
                    <span className="font-medium">{study.assignedTo}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Due date</span>
                    <span className="font-medium">{study.dueDate}</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {study.description}
                  </p>

                  {isDeploymentEngineer && !study.geolocation && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStudy(study);
                        setIsAddingGeolocation(true);
                      }}
                    >
                      <Navigation className="mr-1 h-3 w-3" />
                      Add Geolocation
                    </Button>
                  )}

                  {study.geolocation && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Navigation className="mr-1 h-3 w-3" />
                      Location: {study.geolocation.latitude.toFixed(4)}, {study.geolocation.longitude.toFixed(4)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Site Study View */}
        {selectedStudy && (
          <Card className="mt-8">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{selectedStudy.siteName}</CardTitle>
                  <CardDescription className="flex items-center mt-2">
                    <MapPin className="h-4 w-4 mr-2" />
                    {selectedStudy.location.address}, {selectedStudy.location.city}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="outline" size="sm">Export</Button>
                  <Button variant="outline" size="sm">Share</Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="findings">Findings</TabsTrigger>
                  <TabsTrigger value="geolocation">Location</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <BarChart3 className="mr-2 h-5 w-5" />
                          Study Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span>Status</span>
                          <Badge className={getStatusColor(selectedStudy.status)}>
                            {selectedStudy.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Priority</span>
                            <div className="font-medium">{selectedStudy.priority}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Assigned to</span>
                            <div className="font-medium">{selectedStudy.assignedTo}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Due date</span>
                            <div className="font-medium">{selectedStudy.dueDate}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Client</span>
                            <div className="font-medium">Compass Group</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <FileText className="mr-2 h-5 w-5" />
                          Description
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {selectedStudy.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="findings" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <HardDrive className="mr-2 h-5 w-5" />
                          Current Infrastructure
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {selectedStudy.findings.infrastructure.map((item, index) => (
                            <li key={index} className="flex items-center text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Target className="mr-2 h-5 w-5" />
                          Requirements
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {selectedStudy.findings.requirements.map((item, index) => (
                            <li key={index} className="flex items-center text-sm">
                              <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="geolocation" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Navigation className="mr-2 h-5 w-5" />
                        Site Location
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedStudy.geolocation ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Latitude</Label>
                              <div className="font-mono text-sm">{selectedStudy.geolocation.latitude}</div>
                            </div>
                            <div>
                              <Label>Longitude</Label>
                              <div className="font-mono text-sm">{selectedStudy.geolocation.longitude}</div>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Added by {selectedStudy.geolocation.addedBy} on {new Date(selectedStudy.geolocation.addedAt).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            No geolocation data available for this site.
                          </p>
                          {isDeploymentEngineer && (
                            <Button onClick={() => setIsAddingGeolocation(true)}>
                              <Navigation className="mr-2 h-4 w-4" />
                              Add Geolocation
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="recommendations" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <AlertTriangle className="mr-2 h-5 w-5" />
                        Challenges
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {selectedStudy.findings.challenges.map((challenge, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <AlertTriangle className="h-4 w-4 text-orange-500 mr-2 mt-0.5" />
                            {challenge}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Target className="mr-2 h-5 w-5" />
                        Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {selectedStudy.findings.recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                            {recommendation}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Add Geolocation Modal */}
        {isAddingGeolocation && selectedStudy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Add Geolocation</CardTitle>
                <CardDescription>
                  Add precise location coordinates for {selectedStudy.siteName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  addGeolocation(selectedStudy.id);
                }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={geolocationData.latitude}
                        onChange={(e) => setGeolocationData(prev => ({ ...prev, latitude: e.target.value }))}
                        placeholder="e.g., 53.4808"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={geolocationData.longitude}
                        onChange={(e) => setGeolocationData(prev => ({ ...prev, longitude: e.target.value }))}
                        placeholder="e.g., -2.2426"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddingGeolocation(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Add Location
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default SiteStudy; 