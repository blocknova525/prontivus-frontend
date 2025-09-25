import { AppLayout } from "@/components/layout/AppLayout"
import { AppointmentForm } from "@/components/forms/AppointmentForm"
import { useState } from "react"

const NovoAgendamento = () => {
  const [showForm, setShowForm] = useState(true)

  const handleAppointmentSave = (appointment: any) => {
    console.log("Agendamento salvo:", appointment)
    // Redirect to agenda page or show success message
    window.location.href = "/agenda"
  }

  const handleAppointmentCancel = () => {
    // Redirect back to agenda
    window.location.href = "/agenda"
  }

  return (
    <AppLayout 
      title="Novo Agendamento" 
      subtitle="Criar um novo agendamento médico"
    >
      <div className="max-w-4xl mx-auto">
        <AppointmentForm 
          onSave={handleAppointmentSave}
          onCancel={handleAppointmentCancel}
        />
      </div>
    </AppLayout>
  )
}

export default NovoAgendamento
