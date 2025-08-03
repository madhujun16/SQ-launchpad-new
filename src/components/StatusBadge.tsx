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
    }
  };

  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;