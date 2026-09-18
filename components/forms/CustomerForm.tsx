'use client';
import React from 'react';
import { User } from 'lucide-react';

interface CustomerFormProps {
  customer: { name: string; phone: string };
  onChange: (customer: { name: string; phone: string }) => void;
  errors: Record<string, string>;
}

export default function CustomerForm({ customer, onChange, errors }: CustomerFormProps) {
  const handleChange = (field: 'name' | 'phone', value: string) => {
    onChange({ ...customer, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <User className="w-4 h-4 text-zinc-500" />
        <h3 className="text-sm font-semibold text-zinc-800 uppercase tracking-wide">Data Pelanggan</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Nama Lengkap *</label>
          <input
            type="text"
            value={customer.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Nama pelanggan"
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 transition-colors ${
              errors['customer.name'] ? 'border-red-400' : 'border-zinc-300'
            }`}
          />
          {errors['customer.name'] && (
            <p className="text-xs text-red-500 mt-1">{errors['customer.name']}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Nomor Telepon *</label>
          <input
            type="tel"
            value={customer.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="081234567890"
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 transition-colors ${
              errors['customer.phone'] ? 'border-red-400' : 'border-zinc-300'
            }`}
          />
          {errors['customer.phone'] && (
            <p className="text-xs text-red-500 mt-1">{errors['customer.phone']}</p>
          )}
        </div>
      </div>
    </div>
  );
}
