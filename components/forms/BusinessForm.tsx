'use client';
import React, { useState } from 'react';
import { Business } from '@/lib/types';
import { Building2, RotateCcw } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ConfirmationModal } from '@/components/ui/Modal';

interface BusinessFormProps {
  business: Business;
  onChange: (business: Business) => void;
}

export default function BusinessForm({ business, onChange }: BusinessFormProps) {
  const [showReset, setShowReset] = useState(false);

  const handleChange = (field: keyof Business, value: string) => {
    onChange({ ...business, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-zinc-500" />
          <h3 className="text-sm font-semibold text-zinc-800 uppercase tracking-wide">Informasi Usaha</h3>
        </div>
        {(business.name || business.phone || business.email || business.address || business.website) && (
          <Button variant="ghost" size="sm" onClick={() => setShowReset(true)} icon={<RotateCcw className="w-3.5 h-3.5" />}>
            Reset
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Nama Usaha *</label>
          <input
            type="text"
            value={business.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="PT Contoh Perusahaan"
            className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Nomor Telepon</label>
          <input
            type="tel"
            value={business.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="081234567890"
            className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Email</label>
          <input
            type="email"
            value={business.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="info@contoh.com"
            className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Website / Media Sosial</label>
          <input
            type="text"
            value={business.website}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="www.contoh.com"
            className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 transition-colors"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-600 mb-1">Alamat</label>
        <textarea
          value={business.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Jl. Contoh No. 123, Jakarta"
          rows={2}
          className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 transition-colors resize-none"
        />
      </div>

      <ConfirmationModal
        isOpen={showReset}
        onClose={() => setShowReset(false)}
        onConfirm={() => {
          onChange({ name: '', phone: '', email: '', address: '', website: '' });
          setShowReset(false);
        }}
        title="Reset Informasi Usaha"
        message="Seluruh data informasi usaha akan dihapus. Apakah Anda yakin?"
        confirmLabel="Reset"
      />
    </div>
  );
}
