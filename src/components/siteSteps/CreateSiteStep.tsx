import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, MapPin, Lock, Edit as EditIcon, User, Users, Save } from 'lucide-react';
import { LocationPicker } from '@/components/ui/location-picker';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Site } from '@/types/siteTypes';
import { UserService, UserWithRole } from '@/services/userService';
import { SiteWorkflowService } from '@/services/siteWorkflowService';
import { toast } from 'sonner';

interface CreateSiteStepProps {
  site: Site;
  onSiteUpdate: (updatedSite: Site) => void;
}

const CreateSiteStep: React.FC<CreateSiteStepProps> = ({ site, onSiteUpdate }) => {
  const [showLocationEditor, setShowLocationEditor] = useState(false);
  const [opsManagers, setOpsManagers] = useState<UserWithRole[]>([]);
  const [deploymentEngineers, setDeploymentEngineers] = useState<UserWithRole[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Check if site creation step is completed
  const isStepCompleted = site?.siteCreation?.locationInfo?.latitude && 
                         site?.siteCreation?.locationInfo?.longitude &&
                         site?.assignedOpsManager && 
                         site?.assignedDeploymentEngineer;

  // Fetch users by role
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const [opsManagersData, deploymentEngineersData] = await Promise.all([
          UserService.getOpsManagers(),
          UserService.getDeploymentEngineers()
        ]);
        
        setOpsManagers(opsManagersData);
        setDeploymentEngineers(deploymentEngineersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Initialize editing state based on step completion
  useEffect(() => {
    setIsEditing(!isStepCompleted);
  }, [isStepCompleted]);

  // Debug team assignment data
  useEffect(() => {
    console.log('🔍 CreateSiteStep team assignment debug:', {
      siteId: site?.id,
      assignedOpsManager: site?.assignedOpsManager,
      assignedOpsManagerId: site?.assignedOpsManagerId,
      assignedDeploymentEngineer: site?.assignedDeploymentEngineer,
      assignedDeploymentEngineerId: site?.assignedDeploymentEngineerId,
      opsManagersCount: opsManagers.length,
      deploymentEngineersCount: deploymentEngineers.length,
      isStepCompleted
    });
  }, [site, opsManagers, deploymentEngineers, isStepCompleted]);



  const handleLocationSelect = (location: { address: string; lat: number; lng: number }) => {
    if (!isEditing) return; // Don't allow changes in read-only mode
    
    const updatedSite = {
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
    };
    
    // Update local state only - don't save to backend yet
    onSiteUpdate(updatedSite);
    setShowLocationEditor(false);
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      await saveSiteCreationData(site);
      toast.success('Draft saved successfully');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkComplete = async () => {
    try {
      setSaving(true);
      const updatedSite = {
        ...site,
        status: 'Created' as const
      };
      
      await saveSiteCreationData(updatedSite);
      onSiteUpdate(updatedSite);
      setIsEditing(false); // Set to read-only mode after completion
      toast.success('Site creation marked as complete');
    } catch (error) {
      console.error('Error marking complete:', error);
      toast.error('Failed to mark as complete');
    } finally {
      setSaving(false);
    }
  };

  // Save site creation data to backend
  const saveSiteCreationData = async (siteData: Site) => {
    try {
      setSaving(true);
      const success = await SiteWorkflowService.saveSiteCreationData(site.id, {
        locationInfo: siteData.siteCreation?.locationInfo,
        assigned_ops_manager: siteData.assignedOpsManagerId,
        assigned_deployment_engineer: siteData.assignedDeploymentEngineerId
      });
      
      if (success) {
        toast.success('Site creation data saved successfully');
      } else {
        toast.error('Failed to save site creation data');
      }
    } catch (error) {
      console.error('Error saving site creation data:', error);
      toast.error('Failed to save site creation data');
    } finally {
      setSaving(false);
    }
  };

  // Handle Operations Manager selection
  const handleOpsManagerSelect = async (profileId: string) => {
    if (!isEditing) return; // Don't allow changes in read-only mode
    
    const selectedUser = opsManagers.find(user => user.id === profileId);
    const updatedSite = {
      ...site,
      assignedOpsManager: selectedUser?.full_name || '',
      assignedOpsManagerId: profileId
    };
    
    // Update local state
    onSiteUpdate(updatedSite);
    
    // Save to backend
    await saveSiteCreationData(updatedSite);
  };

  // Handle Deployment Engineer selection
  const handleDeploymentEngineerSelect = async (profileId: string) => {
    if (!isEditing) return; // Don't allow changes in read-only mode
    
    const selectedUser = deploymentEngineers.find(user => user.id === profileId);
    const updatedSite = {
      ...site,
      assignedDeploymentEngineer: selectedUser?.full_name || '',
      assignedDeploymentEngineerId: profileId
    };
    
    // Update local state
    onSiteUpdate(updatedSite);
    
    // Save to backend
    await saveSiteCreationData(updatedSite);
  };

  // Allow edits until site study is completed
  const isLocationEditable = !(
    site.status === 'site_study_done' ||
    site.status === 'scoping_done' ||
    site.status === 'approved' ||
    site.status === 'procurement_done' ||
    site.status === 'deployed' ||
    site.status === 'live' ||
    site.status === 'archived'
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Site Creation</h2>
            <p className="text-gray-600 mt-1">Basic site information and configuration</p>
          </div>
          {isStepCompleted && !isEditing && (
            <div className="flex items-center gap-1 text-green-600">
              <Lock className="h-4 w-4" />
              <span className="text-sm font-medium">Completed</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isStepCompleted && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <EditIcon className="h-4 w-4" />
              Edit
            </Button>
          )}
          {saving && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              <span>Saving...</span>
            </div>
          )}
        </div>
      </div>
      
      {/* General Information Section */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-green-600" />
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
                  {loadingUsers ? (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                      <span>Loading operations managers...</span>
                    </div>
                  ) : (
                    <Select
                      value={site.assignedOpsManagerId || ''}
                      onValueChange={handleOpsManagerSelect}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={`w-full ${!isEditing ? 'bg-gray-50' : ''}`}>
                        <SelectValue placeholder="Select Operations Manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {opsManagers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <div>
                                <div className="font-medium">{user.full_name}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deployment-engineer">Deployment Engineer</Label>
                  {loadingUsers ? (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                      <span>Loading deployment engineers...</span>
                    </div>
                  ) : (
                    <Select
                      value={site.assignedDeploymentEngineerId || ''}
                      onValueChange={handleDeploymentEngineerSelect}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={`w-full ${!isEditing ? 'bg-gray-50' : ''}`}>
                        <SelectValue placeholder="Select Deployment Engineer" />
                      </SelectTrigger>
                      <SelectContent>
                        {deploymentEngineers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <div>
                                <div className="font-medium">{user.full_name}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Location Information Section */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-green-600" />
              Location Information
            </div>
            {isLocationEditable && isEditing && (
              !showLocationEditor
                ? (
                  (site?.siteCreation?.locationInfo?.latitude && site?.siteCreation?.locationInfo?.longitude) && (
                    <Button variant="outline" size="sm" onClick={() => setShowLocationEditor(true)} className="flex items-center gap-2">
                      <EditIcon className="h-4 w-4" />
                      Edit location
                    </Button>
                  )
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setShowLocationEditor(false)}>
                    Cancel
                  </Button>
                )
            )}
          </CardTitle>
          <CardDescription className="text-gray-600">
            Site location and address details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              {(isLocationEditable && (!site?.siteCreation?.locationInfo?.latitude || !site?.siteCreation?.locationInfo?.longitude || showLocationEditor)) ? (
                <>
                  <div className="flex items-center justify-between" />
                  {/* Force the picker to open in expanded search mode by not passing initialLocation when editing */}
                  <LocationPicker
                    onLocationSelect={handleLocationSelect}
                    initialLocation={
                      showLocationEditor
                        ? undefined
                        : (site?.siteCreation?.locationInfo?.latitude && site?.siteCreation?.locationInfo?.longitude
                            ? {
                                lat: site.siteCreation.locationInfo.latitude,
                                lng: site.siteCreation.locationInfo.longitude
                              }
                            : undefined)
                    }
                    className="border-0 shadow-none"
                  />
                </>
              ) : !isLocationEditable ? (
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Lock className="h-4 w-4 mr-2" />
                    Location is locked after Site Study completion
                  </div>
                </div>
              ) : null}

              {/* Compact summary when location exists and not editing */}
              {!showLocationEditor && site?.siteCreation?.locationInfo?.latitude && site?.siteCreation?.locationInfo?.longitude && (
                <div className="mt-4 text-sm text-gray-700 space-y-1">
                  <div><span className="font-medium">Address:</span> {site.siteCreation.locationInfo.location || '—'}</div>
                  <div>
                    <span className="font-medium">Coordinates:</span> {site.siteCreation.locationInfo.latitude}, {site.siteCreation.locationInfo.longitude}
                  </div>
                </div>
              )}

            </div>
          </div>
        </CardContent>
      </Card>

      {/* Site Creation Step Action Buttons */}
      {isLocationEditable && isEditing && (
        <div className="mt-6 flex gap-3">
          <Button
            onClick={handleSaveDraft}
            disabled={saving}
            variant="outline"
            className="flex-1"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button
            onClick={handleMarkComplete}
            disabled={saving}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {saving ? 'Saving...' : 'Mark Complete'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CreateSiteStep;
