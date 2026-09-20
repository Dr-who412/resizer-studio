import React, { useState, useEffect, useRef } from 'react';

export interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'min' | 'max'> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  fallbackValue?: number;
}

/**
 * Free-text numeric input that:
 * - Accepts strictly digits only (0-9)
 * - Has NO increment/decrement spinner arrows or buttons
 * - Disables wheel and arrow key increment/decrement
 * - Allows free typing, backspacing, and editing without jumping or prematurely resetting
 * - Validates on blur/enter to maintain bounds (min/max)
 */
export const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onChange,
  min = 1,
  max,
  fallbackValue,
  className = '',
  onBlur: externalOnBlur,
  onKeyDown: externalOnKeyDown,
  ...rest
}) => {
  const [textValue, setTextValue] = useState<string>(
    Number.isFinite(value) ? String(value) : ''
  );
  const isFocusedRef = useRef(false);

  // Sync state when external value changes
  useEffect(() => {
    if (!isFocusedRef.current) {
      setTextValue(Number.isFinite(value) ? String(value) : '');
    } else {
      const parsed = parseInt(textValue, 10);
      if (!Number.isNaN(parsed) && parsed !== value) {
        setTextValue(String(value));
      }
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Filter out all non-digits (free text accepting only numbers)
    const digitsOnly = raw.replace(/\D/g, '');

    setTextValue(digitsOnly);

    if (digitsOnly === '') {
      // Allow user to clear input temporarily to type a new number freely
      return;
    }

    let parsed = parseInt(digitsOnly, 10);
    if (Number.isNaN(parsed)) return;

    if (max !== undefined && parsed > max) {
      parsed = max;
      setTextValue(String(parsed));
    }

    onChange(parsed);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    isFocusedRef.current = false;
    let finalValue = parseInt(textValue, 10);

    if (Number.isNaN(finalValue) || textValue === '') {
      finalValue = fallbackValue !== undefined ? fallbackValue : (min !== undefined ? min : value);
    } else if (min !== undefined && finalValue < min) {
      finalValue = min;
    } else if (max !== undefined && finalValue > max) {
      finalValue = max;
    }

    setTextValue(String(finalValue));
    onChange(finalValue);

    if (externalOnBlur) {
      externalOnBlur(e);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    isFocusedRef.current = true;
    if (rest.onFocus) {
      rest.onFocus(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Disable increment/decrement via ArrowUp and ArrowDown
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
    }
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
    if (externalOnKeyDown) {
      externalOnKeyDown(e);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    // Prevent mouse wheel from incrementing or decrementing
    e.currentTarget.blur();
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      autoComplete="off"
      value={textValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onWheel={handleWheel}
      className={className}
      {...rest}
    />
  );
};
