import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getRoleConfig } from '@/lib/roles';

interface AccessDeniedProps {
  requiredRole?: string;
  pageName?: string;
  customMessage?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ 
  requiredRole, 
  pageName = 'this page',
  customMessage 
}) => {
  const navigate = useNavigate();
  const { currentRole } = useAuth();
  const roleConfig = currentRole ? getRoleConfig(currentRole) : null;

  const getDefaultMessage = () => {
    if (requiredRole && currentRole) {
      return `You need ${requiredRole} permissions to access ${pageName}.`;
    }
    return `You don't have permission to access ${pageName}.`;
  };

  const message = customMessage || getDefaultMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Access Denied</CardTitle>
          <CardDescription className="text-gray-600">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Current Role:</strong> {roleConfig?.displayName || currentRole || 'Unknown'}
              {requiredRole && (
                <>
                  <br />
                  <strong>Required Role:</strong> {requiredRole}
                </>
              )}
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={() => navigate('/dashboard')} 
              className="w-full"
              variant="default"
            >
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
            <Button 
              onClick={() => navigate(-1)} 
              variant="outline" 
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 