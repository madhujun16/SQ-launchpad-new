import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Building,
  Users,
  BarChart3,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { AccessDenied } from '@/components/AccessDenied';
import { ContentLoader } from '@/components/ui/loader';
import { getRoleConfig } from '@/lib/roles';

interface ForecastData {
  id: string;
  siteName: string;
  status: 'Created' | 'site_study_done' | 'scoping_done' | 'approved' | 'procurement_done' | 'deployed' | 'live' | 'archived';
  startDate: string;
  targetDate: string;
  actualStartDate?: string;
  completionDate?: string;
  progress: number;
  estimatedCost: number;
  actualCost?: number;
  assignedTeam: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  riskLevel: 'low' | 'medium' | 'high';
  notes?: string;
}

interface FinancialForecast {
  month: string;
  hardwareCosts: number;
  softwareCosts: number;
  avgMonthlyCostPerSite: number;
  costVariancePercentage: number;
}

const Forecast: React.FC = () => {
  const { currentRole, profile } = useAuth();
  const { getTabAccess } = useRoleAccess();
  const roleConfig = getRoleConfig(currentRole || 'admin');
  
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [financialData, setFinancialData] = useState<FinancialForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'timeline' | 'financial' | 'summary'>('summary');
  const [showTeamDetailsModal, setShowTeamDetailsModal] = useState(false);

  // Mock deployment team data
  const deploymentTeam = [
    { id: '1', name: 'Sarah Johnson', role: 'Team Lead', projects: 2, status: 'Live' },
    { id: '2', name: 'Emma Wilson', role: 'Deployment Engineer', projects: 2, status: 'Deployed' },
    { id: '3', name: 'David Brown', role: 'Deployment Engineer', projects: 1, status: 'Procurement Done' },
    { id: '4', name: 'Mike Thompson', role: 'Deployment Engineer', projects: 1, status: 'Approved' },
    { id: '5', name: 'Lisa Chen', role: 'Deployment Engineer', projects: 0, status: 'Available' },
    { id: '6', name: 'James Wilson', role: 'Deployment Engineer', projects: 0, status: 'Available' },
    { id: '7', name: 'Alex Rodriguez', role: 'Deployment Engineer', projects: 0, status: 'Available' },
    { id: '8', name: 'Maria Garcia', role: 'Deployment Engineer', projects: 0, status: 'Available' },
    { id: '9', name: 'Tom Anderson', role: 'Deployment Engineer', projects: 0, status: 'Available' },
    { id: '10', name: 'Rachel Green', role: 'Deployment Engineer', projects: 0, status: 'Available' }
  ];

  const visibleTeamMembers = deploymentTeam.slice(0, 7);

  // Check access permissions
  const tabAccess = getTabAccess('/forecast');
  
  if (!tabAccess.canAccess) {
    return (
      <AccessDenied 
        pageName="Forecast"
        customMessage="You don't have permission to access the Forecast page."
      />
    );
  }

  // Mock data
  useEffect(() => {
    if (!currentRole || !profile) {
      return;
    }
    
    const mockForecastData: ForecastData[] = [
      {
        id: '1',
        siteName: 'London Central',
        status: 'live',
        startDate: '2025-09-01',
        targetDate: '2025-09-15',
        actualStartDate: '2025-09-01',
        completionDate: '2025-09-12',
        progress: 100,
        estimatedCost: 25000,
        actualCost: 24500,
        assignedTeam: 'Team Alpha',
        priority: 'high',
        riskLevel: 'low',
        notes: 'Successfully completed ahead of schedule'
      },
      {
        id: '2',
        siteName: 'Manchester North',
        status: 'deployed',
        startDate: '2025-09-05',
        targetDate: '2025-09-25',
        actualStartDate: '2025-09-05',
        progress: 85,
        estimatedCost: 18000,
        actualCost: 13500,
        assignedTeam: 'Team Beta',
        priority: 'medium',
        riskLevel: 'medium',
        notes: 'System testing phase - on track'
      },
      {
        id: '3',
        siteName: 'Birmingham South',
        status: 'procurement_done',
        startDate: '2025-09-10',
        targetDate: '2025-10-05',
        actualStartDate: '2025-09-10',
        progress: 70,
        estimatedCost: 22000,
        actualCost: 9900,
        assignedTeam: 'Team Gamma',
        priority: 'high',
        riskLevel: 'medium',
        notes: 'Hardware installation in progress'
      },
      {
        id: '4',
        siteName: 'Leeds Central',
        status: 'approved',
        startDate: '2025-10-01',
        targetDate: '2025-10-20',
        progress: 60,
        estimatedCost: 15000,
        assignedTeam: 'Team Delta',
        priority: 'medium',
        riskLevel: 'low',
        notes: 'Planning phase - requirements gathering'
      },
      {
        id: '5',
        siteName: 'Liverpool East',
        status: 'scoping_done',
        startDate: '2025-10-15',
        targetDate: '2025-11-05',
        progress: 40,
        estimatedCost: 20000,
        assignedTeam: 'Team Alpha',
        priority: 'low',
        riskLevel: 'low',
        notes: 'Initial planning stage'
      },
      {
        id: '6',
        siteName: 'Cardiff Business Park',
        status: 'site_study_done',
        startDate: '2025-11-01',
        targetDate: '2025-11-25',
        progress: 20,
        estimatedCost: 28000,
        assignedTeam: 'Team Beta',
        priority: 'medium',
        riskLevel: 'high',
        notes: 'Complex site requirements'
      }
    ];

    const mockFinancialData: FinancialForecast[] = [
      {
        month: 'September 2025',
        hardwareCosts: 25000,
        softwareCosts: 8000,
        avgMonthlyCostPerSite: 5500,
        costVariancePercentage: 15.2
      },
      {
        month: 'October 2025',
        hardwareCosts: 30000,
        softwareCosts: 10000,
        avgMonthlyCostPerSite: 5800,
        costVariancePercentage: 8.5
      },
      {
        month: 'November 2025',
        hardwareCosts: 35000,
        softwareCosts: 12000,
        avgMonthlyCostPerSite: 6200,
        costVariancePercentage: 22.1
      },
      {
        month: 'December 2025',
        hardwareCosts: 40000,
        softwareCosts: 15000,
        avgMonthlyCostPerSite: 6500,
        costVariancePercentage: 18.7
      }
    ];

    setForecastData(mockForecastData);
    setFinancialData(mockFinancialData);
    setLoading(false);
  }, [currentRole, profile]);

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'live': return 'Live';
      case 'archived': return 'Archived';
      case 'deployed': return 'Deployed';
      case 'procurement_done': return 'Procurement Done';
      case 'approved': return 'Approved';
      case 'scoping_done': return 'Scoping Done';
      case 'site_study_done': return 'Site Study Done';
      case 'Created': return 'Created';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      case 'deployed': return 'bg-blue-100 text-blue-800';
      case 'procurement_done': return 'bg-purple-100 text-purple-800';
      case 'approved': return 'bg-orange-100 text-orange-800';
      case 'scoping_done': return 'bg-yellow-100 text-yellow-800';
      case 'site_study_done': return 'bg-indigo-100 text-indigo-800';
      case 'Created': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const total = forecastData.length;
    const completed = forecastData.filter(item => item.status === 'live').length;
    const inProgress = forecastData.filter(item => item.status === 'deployed' || item.status === 'procurement_done').length;
    const planning = forecastData.filter(item => item.status === 'Created' || item.status === 'site_study_done' || item.status === 'scoping_done' || item.status === 'approved').length;
    const totalEstimatedCost = forecastData.reduce((sum, item) => sum + item.estimatedCost, 0);
    const totalActualCost = forecastData.reduce((sum, item) => sum + (item.actualCost || 0), 0);
    const onTrack = forecastData.filter(item => {
      if (item.status === 'Created' || item.status === 'site_study_done' || item.status === 'scoping_done' || item.status === 'approved') return true;
      if (item.status === 'live') return true;
      return item.progress >= 50;
    }).length;

    return {
      total,
      completed,
      inProgress,
      planning,
      totalEstimatedCost,
      totalActualCost,
      onTrack,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      onTrackRate: total > 0 ? Math.round((onTrack / total) * 100) : 0
    };
  }, [forecastData]);

  if (loading) {
    return <ContentLoader />;
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Forecast Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Project timeline, financial forecasting, and performance insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <roleConfig.icon className="h-3 w-3" />
            <span>{roleConfig.displayName}</span>
          </Badge>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{summaryMetrics.completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">On Track</p>
                <p className="text-2xl font-bold text-gray-900">{summaryMetrics.onTrackRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">£{summaryMetrics.totalEstimatedCost.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{summaryMetrics.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-white p-1 rounded-lg border">
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'timeline'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Calendar className="h-4 w-4 mr-2 inline" />
            Timeline View
          </button>
          <button
            onClick={() => setViewMode('financial')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'financial'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <DollarSign className="h-4 w-4 mr-2 inline" />
            Financial Forecast
          </button>
          <button
            onClick={() => setViewMode('summary')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'summary'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="h-4 w-4 mr-2 inline" />
            Summary
          </button>
        </div>
      </div>

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Project Timeline (Next 3 Months)</span>
              </CardTitle>
              <CardDescription>
                Gantt chart view of all projects and their progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {forecastData.map((project) => (
                  <div key={project.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium">{project.siteName}</h3>
                        <Badge className={`${getStatusColor(project.status)} text-base font-semibold px-3 py-1`}>
                          {getStatusDisplayName(project.status)}
                        </Badge>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(project.priority)}>
                            {project.priority}
                          </Badge>
                          <Badge className={getRiskColor(project.riskLevel)}>
                            {project.riskLevel} risk
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {project.progress}% Complete
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Start:</span>
                        <span className="ml-2 font-medium">{new Date(project.startDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Target:</span>
                        <span className="ml-2 font-medium">{new Date(project.targetDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Team:</span>
                        <span className="ml-2 font-medium">{project.assignedTeam}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Budget:</span>
                        <span className="ml-2 font-medium">£{project.estimatedCost.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    {project.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-gray-600">{project.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

             {/* Financial Forecast View */}
       {viewMode === 'financial' && (
         <div className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center space-x-2">
                 <DollarSign className="h-5 w-5" />
                 <span>Monthly Cost Insights</span>
               </CardTitle>
               <CardDescription>
                 Hardware, software costs and cost variance analysis
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 {financialData.map((month) => (
                   <div key={month.month} className="border rounded-lg p-4">
                     <h3 className="font-medium mb-3">{month.month}</h3>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                       <div>
                         <div className="text-sm text-gray-600">Hardware Costs</div>
                         <div className="text-lg font-semibold text-blue-600">
                           £{month.hardwareCosts.toLocaleString()}
                         </div>
                       </div>
                       <div>
                         <div className="text-sm text-gray-600">Software Costs</div>
                         <div className="text-lg font-semibold text-purple-600">
                           £{month.softwareCosts.toLocaleString()}
                         </div>
                       </div>
                       <div>
                         <div className="text-sm text-gray-600">Cost Variance</div>
                         <div className={`text-lg font-semibold ${month.costVariancePercentage > 0 ? 'text-red-600' : 'text-green-600'}`}>
                           {month.costVariancePercentage > 0 ? '+' : ''}{month.costVariancePercentage}%
                         </div>
                         <div className="text-xs text-gray-500">
                           vs Avg: £{month.avgMonthlyCostPerSite.toLocaleString()}
                         </div>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
         </div>
       )}

      {/* Summary View */}
      {viewMode === 'summary' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Project Status Breakdown</span>
                </CardTitle>
              </CardHeader>
                             <CardContent>
                 <div className="space-y-3">
                                       {/* Live Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Live</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${(summaryMetrics.completed / summaryMetrics.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{summaryMetrics.completed}</span>
                      </div>
                    </div>
                   
                   {/* Deployed/Procurement Status */}
                   <div className="flex items-center justify-between">
                     <span className="text-sm">Deployed/Procurement</span>
                     <div className="flex items-center space-x-2">
                       <div className="w-16 bg-gray-200 rounded-full h-2">
                         <div 
                           className="bg-orange-600 h-2 rounded-full"
                           style={{ width: `${(summaryMetrics.inProgress / summaryMetrics.total) * 100}%` }}
                         />
                       </div>
                       <span className="text-sm font-medium">{summaryMetrics.inProgress}</span>
                     </div>
                   </div>
                   
                   {/* Planning Status (Created, Site Study, Scoping, Approved) */}
                   <div className="flex items-center justify-between">
                     <span className="text-sm">Planning Phase</span>
                     <div className="flex items-center space-x-2">
                       <div className="w-16 bg-gray-200 rounded-full h-2">
                         <div 
                           className="bg-gray-600 h-2 rounded-full"
                           style={{ width: `${(summaryMetrics.planning / summaryMetrics.total) * 100}%` }}
                         />
                       </div>
                       <span className="text-sm font-medium">{summaryMetrics.planning}</span>
                     </div>
                   </div>
                   
                   {/* Detailed Status Breakdown */}
                   <div className="mt-4 pt-4 border-t">
                     <div className="text-xs text-gray-500 mb-2">Detailed Breakdown:</div>
                     <div className="space-y-1 text-xs">
                       <div className="flex justify-between">
                         <span>Created:</span>
                         <span>{forecastData.filter(item => item.status === 'Created').length}</span>
                       </div>
                       <div className="flex justify-between">
                         <span>Site Study Done:</span>
                         <span>{forecastData.filter(item => item.status === 'site_study_done').length}</span>
                       </div>
                       <div className="flex justify-between">
                         <span>Scoping Done:</span>
                         <span>{forecastData.filter(item => item.status === 'scoping_done').length}</span>
                       </div>
                       <div className="flex justify-between">
                         <span>Approved:</span>
                         <span>{forecastData.filter(item => item.status === 'approved').length}</span>
                       </div>
                       <div className="flex justify-between">
                         <span>Procurement Done:</span>
                         <span>{forecastData.filter(item => item.status === 'procurement_done').length}</span>
                       </div>
                       <div className="flex justify-between">
                         <span>Deployed:</span>
                         <span>{forecastData.filter(item => item.status === 'deployed').length}</span>
                       </div>
                       <div className="flex justify-between">
                         <span>Live:</span>
                         <span>{forecastData.filter(item => item.status === 'live').length}</span>
                       </div>
                     </div>
                   </div>
                 </div>
               </CardContent>
            </Card>

                         <Card>
               <CardHeader>
                 <CardTitle className="flex items-center space-x-2">
                   <Users className="h-5 w-5" />
                   <span>Deployment Team</span>
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="space-y-3">
                   {visibleTeamMembers.map((member) => (
                     <div key={member.id} className="flex items-center justify-between">
                       <div className="flex items-center space-x-3">
                         <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                           {member.name.split(' ').map(n => n[0]).join('')}
                         </div>
                         <div>
                           <div className="text-sm font-medium">{member.name}</div>
                           <div className="text-xs text-gray-500">{member.role}</div>
                         </div>
                       </div>
                       <div className="flex items-center space-x-2">
                         <span className="text-sm font-medium">{member.projects} Projects</span>
                         <Badge className={getStatusColor(member.status.toLowerCase())}>
                           {member.status}
                         </Badge>
                       </div>
                     </div>
                   ))}
                   {deploymentTeam.length > 7 && (
                     <div className="pt-3 border-t">
                       <Button 
                         variant="outline" 
                         size="sm" 
                         onClick={() => setShowTeamDetailsModal(true)}
                         className="w-full"
                       >
                         View All {deploymentTeam.length} Team Members
                       </Button>
                     </div>
                   )}
                 </div>
               </CardContent>
             </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Risk Assessment</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <div className="font-medium text-red-800">Cardiff Business Park</div>
                    <div className="text-sm text-red-600">High risk due to complex requirements</div>
                  </div>
                  <Badge className="bg-red-100 text-red-800">High Risk</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <div className="font-medium text-orange-800">Birmingham South</div>
                    <div className="text-sm text-orange-600">Medium risk - hardware delays possible</div>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">Medium Risk</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium text-green-800">All Other Projects</div>
                    <div className="text-sm text-green-600">Low risk - proceeding as planned</div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Low Risk</Badge>
                </div>
              </div>
            </CardContent>
                     </Card>
         </div>
       )}

       {/* Team Details Modal */}
       <Dialog open={showTeamDetailsModal} onOpenChange={setShowTeamDetailsModal}>
         <DialogContent className="sm:max-w-[600px]">
           <DialogHeader>
             <DialogTitle>Deployment Team Details</DialogTitle>
             <DialogDescription>
               Complete list of all deployment team members and their current status
             </DialogDescription>
           </DialogHeader>
           <div className="space-y-3 max-h-96 overflow-y-auto">
             {deploymentTeam.map((member) => (
               <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                 <div className="flex items-center space-x-3">
                   <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                     {member.name.split(' ').map(n => n[0]).join('')}
                   </div>
                   <div>
                     <div className="font-medium">{member.name}</div>
                     <div className="text-sm text-gray-500">{member.role}</div>
                   </div>
                 </div>
                 <div className="flex items-center space-x-2">
                   <span className="text-sm font-medium">{member.projects} Projects</span>
                   <Badge className={getStatusColor(member.status.toLowerCase())}>
                     {member.status}
                   </Badge>
                 </div>
               </div>
             ))}
           </div>
         </DialogContent>
       </Dialog>
     </div>
   );
 };

export default Forecast;


