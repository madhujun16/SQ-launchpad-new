import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/roles';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Database, 
  Globe, 
  Settings, 
  Activity, 
  Search, 
  Plus, 
  Filter, 
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  Wifi,
  Shield,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface Integration {
  id: string;
  name: string;
  type: 'api' | 'database' | 'webhook' | 'service';
  status: 'active' | 'error' | 'maintenance' | 'inactive';
  health: 'healthy' | 'warning' | 'critical';
  endpoint: string;
  lastSync: string;
  uptime: number;
  responseTime: number;
  description: string;
}

const Integrations = () => {
  const { currentRole } = useAuth();
  const navigate = useNavigate();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Check if user has permission to access integrations
  useEffect(() => {
    if (currentRole && !hasPermission(currentRole, 'view_dashboard')) {
      toast.error('You do not have permission to access the Integrations panel');
      navigate('/dashboard');
    }
  }, [currentRole, navigate]);

  // Mock data for integrations
  useEffect(() => {
    const mockIntegrations: Integration[] = [
      {
        id: '1',
        name: 'Compass Group API',
        type: 'api',
        status: 'active',
        health: 'healthy',
        endpoint: 'https://api.compassgroup.com/v1',
        lastSync: '2024-07-30 14:30:25',
        uptime: 99.9,
        responseTime: 120,
        description: 'Main API for Compass Group cafeteria management system'
      },
      {
        id: '2',
        name: 'Payment Gateway',
        type: 'service',
        status: 'active',
        health: 'warning',
        endpoint: 'https://payments.stripe.com',
        lastSync: '2024-07-30 14:29:15',
        uptime: 98.7,
        responseTime: 450,
        description: 'Stripe payment processing integration'
      },
      {
        id: '3',
        name: 'Inventory Database',
        type: 'database',
        status: 'maintenance',
        health: 'critical',
        endpoint: 'postgresql://inventory.db',
        lastSync: '2024-07-30 14:28:30',
        uptime: 95.2,
        responseTime: 800,
        description: 'PostgreSQL database for inventory management'
      },
      {
        id: '4',
        name: 'Notification Service',
        type: 'webhook',
        status: 'active',
        health: 'healthy',
        endpoint: 'https://notifications.service',
        lastSync: '2024-07-30 14:27:45',
        uptime: 99.5,
        responseTime: 180,
        description: 'Webhook service for real-time notifications'
      }
    ];
    setIntegrations(mockIntegrations);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'api': return Globe;
      case 'database': return Database;
      case 'webhook': return Zap;
      case 'service': return Settings;
      default: return Activity;
    }
  };

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.endpoint.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || integration.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getKeyMetrics = () => {
    const total = integrations.length;
    const active = integrations.filter(item => item.status === 'active').length;
    const error = integrations.filter(item => item.status === 'error').length;
    const maintenance = integrations.filter(item => item.status === 'maintenance').length;
    
    return { total, active, error, maintenance };
  };

  const metrics = getKeyMetrics();

  // If user doesn't have permission, show access denied
  if (currentRole && !hasPermission(currentRole, 'view_dashboard')) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
            <p className="text-muted-foreground">
              You do not have permission to access the Integrations panel.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Control Desk</h1>
          <p className="text-muted-foreground">
            Manage system integrations and API connections across all services
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Errors</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.error}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{metrics.maintenance}</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-4">
            <Button className="bg-primary hover:bg-primary-dark">
              <Plus className="mr-2 h-4 w-4" />
              Add Integration
            </Button>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search integrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((integration) => {
            const TypeIcon = getTypeIcon(integration.type);
            return (
              <Card key={integration.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <TypeIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <span className="capitalize">{integration.type}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge className={getStatusColor(integration.status)}>
                        {integration.status}
                      </Badge>
                      <Badge variant="outline" className={getHealthColor(integration.health)}>
                        {integration.health}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Endpoint</span>
                      <span className="font-medium text-xs truncate max-w-32">{integration.endpoint}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Uptime</span>
                      <span className="font-medium">{integration.uptime}%</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Response Time</span>
                      <span className="font-medium">{integration.responseTime}ms</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last Sync</span>
                      <span className="font-medium">{integration.lastSync}</span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {integration.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="text-center py-12">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No integrations found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms.' : 'No integrations are currently available.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Integrations; 