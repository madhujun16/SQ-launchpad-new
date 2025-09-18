import React from 'react';
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { SaveStatus } from '@/hooks/useSectionAutoSave';

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  className?: string;
  showText?: boolean;
}

export const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({
  status,
  className = '',
  showText = false
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'saved':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          text: 'Saved',
          textColor: 'text-green-700'
        };
      case 'saving':
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          text: 'Saving...',
          textColor: 'text-green-700'
        };
      case 'unsaved':
        return {
          icon: <Clock className="h-4 w-4" />,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          text: 'Unsaved',
          textColor: 'text-orange-700'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          text: 'Error',
          textColor: 'text-red-700'
        };
      default:
        return {
          icon: <Clock className="h-4 w-4" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          text: 'Unknown',
          textColor: 'text-gray-700'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${config.bgColor} ${className}`}>
      <span className={config.color}>
        {config.icon}
      </span>
      {showText && (
        <span className={`text-xs font-medium ${config.textColor}`}>
          {config.text}
        </span>
      )}
    </div>
  );
};

interface SectionHeaderProps {
  title: string;
  icon: React.ReactNode;
  status: SaveStatus;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  icon,
  status,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center">
        <span className="mr-2">{icon}</span>
        <span className="font-semibold">{title}</span>
      </div>
      <SaveStatusIndicator status={status} />
    </div>
  );
};

interface AutoSaveSummaryProps {
  unsavedCount: number;
  isSaving: boolean;
  lastSaved: Date | null;
  className?: string;
}

export const AutoSaveSummary: React.FC<AutoSaveSummaryProps> = ({
  unsavedCount,
  isSaving,
  lastSaved,
  className = ''
}) => {
  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className={`flex items-center gap-4 text-sm text-gray-600 ${className}`}>
      {isSaving && (
        <div className="flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin text-green-600" />
          <span>Saving...</span>
        </div>
      )}
      
      {unsavedCount > 0 && !isSaving && (
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-orange-600" />
          <span>{unsavedCount} section{unsavedCount !== 1 ? 's' : ''} unsaved</span>
        </div>
      )}
      
      {lastSaved && unsavedCount === 0 && !isSaving && (
        <div className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-green-600" />
          <span>Last saved {formatLastSaved(lastSaved)}</span>
        </div>
      )}
    </div>
  );
};
