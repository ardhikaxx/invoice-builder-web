'use client';
import React from 'react';
import { Document } from '@/lib/types';
import { formatRupiah, formatDateIndonesia, getPaymentStatusLabel } from '@/lib/utils';
import { terbilang } from '@/lib/terbilang';

interface KwitansiPreviewProps {
  document: Document;
}

export default function KwitansiPreview({ document }: KwitansiPreviewProps) {
  const { business, customer, payment, notes, documentNumber, date, totalAmount, linkedInvoiceId, pelunasanAmount } = document;

  const displayAmount = pelunasanAmount || payment.paidAmount || totalAmount;

  return (
    <div className="bg-white shadow-lg border border-zinc-200 mx-auto" style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}>
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
          <h2 className="text-3xl font-bold text-black tracking-widest uppercase">Kwitansi</h2>
        </div>
      </div>

      <div className="border-t border-zinc-300 my-4" />

      <div className="flex justify-between mb-8">
        <div>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Diterima Dari</h3>
          <p className="text-sm font-semibold text-black">{customer.name || 'Nama Pelanggan'}</p>
          {customer.phone && <p className="text-xs text-zinc-600 mt-0.5">{customer.phone}</p>}
        </div>
        <div className="text-right">
          <div className="text-xs space-y-1">
            <p><span className="text-zinc-400 inline-block w-24">Nomor:</span> <span className="font-semibold text-black">{documentNumber}</span></p>
            <p><span className="text-zinc-400 inline-block w-24">Tanggal:</span> <span className="text-black">{formatDateIndonesia(date)}</span></p>
            {linkedInvoiceId && (
              <p><span className="text-zinc-400 inline-block w-24">Ref. Invoice:</span> <span className="text-black">{linkedInvoiceId}</span></p>
            )}
          </div>
        </div>
      </div>

      <div className="border border-zinc-300 rounded p-6 mb-6">
        <p className="text-xs text-zinc-500 mb-3">Telah diterima pembayaran dari:</p>
        <p className="text-lg font-bold text-black mb-4">{customer.name || 'Nama Pelanggan'}</p>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-500">Jumlah Pembayaran</span>
            <span className="font-bold text-black text-lg">{formatRupiah(displayAmount)}</span>
          </div>
        </div>

        <div className="border-t border-zinc-200 pt-3">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Terbilang</p>
          <p className="text-xs font-semibold text-black italic">{terbilang(displayAmount)}</p>
        </div>
      </div>

      <div className="mb-6 text-xs space-y-2">
        <div className="flex items-start gap-2">
          <span className="text-zinc-400 shrink-0">Keterangan:</span>
          <span className="text-black">
            {notes || `Pembayaran telah diterima dari ${customer.name || 'pelanggan'}`}
          </span>
        </div>
        {linkedInvoiceId && (
          <div className="flex items-start gap-2">
            <span className="text-zinc-400 shrink-0">Referensi:</span>
            <span className="text-black">Invoice {linkedInvoiceId}</span>
          </div>
        )}
      </div>

      <div className="p-3 bg-zinc-100 rounded text-xs flex items-center gap-2 mb-8">
        <span className="text-zinc-500">Status Pembayaran:</span>
        <span className="font-bold text-black uppercase tracking-wide">{getPaymentStatusLabel(payment.status)}</span>
      </div>

      {notes && (
        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded text-xs mb-8">
          <h4 className="font-bold text-black uppercase tracking-wider text-[10px] mb-1">Catatan</h4>
          <p className="text-zinc-700 whitespace-pre-line">{notes}</p>
        </div>
      )}

      <div className="mt-16 pt-4 border-t border-zinc-200">
        <div className="flex justify-between items-end">
          <div className="text-xs text-zinc-500">
            <p>{formatDateIndonesia(date)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-zinc-400 mb-1">Penerima</p>
            <div className="w-40 border-b border-zinc-400 mb-1" />
            <p className="text-xs font-semibold text-black">{customer.name || 'Pelanggan'}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-zinc-400 mb-1">Penerbit</p>
            <div className="w-40 border-b border-zinc-400 mb-1" />
            <p className="text-xs font-semibold text-black">{business.name}</p>
          </div>
        </div>
        <p className="text-center text-[10px] text-zinc-400 mt-8">Dokumen ini dicetak secara otomatis dari sistem</p>
      </div>
    </div>
  );
}
