import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  Users, 
  Settings, 
  Bell, 
  LogOut, 
  User, 
  Menu, 
  X,
  Plus, 
  FileText,
  Home,
  MapPin,
  Package,
  Shield,
  BarChart3,
  Database,
  CreditCard,
  Monitor,
  Zap,
  ChevronDown,
  Calendar,
  CheckCircle,
  Eye,
  Download,
  Upload,
  List,
  Search,
  Settings as SettingsIcon,
  Activity,
  ClipboardList,
  Truck,
  Clock,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import smartqLogo from '@/assets/smartq-icon-logo.svg';
import { getRoleConfig, canAccessPage } from '@/lib/roles';
import { Loader } from '@/components/ui/loader';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from 'react';

const Header = () => {
  const { profile, currentRole, availableRoles, switchRole, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleAdminClick = () => {
    navigate('/admin');
  };

  const handleRoleBasedNavigation = (role: string) => {
    switch (role) {
      case 'ops_manager':
        navigate('/dashboard');
        break;
      case 'deployment_engineer':
        navigate('/dashboard');
        break;
      case 'admin':
        navigate('/admin');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const getCurrentRoleConfig = () => {
    if (!currentRole) return null;
    return getRoleConfig(currentRole);
  };

  const roleConfig = getCurrentRoleConfig();
  const RoleIcon = roleConfig?.icon || User;

  // Navigation structure with 6 primary tabs - role-based visibility
  const getNavigationStructure = () => {
    if (!currentRole) {
      return [];
    }

    const baseNavigation = [
      {
        type: 'link' as const,
        path: '/dashboard',
        label: 'Dashboard',
        icon: Home,
        description: 'Overview and analytics',
        roles: ['admin', 'ops_manager', 'deployment_engineer']
      },
      {
        type: 'link' as const,
        path: '/sites',
        label: 'Sites',
        icon: Building,
        description: 'View and manage sites',
        roles: ['admin', 'ops_manager', 'deployment_engineer']
      },
      {
        type: 'link' as const,
        path: '/approvals-procurement',
        label: 'Approvals & Procurement',
        icon: CreditCard,
        description: 'Manage approvals and purchases',
        roles: ['admin', 'ops_manager', 'deployment_engineer']
      },
      {
        type: 'link' as const,
        path: '/deployment',
        label: 'Deployment',
        icon: Package,
        description: 'Track deployment progress',
        roles: ['admin', 'ops_manager', 'deployment_engineer']
      },
      {
        type: 'link' as const,
        path: '/assets',
        label: 'Assets',
        icon: Monitor,
        description: 'Asset management and tracking',
        roles: ['admin', 'ops_manager', 'deployment_engineer']
      },
      {
        type: 'link' as const,
        path: currentRole === 'admin' ? '/admin' : '/platform-configuration',
        label: 'Platform Configuration',
        icon: Settings,
        description: 'System settings and configuration',
        roles: ['admin']
      }
    ];

    // Filter navigation items based on user role and access permissions
    return baseNavigation.filter(item => {
      const hasRoleAccess = item.roles.includes(currentRole);
      const hasTabAccess = canAccessPage(currentRole || 'admin', item.path);
      return hasRoleAccess && hasTabAccess;
    });
  };

  const navigationStructure = getNavigationStructure();

  const isActivePage = (path: string) => {
    return location.pathname === path;
  };

  const handleMobileNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const renderDesktopNavigation = () => (
    <nav className="flex items-center space-x-1">
      {navigationStructure && navigationStructure.length > 0 ? (
        navigationStructure.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isActivePage(item.path)
                ? 'border-2 border-green-600 text-green-700 bg-gradient-to-r from-green-50 to-green-100 shadow-sm'
                : 'text-gray-800 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        ))
      ) : (
        <Loader />
      )}
    </nav>
  );

  const renderMobileNavigation = () => (
    <div className="space-y-4">
      {navigationStructure.map((item) => (
        <Button
          key={item.path}
          variant="ghost"
          className={`w-full justify-start ${
            isActivePage(item.path) 
              ? 'border-2 border-green-600 text-green-700 bg-gradient-to-r from-green-50 to-green-100' 
              : ''
          }`}
          onClick={() => handleMobileNavigation(item.path)}
        >
          <item.icon className="mr-3 h-4 w-4" />
          <div className="text-left">
            <div className="font-medium">{item.label}</div>
          </div>
        </Button>
      ))}
    </div>
  );

  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-50 w-full bg-gradient-to-b from-green-900 to-black shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Left Side - Logo and Search */}
            <div className="flex items-center space-x-6">
              <Link to="/dashboard" className="flex items-center space-x-3">
                <img src={smartqLogo} alt="SmartQ Launchpad" className="h-8 w-8 sm:h-10 sm:w-10" />
                <div className="hidden sm:block">
                  <h1 className="text-lg sm:text-2xl font-bold text-white">SmartQ Launchpad</h1>
                </div>
              </Link>
              
              {/* Search Bar */}
              <div className="hidden md:flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <Search className="h-4 w-4 text-white/70" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent text-white placeholder-white/70 text-sm outline-none w-48"
                />
              </div>
            </div>

            {/* Right Side - Actions and User */}
            <div className="flex items-center space-x-3">
              {/* Mobile Search Button */}
              <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10">
                <Search className="h-5 w-5" />
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                  3
                </Badge>
              </Button>

              {/* User Menu */}
              {!loading && profile && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 text-white hover:bg-white/10">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <RoleIcon className="h-4 w-4 text-white" />
                      </div>
                      <div className="hidden md:block text-left">        
                        <p className="text-sm font-medium text-white">
                          {profile?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-white/80">
                          {roleConfig?.displayName || 'User'}
                        </p>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">     
                    <DropdownMenuItem disabled>
                      <User className="mr-2 h-4 w-4" />
                      <span>{profile?.email}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />

                    {/* Quick Actions */}
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>

                      {canAccessPage(currentRole || 'admin', '/sites') && (
                        <DropdownMenuItem onClick={() => navigate('/sites')}>
                          <FileText className="mr-2 h-4 w-4" />
                          <span>Site Study</span>
                        </DropdownMenuItem>
                      )}

                      {canAccessPage(currentRole || 'admin', '/sites/create') && (
                        <DropdownMenuItem onClick={() => navigate('/sites/create')}>
                          <Plus className="mr-2 h-4 w-4" />
                          <span>Create Site</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    {/* Role Switching */}
                    {availableRoles.length > 1 && (
                      <>
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
                          {availableRoles.map((role) => {
                            const config = getRoleConfig(role);
                            const RoleIconComponent = config.icon;       
                            return (
                              <DropdownMenuItem
                                key={role}
                                onClick={() => {
                                  switchRole(role);
                                  handleRoleBasedNavigation(role);       
                                }}
                                className={`${currentRole === role ? "bg-muted" : ""} flex items-center`}
                              >
                                <RoleIconComponent className={`mr-2 h-4 w-4 ${config.color}`} />
                                <span>{config.displayName}</span>        
                                {currentRole === role && (
                                  <Badge variant="secondary" className="ml-auto text-xs">
                                    Active
                                  </Badge>
                                )}
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                      </>
                    )}

                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Mobile Menu Button */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10">
                    <div className="flex flex-col space-y-1">
                      <div className="w-5 h-0.5 bg-white"></div>     
                      <div className="w-5 h-0.5 bg-white"></div>     
                      <div className="w-5 h-0.5 bg-white"></div>     
                    </div>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="flex items-center space-x-2">
                      <img src={smartqLogo} alt="SmartQ Launchpad" className="h-6 w-6" />
                      <span>Navigation</span>
                    </SheetTitle>
                    <SheetDescription>
                      Access all available features and pages
                    </SheetDescription>
                  </SheetHeader>
                  
                  {/* Mobile Search */}
                  <div className="mt-4 flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                    <Search className="h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="bg-transparent text-gray-900 placeholder-gray-500 text-sm outline-none flex-1"
                    />
                  </div>
                  
                  <div className="mt-6">
                    {!loading && currentRole && renderMobileNavigation()}
                  </div>

                  {/* Mobile User Info */}
                  {!loading && profile && (
                    <div className="mt-8 pt-6 border-t">
                      <div className="flex items-center space-x-3 mb-4"> 
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <RoleIcon className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{profile?.full_name || 'User'}</p>
                          <p className={`text-sm ${roleConfig?.color || 'text-muted-foreground'}`}>
                            {roleConfig?.displayName || 'User'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Mobile Quick Actions */}
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => {
                            handleMobileNavigation('/sites');       
                          }}
                        >
                          <FileText className="mr-3 h-4 w-4" />
                          Site Study
                        </Button>
                        
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => {
                            handleMobileNavigation('/sites/create');    
                          }}
                        >
                          <Plus className="mr-3 h-4 w-4" />
                          Create Site
                        </Button>
                      </div>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs - Second Level */}
      {!loading && currentRole && navigationStructure.length > 0 && (
        <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center lg:justify-start">
              <div className="flex items-center space-x-1 py-3">
                {renderDesktopNavigation()}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;