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
  TrendingUp
} from "lucide-react";
import { UKCitySelect } from "@/components/UKCitySelect";

interface SiteStudy {
  id: string;
  siteName: string;
  location: string;
  status: 'planning' | 'in-progress' | 'review' | 'completed';
  progress: number;
  assignedTo: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  requirements: {
    hardware: string[];
    software: string[];
    network: string[];
    security: string[];
  };
  feasibility: {
    technical: boolean;
    financial: boolean;
    operational: boolean;
    timeline: boolean;
  };
  risks: string[];
  recommendations: string[];
}

const SiteStudy = () => {
  const [selectedSite, setSelectedSite] = useState<SiteStudy | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const siteStudies: SiteStudy[] = [
    {
      id: "1",
      siteName: "Manchester Central",
      location: "Manchester, UK",
      status: "in-progress",
      progress: 65,
      assignedTo: "Sarah Johnson",
      dueDate: "2024-08-15",
      priority: "high",
      description: "Large shopping center with high foot traffic. Requires comprehensive network infrastructure and multiple POS systems.",
      requirements: {
        hardware: ["POS Terminals", "Network Switches", "Security Cameras", "Digital Signage"],
        software: ["Inventory Management", "Payment Processing", "Security System", "Analytics Dashboard"],
        network: ["High-speed WiFi", "Ethernet Backbone", "VPN Access", "Redundant Connections"],
        security: ["Access Control", "CCTV System", "Data Encryption", "Backup Systems"]
      },
      feasibility: {
        technical: true,
        financial: true,
        operational: true,
        timeline: false
      },
      risks: ["Limited parking space", "Complex network requirements", "High security needs"],
      recommendations: ["Extend timeline by 2 weeks", "Add additional network capacity", "Implement phased deployment"]
    },
    {
      id: "2",
      siteName: "Birmingham Food Court",
      location: "Birmingham, UK",
      status: "planning",
      progress: 25,
      assignedTo: "Mike Thompson",
      dueDate: "2024-09-01",
      priority: "medium",
      description: "Food court environment with multiple vendors. Requires shared infrastructure and individual vendor systems.",
      requirements: {
        hardware: ["Shared POS Systems", "Kitchen Displays", "Order Management", "Payment Terminals"],
        software: ["Vendor Management", "Order Processing", "Inventory Tracking", "Customer Analytics"],
        network: ["Shared WiFi", "Vendor Networks", "Kitchen Communication", "Customer Access"],
        security: ["Vendor Access Control", "Payment Security", "Food Safety Tracking", "Customer Data Protection"]
      },
      feasibility: {
        technical: true,
        financial: true,
        operational: true,
        timeline: true
      },
      risks: ["Vendor coordination", "Shared infrastructure complexity", "Peak hour capacity"],
      recommendations: ["Create vendor onboarding plan", "Implement shared payment system", "Add capacity planning"]
    },
    {
      id: "3",
      siteName: "Leeds Shopping Center",
      location: "Leeds, UK",
      status: "completed",
      progress: 100,
      assignedTo: "Emma Wilson",
      dueDate: "2024-07-30",
      priority: "high",
      description: "Modern shopping center with integrated digital experience. Successfully deployed with advanced analytics.",
      requirements: {
        hardware: ["Interactive Kiosks", "Digital Signage", "POS Systems", "Security Infrastructure"],
        software: ["Customer Analytics", "Digital Marketing", "Inventory Management", "Security Monitoring"],
        network: ["High-speed WiFi", "IoT Network", "Digital Signage Network", "Security Network"],
        security: ["Access Control", "CCTV System", "Data Protection", "Cybersecurity"]
      },
      feasibility: {
        technical: true,
        financial: true,
        operational: true,
        timeline: true
      },
      risks: ["Complex integration", "High initial cost", "Training requirements"],
      recommendations: ["Excellent implementation", "Consider expansion", "Share best practices"]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'review': return 'bg-yellow-500';
      case 'planning': return 'bg-gray-500';
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

  const getFeasibilityIcon = (feasible: boolean) => {
    return feasible ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Site Study Management</h1>
          <p className="text-muted-foreground">Comprehensive site analysis and planning for SmartQ deployments</p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-4">
            <Button onClick={() => setIsCreating(true)} className="bg-primary hover:bg-primary-dark">
              <Building className="mr-2 h-4 w-4" />
              New Site Study
            </Button>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Export Reports
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Filter</Button>
            <Button variant="outline" size="sm">Sort</Button>
          </div>
        </div>

        {/* Site Studies Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {siteStudies.map((site) => (
            <Card 
              key={site.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedSite(site)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{site.siteName}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {site.location}
                    </CardDescription>
                  </div>
                                     <div className="flex gap-1">
                     <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(site.status)} text-white`}>
                       {site.status.replace('-', ' ')}
                     </span>
                     <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getPriorityColor(site.priority)} text-white`}>
                       {site.priority}
                     </span>
                   </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{site.progress}%</span>
                  </div>
                  <Progress value={site.progress} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Assigned to</span>
                    <span className="font-medium">{site.assignedTo}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Due date</span>
                    <span className="font-medium">{site.dueDate}</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {site.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Site Study View */}
        {selectedSite && (
          <Card className="mt-8">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{selectedSite.siteName}</CardTitle>
                  <CardDescription className="flex items-center mt-2">
                    <MapPin className="h-4 w-4 mr-2" />
                    {selectedSite.location}
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
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="requirements">Requirements</TabsTrigger>
                  <TabsTrigger value="feasibility">Feasibility</TabsTrigger>
                  <TabsTrigger value="risks">Risks</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <BarChart3 className="mr-2 h-5 w-5" />
                          Project Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span>Progress</span>
                          <span className="font-bold">{selectedSite.progress}%</span>
                        </div>
                        <Progress value={selectedSite.progress} className="h-3" />
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Status</span>
                            <div className="font-medium">{selectedSite.status}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Priority</span>
                            <div className="font-medium">{selectedSite.priority}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Assigned to</span>
                            <div className="font-medium">{selectedSite.assignedTo}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Due date</span>
                            <div className="font-medium">{selectedSite.dueDate}</div>
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
                          {selectedSite.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="requirements" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <HardDrive className="mr-2 h-5 w-5" />
                          Hardware Requirements
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {selectedSite.requirements.hardware.map((item, index) => (
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
                          <Monitor className="mr-2 h-5 w-5" />
                          Software Requirements
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {selectedSite.requirements.software.map((item, index) => (
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
                          <Wifi className="mr-2 h-5 w-5" />
                          Network Requirements
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {selectedSite.requirements.network.map((item, index) => (
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
                          <Shield className="mr-2 h-5 w-5" />
                          Security Requirements
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {selectedSite.requirements.security.map((item, index) => (
                            <li key={index} className="flex items-center text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="feasibility" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Settings className="mr-2 h-5 w-5" />
                          Technical Feasibility
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span>Technical Implementation</span>
                          {getFeasibilityIcon(selectedSite.feasibility.technical)}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <TrendingUp className="mr-2 h-5 w-5" />
                          Financial Feasibility
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span>Budget Approval</span>
                          {getFeasibilityIcon(selectedSite.feasibility.financial)}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Users className="mr-2 h-5 w-5" />
                          Operational Feasibility
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span>Operational Readiness</span>
                          {getFeasibilityIcon(selectedSite.feasibility.operational)}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Calendar className="mr-2 h-5 w-5" />
                          Timeline Feasibility
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span>Schedule Realistic</span>
                          {getFeasibilityIcon(selectedSite.feasibility.timeline)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="risks" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <AlertTriangle className="mr-2 h-5 w-5" />
                        Identified Risks
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {selectedSite.risks.map((risk, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <AlertTriangle className="h-4 w-4 text-orange-500 mr-2 mt-0.5" />
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="recommendations" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Target className="mr-2 h-5 w-5" />
                        Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {selectedSite.recommendations.map((recommendation, index) => (
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

        {/* Create New Site Study Modal */}
        {isCreating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4">
              <CardHeader>
                <CardTitle>Create New Site Study</CardTitle>
                <CardDescription>Add a new site for analysis and planning</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input id="siteName" placeholder="Enter site name" />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <UKCitySelect 
                      value="" 
                      onValueChange={(value) => console.log('Selected city:', value)}
                      placeholder="Select a UK city"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Describe the site and requirements" />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assignedTo">Assigned To</Label>
                    <Input id="assignedTo" placeholder="Enter assignee name" />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input id="dueDate" type="date" />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <select id="priority" className="w-full p-2 border rounded">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select id="status" className="w-full p-2 border rounded">
                      <option value="planning">Planning</option>
                      <option value="in-progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsCreating(false)}>
                    Create Site Study
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default SiteStudy; 