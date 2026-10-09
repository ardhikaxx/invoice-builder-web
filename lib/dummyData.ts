import { Document, Business, ServiceItem, AdditionalCost } from './types';
import { generateId } from './utils';

export const DUMMY_BUSINESS: Business = {
  name: 'TechVision Studio',
  phone: '081234567890',
  email: 'hello@techvisionstudio.com',
  address: 'Jl. Sudirman No. 123, Jakarta Selatan, DKI Jakarta 12190',
  website: 'techvisionstudio.com',
};

export const DUMMY_ITEMS_FULL: ServiceItem[] = [
  {
    id: generateId(),
    name: 'Pembuatan Website Company Profile',
    description: 'Desain dan pengembangan website responsif dengan CMS',
    qty: 1,
    unit: 'Project',
    unitPrice: 5000000,
    total: 5000000,
  },
  {
    id: generateId(),
    name: 'UI/UX Design',
    description: 'Desain antarmuka pengguna untuk website',
    qty: 1,
    unit: 'Project',
    unitPrice: 2000000,
    total: 2000000,
  },
  {
    id: generateId(),
    name: 'Domain & Hosting 1 Tahun',
    description: 'Domain .com + hosting 1GB selama 12 bulan',
    qty: 1,
    unit: 'Paket',
    unitPrice: 800000,
    total: 800000,
  },
];

export const DUMMY_ITEMS_DP: ServiceItem[] = [
  {
    id: generateId(),
    name: 'Pembuatan Aplikasi Mobile',
    description: 'Pengembangan aplikasi Android & iOS dengan React Native',
    qty: 1,
    unit: 'Project',
    unitPrice: 15000000,
    total: 15000000,
  },
  {
    id: generateId(),
    name: 'Maintenance Bulanan',
    description: 'Pemeliharaan dan update aplikasi per bulan',
    qty: 3,
    unit: 'Bulan',
    unitPrice: 500000,
    total: 1500000,
  },
];

export const DUMMY_ADDITIONAL_COSTS: AdditionalCost[] = [
  {
    id: generateId(),
    name: 'Biaya Transportasi',
    amount: 250000,
  },
];

export const DUMMY_INVOICE_FULL: Document = {
  id: generateId(),
  type: 'invoice',
  documentNumber: 'INV-20260918-001',
  date: '2026-09-18',
  business: DUMMY_BUSINESS,
  customer: {
    name: 'Yanuar Ardhika',
    phone: '+6281234567890',
  },
  items: DUMMY_ITEMS_FULL,
  additionalCosts: [],
  discount: { type: 'nominal', value: 0 },
  subtotal: 7800000,
  totalAmount: 7800000,
  payment: {
    method: 'full',
    dpType: 'nominal',
    dpNominal: 0,
    dpPercentage: 100,
    dpAmount: 7800000,
    remainingPayment: 0,
    paidAmount: 7800000,
    status: 'lunas',
  },
  notes: 'Pembayaran dilakukan melalui transfer bank BCA.\nInvoice ini berlaku selama 7 hari.',
  createdAt: '2026-09-18T10:00:00.000Z',
  updatedAt: '2026-09-18T10:00:00.000Z',
};

export const DUMMY_INVOICE_DP: Document = {
  id: generateId(),
  type: 'invoice',
  documentNumber: 'INV-20260918-002',
  date: '2026-09-18',
  business: DUMMY_BUSINESS,
  customer: {
    name: 'Rina Susanti',
    phone: '085678901234',
  },
  items: DUMMY_ITEMS_DP,
  additionalCosts: DUMMY_ADDITIONAL_COSTS,
  discount: { type: 'percentage', value: 5 },
  subtotal: 16500000,
  totalAmount: 15925000,
  payment: {
    method: 'dp',
    dpType: 'percentage',
    dpNominal: 4777500,
    dpPercentage: 30,
    dpAmount: 4777500,
    remainingPayment: 11147500,
    paidAmount: 4777500,
    status: 'lunas_dp',
  },
  notes: 'DP sebesar 30% untuk memulai pengerjaan.\nPelunasan maksimal sebelum file final dikirim.',
  createdAt: '2026-09-18T11:00:00.000Z',
  updatedAt: '2026-09-18T11:00:00.000Z',
};
