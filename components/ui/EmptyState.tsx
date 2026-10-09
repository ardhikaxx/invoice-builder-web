'use client';
import React from 'react';
import { FileText } from 'lucide-react';

interface EmptyStateProps {
  onInvoice: () => void;
}

export default function EmptyState({ onInvoice }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-6">
        <FileText className="w-8 h-8 text-zinc-400" />
      </div>
      <h2 className="text-xl font-semibold text-black mb-2">Buat Invoice Pertama Anda</h2>
      <p className="text-zinc-500 text-sm max-w-md mb-8">
        Mulai buat invoice profesional untuk usaha Anda. Semua proses dilakukan langsung di browser Anda.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button
          onClick={onInvoice}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-zinc-800 transition-colors w-full sm:w-auto"
        >
          <FileText className="w-4 h-4" />
          Buat Invoice
        </button>
      </div>
    </div>
  );
}
