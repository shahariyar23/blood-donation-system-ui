// src/shared/form/Form.tsx
import React from 'react';
import CustomButton from '../button/CustomButton';
import {Icons} from '../icons/Icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { cn } from "../../lib/utils"

export type FieldType = 
  | 'text' | 'email' | 'password' | 'tel' | 'number'
  | 'select' | 'textarea' | 'checkbox' | 'date';

export interface FieldOption {
  value: string;
  label: string;
  id?: string;  // Support both id and value
}

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: FieldOption[];           // for select
  required?: boolean;
  pattern?: string;                  // regex pattern
  min?: number;                      // for number inputs
  max?: number;                      // for number inputs
  rows?: number;                      // for textarea
  colSpan?: 'full' | 'half';         // for layout control
  disabled?: boolean;
  helperText?: string;               // hint below input
  icon?: React.ElementType;           // Icon component
  className?: string;                 // Additional classes
  minDate?: Date;                      // for date picker
  maxDate?: Date;                      // for date picker
}

interface FormProps {
  fields: Field[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  errors?: Record<string, string>;
  submitText?: string | React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  layout?: 'single' | 'double' | 'triple';
  className?: string;
  footer?: React.ReactNode;
  showSubmitButton?: boolean;
}

const Form: React.FC<FormProps> = ({
  fields,
  values,
  onChange,
  onSubmit,
  errors = {},
  submitText = 'Submit',
  loading = false,
  disabled = false,
  layout = 'single',
  className = '',
  footer,
  showSubmitButton = true,
}) => {
  // Check if any checkbox exists in fields
  const hasCheckbox = fields.some(f => f.type === 'checkbox');
  
  // Get grid columns based on layout prop and checkbox presence
  const getGridCols = () => {
    // Force single column if there are checkboxes (they look better full width)
    if (hasCheckbox) return 'grid-cols-1';
    
    switch (layout) {
      case 'double':
        return 'grid-cols-1 md:grid-cols-2';
      case 'triple':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      default:
        return 'grid-cols-1';
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, type, value } = e.target;
    let newValue: any = value;
    
    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      newValue = value === '' ? '' : Number(value);
    }
    
    onChange(name, newValue);
  };

  const handleDateChange = (name: string, date: Date | null) => {
  onChange(name, date ? date.toISOString().split('T')[0] : '');
};

  const renderField = (field: Field) => {
    const error = errors[field.name];
    const value = values[field.name] || '';
    const Icon = field.icon;
    
    // Base input classes
    const baseInputClass = cn(
      "w-full transition-colors focus:border-primary",
      Icon && "pl-10",
      error && "border-primary/50 ring-1 ring-primary/30",
      field.className
    );

    // Common wrapper for icon
    const renderWithIcon = (element: React.ReactNode) => (
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-3 h-4 w-4 text-dark/40 z-10" />}
        {element}
      </div>
    );

    let element: React.ReactNode = null;

    switch (field.type) {
      case 'select':
        element = renderWithIcon(
          <select
            id={field.name}
            name={field.name}
            value={value}
            onChange={handleChange}
            disabled={field.disabled || disabled}
            required={field.required}
            className={cn(baseInputClass, "input-field appearance-none bg-white")}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((opt) => (
              <option key={opt.id || opt.value} value={opt.id || opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
        break;

      case 'textarea':
        element = renderWithIcon(
          <textarea
            id={field.name}
            name={field.name}
            value={value}
            onChange={handleChange}
            disabled={field.disabled || disabled}
            required={field.required}
            rows={field.rows || 4}
            className={cn(baseInputClass, "input-field resize-y min-h-25")}
            placeholder={field.placeholder}
          />
        );
        break;

      case 'checkbox':
        element = (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={field.name}
              name={field.name}
              checked={!!value}
              onChange={handleChange}
              disabled={field.disabled || disabled}
              className="w-4 h-4 rounded-xs border-gray-300 text-primary focus:ring-primary transition-colors"
            />
            <label 
              htmlFor={field.name}
              className="text-sm text-dark/70 cursor-pointer hover:text-primary transition-colors select-none"
            >
              {field.label}
              {field.required && <span className="text-primary ml-1">*</span>}
            </label>
          </div>
        );
        break;

      case 'date':
        element = renderWithIcon(
          <DatePicker
            selected={value ? new Date(value) : null}
            onChange={(date: Date | null) => handleDateChange(field.name, date)}
            dateFormat="dd/MM/yyyy"
            placeholderText={field.placeholder || "Select date"}
            className={cn(baseInputClass, "input-field")}
            minDate={field.minDate || new Date()}
            maxDate={field.maxDate}
            isClearable
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={15}
            wrapperClassName="w-full"
            disabled={field.disabled || disabled}
          />
        );
        break;

      case 'number':
        element = renderWithIcon(
          <input
            type="number"
            id={field.name}
            name={field.name}
            value={value}
            onChange={handleChange}
            disabled={field.disabled || disabled}
            required={field.required}
            min={field.min}
            max={field.max}
            className={cn(baseInputClass, "input-field")}
            placeholder={field.placeholder}
          />
        );
        break;

      default: // text, email, password, tel
        element = renderWithIcon(
          <input
            type={field.type}
            id={field.name}
            name={field.name}
            value={value}
            onChange={handleChange}
            disabled={field.disabled || disabled}
            required={field.required}
            pattern={field.pattern}
            className={cn(baseInputClass, "input-field")}
            placeholder={field.placeholder}
          />
        );
    }

    return element;
  };

  return (
    <form onSubmit={onSubmit} className={className}>
      <div className={cn("grid gap-4 md:gap-5", getGridCols())}>
        {fields.map((field) => (
          <div
            key={field.name}
            className={cn(
              "space-y-1",
              field.type === 'checkbox' ? "space-y-0" : "space-y-1.5",
              field.colSpan === 'full' && "md:col-span-2",
              field.colSpan === 'half' && layout === 'double' && "md:col-span-1"
            )}
          >
            {/* Label - only show for non-checkbox fields */}
            {field.type !== 'checkbox' && (
              <label 
                htmlFor={field.name} 
                className="block text-sm font-medium text-foreground"
              >
                {field.label}
                {field.required && <span className="text-primary ml-1">*</span>}
              </label>
            )}

            {/* Field */}
            {renderField(field)}

            {/* Error or Helper Text */}
            {errors[field.name] && (
              <p className="text-xs text-primary flex items-center gap-1 mt-1">
                <Icons.Setting />
                {errors[field.name]}
              </p>
            )}
            {field.helperText && !errors[field.name] && (
              <p className="text-xs text-dark/50 mt-1">{field.helperText}</p>
            )}
          </div>
        ))}
      </div>

      {/* Submit Button */}
      {showSubmitButton && (
        <div className="mt-6 md:mt-8">
          <CustomButton
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={disabled || loading}
            className="transition-all duration-200 hover:shadow-md active:scale-95"
          >
            {typeof submitText === 'string' ? (
              <span className="flex items-center justify-center gap-2">
                {submitText}
              </span>
            ) : (
              submitText
            )}
          </CustomButton>
        </div>
      )}

      {/* Footer */}
      {footer && <div className="mt-4">{footer}</div>}
    </form>
  );
};

export default Form;