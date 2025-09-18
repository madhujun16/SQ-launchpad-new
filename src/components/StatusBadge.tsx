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
    // New finalized UnifiedSiteStatus values
    Created: {
      label: "Site Created",
      className: "bg-gray-100 text-gray-800 border-gray-200"
    },
    site_study_done: {
      label: "Site Study Done",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200"
    },
    scoping_done: {
      label: "Scoping Done",
      className: "bg-indigo-100 text-indigo-800 border-indigo-200"
    },
    procurement_done: {
      label: "Procurement Done",
      className: "bg-green-100 text-green-800 border-blue-200"
    },
    deployed: {
      label: "Deployed",
      className: "bg-green-100 text-green-800 border-green-200"
    },
    live: {
      label: "Live",
      className: "bg-emerald-100 text-emerald-800 border-emerald-200"
    },
    // Legacy status mappings for backward compatibility
    created: {
      label: "Site Created",
      className: "bg-gray-100 text-gray-800 border-gray-200"
    },
    study_in_progress: {
      label: "Site Study Done",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200"
    },
    study_completed: {
      label: "Site Study Done",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200"
    },
    hardware_scoped: {
      label: "Scoping Done",
      className: "bg-indigo-100 text-indigo-800 border-indigo-200"
    },
    procurement: {
      label: "Procurement Done",
      className: "bg-green-100 text-green-800 border-blue-200"
    },
    deployment: {
      label: "Deployed",
      className: "bg-green-100 text-green-800 border-green-200"
    },
    activated: {
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