import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
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
import { NotificationBell } from '@/components/NotificationBell';
import { useAuth } from '@/hooks/useAuth';
import { getRoleConfig, type UserRole } from '@/lib/roles';
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
    navigate('/platform-configuration');
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

  // Ensure role switcher appears for users with multiple roles
  const rolesForSwitch = (() => {
    // If we have available roles from the database, use them
    if (availableRoles && availableRoles.length > 1) {
      return availableRoles;
    }
    
    // For other users, only show if they have multiple roles
    return availableRoles && availableRoles.length > 1 ? availableRoles : [];
  })();

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
        path: '/approvals-procurement',
        label: 'Approvals',
        icon: FileText,
        canAccess: canAccessPage(currentRole, '/approvals-procurement')
      },
      {
        type: 'link' as const,
        path: '/assets',
        label: 'Assets',
        icon: Package,
        canAccess: canAccessPage(currentRole, '/assets')
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
              ? 'nav-active'
              : 'text-white/85 hover:text-white hover:bg-white/10'
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
              ? 'bg-emerald-900/40 text-white border-l-4 border-emerald-400'
              : 'hover:bg-white/10 text-white'
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
      <header className="sticky top-0 z-50 w-full header-black-green">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center space-x-3">
                <RocketIcon size={56} className="text-white" />
                <span className="text-xl font-bold text-white hidden sm:block">
                  SmartQ Launchpad
                </span>
              </Link>
            </div>

            {/* Desktop Navigation (primary) */}
            <nav className="hidden lg:flex items-center space-x-1">
              {getNavigationStructure().map((item) => {
                if (item.type === 'link' && item.canAccess) {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${isActive ? 'nav-active' : 'text-white/85 hover:text-white hover:bg-white/10'}
                      `}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                }
                return null;
              })}
            </nav>

            {/* Right Side - Actions and User */}
            <div className="flex items-center space-x-2 lg:space-x-3">
              {/* Notifications */}
              <NotificationBell className="text-white hover:bg-white/10" />

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

                      {canAccessPage(currentRole || 'admin', '/sites/create') && (
                        <DropdownMenuItem onClick={() => navigate('/sites/create')}>
                          <Plus className="mr-2 h-4 w-4" />
                          <span>Create Site</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    {/* Role Switching */}
                    {rolesForSwitch.length > 1 && (
                      <>
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
                          {rolesForSwitch.map((role) => {
                            const config = getRoleConfig(role as UserRole);
                            const RoleIconComponent = config.icon;
                            return (
                              <DropdownMenuItem
                                key={role}
                                onClick={() => {
                                  switchRole(role as UserRole);
                                  handleRoleBasedNavigation(role);
                                }}
                                className={`${currentRole === role ? 'bg-muted' : ''} flex items-center`}
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

                    {canAccessPage(currentRole || 'admin', '/admin') && (
                      <DropdownMenuItem onClick={handleAdminClick}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Platform Configuration</span>
                      </DropdownMenuItem>
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
                    <div className="px-6 py-4 border-t">
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
                          onClick={() => handleMobileNavigation('/sites/create')}
                        >
                          <Plus className="mr-3 h-4 w-4" />
                          Create Site
                        </Button>

                        {canAccessPage(currentRole || 'admin', '/admin') && (
                          <Button
                            variant="outline"
                            className="w-full justify-start h-12"
                            onClick={() => handleMobileNavigation('/platform-configuration')}
                          >
                            <Settings className="mr-3 h-4 w-4" />
                            Platform Configuration
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Switch Role (mobile) */}
                  {!loading && rolesForSwitch.length > 1 && (
                    <div className="px-6 py-4 border-t">
                      <p className="text-sm font-medium mb-2">Switch Role</p>
                      <div className="space-y-2">
                        {rolesForSwitch.map((role) => {
                          const config = getRoleConfig(role as UserRole);
                          const Icon = config.icon;
                          const isActive = currentRole === role;
                          return (
                            <Button
                              key={role}
                              variant={isActive ? 'gradient' : 'outline'}
                              className="w-full justify-start h-10"
                              onClick={() => {
                                switchRole(role as UserRole);
                                handleRoleBasedNavigation(role);
                                setIsMobileMenuOpen(false);
                              }}
                            >
                              <Icon className="mr-3 h-4 w-4" />
                              <span>{config.displayName}</span>
                              {isActive && (
                                <Badge variant="secondary" className="ml-auto">Active</Badge>
                              )}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;