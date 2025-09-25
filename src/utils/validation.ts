/**
 * Prontivus Form Validation Utilities
 * Brazilian-specific validation with masks and error messages
 */

// Brazilian CPF validation
export const validateCPF = (cpf: string): { isValid: boolean; error?: string } => {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) {
    return { isValid: false, error: 'CPF deve ter 11 dígitos' };
  }
  
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return { isValid: false, error: 'CPF inválido' };
  }
  
  // CPF validation algorithm
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) {
    return { isValid: false, error: 'CPF inválido' };
  }
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) {
    return { isValid: false, error: 'CPF inválido' };
  }
  
  return { isValid: true };
};

// Brazilian CNPJ validation
export const validateCNPJ = (cnpj: string): { isValid: boolean; error?: string } => {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  if (cleanCNPJ.length !== 14) {
    return { isValid: false, error: 'CNPJ deve ter 14 dígitos' };
  }
  
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) {
    return { isValid: false, error: 'CNPJ inválido' };
  }
  
  // CNPJ validation algorithm
  let sum = 0;
  let weight = 2;
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;
  
  if (firstDigit !== parseInt(cleanCNPJ.charAt(12))) {
    return { isValid: false, error: 'CNPJ inválido' };
  }
  
  sum = 0;
  weight = 2;
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;
  
  if (secondDigit !== parseInt(cleanCNPJ.charAt(13))) {
    return { isValid: false, error: 'CNPJ inválido' };
  }
  
  return { isValid: true };
};

// Brazilian phone validation
export const validatePhone = (phone: string): { isValid: boolean; error?: string } => {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    return { isValid: false, error: 'Telefone deve ter 10 ou 11 dígitos' };
  }
  
  if (cleanPhone.length === 11 && !cleanPhone.startsWith('11')) {
    return { isValid: false, error: 'Telefone celular deve começar com 11' };
  }
  
  return { isValid: true };
};

// Email validation
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { isValid: false, error: 'Email é obrigatório' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Email inválido' };
  }
  
  return { isValid: true };
};

// Date validation
export const validateDate = (date: string): { isValid: boolean; error?: string } => {
  if (!date) {
    return { isValid: false, error: 'Data é obrigatória' };
  }
  
  const dateObj = new Date(date);
  const today = new Date();
  
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: 'Data inválida' };
  }
  
  if (dateObj > today) {
    return { isValid: false, error: 'Data não pode ser futura' };
  }
  
  return { isValid: true };
};

// Required field validation
export const validateRequired = (value: string | number | boolean): { isValid: boolean; error?: string } => {
  if (value === undefined || value === null || value === '') {
    return { isValid: false, error: 'Campo obrigatório' };
  }
  
  return { isValid: true };
};

// Brazilian CEP validation
export const validateCEP = (cep: string): { isValid: boolean; error?: string } => {
  const cleanCEP = cep.replace(/\D/g, '');
  
  if (cleanCEP.length !== 8) {
    return { isValid: false, error: 'CEP deve ter 8 dígitos' };
  }
  
  return { isValid: true };
};

// CRM validation
export const validateCRM = (crm: string): { isValid: boolean; error?: string } => {
  const cleanCRM = crm.replace(/\D/g, '');
  
  if (cleanCRM.length < 4 || cleanCRM.length > 6) {
    return { isValid: false, error: 'CRM deve ter entre 4 e 6 dígitos' };
  }
  
  return { isValid: true };
};

// Password validation
export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: 'Senha é obrigatória' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'Senha deve ter pelo menos 6 caracteres' };
  }
  
  return { isValid: true };
};

// Name validation
export const validateName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || name.trim().length < 2) {
    return { isValid: false, error: 'Nome deve ter pelo menos 2 caracteres' };
  }
  
  if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name)) {
    return { isValid: false, error: 'Nome deve conter apenas letras' };
  }
  
  return { isValid: true };
};

// Comprehensive form validation
export const validateForm = (fields: Record<string, any>, rules: Record<string, any>) => {
  const errors: Record<string, string> = {};
  let isValid = true;
  
  for (const [fieldName, value] of Object.entries(fields)) {
    const fieldRules = rules[fieldName];
    if (!fieldRules) continue;
    
    for (const rule of fieldRules) {
      const validation = rule.validator(value);
      if (!validation.isValid) {
        errors[fieldName] = validation.error || 'Campo inválido';
        isValid = false;
        break;
      }
    }
  }
  
  return { isValid, errors };
};

// Success message generator
export const getSuccessMessage = (action: string): string => {
  const messages: Record<string, string> = {
    'create': 'Registro criado com sucesso!',
    'update': 'Registro atualizado com sucesso!',
    'delete': 'Registro excluído com sucesso!',
    'save': 'Dados salvos com sucesso!',
    'send': 'Enviado com sucesso!',
    'login': 'Login realizado com sucesso!',
    'logout': 'Logout realizado com sucesso!',
    'register': 'Cadastro realizado com sucesso!',
    'appointment': 'Agendamento realizado com sucesso!',
    'prescription': 'Receita criada com sucesso!',
    'exam': 'Exame enviado com sucesso!',
  };
  
  return messages[action] || 'Operação realizada com sucesso!';
};

// Error message generator
export const getErrorMessage = (error: string): string => {
  const messages: Record<string, string> = {
    'network': 'Erro de conexão. Verifique sua internet.',
    'server': 'Erro do servidor. Tente novamente.',
    'unauthorized': 'Acesso não autorizado.',
    'forbidden': 'Acesso negado.',
    'not_found': 'Recurso não encontrado.',
    'validation': 'Dados inválidos. Verifique os campos.',
    'duplicate': 'Registro já existe.',
    'expired': 'Sessão expirada. Faça login novamente.',
  };
  
  return messages[error] || 'Ocorreu um erro. Tente novamente.';
};
