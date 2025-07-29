import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, Users, Settings, Bell } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-background border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Building className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">SmartQ LaunchPad</h1>
                <p className="text-sm text-muted-foreground">Site Onboarding Management</p>
              </div>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#dashboard" className="text-foreground hover:text-primary transition-colors">
              Dashboard
            </a>
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
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-foreground">Admin User</p>
                <p className="text-xs text-muted-foreground">admin@smartq.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;