import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { UnifiedSiteStatus } from '@/lib/siteTypes';

interface StatusBadgeProps {
  status: "pending" | "approved" | "in-progress" | "completed" | "rejected" | UnifiedSiteStatus;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const statusConfig = {
    // Generic statuses
    pending: {
      label: "Pending",
      className: "bg-warning/10 text-warning border-warning/20 shadow-soft"
    },
    approved: {
      label: "Approved", 
      className: "bg-success/10 text-success border-success/20 shadow-soft"
    },
    "in-progress": {
      label: "In Progress",
      className: "bg-primary/10 text-primary-dark border-primary/20 shadow-soft"
    },
    completed: {
      label: "Completed",
      className: "bg-success/10 text-success border-success/20 shadow-soft"
    },
    rejected: {
      label: "Rejected",
      className: "bg-destructive/10 text-destructive border-destructive/20 shadow-soft"
    },
    // UnifiedSiteStatus values
    created: {
      label: "Created",
      className: "bg-blue-100 text-blue-800 border-blue-200"
    },
    study_in_progress: {
      label: "Study In Progress",
      className: "bg-purple-100 text-purple-800 border-purple-200"
    },
    study_completed: {
      label: "Study Completed",
      className: "bg-purple-100 text-purple-800 border-purple-200"
    },
    hardware_scoped: {
      label: "Hardware Scoped",
      className: "bg-orange-100 text-orange-800 border-orange-200"
    },
    procurement: {
      label: "Procurement",
      className: "bg-pink-100 text-pink-800 border-pink-200"
    },
    deployment: {
      label: "Deployment",
      className: "bg-cyan-100 text-cyan-800 border-cyan-200"
    },
    activated: {
      label: "Activated",
      className: "bg-green-100 text-green-800 border-green-200"
    },
    live: {
      label: "Live",
      className: "bg-emerald-100 text-emerald-800 border-emerald-200"
    }
  } as const;

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    className: "bg-gray-100 text-gray-800 border-gray-200"
  };

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;