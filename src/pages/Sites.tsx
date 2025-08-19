import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MapPin, Calendar, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useSiteContext } from '@/contexts/SiteContext';
import { useAuth } from '@/hooks/useAuth';
import StatusBadge from '@/components/StatusBadge';

const Sites = () => {
  const navigate = useNavigate();
  const { sites, setSites } = useSiteContext();
  const { currentRole, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);

  // Mock data for development - in production this would come from Supabase
  useEffect(() => {
    if (!authLoading && currentRole && sites.length === 0) {
      setLoading(true);
      // Simulate loading delay
      setTimeout(() => {
        const mockSites = [
          {
            id: '1',
            name: 'Downtown Food Court',
            organization: 'City Center Mall',
            foodCourt: 'Main Level',
            unitCode: 'FC-001',
            goLiveDate: '2024-09-15',
            priority: 'high' as const,
            riskLevel: 'medium' as const,
            status: 'study_completed' as const,
            assignedOpsManager: 'Sarah Johnson',
            assignedDeploymentEngineer: 'Mike Chen',
            stakeholders: [],
            notes: 'High-traffic location requiring advanced queue management',
            description: 'Large food court with 12 vendors and high customer volume',
            lastUpdated: '2024-08-15'
          },
          {
            id: '2',
            name: 'Airport Terminal C',
            organization: 'International Airport',
            foodCourt: 'Terminal C Food Plaza',
            unitCode: 'AP-TC-001',
            goLiveDate: '2024-10-01',
            priority: 'medium' as const,
            riskLevel: 'low' as const,
            status: 'hardware_scoped' as const,
            assignedOpsManager: 'David Wilson',
            assignedDeploymentEngineer: 'Lisa Zhang',
            stakeholders: [],
            notes: 'Airport environment requires special security considerations',
            description: 'Terminal food court serving international travelers',
            lastUpdated: '2024-08-14'
          },
          {
            id: '3',
            name: 'University Campus Hub',
            organization: 'State University',
            foodCourt: 'Student Center',
            unitCode: 'UNI-001',
            goLiveDate: '2024-08-30',
            priority: 'high' as const,
            riskLevel: 'high' as const,
            status: 'deployment' as const,
            assignedOpsManager: 'Jennifer Adams',
            assignedDeploymentEngineer: 'Tom Rodriguez',
            stakeholders: [],
            notes: 'Student rush hours create high-volume periods',
            description: 'Campus dining facility with multiple food stations',
            lastUpdated: '2024-08-13'
          }
        ];
        setSites(mockSites);
        setLoading(false);
      }, 1000);
    }
  }, [authLoading, currentRole, sites.length, setSites]);

  const filteredSites = sites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         site.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         site.unitCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || site.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleCreateSite = () => {
    navigate('/sites/create');
  };

  const handleSiteClick = (siteId: string) => {
    navigate(`/sites/${siteId}`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Access Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You need to be logged in to view sites.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sites</h1>
          <p className="text-muted-foreground">
            Manage and monitor all site deployments
          </p>
        </div>
        <Button onClick={handleCreateSite} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Site
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Status</option>
          <option value="created">Created</option>
          <option value="study_in_progress">Study In Progress</option>
          <option value="study_completed">Study Completed</option>
          <option value="hardware_scoped">Hardware Scoped</option>
          <option value="approved">Approved</option>
          <option value="procurement">Procurement</option>
          <option value="deployment">Deployment</option>
          <option value="activated">Activated</option>
          <option value="live">Live</option>
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Sites Grid */}
      {!loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSites.map((site) => (
            <Card 
              key={site.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleSiteClick(site.id)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{site.name}</CardTitle>
                  <StatusBadge status={site.status} />
                </div>
                <p className="text-sm text-muted-foreground">{site.organization}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{site.foodCourt} - {site.unitCode}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Go Live: {site.goLiveDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{site.assignedOpsManager}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Badge variant={site.priority === 'high' ? 'destructive' : site.priority === 'medium' ? 'default' : 'secondary'}>
                    {site.priority} priority
                  </Badge>
                  <Badge variant={site.riskLevel === 'high' ? 'destructive' : site.riskLevel === 'medium' ? 'default' : 'secondary'}>
                    {site.riskLevel} risk
                  </Badge>
                </div>

                {site.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {site.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredSites.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <MapPin className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No sites found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? "Try adjusting your search or filters" 
              : "Get started by creating your first site"}
          </p>
          {(!searchTerm && filterStatus === 'all') && (
            <Button onClick={handleCreateSite} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Site
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Sites;
