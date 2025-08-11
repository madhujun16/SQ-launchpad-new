import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  User, 
  FileText, 
  Plus, 
  LogOut,
  Menu,
  X,
  Home,
  Building,
  Package,
  Settings,
  BarChart3,
  Users
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getRoleConfig } from '@/lib/roles';
import { canAccessPage } from '@/lib/roles';
import { RocketIcon } from '@/components/ui/RocketIcon';
import { useIsMobile } from '@/hooks/use-mobile';

const Header = () => {
  const { currentRole, profile, signOut, switchRole, availableRoles } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, isTablet, isTouchDevice } = useIsMobile();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen && !(event.target as Element).closest('[data-mobile-menu]')) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobileMenuOpen]);

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
        canAccess: canAccessPage(currentRole, '/dashboard')
      },
      {
        type: 'link' as const,
        path: '/sites',
        label: 'Sites',
        icon: Building,
        canAccess: canAccessPage(currentRole, '/sites')
      },
      {
        type: 'link' as const,
        path: '/inventory',
        label: 'Inventory',
        icon: Package,
        canAccess: canAccessPage(currentRole, '/inventory')
      },
      {
        type: 'link' as const,
        path: '/deployment',
        label: 'Deployment',
        icon: Users,
        canAccess: canAccessPage(currentRole, '/deployment')
      },
      {
        type: 'link' as const,
        path: '/forecast',
        label: 'Forecast',
        icon: BarChart3,
        canAccess: canAccessPage(currentRole, '/forecast')
      },
      {
        type: 'link' as const,
        path: '/admin',
        label: 'Admin',
        icon: Settings,
        canAccess: canAccessPage(currentRole, '/admin')
      }
    ];

    return baseNavigation.filter(item => item.canAccess);
  };

  const navigationStructure = getNavigationStructure();

  const isActivePage = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleMobileNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const renderDesktopNavigation = () => (
    <div className="hidden lg:flex items-center space-x-1">
      {navigationStructure.map((item) => (
        <Button
          key={item.path}
          variant="ghost"
          className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${
            isActivePage(item.path) 
              ? 'border-2 border-green-600 text-green-700 bg-gradient-to-r from-green-50 to-green-100' 
              : 'text-gray-700 hover:text-green-700 hover:bg-green-50'
          }`}
          onClick={() => navigate(item.path)}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.label}
        </Button>
      ))}
    </div>
  );

  const renderMobileNavigation = () => (
    <div className="space-y-2">
      {navigationStructure.map((item) => (
        <Button
          key={item.path}
          variant="ghost"
          className={`w-full justify-start text-left h-12 px-4 ${
            isActivePage(item.path) 
              ? 'bg-green-100 text-green-700 border-l-4 border-green-600' 
              : 'hover:bg-gray-100'
          }`}
          onClick={() => handleMobileNavigation(item.path)}
        >
          <item.icon className="mr-3 h-5 w-5" />
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
      <header className="sticky top-0 z-50 w-full bg-gradient-to-b from-black to-green-900 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Left Side - Logo and Search */}
            <div className="flex items-center space-x-4 lg:space-x-6">
              <Link to="/dashboard" className="flex items-center space-x-2 lg:space-x-3">
                <RocketIcon className="h-8 w-8 sm:h-10 sm:w-10" />
                <div className="hidden sm:block">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Launchpad</h1>
                </div>
              </Link>
              

            </div>

            {/* Right Side - Actions and User */}
            <div className="flex items-center space-x-2 lg:space-x-3">


              {/* Notifications */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative text-white hover:bg-white/10 h-10 w-10"
              >
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                  3
                </Badge>
              </Button>

              {/* User Menu */}
              {!loading && profile && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 text-white hover:bg-white/10 h-10 px-3">
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
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="lg:hidden text-white hover:bg-white/10 h-10 w-10"
                    data-mobile-menu
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-0" data-mobile-menu>
                  <SheetHeader className="px-6 py-4 border-b">
                    <SheetTitle className="flex items-center space-x-2">
                      <RocketIcon className="h-6 w-6" />
                      <span>Navigation</span>
                    </SheetTitle>
                    <SheetDescription>
                      Access all available features and pages
                    </SheetDescription>
                  </SheetHeader>
                  

                  
                  <div className="px-6 py-4">
                    {!loading && currentRole && renderMobileNavigation()}
                  </div>

                  {/* Mobile User Info */}
                  {!loading && profile && (
                    <div className="px-6 py-4 border-t mt-auto">
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
                          className="w-full justify-start h-12"
                          onClick={() => handleMobileNavigation('/sites')}
                        >
                          <FileText className="mr-3 h-4 w-4" />
                          Site Study
                        </Button>
                        
                        <Button
                          variant="outline"
                          className="w-full justify-start h-12"
                          onClick={() => handleMobileNavigation('/sites/create')}
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
            <div className="flex items-center justify-center lg:justify-start overflow-x-auto">
              <div className="flex items-center space-x-1 py-3 min-w-max">
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