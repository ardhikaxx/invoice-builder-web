'use client';
import React, { useEffect, useState } from 'react';
import { formatRupiah } from '@/lib/utils';
import {
  QRIS_STATIC_PAYLOAD,
  QRIS_STATIC_IMAGE,
  makeDynamicQris,
  getQrisDataUrl,
} from '@/lib/qris';

interface QrisBoxProps {
  amount: number;
  title?: string;
}

/**
 * Kotak pembayaran QRIS dengan nominal tertanam: saat QR di-scan,
 * aplikasi pembayaran langsung menampilkan nominal — tanpa ketik manual.
 * Bila QR dinamis gagal dibuat, jatuh kembali ke gambar QRIS statis.
 */
export default function QrisBox({ amount, title = 'Bayar via QRIS' }: QrisBoxProps) {
  const rounded = Math.round(amount || 0);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (rounded <= 0) {
      setImgSrc(null);
      return;
    }
    const payload = makeDynamicQris(QRIS_STATIC_PAYLOAD, rounded);
    if (!payload) {
      setImgSrc(QRIS_STATIC_IMAGE);
      return;
    }
    setImgSrc(null);
    getQrisDataUrl(payload).then((url) => {
      if (!cancelled) setImgSrc(url || QRIS_STATIC_IMAGE);
    });
    return () => {
      cancelled = true;
    };
  }, [rounded]);

  if (rounded <= 0) return null;

  return (
    <div className="mt-6 p-4 border border-zinc-200 rounded text-xs">
      <h4 className="font-bold text-black uppercase tracking-wider text-[10px] mb-3">{title}</h4>
      <div className="flex items-center gap-4">
        {imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            alt={`QRIS ${formatRupiah(rounded)}`}
            className="w-36 h-36 shrink-0 border border-zinc-200 rounded"
          />
        ) : (
          <div className="w-36 h-36 shrink-0 border border-zinc-200 rounded bg-zinc-50 animate-pulse" />
        )}
        <div className="space-y-1 min-w-0">
          <p className="text-zinc-500">Nominal</p>
          <p className="font-bold text-black text-base">{formatRupiah(rounded)}</p>
          <p className="text-zinc-500 leading-relaxed">
            Pembayaran bisa melalui QRIS yang tersedia.
          </p>
        </div>
      </div>
    </div>
  );
}
