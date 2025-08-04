import React from 'react';
import { Badge } from '@/components/ui/badge';
import { DeploymentStage, getWorkflowStageLabel, getWorkflowStageColor } from '@/types/workflow';

interface WorkflowStatusBadgeProps {
  stage: DeploymentStage;
  className?: string;
  showIcon?: boolean;
}

export const WorkflowStatusBadge: React.FC<WorkflowStatusBadgeProps> = ({
  stage,
  className = '',
  showIcon = false,
}) => {
  const label = getWorkflowStageLabel(stage);
  const colorClasses = getWorkflowStageColor(stage);

  return (
    <Badge 
      variant="secondary" 
      className={`${colorClasses} ${className}`}
    >
      {showIcon && getStageIcon(stage)}
      <span className="ml-1">{label}</span>
    </Badge>
  );
};

const getStageIcon = (stage: DeploymentStage) => {
  switch (stage) {
    case 'site_created':
      return '🏗️';
    case 'study_in_progress':
      return '📋';
    case 'study_completed':
      return '✅';
    case 'hardware_scoped':
      return '⚙️';
    case 'approval_pending':
      return '⏳';
    case 'approval_approved':
      return '✅';
    case 'approval_rejected':
      return '❌';
    case 'deployment_scheduled':
      return '📅';
    case 'deployment_in_progress':
      return '🔧';
    case 'deployment_completed':
      return '✅';
    case 'go_live_ready':
      return '🚀';
    case 'live':
      return '🟢';
    default:
      return '';
  }
};

export default WorkflowStatusBadge; 