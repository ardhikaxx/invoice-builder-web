'use client';
import React, { useState } from 'react';
import { ServiceItem } from '@/lib/types';
import { formatRupiah } from '@/lib/utils';
import { Layers, Plus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import CurrencyInput from '@/components/ui/CurrencyInput';
import NumberInput from '@/components/ui/NumberInput';
import { ConfirmationModal } from '@/components/ui/Modal';

interface ServiceItemsFormProps {
  items: ServiceItem[];
  onAddItem: () => void;
  onUpdateItem: (itemId: string, updates: Partial<ServiceItem>) => void;
  onRemoveItem: (itemId: string) => void;
  errors: Record<string, string>;
}

export default function ServiceItemsForm({ items, onAddItem, onUpdateItem, onRemoveItem, errors }: ServiceItemsFormProps) {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-zinc-500" />
          <h3 className="text-sm font-semibold text-zinc-800 uppercase tracking-wide">Rincian Jasa / Pekerjaan</h3>
        </div>
        <Button variant="secondary" size="sm" onClick={onAddItem} icon={<Plus className="w-3.5 h-3.5" />}>
          Tambah Jasa
        </Button>
      </div>

      {errors['items'] && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errors['items']}</p>
      )}

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.id} className="border border-zinc-200 rounded-lg p-4 space-y-3 bg-zinc-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Item #{index + 1}</span>
              {items.length > 1 && (
                <button
                  onClick={() => setDeleteTarget(item.id)}
                  className="p-1 text-zinc-400 hover:text-red-500 rounded transition-colors"
                  title="Hapus item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Nama Jasa/Pekerjaan *</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => onUpdateItem(item.id, { name: e.target.value })}
                  placeholder="Pembuatan Website"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 transition-colors ${
                    errors[`item.${index}.name`] ? 'border-red-400' : 'border-zinc-300'
                  }`}
                />
                {errors[`item.${index}.name`] && (
                  <p className="text-xs text-red-500 mt-1">{errors[`item.${index}.name`]}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Deskripsi / Keterangan</label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => onUpdateItem(item.id, { description: e.target.value })}
                  placeholder="Detail pekerjaan (opsional)"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Qty *</label>
                <NumberInput
                  value={item.qty}
                  onChange={(qty) => onUpdateItem(item.id, { qty })}
                  min={1}
                  className={errors[`item.${index}.qty`] ? 'border-red-400' : ''}
                />
                {errors[`item.${index}.qty`] && (
                  <p className="text-xs text-red-500 mt-1">{errors[`item.${index}.qty`]}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Satuan</label>
                <select
                  value={item.unit}
                  onChange={(e) => onUpdateItem(item.id, { unit: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 transition-colors bg-white"
                >
                  <option value="Project">Project</option>
                  <option value="Bulan">Bulan</option>
                  <option value="Hari">Hari</option>
                  <option value="Jam">Jam</option>
                  <option value="Lembar">Lembar</option>
                  <option value="Pcs">Pcs</option>
                  <option value="Unit">Unit</option>
                  <option value="Set">Set</option>
                  <option value="Paket">Paket</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Harga Satuan *</label>
                <CurrencyInput
                  value={item.unitPrice}
                  onChange={(unitPrice) => onUpdateItem(item.id, { unitPrice })}
                  className={errors[`item.${index}.unitPrice`] ? 'border-red-400' : ''}
                />
                {errors[`item.${index}.unitPrice`] && (
                  <p className="text-xs text-red-500 mt-1">{errors[`item.${index}.unitPrice`]}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Total</label>
                <div className="px-3 py-2 bg-zinc-100 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-800">
                  {formatRupiah(item.total)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) { onRemoveItem(deleteTarget); setDeleteTarget(null); } }}
        title="Hapus Item"
        message="Apakah Anda yakin ingin menghapus item jasa ini?"
        confirmLabel="Hapus"
      />
    </div>
  );
}
