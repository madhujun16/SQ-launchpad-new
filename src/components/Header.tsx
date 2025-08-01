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
  Wrench,
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
  AlertCircle
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
  const { profile, currentRole, availableRoles, switchRole, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Navigation structure with dropdowns
  const getNavigationStructure = () => {
    if (!currentRole) return [];

    const structure = [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: Home,
        type: 'link'
      },
      {
        label: 'Sites',
        icon: Building,
        type: 'dropdown',
        items: [
          {
            label: 'Create Site',
            path: '/site-creation',
            icon: Plus,
            description: 'Create new site'
          },
          {
            label: 'Site Management',
            path: '/site',
            icon: Settings,
            description: 'Manage existing sites'
          },
          {
            label: 'Completed Sites',
            path: '/completed-sites',
            icon: CheckCircle,
            description: 'View completed sites'
          },
          {
            label: 'Forecast (Timeline View)',
            path: '/forecast',
            icon: BarChart3,
            description: 'Project timeline view'
          }
        ]
      },
      {
        label: 'Site Study',
        icon: FileText,
        type: 'dropdown',
        items: [
          {
            label: 'Start New Study',
            path: '/site-study',
            icon: Plus,
            description: 'Begin new site study'
          },
          {
            label: 'Completed Studies',
            path: '/completed-studies',
            icon: CheckCircle,
            description: 'View completed studies'
          },
          {
            label: 'View / Edit Studies',
            path: '/edit-studies',
            icon: Eye,
            description: 'Edit existing studies'
          },
          {
            label: 'Export Site Study (PDF)',
            path: '/export-studies',
            icon: Download,
            description: 'Export to PDF'
          }
        ]
      },
      {
        label: 'Hardware',
        icon: Package,
        type: 'dropdown',
        items: [
          {
            label: 'Scope Hardware',
            path: '/hardware-scoping',
            icon: Search,
            description: 'Plan hardware requirements'
          },
          {
            label: 'Approvals (Pending / Approved)',
            path: '/hardware-approvals',
            icon: AlertCircle,
            description: 'Manage approvals'
          },
          {
            label: 'Hardware Master List',
            path: '/hardware-master',
            icon: List,
            description: 'Complete hardware catalog'
          },
          {
            label: 'Vendor Dispatch Status',
            path: '/vendor-dispatch',
            icon: Truck,
            description: 'Track vendor shipments'
          }
        ]
      },
      {
        label: 'Inventory',
        icon: Database,
        type: 'dropdown',
        items: [
          {
            label: 'View All Inventory',
            path: '/inventory',
            icon: Eye,
            description: 'Browse all inventory'
          },
          {
            label: 'Filter by Site / Type',
            path: '/inventory-filters',
            icon: Search,
            description: 'Advanced filtering'
          },
          {
            label: 'Add Asset',
            path: '/add-asset',
            icon: Plus,
            description: 'Add new asset'
          },
          {
            label: 'License & Warranty Tracker',
            path: '/license-management',
            icon: CreditCard,
            description: 'Track licenses & warranties'
          }
        ]
      }
    ];

    // Role-specific dropdowns
    if (canAccessPage(currentRole, '/admin')) {
      structure.push({
        label: 'Admin',
        icon: Shield,
        type: 'dropdown',
        items: [
          {
            label: 'Users & Roles',
            path: '/admin/users',
            icon: Users,
            description: 'Manage users and permissions'
          },
          {
            label: 'Master Settings',
            path: '/admin/settings',
            icon: SettingsIcon,
            description: 'System configuration'
          },
          {
            label: 'Email Templates',
            path: '/admin/email-templates',
            icon: Mail,
            description: 'Manage email templates'
          },
          {
            label: 'System Logs',
            path: '/admin/logs',
            icon: Activity,
            description: 'View system activity'
          }
        ]
      });
    }

    if (canAccessPage(currentRole, '/ops-manager')) {
      structure.push({
        label: 'Ops Manager',
        icon: Users,
        type: 'dropdown',
        items: [
          {
            label: 'My Approvals',
            path: '/ops-manager/approvals',
            icon: CheckCircle,
            description: 'Pending approvals'
          },
          {
            label: 'My Sites',
            path: '/ops-manager/sites',
            icon: Building,
            description: 'Managed sites'
          },
          {
            label: 'Calendar View',
            path: '/ops-manager/calendar',
            icon: Calendar,
            description: 'Schedule overview'
          }
        ]
      });
    }

    if (canAccessPage(currentRole, '/deployment')) {
      structure.push({
        label: 'Deployment',
        icon: Wrench,
        type: 'dropdown',
        items: [
          {
            label: 'Assigned Sites',
            path: '/deployment/assigned',
            icon: MapPin,
            description: 'Your assigned sites'
          },
          {
            label: 'Deployment Checklist',
            path: '/deployment/checklist',
            icon: ClipboardList,
            description: 'Deployment tasks'
          },
          {
            label: 'Upload Status Reports',
            path: '/deployment/reports',
            icon: Upload,
            description: 'Submit reports'
          }
        ]
      });
    }

    return structure;
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
    <nav className="hidden lg:flex items-center space-x-0.5">
      {navigationStructure.map((item) => {
        if (item.type === 'link') {
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                isActivePage(item.path)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:text-primary hover:bg-muted'
              }`}
            >
              <item.icon className="h-3.5 w-3.5" />
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
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 h-auto text-xs font-medium ${
                    item.items?.some(subItem => isActivePage(subItem.path))
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:text-primary hover:bg-muted'
                  }`}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel className="font-semibold text-sm">
                  {item.label}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {item.items?.map((subItem) => (
                  <DropdownMenuItem
                    key={subItem.path}
                    onClick={() => navigate(subItem.path)}
                    className="flex items-start space-x-2.5 p-2.5"
                  >
                    <subItem.icon className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{subItem.label}</div>
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
    <div className="space-y-3">
      {navigationStructure.map((item) => {
        if (item.type === 'link') {
          return (
            <Button
              key={item.path}
              variant={isActivePage(item.path) ? "default" : "ghost"}
              className="w-full justify-start h-9"
              onClick={() => handleMobileNavigation(item.path)}
            >
              <item.icon className="mr-2.5 h-4 w-4" />
              <div className="text-left">
                <div className="font-medium text-sm">{item.label}</div>
              </div>
            </Button>
          );
        }

        if (item.type === 'dropdown') {
          return (
            <div key={item.label} className="space-y-1.5">
              <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground border-b">
                {item.label}
              </div>
              {item.items?.map((subItem) => (
                <Button
                  key={subItem.path}
                  variant={isActivePage(subItem.path) ? "default" : "ghost"}
                  className="w-full justify-start ml-3 h-8"
                  onClick={() => handleMobileNavigation(subItem.path)}
                >
                  <subItem.icon className="mr-2.5 h-3.5 w-3.5" />
                  <div className="text-left">
                    <div className="font-medium text-sm">{subItem.label}</div>
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
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-3 py-2">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <img src={smartqLogo} alt="SmartQ Launchpad" className="h-7 w-7 sm:h-8 sm:w-8" />
              <div className="hidden sm:block">
                <h1 className="text-base sm:text-lg font-bold text-foreground">SmartQ Launchpad</h1>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-0.5 flex-1 justify-center">
            {navigationStructure.map((item) => {
              if (item.type === 'link') {
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActivePage(item.path)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:text-primary hover:bg-muted'
                    }`}
                  >
                    <item.icon className="h-3.5 w-3.5" />
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
                        className={`flex items-center space-x-1.5 px-2.5 py-1.5 h-auto text-xs font-medium ${
                          item.items?.some(subItem => isActivePage(subItem.path))
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:text-primary hover:bg-muted'
                        }`}
                      >
                        <item.icon className="h-3.5 w-3.5" />
                        <span>{item.label}</span>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuLabel className="font-semibold text-sm">
                        {item.label}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {item.items?.map((subItem) => (
                        <DropdownMenuItem
                          key={subItem.path}
                          onClick={() => navigate(subItem.path)}
                          className="flex items-start space-x-2.5 p-2.5"
                        >
                          <subItem.icon className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{subItem.label}</div>
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
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-1 flex-shrink-0">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-warning text-warning-foreground text-xs flex items-center justify-center p-0">
                3
              </Badge>
            </Button>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-1.5 h-8 px-2">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <RoleIcon className="h-3 w-3 text-primary-foreground" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-medium text-foreground">
                      {profile?.full_name || 'User'}
                    </p>
                    <p className={`text-xs ${roleConfig?.color || 'text-muted-foreground'}`}>
                      {roleConfig?.displayName || 'User'}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem disabled className="text-xs">
                  <User className="mr-2 h-3.5 w-3.5" />
                  <span>{profile?.email}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                
                {/* Quick Actions */}
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs">Quick Actions</DropdownMenuLabel>
                  
                  {canAccessPage(currentRole || 'admin', '/site-study') && (
                    <DropdownMenuItem onClick={() => navigate('/site-study')} className="text-xs">
                      <FileText className="mr-2 h-3.5 w-3.5" />
                      <span>Site Study</span>
                    </DropdownMenuItem>
                  )}
                  
                  {canAccessPage(currentRole || 'admin', '/site-creation') && (
                    <DropdownMenuItem onClick={() => navigate('/site-creation')} className="text-xs">
                      <Plus className="mr-2 h-3.5 w-3.5" />
                      <span>Create Site</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
                
                <DropdownMenuSeparator />
                
                {/* Role Switching */}
                {availableRoles.length > 1 && (
                  <>
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs">Switch Role</DropdownMenuLabel>
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
                            className={`${currentRole === role ? "bg-muted" : ""} flex items-center text-xs`}
                          >
                            <RoleIconComponent className={`mr-2 h-3.5 w-3.5 ${config.color}`} />
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
                
                <DropdownMenuItem onClick={signOut} className="text-xs">
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle className="flex items-center space-x-2">
                    <img src={smartqLogo} alt="SmartQ Launchpad" className="h-5 w-5" />
                    <span className="text-sm">Navigation</span>
                  </SheetTitle>
                  <SheetDescription className="text-xs">
                    Access all available features and pages
                  </SheetDescription>
                </SheetHeader>
                
                <div className="mt-4">
                  {renderMobileNavigation()}
                </div>

                {/* Mobile User Info */}
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center space-x-2.5 mb-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <RoleIcon className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{profile?.full_name || 'User'}</p>
                      <p className={`text-xs ${roleConfig?.color || 'text-muted-foreground'}`}>
                        {roleConfig?.displayName || 'User'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Mobile Quick Actions */}
                  <div className="space-y-1.5">
                    <Button
                      variant="outline"
                      className="w-full justify-start h-8 text-xs"
                      onClick={() => {
                        handleMobileNavigation('/site-study');
                      }}
                    >
                      <FileText className="mr-2.5 h-3.5 w-3.5" />
                      Site Study
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start h-8 text-xs"
                      onClick={() => {
                        handleMobileNavigation('/site-creation');
                      }}
                    >
                      <Plus className="mr-2.5 h-3.5 w-3.5" />
                      Create Site
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;