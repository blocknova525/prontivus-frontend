import { z } from "zod"

// Patient validation schema
export const patientSchema = z.object({
  name: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  cpf: z.string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF deve estar no formato 000.000.000-00")
    .refine((cpf) => isValidCPF(cpf), "CPF inválido"),
  rg: z.string()
    .regex(/^\d{1,2}\.\d{3}\.\d{3}-\d{1}$/, "RG deve estar no formato 00.000.000-0")
    .optional()
    .or(z.literal("")),
  birthDate: z.date({
    required_error: "Data de nascimento é obrigatória",
  }).refine((date) => {
    const today = new Date()
    const age = today.getFullYear() - date.getFullYear()
    return age >= 0 && age <= 120
  }, "Data de nascimento inválida"),
  phone: z.string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, "Telefone deve estar no formato (11) 99999-9999"),
  email: z.string()
    .email("E-mail inválido")
    .optional()
    .or(z.literal("")),
  address: z.string()
    .max(200, "Endereço deve ter no máximo 200 caracteres")
    .optional()
    .or(z.literal("")),
  city: z.string()
    .max(100, "Cidade deve ter no máximo 100 caracteres")
    .optional()
    .or(z.literal("")),
  state: z.string()
    .min(2, "Estado é obrigatório")
    .max(2, "Estado deve ter 2 caracteres"),
  zipCode: z.string()
    .regex(/^\d{5}-\d{3}$/, "CEP deve estar no formato 00000-000")
    .optional()
    .or(z.literal("")),
  emergencyContact: z.string()
    .max(100, "Nome do contato de emergência deve ter no máximo 100 caracteres")
    .optional()
    .or(z.literal("")),
  emergencyPhone: z.string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, "Telefone deve estar no formato (11) 99999-9999")
    .optional()
    .or(z.literal("")),
  insurance: z.string()
    .min(1, "Convênio é obrigatório"),
  insuranceNumber: z.string()
    .max(50, "Número da carteirinha deve ter no máximo 50 caracteres")
    .optional()
    .or(z.literal("")),
  allergies: z.string()
    .max(500, "Alergias devem ter no máximo 500 caracteres")
    .optional()
    .or(z.literal("")),
  medications: z.string()
    .max(500, "Medicações devem ter no máximo 500 caracteres")
    .optional()
    .or(z.literal("")),
  medicalHistory: z.string()
    .max(1000, "Histórico médico deve ter no máximo 1000 caracteres")
    .optional()
    .or(z.literal("")),
  notes: z.string()
    .max(500, "Observações devem ter no máximo 500 caracteres")
    .optional()
    .or(z.literal(""))
})

// Appointment validation schema
export const appointmentSchema = z.object({
  patientId: z.string().min(1, "Paciente é obrigatório"),
  patientName: z.string().min(1, "Nome do paciente é obrigatório"),
  doctorId: z.string().min(1, "Médico é obrigatório"),
  appointmentType: z.string().min(1, "Tipo de consulta é obrigatório"),
  date: z.date({
    required_error: "Data é obrigatória",
  }).refine((date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date >= today
  }, "Data não pode ser no passado"),
  time: z.string().min(1, "Horário é obrigatório"),
  duration: z.number().min(15, "Duração mínima é 15 minutos").max(180, "Duração máxima é 180 minutos"),
  notes: z.string()
    .max(500, "Observações devem ter no máximo 500 caracteres")
    .optional()
    .or(z.literal("")),
  priority: z.enum(["normal", "urgente", "emergencia"], {
    required_error: "Prioridade é obrigatória",
  }),
  insurance: z.string().min(1, "Convênio é obrigatório"),
  status: z.enum(["agendado", "confirmado", "cancelado", "concluido"], {
    required_error: "Status é obrigatório",
  })
})

// Inventory item validation schema
export const inventoryItemSchema = z.object({
  name: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  category: z.enum(["Medicamentos", "Materiais", "Equipamentos"], {
    required_error: "Categoria é obrigatória",
  }),
  quantity: z.number()
    .min(0, "Quantidade não pode ser negativa")
    .max(10000, "Quantidade máxima é 10000"),
  minQuantity: z.number()
    .min(0, "Quantidade mínima não pode ser negativa")
    .max(1000, "Quantidade mínima máxima é 1000"),
  maxQuantity: z.number()
    .min(1, "Quantidade máxima deve ser pelo menos 1")
    .max(10000, "Quantidade máxima é 10000"),
  unit: z.string()
    .min(1, "Unidade é obrigatória")
    .max(20, "Unidade deve ter no máximo 20 caracteres"),
  price: z.number()
    .min(0, "Preço não pode ser negativo")
    .max(10000, "Preço máximo é R$ 10.000"),
  supplier: z.string()
    .min(2, "Fornecedor deve ter pelo menos 2 caracteres")
    .max(100, "Fornecedor deve ter no máximo 100 caracteres"),
  expiryDate: z.date().optional(),
  status: z.enum(["ok", "low", "out"], {
    required_error: "Status é obrigatório",
  })
}).refine((data) => data.minQuantity <= data.maxQuantity, {
  message: "Quantidade mínima deve ser menor ou igual à quantidade máxima",
  path: ["minQuantity"]
}).refine((data) => data.quantity <= data.maxQuantity, {
  message: "Quantidade atual deve ser menor ou igual à quantidade máxima",
  path: ["quantity"]
})

// Financial transaction validation schema
export const transactionSchema = z.object({
  type: z.enum(["receita", "despesa"], {
    required_error: "Tipo é obrigatório",
  }),
  patientId: z.string().optional(),
  patientName: z.string().optional(),
  doctorId: z.string().optional(),
  doctorName: z.string().optional(),
  service: z.string().optional(),
  description: z.string().optional(),
  value: z.number()
    .min(0.01, "Valor deve ser maior que zero")
    .max(100000, "Valor máximo é R$ 100.000"),
  status: z.enum(["pago", "pendente", "cancelado"], {
    required_error: "Status é obrigatório",
  }),
  method: z.string()
    .min(1, "Método de pagamento é obrigatório")
    .max(50, "Método de pagamento deve ter no máximo 50 caracteres"),
  insurance: z.string().optional(),
  invoice: z.string()
    .min(1, "Número da fatura é obrigatório")
    .max(50, "Número da fatura deve ter no máximo 50 caracteres"),
  date: z.date({
    required_error: "Data é obrigatória",
  })
})

// Utility functions
export function isValidCPF(cpf: string): boolean {
  // Remove non-numeric characters
  const cleanCPF = cpf.replace(/\D/g, '')
  
  // Check if CPF has 11 digits
  if (cleanCPF.length !== 11) return false
  
  // Check for invalid patterns (all same digits)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false
  
  // Validate first check digit
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
  }
  let remainder = sum % 11
  let firstDigit = remainder < 2 ? 0 : 11 - remainder
  
  if (parseInt(cleanCPF.charAt(9)) !== firstDigit) return false
  
  // Validate second check digit
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
  }
  remainder = sum % 11
  let secondDigit = remainder < 2 ? 0 : 11 - remainder
  
  return parseInt(cleanCPF.charAt(10)) === secondDigit
}

export function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, '')
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  } else {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
}

export function formatZipCode(value: string): string {
  const numbers = value.replace(/\D/g, '')
  return numbers.replace(/(\d{5})(\d{3})/, '$1-$2')
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(date)
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Validation error messages
export const validationMessages = {
  required: "Este campo é obrigatório",
  email: "E-mail inválido",
  minLength: (min: number) => `Mínimo de ${min} caracteres`,
  maxLength: (max: number) => `Máximo de ${max} caracteres`,
  min: (min: number) => `Valor mínimo é ${min}`,
  max: (max: number) => `Valor máximo é ${max}`,
  invalidDate: "Data inválida",
  futureDate: "Data deve ser no futuro",
  pastDate: "Data deve ser no passado"
}
