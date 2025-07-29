import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, Users, Settings, Bell, LogOut, User, Menu, RotateCcw } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import smartqLogo from '@/assets/smartq-logo.png';
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
      default:
        navigate('/dashboard');
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ops_manager':
        return 'OPS Manager';
      case 'deployment_engineer':
        return 'Deployment Engineer';
      case 'admin':
        return 'Admin';
      default:
        return 'User';
    }
  };

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
            <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
              Dashboard
            </Link>
            <a href="#sites" className="text-foreground hover:text-primary transition-colors">
              Sites
            </a>
            <a href="#inventory" className="text-foreground hover:text-primary transition-colors">
              Inventory
            </a>
            <a href="#forecast" className="text-foreground hover:text-primary transition-colors">
              Forecast
            </a>
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
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-foreground">
                      {profile?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getRoleDisplayName(currentRole || 'user')}
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
                    {availableRoles.map((role) => (
                      <DropdownMenuItem 
                        key={role}
                        onClick={() => {
                          switchRole(role);
                          handleRoleBasedNavigation(role);
                        }}
                        className={currentRole === role ? "bg-muted" : ""}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        <span>Switch to {getRoleDisplayName(role)}</span>
                        {currentRole === role && <span className="ml-auto text-xs">(Current)</span>}
                      </DropdownMenuItem>
                    ))}
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