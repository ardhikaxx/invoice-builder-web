'use client';
import React, { useState, useMemo } from 'react';
import { Document, DocumentType, PaymentStatus } from '@/lib/types';
import { formatRupiah, formatDateShort, getDocumentTypeLabel } from '@/lib/utils';
import DocumentStatusBadge from '@/components/ui/DocumentStatusBadge';
import { ConfirmationModal } from '@/components/ui/Modal';
import { History, Search, Copy, Edit3, Trash2, FileText } from 'lucide-react';

interface DocumentHistoryProps {
  documents: Document[];
  onLoad: (doc: Document) => void;
  onDuplicate: (doc: Document) => void;
  onDelete: (docId: string) => void;
}

export default function DocumentHistory({ documents, onLoad, onDuplicate, onDelete }: DocumentHistoryProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<DocumentType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'all'>('all');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return documents.filter(doc => {
      const matchSearch = !search ||
        doc.documentNumber.toLowerCase().includes(search.toLowerCase()) ||
        doc.customer.name.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === 'all' || doc.type === filterType;
      const matchStatus = filterStatus === 'all' || doc.payment.status === filterStatus;
      return matchSearch && matchType && matchStatus;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [documents, search, filterType, filterStatus]);

  if (documents.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <History className="w-4 h-4 text-zinc-500" />
        <h3 className="text-sm font-semibold text-zinc-800 uppercase tracking-wide">Riwayat Dokumen</h3>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nomor atau nama pelanggan..."
            className="w-full pl-9 pr-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 transition-colors"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as DocumentType | 'all')}
          className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 bg-white"
        >
          <option value="all">Semua Jenis</option>
          <option value="invoice">Invoice</option>
          <option value="kwitansi">Kwitansi</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as PaymentStatus | 'all')}
          className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 bg-white"
        >
          <option value="all">Semua Status</option>
          <option value="lunas">Lunas</option>
          <option value="lunas_dp">Lunas DP</option>
          <option value="pelunasan">Pelunasan</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8 text-sm text-zinc-500">
          {search || filterType !== 'all' || filterStatus !== 'all'
            ? 'Tidak ada dokumen yang sesuai dengan filter.'
            : 'Belum ada dokumen yang tersimpan.'}
        </div>
      ) : (
        <div className="border border-zinc-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  <th className="text-left px-4 py-3 font-semibold text-zinc-600">Nomor</th>
                  <th className="text-left px-4 py-3 font-semibold text-zinc-600">Tanggal</th>
                  <th className="text-left px-4 py-3 font-semibold text-zinc-600">Pelanggan</th>
                  <th className="text-left px-4 py-3 font-semibold text-zinc-600">Jenis</th>
                  <th className="text-right px-4 py-3 font-semibold text-zinc-600">Total</th>
                  <th className="text-left px-4 py-3 font-semibold text-zinc-600">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-zinc-600">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(doc => (
                  <tr key={doc.id} className="border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-black">{doc.documentNumber}</td>
                    <td className="px-4 py-3 text-zinc-600">{formatDateShort(doc.date)}</td>
                    <td className="px-4 py-3 text-zinc-700">{doc.customer.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-zinc-600">
                        <FileText className="w-3 h-3" />
                        {getDocumentTypeLabel(doc.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-black">{formatRupiah(doc.totalAmount)}</td>
                    <td className="px-4 py-3"><DocumentStatusBadge status={doc.payment.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onLoad(doc)}
                          className="p-1.5 text-zinc-400 hover:text-black rounded hover:bg-zinc-100 transition-colors"
                          title="Buka"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDuplicate(doc)}
                          className="p-1.5 text-zinc-400 hover:text-black rounded hover:bg-zinc-100 transition-colors"
                          title="Gandakan"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(doc.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-500 rounded hover:bg-zinc-100 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) { onDelete(deleteTarget); setDeleteTarget(null); } }}
        title="Hapus Dokumen"
        message="Dokumen yang dihapus tidak dapat dikembalikan. Apakah Anda yakin?"
        confirmLabel="Hapus"
      />
    </div>
  );
}
