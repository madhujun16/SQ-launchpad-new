import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Edit, 
  CheckCircle, 
  ListChecks, 
  Award, 
  Clock, 
  AlertCircle,
  Save
} from 'lucide-react';
import { Site } from '@/types/siteTypes';

interface GoLiveStepProps {
  site: Site;
  onSiteUpdate: (updatedSite: Site) => void;
}

const GoLiveStep: React.FC<GoLiveStepProps> = ({ site, onSiteUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-green-100 text-green-800';
      case 'postponed':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Go-Live</h2>
          <p className="text-gray-600 mt-1">Final system activation and go-live preparation</p>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Go-Live Checklist */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ListChecks className="mr-2 h-5 w-5 text-green-600" />
              Go-Live Checklist
            </CardTitle>
            <CardDescription className="text-gray-600">
              Final verification checklist before going live
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Pre-Launch Tasks</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Hardware Installation Complete</p>
                        <p className="text-sm text-gray-600">All hardware installed and tested</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Software Configuration Complete</p>
                        <p className="text-sm text-gray-600">All software modules configured</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Staff Training</p>
                        <p className="text-sm text-gray-600">Team training in progress</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">In Progress</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium">Final Testing</p>
                        <p className="text-sm text-gray-600">End-to-end system testing</p>
                      </div>
                    </div>
                    <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Go-Live Details */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5 text-yellow-600" />
              Go-Live Details
            </CardTitle>
            <CardDescription className="text-gray-600">
              Final confirmation and sign-off information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Go-Live Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="go-live-date">Go-Live Date</Label>
                    <Input id="go-live-date" value={site?.goLive?.date ? new Date(site.goLive.date).toLocaleDateString() : ""} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signed-off-by">Signed Off By</Label>
                    <Input id="signed-off-by" value={site?.goLive?.signedOffBy || ""} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="go-live-status">Status</Label>
                    <Badge className={getStatusColor(site?.goLive?.status || 'pending')}>
                      {site?.goLive?.status ? site.goLive.status.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Pending'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Additional Notes</h4>
                <div className="space-y-2">
                  <Label htmlFor="go-live-notes">Notes</Label>
                  <Textarea
                    id="go-live-notes"
                    value={site?.goLive?.notes || ""}
                    readOnly
                    rows={3}
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        {!isEditing ? (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save as Draft
            </Button>
            <Button
              onClick={() => setIsEditing(false)}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Mark Complete
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default GoLiveStep;
