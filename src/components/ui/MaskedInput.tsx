import React, { useState, useEffect, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface MaskedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  mask: 'cpf' | 'phone' | 'date' | 'cep' | 'cnpj' | 'custom';
  customMask?: string;
  error?: string;
  success?: string;
  required?: boolean;
  placeholder?: string;
}

// Mask patterns
const masks = {
  cpf: '000.000.000-00',
  phone: '(00) 00000-0000',
  date: '00/00/0000',
  cep: '00000-000',
  cnpj: '00.000.000/0000-00',
};

// Apply mask to value
const applyMask = (value: string, mask: string): string => {
  let maskedValue = '';
  let valueIndex = 0;

  for (let i = 0; i < mask.length && valueIndex < value.length; i++) {
    if (mask[i] === '0') {
      if (/\d/.test(value[valueIndex])) {
        maskedValue += value[valueIndex];
        valueIndex++;
      } else {
        break;
      }
    } else {
      maskedValue += mask[i];
    }
  }

  return maskedValue;
};

// Remove mask from value
const removeMask = (value: string): string => {
  return value.replace(/\D/g, '');
};

// Validation functions
const validateCPF = (cpf: string): boolean => {
  const cleanCPF = removeMask(cpf);
  if (cleanCPF.length !== 11) return false;
  
  // Check for invalid patterns
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validate CPF algorithm
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF[9])) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF[10])) return false;
  
  return true;
};

const validatePhone = (phone: string): boolean => {
  const cleanPhone = removeMask(phone);
  return cleanPhone.length === 10 || cleanPhone.length === 11;
};

const validateDate = (date: string): boolean => {
  const cleanDate = removeMask(date);
  if (cleanDate.length !== 8) return false;
  
  const day = parseInt(cleanDate.substring(0, 2));
  const month = parseInt(cleanDate.substring(2, 4));
  const year = parseInt(cleanDate.substring(4, 8));
  
  if (day < 1 || day > 31) return false;
  if (month < 1 || month > 12) return false;
  if (year < 1900 || year > new Date().getFullYear()) return false;
  
  const dateObj = new Date(year, month - 1, day);
  return dateObj.getDate() === day && dateObj.getMonth() === month - 1 && dateObj.getFullYear() === year;
};

const validateCEP = (cep: string): boolean => {
  const cleanCEP = removeMask(cep);
  return cleanCEP.length === 8;
};

const validateCNPJ = (cnpj: string): boolean => {
  const cleanCNPJ = removeMask(cnpj);
  if (cleanCNPJ.length !== 14) return false;
  
  // Check for invalid patterns
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
  
  // Validate CNPJ algorithm
  let sum = 0;
  let weight = 2;
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(cleanCNPJ[i]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;
  if (firstDigit !== parseInt(cleanCNPJ[12])) return false;
  
  sum = 0;
  weight = 2;
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(cleanCNPJ[i]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;
  if (secondDigit !== parseInt(cleanCNPJ[13])) return false;
  
  return true;
};

const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ 
    label, 
    mask, 
    customMask, 
    error, 
    success, 
    required, 
    placeholder, 
    className, 
    value, 
    onChange, 
    ...props 
  }, ref) => {
    const [inputValue, setInputValue] = useState('');
    const [isValid, setIsValid] = useState<boolean | null>(null);

    const maskPattern = mask === 'custom' ? customMask || '' : masks[mask];

    useEffect(() => {
      if (value !== undefined) {
        setInputValue(value as string);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = removeMask(e.target.value);
      const maskedValue = applyMask(rawValue, maskPattern);
      
      setInputValue(maskedValue);
      
      // Validate based on mask type
      let valid = true;
      if (maskedValue.length > 0) {
        switch (mask) {
          case 'cpf':
            valid = validateCPF(maskedValue);
            break;
          case 'phone':
            valid = validatePhone(maskedValue);
            break;
          case 'date':
            valid = validateDate(maskedValue);
            break;
          case 'cep':
            valid = validateCEP(maskedValue);
            break;
          case 'cnpj':
            valid = validateCNPJ(maskedValue);
            break;
          default:
            valid = true;
        }
      }
      
      setIsValid(valid);
      
      // Call original onChange with the raw value
      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: rawValue,
            name: e.target.name,
          },
        };
        onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
      }
    };

    const getPlaceholder = () => {
      if (placeholder) return placeholder;
      switch (mask) {
        case 'cpf':
          return '000.000.000-00';
        case 'phone':
          return '(00) 00000-0000';
        case 'date':
          return '00/00/0000';
        case 'cep':
          return '00000-000';
        case 'cnpj':
          return '00.000.000/0000-00';
        default:
          return '';
      }
    };

    const getStatusClass = () => {
      if (error) return 'border-red-500 focus:border-red-500 focus:ring-red-500';
      if (success) return 'border-green-500 focus:border-green-500 focus:ring-green-500';
      if (isValid === false && inputValue.length > 0) return 'border-red-500 focus:border-red-500 focus:ring-red-500';
      if (isValid === true) return 'border-green-500 focus:border-green-500 focus:ring-green-500';
      return '';
    };

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={props.id} className={cn(required && 'required')}>
            {label}
          </Label>
        )}
        <Input
          ref={ref}
          value={inputValue}
          onChange={handleChange}
          placeholder={getPlaceholder()}
          className={cn(
            'transition-colors duration-200',
            getStatusClass(),
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <span className="text-red-500">⚠</span>
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-600 flex items-center gap-1">
            <span className="text-green-500">✓</span>
            {success}
          </p>
        )}
        {isValid === false && inputValue.length > 0 && !error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <span className="text-red-500">⚠</span>
            Formato inválido
          </p>
        )}
        {isValid === true && inputValue.length > 0 && !success && (
          <p className="text-sm text-green-600 flex items-center gap-1">
            <span className="text-green-500">✓</span>
            Formato válido
          </p>
        )}
      </div>
    );
  }
);

MaskedInput.displayName = 'MaskedInput';

export { MaskedInput };
