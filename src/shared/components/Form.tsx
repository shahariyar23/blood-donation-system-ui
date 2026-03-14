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
  id?: string;
}

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: FieldOption[];
  required?: boolean;
  pattern?: string;
  min?: number;
  max?: number;
  rows?: number;
  colSpan?: 'full' | 'half';
  disabled?: boolean;
  helperText?: string;
  icon?: React.ElementType;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
}

interface FormProps {
  fields: Field[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  errors?: Record<string, string>;
  fieldActions?: Record<string, React.ReactNode>; // actions inside fields
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
  fieldActions = {},
  submitText = 'Submit',
  loading = false,
  disabled = false,
  layout = 'single',
  className = '',
  footer,
  showSubmitButton = true,
}) => {
  const hasCheckbox = fields.some(f => f.type === 'checkbox');
  
  const getGridCols = () => {
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
    const action = fieldActions[field.name];

    const baseInputClass = cn(
      "w-full transition-colors focus:border-primary",
      Icon && "pl-10",
      action && "pr-10",
      error && "border-primary/50 ring-1 ring-primary/30",
      field.className
    );

    const renderWithIconAndAction = (element: React.ReactNode) => (
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-3 h-4 w-4 text-dark/40 z-10" />}
        {element}
        {action && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
            {action}
          </div>
        )}
      </div>
    );

    let element: React.ReactNode = null;

    switch (field.type) {
      case 'select':
        element = renderWithIconAndAction(
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
        element = renderWithIconAndAction(
          <textarea
            id={field.name}
            name={field.name}
            value={value}
            onChange={handleChange}
            disabled={field.disabled || disabled}
            required={field.required}
            rows={field.rows || 4}
            className={cn(baseInputClass, "input-field resize-y min-h-[100px]")}
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
        element = renderWithIconAndAction(
          <DatePicker
            selected={value ? new Date(value) : null}
            onChange={(date: Date | null) => handleDateChange(field.name, date)}
            dateFormat="dd/MM/yyyy"
            placeholderText={field.placeholder || "Select date"}
            className={cn(baseInputClass, "input-field")}
            minDate={field.minDate}
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
        element = renderWithIconAndAction(
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
        element = renderWithIconAndAction(
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
            {field.type !== 'checkbox' && (
              <label 
                htmlFor={field.name} 
                className="block text-sm font-medium text-foreground"
              >
                {field.label}
                {field.required && <span className="text-primary ml-1">*</span>}
              </label>
            )}
            {renderField(field)}
            {errors[field.name] && (
              <p className="text-xs text-primary flex items-center gap-1 mt-1">
                <Icons.AlertCircle className="w-3 h-3" />
                {errors[field.name]}
              </p>
            )}
            {field.helperText && !errors[field.name] && (
              <p className="text-xs text-dark/50 mt-1">{field.helperText}</p>
            )}
          </div>
        ))}
      </div>

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

      {footer && <div className="mt-4">{footer}</div>}
    </form>
  );
};

export default Form;