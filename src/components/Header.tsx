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
  Mail,
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

  // Navigation structure with new 6 main tabs
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
        description: 'Overview and analytics'
      },
      {
        type: 'dropdown' as const,
        label: 'Sites',
        icon: Building,
        items: [
          {
            path: '/sites',
            label: 'All Sites',
            icon: Building,
            description: 'View and manage all sites'
          },
          {
            path: '/site-study',
            label: 'Site Studies',
            icon: FileText,
            description: 'Site analysis and planning'
          },
          {
            path: '/site-creation',
            label: 'Create Site',
            icon: Plus,
            description: 'Add new site to the system'
          }
        ]
      },
      {
        type: 'dropdown' as const,
        label: 'Hardware',
        icon: Package,
        items: [
          {
            path: '/hardware-scoping',
            label: 'Hardware Scoping',
            icon: Package,
            description: 'Define hardware requirements'
          },
          {
            path: '/hardware-approvals',
            label: 'Hardware Approvals',
            icon: Shield,
            description: 'Review and approve hardware'
          },
          {
            path: '/hardware-master',
            label: 'Hardware Master',
            icon: Database,
            description: 'Master hardware inventory'
          }
        ]
      },
      {
        type: 'dropdown' as const,
        label: 'Operations',
        icon: Settings,
        items: [
          {
            path: '/deployment',
            label: 'Deployment',
            icon: Truck,
            description: 'Track deployment progress'
          },
          {
            path: '/approvals-procurement',
            label: 'Approvals & Procurement',
            icon: CreditCard,
            description: 'Manage approvals and purchases'
          },
          {
            path: '/assets',
            label: 'Assets',
            icon: Monitor,
            description: 'Asset management and tracking'
          }
        ]
      },
      {
        type: 'dropdown' as const,
        label: 'Management',
        icon: BarChart3,
        items: [
          {
            path: '/inventory',
            label: 'Inventory',
            icon: Package,
            description: 'Inventory management'
          },
          {
            path: '/license-management',
            label: 'License Management',
            icon: Shield,
            description: 'Software license tracking'
          },
          {
            path: '/forecast',
            label: 'Forecast',
            icon: TrendingUp,
            description: 'Future planning and predictions'
          }
        ]
      },
      {
        type: 'dropdown' as const,
        label: 'System',
        icon: Settings,
        items: [
          {
            path: '/platform-configuration',
            label: 'Platform Configuration',
            icon: Settings,
            description: 'System settings and configuration'
          },
          {
            path: '/integrations',
            label: 'Integrations',
            icon: Zap,
            description: 'Third-party integrations'
          }
        ]
      }
    ];

    // Add admin-specific navigation
    if (currentRole === 'admin') {
      baseNavigation.push({
        type: 'link' as const,
        path: '/admin',
        label: 'Admin',
        icon: Shield,
        description: 'Administrative functions'
      });
    }

    return baseNavigation;
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
    <nav className="hidden lg:flex items-center space-x-1">
      {navigationStructure.map((item) => {
        if (item.type === 'link') {
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActivePage(item.path)
                  ? 'bg-white/20 text-white shadow-md backdrop-blur-sm'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        }

        if (item.type === 'dropdown') {
          return (
            <DropdownMenu key={item.label}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`flex items-center space-x-2 px-3 py-2 h-auto ${
                    item.items?.some(subItem => isActivePage(subItem.path))
                      ? 'bg-white/20 text-white shadow-md backdrop-blur-sm'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel className="font-semibold">
                  {item.label}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {item.items?.map((subItem) => (
                  <DropdownMenuItem
                    key={subItem.path}
                    onClick={() => navigate(subItem.path)}
                    className="flex items-start space-x-3 p-3"
                  >
                    <subItem.icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{subItem.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {subItem.description}
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }

        return null;
      })}
    </nav>
  );

  const renderMobileNavigation = () => (
    <div className="space-y-4">
      {navigationStructure.map((item) => {
        if (item.type === 'link') {
          return (
            <Button
              key={item.path}
              variant={isActivePage(item.path) ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => handleMobileNavigation(item.path)}
            >
              <item.icon className="mr-3 h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">{item.label}</div>
              </div>
            </Button>
          );
        }

        if (item.type === 'dropdown') {
          return (
            <div key={item.label} className="space-y-2">
              <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-b">
                {item.label}
              </div>
              {item.items?.map((subItem) => (
                <Button
                  key={subItem.path}
                  variant={isActivePage(subItem.path) ? "default" : "ghost"}
                  className="w-full justify-start ml-4"
                  onClick={() => handleMobileNavigation(subItem.path)}
                >
                  <subItem.icon className="mr-3 h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">{subItem.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {subItem.description}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-green-600 via-green-700 to-black shadow-lg">
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

          {/* Center - Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {!loading && currentRole && renderDesktopNavigation()}
          </div>

          {/* Right Side - Actions and User */}
          <div className="flex items-center space-x-3">
            {/* Mobile Search Button */}
            <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10">
              <Search className="h-5 w-5" />
            </Button>

            {/* Messages */}
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Mail className="h-5 w-5" />
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

                    {canAccessPage(currentRole || 'admin', '/site-study') && (
                      <DropdownMenuItem onClick={() => navigate('/site-study')}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Site Study</span>
                      </DropdownMenuItem>
                    )}

                    {canAccessPage(currentRole || 'admin', '/site-creation') && (
                      <DropdownMenuItem onClick={() => navigate('/site-creation')}>
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
                          handleMobileNavigation('/site-study');       
                        }}
                      >
                        <FileText className="mr-3 h-4 w-4" />
                        Site Study
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          handleMobileNavigation('/site-creation');    
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
  );
};

export default Header;