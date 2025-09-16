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
  const currentStepData = steps[currentStep];
  const nextStepData = currentStep < steps.length - 1 ? steps[currentStep + 1] : null;
  const completedSteps = steps.filter(step => step.status === 'completed').length;

  return (
    <div className={cn("w-full", className)}>
      {/* Mobile Version - Compact Design */}
      <div className="md:hidden">
        <div className="flex items-center justify-between">
          {/* Left Side - Current Step Info */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {currentStepData?.title}
            </h3>
            {nextStepData && (
              <p className="text-sm text-gray-500 mt-1">
                Next: {nextStepData.title}
              </p>
            )}
          </div>
          
          {/* Right Side - Circular Progress */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center">
                <div 
                  className="absolute inset-0 rounded-full border-2 border-green-500"
                  style={{
                    clipPath: `polygon(0 0, ${(completedSteps / steps.length) * 100}% 0, ${(completedSteps / steps.length) * 100}% 100%, 0 100%)`
                  }}
                />
                <span className="text-sm font-semibold text-gray-700 relative z-10">
                  {currentStep + 1} of {steps.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Version - Full Horizontal Stepper */}
      <div className="hidden md:flex items-center justify-between">
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
                    "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200 shadow-sm",
                    isCompleted && "bg-green-500 border-green-500 text-white shadow-lg scale-110",
                    isCurrent && "bg-blue-500 border-blue-500 text-white shadow-lg",
                    isUpcoming && "bg-gray-100 border-gray-300 text-gray-400 hover:border-gray-400",
                    onStepClick && "cursor-pointer hover:scale-105"
                  )}
                  disabled={!onStepClick}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : isCurrent ? (
                    step.icon ? (
                      <step.icon className="h-6 w-6" />
                    ) : (
                      <Circle className="h-6 w-6" />
                    )
                  ) : (
                    <Circle className="h-6 w-6" />
                  )}
                </button>
                
                {/* Step Title */}
                <div className="mt-3 text-center">
                  <p className={cn(
                    "text-sm font-semibold",
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
                  "flex-1 h-1 mx-4 rounded-full transition-all duration-300",
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