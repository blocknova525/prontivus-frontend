import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

// Check if jsPDF is properly loaded
if (typeof jsPDF === 'undefined') {
  throw new Error('jsPDF library is not properly loaded');
}

export interface PDFTemplateData {
  patientName: string;
  patientCPF: string;
  patientAge: string;
  doctorName: string;
  doctorCRM: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  date: string;
  content: any;
}

export interface PrescriptionData extends PDFTemplateData {
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  notes?: string;
}

export interface CertificateData extends PDFTemplateData {
  certificateType: 'medical' | 'sick_leave' | 'fitness' | 'attendance' | 'accompaniment';
  reason: string;
  duration?: string;
  restrictions?: string;
}

export interface ReportData extends PDFTemplateData {
  chiefComplaint: string;
  historyOfPresentIllness: string;
  physicalExamination: string;
  assessment: string;
  plan: string;
  vitalSigns: any;
}

export interface ExamGuideData extends PDFTemplateData {
  examType: string;
  examDescription: string;
  preparation?: string;
  fasting?: boolean;
  specialInstructions?: string;
}

export interface ReceiptData extends PDFTemplateData {
  services: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  totalAmount: number;
  paymentMethod: string;
}

class PDFService {
  private defaultData: Partial<PDFTemplateData> = {
    clinicName: 'Prontivus',
    clinicAddress: 'Rua das Flores, 123 - Centro',
    clinicPhone: '(11) 99999-9999',
    doctorName: 'Dr. João Silva',
    doctorCRM: 'CRM 123456',
  };

  private async loadLogoAsBase64(): Promise<string | null> {
    try {
      // Try to fetch the logo as base64
      const logoPath = '/Logo/Prontivus Horizontal.png';
      const response = await fetch(logoPath);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('Failed to load logo as base64:', error);
      return null;
    }
  }

  private addHeader(doc: jsPDF, data: PDFTemplateData, documentType?: string, logoBase64?: string) {
    // Calculate center position for logo (no background, no border, no debug text)
    const headerWidth = 170;
    const headerHeight = 30;
    const logoWidth = 60; // Width
    const logoHeight = 30; // Height
    const centerX = 20 + (headerWidth - logoWidth) / 2; // Center horizontally
    const centerY = 20 + (headerHeight - logoHeight) / 2; // Center vertically
    
    // Try to add the actual logo image centered
    if (logoBase64) {
      try {
        // Add logo image from base64 (60x30 size, centered)
        doc.addImage(logoBase64, 'PNG', centerX, centerY, logoWidth, logoHeight);
        console.log('Logo image added successfully from base64');
      } catch (error) {
        console.warn('Could not add logo from base64, using fallback:', error);
        this.addLogoFallback(doc, centerX, centerY, logoWidth, logoHeight);
      }
    } else {
      // Try multiple possible logo paths as fallback
      try {
        const logoPaths = [
          '/Logo/Prontivus Horizontal.png',
          './Logo/Prontivus Horizontal.png',
          'Logo/Prontivus Horizontal.png',
          '/public/Logo/Prontivus Horizontal.png'
        ];
        
        let logoAdded = false;
        
        for (const logoPath of logoPaths) {
          try {
            // Add logo image (60x30 size, centered)
            doc.addImage(logoPath, 'PNG', centerX, centerY, logoWidth, logoHeight);
            console.log(`Logo image added successfully from: ${logoPath}`);
            logoAdded = true;
            break;
          } catch (pathError) {
            console.warn(`Failed to load logo from ${logoPath}:`, pathError);
            continue;
          }
        }
        
        if (!logoAdded) {
          throw new Error('Could not load logo from any path');
        }
        
      } catch (error) {
        console.warn('Could not load logo image, using text fallback:', error);
        this.addLogoFallback(doc, centerX, centerY, logoWidth, logoHeight);
      }
    }
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Document title (below header)
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(this.getDocumentTitle(documentType), 20, 65);
    
    // Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Data: ${data.date}`, 20, 75);
  }

  private addLogoFallback(doc: jsPDF, centerX: number, centerY: number, logoWidth: number, logoHeight: number) {
    // Fallback: Add logo text placeholder (no background, no border, centered)
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    
    // Center text within the logo area
    const textX = centerX + logoWidth / 2;
    const textY = centerY + logoHeight / 2;
    
    doc.text('PRONTIVUS', textX, textY - 2, { align: 'center' });
    doc.text('HORIZONTAL', textX, textY + 4, { align: 'center' });
  }

  // Debug method to test header (clean version)
  generateTestHeader(): jsPDF {
    const doc = new jsPDF();
    
    // Calculate center position for logo (no background, no border, no debug text)
    const headerWidth = 170;
    const headerHeight = 30;
    const logoWidth = 60; // Width
    const logoHeight = 30; // Height
    const centerX = 20 + (headerWidth - logoWidth) / 2;
    const centerY = 20 + (headerHeight - logoHeight) / 2;
    
    // Test centered logo fallback
    this.addLogoFallback(doc, centerX, centerY, logoWidth, logoHeight);
    
    return doc;
  }

  private addFooter(doc: jsPDF, data: PDFTemplateData) {
    const pageHeight = doc.internal.pageSize.height;
    
    // Footer background
    doc.setFillColor(248, 250, 252); // Light gray background
    doc.rect(20, pageHeight - 35, 170, 35, 'F');
    
    // Location and date
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`${data.clinicAddress.split(',')[0] || 'São Paulo'}-SP, ${data.date}`, 20, pageHeight - 25);
    
    // Signature line
    doc.setDrawColor(0, 0, 0);
    doc.line(20, pageHeight - 20, 100, pageHeight - 20);
    
    // Doctor signature area (dynamic)
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(`${data.doctorName}`, 20, pageHeight - 15);
    doc.text(`${data.doctorCRM}`, 20, pageHeight - 10);
    
    // Prontivus footer branding
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128); // Gray-500
    doc.text('Prontivus — Smart Care', 105, pageHeight - 5, { align: 'center' });
  }

  private getDocumentTitle(documentType?: string): string {
    switch (documentType) {
      case 'prescription':
        return 'RECEITA MÉDICA';
      case 'certificate':
        return 'ATESTADO MÉDICO';
      case 'report':
        return 'RELATÓRIO MÉDICO';
      case 'exam-guide':
        return 'GUIA DE EXAME';
      case 'receipt':
        return 'RECIBO DE CONSULTA';
      default:
        return 'DOCUMENTO MÉDICO';
    }
  }

  private createManualTable(doc: jsPDF, data: string[][], startY: number): number {
    const colWidths = [70, 40, 40, 40]; // Column widths
    const rowHeight = 8;
    const headerHeight = 12;
    
    // Headers
    const headers = ['Medicamento', 'Dosagem', 'Frequência', 'Duração'];
    
    // Draw header background
    doc.setFillColor(59, 130, 246);
    doc.rect(20, startY, 170, headerHeight, 'F');
    
    // Draw header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    let x = 20;
    headers.forEach((header, index) => {
      doc.text(header, x + 2, startY + 8);
      x += colWidths[index];
    });
    
    // Draw data rows
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    let currentY = startY + headerHeight;
    data.forEach((row, rowIndex) => {
      // Alternate row colors
      if (rowIndex % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(20, currentY, 170, rowHeight, 'F');
      }
      
      x = 20;
      row.forEach((cell, colIndex) => {
        doc.text(cell, x + 2, currentY + 6);
        x += colWidths[colIndex];
      });
      
      currentY += rowHeight;
    });
    
    // Draw borders
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, startY, 170, currentY - startY);
    
    return currentY;
  }

  private createManualReceiptTable(doc: jsPDF, data: string[][], startY: number): number {
    const colWidths = [80, 20, 30, 30]; // Column widths for receipt
    const rowHeight = 8;
    const headerHeight = 12;
    
    // Headers
    const headers = ['Serviço', 'Qtd', 'Valor Unit.', 'Total'];
    
    // Draw header background
    doc.setFillColor(59, 130, 246);
    doc.rect(20, startY, 170, headerHeight, 'F');
    
    // Draw header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    let x = 20;
    headers.forEach((header, index) => {
      doc.text(header, x + 2, startY + 8);
      x += colWidths[index];
    });
    
    // Draw data rows
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    let currentY = startY + headerHeight;
    data.forEach((row, rowIndex) => {
      // Alternate row colors
      if (rowIndex % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(20, currentY, 170, rowHeight, 'F');
      }
      
      x = 20;
      row.forEach((cell, colIndex) => {
        doc.text(cell, x + 2, currentY + 6);
        x += colWidths[colIndex];
      });
      
      currentY += rowHeight;
    });
    
    // Draw borders
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, startY, 170, currentY - startY);
    
    return currentY;
  }

  private addPatientInfo(doc: jsPDF, data: PDFTemplateData, startY: number = 90) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO PACIENTE', 20, startY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nome: ${data.patientName}`, 20, startY + 10);
    doc.text(`CPF: ${data.patientCPF}`, 20, startY + 18);
    doc.text(`Idade: ${data.patientAge}`, 20, startY + 26);
    
    return startY + 35;
  }

  private addDoctorInfo(doc: jsPDF, data: PDFTemplateData, startY: number) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO MÉDICO', 20, startY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nome: ${data.doctorName}`, 20, startY + 10);
    doc.text(`CRM: ${data.doctorCRM}`, 20, startY + 18);
    
    return startY + 30;
  }

  async generatePrescription(data: PrescriptionData): Promise<jsPDF> {
    try {
      console.log('Starting prescription generation with data:', data);
      
      // Validate input data
      if (!data || !data.patientName || !data.patientCPF || !data.patientAge) {
        throw new Error('Dados obrigatórios do paciente não fornecidos');
      }
      
      if (!data.medications || !Array.isArray(data.medications)) {
        throw new Error('Dados de medicação inválidos');
      }
      
      const doc = new jsPDF();
      console.log('PDF document created');
      
      // Load logo as base64
      const logoBase64 = await this.loadLogoAsBase64();
      
      this.addHeader(doc, data, 'prescription', logoBase64 || undefined);
      let currentY = this.addPatientInfo(doc, data);
      currentY = this.addDoctorInfo(doc, data, currentY + 10);
      
      // Prescription title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('RECEITA MÉDICA', 20, currentY + 10);
      
      // Medications table
      const medicationsData = data.medications.length > 0 
        ? data.medications.map(med => [
            med.name || 'Medicação não especificada',
            med.dosage || 'Conforme orientação médica',
            med.frequency || 'Conforme orientação médica',
            med.duration || 'Conforme orientação médica'
          ])
        : [['Nenhuma medicação especificada', 'Conforme orientação médica', 'Conforme orientação médica', 'Conforme orientação médica']];
      
      console.log('Medications data prepared:', medicationsData);
      
      // Try to use autoTable, fallback to manual table if not available
      if (typeof doc.autoTable === 'function') {
        doc.autoTable({
          startY: currentY + 20,
          head: [['Medicamento', 'Dosagem', 'Frequência', 'Duração']],
          body: medicationsData,
          styles: { fontSize: 10 },
          headStyles: { fillColor: [59, 130, 246] },
        });
      } else {
        // Fallback: Create table manually
        console.warn('autoTable não disponível, criando tabela manualmente');
        this.createManualTable(doc, medicationsData, currentY + 20);
      }
      
      console.log('Medications table added');
      
      // Notes
      if (data.notes) {
        let finalY;
        if (typeof doc.autoTable === 'function' && (doc as any).lastAutoTable) {
          finalY = (doc as any).lastAutoTable.finalY + 10;
        } else {
          // For manual table, estimate position
          finalY = currentY + 20 + (medicationsData.length * 8) + 20;
        }
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Observações:', 20, finalY);
        doc.text(data.notes, 20, finalY + 8);
      }
      
      this.addFooter(doc, data);
      console.log('Prescription PDF generated successfully');
      
      return doc;
    } catch (error) {
      console.error('Error in generatePrescription:', error);
      throw new Error(`Falha ao gerar receita médica: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async generateCertificate(data: CertificateData): Promise<jsPDF> {
    const doc = new jsPDF();
    
    // Load logo as base64
    const logoBase64 = await this.loadLogoAsBase64();
    
    this.addHeader(doc, data, 'certificate', logoBase64 || undefined);
    let currentY = this.addPatientInfo(doc, data);
    currentY = this.addDoctorInfo(doc, data, currentY + 10);
    
    // Certificate title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ATESTADO MÉDICO', 20, currentY + 10);
    
    // Certificate content
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const certificateText = this.getCertificateText(data);
    const lines = doc.splitTextToSize(certificateText, 170);
    doc.text(lines, 20, currentY + 25);
    
    this.addFooter(doc, data);
    return doc;
  }

  private getCertificateText(data: CertificateData): string {
    const baseText = `Declaro por este documento, que Sr(a) ${data.patientName}, nascido(a) em ${data.patientAge} anos, portador(a) do documento nº ${data.patientCPF}`;
    
    switch (data.certificateType) {
      case 'medical':
        return `${baseText}, encontra-se em condições de saúde adequadas para suas atividades habituais.`;
      case 'sick_leave':
        return `${baseText}, necessita de afastamento de suas atividades por motivo de saúde${data.duration ? ` pelo período de ${data.duration}` : ''}.`;
      case 'fitness':
        return `${baseText}, está apto(a) para prática de atividades físicas${data.restrictions ? ` com as seguintes restrições: ${data.restrictions}` : ''}.`;
      case 'attendance':
        return `${baseText}, compareceu ao serviço médico em ${data.date} das ${data.duration || '09:00'} às ${data.restrictions || '10:00'}.`;
      case 'accompaniment':
        return `${baseText}, acompanhou o paciente ${data.patientName} no dia ${data.date} das ${data.duration || '09:00'} às ${data.restrictions || '10:00'}.`;
      default:
        return `${baseText}, ${data.reason}`;
    }
  }

  async generateReport(data: ReportData): Promise<jsPDF> {
    const doc = new jsPDF();
    
    // Load logo as base64
    const logoBase64 = await this.loadLogoAsBase64();
    
    this.addHeader(doc, data, 'report', logoBase64 || undefined);
    let currentY = this.addPatientInfo(doc, data);
    currentY = this.addDoctorInfo(doc, data, currentY + 10);
    
    // Report title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO MÉDICO', 20, currentY + 10);
    
    // Vital signs section
    if (data.vitalSigns && Object.keys(data.vitalSigns).length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('SINAIS VITAIS', 20, currentY + 25);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const vitalSignsText = [
        `Pressão: ${data.vitalSigns.pressure || 'Não informado'}`,
        `Temperatura: ${data.vitalSigns.temperature || 'Não informado'}`,
        `Peso: ${data.vitalSigns.weight || 'Não informado'}`,
        `Frequência Cardíaca: ${data.vitalSigns.heartRate || 'Não informado'}`,
        `Saturação: ${data.vitalSigns.saturation || 'Não informado'}`,
        `Altura: ${data.vitalSigns.height || 'Não informado'}`
      ].join(' | ');
      
      const vitalLines = doc.splitTextToSize(vitalSignsText, 170);
      doc.text(vitalLines, 20, currentY + 35);
      
      currentY += 35 + (vitalLines.length * 5) + 10;
    }
    
    // Report sections
    const sections = [
      { title: 'QUEIXA PRINCIPAL', content: data.chiefComplaint },
      { title: 'HISTÓRIA DA DOENÇA ATUAL', content: data.historyOfPresentIllness },
      { title: 'EXAME FÍSICO', content: data.physicalExamination },
      { title: 'AVALIAÇÃO', content: data.assessment },
      { title: 'PLANO TERAPÊUTICO', content: data.plan },
    ];
    
    sections.forEach(section => {
      // Always add section title and content (even if empty)
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(section.title, 20, currentY + 20);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      // Use content or default message
      const content = section.content || 'Não informado';
      const lines = doc.splitTextToSize(content, 170);
      doc.text(lines, 20, currentY + 30);
      
      currentY += 30 + (lines.length * 5) + 10;
    });
    
    this.addFooter(doc, data);
    return doc;
  }

  async generateExamGuide(data: ExamGuideData): Promise<jsPDF> {
    const doc = new jsPDF();
    
    // Load logo as base64
    const logoBase64 = await this.loadLogoAsBase64();
    
    this.addHeader(doc, data, 'exam-guide', logoBase64 || undefined);
    let currentY = this.addPatientInfo(doc, data);
    currentY = this.addDoctorInfo(doc, data, currentY + 10);
    
    // Exam guide title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('GUIA DE EXAME', 20, currentY + 10);
    
    // Exam details
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    doc.text(`Tipo de Exame: ${data.examType || 'Não informado'}`, 20, currentY + 25);
    
    // Handle description with text wrapping
    const descriptionLines = doc.splitTextToSize(`Descrição: ${data.examDescription || 'Não informado'}`, 170);
    doc.text(descriptionLines, 20, currentY + 35);
    let nextY = currentY + 35 + (descriptionLines.length * 5);
    
    if (data.preparation) {
      const preparationLines = doc.splitTextToSize(`Preparo: ${data.preparation}`, 170);
      doc.text(preparationLines, 20, nextY + 5);
      nextY += 5 + (preparationLines.length * 5);
    }
    
    if (data.fasting !== undefined) {
      doc.text(`Jejum: ${data.fasting ? 'Sim' : 'Não'}`, 20, nextY + 5);
      nextY += 15;
    }
    
    if (data.specialInstructions) {
      const instructionsLines = doc.splitTextToSize(`Instruções Especiais: ${data.specialInstructions}`, 170);
      doc.text(instructionsLines, 20, nextY + 5);
    }
    
    this.addFooter(doc, data);
    return doc;
  }

  async generateReceipt(data: ReceiptData): Promise<jsPDF> {
    const doc = new jsPDF();
    
    // Load logo as base64
    const logoBase64 = await this.loadLogoAsBase64();
    
    this.addHeader(doc, data, 'receipt', logoBase64 || undefined);
    let currentY = this.addPatientInfo(doc, data);
    currentY = this.addDoctorInfo(doc, data, currentY + 10);
    
    // Receipt title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RECIBO DE CONSULTA', 20, currentY + 10);
    
    // Services table
    const servicesData = data.services.map(service => [
      service.description,
      service.quantity.toString(),
      `R$ ${service.unitPrice.toFixed(2)}`,
      `R$ ${service.total.toFixed(2)}`
    ]);
    
    if (typeof doc.autoTable === 'function') {
      doc.autoTable({
        startY: currentY + 20,
        head: [['Serviço', 'Qtd', 'Valor Unit.', 'Total']],
        body: servicesData,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [59, 130, 246] },
      });
    } else {
      // Fallback: Create table manually
      console.warn('autoTable não disponível, criando tabela manualmente');
      this.createManualReceiptTable(doc, servicesData, currentY + 20);
    }
    
    // Total
    let finalY;
    if (typeof doc.autoTable === 'function' && (doc as any).lastAutoTable) {
      finalY = (doc as any).lastAutoTable.finalY + 10;
    } else {
      // For manual table, estimate position
      finalY = currentY + 20 + (servicesData.length * 8) + 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL: R$ ${data.totalAmount.toFixed(2)}`, 20, finalY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Forma de Pagamento: ${data.paymentMethod || 'Não informado'}`, 20, finalY + 10);
    
    this.addFooter(doc, data);
    return doc;
  }

  downloadPDF(doc: jsPDF, filename: string) {
    try {
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const finalFilename = `${filename}_${timestamp}.pdf`;
      
      // Save the PDF
      doc.save(finalFilename);
      
      // Show success message
      console.log(`PDF saved as: ${finalFilename}`);
      return finalFilename;
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw error;
    }
  }

  printPDF(doc: jsPDF) {
    try {
      doc.autoPrint();
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Clean up the URL after printing
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Error printing PDF:', error);
      throw error;
    }
  }

  // Get PDF as Blob for preview
  getPDFBlob(doc: jsPDF): Blob {
    return doc.output('blob');
  }

  // Open PDF in new tab for preview
  previewPDF(doc: jsPDF, filename: string) {
    try {
      const blob = this.getPDFBlob(doc);
      const url = URL.createObjectURL(blob);
      const newWindow = window.open(url, '_blank');
      
      if (newWindow) {
        newWindow.document.title = filename;
      }
      
      // Clean up the URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error) {
      console.error('Error previewing PDF:', error);
      throw error;
    }
  }
}

export const pdfService = new PDFService();
export default pdfService;
