'use client';
import React, { useState } from 'react';
import { AdditionalCost } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { Plus, Trash2, DollarSign } from 'lucide-react';
import Button from '@/components/ui/Button';
import CurrencyInput from '@/components/ui/CurrencyInput';

interface AdditionalCostFormProps {
  costs: AdditionalCost[];
  onChange: (costs: AdditionalCost[]) => void;
}

export default function AdditionalCostForm({ costs, onChange }: AdditionalCostFormProps) {
  const [expanded, setExpanded] = useState(costs.length > 0);

  const addCost = () => {
    onChange([...costs, { id: generateId(), name: '', amount: 0 }]);
    setExpanded(true);
  };

  const updateCost = (id: string, updates: Partial<AdditionalCost>) => {
    onChange(costs.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const removeCost = (id: string) => {
    onChange(costs.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wide hover:text-zinc-800 transition-colors"
      >
        <DollarSign className="w-4 h-4" />
        Biaya Tambahan (Opsional)
        <span className="text-zinc-400">{expanded ? '▾' : '▸'}</span>
      </button>

      {expanded && (
        <div className="space-y-2">
          {costs.map(cost => (
            <div key={cost.id} className="flex gap-2 items-start">
              <input
                type="text"
                value={cost.name}
                onChange={(e) => updateCost(cost.id, { name: e.target.value })}
                placeholder="Nama biaya"
                className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 transition-colors"
              />
              <CurrencyInput
                value={cost.amount}
                onChange={(amount) => updateCost(cost.id, { amount })}
                className="flex-1"
              />
              <button
                onClick={() => removeCost(cost.id)}
                className="p-2 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <Button variant="ghost" size="sm" onClick={addCost} icon={<Plus className="w-3.5 h-3.5" />}>
            Tambah Biaya
          </Button>
        </div>
      )}

      {!expanded && costs.length === 0 && (
        <Button variant="ghost" size="sm" onClick={addCost} icon={<Plus className="w-3.5 h-3.5" />}>
          Tambah Biaya Tambahan
        </Button>
      )}
    </div>
  );
}
