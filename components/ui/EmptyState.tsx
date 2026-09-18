'use client';
import React from 'react';
import { FileText, Receipt } from 'lucide-react';

interface EmptyStateProps {
  onInvoice: () => void;
  onKwitansi: () => void;
}

export default function EmptyState({ onInvoice, onKwitansi }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-6">
        <FileText className="w-8 h-8 text-zinc-400" />
      </div>
      <h2 className="text-xl font-semibold text-black mb-2">Buat Dokumen Pertama Anda</h2>
      <p className="text-zinc-500 text-sm max-w-md mb-8">
        Mulai buat invoice atau kwitansi profesional untuk usaha Anda. Semua proses dilakukan langsung di browser Anda.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onInvoice}
          className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <FileText className="w-4 h-4" />
          Buat Invoice
        </button>
        <button
          onClick={onKwitansi}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-lg border border-zinc-300 hover:bg-zinc-50 transition-colors"
        >
          <Receipt className="w-4 h-4" />
          Buat Kwitansi
        </button>
      </div>
    </div>
  );
}
