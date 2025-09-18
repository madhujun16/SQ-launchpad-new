import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Settings,
  Calendar,
  DollarSign,
  Target,
  Building,
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getRoleConfig } from '@/lib/roles';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PageLoader } from '@/components/ui/loader';
import { 
  SelectField,
  CurrencyField,
  NumberField
} from '@/components/ui/widgets';

// Date format options
const DATE_FORMAT_OPTIONS = [
  { value: 'dd-mmm-yyyy', label: 'DD MMM YYYY (e.g., 15 Jan 2024)', disabled: false },
  { value: 'mm/dd/yyyy', label: 'MM/DD/YYYY (e.g., 01/15/2024)', disabled: false },
  { value: 'dd/mm/yyyy', label: 'DD/MM/YYYY (e.g., 15/01/2024)', disabled: false },
  { value: 'yyyy-mm-dd', label: 'YYYY-MM-DD (e.g., 2024-01-15)', disabled: false }
];

// Currency options
const CURRENCY_OPTIONS = [
  { value: 'GBP', label: 'British Pound (£)', disabled: false },
  { value: 'USD', label: 'US Dollar ($)', disabled: false },
  { value: 'EUR', label: 'Euro (€)', disabled: false },
  { value: 'CAD', label: 'Canadian Dollar (C$)', disabled: false }
];

// General settings interface
interface GeneralSettings {
  dateFormat: string;
  currency: string;
  fyBudget: number;
  siteTargets: number;
}

const GeneralSettings: React.FC = () => {
  const { currentRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<GeneralSettings>({
    dateFormat: 'dd-mmm-yyyy',
    currency: 'GBP',
    fyBudget: 500000,
    siteTargets: 1000
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<GeneralSettings>({
    dateFormat: 'dd-mmm-yyyy',
    currency: 'GBP',
    fyBudget: 500000,
    siteTargets: 1000
  });

  // Check if user has permission to access this page
  useEffect(() => {
    if (currentRole && currentRole !== 'admin') {
      navigate('/dashboard');
      return;
    }
  }, [currentRole, navigate]);

  // Load settings (mock implementation - replace with actual API call)
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call to load settings
        // const response = await fetch('/api/platform-configuration/general-settings');
        // const data = await response.json();
        
        // Mock data for now
        const mockSettings: GeneralSettings = {
          dateFormat: 'dd-mmm-yyyy',
          currency: 'GBP',
          fyBudget: 500000,
          siteTargets: 1000
        };
        
        setSettings(mockSettings);
        setOriginalSettings(mockSettings);
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    if (currentRole === 'admin') {
      loadSettings();
    }
  }, [currentRole]);

  // Track changes
  useEffect(() => {
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(hasChanges);
  }, [settings, originalSettings]);

  const handleSettingChange = (key: keyof GeneralSettings, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // TODO: Replace with actual API call to save settings
      // const response = await fetch('/api/platform-configuration/general-settings', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(settings),
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to save settings');
      // }
      
      // Mock save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setOriginalSettings(settings);
      setHasChanges(false);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(originalSettings);
    setHasChanges(false);
    toast.info('Settings reset to original values');
  };

  if (loading) {
    return <PageLoader />;
  }

  if (currentRole !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Settings className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">General Settings</h1>
            <p className="text-gray-600">Configure platform-wide settings and defaults</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              Unsaved Changes
            </Badge>
          )}
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges || saving}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="bg-green-600 hover:bg-green-700"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Settings Form */}
      <div className="space-y-6">
        {/* Date Format Settings */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-green-600" />
              Date Format
            </CardTitle>
            <CardDescription className="text-gray-600">
              Configure how dates are displayed throughout the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <SelectField
                label="Date Format"
                value={settings.dateFormat}
                onChange={(value) => handleSettingChange('dateFormat', value)}
                options={DATE_FORMAT_OPTIONS}
                placeholder="Select date format"
                helpText="This format will be used across all date displays in the application"
              />
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Preview</span>
                </div>
                <p className="text-sm text-green-800">
                  Example: {new Date().toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })} (Current: {settings.dateFormat})
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Currency Settings */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-green-600" />
              Currency
            </CardTitle>
            <CardDescription className="text-gray-600">
              Set the default currency for financial values and calculations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <SelectField
                label="Default Currency"
                value={settings.currency}
                onChange={(value) => handleSettingChange('currency', value)}
                options={CURRENCY_OPTIONS}
                placeholder="Select currency"
                helpText="This currency will be used for all financial calculations and displays"
              />
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Preview</span>
                </div>
                <p className="text-sm text-green-800">
                  Example: {settings.currency === 'GBP' ? '£' : settings.currency === 'USD' ? '$' : settings.currency === 'EUR' ? '€' : 'C$'}1,234.56
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Year Budget */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5 text-purple-600" />
              Financial Year Budget
            </CardTitle>
            <CardDescription className="text-gray-600">
              Set the total budget allocation for the current financial year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <CurrencyField
                label="FY Budget"
                value={settings.fyBudget}
                onChange={(value) => handleSettingChange('fyBudget', value)}
                placeholder="Enter financial year budget"
                helpText="This budget will be used for financial planning and reporting"
                currency={settings.currency === 'GBP' ? '£' : settings.currency === 'USD' ? '$' : settings.currency === 'EUR' ? '€' : 'C$'}
              />
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Budget Allocation</span>
                </div>
                <div className="text-sm text-purple-800 space-y-1">
                  <p>Total Budget: {(settings.fyBudget).toLocaleString()} {settings.currency}</p>
                  <p>Per Site Average: {(settings.fyBudget / settings.siteTargets).toLocaleString()} {settings.currency}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Site Targets */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="mr-2 h-5 w-5 text-orange-600" />
              Site Targets
            </CardTitle>
            <CardDescription className="text-gray-600">
              Define the target number of sites for planning and reporting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <NumberField
                label="Target Sites"
                value={settings.siteTargets}
                onChange={(value) => handleSettingChange('siteTargets', value)}
                placeholder="Enter target number of sites"
                min={1}
                helpText="This target will be used for planning and performance tracking"
              />
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">Target Analysis</span>
                </div>
                <div className="text-sm text-orange-800 space-y-1">
                  <p>Target Sites: {settings.siteTargets.toLocaleString()}</p>
                  <p>Budget per Site: {(settings.fyBudget / settings.siteTargets).toLocaleString()} {settings.currency}</p>
                  <p>Monthly Target: {Math.ceil(settings.siteTargets / 12).toLocaleString()} sites</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Impact Information */}
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Settings Impact:</strong> These settings will affect how dates, currencies, and targets are displayed and calculated throughout the application. 
            Changes will be applied immediately after saving.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default GeneralSettings;
