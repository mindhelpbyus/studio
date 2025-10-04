import React, { useState, forwardRef } from 'react';

// Text Input Component
export interface VentureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: boolean;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  prefix?: string;
  suffix?: string;
  showCount?: boolean;
  maxCount?: number;
}

export const VentureInput = forwardRef<HTMLInputElement, VentureInputProps>(
  (
    {
      label,
      helperText,
      error = false,
      success = false,
      leftIcon,
      rightIcon,
      prefix,
      suffix,
      showCount = false,
      maxCount,
      className = '',
      disabled,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(value || '');

    const currentValue = value !== undefined ? value : internalValue;
    const charCount = String(currentValue).length;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    const wrapperClasses = [
      'venture-input-wrapper',
      isFocused && 'focused',
      error && 'error',
      success && 'success',
      disabled && 'disabled',
    ].filter(Boolean).join(' ');

    const helperClasses = [
      'venture-input-helper',
      error && 'error',
      success && 'success',
    ].filter(Boolean).join(' ');

    return (
      <div className="venture-input-group">
        {label && <label className="venture-input-label">{label}</label>}
        
        <div className={wrapperClasses}>
          {prefix && (
            <>
              <div className="venture-input-prefix">
                <span>{prefix}</span>
                {leftIcon}
              </div>
              <div className="venture-input-divider" />
            </>
          )}
          
          {leftIcon && !prefix && (
            <span className="venture-input-icon">{leftIcon}</span>
          )}
          
          <input
            ref={ref}
            value={currentValue}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            className={className}
            {...props}
          />
          
          {isFocused && <div className="venture-input-cursor" />}
          
          {rightIcon && !suffix && !showCount && (
            <span className="venture-input-icon">{rightIcon}</span>
          )}
          
          {showCount && (
            <span className="venture-input-count">
              {charCount}{maxCount ? `/${maxCount}` : ''}
            </span>
          )}
          
          {suffix && (
            <>
              <div className="venture-input-divider" />
              <div className="venture-input-suffix">
                {rightIcon}
                <span>{suffix}</span>
              </div>
            </>
          )}
        </div>
        
        {helperText && <span className={helperClasses}>{helperText}</span>}
      </div>
    );
  }
);

VentureInput.displayName = 'VentureInput';

// Search Input Component
export interface VentureSearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  showShortcuts?: boolean;
}

export const VentureSearchInput = forwardRef<HTMLInputElement, VentureSearchInputProps>(
  ({ showShortcuts = true, className = '', ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const searchClasses = [
      'venture-search-input',
      isFocused && 'focused',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div className={searchClasses}>
        <div className="flex items-center gap-3">
          <svg className="venture-input-icon" fill="none" viewBox="0 0 20 20">
            <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="1.5" />
            <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            ref={ref}
            type="search"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
        </div>
        
        {showShortcuts && (
          <div className="venture-search-shortcuts">
            <div className="venture-search-key">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                <path d="M3.5 3.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L3.5 12.293V3.5zm3.5 1a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM7.5 8a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 4a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3z"/>
              </svg>
            </div>
            <div className="venture-search-key">F</div>
          </div>
        )}
      </div>
    );
  }
);

VentureSearchInput.displayName = 'VentureSearchInput';

// Textarea Component
export interface VentureTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: boolean;
  success?: boolean;
  showCount?: boolean;
  maxCount?: number;
}

export const VentureTextarea = forwardRef<HTMLTextAreaElement, VentureTextareaProps>(
  (
    {
      label,
      helperText,
      error = false,
      success = false,
      showCount = false,
      maxCount,
      className = '',
      disabled,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(value || '');

    const currentValue = value !== undefined ? value : internalValue;
    const charCount = String(currentValue).length;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (value === undefined) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    const textareaClasses = [
      'venture-textarea',
      error && 'error',
      success && 'success',
      className,
    ].filter(Boolean).join(' ');

    const helperClasses = [
      'venture-input-helper',
      error && 'error',
      success && 'success',
    ].filter(Boolean).join(' ');

    return (
      <div className="venture-input-group">
        {label && <label className="venture-input-label">{label}</label>}
        
        <div className="venture-textarea-wrapper">
          <textarea
            ref={ref}
            value={currentValue}
            onChange={handleChange}
            disabled={disabled}
            className={textareaClasses}
            {...props}
          />
          {showCount && (
            <span className="venture-textarea-count">
              {charCount}{maxCount ? `/${maxCount}` : ''}
            </span>
          )}
        </div>
        
        {helperText && <span className={helperClasses}>{helperText}</span>}
      </div>
    );
  }
);

VentureTextarea.displayName = 'VentureTextarea';

// Example Icons
export const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20">
    <path d="M3.75 7.5l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20">
    <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="1.5" />
    <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Usage Examples
export const InputExamples = () => (
  <div className="space-y-8 p-8 max-w-md">
    <h3 className="text-venture-h3 font-medium font-venture text-content-dark-primary">Input Examples</h3>
    
    {/* Basic Input */}
    <VentureInput
      label="Input Label"
      placeholder="Enter your title here"
      helperText="We will notify the customer and issue a full refund"
      showCount
      maxCount={50}
    />
    
    {/* Input with Prefix */}
    <VentureInput
      label="Phone Number"
      prefix="+1"
      leftIcon={<PhoneIcon />}
      placeholder="Enter your title here"
      helperText="We will notify the customer and issue a full refund"
      showCount
      maxCount={50}
    />
    
    {/* Input with Icon */}
    <VentureInput
      label="Search"
      leftIcon={<SearchIcon />}
      placeholder="Enter your title here"
      helperText="We will notify the customer and issue a full refund"
      showCount
      maxCount={50}
    />
    
    {/* Error State */}
    <VentureInput
      label="Input Label"
      leftIcon={<SearchIcon />}
      placeholder="Enter your title here"
      helperText="This field is required"
      error
      showCount
      maxCount={50}
    />
    
    {/* Success State */}
    <VentureInput
      label="Input Label"
      leftIcon={<SearchIcon />}
      placeholder="Enter your title here"
      helperText="Looks good!"
      success
      showCount
      maxCount={50}
    />
    
    {/* Disabled State */}
    <VentureInput
      label="Input Label"
      leftIcon={<SearchIcon />}
      placeholder="Enter your title here"
      helperText="We will notify the customer and issue a full refund"
      disabled
      showCount
      maxCount={50}
    />
    
    {/* Search Input */}
    <div className="space-y-4">
      <h4 className="text-venture-h5 font-medium font-venture text-content-dark-primary">Search Input</h4>
      <VentureSearchInput placeholder="Search" />
    </div>
    
    {/* Textarea */}
    <div className="space-y-4">
      <h4 className="text-venture-h5 font-medium font-venture text-content-dark-primary">Textarea</h4>
      <VentureTextarea
        label="Input Label"
        placeholder="Enter your title here"
        helperText="We will notify the customer and issue a full refund"
        showCount
        maxCount={50}
      />
    </div>
  </div>
);
