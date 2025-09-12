import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, MapPin } from 'lucide-react';
import { UKCitySelect as LocationPicker } from '@/components/UKCitySelect';
import { Site } from '@/types/siteTypes';

interface CreateSiteStepProps {
  site: Site;
  onSiteUpdate: (updatedSite: Site) => void;
}

const CreateSiteStep: React.FC<CreateSiteStepProps> = ({ site, onSiteUpdate }) => {
  const handleLocationSelect = (location: { address: string; lat: number; lng: number }) => {
    onSiteUpdate({
      ...site,
      siteCreation: {
        ...site.siteCreation,
        locationInfo: {
          ...site.siteCreation?.locationInfo,
          location: location.address,
          latitude: location.lat,
          longitude: location.lng
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Site Creation</h2>
          <p className="text-gray-600 mt-1">Basic site information and configuration</p>
        </div>
      </div>
      
      {/* General Information Section */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-blue-600" />
            General Information
          </CardTitle>
          <CardDescription className="text-gray-600">
            Basic site details and organisation information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Basic Site Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input value={site.name} readOnly className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Input value={site.organization} readOnly className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sector">Sector</Label>
                  <Input value={site.sector} readOnly className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit-code">Unit Code</Label>
                  <Input value={site.unitCode} readOnly className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target-live-date">Target Live Date</Label>
                  <Input value={site.goLiveDate} readOnly className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Input value={site.priority} readOnly className="bg-gray-50" />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Team Assignment</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ops-manager">Operations Manager</Label>
                  <Input value={site.assignedOpsManager} readOnly className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deployment-engineer">Deployment Engineer</Label>
                  <Input value={site.assignedDeploymentEngineer} readOnly className="bg-gray-50" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Information Section */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5 text-green-600" />
            Location Information
          </CardTitle>
          <CardDescription className="text-gray-600">
            Site location and address details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Location Selection</h4>
              
              {/* Location Picker Component */}
              <LocationPicker
                value={site?.siteCreation?.locationInfo?.location || ''}
                onValueChange={(value) => {
                  onSiteUpdate({
                    ...site,
                    siteCreation: {
                      ...site.siteCreation,
                      locationInfo: {
                        ...site.siteCreation?.locationInfo,
                        location: value
                      }
                    }
                  });
                }}
                placeholder="Select a UK city"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateSiteStep;
