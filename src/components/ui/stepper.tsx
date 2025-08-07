import React from 'react';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export interface StepperStep {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'current' | 'upcoming';
  icon?: React.ComponentType<{ className?: string }>;
}

interface StepperProps {
  steps: StepperStep[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className
}) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';
          const isUpcoming = step.status === 'upcoming';
          
          return (
            <React.Fragment key={step.id}>
              {/* Step */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => onStepClick?.(index)}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200",
                    isCompleted && "bg-green-500 border-green-500 text-white",
                    isCurrent && "bg-blue-500 border-blue-500 text-white",
                    isUpcoming && "bg-gray-100 border-gray-300 text-gray-400",
                    onStepClick && "cursor-pointer hover:scale-105"
                  )}
                  disabled={!onStepClick}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : isCurrent ? (
                    step.icon ? (
                      <step.icon className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
                
                {/* Step Title */}
                <div className="mt-2 text-center">
                  <p className={cn(
                    "text-sm font-medium",
                    isCompleted && "text-green-600",
                    isCurrent && "text-blue-600",
                    isUpcoming && "text-gray-500"
                  )}>
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-gray-500 mt-1 max-w-24">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-4",
                  isCompleted ? "bg-green-500" : "bg-gray-300"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

interface StepperContentProps {
  steps: StepperStep[];
  currentStep: number;
  children: React.ReactNode;
  onNext?: () => void;
  onPrevious?: () => void;
  onComplete?: () => void;
  canProceed?: boolean;
  className?: string;
}

export const StepperContent: React.FC<StepperContentProps> = ({
  steps,
  currentStep,
  children,
  onNext,
  onPrevious,
  onComplete,
  canProceed = true,
  className
}) => {
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Stepper */}
      <Stepper steps={steps} currentStep={currentStep} />
      
      {/* Content */}
      <div className="mt-8">
        {children}
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirstStep}
        >
          Previous
        </Button>
        
        <div className="flex gap-2">
          {isLastStep ? (
            <Button
              onClick={onComplete}
              disabled={!canProceed}
              className="bg-green-600 hover:bg-green-700"
            >
              Complete Study
            </Button>
          ) : (
            <Button
              onClick={onNext}
              disabled={!canProceed}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}; 