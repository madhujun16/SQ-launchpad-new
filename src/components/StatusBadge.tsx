import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { UnifiedSiteStatus } from '@/lib/siteTypes';

interface StatusBadgeProps {
  status: "pending" | "approved" | "in-progress" | "completed" | "rejected" | UnifiedSiteStatus;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const statusConfig = {
    // Generic statuses - Semantic color system based on UX best practices
    pending: {
      label: "Pending",
      className: "bg-amber-100 text-amber-800 border-amber-200"
    },
    approved: {
      label: "Approved", 
      className: "bg-green-100 text-green-800 border-green-200"
    },
    "in-progress": {
      label: "In Progress",
      className: "bg-blue-100 text-blue-800 border-blue-200"
    },
    completed: {
      label: "Completed",
      className: "bg-green-100 text-green-800 border-green-200"
    },
    rejected: {
      label: "Rejected",
      className: "bg-red-100 text-red-800 border-red-200"
    },
    // Site workflow statuses - Sequential progression with semantic colors
    Created: {
      label: "Site Created",
      className: "bg-gray-100 text-gray-800 border-gray-200"
    },
    site_study_done: {
      label: "Site Study Done",
      className: "bg-purple-100 text-purple-800 border-purple-200"
    },
    scoping_done: {
      label: "Scoping Done",
      className: "bg-blue-100 text-blue-800 border-blue-200"
    },
    procurement_done: {
      label: "Procurement Done",
      className: "bg-cyan-100 text-cyan-800 border-cyan-200"
    },
    deployed: {
      label: "Deployed",
      className: "bg-green-200 text-green-900 border-green-300"
    },
    live: {
      label: "Live",
      className: "bg-gradient-to-r from-green-300 to-emerald-300 text-green-950 border-green-400 shadow-md"
    },
    // Legacy status mappings for backward compatibility
    created: {
      label: "Site Created",
      className: "bg-gray-100 text-gray-800 border-gray-200"
    },
    study_in_progress: {
      label: "Site Study Done",
      className: "bg-purple-100 text-purple-800 border-purple-200"
    },
    study_completed: {
      label: "Site Study Done",
      className: "bg-purple-100 text-purple-800 border-purple-200"
    },
    hardware_scoped: {
      label: "Scoping Done",
      className: "bg-blue-100 text-blue-800 border-blue-200"
    },
    procurement: {
      label: "Procurement Done",
      className: "bg-cyan-100 text-cyan-800 border-cyan-200"
    },
    deployment: {
      label: "Deployed",
      className: "bg-green-200 text-green-900 border-green-300"
    },
    activated: {
      label: "Live",
      className: "bg-gradient-to-r from-green-300 to-emerald-300 text-green-950 border-green-400 shadow-md"
    }
  } as const;

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    className: "bg-green-50 text-green-700 border-green-100"
  };

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;