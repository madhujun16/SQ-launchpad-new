import React, { useRef, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';

interface OTPInputProps {
  length: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length,
  value,
  onChange,
  onComplete,
  error = false,
  disabled = false,
  className = ''
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  useEffect(() => {
    if (value.length === length && onComplete) {
      onComplete(value);
    }
  }, [value, length, onComplete]);

  const handleChange = (index: number, digit: string) => {
    if (disabled) return;

    const newValue = value.split('');
    newValue[index] = digit;
    const newValueString = newValue.join('');
    onChange(newValueString);

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Backspace') {
      if (value[index]) {
        // Clear current input
        const newValue = value.split('');
        newValue[index] = '';
        onChange(newValue.join(''));
      } else if (index > 0) {
        // Move to previous input and clear it
        const newValue = value.split('');
        newValue[index - 1] = '';
        onChange(newValue.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const handleBlur = () => {
    setFocusedIndex(-1);
  };

  const getInputClassName = (index: number) => {
    const baseClasses = `
      w-12 h-12 text-center text-lg font-semibold rounded-lg border-2 transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-[#30E481] focus:ring-opacity-50
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    if (error) {
      return `${baseClasses} border-red-400 bg-red-900/20 text-red-200`;
    }

    if (focusedIndex === index) {
      return `${baseClasses} border-[#30E481] bg-white/15 text-white`;
    }

    if (value[index]) {
      return `${baseClasses} border-[#1CB255] bg-white/10 text-white`;
    }

    return `${baseClasses} border-white/30 bg-white/10 text-white/70 hover:border-white/50`;
  };

  return (
    <div className={`flex gap-3 justify-center ${className}`}>
      {Array.from({ length }, (_, index) => (
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => {
            const digit = e.target.value.replace(/\D/g, '').slice(0, 1);
            handleChange(index, digit);
          }}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={() => handleFocus(index)}
          onBlur={handleBlur}
          disabled={disabled}
          className={getInputClassName(index)}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
};
