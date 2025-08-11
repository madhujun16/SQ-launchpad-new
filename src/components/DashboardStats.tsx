import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const DashboardStats = () => {
  const { isMobile, isTablet } = useIsMobile();
  
  const stats = [
    {
      title: "Active Sites",
      value: "127",
      change: "+12 this month",
      icon: Building2,
      color: "text-primary-dark",
      bgColor: "bg-primary/5"
    },
    {
      title: "Pending Approvals",
      value: "8",
      change: "3 urgent",
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/5"
    },
    {
      title: "Completed This Week",
      value: "24",
      change: "+18% vs last week",
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/5"
    },
    {
      title: "Issues Requiring Attention",
      value: "3",
      change: "2 critical",
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/5"
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