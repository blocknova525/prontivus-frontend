import { useState, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface FormData {
  [key: string]: any;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface UseFormValidationReturn {
  errors: ValidationErrors;
  isValid: boolean;
  validateField: (field: string, value: any) => string | null;
  validateForm: (data: FormData) => boolean;
  clearErrors: () => void;
  clearFieldError: (field: string) => void;
  setError: (field: string, message: string) => void;
}

export const useFormValidation = (rules: ValidationRules): UseFormValidationReturn => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = useCallback((field: string, value: any): string | null => {
    const rule = rules[field];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return rule.message || `${field} é obrigatório`;
    }

    // Skip other validations if value is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }

    // Min length validation
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      return rule.message || `${field} deve ter pelo menos ${rule.minLength} caracteres`;
    }

    // Max length validation
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      return rule.message || `${field} deve ter no máximo ${rule.maxLength} caracteres`;
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return rule.message || `${field} tem formato inválido`;
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        return customError;
      }
    }

    return null;
  }, [rules]);

  const validateForm = useCallback((data: FormData): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(rules).forEach(field => {
      const error = validateField(field, data[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [rules, validateField]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const setError = useCallback((field: string, message: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: message
    }));
  }, []);

  const isValid = Object.keys(errors).length === 0;

  return {
    errors,
    isValid,
    validateField,
    validateForm,
    clearErrors,
    clearFieldError,
    setError
  };
};

// Common validation rules
export const commonValidationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Email inválido'
  },
  password: {
    required: true,
    minLength: 6,
    message: 'Senha deve ter pelo menos 6 caracteres'
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    message: 'Nome deve ter entre 2 e 100 caracteres'
  },
  phone: {
    required: true,
    pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
    message: 'Telefone inválido'
  },
  cpf: {
    required: true,
    pattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    message: 'CPF inválido'
  },
  date: {
    required: true,
    pattern: /^\d{2}\/\d{2}\/\d{4}$/,
    message: 'Data inválida'
  },
  cep: {
    required: true,
    pattern: /^\d{5}-\d{3}$/,
    message: 'CEP inválido'
  }
};

// Custom validation functions
export const customValidators = {
  confirmPassword: (password: string) => (confirmPassword: string) => {
    return password !== confirmPassword ? 'Senhas não coincidem' : null;
  },
  futureDate: (value: string) => {
    const date = new Date(value.split('/').reverse().join('-'));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today ? 'Data deve ser futura' : null;
  },
  pastDate: (value: string) => {
    const date = new Date(value.split('/').reverse().join('-'));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today ? 'Data deve ser passada' : null;
  },
  ageRange: (min: number, max: number) => (value: string) => {
    const birthDate = new Date(value.split('/').reverse().join('-'));
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < min) return `Idade mínima: ${min} anos`;
    if (age > max) return `Idade máxima: ${max} anos`;
    return null;
  }
};
