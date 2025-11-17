/**
 * Example React Component demonstrating Backend API integration
 * 
 * This component shows different ways to interact with your Google Cloud backend
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useBackendApi } from '@/hooks/useBackendApi';
import { apiClient } from '@/services/apiClient';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

interface ApiTestResult {
  endpoint: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  data?: any;
}

export const BackendApiExample: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');
  const [testResults, setTestResults] = useState<ApiTestResult[]>([]);
  const [customEndpoint, setCustomEndpoint] = useState('/health');

  // Using the useBackendApi hook
  const { loading, error, data, get } = useBackendApi({
    showSuccessToast: false,
    showErrorToast: true,
  });

  // Check backend health on mount
  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setHealthStatus('checking');
    const isHealthy = await apiClient.healthCheck();
    setHealthStatus(isHealthy ? 'healthy' : 'unhealthy');
  };

  const testEndpoint = async (endpoint: string, method: 'GET' | 'POST' = 'GET') => {
    const result: ApiTestResult = {
      endpoint,
      status: 'pending',
      message: 'Testing...',
    };

    setTestResults(prev => [result, ...prev]);

    try {
      let response;
      
      if (method === 'GET') {
        response = await apiClient.get(endpoint);
      } else {
        response = await apiClient.post(endpoint, { test: true });
      }

      const updatedResult: ApiTestResult = {
        endpoint,
        status: response.success ? 'success' : 'error',
        message: response.success 
          ? 'Request successful' 
          : response.error?.message || 'Request failed',
        data: response.data,
      };

      setTestResults(prev => 
        prev.map((r, i) => i === 0 ? updatedResult : r)
      );

      if (response.success) {
        toast.success(`${method} ${endpoint} succeeded`);
      }
    } catch (err: any) {
      const updatedResult: ApiTestResult = {
        endpoint,
        status: 'error',
        message: err.message || 'Request failed',
      };

      setTestResults(prev => 
        prev.map((r, i) => i === 0 ? updatedResult : r)
      );
    }
  };

  const testCustomEndpoint = async () => {
    if (!customEndpoint) {
      toast.error('Please enter an endpoint');
      return;
    }
    await testEndpoint(customEndpoint);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Backend API Integration - Test Dashboard</CardTitle>
          <CardDescription>
            Test your connection to the Google Cloud Backend API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Health Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold">Backend Health Status</h3>
              <p className="text-sm text-muted-foreground">
                https://launchpad-backend-dot-smartq-backend-784299.ew.r.appspot.com
              </p>
            </div>
            <div className="flex items-center gap-3">
              {healthStatus === 'checking' && (
                <Badge variant="secondary">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </Badge>
              )}
              {healthStatus === 'healthy' && (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Healthy
                </Badge>
              )}
              {healthStatus === 'unhealthy' && (
                <Badge variant="destructive">
                  <XCircle className="w-4 h-4 mr-2" />
                  Unhealthy
                </Badge>
              )}
              <Button size="sm" variant="outline" onClick={checkHealth}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Test Buttons */}
          <div>
            <h3 className="font-semibold mb-3">Quick Tests</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <Button 
                onClick={() => testEndpoint('/health')}
                variant="outline"
              >
                Test /health
              </Button>
              <Button 
                onClick={() => testEndpoint('/api/status')}
                variant="outline"
              >
                Test /api/status
              </Button>
              <Button 
                onClick={() => testEndpoint('/version')}
                variant="outline"
              >
                Test /version
              </Button>
            </div>
          </div>

          {/* Custom Endpoint Test */}
          <div>
            <h3 className="font-semibold mb-3">Custom Endpoint Test</h3>
            <div className="flex gap-3">
              <Input
                placeholder="/your-endpoint"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') testCustomEndpoint();
                }}
              />
              <Button onClick={testCustomEndpoint}>
                Test
              </Button>
            </div>
          </div>

          {/* Results */}
          {testResults.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Test Results</h3>
                <Button size="sm" variant="ghost" onClick={clearResults}>
                  Clear
                </Button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <Alert 
                    key={index}
                    variant={result.status === 'error' ? 'destructive' : 'default'}
                    className={result.status === 'success' ? 'border-green-500' : ''}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {result.status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                          {result.status === 'error' && <XCircle className="w-4 h-4" />}
                          {result.status === 'pending' && <Loader2 className="w-4 h-4 animate-spin" />}
                          <code className="text-sm font-mono">{result.endpoint}</code>
                        </div>
                        <AlertDescription>
                          {result.message}
                        </AlertDescription>
                        {result.data && (
                          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          {/* Documentation Link */}
          <Alert>
            <AlertDescription>
              <p className="font-semibold mb-2">📚 Integration Documentation</p>
              <p className="text-sm">
                For detailed integration guide, API usage examples, and best practices,
                see <code className="bg-muted px-1 py-0.5 rounded">BACKEND_API_INTEGRATION.md</code>
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackendApiExample;

