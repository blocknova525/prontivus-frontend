import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, User, Phone, Mail, MapPin, CreditCard, Save, X, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { patientSchema, formatCPF, formatPhone, formatZipCode } from "@/lib/validations"
import { apiService } from "@/lib/api"
import { toast } from "sonner"

interface PatientFormProps {
  onSave: (patient: any) => void
  onCancel: () => void
  initialData?: any
}

export function PatientForm({ onSave, onCancel, initialData }: PatientFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    cpf: initialData?.cpf || "",
    rg: initialData?.rg || "",
    birthDate: initialData?.birthDate || undefined,
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    zipCode: initialData?.zipCode || "",
    emergencyContact: initialData?.emergencyContact || "",
    emergencyPhone: initialData?.emergencyPhone || "",
    insurance: initialData?.insurance || "",
    insuranceNumber: initialData?.insuranceNumber || "",
    allergies: initialData?.allergies || "",
    medications: initialData?.medications || "",
    medicalHistory: initialData?.medicalHistory || "",
    notes: initialData?.notes || ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      // Transform form data to API format
      const patientData = {
        full_name: formData.name,
        cpf: formData.cpf.replace(/\D/g, ''), // Remove formatting
        email: formData.email,
        phone: formData.phone.replace(/\D/g, ''), // Remove formatting
        birth_date: formData.birthDate instanceof Date ? formData.birthDate.toISOString().split('T')[0] : formData.birthDate,
        gender: "other", // Default value, could be added to form
        marital_status: "single", // Default value
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode.replace(/\D/g, ''), // Remove formatting
        emergency_contact_name: formData.emergencyContact,
        emergency_contact_phone: formData.emergencyPhone.replace(/\D/g, ''), // Remove formatting
        emergency_contact_relationship: "parent", // Default value
        blood_type: "unknown", // Default value
        allergies: formData.allergies,
        chronic_conditions: formData.medicalHistory,
        medications: formData.medications,
        insurance_company: formData.insurance,
        insurance_number: formData.insuranceNumber,
        insurance_plan: "standard" // Default value
      }
      
      console.log('DEBUG: Sending patient data:', patientData)
      
      // Validate required fields
      if (!patientData.full_name || !patientData.cpf || !patientData.birth_date) {
        toast.error('Por favor, preencha todos os campos obrigatórios')
        return
      }
      
      if (initialData) {
        // Update existing patient
        const updatedPatient = await apiService.updatePatient(initialData.id.toString(), patientData)
        toast.success('Paciente atualizado com sucesso!')
        onSave(updatedPatient)
      } else {
        // Create new patient
        const createdPatient = await apiService.createPatient(patientData)
        toast.success('Paciente cadastrado com sucesso!')
        onSave(createdPatient)
      }
      
    } catch (error: any) {
      console.error('Error saving patient:', error)
      
      let errorMessage = 'Erro ao salvar paciente'
      
      if (error.response?.data?.detail) {
        errorMessage += ': ' + error.response.data.detail
      } else if (error.message) {
        errorMessage += ': ' + error.message
      } else if (error.response?.data) {
        errorMessage += ': ' + JSON.stringify(error.response.data)
      }
      
      toast.error(errorMessage)
      setErrors({ general: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleCPFChange = (value: string) => {
    const formatted = formatCPF(value)
    handleInputChange('cpf', formatted)
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value)
    handleInputChange('phone', formatted)
  }

  const handleEmergencyPhoneChange = (value: string) => {
    const formatted = formatPhone(value)
    handleInputChange('emergencyPhone', formatted)
  }

  const handleZipCodeChange = (value: string) => {
    const formatted = formatZipCode(value)
    handleInputChange('zipCode', formatted)
  }

  return (
    <Card className="medical-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          {initialData ? "Editar Paciente" : "Novo Paciente"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Informações Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Digite o nome completo"
                  required
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => handleCPFChange(e.target.value)}
                  placeholder="000.000.000-00"
                  required
                  className={errors.cpf ? "border-red-500" : ""}
                />
                {errors.cpf && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.cpf}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="rg">RG</Label>
                <Input
                  id="rg"
                  value={formData.rg}
                  onChange={(e) => handleInputChange("rg", e.target.value)}
                  placeholder="00.000.000-0"
                />
              </div>
              <div>
                <Label htmlFor="birthDate">Data de Nascimento *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.birthDate ? format(formData.birthDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.birthDate}
                      onSelect={(date) => handleInputChange("birthDate", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Informações de Contato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Rua, número, bairro"
                />
              </div>
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Cidade"
                />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SP">São Paulo</SelectItem>
                    <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                    <SelectItem value="MG">Minas Gerais</SelectItem>
                    <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                    <SelectItem value="PR">Paraná</SelectItem>
                    <SelectItem value="SC">Santa Catarina</SelectItem>
                    <SelectItem value="BA">Bahia</SelectItem>
                    <SelectItem value="GO">Goiás</SelectItem>
                    <SelectItem value="PE">Pernambuco</SelectItem>
                    <SelectItem value="CE">Ceará</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="zipCode">CEP</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                  placeholder="00000-000"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Contato de Emergência</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContact">Nome do Contato</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                  placeholder="Nome do contato de emergência"
                />
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Telefone do Contato</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>

          {/* Insurance Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Informações do Convênio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="insurance">Convênio</Label>
                <Select value={formData.insurance} onValueChange={(value) => handleInputChange("insurance", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o convênio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unimed">Unimed</SelectItem>
                    <SelectItem value="bradesco">Bradesco Saúde</SelectItem>
                    <SelectItem value="amil">Amil</SelectItem>
                    <SelectItem value="sulamerica">SulAmérica</SelectItem>
                    <SelectItem value="particular">Particular</SelectItem>
                    <SelectItem value="sus">SUS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="insuranceNumber">Número da Carteirinha</Label>
                <Input
                  id="insuranceNumber"
                  value={formData.insuranceNumber}
                  onChange={(e) => handleInputChange("insuranceNumber", e.target.value)}
                  placeholder="Número da carteirinha"
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Informações Médicas</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="allergies">Alergias</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => handleInputChange("allergies", e.target.value)}
                  placeholder="Liste as alergias conhecidas"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="medications">Medicações Atuais</Label>
                <Textarea
                  id="medications"
                  value={formData.medications}
                  onChange={(e) => handleInputChange("medications", e.target.value)}
                  placeholder="Medicações em uso"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="medicalHistory">Histórico Médico</Label>
                <Textarea
                  id="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={(e) => handleInputChange("medicalHistory", e.target.value)}
                  placeholder="Doenças prévias, cirurgias, etc."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Observações adicionais"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.general}
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-border">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" className="medical-button-primary" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Salvando..." : (initialData ? "Atualizar Paciente" : "Cadastrar Paciente")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
