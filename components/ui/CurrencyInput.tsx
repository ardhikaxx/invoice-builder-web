'use client';
import React, { useState, useRef, useMemo } from 'react';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  max?: number;
}

export default function CurrencyInput({
  value,
  onChange,
  placeholder = 'Rp0',
  disabled = false,
  className = '',
  id,
  max,
}: CurrencyInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayValue = useMemo(() => {
    if (isFocused) return undefined;
    return value > 0 ? value.toLocaleString('id-ID') : '';
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const num = parseInt(raw, 10) || 0;
    const clamped = Math.min(num, max ?? Infinity);
    onChange(clamped);
  };

  return (
    <div className={`relative ${className}`}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm pointer-events-none">Rp</span>
      <input
        ref={inputRef}
        id={id}
        type="text"
        inputMode="numeric"
        defaultValue={displayValue}
        key={isFocused ? 'focused' : 'blurred'}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder.replace('Rp', '')}
        disabled={disabled}
        className="w-full pl-10 pr-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 disabled:bg-zinc-50 disabled:text-zinc-500 transition-colors"
      />
    </div>
  );
}
