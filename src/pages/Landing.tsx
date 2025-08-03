import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Building, Users, BarChart, Target, Shield, Database, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import smartqLogo from '@/assets/smartq-icon-logo.svg';

const Landing = () => {
  const navigate = useNavigate();
  const handleLoginClick = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gradient-to-b from-black to-green-900 backdrop-blur border-b border-green-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img src={smartqLogo} alt="SmartQ Launchpad" className="h-12 w-12" />
                <div>
                  <h1 className="text-2xl font-bold text-white">SmartQ Launchpad</h1>
                </div>
              </div>
            </div>
            
            <Button onClick={handleLoginClick} variant="ghost" className="text-white hover:bg-green-800 border-green-700">
              Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 px-6 bg-gradient-to-b from-green-900 to-black">
        <div className="container mx-auto text-center">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Deploy Sites Faster.
              <br />
              <span className="text-green-400">With Confidence.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Streamline site studies, hardware procurement, and inventory management — and track progress in real-time with SmartQ LaunchPad.
            </p>
            
            <div className="flex justify-center mb-16">
              <Button 
                size="lg" 
                onClick={handleLoginClick} 
                className="bg-green-700 hover:bg-green-600 text-white px-8 py-6 text-lg font-semibold rounded-full shadow-lg"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="relative py-16 px-6 bg-black">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Learn about SmartQ LaunchPad's Capabilities
            </h2>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
              Discover how our platform transforms site deployment with comprehensive oversight and strategic insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-slate-700 bg-gray-800 text-white">
              <CardHeader>
                <Target className="h-10 w-10 text-green-400 mb-3" />
                <CardTitle className="text-xl text-white">Full Lifecycle Oversight</CardTitle>
                <CardDescription className="text-slate-300">
                  Gain complete command over site creation, study, hardware procurement, deployment, and ongoing management.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-slate-700 bg-gray-800 text-white">
              <CardHeader>
                <BarChart className="h-10 w-10 text-green-400 mb-3" />
                <CardTitle className="text-xl text-white">Strategic Decision Support</CardTitle>
                <CardDescription className="text-slate-300">
                  Access actionable insights through specialized dashboards for administration, deployment, inventory, and forecasting.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-slate-700 bg-gray-800 text-white">
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-green-400 mb-3" />
                <CardTitle className="text-xl text-white">Optimized Resource Allocation</CardTitle>
                <CardDescription className="text-slate-300">
                  Improve planning and reduce operational bottlenecks by accurately forecasting needs and tracking assets.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-slate-700 bg-gray-800 text-white">
              <CardHeader>
                <Shield className="h-10 w-10 text-green-400 mb-3" />
                <CardTitle className="text-xl text-white">Ensured Compliance & Renewal</CardTitle>
                <CardDescription className="text-slate-300">
                  Monitor software, hardware, and service licenses for status, renewal dates, and regulatory adherence.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;