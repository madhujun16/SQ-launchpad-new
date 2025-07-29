import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "pending" | "approved" | "in-progress" | "completed" | "rejected";
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const statusConfig = {
    pending: {
      label: "Pending",
      className: "bg-warning text-warning-foreground"
    },
    approved: {
      label: "Approved", 
      className: "bg-success text-success-foreground"
    },
    "in-progress": {
      label: "In Progress",
      className: "bg-info text-info-foreground"
    },
    completed: {
      label: "Completed",
      className: "bg-primary text-primary-foreground"
    },
    rejected: {
      label: "Rejected",
      className: "bg-destructive text-destructive-foreground"
    }
  };

  const config = statusConfig[status];

  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;