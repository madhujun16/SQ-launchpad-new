import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Edit, 
  CheckCircle, 
  BarChart3 as ProgressIcon, 
  CalendarDays, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { Site } from '@/types/siteTypes';

interface DeploymentStepProps {
  site: Site;
  onSiteUpdate: (updatedSite: Site) => void;
}

const DeploymentStep: React.FC<DeploymentStepProps> = ({ site, onSiteUpdate }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Deployment</h2>
          <p className="text-gray-600 mt-1">Hardware installation and system deployment</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-1" />
            Update Progress
          </Button>
          <Button size="sm">
            <CheckCircle className="h-4 w-4 mr-1" />
            Mark Complete
          </Button>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Deployment Progress */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ProgressIcon className="mr-2 h-5 w-5 text-blue-600" />
              Deployment Progress
            </CardTitle>
            <CardDescription className="text-gray-600">
              Current deployment status and progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Overall Progress</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{site?.deployment?.progress?.overallProgress || 0}%</span>
                  </div>
                  <Progress value={site?.deployment?.progress?.overallProgress || 0} className="h-2" />
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Task Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Hardware Delivered</p>
                        <p className="text-sm text-gray-600">All hardware received on site</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Installation In Progress</p>
                        <p className="text-sm text-gray-600">POS terminals being installed</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium">Testing Pending</p>
                        <p className="text-sm text-gray-600">System testing and validation</p>
                      </div>
                    </div>
                    <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deployment Details */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarDays className="mr-2 h-5 w-5 text-cyan-600" />
              Deployment Details
            </CardTitle>
            <CardDescription className="text-gray-600">
              Key deployment information and timeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Team Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deployment-engineer">Deployment Engineer</Label>
                    <Input id="deployment-engineer" value={site?.deployment?.assignedEngineer || ""} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deployment-team">Deployment Team</Label>
                    <Input id="deployment-team" value="" readOnly className="bg-gray-50" />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Timeline Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input id="start-date" value={site?.deployment?.startDate ? new Date(site.deployment.startDate).toLocaleDateString() : "20th January 2025"} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expected-completion">Expected Completion</Label>
                    <Input id="expected-completion" value={site?.deployment?.endDate ? new Date(site.deployment.endDate).toLocaleDateString() : "25th January 2025"} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="current-phase">Current Phase</Label>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-blue-100 text-blue-800">Installation</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-right">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-1" />
            Update Progress
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeploymentStep;
