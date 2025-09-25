import React, { useState } from 'react';
import { pdfService, ReceiptData } from '@/services/pdfService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

interface Service {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ReceiptTemplateProps {
  patientName: string;
  patientCPF: string;
  patientAge: string;
  onGenerate: (doc: any) => void;
}

const ReceiptTemplate: React.FC<ReceiptTemplateProps> = ({
  patientName,
  patientCPF,
  patientAge,
  onGenerate
}) => {
  const [services, setServices] = useState<Service[]>([
    { description: 'Consulta Médica', quantity: 1, unitPrice: 150.00, total: 150.00 }
  ]);
  const [paymentMethod, setPaymentMethod] = useState('');

  const addService = () => {
    setServices([...services, { description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: keyof Service, value: string | number) => {
    const newServices = [...services];
    newServices[index] = { ...newServices[index], [field]: value };
    
    // Recalculate total
    if (field === 'quantity' || field === 'unitPrice') {
      newServices[index].total = newServices[index].quantity * newServices[index].unitPrice;
    }
    
    setServices(newServices);
  };

  const totalAmount = services.reduce((sum, service) => sum + service.total, 0);

  const generateReceipt = async () => {
    try {
      // Validate required fields
      if (!paymentMethod) {
        alert('Por favor, selecione a forma de pagamento.');
        return;
      }

      // Validate services
      const validServices = services.filter(service => 
        service.description.trim() && service.quantity > 0 && service.unitPrice > 0
      );

      if (validServices.length === 0) {
        alert('Por favor, adicione pelo menos um serviço válido.');
        return;
      }

      const receiptData: ReceiptData = {
        patientName,
        patientCPF,
        patientAge,
        doctorName: 'Dr. João Silva',
        doctorCRM: 'CRM 123456',
        clinicName: 'Prontivus',
        clinicAddress: 'Rua das Flores, 123 - Centro',
        clinicPhone: '(11) 99999-9999',
        date: new Date().toLocaleDateString('pt-BR'),
        services: validServices,
        totalAmount: validServices.reduce((sum, service) => sum + service.total, 0),
        paymentMethod
      };

      const doc = await pdfService.generateReceipt(receiptData);
      onGenerate(doc);
    } catch (error) {
      console.error('Error generating receipt:', error);
      alert('Erro ao gerar recibo: ' + (error as Error).message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-primary">Recibo de Consulta</h3>
        <p className="text-sm text-muted-foreground">
          Gerar recibo com serviços prestados
        </p>
      </div>
      
      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Dados do Paciente</h4>
        <div className="text-sm space-y-1">
          <p><strong>Nome:</strong> {patientName}</p>
          <p><strong>CPF:</strong> {patientCPF}</p>
          <p><strong>Idade:</strong> {patientAge}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Serviços</h4>
          <Button onClick={addService} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        </div>

        <div className="space-y-3">
          {services.map((service, index) => (
            <div key={index} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Serviço {index + 1}</Label>
                {services.length > 1 && (
                  <Button
                    onClick={() => removeService(index)}
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="md:col-span-2">
                  <Label htmlFor={`description-${index}`}>Descrição</Label>
                  <Input
                    id={`description-${index}`}
                    value={service.description}
                    onChange={(e) => updateService(index, 'description', e.target.value)}
                    placeholder="Descrição do serviço"
                  />
                </div>
                <div>
                  <Label htmlFor={`quantity-${index}`}>Qtd</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="1"
                    value={service.quantity}
                    onChange={(e) => updateService(index, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <Label htmlFor={`unitPrice-${index}`}>Valor Unit.</Label>
                  <Input
                    id={`unitPrice-${index}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={service.unitPrice}
                    onChange={(e) => updateService(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              
              <div className="text-right">
                <span className="font-medium">Total: R$ {service.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-primary/10 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Geral:</span>
            <span className="text-lg font-bold text-primary">R$ {totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div>
          <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a forma de pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dinheiro">Dinheiro</SelectItem>
              <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
              <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
              <SelectItem value="pix">PIX</SelectItem>
              <SelectItem value="convenio">Convênio</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={generateReceipt} className="w-full">
        Gerar Recibo PDF
      </Button>
    </div>
  );
};

export default ReceiptTemplate;
