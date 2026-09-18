'use client';
import React from 'react';
import { Payment } from '@/lib/types';
import { formatRupiah, getPaymentStatusLabel } from '@/lib/utils';
import { CreditCard } from 'lucide-react';

interface PaymentFormProps {
  payment: Payment;
  totalAmount: number;
  onChange: (payment: Partial<Payment>) => void;
  documentType: string;
  errors: Record<string, string>;
}

export default function PaymentForm({ payment, totalAmount, onChange, documentType, errors }: PaymentFormProps) {
  if (documentType !== 'invoice') return null;

  const handleMethodChange = (method: 'full' | 'dp') => {
    if (method === 'full') {
      onChange({
        method: 'full',
        dpType: 'nominal',
        dpNominal: 0,
        dpPercentage: 100,
        dpAmount: totalAmount,
        remainingPayment: 0,
        paidAmount: totalAmount,
        status: 'lunas',
      });
    } else {
      const defaultDp = Math.round(totalAmount * 0.3);
      onChange({
        method: 'dp',
        dpType: 'percentage',
        dpNominal: defaultDp,
        dpPercentage: 30,
        dpAmount: defaultDp,
        remainingPayment: totalAmount - defaultDp,
        paidAmount: defaultDp,
        status: 'lunas_dp',
      });
    }
  };

  const handleDpTypeChange = (dpType: 'nominal' | 'percentage') => {
    if (dpType === 'percentage') {
      const pct = payment.dpPercentage > 0 ? payment.dpPercentage : 30;
      const dpAmount = Math.round(totalAmount * pct / 100);
      onChange({
        dpType,
        dpPercentage: pct,
        dpNominal: dpAmount,
        dpAmount,
        remainingPayment: Math.max(0, totalAmount - dpAmount),
        paidAmount: dpAmount,
        status: dpAmount >= totalAmount ? 'lunas' : 'lunas_dp',
      });
    } else {
      const nom = payment.dpNominal > 0 ? Math.min(payment.dpNominal, totalAmount) : 0;
      onChange({
        dpType,
        dpNominal: nom,
        dpPercentage: totalAmount > 0 ? Math.round(nom / totalAmount * 100) : 0,
        dpAmount: nom,
        remainingPayment: Math.max(0, totalAmount - nom),
        paidAmount: nom,
        status: nom >= totalAmount ? 'lunas' : 'lunas_dp',
      });
    }
  };

  const handleDpValueChange = (value: number) => {
    if (payment.dpType === 'percentage') {
      const pct = Math.min(Math.max(value, 0), 100);
      const dpAmount = Math.round(totalAmount * pct / 100);
      onChange({
        dpPercentage: pct,
        dpNominal: dpAmount,
        dpAmount,
        remainingPayment: Math.max(0, totalAmount - dpAmount),
        paidAmount: dpAmount,
        status: dpAmount >= totalAmount ? 'lunas' : 'lunas_dp',
      });
    } else {
      const nom = Math.min(Math.max(value, 0), totalAmount);
      onChange({
        dpNominal: nom,
        dpPercentage: totalAmount > 0 ? Math.round(nom / totalAmount * 100) : 0,
        dpAmount: nom,
        remainingPayment: Math.max(0, totalAmount - nom),
        paidAmount: nom,
        status: nom >= totalAmount ? 'lunas' : 'lunas_dp',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CreditCard className="w-4 h-4 text-zinc-500" />
        <h3 className="text-sm font-semibold text-zinc-800 uppercase tracking-wide">Pembayaran</h3>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => handleMethodChange('full')}
          className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
            payment.method === 'full'
              ? 'bg-black text-white border-black'
              : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
          }`}
        >
          Bayar Full
        </button>
        <button
          onClick={() => handleMethodChange('dp')}
          className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
            payment.method === 'dp'
              ? 'bg-black text-white border-black'
              : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
          }`}
        >
          Bayar DP
        </button>
      </div>

      {payment.method === 'dp' && (
        <div className="space-y-3 p-4 border border-zinc-200 rounded-lg bg-zinc-50/50">
          <div className="flex gap-3">
            <button
              onClick={() => handleDpTypeChange('percentage')}
              className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                payment.dpType === 'percentage'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              Persentase (%)
            </button>
            <button
              onClick={() => handleDpTypeChange('nominal')}
              className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                payment.dpType === 'nominal'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              Nominal (Rp)
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              {payment.dpType === 'percentage' ? 'Persentase DP' : 'Nominal DP'}
            </label>
            <div className="relative">
              <input
                type="number"
                value={payment.dpType === 'percentage' ? payment.dpPercentage : payment.dpNominal}
                onChange={(e) => handleDpValueChange(parseFloat(e.target.value) || 0)}
                min={0}
                max={payment.dpType === 'percentage' ? 100 : totalAmount}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 transition-colors ${
                  errors['payment.dp'] ? 'border-red-400' : 'border-zinc-300'
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">
                {payment.dpType === 'percentage' ? '%' : 'Rp'}
              </span>
            </div>
            {errors['payment.dp'] && (
              <p className="text-xs text-red-500 mt-1">{errors['payment.dp']}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-lg border border-zinc-200">
              <span className="text-zinc-500 block mb-1">DP Dibayar</span>
              <span className="font-semibold text-zinc-800">{formatRupiah(payment.dpAmount)}</span>
            </div>
            <div className="p-3 bg-white rounded-lg border border-zinc-200">
              <span className="text-zinc-500 block mb-1">Sisa Pelunasan</span>
              <span className="font-semibold text-zinc-800">{formatRupiah(payment.remainingPayment)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 p-3 bg-zinc-100 rounded-lg">
        <span className="text-xs text-zinc-500">Status:</span>
        <span className="text-xs font-bold text-zinc-800 uppercase tracking-wide">
          {getPaymentStatusLabel(payment.status)}
        </span>
      </div>
    </div>
  );
}
