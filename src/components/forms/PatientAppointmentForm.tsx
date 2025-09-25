import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Stethoscope,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { apiService } from '@/lib/api';
import { extractErrorMessage } from '@/lib/utils';

interface Doctor {
  id: number;
  full_name: string;
  specialty: string;
  is_active: boolean;
}

interface AppointmentFormData {
  doctor_id: number;
  appointment_date: string;
  appointment_time: string;
  type: string;
  notes: string;
}

interface PatientAppointmentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  patientId: number;
}

const PatientAppointmentForm: React.FC<PatientAppointmentFormProps> = ({
  onSuccess,
  onCancel,
  patientId
}) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const [formData, setFormData] = useState<AppointmentFormData>({
    doctor_id: 0,
    appointment_date: '',
    appointment_time: '',
    type: 'consultation',
    notes: ''
  });

  const appointmentTypes = [
    { value: 'consultation', label: 'Consulta' },
    { value: 'follow_up', label: 'Retorno' },
    { value: 'examination', label: 'Exame' },
    { value: 'emergency', label: 'Emergência' },
    { value: 'telemedicine', label: 'Telemedicina' }
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
  ];

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        appointment_date: format(selectedDate, 'yyyy-MM-dd')
      }));
    }
  }, [selectedDate]);

  const loadDoctors = async () => {
    try {
      // Use mock doctor data for now
      const mockDoctors = [
        { id: 1, full_name: "Dr. Carlos Mendes", specialty: "Cardiologia", crm: "12345", is_active: true },
        { id: 2, full_name: "Dr. João Silva", specialty: "Clínica Geral", crm: "23456", is_active: true },
        { id: 3, full_name: "Dra. Maria Santos", specialty: "Pediatria", crm: "34567", is_active: true },
        { id: 4, full_name: "Dr. Pedro Costa", specialty: "Ortopedia", crm: "45678", is_active: true },
        { id: 5, full_name: "Dra. Ana Lima", specialty: "Dermatologia", crm: "56789", is_active: true }
      ];
      setDoctors(mockDoctors);
    } catch (err: any) {
      console.error('Error loading doctors:', err);
      setError('Erro ao carregar lista de médicos');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.doctor_id || !formData.appointment_date || !formData.appointment_time) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const appointmentData = {
        patient_id: patientId,
        doctor_id: formData.doctor_id,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        type: formData.type,
        notes: formData.notes,
        status: 'scheduled'
      };

      await apiService.createAppointment(appointmentData);
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (err: any) {
      console.error('Error creating appointment:', err);
      setError(extractErrorMessage(err, 'Erro ao agendar consulta. Tente novamente.'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Consulta Agendada!</h3>
          <p className="text-gray-600 mb-4">Sua consulta foi agendada com sucesso.</p>
          <div className="text-sm text-gray-500">
            <p>Data: {format(selectedDate!, 'dd/MM/yyyy', { locale: ptBR })}</p>
            <p>Horário: {formData.appointment_time}</p>
            <p>Médico: {doctors.find(d => d.id === formData.doctor_id)?.full_name}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Agendar Consulta
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Doctor Selection */}
          <div className="space-y-2">
            <Label htmlFor="doctor">Médico *</Label>
            <Select 
              value={formData.doctor_id.toString()} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, doctor_id: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um médico" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id.toString()}>
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" />
                      <div>
                        <p className="font-medium">{doctor.full_name}</p>
                        <p className="text-sm text-gray-500">{doctor.specialty}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Data da Consulta *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione uma data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label htmlFor="time">Horário *</Label>
            <Select 
              value={formData.appointment_time} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, appointment_time: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um horário" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {time}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Appointment Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Consulta</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {appointmentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Descreva o motivo da consulta ou outras informações relevantes..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Agendando...
                </>
              ) : (
                'Agendar Consulta'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PatientAppointmentForm;
