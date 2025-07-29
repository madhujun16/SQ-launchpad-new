import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Clock, CheckCircle, AlertTriangle } from "lucide-react";

const DashboardStats = () => {
  const stats = [
    {
      title: "Active Sites",
      value: "127",
      change: "+12 this month",
      icon: Building2,
      color: "text-primary"
    },
    {
      title: "Pending Approvals",
      value: "8",
      change: "3 urgent",
      icon: Clock,
      color: "text-warning"
    },
    {
      title: "Completed This Week",
      value: "24",
      change: "+18% vs last week",
      icon: CheckCircle,
      color: "text-success"
    },
    {
      title: "Issues Requiring Attention",
      value: "3",
      change: "2 critical",
      icon: AlertTriangle,
      color: "text-destructive"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;