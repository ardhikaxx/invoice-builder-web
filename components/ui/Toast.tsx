'use client';
import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Toast as ToastType } from '@/lib/types';

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

const iconMap = {
  success: <CheckCircle className="w-4 h-4 text-green-600" />,
  error: <XCircle className="w-4 h-4 text-red-600" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-600" />,
  info: <Info className="w-4 h-4 text-zinc-600" />,
};

const bgMap = {
  success: 'border-green-200 bg-green-50',
  error: 'border-red-200 bg-red-50',
  warning: 'border-amber-200 bg-amber-50',
  info: 'border-zinc-200 bg-white',
};

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] flex flex-col gap-2 sm:left-auto sm:max-w-sm">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-sm ${bgMap[toast.type]} animate-in slide-in-from-right`}
        >
          {iconMap[toast.type]}
          <p className="text-sm text-zinc-800 flex-1">{toast.message}</p>
          <button
            onClick={() => onRemove(toast.id)}
            className="p-0.5 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
