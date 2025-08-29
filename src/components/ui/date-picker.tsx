import React from 'react';
import { format } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DatePickerProps {
  value?: Date | string;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowPastDates?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
  className = "",
  allowPastDates = false,
  minDate,
  maxDate
}) => {
  // Convert string to Date if needed
  const dateValue = typeof value === 'string' ? new Date(value) : value;
  
  // Determine if date should be disabled
  const isDateDisabled = (date: Date) => {
    if (!allowPastDates && date <= new Date()) {
      return true;
    }
    if (minDate && date < minDate) {
      return true;
    }
    if (maxDate && date > maxDate) {
      return true;
    }
    return false;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className={`relative w-full ${disabled ? "opacity-50" : ""} ${className}`}>
          <Input 
            readOnly
            placeholder={placeholder}
            value={dateValue ? format(dateValue, 'PPP') : ''}
            className={`w-full cursor-pointer ${disabled ? "bg-gray-50" : "bg-white"}`}
            disabled={disabled}
          />
          <CalendarDays className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={onChange}
          disabled={isDateDisabled}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
