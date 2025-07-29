import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusBadge from "./StatusBadge";
import { MapPin, User, Calendar, ArrowRight } from "lucide-react";

interface WorkflowCardProps {
  title: string;
  location: string;
  assignee: string;
  dueDate: string;
  status: "pending" | "approved" | "in-progress" | "completed" | "rejected";
  description: string;
  onAction?: () => void;
  actionLabel?: string;
}

const WorkflowCard = ({ 
  title, 
  location, 
  assignee, 
  dueDate, 
  status, 
  description,
  onAction,
  actionLabel = "View Details"
}: WorkflowCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
          <StatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">{description}</p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{assignee}</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{dueDate}</span>
          </div>
        </div>

        <div className="pt-2">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onAction}
          >
            {actionLabel}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowCard;