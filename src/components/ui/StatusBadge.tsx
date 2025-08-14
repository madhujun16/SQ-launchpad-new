import React from 'react';
import { Badge } from './badge';
import { AppIcons } from '@/lib/icons';

type StatusTone = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusBadgeProps {
  tone: StatusTone;
  label: string;
}

const toneToClasses: Record<StatusTone, string> = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  neutral: 'bg-gray-100 text-gray-800',
};

const toneToIcon: Record<StatusTone, React.ComponentType<{ className?: string }>> = {
  success: AppIcons.success,
  warning: AppIcons.pending,
  error: AppIcons.error,
  info: AppIcons.info,
  neutral: AppIcons.info,
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ tone, label }) => {
  const Icon = toneToIcon[tone];
  return (
    <Badge className={`${toneToClasses[tone]} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};


