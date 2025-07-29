import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Building, Users, Target, BarChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import smartqLogo from '@/assets/smartq-icon-logo.svg';
const Landing = () => {
  const navigate = useNavigate();
  const handleLoginClick = () => {
    navigate('/auth');
  };
  return <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              
              <div className="flex items-center space-x-3">
                <img src={smartqLogo} alt="SmartQ Launchpad" className="h-10 w-10" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">SmartQ Launchpad</h1>
                </div>
              </div>
            </div>
            
            <Button onClick={handleLoginClick} className="bg-primary hover:bg-primary-dark text-primary-foreground">
              Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Streamline Your Site 
              <span className="text-primary"> Onboarding</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Efficient site onboarding management for SmartQ Group locations. 
              Track progress, manage workflows, and ensure successful launches.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button size="lg" onClick={handleLoginClick} className="bg-primary hover:bg-primary-dark text-primary-foreground px-8 py-6 text-lg">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-16">
              <Card className="border-border bg-card text-center">
                <CardHeader className="pb-3">
                  <Building className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-2xl font-bold text-foreground">500+</CardTitle>
                  <CardDescription>Sites Managed</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="border-border bg-card text-center">
                <CardHeader className="pb-3">
                  <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-2xl font-bold text-foreground">50+</CardTitle>
                  <CardDescription>Team Members</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="border-border bg-card text-center">
                <CardHeader className="pb-3">
                  <Target className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-2xl font-bold text-foreground">95%</CardTitle>
                  <CardDescription>Success Rate</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="border-border bg-card text-center">
                <CardHeader className="pb-3">
                  <BarChart className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-2xl font-bold text-foreground">30%</CardTitle>
                  <CardDescription>Time Saved</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Site Management Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage site onboarding efficiently and effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-border bg-card">
              <CardHeader>
                <Building className="h-10 w-10 text-primary mb-4" />
                <CardTitle className="text-xl text-foreground">Site Study</CardTitle>
                <CardDescription>
                  Comprehensive tracking and management of all site onboarding processes.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-4" />
                <CardTitle className="text-xl text-foreground">Team Collaboration</CardTitle>
                <CardDescription>
                  Real-time collaboration tools for seamless team coordination.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <BarChart className="h-10 w-10 text-primary mb-4" />
                <CardTitle className="text-xl text-foreground">Analytics & Reporting</CardTitle>
                <CardDescription>
                  Detailed insights and reporting to optimize your onboarding process.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
    </div>;
};
export default Landing;