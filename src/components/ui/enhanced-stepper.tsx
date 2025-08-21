import React, { useState } from 'react';
import { CheckCircle, Circle, ChevronDown, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

export interface EnhancedStepperStep {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'current' | 'upcoming';
  icon?: React.ComponentType<{ className?: string }>;
  isExpanded?: boolean;
  canCollapse?: boolean;
  readOnly?: boolean; // New property to control field editability
}

export interface EnhancedStepperProps {
  steps: EnhancedStepperStep[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  onStepToggle?: (stepIndex: number, isExpanded: boolean) => void;
  className?: string;
  children?: React.ReactNode;
  onNext?: () => void;
  onPrevious?: () => void;
  onComplete?: () => void;
  canProceed?: boolean;
  showNavigation?: boolean;
}

export const EnhancedStepper: React.FC<EnhancedStepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  onStepToggle,
  className,
  children,
  onNext,
  onPrevious,
  onComplete,
  canProceed = true,
  showNavigation = true
}) => {
  const currentStepData = steps[currentStep];
  const nextStepData = currentStep < steps.length - 1 ? steps[currentStep + 1] : null;
  const completedSteps = steps.filter(step => step.status === 'completed').length;

  const handleStepToggle = (stepIndex: number) => {
    if (onStepToggle) {
      const currentExpanded = steps[stepIndex].isExpanded;
      onStepToggle(stepIndex, !currentExpanded);
    }
  };

  return (
    <div className={cn("w-full space-y-6", className)}>
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
                    isCurrent && "bg-gradient-to-r from-black to-green-800 border-green-600 text-white shadow-lg",
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
                    isCurrent && "text-green-800",
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

      {/* Content */}
      <div className="mt-8">
        {children}
      </div>
      
      {/* Navigation */}
      {showNavigation && (
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            {currentStep === steps.length - 1 ? (
              <Button
                onClick={onComplete}
                disabled={!canProceed}
                className="bg-gradient-to-r from-black to-green-800 hover:from-black hover:to-green-900 text-white"
              >
                Complete
              </Button>
            ) : (
              <Button
                onClick={onNext}
                disabled={!canProceed}
                className="bg-gradient-to-r from-black to-green-800 hover:from-black hover:to-green-900 text-white"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Step Content Component with Collapsible Sections
export interface EnhancedStepContentProps {
  step: EnhancedStepperStep;
  isExpanded: boolean;
  onToggle: () => void;
  canCollapse?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const EnhancedStepContent: React.FC<EnhancedStepContentProps> = ({
  step,
  isExpanded,
  onToggle,
  canCollapse = true,
  children,
  className
}) => {
  const isCompleted = step.status === 'completed';

  return (
    <Card className={cn("transition-all duration-200", className)}>
      <CardHeader 
        className={cn(
          "cursor-pointer transition-all duration-200",
          isCompleted && "bg-green-50 border-green-200",
          !isExpanded && "hover:bg-gray-50"
        )}
        onClick={canCollapse ? onToggle : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Status Icon */}
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              isCompleted 
                ? "bg-green-500 text-white" 
                : "bg-gray-200 text-gray-600"
            )}>
              {isCompleted ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                step.icon ? (
                  <step.icon className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )
              )}
            </div>
            
            {/* Step Info */}
            <div>
              <CardTitle className={cn(
                "text-lg",
                isCompleted && "text-green-800"
              )}>
                {step.title}
              </CardTitle>
              {step.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {step.description}
                </p>
              )}
            </div>
          </div>
          
          {/* Toggle Button */}
          {canCollapse && (
            <div className="flex items-center gap-2">
              {isCompleted && (
                <span className="text-sm text-green-600 font-medium">
                  Completed
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      {/* Expandable Content */}
      {isExpanded && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
};

// Multi-Step Form Container
export interface MultiStepFormProps {
  steps: EnhancedStepperStep[];
  currentStep: number;
  onStepChange: (stepIndex: number) => void;
  onStepToggle?: (stepIndex: number, isExpanded: boolean) => void;
  children: React.ReactNode;
  className?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  onComplete?: () => void;
  canProceed?: boolean;
  showNavigation?: boolean;
}

export const MultiStepForm: React.FC<MultiStepFormProps> = ({
  steps,
  currentStep,
  onStepChange,
  onStepToggle,
  children,
  className,
  onNext,
  onPrevious,
  onComplete,
  canProceed = true,
  showNavigation = true
}) => {
  return (
    <div className={cn("space-y-6", className)}>
      <EnhancedStepper
        steps={steps}
        currentStep={currentStep}
        onStepClick={onStepChange}
        onStepToggle={onStepToggle}
        onNext={onNext}
        onPrevious={onPrevious}
        onComplete={onComplete}
        canProceed={canProceed}
        showNavigation={showNavigation}
      >
        {children}
      </EnhancedStepper>
    </div>
  );
};

// Read-Only Field Components for Conditional Editability
export interface ReadOnlyFieldProps {
  label: string;
  value: string | number;
  required?: boolean;
  placeholder?: string;
  className?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  readOnly?: boolean;
  onChange?: (value: string) => void;
}

export const ReadOnlyInput: React.FC<ReadOnlyFieldProps> = ({
  label,
  value,
  required = false,
  placeholder,
  className,
  type = 'text',
  readOnly = false,
  onChange
}) => {
  if (readOnly) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
          {value || placeholder || 'Not provided'}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={label.toLowerCase().replace(/\s+/g, '-')} className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={label.toLowerCase().replace(/\s+/g, '-')}
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full"
      />
    </div>
  );
};

export interface ReadOnlyTextareaProps {
  label: string;
  value: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  rows?: number;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}

export const ReadOnlyTextarea: React.FC<ReadOnlyTextareaProps> = ({
  label,
  value,
  required = false,
  placeholder,
  className,
  rows = 3,
  readOnly = false,
  onChange
}) => {
  if (readOnly) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 min-h-[60px]">
          {value || placeholder || 'Not provided'}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={label.toLowerCase().replace(/\s+/g, '-')} className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Textarea
        id={label.toLowerCase().replace(/\s+/g, '-')}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full"
      />
    </div>
  );
};

export interface ReadOnlySelectProps {
  label: string;
  value: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  options: { value: string; label: string }[];
  readOnly?: boolean;
  onChange?: (value: string) => void;
}

export const ReadOnlySelect: React.FC<ReadOnlySelectProps> = ({
  label,
  value,
  required = false,
  placeholder,
  className,
  options,
  readOnly = false,
  onChange
}) => {
  if (readOnly) {
    const selectedOption = options.find(opt => opt.value === value);
    return (
      <div className={cn("space-y-2", className)}>
        <Label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
          {selectedOption?.label || value || placeholder || 'Not provided'}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={label.toLowerCase().replace(/\s+/g, '-')} className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

// Helper function to determine if a step should be read-only
export const isStepReadOnly = (step: EnhancedStepperStep): boolean => {
  return step.readOnly || step.status === 'completed';
};
