import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { PageService } from '@/services/pageService';
import { toast } from 'sonner';
import { useSectionAutoSave } from '@/hooks/useSectionAutoSave';

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

  // Check if all section fields are filled for autosave
  const isLocationSectionComplete = site?.siteCreation?.locationInfo?.latitude && 
                                    site?.siteCreation?.locationInfo?.longitude &&
                                    site?.siteCreation?.locationInfo?.location;
  
  const isGeneralSectionComplete = site?.assignedOpsManager && 
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

  // Save location data to create_site/location_info section
  const saveLocationToBackend = async (siteId: string, locationData: {
    location: string;
    latitude: number;
    longitude: number;
    postcode: string;
    region: string;
    country: string;
  }) => {
    try {
      // Update location_info fields in create_site page
      await PageService.updateField(siteId, 'create_site', 'location_info', 'location', locationData.location);
      await PageService.updateField(siteId, 'create_site', 'location_info', 'latitude', String(locationData.latitude));
      await PageService.updateField(siteId, 'create_site', 'location_info', 'longitude', String(locationData.longitude));
      await PageService.updateField(siteId, 'create_site', 'location_info', 'postcode', locationData.postcode);
      await PageService.updateField(siteId, 'create_site', 'location_info', 'region', locationData.region);
      await PageService.updateField(siteId, 'create_site', 'location_info', 'country', locationData.country);
      
      console.log('✅ Location data saved to create_site/location_info:', locationData);
    } catch (error) {
      console.error('❌ Error saving location to backend:', error);
      throw error;
    }
  };

  // Save site creation data to backend
  const saveSiteCreationData = async (siteData: Site) => {
    try {
      // Get user names from IDs for saving
      const opsManagerName = siteData.assignedOpsManagerId 
        ? opsManagers.find(u => u.id === siteData.assignedOpsManagerId)?.full_name || ''
        : siteData.assignedOpsManager || '';
      
      const deploymentEngineerName = siteData.assignedDeploymentEngineerId
        ? deploymentEngineers.find(u => u.id === siteData.assignedDeploymentEngineerId)?.full_name || ''
        : siteData.assignedDeploymentEngineer || '';
      
      const success = await SiteWorkflowService.saveSiteCreationData(site.id, {
        locationInfo: siteData.siteCreation?.locationInfo,
        assigned_ops_manager: opsManagerName, // Save name, not ID
        assigned_deployment_engineer: deploymentEngineerName // Save name, not ID
      });
      
      if (success) {
        toast.success('Site creation data saved successfully');
      } else {
        toast.error('Failed to save site creation data');
      }
    } catch (error) {
      console.error('Error saving site creation data:', error);
      toast.error('Failed to save site creation data');
    }
  };

  // Autosave handler
  const handleAutoSave = useCallback(async (sectionName: string, data: any) => {
    try {
      if (sectionName === 'location_info') {
        await saveLocationToBackend(site.id, {
          location: data.location,
          latitude: data.latitude,
          longitude: data.longitude,
          postcode: data.postcode || '',
          region: data.region || '',
          country: data.country || 'United Kingdom'
        });
      } else if (sectionName === 'general_info') {
        await saveSiteCreationData(site);
      }
    } catch (error) {
      console.error(`Error autosaving ${sectionName}:`, error);
      throw error;
    }
  }, [site, opsManagers, deploymentEngineers]);

  // Setup autosave hook
  const {
    updateSectionData,
    forceSaveSection,
    sectionStatus
  } = useSectionAutoSave({
    onSave: handleAutoSave,
    debounceMs: 1000
  });

  // Trigger autosave when location section is complete
  // Use refs to track previous values and prevent unnecessary updates
  const prevLocationInfo = useRef<string>('');
  
  useEffect(() => {
    if (isEditing && isLocationSectionComplete && site?.siteCreation?.locationInfo) {
      const locationKey = `${site.siteCreation.locationInfo.location}-${site.siteCreation.locationInfo.latitude}-${site.siteCreation.locationInfo.longitude}`;
      
      // Only update if location data actually changed
      if (prevLocationInfo.current !== locationKey) {
        prevLocationInfo.current = locationKey;
        updateSectionData('location_info', {
          location: site.siteCreation.locationInfo.location,
          latitude: site.siteCreation.locationInfo.latitude,
          longitude: site.siteCreation.locationInfo.longitude,
          postcode: site.siteCreation.locationInfo.postcode,
          region: site.siteCreation.locationInfo.region,
          country: site.siteCreation.locationInfo.country
        });
      }
    }
  }, [isEditing, isLocationSectionComplete, site?.siteCreation?.locationInfo?.location, site?.siteCreation?.locationInfo?.latitude, site?.siteCreation?.locationInfo?.longitude, site?.siteCreation?.locationInfo?.postcode, site?.siteCreation?.locationInfo?.region, site?.siteCreation?.locationInfo?.country, updateSectionData]);

  // Trigger autosave when general section is complete
  const prevTeamAssignment = useRef<string>('');
  
  useEffect(() => {
    if (isEditing && isGeneralSectionComplete) {
      const teamKey = `${site?.assignedOpsManager || ''}-${site?.assignedDeploymentEngineer || ''}`;
      
      // Only update if team assignment actually changed
      if (prevTeamAssignment.current !== teamKey) {
        prevTeamAssignment.current = teamKey;
        updateSectionData('general_info', {
          assignedOpsManager: site?.assignedOpsManager,
          assignedDeploymentEngineer: site?.assignedDeploymentEngineer
        });
      }
    }
  }, [isEditing, isGeneralSectionComplete, site?.assignedOpsManager, site?.assignedDeploymentEngineer, updateSectionData]);

  // Match assigned user names to IDs for dropdown selection
  // Use a ref to track if we've already updated to prevent infinite loops
  const hasMatchedUsers = useRef(false);
  
  useEffect(() => {
    // Only run once when users are loaded and site has names but no IDs
    if (hasMatchedUsers.current) return;
    
    if (site && opsManagers.length > 0 && deploymentEngineers.length > 0) {
      let needsUpdate = false;
      const updatedSite = { ...site };
      
      // If we have assigned names but no IDs, find the IDs by matching names
      if (site.assignedOpsManager && !site.assignedOpsManagerId) {
        const matchedUser = opsManagers.find(
          user => user.full_name === site.assignedOpsManager || 
                  user.email === site.assignedOpsManager
        );
        if (matchedUser) {
          console.log('🔍 CreateSiteStep: Matched Operations Manager by name:', {
            name: site.assignedOpsManager,
            id: matchedUser.id
          });
          updatedSite.assignedOpsManagerId = matchedUser.id;
          needsUpdate = true;
        }
      }

      if (site.assignedDeploymentEngineer && !site.assignedDeploymentEngineerId) {
        const matchedUser = deploymentEngineers.find(
          user => user.full_name === site.assignedDeploymentEngineer || 
                  user.email === site.assignedDeploymentEngineer
        );
        if (matchedUser) {
          console.log('🔍 CreateSiteStep: Matched Deployment Engineer by name:', {
            name: site.assignedDeploymentEngineer,
            id: matchedUser.id
          });
          updatedSite.assignedDeploymentEngineerId = matchedUser.id;
          needsUpdate = true;
        }
      }
      
      // Only update once if needed
      if (needsUpdate) {
        hasMatchedUsers.current = true;
        onSiteUpdate(updatedSite);
      } else {
        // Mark as done even if no update needed (both IDs already exist)
        hasMatchedUsers.current = true;
      }
    }
  }, [site?.assignedOpsManager, site?.assignedDeploymentEngineer, site?.assignedOpsManagerId, site?.assignedDeploymentEngineerId, opsManagers.length, deploymentEngineers.length]);



  const handleLocationSelect = async (location: { 
    address: string; 
    lat: number; 
    lng: number;
    postcode?: string;
    region?: string;
    country?: string;
  }) => {
    if (!isEditing) return; // Don't allow changes in read-only mode
    
    const updatedSite = {
      ...site,
      siteCreation: {
        ...site.siteCreation,
        locationInfo: {
          ...site.siteCreation?.locationInfo,
          location: location.address,
          latitude: location.lat,
          longitude: location.lng,
          postcode: location.postcode || '',
          region: location.region || '',
          country: location.country || 'United Kingdom'
        }
      }
    };
    
    // Update local state
    onSiteUpdate(updatedSite);
    
    // Save to backend immediately with all location attributes
    try {
      await saveLocationToBackend(updatedSite.id, {
        location: location.address,
        latitude: location.lat,
        longitude: location.lng,
        postcode: location.postcode || '',
        region: location.region || '',
        country: location.country || 'United Kingdom'
      });
    } catch (error) {
      console.error('Error saving location to backend:', error);
      toast.error('Location saved locally but failed to save to backend');
    }
    
    setShowLocationEditor(false);
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      
      // Ensure location data is saved
      if (site?.siteCreation?.locationInfo) {
        await saveLocationToBackend(site.id, {
          location: site.siteCreation.locationInfo.location,
          latitude: site.siteCreation.locationInfo.latitude,
          longitude: site.siteCreation.locationInfo.longitude,
          postcode: site.siteCreation.locationInfo.postcode || '',
          region: site.siteCreation.locationInfo.region || '',
          country: site.siteCreation.locationInfo.country || 'United Kingdom'
        });
      }
      
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
      
      // Ensure location data is saved before marking complete
      if (site?.siteCreation?.locationInfo) {
        await saveLocationToBackend(site.id, {
          location: site.siteCreation.locationInfo.location,
          latitude: site.siteCreation.locationInfo.latitude,
          longitude: site.siteCreation.locationInfo.longitude,
          postcode: site.siteCreation.locationInfo.postcode || '',
          region: site.siteCreation.locationInfo.region || '',
          country: site.siteCreation.locationInfo.country || 'United Kingdom'
        });
      }
      
      // Save all site creation data
      await saveSiteCreationData(site);
      
      // Update status to 'site_study' (the next page name) when Create Site is marked complete
      // This way status reflects the current in-progress page name
      await SiteWorkflowService.updateSiteStatus(site.id, 'site_study');
      
      const updatedSite = {
        ...site,
        status: 'site_study' as const
      };
      
      onSiteUpdate(updatedSite);
      setIsEditing(false); // Set to read-only mode after completion
      toast.success('Site creation marked as complete. You can now proceed to Site Study.');
    } catch (error) {
      console.error('Error marking complete:', error);
      toast.error('Failed to mark as complete');
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
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Site Creation</h2>
          <p className="text-gray-600 mt-1">Basic site information and configuration</p>
        </div>
        <div className="flex items-center gap-3">
          {isStepCompleted && !isEditing && (
            <div className="flex items-center gap-1 text-green-600">
              <Lock className="h-4 w-4" />
              <span className="text-sm font-medium">Completed</span>
            </div>
          )}
          {/* Action Buttons - Top */}
          {!isEditing ? (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <EditIcon className="h-4 w-4" />
              Edit
            </Button>
          ) : (
            <>
              <Button
                onClick={async () => {
                  await forceSaveSection('location_info');
                  await forceSaveSection('general_info');
                  await handleSaveDraft();
                }}
                disabled={saving}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save as Draft'}
              </Button>
              <Button
                onClick={async () => {
                  await forceSaveSection('location_info');
                  await forceSaveSection('general_info');
                  await handleMarkComplete();
                }}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Mark Complete'}
              </Button>
            </>
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
            {isLocationEditable && isEditing && !showLocationEditor && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowLocationEditor(true)} 
                className="flex items-center gap-2 h-8"
              >
                <EditIcon className="h-4 w-4" />
                Edit
              </Button>
            )}
            {isLocationEditable && isEditing && showLocationEditor && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowLocationEditor(false)}
                className="h-8"
              >
                Cancel
              </Button>
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
                <div className="text-sm text-gray-700">
                  <div>{site.siteCreation.locationInfo.location || '—'}</div>
                </div>
              )}

            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        {!isEditing ? (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2"
          >
            <EditIcon className="h-4 w-4" />
            Edit
          </Button>
        ) : (
          <>
            <Button
              onClick={async () => {
                await forceSaveSection('location_info');
                await forceSaveSection('general_info');
                await handleSaveDraft();
              }}
              disabled={saving}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save as Draft'}
            </Button>
            <Button
              onClick={async () => {
                await forceSaveSection('location_info');
                await forceSaveSection('general_info');
                await handleMarkComplete();
              }}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Mark Complete'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateSiteStep;
