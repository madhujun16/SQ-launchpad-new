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
      <div className="h-12" aria-hidden="true" />

      {/* Hero Section */}
      <section className="relative py-4 sm:py-6 px-4 sm:px-6 min-h-screen flex items-start pt-16">
        {/* Lottie Animation Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="relative">
            {/* Glow effect wrapper */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, rgba(34, 197, 94, 0.15) 30%, rgba(34, 197, 94, 0.08) 60%, transparent 100%)',
                filter: 'blur(25px)',
                width: 'min(800px, 80vw)',
                height: 'min(600px, 70vh)',
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
                width: 'min(600px, 70vw)', 
                height: 'min(450px, 60vh)', 
                opacity: 0.7,
                filter: 'drop-shadow(0 0 30px rgba(34, 197, 94, 0.6)) brightness(1.2) contrast(1.1)',
                position: 'relative',
                zIndex: 1
              }}
              dotLottieRefCallback={(dotLottie) => {
                dotLottieRef.current = dotLottie;
              }}
            />
          </div>
        </div>
        
        <div className="container mx-auto text-center relative z-20 pt-16">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white mb-12">
              Deploy Sites Faster.
              <br />
              <span className="bg-gradient-to-r from-green-400 via-green-300 to-emerald-400 bg-clip-text text-transparent font-black text-glow-green hero-glow-text">
                With Confidence.
              </span>
            </h1>
            
            {/* Increased spacing to prevent text overlap with animation */}
            <div className="h-32 md:h-40 lg:h-48"></div>
            
            <p className="text-xl md:text-2xl text-white/95 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              Streamline site studies, hardware procurement, and inventory management — and track progress in real-time with SmartQ LaunchPad.
            </p>

            <div className="flex justify-center mb-16 sm:mb-20">
              <Button 
                size="lg"
                onClick={handleLoginClick}
                className="group px-10 py-6 text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold rounded-xl shadow-2xl hover:shadow-green-500/25 active:scale-95 transition-all duration-300 border border-green-400/20 hover:border-green-300/40 hero-button-glow"
              >
                <span className="flex items-center space-x-2">
                  <span>Get Started</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
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