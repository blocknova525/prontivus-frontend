import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  FileText, 
  Download,
  Plus,
  Eye,
  Calendar,
  Users,
  CreditCard,
  Receipt
} from 'lucide-react';
import { apiService } from '@/lib/api';

interface BillingDashboard {
  total_revenue: number;
  total_payments: number;
  outstanding_receivables: number;
  overdue_receivables: number;
  total_expenses: number;
  net_profit: number;
  date_from: string;
  date_to: string;
}

interface Billing {
  id: number;
  billing_number: string;
  patient_name: string;
  patient_cpf: string;
  doctor_name: string;
  billing_type: string;
  billing_date: string;
  due_date: string;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  payment_status: string;
  insurance_company: string;
}

interface AccountsReceivable {
  id: number;
  patient_name: string;
  patient_cpf: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  original_amount: number;
  outstanding_amount: number;
  days_overdue: number;
  aging_bucket: string;
  status: string;
}

interface PhysicianPayout {
  id: number;
  payout_number: string;
  doctor_name: string;
  payout_date: string;
  payout_period_start: string;
  payout_period_end: string;
  gross_revenue: number;
  facility_fee: number;
  net_payout: number;
  consultation_count: number;
  procedure_count: number;
  status: string;
  is_paid: boolean;
}

const FinancialDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<BillingDashboard | null>(null);
  const [billings, setBillings] = useState<Billing[]>([]);
  const [receivables, setReceivables] = useState<AccountsReceivable[]>([]);
  const [payouts, setPayouts] = useState<PhysicianPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBillingDialog, setShowBillingDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null);

  // Date range state
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  // Billing form state
  const [billingForm, setBillingForm] = useState({
    patient_id: '',
    doctor_id: '',
    billing_type: 'private',
    billing_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tax_amount: 0,
    discount_amount: 0,
    paid_amount: 0,
    insurance_company: '',
    insurance_number: '',
    notes: ''
  });

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    payment_date: new Date().toISOString(),
    payment_method: 'cash',
    amount: 0,
    transaction_id: '',
    bank_name: '',
    account_number: '',
    check_number: '',
    notes: ''
  });

  useEffect(() => {
    loadDashboard();
    loadBillings();
    loadReceivables();
    loadPayouts();
  }, [dateFrom, dateTo]);

  const loadDashboard = async () => {
    try {
      const response = await apiService.get('/api/v1/financial/dashboard', {
        params: { date_from: dateFrom, date_to: dateTo }
      });
      setDashboard(response.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const loadBillings = async () => {
    try {
      const response = await apiService.get('/api/v1/financial/billing', {
        params: { date_from: dateFrom, date_to: dateTo }
      });
      setBillings(response.data);
    } catch (error) {
      console.error('Error loading billings:', error);
    }
  };

  const loadReceivables = async () => {
    try {
      const response = await apiService.get('/api/v1/financial/accounts-receivable');
      setReceivables(response.data);
    } catch (error) {
      console.error('Error loading receivables:', error);
    }
  };

  const loadPayouts = async () => {
    try {
      const response = await apiService.get('/api/v1/financial/physician-payouts');
      setPayouts(response.data);
    } catch (error) {
      console.error('Error loading payouts:', error);
    }
  };

  const handleCreateBilling = async () => {
    try {
      await apiService.post('/api/v1/financial/billing', {
        ...billingForm,
        items: [
          {
            item_type: 'consultation',
            item_name: 'Consulta Médica',
            quantity: 1,
            unit_price: 150,
            total_price: 150
          }
        ]
      });
      setShowBillingDialog(false);
      setBillingForm({
        patient_id: '',
        doctor_id: '',
        billing_type: 'private',
        billing_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tax_amount: 0,
        discount_amount: 0,
        paid_amount: 0,
        insurance_company: '',
        insurance_number: '',
        notes: ''
      });
      loadBillings();
      loadDashboard();
    } catch (error) {
      console.error('Error creating billing:', error);
    }
  };

  const handleAddPayment = async () => {
    if (!selectedBilling) return;
    
    try {
      await apiService.post(`/api/v1/financial/billing/${selectedBilling.id}/payment`, paymentForm);
      setShowPaymentDialog(false);
      setSelectedBilling(null);
      setPaymentForm({
        payment_date: new Date().toISOString(),
        payment_method: 'cash',
        amount: 0,
        transaction_id: '',
        bank_name: '',
        account_number: '',
        check_number: '',
        notes: ''
      });
      loadBillings();
      loadDashboard();
    } catch (error) {
      console.error('Error adding payment:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendente' },
      paid: { color: 'bg-green-100 text-green-800', label: 'Pago' },
      overdue: { color: 'bg-red-100 text-red-800', label: 'Vencido' },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelado' },
      refunded: { color: 'bg-blue-100 text-blue-800', label: 'Reembolsado' },
      disputed: { color: 'bg-orange-100 text-orange-800', label: 'Disputado' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getBillingTypeBadge = (type: string) => {
    const typeConfig = {
      tiss: { color: 'bg-blue-100 text-blue-800', label: 'TISS' },
      private: { color: 'bg-green-100 text-green-800', label: 'Particular' },
      cash: { color: 'bg-purple-100 text-purple-800', label: 'Dinheiro' },
      insurance: { color: 'bg-orange-100 text-orange-800', label: 'Convênio' },
      corporate: { color: 'bg-gray-100 text-gray-800', label: 'Empresarial' }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.private;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getAgingBadge = (bucket: string) => {
    const bucketConfig = {
      current: { color: 'bg-green-100 text-green-800', label: 'Atual' },
      '30': { color: 'bg-yellow-100 text-yellow-800', label: '30 dias' },
      '60': { color: 'bg-orange-100 text-orange-800', label: '60 dias' },
      '90': { color: 'bg-red-100 text-red-800', label: '90 dias' },
      '120+': { color: 'bg-red-200 text-red-900', label: '120+ dias' }
    };
    
    const config = bucketConfig[bucket as keyof typeof bucketConfig] || bucketConfig.current;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Painel Financeiro</h1>
        <div className="flex gap-2">
          <Dialog open={showBillingDialog} onOpenChange={setShowBillingDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Cobrança
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Nova Cobrança</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patient_id">ID do Paciente</Label>
                  <Input
                    id="patient_id"
                    value={billingForm.patient_id}
                    onChange={(e) => setBillingForm({ ...billingForm, patient_id: e.target.value })}
                    placeholder="Digite o ID do paciente"
                  />
                </div>
                <div>
                  <Label htmlFor="doctor_id">ID do Médico</Label>
                  <Input
                    id="doctor_id"
                    value={billingForm.doctor_id}
                    onChange={(e) => setBillingForm({ ...billingForm, doctor_id: e.target.value })}
                    placeholder="Digite o ID do médico"
                  />
                </div>
                <div>
                  <Label htmlFor="billing_type">Tipo de Cobrança</Label>
                  <Select
                    value={billingForm.billing_type}
                    onValueChange={(value) => setBillingForm({ ...billingForm, billing_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tiss">TISS</SelectItem>
                      <SelectItem value="private">Particular</SelectItem>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                      <SelectItem value="insurance">Convênio</SelectItem>
                      <SelectItem value="corporate">Empresarial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="billing_date">Data da Cobrança</Label>
                  <Input
                    id="billing_date"
                    type="date"
                    value={billingForm.billing_date}
                    onChange={(e) => setBillingForm({ ...billingForm, billing_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="due_date">Data de Vencimento</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={billingForm.due_date}
                    onChange={(e) => setBillingForm({ ...billingForm, due_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="insurance_company">Convênio</Label>
                  <Input
                    id="insurance_company"
                    value={billingForm.insurance_company}
                    onChange={(e) => setBillingForm({ ...billingForm, insurance_company: e.target.value })}
                    placeholder="Nome do convênio"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={billingForm.notes}
                    onChange={(e) => setBillingForm({ ...billingForm, notes: e.target.value })}
                    placeholder="Observações sobre a cobrança"
                  />
                </div>
              </div>
              <Button onClick={handleCreateBilling} className="w-full">
                Criar Cobrança
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="flex gap-4 items-end">
        <div>
          <Label htmlFor="date_from">Data Inicial</Label>
          <Input
            id="date_from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="date_to">Data Final</Label>
          <Input
            id="date_to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <Button onClick={() => { loadDashboard(); loadBillings(); }}>
          <Calendar className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Dashboard Cards */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {dashboard.total_revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">
                {dashboard.date_from} - {dashboard.date_to}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagamentos</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {dashboard.total_payments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">
                Recebido no período
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">A Receber</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {dashboard.outstanding_receivables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">
                Em aberto
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${dashboard.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {dashboard.net_profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                Receita - Despesas
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="billings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="billings">Cobranças</TabsTrigger>
          <TabsTrigger value="receivables">A Receber</TabsTrigger>
          <TabsTrigger value="payouts">Pagamentos Médicos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="billings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cobranças</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {billings.map((billing) => (
                  <div key={billing.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold">{billing.billing_number}</h3>
                        <p className="text-sm text-gray-600">{billing.patient_name}</p>
                        <p className="text-sm text-gray-600">CPF: {billing.patient_cpf}</p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        {getStatusBadge(billing.payment_status)}
                        {getBillingTypeBadge(billing.billing_type)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold">R$ {billing.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <p className="text-sm text-gray-600">
                          Vencimento: {new Date(billing.due_date).toLocaleDateString('pt-BR')}
                        </p>
                        {billing.balance_amount > 0 && (
                          <p className="text-sm text-red-600">
                            Saldo: R$ {billing.balance_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedBilling(billing);
                            setPaymentForm({ ...paymentForm, amount: billing.balance_amount });
                            setShowPaymentDialog(true);
                          }}
                        >
                          <Receipt className="w-4 h-4 mr-2" />
                          Pagamento
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receivables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contas a Receber</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {receivables.map((receivable) => (
                  <div key={receivable.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold">{receivable.invoice_number}</h3>
                        <p className="text-sm text-gray-600">{receivable.patient_name}</p>
                        <p className="text-sm text-gray-600">CPF: {receivable.patient_cpf}</p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        {getAgingBadge(receivable.aging_bucket)}
                        {receivable.days_overdue > 0 && (
                          <Badge className="bg-red-100 text-red-800">
                            {receivable.days_overdue} dias em atraso
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold">R$ {receivable.outstanding_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <p className="text-sm text-gray-600">
                          Vencimento: {new Date(receivable.due_date).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-sm text-gray-600">
                          Original: R$ {receivable.original_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Button size="sm" variant="outline">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Cobrar
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pagamentos Médicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payouts.map((payout) => (
                  <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold">{payout.payout_number}</h3>
                        <p className="text-sm text-gray-600">{payout.doctor_name}</p>
                        <p className="text-sm text-gray-600">
                          Período: {new Date(payout.payout_period_start).toLocaleDateString('pt-BR')} - {new Date(payout.payout_period_end).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Badge className={payout.is_paid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                          {payout.is_paid ? "Pago" : "Pendente"}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800">
                          {payout.consultation_count} consultas
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold">R$ {payout.net_payout.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <p className="text-sm text-gray-600">
                          Bruto: R$ {payout.gross_revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-gray-600">
                          Taxa: R$ {payout.facility_fee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                        {!payout.is_paid && (
                          <Button size="sm">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pagar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex flex-col">
                  <FileText className="w-6 h-6 mb-2" />
                  Relatório de Cobranças
                </Button>
                <Button variant="outline" className="h-20 flex flex-col">
                  <Download className="w-6 h-6 mb-2" />
                  Contas a Receber
                </Button>
                <Button variant="outline" className="h-20 flex flex-col">
                  <Users className="w-6 h-6 mb-2" />
                  Pagamentos Médicos
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Pagamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="payment_date">Data do Pagamento</Label>
              <Input
                id="payment_date"
                type="datetime-local"
                value={paymentForm.payment_date}
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="payment_method">Método de Pagamento</Label>
              <Select
                value={paymentForm.payment_method}
                onValueChange={(value) => setPaymentForm({ ...paymentForm, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                  <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                  <SelectItem value="bank_transfer">Transferência</SelectItem>
                  <SelectItem value="check">Cheque</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="transaction_id">ID da Transação</Label>
              <Input
                id="transaction_id"
                value={paymentForm.transaction_id}
                onChange={(e) => setPaymentForm({ ...paymentForm, transaction_id: e.target.value })}
                placeholder="ID da transação (opcional)"
              />
            </div>
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                placeholder="Observações sobre o pagamento"
              />
            </div>
            <Button onClick={handleAddPayment} className="w-full">
              Adicionar Pagamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinancialDashboard;
