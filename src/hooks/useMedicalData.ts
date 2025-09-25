import { useState, useEffect, useCallback } from 'react'

// Types
export interface Patient {
  id: string
  name: string
  cpf: string
  rg?: string
  birthDate?: Date
  phone: string
  email?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  emergencyContact?: string
  emergencyPhone?: string
  insurance?: string
  insuranceNumber?: string
  allergies?: string
  medications?: string
  medicalHistory?: string
  notes?: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  appointmentType: string
  date: Date
  time: string
  duration: number
  notes?: string
  priority: 'normal' | 'urgente' | 'emergencia'
  insurance: string
  status: 'agendado' | 'confirmado' | 'cancelado' | 'concluido'
  createdAt: Date
  updatedAt: Date
}

export interface Doctor {
  id: string
  name: string
  specialty: string
  crm: string
  phone?: string
  email?: string
  avatar?: string
  isActive: boolean
}

export interface InventoryItem {
  id: string
  name: string
  category: 'Medicamentos' | 'Materiais' | 'Equipamentos'
  quantity: number
  minQuantity: number
  maxQuantity: number
  unit: string
  price: number
  supplier: string
  expiryDate?: Date
  status: 'ok' | 'low' | 'out'
  lastUpdated: Date
}

export interface FinancialTransaction {
  id: string
  type: 'receita' | 'despesa'
  patientId?: string
  patientName?: string
  doctorId?: string
  doctorName?: string
  service?: string
  description?: string
  value: number
  status: 'pago' | 'pendente' | 'cancelado'
  method: string
  insurance?: string
  invoice: string
  date: Date
}

// Mock data
const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Maria Santos Silva',
    cpf: '123.456.789-00',
    birthDate: new Date('1979-05-15'),
    phone: '(11) 99999-9999',
    email: 'maria.santos@email.com',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    emergencyContact: 'João Silva',
    emergencyPhone: '(11) 88888-8888',
    insurance: 'unimed',
    insuranceNumber: '12345678901234',
    allergies: 'Dipirona, Penicilina',
    medications: 'Losartana 50mg, Metformina 850mg',
    medicalHistory: 'Hipertensão, Diabetes Tipo 2',
    notes: 'Paciente colaborativa',
    avatar: '/api/placeholder/80/80',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '2',
    name: 'Carlos Eduardo Pereira',
    cpf: '987.654.321-00',
    birthDate: new Date('1985-08-22'),
    phone: '(11) 88888-8888',
    email: 'carlos.eduardo@email.com',
    address: 'Av. Paulista, 456',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310-100',
    insurance: 'particular',
    allergies: 'Nenhuma conhecida',
    medicalHistory: 'Dor no peito',
    avatar: '/api/placeholder/80/80',
    createdAt: new Date('2023-03-20'),
    updatedAt: new Date('2024-01-12')
  }
]

const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'Maria Santos Silva',
    doctorId: '1',
    doctorName: 'Dr. João Santos',
    appointmentType: 'Consulta de Rotina',
    date: new Date('2024-01-15'),
    time: '09:00',
    duration: 30,
    notes: 'Retorno para controle de pressão',
    priority: 'normal',
    insurance: 'Unimed',
    status: 'confirmado',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Carlos Eduardo Pereira',
    doctorId: '2',
    doctorName: 'Dra. Maria Costa',
    appointmentType: 'Primeira Consulta',
    date: new Date('2024-01-15'),
    time: '10:30',
    duration: 45,
    notes: 'Dor no peito',
    priority: 'urgente',
    insurance: 'Particular',
    status: 'aguardando',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  }
]

const mockDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. João Santos',
    specialty: 'Clínica Geral',
    crm: '123456-SP',
    phone: '(11) 99999-1111',
    email: 'joao.santos@clinica.com',
    avatar: '/api/placeholder/80/80',
    isActive: true
  },
  {
    id: '2',
    name: 'Dra. Maria Costa',
    specialty: 'Cardiologia',
    crm: '789012-SP',
    phone: '(11) 99999-2222',
    email: 'maria.costa@clinica.com',
    avatar: '/api/placeholder/80/80',
    isActive: true
  },
  {
    id: '3',
    name: 'Dr. Pedro Lima',
    specialty: 'Neurologia',
    crm: '345678-SP',
    phone: '(11) 99999-3333',
    email: 'pedro.lima@clinica.com',
    avatar: '/api/placeholder/80/80',
    isActive: true
  },
  {
    id: '4',
    name: 'Dra. Ana Oliveira',
    specialty: 'Endocrinologia',
    crm: '901234-SP',
    phone: '(11) 99999-4444',
    email: 'ana.oliveira@clinica.com',
    avatar: '/api/placeholder/80/80',
    isActive: true
  }
]

const mockInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'Dipirona 500mg',
    category: 'Medicamentos',
    quantity: 45,
    minQuantity: 20,
    maxQuantity: 100,
    unit: 'comprimidos',
    price: 12.50,
    supplier: 'Farmácia Central',
    expiryDate: new Date('2025-06-15'),
    status: 'ok',
    lastUpdated: new Date('2024-01-10')
  },
  {
    id: '2',
    name: 'Seringa 10ml',
    category: 'Materiais',
    quantity: 8,
    minQuantity: 15,
    maxQuantity: 50,
    unit: 'unidades',
    price: 2.30,
    supplier: 'MedSupply',
    expiryDate: new Date('2026-03-20'),
    status: 'low',
    lastUpdated: new Date('2024-01-12')
  }
]

const mockTransactions: FinancialTransaction[] = [
  {
    id: '1',
    type: 'receita',
    patientId: '1',
    patientName: 'Maria Santos Silva',
    doctorId: '1',
    doctorName: 'Dr. João Santos',
    service: 'Consulta de Rotina',
    value: 150.00,
    status: 'pago',
    method: 'Cartão',
    insurance: 'Unimed',
    invoice: 'FAT-2024-001',
    date: new Date('2024-01-15')
  },
  {
    id: '2',
    type: 'receita',
    patientId: '2',
    patientName: 'Carlos Eduardo Pereira',
    doctorId: '2',
    doctorName: 'Dra. Maria Costa',
    service: 'Exame Cardiológico',
    value: 320.00,
    status: 'pendente',
    method: 'PIX',
    insurance: 'Particular',
    invoice: 'FAT-2024-002',
    date: new Date('2024-01-15')
  }
]

// Custom hook for medical data management
export function useMedicalData() {
  const [patients, setPatients] = useState<Patient[]>(mockPatients)
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors)
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory)
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(mockTransactions)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Patient operations
  const addPatient = useCallback((patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true)
    try {
      const newPatient: Patient = {
        ...patient,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setPatients(prev => [...prev, newPatient])
      setError(null)
    } catch (err) {
      setError('Erro ao adicionar paciente')
    } finally {
      setLoading(false)
    }
  }, [])

  const updatePatient = useCallback((id: string, updates: Partial<Patient>) => {
    setLoading(true)
    try {
      setPatients(prev => prev.map(patient => 
        patient.id === id 
          ? { ...patient, ...updates, updatedAt: new Date() }
          : patient
      ))
      setError(null)
    } catch (err) {
      setError('Erro ao atualizar paciente')
    } finally {
      setLoading(false)
    }
  }, [])

  const deletePatient = useCallback((id: string) => {
    setLoading(true)
    try {
      setPatients(prev => prev.filter(patient => patient.id !== id))
      setError(null)
    } catch (err) {
      setError('Erro ao deletar paciente')
    } finally {
      setLoading(false)
    }
  }, [])

  const getPatientById = useCallback((id: string) => {
    return patients.find(patient => patient.id === id)
  }, [patients])

  // Appointment operations
  const addAppointment = useCallback((appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true)
    try {
      const newAppointment: Appointment = {
        ...appointment,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setAppointments(prev => [...prev, newAppointment])
      setError(null)
    } catch (err) {
      setError('Erro ao adicionar agendamento')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateAppointment = useCallback((id: string, updates: Partial<Appointment>) => {
    setLoading(true)
    try {
      setAppointments(prev => prev.map(appointment => 
        appointment.id === id 
          ? { ...appointment, ...updates, updatedAt: new Date() }
          : appointment
      ))
      setError(null)
    } catch (err) {
      setError('Erro ao atualizar agendamento')
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteAppointment = useCallback((id: string) => {
    setLoading(true)
    try {
      setAppointments(prev => prev.filter(appointment => appointment.id !== id))
      setError(null)
    } catch (err) {
      setError('Erro ao deletar agendamento')
    } finally {
      setLoading(false)
    }
  }, [])

  const getAppointmentsByDate = useCallback((date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return appointments.filter(appointment => 
      appointment.date.toISOString().split('T')[0] === dateString
    )
  }, [appointments])

  const getAppointmentsByDoctor = useCallback((doctorId: string) => {
    return appointments.filter(appointment => appointment.doctorId === doctorId)
  }, [appointments])

  // Inventory operations
  const addInventoryItem = useCallback((item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    setLoading(true)
    try {
      const newItem: InventoryItem = {
        ...item,
        id: Date.now().toString(),
        lastUpdated: new Date()
      }
      setInventory(prev => [...prev, newItem])
      setError(null)
    } catch (err) {
      setError('Erro ao adicionar item ao estoque')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateInventoryItem = useCallback((id: string, updates: Partial<InventoryItem>) => {
    setLoading(true)
    try {
      setInventory(prev => prev.map(item => 
        item.id === id 
          ? { ...item, ...updates, lastUpdated: new Date() }
          : item
      ))
      setError(null)
    } catch (err) {
      setError('Erro ao atualizar item do estoque')
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteInventoryItem = useCallback((id: string) => {
    setLoading(true)
    try {
      setInventory(prev => prev.filter(item => item.id !== id))
      setError(null)
    } catch (err) {
      setError('Erro ao deletar item do estoque')
    } finally {
      setLoading(false)
    }
  }, [])

  const getLowStockItems = useCallback(() => {
    return inventory.filter(item => item.status === 'low' || item.status === 'out')
  }, [inventory])

  // Financial operations
  const addTransaction = useCallback((transaction: Omit<FinancialTransaction, 'id'>) => {
    setLoading(true)
    try {
      const newTransaction: FinancialTransaction = {
        ...transaction,
        id: Date.now().toString()
      }
      setTransactions(prev => [...prev, newTransaction])
      setError(null)
    } catch (err) {
      setError('Erro ao adicionar transação')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateTransaction = useCallback((id: string, updates: Partial<FinancialTransaction>) => {
    setLoading(true)
    try {
      setTransactions(prev => prev.map(transaction => 
        transaction.id === id 
          ? { ...transaction, ...updates }
          : transaction
      ))
      setError(null)
    } catch (err) {
      setError('Erro ao atualizar transação')
    } finally {
      setLoading(false)
    }
  }, [])

  // Statistics
  const getStatistics = useCallback(() => {
    const totalPatients = patients.length
    const totalAppointments = appointments.length
    const todayAppointments = appointments.filter(appointment => {
      const today = new Date()
      const appointmentDate = new Date(appointment.date)
      return appointmentDate.toDateString() === today.toDateString()
    }).length
    
    const totalRevenue = transactions
      .filter(t => t.type === 'receita' && t.status === 'pago')
      .reduce((sum, t) => sum + t.value, 0)
    
    const pendingPayments = transactions
      .filter(t => t.type === 'receita' && t.status === 'pendente')
      .reduce((sum, t) => sum + t.value, 0)

    const lowStockCount = inventory.filter(item => item.status === 'low' || item.status === 'out').length

    return {
      totalPatients,
      totalAppointments,
      todayAppointments,
      totalRevenue,
      pendingPayments,
      lowStockCount
    }
  }, [patients, appointments, transactions, inventory])

  return {
    // Data
    patients,
    appointments,
    doctors,
    inventory,
    transactions,
    loading,
    error,
    
    // Patient operations
    addPatient,
    updatePatient,
    deletePatient,
    getPatientById,
    
    // Appointment operations
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByDate,
    getAppointmentsByDoctor,
    
    // Inventory operations
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    getLowStockItems,
    
    // Financial operations
    addTransaction,
    updateTransaction,
    
    // Statistics
    getStatistics
  }
}
