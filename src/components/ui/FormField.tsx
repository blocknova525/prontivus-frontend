import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { applyMask, unmask } from '@/utils/masks';
import { validateRequired, validateCPF, validateCNPJ, validatePhone, validateEmail, validateDate, validateCEP, validateCRM, validatePassword, validateName } from '@/utils/validation';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'date' | 'time' | 'number';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  required?: boolean;
  disabled?: boolean;
  mask?: 'cpf' | 'cnpj' | 'phone' | 'cep' | 'date' | 'time' | 'currency' | 'crm' | 'cnes' | 'number' | 'text' | 'alphanumeric' | 'email';
  validation?: 'cpf' | 'cnpj' | 'phone' | 'email' | 'date' | 'cep' | 'crm' | 'password' | 'name' | 'required';
  error?: string;
  success?: string;
  helperText?: string;
  className?: string;
  icon?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  required = false,
  disabled = false,
  mask,
  validation,
  error,
  success,
  helperText,
  className,
  icon,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);

  // Handle input change with mask
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    if (mask) {
      newValue = applyMask(newValue, mask);
    }
    
    onChange(newValue);
  };

  // Handle validation on blur
  const handleBlur = () => {
    if (validation) {
      let validationResult;
      
      switch (validation) {
        case 'cpf':
          validationResult = validateCPF(value);
          break;
        case 'cnpj':
          validationResult = validateCNPJ(value);
          break;
        case 'phone':
          validationResult = validatePhone(value);
          break;
        case 'email':
          validationResult = validateEmail(value);
          break;
        case 'date':
          validationResult = validateDate(value);
          break;
        case 'cep':
          validationResult = validateCEP(value);
          break;
        case 'crm':
          validationResult = validateCRM(value);
          break;
        case 'password':
          validationResult = validatePassword(value);
          break;
        case 'name':
          validationResult = validateName(value);
          break;
        case 'required':
          validationResult = validateRequired(value);
          break;
        default:
          validationResult = { isValid: true };
      }
      
      setValidationError(validationResult.error || '');
      setIsValid(validationResult.isValid);
    }
    
    if (onBlur) {
      onBlur();
    }
  };

  // Determine field state
  const hasError = Boolean(error || validationError);
  const hasSuccess = Boolean(success) && !hasError;
  const showSuccess = hasSuccess && isValid;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label */}
      <label 
        htmlFor={name}
        className={cn(
          'text-sm font-medium transition-colors',
          hasError ? 'text-red-600' : 
          showSuccess ? 'text-green-600' : 
          'text-gray-700'
        )}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        {/* Input */}
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={() => setIsFocused(true)}
          disabled={disabled}
          className={cn(
            'w-full px-3 py-2 border rounded-lg transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            icon ? 'pl-10' : 'pl-3',
            hasError ? [
              'border-red-300 bg-red-50',
              'focus:border-red-500 focus:ring-red-200',
              'text-red-900 placeholder-red-300'
            ] : 
            showSuccess ? [
              'border-green-300 bg-green-50',
              'focus:border-green-500 focus:ring-green-200',
              'text-green-900 placeholder-green-300'
            ] : [
              'border-gray-300 bg-white',
              'focus:border-blue-500 focus:ring-blue-200',
              'text-gray-900 placeholder-gray-400'
            ]
          )}
        />

        {/* Success Icon */}
        {showSuccess && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* Error Icon */}
        {hasError && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Helper Text */}
      {helperText && !hasError && !showSuccess && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}

      {/* Error Message */}
      {hasError && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error || validationError}
        </p>
      )}

      {/* Success Message */}
      {showSuccess && (
        <p className="text-sm text-green-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {success}
        </p>
      )}
    </div>
  );
};

export default FormField;
