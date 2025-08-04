import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Alert as AlertType } from '@/types/workflow';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  XCircle, 
  Clock, 
  CheckCircle,
  X 
} from 'lucide-react';

interface AlertBannerProps {
  alert: AlertType;
  onDismiss?: (alertId: string) => void;
  onAction?: (alertId: string, action: string) => void;
  showActions?: boolean;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  alert,
  onDismiss,
  onAction,
  showActions = true,
}) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4" />;
      case 'low':
        return <Info className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'high':
        return 'border-orange-200 bg-orange-50 text-orange-800';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'low':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getActionButtons = () => {
    switch (alert.type) {
      case 'license_expiry':
        return [
          { label: 'Renew License', action: 'renew', variant: 'default' as const },
          { label: 'View Details', action: 'view', variant: 'outline' as const }
        ];
      case 'warranty_expiry':
        return [
          { label: 'Extend Warranty', action: 'extend', variant: 'default' as const },
          { label: 'View Details', action: 'view', variant: 'outline' as const }
        ];
      case 'service_due':
        return [
          { label: 'Schedule Service', action: 'schedule', variant: 'default' as const },
          { label: 'View Details', action: 'view', variant: 'outline' as const }
        ];
      case 'deployment_delay':
        return [
          { label: 'Update Status', action: 'update', variant: 'default' as const },
          { label: 'View Details', action: 'view', variant: 'outline' as const }
        ];
      case 'approval_overdue':
        return [
          { label: 'Review Now', action: 'review', variant: 'default' as const },
          { label: 'Escalate', action: 'escalate', variant: 'outline' as const }
        ];
      default:
        return [
          { label: 'View Details', action: 'view', variant: 'outline' as const }
        ];
    }
  };

  const isExpired = alert.expiresAt && new Date(alert.expiresAt) < new Date();

  if (isExpired) {
    return null;
  }

  return (
    <Alert className={`${getSeverityColor(alert.severity)} border-l-4`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {getSeverityIcon(alert.severity)}
          <div className="flex-1">
            <AlertTitle className="font-semibold">{alert.title}</AlertTitle>
            <AlertDescription className="mt-1">{alert.message}</AlertDescription>
            
            {showActions && onAction && (
              <div className="flex items-center space-x-2 mt-3">
                {getActionButtons().map((button) => (
                  <Button
                    key={button.action}
                    size="sm"
                    variant={button.variant}
                    onClick={() => onAction(alert.id, button.action)}
                    className="text-xs"
                  >
                    {button.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {onDismiss && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDismiss(alert.id)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
        <div className="flex items-center space-x-2">
          <Clock className="h-3 w-3" />
          <span>{new Date(alert.createdAt).toLocaleString()}</span>
        </div>
        
        {alert.expiresAt && (
          <div className="flex items-center space-x-1">
            <span>Expires:</span>
            <span>{new Date(alert.expiresAt).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </Alert>
  );
};

export default AlertBanner; 