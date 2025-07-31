import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/roles';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Building, MapPin, Search, Plus, Filter, Calendar, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Site {
  id: string;
  name: string;
  location: {
    address: string;
    city: string;
    postcode: string;
  };
  status: 'active' | 'inactive' | 'maintenance' | 'deploying';
  type: 'cafeteria' | 'restaurant' | 'food-court';
  capacity: number;
  assignedUsers: number;
  lastUpdated: string;
  description: string;
}

const Site = () => {
  const { currentRole } = useAuth();
  const navigate = useNavigate();
  const [sites, setSites] = useState<Site[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Check if user has permission to access sites
  useEffect(() => {
    if (currentRole && !hasPermission(currentRole, 'view_assigned_sites')) {
      toast.error('You do not have permission to access the Sites panel');
      navigate('/dashboard');
    }
  }, [currentRole, navigate]);

  // Mock data for sites
  useEffect(() => {
    const mockSites: Site[] = [
      {
        id: '1',
        name: 'Manchester Central Cafeteria',
        location: {
          address: '123 Main Street',
          city: 'Manchester',
          postcode: 'M1 1AA'
        },
        status: 'active',
        type: 'cafeteria',
        capacity: 150,
        assignedUsers: 12,
        lastUpdated: '2024-07-30',
        description: 'Main cafeteria serving staff and visitors'
      },
      {
        id: '2',
        name: 'London Bridge Food Court',
        location: {
          address: '456 Bridge Road',
          city: 'London',
          postcode: 'SE1 9GF'
        },
        status: 'deploying',
        type: 'food-court',
        capacity: 300,
        assignedUsers: 8,
        lastUpdated: '2024-07-29',
        description: 'Multi-vendor food court with various cuisines'
      },
      {
        id: '3',
        name: 'Birmingham Office Restaurant',
        location: {
          address: '789 Business Park',
          city: 'Birmingham',
          postcode: 'B1 1AA'
        },
        status: 'maintenance',
        type: 'restaurant',
        capacity: 80,
        assignedUsers: 5,
        lastUpdated: '2024-07-28',
        description: 'Executive restaurant for senior staff'
      }
    ];
    setSites(mockSites);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'deploying': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredSites = sites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         site.location.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || site.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // If user doesn't have permission, show access denied
  if (currentRole && !hasPermission(currentRole, 'view_assigned_sites')) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
            <p className="text-muted-foreground">
              You do not have permission to access the Sites panel.
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
          <h1 className="text-3xl font-bold text-foreground">Site Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor all Compass Group sites and locations
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-4">
            <Button className="bg-primary hover:bg-primary-dark">
              <Plus className="mr-2 h-4 w-4" />
              Add New Site
            </Button>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        {/* Sites Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSites.map((site) => (
            <Card key={site.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{site.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {site.location.city}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(site.status)}>
                    {site.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium capitalize">{site.type}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="font-medium">{site.capacity} seats</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Assigned Users</span>
                    <span className="font-medium">{site.assignedUsers}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="font-medium">{site.lastUpdated}</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {site.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSites.length === 0 && (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No sites found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms.' : 'No sites are currently available.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Site; 