import { AppLayout } from "@/components/layout/AppLayout"
import { PatientForm } from "@/components/forms/PatientForm"
import { useState } from "react"

const NovoPaciente = () => {
  const [showForm, setShowForm] = useState(true)

  const handlePatientSave = (patient: any) => {
    console.log("Paciente salvo:", patient)
    // Redirect to secretaria page or show success message
    window.location.href = "/secretaria"
  }

  const handlePatientCancel = () => {
    // Redirect back to secretaria
    window.location.href = "/secretaria"
  }

  return (
    <AppLayout 
      title="Novo Paciente" 
      subtitle="Cadastrar um novo paciente"
    >
      <div className="max-w-4xl mx-auto">
        <PatientForm 
          onSave={handlePatientSave}
          onCancel={handlePatientCancel}
        />
      </div>
    </AppLayout>
  )
}

export default NovoPaciente
