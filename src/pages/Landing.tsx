import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Target, BarChart3, Users, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RocketIcon } from '@/components/ui/RocketIcon';

const Landing = () => {
  const navigate = useNavigate();
  
  const handleLoginClick = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen page-green-black text-white/95 relative overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 header-black-green">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="font-bold text-white hidden sm:block text-2xl sm:text-3xl">
                SmartQ Launchpad
              </span>
              <RocketIcon size={48} className="text-white ml-3 sm:ml-4" />
            </div>

            <Button 
              onClick={handleLoginClick}
              variant="ghost"
              className="px-4 py-2 text-white hover:bg-white/15 rounded-xl"
            >
              Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-16" aria-hidden="true" />

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 px-4 sm:px-6">
        <div className="container mx-auto text-center">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white mb-6">
              Deploy Sites Faster.
              <br />
              <span className="text-green-400 text-glow-green">With Confidence.</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/85 mb-10 max-w-3xl mx-auto leading-relaxed">
              Streamline site studies, hardware procurement, and inventory management — and track progress in real-time with SmartQ LaunchPad.
            </p>

            <div className="flex justify-center mb-12 sm:mb-16">
              <Button 
                size="lg"
                onClick={handleLoginClick}
                className="px-8 py-6 text-lg bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-xl active:scale-95 transition-all duration-200"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="relative py-12 sm:py-16 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-8 sm:mb-12 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Why Choose SmartQ LaunchPad?
            </h2>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed">
              Streamline your entire deployment process with intelligent automation and real-time insights.
            </p>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <Card className="card-surface hover:scale-105 transition-transform duration-300">
              <CardHeader className="p-6 space-y-3">
                <div className="icon-badge-green w-max">
                  <Target className="h-6 w-6" color="#1CB255" />
                </div>
                <CardTitle className="text-white text-xl">Deployment Oversight</CardTitle>
                <CardDescription className="text-white/75 leading-relaxed">
                  End-to-end visibility across all deployment phases with real-time tracking and automated workflows.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-surface hover:scale-105 transition-transform duration-300">
              <CardHeader className="p-6 space-y-3">
                <div className="icon-badge-green w-max">
                  <BarChart3 className="h-6 w-6" color="#1CB255" />
                </div>
                <CardTitle className="text-white text-xl">Smart Insights</CardTitle>
                <CardDescription className="text-white/75 leading-relaxed">
                  Intelligent suggestions for optimal hardware and software configurations based on your requirements.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-surface hover:scale-105 transition-transform duration-300">
              <CardHeader className="p-6 space-y-3">
                <div className="icon-badge-green w-max">
                  <Users className="h-6 w-6" color="#1CB255" />
                </div>
                <CardTitle className="text-white text-xl">Team Collaboration</CardTitle>
                <CardDescription className="text-white/75 leading-relaxed">
                  Role-based access control with streamlined approval processes for seamless team coordination.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-surface hover:scale-105 transition-transform duration-300">
              <CardHeader className="p-6 space-y-3">
                <div className="icon-badge-green w-max">
                  <Wallet className="h-6 w-6" color="#1CB255" />
                </div>
                <CardTitle className="text-white text-xl">Cost Control</CardTitle>
                <CardDescription className="text-white/75 leading-relaxed">
                  Automated cost management with real-time budgeting, approvals, and forecasting capabilities.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="section-divider my-10" />

          <div className="text-center">
            <p className="text-white/80 max-w-3xl mx-auto leading-relaxed">
              Transform complex deployments into predictable, manageable projects with measurable operational gains.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;