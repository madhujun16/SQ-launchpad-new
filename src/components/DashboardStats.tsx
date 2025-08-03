import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Clock, CheckCircle, AlertTriangle } from "lucide-react";

const DashboardStats = () => {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-soft transition-all duration-200 border-primary/20 bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary-dark">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-dark">{stat.value}</div>
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