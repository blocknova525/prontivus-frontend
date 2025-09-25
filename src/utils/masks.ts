/**
 * Prontivus Input Masks
 * Brazilian-specific input formatting
 */

// CPF mask: 000.000.000-00
export const cpfMask = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  return numbers
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

// CNPJ mask: 00.000.000/0000-00
export const cnpjMask = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  return numbers
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
};

// Phone mask: (00) 00000-0000 or (00) 0000-0000
export const phoneMask = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 10) {
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  } else {
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
  }
};

// CEP mask: 00000-000
export const cepMask = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
};

// Date mask: DD/MM/AAAA
export const dateMask = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  return numbers
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})\/(\d{2})(\d)/, '$1/$2/$3')
    .replace(/(\d{2})\/(\d{2})\/(\d{4})(\d)/, '$1/$2/$3');
};

// Time mask: HH:MM
export const timeMask = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/(\d{2})(\d)/, '$1:$2');
};

// Currency mask: R$ 0,00
export const currencyMask = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  const amount = parseInt(numbers) / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
};

// CRM mask: 000000
export const crmMask = (value: string): string => {
  return value.replace(/\D/g, '').substring(0, 6);
};

// CNES mask: 0000000
export const cnesMask = (value: string): string => {
  return value.replace(/\D/g, '').substring(0, 7);
};

// Generic number mask
export const numberMask = (value: string): string => {
  return value.replace(/\D/g, '');
};

// Generic text mask (letters only)
export const textMask = (value: string): string => {
  return value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
};

// Generic alphanumeric mask
export const alphanumericMask = (value: string): string => {
  return value.replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, '');
};

// Email mask (no special formatting, just validation)
export const emailMask = (value: string): string => {
  return value.toLowerCase().trim();
};

// Generic mask function
export const applyMask = (value: string, maskType: string): string => {
  const masks: Record<string, (value: string) => string> = {
    'cpf': cpfMask,
    'cnpj': cnpjMask,
    'phone': phoneMask,
    'cep': cepMask,
    'date': dateMask,
    'time': timeMask,
    'currency': currencyMask,
    'crm': crmMask,
    'cnes': cnesMask,
    'number': numberMask,
    'text': textMask,
    'alphanumeric': alphanumericMask,
    'email': emailMask,
  };
  
  const maskFunction = masks[maskType];
  return maskFunction ? maskFunction(value) : value;
};

// Unmask function (remove all formatting)
export const unmask = (value: string): string => {
  return value.replace(/\D/g, '');
};

// Format phone for API calls
export const formatPhoneForAPI = (phone: string): string => {
  const numbers = phone.replace(/\D/g, '');
  if (numbers.length === 11) {
    return `+55${numbers}`;
  } else if (numbers.length === 10) {
    return `+55${numbers}`;
  }
  return phone;
};

// Format CPF for API calls
export const formatCPFForAPI = (cpf: string): string => {
  return cpf.replace(/\D/g, '');
};

// Format CNPJ for API calls
export const formatCNPJForAPI = (cnpj: string): string => {
  return cnpj.replace(/\D/g, '');
};

// Format date for API calls (YYYY-MM-DD)
export const formatDateForAPI = (date: string): string => {
  const parts = date.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return date;
};

// Format currency for API calls (remove formatting, keep as number)
export const formatCurrencyForAPI = (currency: string): number => {
  const numbers = currency.replace(/\D/g, '');
  return parseInt(numbers) / 100;
};
