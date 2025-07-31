import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, Users, Settings, Bell, LogOut, User, Menu, RotateCcw } from "lucide-react";
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
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const { profile, currentRole, availableRoles, switchRole, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAdminClick = () => {
    navigate('/admin');
  };

  const handleRoleBasedNavigation = (role: string) => {
    switch (role) {
      case 'ops_manager':
        navigate('/ops-manager');
        break;
      case 'deployment_engineer':
        navigate('/deployment');
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

  // Get accessible navigation items based on current role
  const getAccessibleNavItems = () => {
    if (!currentRole) return [];
    
    const items = [];
    
    // Dashboard is always accessible
    items.push({ path: '/dashboard', label: 'Dashboard' });
    
    // Role-specific navigation
    if (canAccessPage(currentRole, '/site-study')) {
      items.push({ path: '/site-study', label: 'Site Study' });
    }
    
    if (canAccessPage(currentRole, '/admin')) {
      items.push({ path: '/admin', label: 'Admin' });
    }
    
    if (canAccessPage(currentRole, '/ops-manager')) {
      items.push({ path: '/ops-manager', label: 'Ops Manager' });
    }
    
    if (canAccessPage(currentRole, '/deployment')) {
      items.push({ path: '/deployment', label: 'Deployment' });
    }
    
    return items;
  };

  const navItems = getAccessibleNavItems();

  return (
    <header className="bg-background border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between relative">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <img src={smartqLogo} alt="SmartQ Launchpad" className="h-10 w-10" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">SmartQ Launchpad</h1>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-foreground hover:text-primary transition-colors ${
                  location.pathname === item.path ? 'text-primary font-medium' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-warning text-warning-foreground text-xs flex items-center justify-center p-0">
                3
              </Badge>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <RoleIcon className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-foreground">
                      {profile?.full_name || 'User'}
                    </p>
                    <p className={`text-xs ${roleConfig?.color || 'text-muted-foreground'}`}>
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
                
                {/* Role Switching */}
                {availableRoles.length > 1 && (
                  <>
                    <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                      Switch Role
                    </div>
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
                    <DropdownMenuSeparator />
                  </>
                )}

                {/* Admin Panel */}
                {availableRoles.includes('admin') && (
                  <DropdownMenuItem onClick={handleAdminClick}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Admin Panel</span>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;