'use client';
import React from 'react';
import { Document } from '@/lib/types';
import { formatRupiah, formatDateIndonesia, getPaymentStatusLabel } from '@/lib/utils';
import { terbilang } from '@/lib/terbilang';

interface InvoicePreviewProps {
  document: Document;
}

export default function InvoicePreview({ document }: InvoicePreviewProps) {
  const { business, customer, items, additionalCosts, discount, subtotal, totalAmount, payment, notes, documentNumber, date } = document;

  const additionalTotal = additionalCosts.reduce((sum, c) => sum + c.amount, 0);
  const discountAmount = discount.type === 'percentage'
    ? Math.round(subtotal * discount.value / 100)
    : discount.value;

  return (
    <div className="invoice-sheet bg-white shadow-lg border border-zinc-200 mx-auto print:shadow-none print:border-0" style={{ width: '210mm', minHeight: '297mm', padding: '15mm' }}>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-black tracking-tight">{business.name || 'Nama Usaha'}</h1>
          <div className="mt-2 text-xs text-zinc-600 space-y-0.5">
            {business.phone && <p>{business.phone}</p>}
            {business.email && <p>{business.email}</p>}
            {business.address && <p className="whitespace-pre-line">{business.address}</p>}
            {business.website && <p>{business.website}</p>}
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold text-black tracking-widest uppercase">Invoice</h2>
        </div>
      </div>

      <div className="border-t border-zinc-300 my-4" />

      <div className="flex justify-between mb-8">
        <div>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Bill To</h3>
          <p className="text-sm font-semibold text-black">{customer.name || 'Nama Pelanggan'}</p>
          {customer.phone && <p className="text-xs text-zinc-600 mt-0.5">{customer.phone}</p>}
        </div>
        <div className="text-right">
          <div className="text-xs space-y-1">
            <p><span className="text-zinc-400 inline-block w-24">Nomor:</span> <span className="font-semibold text-black">{documentNumber}</span></p>
            <p><span className="text-zinc-400 inline-block w-24">Tanggal:</span> <span className="text-black">{formatDateIndonesia(date)}</span></p>
            <p><span className="text-zinc-400 inline-block w-24">Status:</span> <span className="font-bold text-black">{getPaymentStatusLabel(payment.status)}</span></p>
          </div>
        </div>
      </div>

      <table className="w-full text-xs mb-6">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="text-left py-2 font-bold text-black">#</th>
            <th className="text-left py-2 font-bold text-black">Jasa / Pekerjaan</th>
            <th className="text-center py-2 font-bold text-black">Qty</th>
            <th className="text-right py-2 font-bold text-black">Harga Satuan</th>
            <th className="text-right py-2 font-bold text-black">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.filter(i => i.name.trim()).map((item, index) => (
            <tr key={item.id} className="border-b border-zinc-200">
              <td className="py-2 text-zinc-500">{index + 1}</td>
              <td className="py-2">
                <span className="font-medium text-black">{item.name}</span>
                {item.description && (
                  <span className="block text-zinc-500 text-[10px] mt-0.5">{item.description}</span>
                )}
              </td>
              <td className="py-2 text-center text-zinc-700">{item.qty} {item.unit}</td>
              <td className="py-2 text-right text-zinc-700">{formatRupiah(item.unitPrice)}</td>
              <td className="py-2 text-right font-medium text-black">{formatRupiah(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-64 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-zinc-500">Subtotal</span>
            <span className="text-black">{formatRupiah(subtotal)}</span>
          </div>
          {additionalCosts.filter(c => c.amount > 0).map(cost => (
            <div key={cost.id} className="flex justify-between">
              <span className="text-zinc-500">{cost.name || 'Biaya Tambahan'}</span>
              <span className="text-black">{formatRupiah(cost.amount)}</span>
            </div>
          ))}
          {additionalTotal > 0 && (
            <div className="flex justify-between">
              <span className="text-zinc-500">Total Biaya Tambahan</span>
              <span className="text-black">{formatRupiah(additionalTotal)}</span>
            </div>
          )}
          {discountAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-zinc-500">
                Diskon {discount.type === 'percentage' ? `(${discount.value}%)` : ''}
              </span>
              <span className="text-black">-{formatRupiah(discountAmount)}</span>
            </div>
          )}
          <div className="border-t-2 border-black pt-2 flex justify-between">
            <span className="font-bold text-black text-sm">Total Tagihan</span>
            <span className="font-bold text-black text-sm">{formatRupiah(totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 border border-zinc-200 rounded text-xs space-y-2">
        <h4 className="font-bold text-black uppercase tracking-wider text-[10px]">Informasi Pembayaran</h4>
        {payment.method === 'full' ? (
          <p className="text-zinc-700">Pembayaran Full sebesar <span className="font-semibold text-black">{formatRupiah(totalAmount)}</span></p>
        ) : (
          <div className="space-y-1 text-zinc-700">
            <p>DP Dibayar: <span className="font-semibold text-black">{formatRupiah(payment.dpAmount)}</span></p>
            <p>Sisa Pelunasan: <span className="font-semibold text-black">{formatRupiah(payment.remainingPayment)}</span></p>
          </div>
        )}
        <p className="text-zinc-500 italic">Terbilang: {terbilang(payment.dpAmount)}</p>
      </div>

      {notes && (
        <div className="mt-6 p-4 bg-zinc-50 border border-zinc-200 rounded text-xs">
          <h4 className="font-bold text-black uppercase tracking-wider text-[10px] mb-1">Catatan</h4>
          <p className="text-zinc-700 whitespace-pre-line">{notes}</p>
        </div>
      )}

      <p className="text-center text-[10px] text-zinc-400 mt-16 pt-4 border-t border-zinc-200">Terima kasih atas kepercayaan Anda</p>
    </div>
  );
}
