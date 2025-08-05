import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/roles';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Clock, 
  Users, 
  Target, 
  Search, 
  Plus, 
  Filter, 
  Download,
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface TaskEntry {
  id: string;
  taskName: string;
  assignedTo: string;
  status: 'completed' | 'in-progress' | 'pending' | 'overdue';
  priority: 'high' | 'medium' | 'low';
  estimatedHours: number;
  actualHours: number;
  startDate: string;
  dueDate: string;
  progress: number;
}

interface SiteProject {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  progress: number;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  tasks: TaskEntry[];
}

const Forecast = () => {
  const { currentRole } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<SiteProject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Check if user has permission to access forecast
  useEffect(() => {
    if (currentRole && !hasPermission(currentRole, 'view_dashboard')) {
      toast.error('You do not have permission to access the Forecast panel');
      navigate('/dashboard');
    }
  }, [currentRole, navigate]);

  // Mock data for projects
  useEffect(() => {
    const mockProjects: SiteProject[] = [
      {
        id: '1',
        name: 'ADIDAS - Manchester Central',
        description: 'Complete cafeteria deployment for ADIDAS Manchester Central location',
        status: 'active',
        progress: 75,
        startDate: '2024-06-15',
        endDate: '2024-08-30',
        budget: 150000,
        spent: 112500,
        tasks: [
          {
            id: '1-1',
            taskName: 'Hardware Installation',
            assignedTo: 'John Smith',
            status: 'completed',
            priority: 'high',
            estimatedHours: 40,
            actualHours: 38,
            startDate: '2024-06-15',
            dueDate: '2024-06-25',
            progress: 100
          },
          {
            id: '1-2',
            taskName: 'Software Configuration',
            assignedTo: 'Sarah Johnson',
            status: 'in-progress',
            priority: 'high',
            estimatedHours: 60,
            actualHours: 45,
            startDate: '2024-06-20',
            dueDate: '2024-07-10',
            progress: 75
          },
          {
            id: '1-3',
            taskName: 'Staff Training',
            assignedTo: 'Mike Davis',
            status: 'pending',
            priority: 'medium',
            estimatedHours: 20,
            actualHours: 0,
            startDate: '2024-07-15',
            dueDate: '2024-07-25',
            progress: 0
          }
        ]
      },
      {
        id: '2',
        name: 'Nike - London Bridge',
        description: 'Food court deployment for Nike London Bridge location',
        status: 'planning',
        progress: 25,
        startDate: '2024-08-01',
        endDate: '2024-10-15',
        budget: 200000,
        spent: 50000,
        tasks: [
          {
            id: '2-1',
            taskName: 'Site Survey',
            assignedTo: 'Emma Wilson',
            status: 'completed',
            priority: 'high',
            estimatedHours: 16,
            actualHours: 14,
            startDate: '2024-08-01',
            dueDate: '2024-08-05',
            progress: 100
          },
          {
            id: '2-2',
            taskName: 'Equipment Procurement',
            assignedTo: 'David Brown',
            status: 'in-progress',
            priority: 'high',
            estimatedHours: 80,
            actualHours: 60,
            startDate: '2024-08-10',
            dueDate: '2024-09-15',
            progress: 75
          }
        ]
      }
    ];
    setProjects(mockProjects);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'overdue': return 'bg-red-500';
      case 'planning': return 'bg-purple-500';
      case 'active': return 'bg-blue-500';
      case 'on-hold': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getKeyMetrics = () => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
    
    return { totalProjects, activeProjects, completedProjects, totalBudget, totalSpent };
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
              You do not have permission to access the Forecast panel.
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
          <h1 className="text-3xl font-bold text-foreground">Project Forecast</h1>
          <p className="text-muted-foreground">
            Monitor project timelines, budgets, and resource allocation across all sites
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalProjects}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{metrics.activeProjects}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics.completedProjects}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Utilized</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{(metrics.totalSpent / 1000).toFixed(0)}k</div>
              <p className="text-xs text-muted-foreground">
                of £{(metrics.totalBudget / 1000).toFixed(0)}k
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-4">
            <Button variant="gradient">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="space-y-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    <CardDescription className="mt-2">
                      {project.description}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      Budget: £{(project.budget / 1000).toFixed(0)}k
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  
                  {/* Project Details */}
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Start Date</span>
                      <div className="font-medium">{project.startDate}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">End Date</span>
                      <div className="font-medium">{project.endDate}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Spent</span>
                      <div className="font-medium">£{(project.spent / 1000).toFixed(0)}k</div>
                    </div>
                  </div>
                  
                  {/* Tasks */}
                  <div>
                    <h4 className="font-semibold mb-3">Tasks</h4>
                    <div className="space-y-2">
                      {project.tasks.map((task) => (
                        <div key={task.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{task.taskName}</span>
                              <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Assigned to {task.assignedTo}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm font-medium">{task.actualHours}h / {task.estimatedHours}h</div>
                              <div className="text-xs text-muted-foreground">Hours</div>
                            </div>
                            <Badge className={getStatusColor(task.status)}>
                              {task.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No projects found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms.' : 'No projects are currently available.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Forecast; 