import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building } from 'lucide-react';

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
  organization?: string;
}

interface TimelineGanttViewProps {
  forecastData: ForecastData[];
}

const ORGANIZATIONS = {
  'HSBC': ['HSBC Canary Wharf'],
  'Jaguar Land Rover': ['JLR Whitley Campus', 'Ford Dunton'],
  'Morgan Stanley': ['Morgan Stanley London'],
  'Restaurant Groups': ['Levy Restaurants', 'RA Restaurants'],
  'Healthcare': ['Baxter Health'],
  'Universities': ['Marjon University'],
  'Government': ['Minley Station'],
  'Corporate Catering': ['Chartswell Group', 'Compass One', 'B&I Corporate'],
  'Housing': ['Peabody Housing'],
  'Retail': ['NEXT Retail'],
  'Energy': ['Offshore Platform Alpha']
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'live': return 'bg-green-500';
    case 'deployed': return 'bg-blue-500';
    case 'procurement_done': return 'bg-indigo-500';
    case 'approved': return 'bg-purple-500';
    case 'scoping_done': return 'bg-yellow-500';
    case 'site_study_done': return 'bg-orange-500';
    case 'Created': return 'bg-gray-500';
    default: return 'bg-gray-400';
  }
};

const getStatusDisplayName = (status: string) => {
  switch (status) {
    case 'live': return 'Live';
    case 'deployed': return 'Deployed';
    case 'procurement_done': return 'Procurement Done';
    case 'approved': return 'Approved';
    case 'scoping_done': return 'Scoping Done';
    case 'site_study_done': return 'Site Study Done';
    case 'Created': return 'Created';
    default: return status;
  }
};

export const TimelineGanttView: React.FC<TimelineGanttViewProps> = ({ forecastData }) => {
  // Generate timeline from current month start to furthest target date
  const today = new Date('2025-09-20');
  const timelineStart = new Date('2025-09-01'); // Start of current month
  
  // Find the furthest target date among all sites
  const furthestDate = forecastData.reduce((latest, site) => {
    const siteTarget = new Date(site.targetDate);
    return siteTarget > latest ? siteTarget : latest;
  }, today);
  
  const timelineEnd = new Date(furthestDate);
  timelineEnd.setDate(timelineEnd.getDate() + 7); // Add a week buffer

  // Generate weeks array
  const weeks = useMemo(() => {
    const weeksArray = [];
    let currentWeek = new Date(timelineStart);
    
    while (currentWeek <= timelineEnd) {
      weeksArray.push(new Date(currentWeek));
      currentWeek.setDate(currentWeek.getDate() + 7);
    }
    
    return weeksArray;
  }, [timelineStart, timelineEnd]);

  // Group sites by organizations
  const groupedSites = useMemo(() => {
    const grouped: Record<string, ForecastData[]> = {};
    
    forecastData.forEach(site => {
      let orgName = 'Other';
      
      // Find which organization this site belongs to
      for (const [org, siteNames] of Object.entries(ORGANIZATIONS)) {
        if (siteNames.includes(site.siteName)) {
          orgName = org;
          break;
        }
      }
      
      if (!grouped[orgName]) {
        grouped[orgName] = [];
      }
      grouped[orgName].push({ ...site, organization: orgName });
    });
    
    return grouped;
  }, [forecastData]);

  // Calculate position and width for each site on timeline
  const getSitePosition = (site: ForecastData) => {
    const today = new Date('2025-09-20');
    const targetDate = new Date(site.targetDate);
    const totalTimelineMs = timelineEnd.getTime() - timelineStart.getTime();
    
    // Calculate progress period (from timeline start to today)
    const progressMs = today.getTime() - timelineStart.getTime();
    const progressWidth = Math.max(0, (progressMs / totalTimelineMs) * 100);
    
    // Calculate total period (from timeline start to target date)
    const totalPeriodMs = targetDate.getTime() - timelineStart.getTime();
    const totalWidth = Math.min(100, Math.max(8, (totalPeriodMs / totalTimelineMs) * 100));
    
    return { 
      progressWidth, // Width showing actual progress/status
      totalWidth,    // Total width to target date
      futureWidth: Math.max(0, totalWidth - progressWidth) // Remaining width in light grey
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building className="h-5 w-5" />
          <span>Timeline Gantt View - By Organization</span>
        </CardTitle>
        <CardDescription>
          Sites grouped by organization showing status transitions from Sept 1st to today, with remaining timeline to target dates
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Timeline Header - Weeks */}
        <div className="mb-6">
          <div className="flex text-xs text-gray-600 mb-2 overflow-x-auto">
            {weeks.map((week, index) => (
              <div key={index} className="flex-1 min-w-16 text-center font-medium border-r border-gray-200 last:border-r-0">
                {week.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              </div>
            ))}
          </div>
          <div className="flex text-xs text-gray-500 border-b border-gray-300 pb-2">
            {weeks.map((week, index) => (
              <div key={index} className="flex-1 min-w-16 text-center border-r border-gray-200 last:border-r-0">
                Week {index + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Organizations and Sites */}
        <div className="space-y-6">
          {Object.entries(groupedSites).map(([orgName, sites]) => (
            <div key={orgName} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{orgName}</h3>
                <Badge variant="outline">{sites.length} sites</Badge>
              </div>
              
              <div className="space-y-3">
                {sites.map((site) => {
                  const position = getSitePosition(site);
                  
                  return (
                    <div key={site.id} className="flex items-center">
                      {/* Site Name */}
                      <div className="w-48 text-sm font-medium text-gray-900 truncate pr-4">
                        {site.siteName}
                      </div>
                      
                       {/* Timeline Bar */}
                       <div className="flex-1 relative h-8 bg-gray-100 rounded mx-2">
                         {/* Progress period (past - showing status) */}
                         {position.progressWidth > 0 && (
                           <div
                             className={`absolute top-1 h-6 rounded-l ${getStatusColor(site.status)} flex items-center justify-center text-white text-xs font-medium shadow-sm`}
                             style={{
                               left: '0%',
                               width: `${position.progressWidth}%`,
                               minWidth: position.progressWidth > 8 ? '60px' : 'auto'
                             }}
                           >
                             {position.progressWidth > 8 && getStatusDisplayName(site.status)}
                           </div>
                         )}
                         
                         {/* Future period (light grey until target date) */}
                         {position.futureWidth > 0 && (
                           <div
                             className="absolute top-1 h-6 bg-gray-300/50 rounded-r border border-gray-300"
                             style={{
                               left: `${position.progressWidth}%`,
                               width: `${position.futureWidth}%`
                             }}
                           />
                         )}
                         
                         {/* Today indicator line */}
                         <div
                           className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                           style={{
                             left: `${position.progressWidth}%`
                           }}
                         />
                       </div>
                      
                      {/* Status and Progress */}
                      <div className="w-32 text-right text-xs text-gray-600 pl-4">
                        <div>{site.progress}% complete</div>
                        <div className="text-gray-500">
                          {new Date(site.targetDate).toLocaleDateString('en-GB')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Status Legend</h4>
          <div className="flex flex-wrap gap-3">
            {[
              { status: 'Created', label: 'Created' },
              { status: 'site_study_done', label: 'Site Study Done' },
              { status: 'scoping_done', label: 'Scoping Done' },
              { status: 'approved', label: 'Approved' },
              { status: 'procurement_done', label: 'Procurement Done' },
              { status: 'deployed', label: 'Deployed' },
              { status: 'live', label: 'Live' }
            ].map(({ status, label }) => (
              <div key={status} className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded ${getStatusColor(status)}`} />
                <span className="text-xs text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};