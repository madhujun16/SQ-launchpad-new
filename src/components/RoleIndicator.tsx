import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { getRoleConfig } from '@/lib/roles';

interface RoleIndicatorProps {
  className?: string;
  showDescription?: boolean;
}

export const RoleIndicator: React.FC<RoleIndicatorProps> = ({ 
  className = '', 
  showDescription = false 
}) => {
  const { currentRole } = useAuth();
  
  if (!currentRole) {
    return null;
  }

  const roleConfig = getRoleConfig(currentRole);
  const RoleIcon = roleConfig.icon;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Badge 
        variant="outline" 
        className={`flex items-center space-x-1 ${roleConfig.color} border-current`}
      >
        <RoleIcon className="h-3 w-3" />
        <span className="text-xs font-medium">{roleConfig.displayName}</span>
      </Badge>
      {showDescription && (
        <span className="text-xs text-muted-foreground">
          {roleConfig.description}
        </span>
      )}
    </div>
  );
};

export default RoleIndicator; 