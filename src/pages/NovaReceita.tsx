import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  FileText, 
  CalendarIcon, 
  User, 
  Pill, 
  Save, 
  X, 
  Plus,
  Trash2
} from "lucide-react"
import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const NovaReceita = () => {
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    doctorId: "",
    doctorName: "",
    date: new Date(),
    medications: [
      {
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: ""
      }
    ],
    notes: "",
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  })

  const [showPatientSearch, setShowPatientSearch] = useState(false)

  const doctors = [
    { id: 1, name: "Dr. João Santos", specialty: "Clínica Geral", crm: "12345-SP" },
    { id: 2, name: "Dra. Maria Costa", specialty: "Cardiologia", crm: "67890-SP" },
    { id: 3, name: "Dr. Pedro Lima", specialty: "Neurologia", crm: "11111-SP" },
    { id: 4, name: "Dra. Ana Oliveira", specialty: "Endocrinologia", crm: "22222-SP" }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Receita criada:", formData)
    // Implement prescription creation logic
    alert("Receita criada com sucesso!")
    window.location.href = "/atendimento"
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleMedicationChange = (index: number, field: string, value: string) => {
    const updatedMedications = [...formData.medications]
    updatedMedications[index] = { ...updatedMedications[index], [field]: value }
    setFormData(prev => ({ ...prev, medications: updatedMedications }))
  }

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          name: "",
          dosage: "",
          frequency: "",
          duration: "",
          instructions: ""
        }
      ]
    }))
  }

  const removeMedication = (index: number) => {
    if (formData.medications.length > 1) {
      const updatedMedications = formData.medications.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, medications: updatedMedications }))
    }
  }

  const handlePatientSelect = (patient: any) => {
    setFormData(prev => ({ 
      ...prev, 
      patientId: patient.id,
      patientName: patient.name
    }))
    setShowPatientSearch(false)
  }

  return (
    <AppLayout 
      title="Nova Receita" 
      subtitle="Criar uma nova prescrição médica"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Prescrição Médica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Patient and Doctor Information */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Informações do Paciente</h3>
                  <div>
                    <Label htmlFor="patientSearch">Paciente *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="patientSearch"
                        value={formData.patientName}
                        onChange={(e) => handleInputChange("patientName", e.target.value)}
                        placeholder="Digite o nome ou CPF do paciente"
                        required
                      />
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setShowPatientSearch(true)}
                      >
                        <User className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Informações do Médico</h3>
                  <div>
                    <Label htmlFor="doctor">Médico Responsável *</Label>
                    <Select value={formData.doctorId} onValueChange={(value) => {
                      const doctor = doctors.find(d => d.id.toString() === value)
                      handleInputChange("doctorId", value)
                      handleInputChange("doctorName", doctor?.name || "")
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar médico" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">{doctor.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {doctor.specialty} - CRM: {doctor.crm}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Date Information */}
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="date">Data da Prescrição *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.date, "dd/MM/yyyy", { locale: ptBR })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => date && handleInputChange("date", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="validUntil">Válida até *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.validUntil, "dd/MM/yyyy", { locale: ptBR })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.validUntil}
                        onSelect={(date) => date && handleInputChange("validUntil", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Medications */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Medicamentos</h3>
                  <Button type="button" onClick={addMedication} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Medicamento
                  </Button>
                </div>

                {formData.medications.map((medication, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Medicamento {index + 1}</h4>
                      {formData.medications.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMedication(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor={`medication-${index}-name`}>Nome do Medicamento *</Label>
                        <Input
                          id={`medication-${index}-name`}
                          value={medication.name}
                          onChange={(e) => handleMedicationChange(index, "name", e.target.value)}
                          placeholder="Ex: Dipirona"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`medication-${index}-dosage`}>Dosagem *</Label>
                        <Input
                          id={`medication-${index}-dosage`}
                          value={medication.dosage}
                          onChange={(e) => handleMedicationChange(index, "dosage", e.target.value)}
                          placeholder="Ex: 500mg"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`medication-${index}-frequency`}>Frequência *</Label>
                        <Select value={medication.frequency} onValueChange={(value) => handleMedicationChange(index, "frequency", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar frequência" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1x/dia">1x ao dia</SelectItem>
                            <SelectItem value="2x/dia">2x ao dia</SelectItem>
                            <SelectItem value="3x/dia">3x ao dia</SelectItem>
                            <SelectItem value="4x/dia">4x ao dia</SelectItem>
                            <SelectItem value="6x/dia">6x ao dia</SelectItem>
                            <SelectItem value="8x/dia">8x ao dia</SelectItem>
                            <SelectItem value="12x/dia">12x ao dia</SelectItem>
                            <SelectItem value="conforme-necessario">Conforme necessário</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`medication-${index}-duration`}>Duração *</Label>
                        <Input
                          id={`medication-${index}-duration`}
                          value={medication.duration}
                          onChange={(e) => handleMedicationChange(index, "duration", e.target.value)}
                          placeholder="Ex: 7 dias"
                          required
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label htmlFor={`medication-${index}-instructions`}>Instruções Especiais</Label>
                      <Textarea
                        id={`medication-${index}-instructions`}
                        value={medication.instructions}
                        onChange={(e) => handleMedicationChange(index, "instructions", e.target.value)}
                        placeholder="Ex: Tomar após as refeições, evitar dirigir..."
                        rows={2}
                      />
                    </div>
                  </Card>
                ))}
              </div>

              {/* Additional Notes */}
              <div>
                <Label htmlFor="notes">Observações Adicionais</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Instruções gerais, contraindicações, etc."
                  rows={3}
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 pt-6 border-t border-border">
                <Button type="button" variant="outline" onClick={() => window.location.href = "/atendimento"}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button type="submit" className="medical-button-primary">
                  <Save className="w-4 h-4 mr-2" />
                  Criar Receita
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

export default NovaReceita
