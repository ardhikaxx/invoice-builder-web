'use client';
import React from 'react';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export default function NumberInput({
  value,
  onChange,
  min = 0,
  max,
  disabled = false,
  className = '',
  id,
}: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    let num = parseInt(raw, 10) || 0;
    if (min !== undefined) num = Math.max(num, min);
    if (max !== undefined) num = Math.min(num, max);
    onChange(num);
  };

  return (
    <input
      id={id}
      type="number"
      value={value || ''}
      onChange={handleChange}
      min={min}
      max={max}
      disabled={disabled}
      className={`w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 disabled:bg-zinc-50 disabled:text-zinc-500 transition-colors ${className}`}
    />
  );
}
