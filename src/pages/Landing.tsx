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
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gradient-to-b from-black to-green-900 backdrop-blur border-b border-green-800">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <RocketIcon className={`
                  ${isMobile ? 'h-10 w-10' : 'h-12 w-12'}
                `} />
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
                text-white hover:bg-green-800 border-green-700
                ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'}
                active:scale-95 transition-transform
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
        relative py-12 sm:py-16 px-4 sm:px-6 
        bg-gradient-to-b from-green-900 to-black
      `}>
        <div className="container mx-auto text-center">
          <div className="max-w-5xl mx-auto">
            <h1 className={`
              font-bold text-white mb-6 leading-tight
              ${isMobile ? 'text-4xl sm:text-5xl' : 'text-5xl md:text-6xl lg:text-7xl'}
            `}>
              Deploy Sites Faster.
              <br />
              <span className="text-green-400">With Confidence.</span>
            </h1>
            <p className={`
              text-slate-300 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed
              ${isMobile ? 'text-lg sm:text-xl' : 'text-xl md:text-2xl'}
            `}>
              Streamline site studies, hardware procurement, and inventory management — and track progress in real-time with SmartQ LaunchPad.
            </p>
            
            <div className="flex justify-center mb-12 sm:mb-16">
              <Button 
                size={isMobile ? 'default' : 'lg'}
                onClick={handleLoginClick} 
                className={`
                  bg-green-700 hover:bg-green-600 text-white 
                  font-semibold rounded-full shadow-lg
                  active:scale-95 transition-transform
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
        relative py-12 sm:py-16 px-4 sm:px-6 
        bg-black
      `}>
        <div className="container mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className={`
              font-bold text-white mb-3
              ${isMobile ? 'text-2xl sm:text-3xl' : 'text-3xl md:text-4xl'}
            `}>
              Learn about SmartQ LaunchPad's Capabilities
            </h2>
            <p className={`
              text-slate-300 max-w-2xl mx-auto
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
              border-slate-700 bg-gray-800 text-white
              hover:bg-gray-700 transition-colors duration-200
              cursor-pointer active:scale-98
              touch-manipulation
            ">
              <CardHeader className={`
                ${isMobile ? 'p-4' : 'p-6'}
              `}>
                <Target className={`
                  text-green-400 mb-3
                  ${isMobile ? 'h-8 w-8' : 'h-10 w-10'}
                `} />
                <CardTitle className={`
                  text-white
                  ${isMobile ? 'text-lg' : 'text-xl'}
                `}>
                  Full Lifecycle Oversight
                </CardTitle>
                <CardDescription className={`
                  text-slate-300
                  ${isMobile ? 'text-sm' : 'text-base'}
                `}>
                  Gain complete command over site creation, study, hardware procurement, deployment, and ongoing management.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="
              border-slate-700 bg-gray-800 text-white
              hover:bg-gray-700 transition-colors duration-200
              cursor-pointer active:scale-98
              touch-manipulation
            ">
              <CardHeader className={`
                ${isMobile ? 'p-4' : 'p-6'}
              `}>
                <BarChart className={`
                  text-green-400 mb-3
                  ${isMobile ? 'h-8 w-8' : 'h-10 w-10'}
                `} />
                <CardTitle className={`
                  text-white
                  ${isMobile ? 'text-lg' : 'text-xl'}
                `}>
                  Strategic Decision Support
                </CardTitle>
                <CardDescription className={`
                  text-slate-300
                  ${isMobile ? 'text-sm' : 'text-base'}
                `}>
                  Access actionable insights through specialized dashboards for administration, deployment, inventory, and forecasting.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="
              border-slate-700 bg-gray-800 text-white
              hover:bg-gray-700 transition-colors duration-200
              cursor-pointer active:scale-98
              touch-manipulation
            ">
              <CardHeader className={`
                ${isMobile ? 'p-4' : 'p-6'}
              `}>
                <TrendingUp className={`
                  text-green-400 mb-3
                  ${isMobile ? 'h-8 w-8' : 'h-10 w-10'}
                `} />
                <CardTitle className={`
                  text-white
                  ${isMobile ? 'text-lg' : 'text-xl'}
                `}>
                  Optimized Resource Allocation
                </CardTitle>
                <CardDescription className={`
                  text-slate-300
                  ${isMobile ? 'text-sm' : 'text-base'}
                `}>
                  Improve planning and reduce operational bottlenecks by accurately forecasting needs and tracking assets.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="
              border-slate-700 bg-gray-800 text-white
              hover:bg-gray-700 transition-colors duration-200
              cursor-pointer active:scale-98
              touch-manipulation
            ">
              <CardHeader className={`
                ${isMobile ? 'p-4' : 'p-6'}
              `}>
                <Shield className={`
                  text-green-400 mb-3
                  ${isMobile ? 'h-8 w-8' : 'h-10 w-10'}
                `} />
                <CardTitle className={`
                  text-white
                  ${isMobile ? 'text-lg' : 'text-xl'}
                `}>
                  Ensured Compliance & Renewal
                </CardTitle>
                <CardDescription className={`
                  text-slate-300
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