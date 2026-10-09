'use client';
import React from 'react';
import { DocumentType } from '@/lib/types';
import { FileText } from 'lucide-react';
import Button from '@/components/ui/Button';
import { RefreshCw } from 'lucide-react';
import { getNextDocumentNumber } from '@/lib/storage';

interface DocumentInfoFormProps {
  type: DocumentType;
  documentNumber: string;
  date: string;
  onChange: (info: { documentNumber?: string; date?: string }) => void;
  errors: Record<string, string>;
}

export default function DocumentInfoForm({ type, documentNumber, date, onChange, errors }: DocumentInfoFormProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-zinc-500" />
        <h3 className="text-sm font-semibold text-zinc-800 uppercase tracking-wide">Informasi Dokumen</h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="min-w-0">
          <label className="block text-xs font-medium text-zinc-600 mb-1">Nomor {type === 'invoice' ? 'Invoice' : 'Kwitansi'} *</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={documentNumber}
              onChange={(e) => onChange({ documentNumber: e.target.value })}
              placeholder={type === 'invoice' ? 'INV-20260918-001' : 'KWT-20260918-001'}
              className={`min-w-0 flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 transition-colors ${
                errors['documentNumber'] ? 'border-red-400' : 'border-zinc-300'
              }`}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onChange({ documentNumber: getNextDocumentNumber(type) })}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              className="shrink-0 whitespace-nowrap self-center"
            >
              Generate
            </Button>
          </div>
          {errors['documentNumber'] && (
            <p className="text-xs text-red-500 mt-1">{errors['documentNumber']}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Tanggal *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => onChange({ date: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 transition-colors ${
              errors['date'] ? 'border-red-400' : 'border-zinc-300'
            }`}
          />
          {errors['date'] && (
            <p className="text-xs text-red-500 mt-1">{errors['date']}</p>
          )}
        </div>
      </div>
    </div>
  );
}
