'use client';
import React, { useState } from 'react';
import { Discount } from '@/lib/types';
import { Tag } from 'lucide-react';

interface DiscountFormProps {
  discount: Discount;
  onChange: (discount: Discount) => void;
  subtotal: number;
}

export default function DiscountForm({ discount, onChange, subtotal }: DiscountFormProps) {
  const [expanded, setExpanded] = useState(discount.value > 0);

  const handleChange = (updates: Partial<Discount>) => {
    const newDiscount = { ...discount, ...updates };
    if (newDiscount.type === 'percentage') {
      newDiscount.value = Math.min(Math.max(newDiscount.value, 0), 100);
    } else {
      newDiscount.value = Math.min(Math.max(newDiscount.value, 0), subtotal);
    }
    onChange(newDiscount);
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wide hover:text-zinc-800 transition-colors"
      >
        <Tag className="w-4 h-4" />
        Diskon (Opsional)
        <span className="text-zinc-400">{expanded ? '▾' : '▸'}</span>
      </button>

      {expanded && (
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-zinc-600 mb-1">Tipe Diskon</label>
            <select
              value={discount.type}
              onChange={(e) => handleChange({ type: e.target.value as 'nominal' | 'percentage' })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 transition-colors bg-white"
            >
              <option value="nominal">Nominal (Rp)</option>
              <option value="percentage">Persentase (%)</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              {discount.type === 'percentage' ? 'Persentase' : 'Nominal'}
            </label>
            <div className="relative">
              <input
                type="number"
                value={discount.value || ''}
                onChange={(e) => handleChange({ value: parseFloat(e.target.value) || 0 })}
                min={0}
                max={discount.type === 'percentage' ? 100 : subtotal}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">
                {discount.type === 'percentage' ? '%' : 'Rp'}
              </span>
            </div>
          </div>
        </div>
      )}

      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          + Tambah diskon
        </button>
      )}
    </div>
  );
}
