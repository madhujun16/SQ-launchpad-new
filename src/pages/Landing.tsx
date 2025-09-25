import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Target, BarChart3, Users, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RocketIcon } from '@/components/ui/RocketIcon';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const Landing = () => {
  const navigate = useNavigate();
  const dotLottieRef = React.useRef(null);
  
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
        {/* Lottie Animation Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="relative">
            {/* Glow effect wrapper */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(67, 160, 71, 0.4) 0%, rgba(67, 160, 71, 0.2) 30%, rgba(67, 160, 71, 0.1) 60%, transparent 100%)',
                filter: 'blur(20px)',
                width: 'min(800px, 100vw)',
                height: 'min(500px, 80vh)',
                transform: 'translate(-50%, -50%)',
                top: '50%',
                left: '50%',
                animation: 'rocketGlow 3s ease-in-out infinite alternate'
              }}
            />
            <DotLottieReact
              src="/hero-animation.lottie"
              loop
              autoplay
              style={{ 
                width: 'min(600px, 80vw)', 
                height: 'min(400px, 60vh)', 
                opacity: 0.4,
                filter: 'blur(0.5px) drop-shadow(0 0 15px rgba(67, 160, 71, 0.3))',
                position: 'relative',
                zIndex: 1
              }}
              dotLottieRefCallback={(dotLottie) => {
                dotLottieRef.current = dotLottie;
              }}
            />
          </div>
        </div>
        
        <div className="container mx-auto text-center relative z-20">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white mb-6">
              Deploy Sites Faster.
              <br />
              <span className="text-green-400 text-glow-green">With Confidence.</span>
            </h1>
            
            {/* Spacing for animation visibility */}
            <div className="h-44 md:h-48 lg:h-52"></div>
            
            <p className="text-xl md:text-2xl text-white/85 mb-10 max-w-3xl mx-auto leading-relaxed">
              Streamline site studies, hardware procurement, and inventory management — and track progress in real-time with SmartQ LaunchPad.
            </p>

            <div className="flex justify-center mb-4 sm:mb-6">
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
            <Card className="card-surface">
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

            <Card className="card-surface">
              <CardHeader className="p-6 space-y-3">
                <div className="icon-badge-green w-max">
                  <BarChart3 className="h-6 w-6" color="#1CB255" />
                </div>
                <CardTitle className="text-white text-xl">Smart Insights</CardTitle>
                <CardDescription className="text-white/75 leading-relaxed">
                  Data-driven decision making with comprehensive analytics and predictive modeling.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-surface">
              <CardHeader className="p-6 space-y-3">
                <div className="icon-badge-green w-max">
                  <Users className="h-6 w-6" color="#1CB255" />
                </div>
                <CardTitle className="text-white text-xl">Team Collaboration</CardTitle>
                <CardDescription className="text-white/75 leading-relaxed">
                  Seamless coordination between stakeholders with real-time updates and task management.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-surface">
              <CardHeader className="p-6 space-y-3">
                <div className="icon-badge-green w-max">
                  <Wallet className="h-6 w-6" color="#1CB255" />
                </div>
                <CardTitle className="text-white text-xl">Cost Optimization</CardTitle>
                <CardDescription className="text-white/75 leading-relaxed">
                  Maximize ROI with intelligent procurement, inventory management, and resource allocation.
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