import React, { useState, useRef, useEffect } from 'react';

// Select Component
export interface VentureSelectOption {
  value: string;
  label: string;
  avatar?: string;
  description?: string;
  icon?: React.ReactNode;
  flag?: string;
  disabled?: boolean;
}

export interface VentureSelectProps {
  label?: string;
  placeholder?: string;
  options: VentureSelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export const VentureSelect = ({
  label,
  placeholder = 'Value',
  options,
  value,
  onChange,
  disabled = false,
  className = '',
}: VentureSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === selectedValue);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    if (!disabled) {
      setSelectedValue(optionValue);
      onChange?.(optionValue);
      setIsOpen(false);
    }
  };

  const triggerClasses = [
    'venture-select-trigger',
    isOpen && 'open',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="venture-input-group" ref={dropdownRef}>
      {label && <label className="venture-input-label">{label}</label>}
      
      <button
        type="button"
        className={triggerClasses}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={selectedOption ? '' : 'placeholder'}>
          {selectedOption?.label || placeholder}
        </span>
        <svg className="venture-select-icon" fill="none" viewBox="0 0 20 20">
          <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="venture-dropdown simple" style={{ position: 'absolute', zIndex: 50, marginTop: '0.25rem', width: '100%' }}>
          {options.map((option) => (
            <div
              key={option.value}
              className="venture-option"
              onClick={() => !option.disabled && handleSelect(option.value)}
              style={{ opacity: option.disabled ? 0.5 : 1 }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Select with Checkbox (Multi-select)
export interface VentureMultiSelectProps {
  label?: string;
  placeholder?: string;
  options: VentureSelectOption[];
  value?: string[];
  onChange?: (value: string[]) => void;
  disabled?: boolean;
}

export const VentureMultiSelect = ({
  label,
  placeholder = 'Select options',
  options,
  value = [],
  onChange,
  disabled = false,
}: VentureMultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = (optionValue: string) => {
    if (disabled) return;
    
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter(v => v !== optionValue)
      : [...selectedValues, optionValue];
    
    setSelectedValues(newValues);
    onChange?.(newValues);
  };

  const displayText = selectedValues.length > 0
    ? `${selectedValues.length} selected`
    : placeholder;

  return (
    <div className="venture-input-group" ref={dropdownRef}>
      {label && <label className="venture-input-label">{label}</label>}
      
      <button
        type="button"
        className={`venture-select-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={selectedValues.length === 0 ? 'placeholder' : ''}>
          {displayText}
        </span>
        <svg className="venture-select-icon" fill="none" viewBox="0 0 20 20">
          <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="venture-dropdown" style={{ position: 'absolute', zIndex: 50, marginTop: '0.25rem', width: '100%' }}>
          {options.map((option) => (
            <div
              key={option.value}
              className="venture-option venture-option-checkbox"
              onClick={() => !option.disabled && handleToggle(option.value)}
              style={{ opacity: option.disabled ? 0.5 : 1 }}
            >
              <div className={`venture-checkbox ${selectedValues.includes(option.value) ? 'checked' : ''}`}>
                <svg className="venture-checkbox-icon" fill="currentColor" viewBox="0 0 12 12">
                  <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Select with Radio (Single select with radio buttons)
export const VentureRadioSelect = ({
  label,
  placeholder = 'Select option',
  options,
  value,
  onChange,
  disabled = false,
}: VentureSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === selectedValue);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    if (!disabled) {
      setSelectedValue(optionValue);
      onChange?.(optionValue);
      setIsOpen(false);
    }
  };

  return (
    <div className="venture-input-group" ref={dropdownRef}>
      {label && <label className="venture-input-label">{label}</label>}
      
      <button
        type="button"
        className={`venture-select-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={selectedOption ? '' : 'placeholder'}>
          {selectedOption?.label || placeholder}
        </span>
        <svg className="venture-select-icon" fill="none" viewBox="0 0 20 20">
          <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="venture-dropdown" style={{ position: 'absolute', zIndex: 50, marginTop: '0.25rem', width: '100%' }}>
          {options.map((option) => (
            <div
              key={option.value}
              className="venture-option venture-option-radio"
              onClick={() => !option.disabled && handleSelect(option.value)}
              style={{ opacity: option.disabled ? 0.5 : 1 }}
            >
              <div className={`venture-radio ${selectedValue === option.value ? 'checked' : ''}`}>
                <div className="venture-radio-dot" />
              </div>
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Select with Avatars
export const VentureAvatarSelect = ({
  label,
  placeholder = 'Select user',
  options,
  value,
  onChange,
  disabled = false,
}: VentureSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === selectedValue);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    if (!disabled) {
      setSelectedValue(optionValue);
      onChange?.(optionValue);
      setIsOpen(false);
    }
  };

  return (
    <div className="venture-input-group" ref={dropdownRef}>
      {label && <label className="venture-input-label">{label}</label>}
      
      <button
        type="button"
        className={`venture-select-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={selectedOption ? '' : 'placeholder'}>
          {selectedOption?.label || placeholder}
        </span>
        <svg className="venture-select-icon" fill="none" viewBox="0 0 20 20">
          <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="venture-dropdown" style={{ position: 'absolute', zIndex: 50, marginTop: '0.25rem', width: '100%' }}>
          {options.map((option) => (
            <div
              key={option.value}
              className="venture-option venture-option-avatar"
              onClick={() => !option.disabled && handleSelect(option.value)}
              style={{ opacity: option.disabled ? 0.5 : 1 }}
            >
              {option.avatar && <img src={option.avatar} alt={option.label} />}
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Select with Detailed Options (Avatar + Description)
export const VentureDetailedSelect = ({
  label,
  placeholder = 'Select option',
  options,
  value,
  onChange,
  disabled = false,
}: VentureSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === selectedValue);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    if (!disabled) {
      setSelectedValue(optionValue);
      onChange?.(optionValue);
      setIsOpen(false);
    }
  };

  return (
    <div className="venture-input-group" ref={dropdownRef}>
      {label && <label className="venture-input-label">{label}</label>}
      
      <button
        type="button"
        className={`venture-select-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={selectedOption ? '' : 'placeholder'}>
          {selectedOption?.label || placeholder}
        </span>
        <svg className="venture-select-icon" fill="none" viewBox="0 0 20 20">
          <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="venture-dropdown" style={{ position: 'absolute', zIndex: 50, marginTop: '0.25rem', width: '100%' }}>
          {options.map((option) => (
            <div
              key={option.value}
              className="venture-option venture-option-detailed"
              onClick={() => !option.disabled && handleSelect(option.value)}
              style={{ opacity: option.disabled ? 0.5 : 1, padding: '0.375rem 0.75rem' }}
            >
              {option.avatar ? (
                <img src={option.avatar} alt={option.label} />
              ) : option.icon ? (
                <div className="venture-option-icon">{option.icon}</div>
              ) : null}
              <div className="venture-option-content">
                <div className="venture-option-title">{option.label}</div>
                {option.description && (
                  <div className="venture-option-description">{option.description}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Date Picker Component
export interface VentureDatePickerProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export const VentureDatePicker = ({
  label,
  placeholder = 'Select Date Range',
  value,
  onChange,
  disabled = false,
}: VentureDatePickerProps) => {
  const [selectedDate, setSelectedDate] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    onChange?.(e.target.value);
  };

  return (
    <div className="venture-input-group">
      {label && <label className="venture-input-label">{label}</label>}
      
      <div className={`venture-select-trigger ${disabled ? 'disabled' : ''}`} style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}>
        <svg className="venture-datepicker-icon" fill="none" viewBox="0 0 20 20">
          <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 8h14M7 2v3M13 2v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="date"
          value={selectedDate}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: 'var(--font-venture)',
            fontSize: '14px',
            color: selectedDate ? 'var(--content-dark-primary)' : 'var(--content-dark-tertiary)',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        />
        <svg className="venture-select-icon" fill="none" viewBox="0 0 20 20">
          <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};

// Checkbox Component
export interface VentureCheckboxProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export const VentureCheckbox = ({
  label,
  checked = false,
  onChange,
  disabled = false,
}: VentureCheckboxProps) => {
  const handleClick = () => {
    if (!disabled) {
      onChange?.(!checked);
    }
  };

  return (
    <div 
      className="venture-option venture-option-checkbox"
      onClick={handleClick}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer', padding: '0.375rem 0.75rem' }}
    >
      <div className={`venture-checkbox ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}`}>
        <svg className="venture-checkbox-icon" fill="none" viewBox="0 0 12 12">
          <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {label && <span>{label}</span>}
    </div>
  );
};

// Radio Button Component
export interface VentureRadioProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export const VentureRadio = ({
  label,
  checked = false,
  onChange,
  disabled = false,
}: VentureRadioProps) => {
  const handleClick = () => {
    if (!disabled) {
      onChange?.(!checked);
    }
  };

  return (
    <div 
      className="venture-option venture-option-radio"
      onClick={handleClick}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer', padding: '0.375rem 0.75rem' }}
    >
      <div className={`venture-radio ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}`}>
        <div className="venture-radio-dot" />
      </div>
      {label && <span>{label}</span>}
    </div>
  );
};

// Example Usage
export const SelectExamples = () => {
  const [selectValue, setSelectValue] = useState('');
  const [multiValue, setMultiValue] = useState<string[]>([]);
  const [radioValue, setRadioValue] = useState('');
  const [dateValue, setDateValue] = useState('');

  const simpleOptions: VentureSelectOption[] = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
    { value: '4', label: 'Option 4' },
  ];

  const detailedOptions: VentureSelectOption[] = [
    { value: '1', label: 'John Doe', description: 'john@example.com', avatar: 'https://placehold.co/40x40' },
    { value: '2', label: 'Jane Smith', description: 'jane@example.com', avatar: 'https://placehold.co/40x40' },
    { value: '3', label: 'Bob Johnson', description: 'bob@example.com', avatar: 'https://placehold.co/40x40' },
  ];

  return (
    <div className="space-y-8 p-8 max-w-md">
      <h3 className="text-venture-h3 font-medium font-venture text-content-dark-primary">Selector Examples</h3>
      
      <VentureSelect
        label="Label"
        placeholder="Value"
        options={simpleOptions}
        value={selectValue}
        onChange={setSelectValue}
      />

      <VentureMultiSelect
        label="Multi Select"
        placeholder="Select multiple"
        options={simpleOptions}
        value={multiValue}
        onChange={setMultiValue}
      />

      <VentureRadioSelect
        label="Radio Select"
        placeholder="Select one"
        options={simpleOptions}
        value={radioValue}
        onChange={setRadioValue}
      />

      <VentureDetailedSelect
        label="User Select"
        placeholder="Select user"
        options={detailedOptions}
        value={selectValue}
        onChange={setSelectValue}
      />

      <VentureDatePicker
        label="Input Label"
        placeholder="Select Date Range"
        value={dateValue}
        onChange={setDateValue}
      />

      <VentureSelect
        label="Disabled Select"
        placeholder="Value"
        options={simpleOptions}
        disabled
      />
    </div>
  );
};
