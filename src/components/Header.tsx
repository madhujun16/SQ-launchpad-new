import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Home, 
  Building, 
  FileText, 
  Package, 
  Truck, 
  BarChart3, 
  Settings, 
  User, 
  LogOut, 
  Menu,
  RefreshCw,
  X
} from 'lucide-react';
import { NotificationBell } from '@/components/NotificationBell';
import { useAuth } from '@/hooks/useAuth';
import { getRoleConfig, type UserRole } from '@/lib/roles';
import { canAccessPage } from '@/lib/roles';
import { RocketIcon } from '@/components/ui/RocketIcon';
import { useIsMobile } from '@/hooks/use-mobile';

// Types
interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  canAccess: boolean;
}

// Constants
const NAVIGATION_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/sites', label: 'Sites', icon: Building },
  { path: '/approvals-procurement', label: 'Approvals', icon: FileText },
  { path: '/assets', label: 'Assets', icon: Package },
  { path: '/deployment', label: 'Deployment', icon: Truck },
  { path: '/forecast', label: 'Forecast', icon: BarChart3 }
] as const;

// Logo Component
const Logo = React.memo(() => (
  <Link to="/" className="flex items-center space-x-3">
    <span className="text-2xl font-bold text-white">Launchpad</span>
    <div className="flex items-center">
      <RocketIcon className="h-10 w-10 text-green-400" />
    </div>
  </Link>
));

// Desktop Navigation Component
const DesktopNavigation = React.memo(({ 
  navigationItems, 
  currentPath 
}: { 
  navigationItems: NavigationItem[]; 
  currentPath: string; 
}) => (
  <nav className="hidden lg:flex items-center space-x-1">
    {navigationItems.map((item) => (
      <Link
        key={item.path}
        to={item.path}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          currentPath === item.path
            ? 'bg-white/10 text-white border border-white/20'
            : 'text-white/85 hover:bg-white/10 hover:text-white'
        }`}
      >
        <item.icon className="h-4 w-4 inline mr-2" />
        {item.label}
      </Link>
    ))}
  </nav>
));

// Mobile Menu Button Component
const MobileMenuButton = React.memo(({ 
  isOpen, 
  onClick 
}: { 
  isOpen: boolean; 
  onClick: () => void; 
}) => (
  <Button
    variant="ghost"
    size="sm"
    className="lg:hidden text-white hover:bg-white/10 p-2"
    onClick={onClick}
    aria-label="Toggle mobile menu"
  >
    {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
  </Button>
));

// User Info Component
const UserInfo = React.memo(({ 
  profile, 
  roleConfig, 
  RoleIcon 
}: { 
  profile: any; 
  roleConfig: any; 
  RoleIcon: React.ComponentType<{ className?: string }>; 
}) => (
  <div className="flex items-center space-x-3">
    <div className="hidden md:flex items-center space-x-2">
      <div className="text-right">
        <p className="text-sm font-medium text-white">
          {profile?.full_name || profile?.email || 'User'}
        </p>
        <p className="text-xs text-white/80">{profile?.email}</p>
      </div>
    </div>
  </div>
));

// Role Switcher Component
const RoleSwitcher = React.memo(({ 
  availableRoles, 
  currentRole, 
  onRoleSwitch 
}: { 
  availableRoles: UserRole[]; 
  currentRole: UserRole | null; 
  onRoleSwitch: (role: UserRole) => void; 
}) => {
  if (availableRoles.length <= 1) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Switch Role
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Available Roles</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableRoles.map((role) => (
          <DropdownMenuItem
            key={role}
            onClick={() => onRoleSwitch(role)}
            className={role === currentRole ? 'bg-green-50 text-green-700' : ''}
          >
            <User className="h-4 w-4 mr-2" />
            {getRoleConfig(role).displayName}
            {role === currentRole && (
              <Badge variant="secondary" className="ml-2">Current</Badge>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

// Mobile Navigation Component
const MobileNavigation = React.memo(({ 
  isOpen, 
  navigationItems, 
  currentPath, 
  currentRole,
  availableRoles,
  onClose, 
  onRoleSwitch
}: { 
  isOpen: boolean; 
  navigationItems: NavigationItem[]; 
  currentPath: string; 
  currentRole: UserRole | null;
  availableRoles: UserRole[];
  onClose: () => void; 
  onRoleSwitch: (role: UserRole) => void; 
}) => {
  console.log('🔍 MobileNavigation render:', { isOpen, currentPath, currentRole, navigationItemsCount: navigationItems.length, availableRoles });
  
  if (!isOpen) return null;
  
  const handleNavigationClick = (path: string) => {
    console.log('🔍 Navigation clicked:', path);
    onClose();
  };

  const handleRoleSwitchClick = (role: UserRole) => {
    console.log('🔍 Role switch clicked:', role);
    onRoleSwitch(role);
    onClose();
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 bg-white z-[9999]">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="text-lg font-semibold text-gray-900">Navigation</SheetTitle>
          <SheetDescription className="text-sm text-gray-600">Access your Launchpad features</SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => handleNavigationClick(item.path)}
              className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                currentPath === item.path
                  ? 'bg-gray-100 text-gray-900 border border-gray-200'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          ))}
          
          {/* Platform Configuration Link - Admin Only */}
          {currentRole === 'admin' && (
            <Link
              to="/platform-configuration"
              onClick={() => handleNavigationClick('/platform-configuration')}
              className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                currentPath === '/platform-configuration'
                  ? 'bg-gray-100 text-gray-900 border border-gray-200'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Platform Configuration</span>
            </Link>
          )}

          {/* Enhanced Stepper Demo Link */}
          <Link
            to="/demo/enhanced-stepper"
            onClick={() => handleNavigationClick('/demo/enhanced-stepper')}
            className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              currentPath === '/demo/enhanced-stepper'
                ? 'bg-gray-100 text-gray-900 border border-gray-200'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Enhanced Stepper Demo</span>
          </Link>
        </div>
        
        <div className="mt-8 pt-6 border-t">
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-gray-900">
              {getRoleConfig(currentRole || 'admin').displayName}
            </p>
            <p className="text-xs text-gray-500">Current Role</p>
          </div>
          
          {/* Role Switcher in Mobile Menu - Only show if user has multiple roles */}
          {availableRoles.length > 1 && (
            <div className="mt-4 px-3">
              <p className="text-xs text-gray-500 mb-2">Switch Role</p>
              <div className="space-y-1">
                {availableRoles.map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleSwitchClick(role)}
                    className={`w-full text-left px-2 py-1 rounded text-sm cursor-pointer ${
                      role === currentRole
                        ? 'bg-gray-100 text-gray-900 border border-gray-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {role === currentRole && (
                      <span className="mr-2 text-green-600">✓</span>
                    )}
                    {getRoleConfig(role).displayName}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
});

// Main Header Component
const Header = () => {
  const { currentRole, profile, signOut, switchRole, availableRoles } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, isTablet, isTouchDevice } = useIsMobile();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Memoized values
  const roleConfig = useMemo(() => {
    if (!currentRole) return null;
    return getRoleConfig(currentRole);
  }, [currentRole]);

  const RoleIcon = useMemo(() => roleConfig?.icon || User, [roleConfig]);

  const currentPath = useMemo(() => location.pathname, [location.pathname]);

  // Memoized navigation structure
  const navigationItems = useMemo(() => {
    if (!currentRole) return [];

    return NAVIGATION_ITEMS.map(item => ({
      ...item,
      canAccess: canAccessPage(currentRole, item.path)
    })).filter(item => item.canAccess);
  }, [currentRole]);

  // Memoized roles for switching
  const rolesForSwitch = useMemo(() => {
    if (availableRoles && availableRoles.length > 1) {
      return availableRoles;
    }
    return [];
  }, [availableRoles]);

  // Memoized handlers
  const handleMobileMenuToggle = useCallback(() => {
    console.log('🔍 Mobile menu toggle clicked, current state:', isMobileMenuOpen);
    try {
      setIsMobileMenuOpen(prev => {
        const newState = !prev;
        console.log('🔍 Setting mobile menu to:', newState);
        return newState;
      });
    } catch (error) {
      console.error('🔍 Error toggling mobile menu:', error);
    }
  }, [isMobileMenuOpen]);

  const handleMobileMenuClose = useCallback(() => {
    console.log('🔍 Mobile menu close called');
    try {
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('🔍 Error closing mobile menu:', error);
    }
  }, []);

  const handleRoleSwitch = useCallback((role: UserRole) => {
    console.log('🔍 Role switch called with role:', role);
    try {
      switchRole(role);
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('🔍 Error switching role:', error);
    }
  }, [switchRole]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate('/auth');
  }, [signOut, navigate]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentPath]);

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

  // Early return if no role config
  if (!roleConfig) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-black to-green-800 shadow-lg border-b border-green-600">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Logo />
            </div>
            <div className="flex items-center space-x-4">
              <div className="animate-pulse bg-green-200 h-8 w-32 rounded"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-black to-green-800 shadow-lg border-b border-green-600" data-mobile-menu>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Logo />
          </div>
          
          <DesktopNavigation 
            navigationItems={navigationItems} 
            currentPath={currentPath} 
          />
          
          <div className="flex items-center space-x-4">
            <NotificationBell />
            
            <div className="hidden md:flex items-center space-x-3">
              <UserInfo 
                profile={profile} 
                roleConfig={roleConfig} 
                RoleIcon={RoleIcon} 
              />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  {/* User Information Section */}
                  <div className="px-3 py-3 border-b">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {profile?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500">{profile?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Account Section */}
                  <div className="px-3 py-2">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Account</p>
                    <div className="space-y-1">
                      {/* Role Switcher - Only show if user has multiple roles */}
                      {availableRoles.length > 1 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <DropdownMenuItem className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-gray-50 cursor-pointer">
                              <div className="flex items-center space-x-2">
                                <Settings className="h-4 w-4 text-gray-600" />
                                <span className="text-sm text-gray-700">Switch Role</span>
                              </div>
                              <span className="text-xs text-gray-500">→</span>
                            </DropdownMenuItem>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="ml-2">
                            {availableRoles.map((role) => {
                              const roleConfig = getRoleConfig(role);
                              return (
                                <DropdownMenuItem
                                  key={role}
                                  onClick={() => {
                                    handleRoleSwitch(role);
                                  }}
                                  className={`flex items-center px-2 py-2 rounded-md ${
                                    role === currentRole ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  {roleConfig.icon && (
                                    <roleConfig.icon className="h-4 w-4 mr-2" />
                                  )}
                                  <span className="text-sm">{roleConfig.displayName}</span>
                                  {role === currentRole && (
                                    <span className="ml-auto text-xs text-green-600">Current</span>
                                  )}
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      
                      {currentRole === 'admin' && (
                        <DropdownMenuItem asChild>
                          <Link to="/platform-configuration" className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-center space-x-2">
                              <Settings className="h-4 w-4 text-gray-600" />
                              <span className="text-sm text-gray-700">Platform Configuration</span>
                            </div>
                            <span className="text-xs text-gray-500">→</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </div>
                  </div>

                  {/* System Section */}
                  <div className="px-3 py-2">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">System</p>
                    <div className="space-y-1">
                      <DropdownMenuItem 
                        onClick={() => window.location.reload()}
                        className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <RefreshCw className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-700">Force Refresh</span>
                        </div>
                        <span className="text-xs text-gray-500">→</span>
                      </DropdownMenuItem>
                    </div>
                  </div>

                  {/* Sign Out Section */}
                  <div className="px-3 py-2 border-t">
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="flex items-center px-2 py-2 rounded-md hover:bg-red-50 cursor-pointer text-red-600 hover:text-red-700"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Sign Out</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Mobile Menu Button - Always visible on mobile */}
            <MobileMenuButton 
              isOpen={isMobileMenuOpen} 
              onClick={handleMobileMenuToggle} 
            />
          </div>
        </div>
      </div>
      
      <MobileNavigation
        isOpen={isMobileMenuOpen}
        navigationItems={navigationItems}
        currentPath={currentPath}
        currentRole={currentRole}
        availableRoles={availableRoles}
        onClose={handleMobileMenuClose}
                    onRoleSwitch={handleRoleSwitch}
          />
        </header>
  );
};

export default Header;