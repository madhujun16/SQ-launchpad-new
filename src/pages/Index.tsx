import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import DashboardStats from "@/components/DashboardStats";
import WorkflowCard from "@/components/WorkflowCard";
import heroImage from "@/assets/hero-image.jpg";
import { ArrowRight, Target, Users, BarChart3 } from "lucide-react";

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
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-primary-light">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-5xl font-bold mb-6">
                Streamline Your Site Onboarding Workflow
              </h1>
              <p className="text-xl mb-8 text-white/90">
                Compass Launchpad manages the complete lifecycle from site creation to hardware deployment, 
                inventory tracking, and system integration across the UK.
              </p>
              <div className="flex space-x-4">
                <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white hover:text-primary">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="ghost" className="text-white hover:bg-white/10">
                  View Demo
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Compass Launchpad Dashboard" 
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Platform Overview</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Designed for Admins, Ops Managers, and Deployment Engineers to collaborate seamlessly
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Workflow Management</h3>
              <p className="text-muted-foreground">
                Complete site lifecycle from creation to deployment with role-based workflows
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-success-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Role-Based Access</h3>
              <p className="text-muted-foreground">
                Tailored dashboards for Admins, Ops Managers, and Deployment Engineers
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-info rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-info-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Real-Time Tracking</h3>
              <p className="text-muted-foreground">
                Live inventory dashboard with filterable attributes and forecasting
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Live Dashboard</h2>
            <p className="text-muted-foreground">Real-time overview of your site onboarding pipeline</p>
          </div>

          <DashboardStats />

          <div className="mt-12">
            <h3 className="text-2xl font-semibold mb-6 text-foreground">Recent Activities</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {recentActivities.map((activity, index) => (
                <WorkflowCard
                  key={index}
                  {...activity}
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
