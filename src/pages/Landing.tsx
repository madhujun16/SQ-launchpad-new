import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Target, BarChart3, Users, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RocketIcon } from '@/components/ui/RocketIcon';
import { useIsMobile } from '@/hooks/use-mobile';

const Landing = () => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  
  const handleLoginClick = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen page-green-black text-white/95 relative overflow-hidden">
      {/* Header with darker aurora fade */}
      <header className="fixed top-0 left-0 right-0 z-50 header-black-green">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <RocketIcon size={isMobile ? 28 : 36} className="text-white" />
              <span className="font-bold text-white hidden sm:block text-2xl sm:text-3xl">SmartQ Launchpad</span>
            </div>

            <Button 
              onClick={handleLoginClick}
              variant="ghost"
              className={`${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'} text-white hover:bg-white/15 rounded-xl`}
            >
              Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Spacer to offset fixed header height on landing */}
      <div className="h-14" aria-hidden="true" />

      {/* Hero copy */}
      <section className="relative py-12 sm:py-16 px-4 sm:px-6">
        <div className="container mx-auto text-center">
          <div className="max-w-5xl mx-auto">
            <h1 className={`${isMobile ? 'text-4xl sm:text-5xl' : 'text-5xl md:text-6xl lg:text-7xl'} font-bold mb-6 leading-tight text-white`}>
              Deploy Sites Faster.
              <br />
              <span className="text-green-400 text-glow-green">With Confidence.</span>
            </h1>
            <p className={`${isMobile ? 'text-lg sm:text-xl' : 'text-xl md:text-2xl'} text-white/85 mb-10 max-w-3xl mx-auto leading-relaxed`}>
              Streamline site studies, hardware procurement, and inventory management — and track progress in real-time with SmartQ LaunchPad.
            </p>

            <div className="flex justify-center mb-12 sm:mb-16">
              <Button 
                size={isMobile ? 'default' : 'lg'}
                onClick={handleLoginClick}
                className={`${isMobile ? 'px-6 py-3 text-base' : 'px-8 py-6 text-lg'} bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-xl active:scale-95 transition-all duration-200`}
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
          <div className="text-center mb-8 sm:mb-12 max-w-5xl mx-auto">
            <h2 className={`${isMobile ? 'text-2xl sm:text-3xl' : 'text-3xl md:text-4xl'} font-bold mb-4 text-white`}>
              Learn about SmartQ LaunchPad's Capabilities
            </h2>
            <p className={`${isMobile ? 'text-base sm:text-lg' : 'text-lg md:text-xl'} text-white/80 leading-relaxed`}>
              Unlock the full potential of your site deployments with SmartQ LaunchPad — the all‑in‑one platform designed to deliver end‑to‑end visibility, control, and efficiency. Whether you’re managing hardware, software, or project workflows, our intuitive tools keep every stakeholder connected and informed.
            </p>
          </div>

          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            <Card className="card-surface">
              <CardHeader className="p-6 space-y-2">
                <div className="icon-badge-green w-max"><Target className="h-5 w-5" color="#1CB255" /></div>
                <CardTitle className="text-white text-lg">Comprehensive Deployment Oversight</CardTitle>
                <CardDescription className="text-white/75 leading-relaxed">
                  Monitor and manage every phase of your site setup—from initial scoping and hardware configuration to approvals and procurement—with real‑time status updates and audit trails.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-surface">
              <CardHeader className="p-6 space-y-2">
                <div className="icon-badge-green w-max"><BarChart3 className="h-5 w-5" color="#1CB255" /></div>
                <CardTitle className="text-white text-lg">Strategic Insights & Recommendations</CardTitle>
                <CardDescription className="text-white/75 leading-relaxed">
                  Leverage intelligent hardware and software suggestions tailored to your unique site requirements, ensuring optimal resource allocation and cost efficiency.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-surface">
              <CardHeader className="p-6 space-y-2">
                <div className="icon-badge-green w-max"><Users className="h-5 w-5" color="#1CB255" /></div>
                <CardTitle className="text-white text-lg">Role‑Based Access & Workflow Automation</CardTitle>
                <CardDescription className="text-white/75 leading-relaxed">
                  Empower your Deployment Engineers, Ops Managers, and Admin teams with tailored access and streamlined approval processes that reduce bottlenecks and enhance collaboration.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-surface">
              <CardHeader className="p-6 space-y-2">
                <div className="icon-badge-green w-max"><Wallet className="h-5 w-5" color="#1CB255" /></div>
                <CardTitle className="text-white text-lg">Seamless Cost Management</CardTitle>
                <CardDescription className="text-white/75 leading-relaxed">
                  Automatically align configurations with up‑to‑date costing rules to generate accurate budgets, approval‑ready summaries, and forecasting reports—simplifying financial oversight.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="section-divider my-10" />

          <div className="text-center">
            <p className="text-white/80 max-w-4xl mx-auto leading-relaxed">
              Discover how SmartQ LaunchPad transforms complex site deployments into predictable, manageable projects — enabling faster go‑lives, reduced errors, and measurable operational gains.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;