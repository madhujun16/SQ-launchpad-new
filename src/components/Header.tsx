import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Users,
  RefreshCw,
  Trash2,
  Truck
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
  { path: '/forecast', label: 'Forecast', icon: BarChart3 },
  { path: '/platform-configuration', label: 'Platform Config', icon: Settings }
] as const;

// Logo Component
const Logo = React.memo(() => (
  <Link to="/" className="flex items-center space-x-2">
    <RocketIcon className="h-8 w-8 text-green-400" />
    <span className="text-xl font-bold text-white">SmartQ Launchpad</span>
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
            ? 'bg-green-600 text-white'
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
    className="lg:hidden"
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
  onClose 
}: { 
  isOpen: boolean; 
  navigationItems: NavigationItem[]; 
  currentPath: string; 
  currentRole: UserRole | null;
  onClose: () => void; 
}) => (
  <Sheet open={isOpen} onOpenChange={onClose}>
    <SheetContent side="left" className="w-80">
      <SheetHeader>
        <SheetTitle>Navigation</SheetTitle>
        <SheetDescription>Access your SmartQ Launchpad features</SheetDescription>
      </SheetHeader>
      
      <div className="mt-6 space-y-2">
        {navigationItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentPath === item.path
                ? 'bg-green-100 text-green-700'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
      
      <div className="mt-8 pt-6 border-t">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-gray-900">
            {getRoleConfig(currentRole || 'admin').displayName}
          </p>
          <p className="text-xs text-gray-500">Current Role</p>
        </div>
      </div>
    </SheetContent>
  </Sheet>
));

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
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleRoleSwitch = useCallback((role: UserRole) => {
    switchRole(role);
    setIsMobileMenuOpen(false);
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
      <header className="bg-gradient-to-r from-black to-green-800 shadow-lg border-b border-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo />
            <div className="flex items-center space-x-4">
              <div className="animate-pulse bg-green-200 h-8 w-32 rounded"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-gradient-to-r from-black to-green-800 shadow-lg border-b border-green-600" data-mobile-menu>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo />
          
          <DesktopNavigation 
            navigationItems={navigationItems} 
            currentPath={currentPath} 
          />
          
          <div className="flex items-center space-x-4">
            <NotificationBell />
            
            <div className="hidden md:flex items-center space-x-3">
              <RoleSwitcher
                availableRoles={rolesForSwitch}
                currentRole={currentRole}
                onRoleSwitch={handleRoleSwitch}
              />
              
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
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
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
        onClose={handleMobileMenuClose}
      />
    </header>
  );
};

export default Header;