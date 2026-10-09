export interface Business {
  name: string;
  phone: string;
  email: string;
  address: string;
  website: string;
}

export interface Customer {
  name: string;
  phone: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface AdditionalCost {
  id: string;
  name: string;
  amount: number;
}

export interface Discount {
  type: 'nominal' | 'percentage';
  value: number;
}

export interface Payment {
  method: 'full' | 'dp';
  dpType: 'nominal' | 'percentage';
  dpNominal: number;
  dpPercentage: number;
  dpAmount: number;
  remainingPayment: number;
  paidAmount: number;
  status: PaymentStatus;
}

export type PaymentStatus = 'lunas' | 'lunas_dp' | 'pelunasan';

export type DocumentType = 'invoice' | 'kwitansi';

export interface Document {
  id: string;
  type: DocumentType;
  documentNumber: string;
  date: string;
  business: Business;
  customer: Customer;
  items: ServiceItem[];
  additionalCosts: AdditionalCost[];
  discount: Discount;
  subtotal: number;
  totalAmount: number;
  payment: Payment;
  notes: string;
  createdAt: string;
  updatedAt: string;
  linkedInvoiceId?: string;
  pelunasanAmount?: number;
}

export interface DocumentHistoryItem {
  id: string;
  type: DocumentType;
  documentNumber: string;
  date: string;
  customerName: string;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface AppState {
  business: Business;
  documents: Document[];
  draftDocument: Document | null;
  settings: AppSettings;
}

export interface AppSettings {
  nextInvoiceNumber: number;
  nextKwitansiNumber: number;
  businessSeeded?: boolean;
  documentsBusinessSeeded?: boolean;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}
