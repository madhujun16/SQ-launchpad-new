import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Clock, CheckCircle, AlertTriangle, Package, Truck, Zap } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { WorkflowService } from "@/services/workflowService";
import { UnifiedSiteStatus } from "@/lib/siteTypes";

const DashboardStats = () => {
  const { isMobile, isTablet } = useIsMobile();
  const [workflowStats, setWorkflowStats] = useState<Record<UnifiedSiteStatus, number>>({} as Record<UnifiedSiteStatus, number>);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await WorkflowService.getWorkflowStats();
        setWorkflowStats(stats);
      } catch (error) {
        console.error('Error fetching workflow stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const totalSites = Object.values(workflowStats).reduce((sum, count) => sum + count, 0);
  const inProgressSites = (workflowStats.site_study_done || 0) + (workflowStats.scoping_done || 0) + (workflowStats.procurement_done || 0);
  const liveSites = workflowStats.live || 0;
  const pendingApprovals = workflowStats.approved || 0;
  
  const stats = [
    {
      title: "Total Sites",
      value: loading ? "..." : totalSites.toString(),
      change: `${liveSites} live sites`,
      icon: Building2,
      color: "text-primary-dark",
      bgColor: "bg-primary/5"
    },
    {
      title: "Pending Approvals",
      value: loading ? "..." : pendingApprovals.toString(),
      change: "Awaiting approval",
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/5"
    },
    {
      title: "In Progress",
      value: loading ? "..." : inProgressSites.toString(),
      change: "Active deployments",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Live Sites",
      value: loading ? "..." : liveSites.toString(),
      change: "Operational",
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/5"
    }
  ];

  return (
    <div className={`
      grid gap-4 sm:gap-6
      ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'}
    `}>
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className="
            hover:shadow-soft transition-all duration-200 
            border-primary/20 bg-card
            cursor-pointer
            active:scale-95
            touch-manipulation
            ${isMobile ? 'p-4' : 'p-6'}
          "
        >
          <CardHeader className={`
            flex flex-row items-center justify-between space-y-0 pb-2
            ${isMobile ? 'px-0 pt-0' : 'px-0 pt-0'}
          `}>
            <CardTitle className={`
              font-medium text-primary-dark
              ${isMobile ? 'text-sm' : 'text-base'}
            `}>
              {stat.title}
            </CardTitle>
            <div className={`
              p-2 rounded-lg ${stat.bgColor}
              ${isMobile ? 'p-1.5' : 'p-2'}
            `}>
              <stat.icon className={`
                ${stat.color}
                ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}
              `} />
            </div>
          </CardHeader>
          <CardContent className={`
            ${isMobile ? 'px-0 pb-0' : 'px-0 pb-0'}
          `}>
            <div className={`
              font-bold text-primary-dark
              ${isMobile ? 'text-xl' : 'text-2xl'}
            `}>
              {stat.value}
            </div>
            <p className={`
              text-muted-foreground mt-1
              ${isMobile ? 'text-xs' : 'text-sm'}
            `}>
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;