import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatDateTime } from '@/lib/dateUtils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
import { TimelineGanttView } from '@/components/forecast/TimelineGanttView';

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
  projectsCount?: number;
  statusBreakdown?: string;
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
    { id: '1', name: 'Sarah Johnson', role: 'Team Lead', projects: 3, status: 'Live' },
    { id: '2', name: 'Emma Wilson', role: 'Deployment Engineer', projects: 3, status: 'Deployed' },
    { id: '3', name: 'David Brown', role: 'Deployment Engineer', projects: 2, status: 'Procurement Done' },
    { id: '4', name: 'Mike Thompson', role: 'Deployment Engineer', projects: 2, status: 'Approved' },
    { id: '5', name: 'Lisa Chen', role: 'Deployment Engineer', projects: 2, status: 'Scoping Done' },
    { id: '6', name: 'James Wilson', role: 'Deployment Engineer', projects: 2, status: 'Site Study Done' },
    { id: '7', name: 'Alex Rodriguez', role: 'Deployment Engineer', projects: 1, status: 'Created' },
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
        siteName: 'HSBC Canary Wharf',
        status: 'scoping_done',
        startDate: '2025-10-15',
        targetDate: '2025-12-15',
        progress: 75,
        estimatedCost: 45000,
        assignedTeam: 'Team Alpha',
        priority: 'high',
        riskLevel: 'medium',
        notes: 'Hardware procurement in progress'
      },
      {
        id: '2',
        siteName: 'JLR Whitley Campus',
        status: 'approved',
        startDate: '2025-11-01',
        targetDate: '2025-12-01',
        progress: 60,
        estimatedCost: 38000,
        assignedTeam: 'Team Beta',
        priority: 'medium',
        riskLevel: 'low',
        notes: 'Waiting for final approval'
      },
      {
        id: '3',
        siteName: 'Morgan Stanley London',
        status: 'procurement_done',
        startDate: '2025-10-20',
        targetDate: '2025-12-20',
        progress: 85,
        estimatedCost: 52000,
        assignedTeam: 'Team Gamma',
        priority: 'high',
        riskLevel: 'low',
        notes: 'Ready for deployment'
      },
      {
        id: '4',
        siteName: 'Levy Restaurants',
        status: 'deployed',
        startDate: '2025-11-10',
        targetDate: '2025-12-10',
        progress: 90,
        estimatedCost: 32000,
        assignedTeam: 'Team Delta',
        priority: 'medium',
        riskLevel: 'low',
        notes: 'Final testing phase'
      },
      {
        id: '5',
        siteName: 'Baxter Health',
        status: 'live',
        startDate: '2025-10-01',
        targetDate: '2025-12-01',
        progress: 100,
        estimatedCost: 41000,
        assignedTeam: 'Team Alpha',
        priority: 'high',
        riskLevel: 'low',
        notes: 'Successfully deployed and operational'
      },
      {
        id: '6',
        siteName: 'Ford Dunton',
        status: 'site_study_done',
        startDate: '2025-12-01',
        targetDate: '2026-01-01',
        progress: 40,
        estimatedCost: 35000,
        assignedTeam: 'Team Beta',
        priority: 'medium',
        riskLevel: 'medium',
        notes: 'Scoping phase starting soon'
      },
      {
        id: '7',
        siteName: 'Marjon University',
        status: 'scoping_done',
        startDate: '2025-11-15',
        targetDate: '2025-12-15',
        progress: 70,
        estimatedCost: 28000,
        assignedTeam: 'Team Gamma',
        priority: 'low',
        riskLevel: 'low',
        notes: 'Budget approved, procurement next'
      },
      {
        id: '8',
        siteName: 'Minley Station',
        status: 'approved',
        startDate: '2025-12-15',
        targetDate: '2026-01-15',
        progress: 55,
        estimatedCost: 42000,
        assignedTeam: 'Team Delta',
        priority: 'high',
        riskLevel: 'medium',
        notes: 'Security clearance pending'
      },
      {
        id: '9',
        siteName: 'Chartswell Group',
        status: 'Created',
        startDate: '2025-10-01',
        targetDate: '2026-01-01',
        progress: 20,
        estimatedCost: 31000,
        assignedTeam: 'Team Alpha',
        priority: 'medium',
        riskLevel: 'low',
        notes: 'Initial planning phase'
      },
      {
        id: '10',
        siteName: 'Compass One',
        status: 'site_study_done',
        startDate: '2025-12-20',
        targetDate: '2026-01-20',
        progress: 35,
        estimatedCost: 36000,
        assignedTeam: 'Team Beta',
        priority: 'low',
        riskLevel: 'low',
        notes: 'Site survey completed'
      },
      {
        id: '11',
        siteName: 'Peabody Housing',
        status: 'scoping_done',
        startDate: '2025-11-25',
        targetDate: '2025-12-25',
        progress: 80,
        estimatedCost: 29000,
        assignedTeam: 'Team Gamma',
        priority: 'medium',
        riskLevel: 'low',
        notes: 'Hardware specifications finalized'
      },
      {
        id: '12',
        siteName: 'RA Restaurants',
        status: 'procurement_done',
        startDate: '2025-10-30',
        targetDate: '2025-12-30',
        progress: 88,
        estimatedCost: 34000,
        assignedTeam: 'Team Delta',
        priority: 'high',
        riskLevel: 'low',
        notes: 'Equipment delivery scheduled'
      },
      {
        id: '13',
        siteName: 'NEXT Retail',
        status: 'deployed',
        startDate: '2025-11-05',
        targetDate: '2025-12-05',
        progress: 92,
        estimatedCost: 27000,
        assignedTeam: 'Team Alpha',
        priority: 'medium',
        riskLevel: 'low',
        notes: 'User training in progress'
      },
      {
        id: '14',
        siteName: 'B&I Corporate',
        status: 'live',
        startDate: '2025-10-10',
        targetDate: '2025-12-10',
        progress: 100,
        estimatedCost: 39000,
        assignedTeam: 'Team Beta',
        priority: 'high',
        riskLevel: 'low',
        notes: 'Fully operational'
      },
      {
        id: '15',
        siteName: 'Offshore Platform Alpha',
        status: 'scoping_done',
        startDate: '2025-12-10',
        targetDate: '2026-01-10',
        progress: 65,
        estimatedCost: 68000,
        assignedTeam: 'Team Gamma',
        priority: 'urgent',
        riskLevel: 'high',
        notes: 'Specialized equipment required'
      }
    ];

    const mockFinancialData: FinancialForecast[] = [
      {
        month: 'October 2025',
        hardwareCosts: 45000,
        softwareCosts: 15000,
        avgMonthlyCostPerSite: 6500,
        costVariancePercentage: 12.5,
        projectsCount: 4,
        statusBreakdown: '2 Scoping, 2 Planning'
      },
      {
        month: 'November 2025',
        hardwareCosts: 52000,
        softwareCosts: 18000,
        avgMonthlyCostPerSite: 6800,
        costVariancePercentage: 8.2,
        projectsCount: 5,
        statusBreakdown: '3 Procurement, 2 Approved'
      },
      {
        month: 'December 2025',
        hardwareCosts: 68000,
        softwareCosts: 22000,
        avgMonthlyCostPerSite: 7200,
        costVariancePercentage: 18.7,
        projectsCount: 6,
        statusBreakdown: '4 Deployment, 2 Live'
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
      // Green: Live
      case 'live': 
        return 'bg-green-100 text-green-800';
      
      // Gray: Created, Pending
      case 'Created':
      case 'created':
      case 'pending':
      case 'archived': 
        return 'bg-gray-100 text-gray-800';
      
      // Yellow: In Progress
      case 'in_progress':
      case 'site_study_done':
        return 'bg-yellow-100 text-yellow-800';
      
      // Red: Blocked, On Hold, Rejected
      case 'blocked':
      case 'on_hold':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      
      // Blue: Procurement Done, Deployed, Approved
      case 'procurement_done':
      case 'deployed':
      case 'approved':
      case 'scoping_done':
        return 'bg-blue-100 text-blue-800';
      
      default: 
        return 'bg-gray-100 text-gray-800';
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

    // Calculate Sites Going Live in next 3 months (sites with target dates in next 3 months)
    const threeMonthsFromNow = new Date('2025-12-31'); // End of December 2025
    const sitesGoingLive = forecastData.filter(item => {
      const targetDate = new Date(item.targetDate);
      return targetDate <= threeMonthsFromNow && item.status !== 'live';
    }).length;

    // Calculate Future Costs for scoped sites only
    const futureCosts = forecastData
      .filter(item => item.status === 'scoping_done')
      .reduce((sum, item) => sum + item.estimatedCost, 0);

    return {
      total,
      completed,
      inProgress,
      planning,
      totalEstimatedCost,
      totalActualCost,
      onTrack,
      sitesGoingLive,
      futureCosts,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      onTrackRate: total > 0 ? Math.round((onTrack / total) * 100) : 0
    };
  }, [forecastData]);

  // Filter to sites going live in the next 3 months (based on targetDate; for live, use completionDate if present)
  const nextThreeMonthsData = useMemo(() => {
    const now = new Date();
    const threeMonthsLater = new Date(now.getTime());
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
    return forecastData.filter((item) => {
      if (item.status === 'live') return false; // exclude already live sites from upcoming go-lives
      const target = new Date(item.targetDate);
      return target >= now && target <= threeMonthsLater;
    });
  }, [forecastData]);

  // Aggregate status-wise metrics for Timeline consolidated view (filtered to next 3 months)
  const statusAggregation = useMemo(() => {
    const aggregation: Record<string, { count: number; totalProgress: number; totalEstimatedCost: number; totalDays: number; highRiskCount: number }> = {};
    const now = new Date();
    for (const item of nextThreeMonthsData) {
      const key = item.status;
      if (!aggregation[key]) {
        aggregation[key] = { count: 0, totalProgress: 0, totalEstimatedCost: 0, totalDays: 0, highRiskCount: 0 };
      }
      aggregation[key].count += 1;
      aggregation[key].totalProgress += item.progress || 0;
      aggregation[key].totalEstimatedCost += item.estimatedCost || 0;
      // Days to target (or since live)
      const referenceDate = new Date(item.targetDate);
      const diffMs = Math.max(0, referenceDate.getTime() - now.getTime());
      const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
      aggregation[key].totalDays += days;
      if (item.riskLevel === 'high') aggregation[key].highRiskCount += 1;
    }
    return aggregation;
  }, [nextThreeMonthsData]);

  const orderedStatuses: string[] = [
    'deployed',
    'procurement_done',
    'approved',
    'scoping_done',
    'site_study_done',
    'Created'
  ];

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
            Project timeline, financial forecasting, and performance insights for the next 3 months
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
                <p className="text-sm text-gray-600">Sites Going Live</p>
                <p className="text-2xl font-bold text-gray-900">{summaryMetrics.sitesGoingLive}</p>
                <p className="text-xs text-gray-500">Next 3 months</p>
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
                <p className="text-xs text-gray-500">Projects meeting targets</p>
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
                <p className="text-sm text-gray-600">Future Costs</p>
                <p className="text-2xl font-bold text-gray-900">£{summaryMetrics.futureCosts.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Scoped sites only</p>
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
                <p className="text-2xl font-bold text-gray-900">15</p>
                <p className="text-xs text-gray-500">Currently in progress</p>
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

      {/* Timeline View - Gantt Chart by Organization */}
      {viewMode === 'timeline' && (
        <div className="space-y-6">
          <TimelineGanttView forecastData={forecastData} />
        </div>
      )}

             {/* Financial Forecast View */}
       {viewMode === 'financial' && (
         <div className="space-y-6">
           {/* Financial Summary Card */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Card>
               <CardContent className="p-4">
                 <div className="text-center">
                   <p className="text-sm text-gray-600">Total 3-Month Budget</p>
                   <p className="text-2xl font-bold text-gray-900">£165,000</p>
                   <p className="text-xs text-gray-500">Oct-Dec 2025</p>
                 </div>
               </CardContent>
             </Card>
             <Card>
               <CardContent className="p-4">
                 <div className="text-center">
                   <p className="text-sm text-gray-600">Total Projects</p>
                   <p className="text-2xl font-bold text-gray-900">15</p>
                   <p className="text-xs text-gray-500">Across 3 months</p>
                 </div>
               </CardContent>
             </Card>
           </div>

           <Card>
             <CardHeader>
               <CardTitle className="flex items-center space-x-2">
                 <span>Monthly Cost Insights (Next 3 Months)</span>
               </CardTitle>
               <CardDescription>
                 Hardware, software costs, project timelines, and cost variance analysis for upcoming deployments
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 {financialData.map((month) => (
                   <div key={month.month} className="border rounded-lg p-4">
                     <h3 className="font-medium mb-3">{month.month}</h3>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                         <div className="text-sm text-gray-600">Projects Count</div>
                         <div className="text-lg font-semibold text-green-600">
                           {month.projectsCount || 0}
                         </div>
                         <div className="text-xs text-gray-500">
                           {month.statusBreakdown || 'Planning phase'}
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


