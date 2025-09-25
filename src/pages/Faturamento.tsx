import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign, 
  CalendarIcon, 
  User, 
  FileText, 
  Download,
  Upload,
  Plus,
  Trash2,
  Receipt,
  CreditCard,
  Building2
} from "lucide-react"
import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const Faturamento = () => {
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    billingType: "particular", // particular, convenio, tiss
    insurance: "",
    services: [
      {
        code: "",
        description: "",
        quantity: 1,
        unitValue: 0,
        totalValue: 0
      }
    ],
    totalValue: 0,
    paymentMethod: "dinheiro",
    notes: "",
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  })

  const [showPatientSearch, setShowPatientSearch] = useState(false)

  const billingTypes = [
    { value: "particular", label: "Particular", icon: CreditCard },
    { value: "convenio", label: "Convênio", icon: Building2 },
    { value: "tiss", label: "TISS", icon: FileText }
  ]

  const paymentMethods = [
    { value: "dinheiro", label: "Dinheiro" },
    { value: "cartao_debito", label: "Cartão de Débito" },
    { value: "cartao_credito", label: "Cartão de Crédito" },
    { value: "pix", label: "PIX" },
    { value: "transferencia", label: "Transferência" },
    { value: "cheque", label: "Cheque" }
  ]

  const commonServices = [
    { code: "31001001", description: "Consulta médica - Clínica Geral", value: 150.00 },
    { code: "31001002", description: "Consulta médica - Especialista", value: 200.00 },
    { code: "31001003", description: "Retorno médico", value: 100.00 },
    { code: "31001004", description: "Telemedicina", value: 120.00 },
    { code: "31001005", description: "Exame físico completo", value: 80.00 },
    { code: "31001006", description: "Avaliação cardiológica", value: 250.00 }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Faturamento criado:", formData)
    alert("Faturamento criado com sucesso!")
    window.location.href = "/financeiro"
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleServiceChange = (index: number, field: string, value: any) => {
    const updatedServices = [...formData.services]
    updatedServices[index] = { ...updatedServices[index], [field]: value }
    
    // Calculate total value for this service
    if (field === "quantity" || field === "unitValue") {
      const quantity = field === "quantity" ? value : updatedServices[index].quantity
      const unitValue = field === "unitValue" ? value : updatedServices[index].unitValue
      updatedServices[index].totalValue = quantity * unitValue
    }
    
    setFormData(prev => ({ 
      ...prev, 
      services: updatedServices,
      totalValue: updatedServices.reduce((sum, service) => sum + service.totalValue, 0)
    }))
  }

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [
        ...prev.services,
        {
          code: "",
          description: "",
          quantity: 1,
          unitValue: 0,
          totalValue: 0
        }
      ]
    }))
  }

  const removeService = (index: number) => {
    if (formData.services.length > 1) {
      const updatedServices = formData.services.filter((_, i) => i !== index)
      setFormData(prev => ({ 
        ...prev, 
        services: updatedServices,
        totalValue: updatedServices.reduce((sum, service) => sum + service.totalValue, 0)
      }))
    }
  }

  const handleServiceSelect = (service: any) => {
    const lastIndex = formData.services.length - 1
    handleServiceChange(lastIndex, "code", service.code)
    handleServiceChange(lastIndex, "description", service.description)
    handleServiceChange(lastIndex, "unitValue", service.value)
  }

  const handlePatientSelect = (patient: any) => {
    setFormData(prev => ({ 
      ...prev, 
      patientId: patient.id,
      patientName: patient.name,
      insurance: patient.insurance || ""
    }))
    setShowPatientSearch(false)
  }

  const getBillingTypeIcon = (type: string) => {
    const billingType = billingTypes.find(bt => bt.value === type)
    return billingType?.icon || DollarSign
  }

  const getBillingTypeLabel = (type: string) => {
    const billingType = billingTypes.find(bt => bt.value === type)
    return billingType?.label || type
  }

  return (
    <AppLayout 
      title="Faturamento" 
      subtitle="Emitir fatura para consultas e procedimentos"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Billing Type Selection */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              Tipo de Faturamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {billingTypes.map((type) => {
                const Icon = type.icon
                return (
                  <Button
                    key={type.value}
                    variant={formData.billingType === type.value ? "default" : "outline"}
                    className={`h-20 flex flex-col gap-2 ${
                      formData.billingType === type.value ? "medical-button-primary" : ""
                    }`}
                    onClick={() => handleInputChange("billingType", type.value)}
                  >
                    <Icon className="w-6 h-6" />
                    <span>{type.label}</span>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Dados da Fatura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Patient Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Informações do Paciente</h3>
                <div className="grid gap-4 md:grid-cols-2">
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
                  
                  {formData.billingType === "convenio" && (
                    <div>
                      <Label htmlFor="insurance">Convênio *</Label>
                      <Select value={formData.insurance} onValueChange={(value) => handleInputChange("insurance", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar convênio" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unimed">Unimed</SelectItem>
                          <SelectItem value="amil">Amil</SelectItem>
                          <SelectItem value="bradesco">Bradesco Saúde</SelectItem>
                          <SelectItem value="sulamerica">SulAmérica</SelectItem>
                          <SelectItem value="hapvida">Hapvida</SelectItem>
                          <SelectItem value="notredame">NotreDame Intermédica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              {/* Date Information */}
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="issueDate">Data de Emissão *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.issueDate, "dd/MM/yyyy", { locale: ptBR })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.issueDate}
                        onSelect={(date) => date && handleInputChange("issueDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="dueDate">Data de Vencimento *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.dueDate, "dd/MM/yyyy", { locale: ptBR })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.dueDate}
                        onSelect={(date) => date && handleInputChange("dueDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Services */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Serviços/Procedimentos</h3>
                  <div className="flex gap-2">
                    <Button type="button" onClick={addService} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Serviço
                    </Button>
                  </div>
                </div>

                {/* Quick Service Selection */}
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {commonServices.map((service) => (
                    <Button
                      key={service.code}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-auto p-3 flex flex-col items-start"
                      onClick={() => handleServiceSelect(service)}
                    >
                      <span className="font-medium text-sm">{service.description}</span>
                      <span className="text-xs text-muted-foreground">
                        {service.code} - R$ {service.value.toFixed(2)}
                      </span>
                    </Button>
                  ))}
                </div>

                {formData.services.map((service, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Serviço {index + 1}</h4>
                      {formData.services.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeService(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                      <div>
                        <Label htmlFor={`service-${index}-code`}>Código</Label>
                        <Input
                          id={`service-${index}-code`}
                          value={service.code}
                          onChange={(e) => handleServiceChange(index, "code", e.target.value)}
                          placeholder="Ex: 31001001"
                        />
                      </div>
                      <div className="lg:col-span-2">
                        <Label htmlFor={`service-${index}-description`}>Descrição *</Label>
                        <Input
                          id={`service-${index}-description`}
                          value={service.description}
                          onChange={(e) => handleServiceChange(index, "description", e.target.value)}
                          placeholder="Descrição do serviço"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`service-${index}-quantity`}>Quantidade *</Label>
                        <Input
                          id={`service-${index}-quantity`}
                          type="number"
                          min="1"
                          value={service.quantity}
                          onChange={(e) => handleServiceChange(index, "quantity", parseInt(e.target.value) || 1)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`service-${index}-unitValue`}>Valor Unitário *</Label>
                        <Input
                          id={`service-${index}-unitValue`}
                          type="number"
                          step="0.01"
                          min="0"
                          value={service.unitValue}
                          onChange={(e) => handleServiceChange(index, "unitValue", parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>
                    </div>
                    <div className="mt-2 text-right">
                      <Badge variant="secondary" className="text-lg">
                        Total: R$ {service.totalValue.toFixed(2)}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Payment Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Informações de Pagamento</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="paymentMethod">Forma de Pagamento *</Label>
                    <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange("paymentMethod", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar forma de pagamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <div className="w-full">
                      <Label htmlFor="totalValue">Valor Total</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="totalValue"
                          value={`R$ ${formData.totalValue.toFixed(2)}`}
                          readOnly
                          className="text-lg font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Observações adicionais sobre o faturamento..."
                  rows={3}
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 pt-6 border-t border-border">
                <Button type="button" variant="outline" onClick={() => window.location.href = "/financeiro"}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button type="submit" className="medical-button-primary">
                  <Receipt className="w-4 h-4 mr-2" />
                  Emitir Fatura
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

export default Faturamento
