import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  Users,
  Database,
  LogOut, 
  Menu,
  RefreshCw,
  X,
  Shield,
  UserCheck,
  Monitor,
  FileCheck,
  ClipboardList
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
  { path: '/deployment', label: 'Deployment', icon: Truck },
  { path: '/forecast', label: 'Forecast', icon: BarChart3 },
  { path: '/assets', label: 'Assets', icon: Package }
] as const;

// Logo Component
const Logo = React.memo(() => (
  <Link to="/" className="flex items-center space-x-3">
    <span className="text-2xl font-bold text-white">SmartQ Launchpad</span>
    <div className="flex items-center">
      <RocketIcon className="h-10 w-10 text-green-400" />
    </div>
  </Link>
));

// Mobile Logo Component (logo only)
const MobileLogo = React.memo(() => (
  <Link to="/" className="flex items-center">
    <RocketIcon className="h-8 w-8 text-green-400" />
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
  onClick,
  disabled 
}: { 
  isOpen: boolean; 
  onClick: () => void; 
  disabled: boolean;
}) => (
  <Button
    variant="ghost"
    size="sm"
    className="lg:hidden text-white hover:bg-white/10 p-2"
    onClick={onClick}
    aria-label="Toggle mobile menu"
    disabled={disabled}
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
  profile: { full_name?: string; email?: string } | null; 
  roleConfig: { displayName: string; icon?: React.ComponentType<{ className?: string }> } | null; 
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
  onRoleSwitch,
  onNavigate,
  isReady
}: { 
  isOpen: boolean; 
  navigationItems: NavigationItem[]; 
  currentPath: string; 
  currentRole: UserRole | null;
  availableRoles: UserRole[];
  onClose: () => void; 
  onRoleSwitch: (role: UserRole) => void; 
  onNavigate: (path: string) => void;
  isReady: boolean;
}) => {
  if (!isOpen) return null;
  
  // Show loading state if navigation is not ready
  if (!isReady) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-sm w-[85vw] shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <RocketIcon className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">SmartQ Launchpad</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">Loading navigation...</p>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        </div>
      </div>
    );
  }
  
  const handleNavigationClick = (path: string) => {
    // Close menu first
    onClose();
    
    // Use setTimeout to ensure the menu closes before navigation
    setTimeout(() => {
      onNavigate(path);
    }, 100);
  };

  const handleRoleSwitchClick = (role: UserRole) => {
    // Don't switch if it's the same role
    if (currentRole === role) {
      onClose();
      return;
    }
    
    // Close menu first, then switch role
    onClose();
    setTimeout(() => {
      onRoleSwitch(role);
    }, 100);
  };

  const handleSignOut = () => {
    onClose();
    setTimeout(() => {
      window.location.href = '/auth';
    }, 100);
  };
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9998]" 
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full w-[85vw] max-w-sm mobile-sidebar-background z-[9999] overflow-y-auto border-r border-green-600 transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="sticky top-0 bg-[#0A4D2C] border-b border-green-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-xl font-bold text-white">SmartQ Launchpad</span>
              <RocketIcon className="h-6 w-6 text-green-400" />
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Navigation Items */}
        <div className="p-4 space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigationClick(item.path)}
                             className={`w-full text-left flex items-center space-x-3 px-4 py-3.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                 currentPath === item.path
                   ? 'bg-white/5 text-white border-2 border-green-400'
                   : 'text-white/85 hover:bg-white/10 hover:text-white border-2 border-transparent hover:border-white/20'
               }`}
             >
               <div className={`p-2 rounded-lg ${
                 currentPath === item.path 
                   ? 'bg-white/10 text-white' 
                   : 'bg-white/10 text-white/85'
               }`}>
                 <item.icon className="h-4 w-4 flex-shrink-0" />
               </div>
              <span className="font-semibold">{item.label}</span>
            </button>
          ))}
          
          {/* Platform Configuration Section - Admin Only */}
          {currentRole === 'admin' && (
            <div className="space-y-2 mt-6 pt-6 border-t border-green-600">
              <div className="px-4 py-2">
                <p className="text-xs font-bold text-white/60 uppercase tracking-wider">
                  Platform Configuration
                </p>
              </div>
              
              {/* Organizations Management */}
              <button
                onClick={() => handleNavigationClick('/platform-configuration/organizations')}
                                 className={`w-full text-left flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                   currentPath === '/platform-configuration/organizations'
                     ? 'bg-white/5 text-white border-2 border-green-400'
                     : 'text-white/85 hover:bg-white/10 hover:text-white border-2 border-transparent hover:border-white/20'
                 }`}
              >
                <div className={`p-2 rounded-lg ${
                  currentPath === '/platform-configuration/organizations' 
                    ? 'bg-white/10 text-white' 
                    : 'bg-white/10 text-white/85'
                }`}>
                  <Building className="h-4 w-4 flex-shrink-0" />
                </div>
                <span className="font-semibold">Organizations</span>
              </button>

              {/* User Management */}
              <button
                onClick={() => handleNavigationClick('/platform-configuration/users')}
                                 className={`w-full text-left flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                   currentPath === '/platform-configuration/users'
                     ? 'bg-white/5 text-white border-2 border-green-400'
                     : 'text-white/85 hover:bg-white/10 hover:text-white border-2 border-transparent hover:border-white/20'
                 }`}
              >
                <div className={`p-2 rounded-lg ${
                  currentPath === '/platform-configuration/users' 
                    ? 'bg-white/10 text-white' 
                    : 'bg-white/10 text-white/85'
                }`}>
                  <UserCheck className="h-4 w-4 flex-shrink-0" />
                </div>
                <span className="font-semibold">User Management</span>
              </button>

              {/* Software & Hardware */}
              <button
                onClick={() => handleNavigationClick('/platform-configuration/software-hardware')}
                                 className={`w-full text-left flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                   currentPath === '/platform-configuration/software-hardware'
                     ? 'bg-white/5 text-white border-2 border-green-400'
                     : 'text-white/85 hover:bg-white/10 hover:text-white border-2 border-transparent hover:border-white/20'
                 }`}
              >
                <div className={`p-2 rounded-lg ${
                  currentPath === '/platform-configuration/software-hardware' 
                    ? 'bg-white/10 text-white' 
                    : 'bg-white/10 text-white/85'
                }`}>
                  <Monitor className="h-4 w-4 flex-shrink-0" />
                </div>
                <span className="font-semibold">Software & Hardware</span>
              </button>

              {/* General Settings */}
              <button
                onClick={() => handleNavigationClick('/platform-configuration/general')}
                                 className={`w-full text-left flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                   currentPath === '/platform-configuration/general'
                     ? 'bg-white/5 text-white border-2 border-green-400'
                     : 'text-white/85 hover:bg-white/10 hover:text-white border-2 border-transparent hover:border-white/20'
                 }`}
              >
                <div className={`p-2 rounded-lg ${
                  currentPath === '/platform-configuration/general' 
                    ? 'bg-white/10 text-white' 
                    : 'bg-white/10 text-white/85'
                }`}>
                  <Settings className="h-4 w-4 flex-shrink-0" />
                </div>
                <span className="font-semibold">General</span>
              </button>

              {/* Audit & Logs */}
              <button
                onClick={() => handleNavigationClick('/platform-configuration/audit-logs')}
                                 className={`w-full text-left flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                   currentPath === '/platform-configuration/audit-logs'
                     ? 'bg-white/5 text-white border-2 border-green-400'
                     : 'text-white/85 hover:bg-white/10 hover:text-white border-2 border-transparent hover:border-white/20'
                 }`}
              >
                <div className={`p-2 rounded-lg ${
                  currentPath === '/platform-configuration/audit-logs' 
                    ? 'bg-white/10 text-white' 
                    : 'bg-white/10 text-white/85'
                }`}>
                  <ClipboardList className="h-4 w-4 flex-shrink-0" />
                </div>
                <span className="font-semibold">Audit & Logs</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Role Information and Switcher */}
        <div className="p-4 mt-6 pt-6 border-t border-green-600">
          {/* Current Role Display */}
          <div className="px-4 py-4 bg-white/5 rounded-lg border border-white/10 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">R</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {getRoleConfig(currentRole || 'admin').displayName}
                </p>
                <p className="text-xs text-white/60 font-medium">Current Role</p>
              </div>
            </div>
          </div>
          
          {/* Role Switcher - Only show if user has multiple roles */}
          {availableRoles.length > 1 && (
            <div className="mb-6">
              <p className="text-xs font-bold text-white/60 mb-3 uppercase tracking-wider px-4">Switch Role</p>
              <div className="space-y-2">
                {availableRoles.map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleSwitchClick(role)}
                                         className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 ${
                       role === currentRole
                         ? 'bg-white/5 text-white border-2 border-green-400'
                         : 'text-white/85 hover:bg-white/10 hover:text-white border-2 border-transparent hover:border-white/20'
                     }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{getRoleConfig(role).displayName}</span>
                      {role === currentRole && (
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full text-left flex items-center space-x-3 px-4 py-3.5 rounded-lg text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 cursor-pointer transition-all duration-200 border border-red-500/30 hover:border-red-400/50"
          >
            <div className="p-2 rounded-lg bg-red-500/20 text-red-300">
              <LogOut className="h-4 w-4 flex-shrink-0" />
            </div>
            <span className="font-semibold">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
});

// Main Header Component
const Header = () => {
  const { currentRole, profile, signOut, switchRole, availableRoles, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, isTablet, isTouchDevice } = useIsMobile();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  // Wait for auth to be ready before allowing navigation
  useEffect(() => {
    if (!authLoading && currentRole) {
      setIsNavigationReady(true);
    }
  }, [authLoading, currentRole]);

  // Memoized values
  const roleConfig = useMemo(() => {
    if (!currentRole) return null;
    return getRoleConfig(currentRole);
  }, [currentRole]);

  const RoleIcon = useMemo(() => roleConfig?.icon || User, [roleConfig]);

  const currentPath = useMemo(() => location.pathname, [location.pathname]);

  // Memoized navigation structure - only show when auth is ready
  const navigationItems = useMemo(() => {
    if (!currentRole || !isNavigationReady) return [];

    return NAVIGATION_ITEMS.map(item => ({
      ...item,
      canAccess: canAccessPage(currentRole, item.path)
    })).filter(item => item.canAccess);
  }, [currentRole, isNavigationReady]);

  // Memoized roles for switching
  const rolesForSwitch = useMemo(() => {
    if (availableRoles && availableRoles.length > 1) {
      return availableRoles;
    }
    return [];
  }, [availableRoles]);

  // Memoized handlers
  const handleMobileMenuToggle = useCallback(() => {
    // Only allow opening if auth is ready
    if (!isNavigationReady) {
      console.log('Navigation not ready yet, auth still loading...');
      return;
    }
    
    try {
      setIsMobileMenuOpen(prev => !prev);
    } catch (error) {
      console.error('Error toggling mobile menu:', error);
    }
  }, [isNavigationReady]);

  const handleMobileMenuClose = useCallback(() => {
    try {
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Error closing mobile menu:', error);
    }
  }, []);

  const handleRoleSwitch = useCallback((role: UserRole) => {
    try {
      switchRole(role);
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Error switching role:', error);
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

  // Early return if no role config or auth still loading
  if (authLoading || !roleConfig) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-black to-green-800 shadow-lg border-b border-green-600">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="hidden lg:block">
                <Logo />
              </div>
              <div className="lg:hidden">
                <MobileLogo />
              </div>
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
            <div className="hidden lg:block">
              <Logo />
            </div>
            <div className="lg:hidden">
              <MobileLogo />
            </div>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <DropdownMenuItem className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-gray-50 cursor-pointer">
                              <div className="flex items-center space-x-2">
                                <Settings className="h-4 w-4 text-gray-600" />
                                <span className="text-sm text-gray-700">Platform Configuration</span>
                              </div>
                              <span className="text-xs text-gray-500">→</span>
                            </DropdownMenuItem>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="ml-2">
                            <DropdownMenuItem asChild>
                              <Link to="/platform-configuration/organizations" className="flex items-center px-2 py-2 rounded-md hover:bg-gray-50 cursor-pointer">
                                <Building className="h-4 w-4 mr-2 text-gray-600" />
                                <span className="text-sm text-gray-700">Organizations</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to="/platform-configuration/users" className="flex items-center px-2 py-2 rounded-md hover:bg-gray-50 cursor-pointer">
                                <UserCheck className="h-4 w-4 mr-2 text-gray-600" />
                                <span className="text-sm text-gray-700">User Management</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to="/platform-configuration/software-hardware" className="flex items-center px-2 py-2 rounded-md hover:bg-gray-50 cursor-pointer">
                                <Monitor className="h-4 w-4 mr-2 text-gray-600" />
                                <span className="text-sm text-gray-700">Software & Hardware</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to="/platform-configuration/general" className="flex items-center px-2 py-2 rounded-md hover:bg-gray-50 cursor-pointer">
                                <Settings className="h-4 w-4 mr-2 text-gray-600" />
                                <span className="text-sm text-gray-700">General</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to="/platform-configuration/audit-logs" className="flex items-center px-2 py-2 rounded-md hover:bg-gray-50 cursor-pointer">
                                <ClipboardList className="h-4 w-4 mr-2 text-gray-600" />
                                <span className="text-sm text-gray-700">Audit & Logs</span>
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
              disabled={!isNavigationReady}
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
        onNavigate={navigate}
        isReady={isNavigationReady}
      />
    </header>
  );
};

export default Header;