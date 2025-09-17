import React from 'react';
import { CalendarDays, Mail, Phone, DollarSign, Lock, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { cn } from '@/lib/utils';

// Base field wrapper component
interface BaseFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

const BaseField: React.FC<BaseFieldProps> = ({
  label,
  required = false,
  error,
  helpText,
  disabled = false,
  className,
  children
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className={cn(
        "text-sm font-medium text-gray-700",
        disabled && "text-gray-400"
      )}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {error && (
        <div className="flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
      {helpText && !error && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

// Date Field Widget
interface DateFieldProps {
  label: string;
  value?: Date | string;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  allowPastDates?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export const DateField: React.FC<DateFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = "Select date",
  required = false,
  error,
  helpText,
  disabled = false,
  allowPastDates = false,
  minDate,
  maxDate,
  className
}) => {
  return (
    <BaseField
      label={label}
      required={required}
      error={error}
      helpText={helpText}
      disabled={disabled}
      className={className}
    >
      <DatePicker
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        allowPastDates={allowPastDates}
        minDate={minDate}
        maxDate={maxDate}
        className="w-full"
      />
    </BaseField>
  );
};

// Number Field Widget
interface NumberFieldProps {
  label: string;
  value: number | string;
  onChange: (value: number) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export const NumberField: React.FC<NumberFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helpText,
  disabled = false,
  min,
  max,
  step = 1,
  className
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseFloat(e.target.value) || 0;
    onChange(numValue);
  };

  return (
    <BaseField
      label={label}
      required={required}
      error={error}
      helpText={helpText}
      disabled={disabled}
      className={className}
    >
      <Input
        type="number"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </BaseField>
  );
};

// Currency Field Widget
interface CurrencyFieldProps {
  label: string;
  value: number | string;
  onChange: (value: number) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  currency?: string;
  className?: string;
}

export const CurrencyField: React.FC<CurrencyFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helpText,
  disabled = false,
  min = 0,
  max,
  step = 0.01,
  currency = "£",
  className
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseFloat(e.target.value) || 0;
    onChange(numValue);
  };

  return (
    <BaseField
      label={label}
      required={required}
      error={error}
      helpText={helpText}
      disabled={disabled}
      className={className}
    >
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          <DollarSign className="h-4 w-4" />
        </div>
        <Input
          type="number"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className="pl-10 w-full"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
          {currency}
        </div>
      </div>
    </BaseField>
  );
};

// Email Field Widget
interface EmailFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  className?: string;
}

export const EmailField: React.FC<EmailFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = "Enter email address",
  required = false,
  error,
  helpText,
  disabled = false,
  className
}) => {
  return (
    <BaseField
      label={label}
      required={required}
      error={error}
      helpText={helpText}
      disabled={disabled}
      className={className}
    >
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          <Mail className="h-4 w-4" />
        </div>
        <Input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-10 w-full"
        />
      </div>
    </BaseField>
  );
};

// Phone Field Widget
interface PhoneFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  className?: string;
}

export const PhoneField: React.FC<PhoneFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = "Enter phone number",
  required = false,
  error,
  helpText,
  disabled = false,
  className
}) => {
  return (
    <BaseField
      label={label}
      required={required}
      error={error}
      helpText={helpText}
      disabled={disabled}
      className={className}
    >
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          <Phone className="h-4 w-4" />
        </div>
        <Input
          type="tel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-10 w-full"
        />
      </div>
    </BaseField>
  );
};

// Password Field Widget
interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  showStrength?: boolean;
  className?: string;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = "Enter password",
  required = false,
  error,
  helpText,
  disabled = false,
  showStrength = false,
  className
}) => {
  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 1, label: 'Weak', color: 'text-red-500' };
    if (password.length < 10) return { strength: 2, label: 'Medium', color: 'text-yellow-500' };
    return { strength: 3, label: 'Strong', color: 'text-green-500' };
  };

  const strength = getPasswordStrength(value);

  return (
    <BaseField
      label={label}
      required={required}
      error={error}
      helpText={helpText}
      disabled={disabled}
      className={className}
    >
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          <Lock className="h-4 w-4" />
        </div>
        <Input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-10 w-full"
        />
      </div>
      {showStrength && value && (
        <div className="flex items-center gap-2 mt-1">
          <div className="flex gap-1">
            {[1, 2, 3].map((level) => (
              <div
                key={level}
                className={cn(
                  "h-1 w-8 rounded",
                  level <= strength.strength
                    ? strength.strength === 1
                      ? "bg-red-500"
                      : strength.strength === 2
                      ? "bg-yellow-500"
                      : "bg-green-500"
                    : "bg-gray-200"
                )}
              />
            ))}
          </div>
          <span className={cn("text-xs", strength.color)}>{strength.label}</span>
        </div>
      )}
    </BaseField>
  );
};

// Text Field Widget
interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  className?: string;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helpText,
  disabled = false,
  className
}) => {
  return (
    <BaseField
      label={label}
      required={required}
      error={error}
      helpText={helpText}
      disabled={disabled}
      className={className}
    >
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full"
      />
    </BaseField>
  );
};

// Textarea Field Widget
interface TextareaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  rows?: number;
  className?: string;
}

export const TextareaField: React.FC<TextareaFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helpText,
  disabled = false,
  rows = 3,
  className
}) => {
  return (
    <BaseField
      label={label}
      required={required}
      error={error}
      helpText={helpText}
      disabled={disabled}
      className={className}
    >
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className="w-full resize-none"
      />
    </BaseField>
  );
};

// Select Field Widget
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  className?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  required = false,
  error,
  helpText,
  disabled = false,
  className
}) => {
  return (
    <BaseField
      label={label}
      required={required}
      error={error}
      helpText={helpText}
      disabled={disabled}
      className={className}
    >
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </BaseField>
  );
};

// Quantity Field Widget (specialized number field)
interface QuantityFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  required?: boolean;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  className?: string;
}

export const QuantityField: React.FC<QuantityFieldProps> = ({
  label,
  value,
  onChange,
  min = 1,
  max,
  required = false,
  error,
  helpText,
  disabled = false,
  className
}) => {
  return (
    <NumberField
      label={label}
      value={value}
      onChange={onChange}
      placeholder="Enter quantity"
      required={required}
      error={error}
      helpText={helpText}
      disabled={disabled}
      min={min}
      max={max}
      step={1}
      className={className}
    />
  );
};

// Percentage Field Widget (specialized number field)
interface PercentageFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  required?: boolean;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  className?: string;
}

export const PercentageField: React.FC<PercentageFieldProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  required = false,
  error,
  helpText,
  disabled = false,
  className
}) => {
  return (
    <BaseField
      label={label}
      required={required}
      error={error}
      helpText={helpText}
      disabled={disabled}
      className={className}
    >
      <div className="relative">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          placeholder="Enter percentage"
          disabled={disabled}
          min={min}
          max={max}
          step={0.1}
          className="w-full pr-8"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
          %
        </div>
      </div>
    </BaseField>
  );
};
