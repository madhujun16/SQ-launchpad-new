import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  CheckCircle, 
  Power,
  Clock,
  AlertTriangle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Site } from '@/types/siteTypes';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { GoLiveService } from '@/services/goLiveService';

interface GoLiveStepProps {
  site: Site;
  onSiteUpdate: (updatedSite: Site) => void;
}

const GoLiveStep: React.FC<GoLiveStepProps> = ({ site, onSiteUpdate }) => {
  const { currentRole, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [notes, setNotes] = useState<string>('');
  const [goLiveDate, setGoLiveDate] = useState<string | null>(null);
  const [signedOffBy, setSignedOffBy] = useState<string | null>(null);

  // Check if user can toggle go live (Admin or Deployment Engineer)
  const canToggleGoLive = currentRole === 'admin' || currentRole === 'deployment_engineer';

  useEffect(() => {
    loadGoLiveData();
  }, [site.id]);

  const loadGoLiveData = async () => {
    try {
      setLoading(true);
      const goLiveData = await GoLiveService.getGoLiveData(site.id);
      
      if (goLiveData) {
        setIsLive(goLiveData.status === 'live');
        setNotes(goLiveData.notes || '');
        setGoLiveDate(goLiveData.go_live_date || null);
        setSignedOffBy(goLiveData.signed_off_by || null);
      } else {
        // Check site status
        setIsLive(site.status === 'live');
      }
    } catch (error) {
      console.error('Error loading go live data:', error);
      setIsLive(site.status === 'live');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGoLive = async (checked: boolean) => {
    if (!canToggleGoLive) {
      toast.error('You do not have permission to toggle go live status');
      return;
    }

    if (checked && !notes.trim()) {
      toast.error('Please provide notes before going live');
      return;
    }

    try {
      setSubmitting(true);
      
      if (checked) {
        // Going live
        const result = await GoLiveService.markSiteLive(site.id, {
          notes: notes.trim()
        });

        if (result) {
          setIsLive(true);
          setGoLiveDate(result.go_live_date || new Date().toISOString());
          setSignedOffBy(result.signed_off_by || profile?.full_name || 'Unknown');

          // Update site status
          onSiteUpdate({
            ...site,
            status: 'live',
            goLive: {
              status: 'live',
              date: result.go_live_date || new Date().toISOString(),
              signedOffBy: result.signed_off_by || profile?.full_name || 'Unknown',
              notes: notes.trim(),
              checklist: site.goLive?.checklist || {
                hardwareInstallationComplete: 'completed',
                softwareConfigurationComplete: 'completed',
                staffTraining: 'completed',
                finalTesting: 'completed'
              },
              timeline: site.goLive?.timeline || {
                targetGoLiveDate: site.goLiveDate || '',
                finalTesting: '',
                staffTraining: '',
                systemHandover: ''
              }
            }
          });

          toast.success('Site marked as live successfully');
        }
      } else {
        // Taking site offline
        const result = await GoLiveService.markSiteOffline(site.id, {
          notes: notes.trim() || 'Site taken offline'
        });

        if (result) {
          setIsLive(false);

          // Update site status back to previous state
          onSiteUpdate({
            ...site,
            status: 'procurement_done', // Revert to previous status
            goLive: {
              ...site.goLive,
              status: 'postponed',
              notes: notes.trim() || 'Site taken offline'
            } as any
          });

          toast.success('Site taken offline');
        }
      }
    } catch (error: any) {
      console.error('Error toggling go live status:', error);
      toast.error(error?.message || 'Failed to update go live status');
      // Revert toggle on error
      setIsLive(!checked);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-3 text-gray-600">Loading go live status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Go Live</h2>
          <p className="text-gray-600 mt-1">
            {isLive 
              ? 'Site is currently live and operational' 
              : 'Activate the site to go live after procurement is complete'}
          </p>
        </div>
        {isLive && (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4 mr-1" />
            Live
          </Badge>
        )}
      </div>

      {/* Status Card */}
      {isLive && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <span className="text-green-800 font-medium">Site is live</span>
                {goLiveDate && (
                  <p className="text-green-700 text-sm mt-1">
                    Went live on {new Date(goLiveDate).toLocaleDateString()}
                  </p>
                )}
                {signedOffBy && (
                  <p className="text-green-700 text-sm">
                    Signed off by {signedOffBy}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prerequisites Check */}
      {!isLive && site.status !== 'procurement_done' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-yellow-800 font-medium">Prerequisites not met</p>
                <p className="text-yellow-700 text-sm mt-1">
                  Procurement must be completed before the site can go live. Current status: {site.status}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Go Live Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Power className="mr-2 h-5 w-5 text-blue-600" />
            Go Live Status
          </CardTitle>
          <CardDescription>
            {isLive 
              ? 'Site is currently live. Toggle to take it offline.'
              : 'Toggle to mark the site as live after procurement is complete.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Toggle Switch */}
          <div className="flex items-center justify-between p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <Label htmlFor="go-live-toggle" className="text-lg font-semibold cursor-pointer">
                  {isLive ? 'Site is Live' : 'Site is Offline'}
                </Label>
                {!canToggleGoLive && (
                  <Badge variant="outline" className="text-xs">
                    Read Only
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {isLive 
                  ? 'The site is currently live and operational. Users can access the system.'
                  : 'The site is offline. Toggle to activate and go live.'}
              </p>
            </div>
            <Switch
              id="go-live-toggle"
              checked={isLive}
              onCheckedChange={handleToggleGoLive}
              disabled={!canToggleGoLive || submitting || site.status !== 'procurement_done'}
              className="ml-4"
            />
          </div>

          {/* Notes Field */}
          <div>
            <Label htmlFor="go-live-notes" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Notes {isLive ? '' : <span className="text-red-500">*</span>}
            </Label>
            <div className="mt-2">
              <Textarea
                id="go-live-notes"
                placeholder={isLive 
                  ? "Add notes about the site status (optional)..." 
                  : "Enter notes about going live (required)..."}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={!canToggleGoLive || submitting}
                rows={4}
                className="resize-none"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {isLive 
                ? 'Optional notes about the live site status'
                : 'Required notes explaining the go-live process and any important information'}
            </p>
          </div>

          {/* Info Message */}
          {!canToggleGoLive && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-blue-800 font-medium">Read Only Access</p>
                    <p className="text-blue-700 text-sm mt-1">
                      Only Admin or Deployment Engineer can toggle the go live status.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Go Live Information (Read-only when live) */}
          {isLive && goLiveDate && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-gray-600">Go Live Date</Label>
                <p className="text-sm font-medium mt-1">
                  {new Date(goLiveDate).toLocaleDateString()}
                </p>
              </div>
              {signedOffBy && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Signed Off By</Label>
                  <p className="text-sm font-medium mt-1">{signedOffBy}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GoLiveStep;
