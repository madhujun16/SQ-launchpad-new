import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TaskQueue } from '@/types/workflow';
import { Clock, AlertCircle, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { formatDateTime, formatDate } from '@/lib/dateUtils';

interface TaskQueueCardProps {
  task: TaskQueue;
  onAction?: (taskId: string, action: 'start' | 'complete' | 'cancel') => void;
  showActions?: boolean;
}

export const TaskQueueCard: React.FC<TaskQueueCardProps> = ({
  task,
  onAction,
  showActions = true,
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'in_progress':
        return <AlertCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <Card className={`hover:shadow-md transition-shadow ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">{task.title}</CardTitle>
            <CardDescription className="mt-1">{task.description}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority.toUpperCase()}
            </Badge>
            <Badge className={getStatusColor(task.status)}>
              {getStatusIcon(task.status)}
              <span className="ml-1">{task.status.replace('_', ' ')}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Due: {formatDate(task.dueDate)}</span>
            </div>
            {task.siteId && (
              <Badge variant="outline" className="text-xs">
                Site: {task.siteId}
              </Badge>
            )}
          </div>
          
          {showActions && onAction && task.status === 'pending' && (
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => onAction(task.id, 'start')}
                className="bg-green-600 hover:bg-green-700"
              >
                Start
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAction(task.id, 'cancel')}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Cancel
              </Button>
            </div>
          )}
          
          {showActions && onAction && task.status === 'in_progress' && (
            <Button
              size="sm"
              onClick={() => onAction(task.id, 'complete')}
              className="bg-green-600 hover:bg-green-700"
            >
              Complete
            </Button>
          )}
        </div>
        
        {isOverdue && (
          <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded-md">
            <div className="flex items-center space-x-1 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Overdue</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskQueueCard; 