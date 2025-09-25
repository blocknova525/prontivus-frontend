/**
 * Dashboard API Service
 * Provides data for dashboard components
 */

import { apiService } from './api';

export interface DashboardMetrics {
  todayAppointments: number;
  waitingPatients: number;
  todayRevenue: number;
  occupancyRate: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  netProfit: number;
  growthRate: number;
}

export interface Appointment {
  id: number;
  patient_name: string;
  patient_id: number;
  doctor_name: string;
  doctor_id: number;
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'confirmed' | 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  appointment_type: string;
  notes?: string;
}

export interface PendingTask {
  id: number;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  type: 'insurance' | 'exams' | 'consultation' | 'billing' | 'other';
  patient_id?: number;
  patient_name?: string;
  due_date?: string;
  created_at: string;
}

export interface FinancialSummary {
  todayRevenue: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  netProfit: number;
  growthRate: number;
  pendingPayments: number;
  overduePayments: number;
}

class DashboardApiService {
  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      // Get today's date
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch appointments for today
      const appointmentsResponse = await apiService.getAppointments({
        date: today,
        limit: 100
      });
      
      const appointments = appointmentsResponse || [];
      
      // Calculate metrics
      const todayAppointments = appointments.length;
      const waitingPatients = appointments.filter((apt: Appointment) => 
        apt.status === 'waiting' || apt.status === 'scheduled'
      ).length;
      
      // Get financial data
      const financialData = await this.getFinancialSummary();
      
      // Calculate occupancy rate (mock calculation)
      const totalSlots = 20; // Assuming 20 appointment slots per day
      const occupancyRate = Math.round((todayAppointments / totalSlots) * 100);
      
      return {
        todayAppointments,
        waitingPatients,
        todayRevenue: financialData.todayRevenue,
        occupancyRate,
        monthlyRevenue: financialData.monthlyRevenue,
        monthlyExpenses: financialData.monthlyExpenses,
        netProfit: financialData.netProfit,
        growthRate: financialData.growthRate
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      // Return default values if API fails
      return {
        todayAppointments: 0,
        waitingPatients: 0,
        todayRevenue: 0,
        occupancyRate: 0,
        monthlyRevenue: 0,
        monthlyExpenses: 0,
        netProfit: 0,
        growthRate: 0
      };
    }
  }

  /**
   * Get today's appointments
   */
  async getTodayAppointments(): Promise<Appointment[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await apiService.getAppointments({
        date: today,
        limit: 10,
        sort: 'appointment_time'
      });
      
      return response || [];
    } catch (error) {
      console.error('Error fetching today appointments:', error);
      return [];
    }
  }

  /**
   * Get pending tasks
   */
  async getPendingTasks(): Promise<PendingTask[]> {
    try {
      // For now, we'll create mock pending tasks based on appointments
      const appointments = await this.getTodayAppointments();
      
      const tasks: PendingTask[] = [];
      
      // Generate tasks based on appointments
      appointments.forEach((appointment, index) => {
        if (appointment.status === 'scheduled') {
          tasks.push({
            id: index + 1,
            title: `Confirmar consulta - ${appointment.patient_name}`,
            description: `Verificar convênio e confirmar presença`,
            priority: 'high' as const,
            type: 'consultation' as const,
            patient_id: appointment.patient_id,
            patient_name: appointment.patient_name,
            due_date: appointment.appointment_date,
            created_at: new Date().toISOString()
          });
        }
      });
      
      // Add some mock tasks
      tasks.push(
        {
          id: tasks.length + 1,
          title: 'Verificar convênio - Ana Costa',
          description: 'Validar cobertura do convênio Unimed',
          priority: 'high' as const,
          type: 'insurance' as const,
          patient_id: 1,
          patient_name: 'Ana Costa',
          created_at: new Date().toISOString()
        },
        {
          id: tasks.length + 2,
          title: 'Anexar exames - Pedro Oliveira',
          description: 'Exames de sangue e raio-X pendentes',
          priority: 'medium' as const,
          type: 'exams' as const,
          patient_id: 2,
          patient_name: 'Pedro Oliveira',
          created_at: new Date().toISOString()
        }
      );
      
      return tasks.slice(0, 5); // Return max 5 tasks
    } catch (error) {
      console.error('Error fetching pending tasks:', error);
      return [];
    }
  }

  /**
   * Get financial summary
   */
  async getFinancialSummary(): Promise<FinancialSummary> {
    try {
      // Try to get billing data
      const billingResponse = await apiService.getBillings({
        limit: 100,
        date_from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        date_to: new Date().toISOString().split('T')[0]
      });
      
      const billings = billingResponse || [];
      
      // Calculate financial metrics
      const today = new Date().toISOString().split('T')[0];
      const todayRevenue = billings
        .filter((billing: any) => billing.created_at?.startsWith(today))
        .reduce((sum: number, billing: any) => sum + (billing.total_amount || 0), 0);
      
      const monthlyRevenue = billings
        .reduce((sum: number, billing: any) => sum + (billing.total_amount || 0), 0);
      
      // Mock expenses (in real app, this would come from expenses API)
      const monthlyExpenses = monthlyRevenue * 0.3; // Assume 30% expenses
      const netProfit = monthlyRevenue - monthlyExpenses;
      const growthRate = 12.5; // Mock growth rate
      
      const pendingPayments = billings
        .filter((billing: any) => billing.status === 'pending')
        .reduce((sum: number, billing: any) => sum + (billing.total_amount || 0), 0);
      
      const overduePayments = billings
        .filter((billing: any) => billing.status === 'overdue')
        .reduce((sum: number, billing: any) => sum + (billing.total_amount || 0), 0);
      
      return {
        todayRevenue,
        monthlyRevenue,
        monthlyExpenses,
        netProfit,
        growthRate,
        pendingPayments,
        overduePayments
      };
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      // Return mock data if API fails
      return {
        todayRevenue: 2450.00,
        monthlyRevenue: 45680.00,
        monthlyExpenses: 13704.00,
        netProfit: 31976.00,
        growthRate: 12.5,
        pendingPayments: 3500.00,
        overduePayments: 1200.00
      };
    }
  }

  /**
   * Get recent notifications
   */
  async getRecentNotifications(limit: number = 5) {
    try {
      const response = await apiService.getNotifications({ limit });
      return response || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Get patient statistics
   */
  async getPatientStats() {
    try {
      const response = await apiService.getPatients({ limit: 1000 });
      const patients = response || [];
      
      return {
        totalPatients: patients.length,
        newThisMonth: patients.filter((patient: any) => {
          const createdDate = new Date(patient.created_at);
          const thisMonth = new Date();
          return createdDate.getMonth() === thisMonth.getMonth() && 
                 createdDate.getFullYear() === thisMonth.getFullYear();
        }).length,
        activePatients: patients.filter((patient: any) => 
          patient.status === 'active'
        ).length
      };
    } catch (error) {
      console.error('Error fetching patient stats:', error);
      return {
        totalPatients: 0,
        newThisMonth: 0,
        activePatients: 0
      };
    }
  }

  /**
   * Get appointment statistics
   */
  async getAppointmentStats() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await apiService.getAppointments({ 
        date: today,
        limit: 1000 
      });
      
      const appointments = response || [];
      
      return {
        totalToday: appointments.length,
        completed: appointments.filter((apt: Appointment) => apt.status === 'completed').length,
        cancelled: appointments.filter((apt: Appointment) => apt.status === 'cancelled').length,
        noShow: appointments.filter((apt: Appointment) => apt.status === 'no_show').length
      };
    } catch (error) {
      console.error('Error fetching appointment stats:', error);
      return {
        totalToday: 0,
        completed: 0,
        cancelled: 0,
        noShow: 0
      };
    }
  }
}

export const dashboardApi = new DashboardApiService();
