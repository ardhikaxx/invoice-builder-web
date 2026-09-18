'use client';
import React from 'react';

type Status = 'lunas' | 'lunas_dp' | 'pelunasan';

interface DocumentStatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md';
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  lunas: {
    label: 'LUNAS',
    className: 'bg-zinc-900 text-white',
  },
  lunas_dp: {
    label: 'LUNAS DP',
    className: 'bg-zinc-600 text-white',
  },
  pelunasan: {
    label: 'PELUNASAN',
    className: 'bg-zinc-800 text-white',
  },
};

export default function DocumentStatusBadge({ status, size = 'sm' }: DocumentStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.lunas;
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-semibold tracking-wide rounded ${sizeClass} ${config.className}`}>
      {config.label}
    </span>
  );
}
