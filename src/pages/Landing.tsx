import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Building, Users, BarChart, Target, Shield, Database, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RocketIcon } from '@/components/ui/RocketIcon';
import { useIsMobile } from '@/hooks/use-mobile';

const Landing = () => {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useIsMobile();
  
  const handleLoginClick = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-indigo-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-200/20 to-pink-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-100/10 to-indigo-200/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-900 backdrop-blur border-b border-white/10 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="relative">
                  <div className={`
                    bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg
                    ${isMobile ? 'w-10 h-10' : 'w-12 h-12'}
                  `}>
                    <RocketIcon 
                      size={isMobile ? 24 : 32}
                      className="text-white"
                    />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full blur opacity-30"></div>
                </div>
                <div>
                  <h1 className={`
                    font-bold text-white
                    ${isMobile ? 'text-xl' : 'text-2xl'}
                  `}>
                    SmartQ Launchpad
                  </h1>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleLoginClick} 
              variant="ghost" 
              className={`
                text-white hover:bg-white/10 border-white/20
                ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'}
                active:scale-95 transition-transform rounded-xl
              `}
            >
              Login
              <ArrowRight className={`
                ml-2
                ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}
              `} />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`
        relative py-12 sm:py-16 px-4 sm:px-6 z-10
        bg-gradient-to-b from-blue-900/90 via-indigo-900/80 to-purple-900/70
        backdrop-blur-sm
      `}>
        <div className="container mx-auto text-center">
          <div className="max-w-5xl mx-auto">
            <h1 className={`
              font-bold text-white mb-6 leading-tight
              ${isMobile ? 'text-4xl sm:text-5xl' : 'text-5xl md:text-6xl lg:text-7xl'}
            `}>
              Deploy Sites Faster.
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">With Confidence.</span>
            </h1>
            <p className={`
              text-slate-200 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed
              ${isMobile ? 'text-lg sm:text-xl' : 'text-xl md:text-2xl'}
            `}>
              Streamline site studies, hardware procurement, and inventory management — and track progress in real-time with SmartQ LaunchPad.
            </p>
            
            <div className="flex justify-center mb-12 sm:mb-16">
              <Button 
                size={isMobile ? 'default' : 'lg'}
                onClick={handleLoginClick} 
                className={`
                  bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
                  text-white font-semibold rounded-full shadow-xl
                  active:scale-95 transition-all duration-200
                  ${isMobile ? 'px-6 py-3 text-base' : 'px-8 py-6 text-lg'}
                `}
              >
                Get Started
                <ArrowRight className={`
                  ml-2
                  ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}
                `} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className={`
        relative py-12 sm:py-16 px-4 sm:px-6 z-10
        bg-gradient-to-b from-white/80 to-blue-50/50
        backdrop-blur-sm
      `}>
        <div className="container mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className={`
              font-bold text-gray-900 mb-3
              ${isMobile ? 'text-2xl sm:text-3xl' : 'text-3xl md:text-4xl'}
            `}>
              Learn about SmartQ LaunchPad's Capabilities
            </h2>
            <p className={`
              text-gray-600 max-w-2xl mx-auto
              ${isMobile ? 'text-base sm:text-lg' : 'text-lg md:text-xl'}
            `}>
              Discover how our platform transforms site deployment with comprehensive oversight and strategic insights.
            </p>
          </div>

          <div className={`
            grid gap-4 sm:gap-6
            ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}
          `}>
            <Card className="
              border-0 bg-white/80 backdrop-blur-sm text-gray-900
              hover:bg-white/90 hover:shadow-xl transition-all duration-300
              cursor-pointer active:scale-98
              touch-manipulation shadow-lg
            ">
              <CardHeader className={`
                ${isMobile ? 'p-4' : 'p-6'}
              `}>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mb-3">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <CardTitle className={`
                  text-gray-900
                  ${isMobile ? 'text-lg' : 'text-xl'}
                `}>
                  Full Lifecycle Oversight
                </CardTitle>
                <CardDescription className={`
                  text-gray-600
                  ${isMobile ? 'text-sm' : 'text-base'}
                `}>
                  Gain complete command over site creation, study, hardware procurement, deployment, and ongoing management.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="
              border-0 bg-white/80 backdrop-blur-sm text-gray-900
              hover:bg-white/90 hover:shadow-xl transition-all duration-300
              cursor-pointer active:scale-98
              touch-manipulation shadow-lg
            ">
              <CardHeader className={`
                ${isMobile ? 'p-4' : 'p-6'}
              `}>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mb-3">
                  <BarChart className="h-6 w-6 text-white" />
                </div>
                <CardTitle className={`
                  text-gray-900
                  ${isMobile ? 'text-lg' : 'text-xl'}
                `}>
                  Strategic Decision Support
                </CardTitle>
                <CardDescription className={`
                  text-gray-600
                  ${isMobile ? 'text-sm' : 'text-base'}
                `}>
                  Access actionable insights through specialized dashboards for administration, deployment, inventory, and forecasting.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="
              border-0 bg-white/80 backdrop-blur-sm text-gray-900
              hover:bg-white/90 hover:shadow-xl transition-all duration-300
              cursor-pointer active:scale-98
              touch-manipulation shadow-lg
            ">
              <CardHeader className={`
                ${isMobile ? 'p-4' : 'p-6'}
              `}>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <CardTitle className={`
                  text-gray-900
                  ${isMobile ? 'text-lg' : 'text-xl'}
                `}>
                  Optimized Resource Allocation
                </CardTitle>
                <CardDescription className={`
                  text-gray-600
                  ${isMobile ? 'text-sm' : 'text-base'}
                `}>
                  Improve planning and reduce operational bottlenecks by accurately forecasting needs and tracking assets.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="
              border-0 bg-white/80 backdrop-blur-sm text-gray-900
              hover:bg-white/90 hover:shadow-xl transition-all duration-300
              cursor-pointer active:scale-98
              touch-manipulation shadow-lg
            ">
              <CardHeader className={`
                ${isMobile ? 'p-4' : 'p-6'}
              `}>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-3">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle className={`
                  text-gray-900
                  ${isMobile ? 'text-lg' : 'text-xl'}
                `}>
                  Ensured Compliance & Renewal
                </CardTitle>
                <CardDescription className={`
                  text-gray-600
                  ${isMobile ? 'text-sm' : 'text-base'}
                `}>
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