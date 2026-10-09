import { ServiceItem, AdditionalCost, Discount, Payment, PaymentStatus } from './types';

export function calculateItemTotal(qty: number, unitPrice: number): number {
  return Math.max(0, Math.round(qty * unitPrice));
}

export function calculateSubtotal(items: ServiceItem[]): number {
  return items.reduce((sum, item) => sum + item.total, 0);
}

export function calculateAdditionalCostsTotal(costs: AdditionalCost[]): number {
  return costs.reduce((sum, cost) => sum + Math.max(0, cost.amount), 0);
}

export function calculateDiscountAmount(subtotal: number, discount: Discount): number {
  if (discount.value <= 0) return 0;
  if (discount.type === 'percentage') {
    const pct = Math.min(discount.value, 100);
    return Math.round(subtotal * pct / 100);
  }
  return Math.min(Math.round(discount.value), subtotal);
}

export function calculateTotalAmount(
  subtotal: number,
  additionalCosts: number,
  discountAmount: number
): number {
  const total = subtotal + additionalCosts - discountAmount;
  return Math.max(0, total);
}

export function calculatePayment(
  totalAmount: number,
  paymentMethod: 'full' | 'dp',
  dpType: 'nominal' | 'percentage',
  dpNominal: number,
  dpPercentage: number,
  keepStatus?: PaymentStatus,
): Payment {
  if (paymentMethod === 'full') {
    return {
      method: 'full',
      dpType: 'nominal',
      dpNominal: 0,
      dpPercentage: 100,
      dpAmount: totalAmount,
      remainingPayment: 0,
      paidAmount: totalAmount,
      status: 'lunas',
    };
  }

  let dpAmount: number;
  let dpPct: number;
  let dpNom: number;

  if (dpType === 'percentage') {
    dpPct = Math.min(Math.max(dpPercentage, 0), 100);
    dpNom = Math.round(totalAmount * dpPct / 100);
    dpAmount = dpNom;
  } else {
    dpNom = Math.min(Math.max(dpNominal, 0), totalAmount);
    dpPct = totalAmount > 0 ? Math.round(dpNom / totalAmount * 100) : 0;
    dpAmount = dpNom;
  }

  const remainingPayment = Math.max(0, totalAmount - dpAmount);
  // Pertahankan pilihan status manual user (lunas_dp / pelunasan).
  // Hanya paksa 'lunas' jika DP sudah menutup seluruh total.
  const status: PaymentStatus =
    remainingPayment === 0
      ? 'lunas'
      : keepStatus === 'pelunasan' || keepStatus === 'lunas_dp'
        ? keepStatus
        : 'lunas_dp';

  return {
    method: 'dp',
    dpType,
    dpNominal: dpNom,
    dpPercentage: dpPct,
    dpAmount,
    remainingPayment,
    paidAmount: dpAmount,
    status,
  };
}

export function calculatePelunasan(
  totalAmount: number,
  dpAmount: number,
  pelunasanAmount: number
): { pelunasan: number; totalPaid: number; status: PaymentStatus } {
  const remaining = Math.max(0, totalAmount - dpAmount);
  const pelunasan = Math.min(Math.max(0, pelunasanAmount), remaining);
  const totalPaid = dpAmount + pelunasan;
  const status: PaymentStatus = totalPaid >= totalAmount ? 'pelunasan' : 'lunas_dp';

  return { pelunasan, totalPaid, status };
}

export function validateDocumentNumber(
  documentNumber: string,
  existingNumbers: string[]
): boolean {
  if (!documentNumber.trim()) return false;
  return !existingNumbers.includes(documentNumber);
}
