import Header from "@/components/Header";
import DashboardStats from "@/components/DashboardStats";
import WorkflowCard from "@/components/WorkflowCard";
import { Button } from "@/components/ui/button";
import { Building } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const recentActivities = [
    {
      title: "Manchester Central Site",
      location: "Manchester, UK",
      assignee: "Sarah Johnson",
      dueDate: "Due in 3 days",
      status: "in-progress" as const,
      description: "Site study in progress, hardware requirements being defined"
    },
    {
      title: "Birmingham Food Court",
      location: "Birmingham, UK", 
      assignee: "Mike Thompson",
      dueDate: "Due today",
      status: "pending" as const,
      description: "Awaiting Ops Manager approval for hardware procurement"
    },
    {
      title: "Leeds Shopping Center",
      location: "Leeds, UK",
      assignee: "Emma Wilson", 
      dueDate: "Completed",
      status: "completed" as const,
      description: "Full deployment completed, systems integrated successfully"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Dashboard Content */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
                <p className="text-muted-foreground">Real-time overview of your site onboarding pipeline</p>
              </div>
              <Link to="/site-study">
                <Button className="bg-primary hover:bg-primary-dark">
                  <Building className="mr-2 h-4 w-4" />
                  Site Study
                </Button>
              </Link>
            </div>
          </div>

          <DashboardStats />

          <div className="mt-12">
            <h3 className="text-2xl font-semibold mb-6 text-foreground">Recent Activities</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {recentActivities.map((activity, index) => (
                <WorkflowCard
                  key={index}
                  title={activity.title}
                  location={activity.location}
                  assignee={activity.assignee}
                  dueDate={activity.dueDate}
                  status={activity.status}
                  description={activity.description}
                  onAction={() => console.log(`View details for ${activity.title}`)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
