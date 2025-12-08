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
      <header className="fixed top-0 left-0 right-0 z-50 header-black-green backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="font-semibold text-white hidden sm:block text-xl sm:text-2xl tracking-tight">
                SmartQ Launchpad
              </span>
              <RocketIcon size={40} className="text-white sm:size-12" />
            </div>

            <Button 
              onClick={handleLoginClick}
              variant="ghost"
              className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base text-white hover:bg-white/15 rounded-lg font-medium transition-all duration-200"
            >
              Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-16 sm:h-20" aria-hidden="true" />

      {/* Hero Section */}
      <section className="relative py-8 sm:py-12 md:py-16 px-4 sm:px-6 min-h-screen flex items-center justify-center">
        {/* Lottie Animation Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="relative">
            {/* Glow effect wrapper */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, rgba(34, 197, 94, 0.04) 30%, rgba(34, 197, 94, 0.02) 60%, transparent 100%)',
                filter: 'blur(50px)',
                width: 'min(1000px, 90vw)',
                height: 'min(800px, 80vh)',
                transform: 'translate(-50%, -50%)',
                top: '50%',
                left: '50%',
                animation: 'rocketGlow 4s ease-in-out infinite alternate'
              }}
            />
            <DotLottieReact
              src="/hero-animation.lottie"
              loop
              autoplay
              className="hero-animation"
              style={{ 
                width: 'min(1000px, 80vw)', 
                height: 'min(800px, 70vh)', 
                opacity: 0.15,
                filter: 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.2)) brightness(0.8) contrast(0.9)',
                position: 'relative',
                zIndex: 1
              }}
              dotLottieRefCallback={(dotLottie) => {
                dotLottieRef.current = dotLottie;
              }}
            />
          </div>
        </div>
        
        {/* Hero Content */}
        <div className="container mx-auto text-center relative z-10 max-w-5xl px-4 sm:px-6 hero-content">
          <div className="space-y-6 sm:space-y-8 md:space-y-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-7xl font-bold leading-[1.1] sm:leading-[1.15] text-white tracking-tight">
              Deploy Sites Faster.
              <br />
              <span className="bg-gradient-to-r from-green-400 via-green-300 to-emerald-400 bg-clip-text text-transparent font-extrabold text-glow-green hero-glow-text">
                With Confidence.
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/85 max-w-3xl mx-auto leading-relaxed font-normal px-4 tracking-wide">
              Streamline site studies, hardware procurement, and inventory management with real-time progress tracking.
            </p>

            <div className="flex justify-center pt-6 sm:pt-8">
              <Button 
                onClick={handleLoginClick}
                className="group px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 text-sm sm:text-base md:text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold rounded-lg sm:rounded-xl shadow-xl hover:shadow-green-500/30 active:scale-[0.98] transition-all duration-200 border border-green-400/30 hover:border-green-300/50 hero-button-glow"
              >
                <span className="flex items-center gap-2">
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="relative py-16 sm:py-20 md:py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-white tracking-tight">
              Why Choose SmartQ LaunchPad?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/80 leading-relaxed font-normal">
              Streamline your entire deployment process with intelligent automation and real-time insights.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2">
            <Card className="card-surface hover:scale-[1.02] transition-transform duration-200">
              <CardHeader className="p-6 sm:p-8 space-y-4">
                <div className="icon-badge-green w-max mx-auto sm:mx-0">
                  <Target className="h-6 w-6 sm:h-7 sm:w-7" color="#1CB255" />
                </div>
                <CardTitle className="text-white text-lg sm:text-xl md:text-2xl font-semibold">Deployment Oversight</CardTitle>
                <CardDescription className="text-white/75 leading-relaxed text-sm sm:text-base">
                  End-to-end visibility across all deployment phases with real-time tracking and automated workflows.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-surface hover:scale-[1.02] transition-transform duration-200">
              <CardHeader className="p-6 sm:p-8 space-y-4">
                <div className="icon-badge-green w-max mx-auto sm:mx-0">
                  <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7" color="#1CB255" />
                </div>
                <CardTitle className="text-white text-lg sm:text-xl md:text-2xl font-semibold">Smart Insights</CardTitle>
                <CardDescription className="text-white/75 leading-relaxed text-sm sm:text-base">
                  Data-driven decision making with comprehensive analytics and predictive modeling.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-surface hover:scale-[1.02] transition-transform duration-200">
              <CardHeader className="p-6 sm:p-8 space-y-4">
                <div className="icon-badge-green w-max mx-auto sm:mx-0">
                  <Users className="h-6 w-6 sm:h-7 sm:w-7" color="#1CB255" />
                </div>
                <CardTitle className="text-white text-lg sm:text-xl md:text-2xl font-semibold">Team Collaboration</CardTitle>
                <CardDescription className="text-white/75 leading-relaxed text-sm sm:text-base">
                  Seamless coordination between stakeholders with real-time updates and task management.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-surface hover:scale-[1.02] transition-transform duration-200">
              <CardHeader className="p-6 sm:p-8 space-y-4">
                <div className="icon-badge-green w-max mx-auto sm:mx-0">
                  <Wallet className="h-6 w-6 sm:h-7 sm:w-7" color="#1CB255" />
                </div>
                <CardTitle className="text-white text-lg sm:text-xl md:text-2xl font-semibold">Cost Optimization</CardTitle>
                <CardDescription className="text-white/75 leading-relaxed text-sm sm:text-base">
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