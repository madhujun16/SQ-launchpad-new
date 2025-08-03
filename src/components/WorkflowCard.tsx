import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusBadge from "./StatusBadge";
import { MapPin, User, Calendar, ArrowRight } from "lucide-react";
import React from "react";

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

const WorkflowCard: React.FC<WorkflowCardProps> = ({ 
  title, 
  location, 
  assignee, 
  dueDate, 
  status, 
  description,
  onAction,
  actionLabel = "View Details"
}) => {
  return (
    <Card className="hover:shadow-soft transition-all duration-200 border-primary/20 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-primary-dark">{title}</CardTitle>
          <StatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">{description}</p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2 text-primary-dark">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{location}</span>
          </div>
          <div className="flex items-center space-x-2 text-primary-dark">
            <User className="h-4 w-4 text-primary" />
            <span>{assignee}</span>
          </div>
          <div className="flex items-center space-x-2 text-primary-dark">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{dueDate}</span>
          </div>
        </div>

        <div className="pt-2">
          <Button 
            variant="outline" 
            className="w-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 text-primary-dark"
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