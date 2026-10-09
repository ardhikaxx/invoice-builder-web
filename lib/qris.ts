import type { Document } from './types';

/**
 * Payload QRIS statis merchant, hasil decode dari `public/qris.jpeg`
 * (terverifikasi: CRC valid, tanpa tag nominal 54).
 *
 * Kalau merchant ganti QRIS: scan/decode gambar QRIS baru, lalu ganti
 * string di bawah ini dengan payload hasil decode tersebut.
 */
export const QRIS_STATIC_PAYLOAD =
  '00020101021126610014COM.GO-JEK.WWW01189360091438465549940210G8465549940303UMI51440014ID.CO.QRIS.WWW0215ID10264739285820303UMI5204899953033605802ID5925Yanuar Ardhika ID, Digita6009BONDOWOSO61056828162140703A01110362163041FBC';

/** Gambar QRIS statis asli sebagai fallback bila QR dinamis gagal dibuat. */
export const QRIS_STATIC_IMAGE = '/qris.jpeg';

/** CRC16-CCITT-FALSE (poly 0x1021, init 0xFFFF), sesuai standar EMVCo/QRIS. */
export function crc16Ccitt(input: string): string {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

interface Tlv {
  tag: string;
  start: number;
  end: number;
}

/** Parse tag-length-value level teratas. Mengembalikan null bila format rusak. */
function parseTopLevelTlv(payload: string): Tlv[] | null {
  const out: Tlv[] = [];
  let i = 0;
  while (i < payload.length) {
    if (i + 4 > payload.length) return null;
    const tag = payload.slice(i, i + 2);
    const len = parseInt(payload.slice(i + 2, i + 4), 10);
    if (!/^\d{2}$/.test(tag) || Number.isNaN(len)) return null;
    const start = i;
    i += 4;
    if (i + len > payload.length) return null;
    i += len;
    out.push({ tag, start, end: i });
  }
  return out.length > 0 ? out : null;
}

/**
 * Bangun payload QRIS dinamis: sisipkan tag 54 (nominal) ke payload statis
 * lalu hitung ulang CRC (tag 63). Mengembalikan null bila input tidak valid.
 *
 * Saat di-scan, aplikasi pembayaran langsung menampilkan nominal — pengguna
 * tidak perlu mengetik nominal secara manual.
 */
export function makeDynamicQris(base: string, amount: number): string | null {
  const clean = (base || '').trim();
  const rounded = Math.round(amount);
  if (!clean || !Number.isFinite(rounded) || rounded <= 0) return null;
  const amountStr = String(rounded);
  if (amountStr.length > 13) return null;

  const tlvs = parseTopLevelTlv(clean);
  if (!tlvs) return null;
  // Sanity check: payload EMV diawali "000201" dan diakhiri tag CRC "63".
  if (clean.slice(0, 6) !== '000201') return null;
  const crcTlv = tlvs[tlvs.length - 1];
  if (crcTlv.tag !== '63') return null;
  const withoutCrc = clean.slice(0, crcTlv.start) + '6304';
  if (crc16Ccitt(withoutCrc) !== clean.slice(crcTlv.start + 4, crcTlv.end).toUpperCase()) {
    return null;
  }

  // Buang tag 54 lama (bila ada) dan CRC lama, sisakan tag lainnya apa adanya.
  const kept = tlvs.filter((t) => t.tag !== '54' && t.tag !== '63');
  // Sisipkan nominal sebelum tag 58 agar urutan tag tetap menaik (53 < 54 < 58).
  let insertAt = kept.length;
  const idx58 = kept.findIndex((t) => t.tag === '58');
  if (idx58 !== -1) insertAt = idx58;
  const head = kept
    .slice(0, insertAt)
    .map((t) => clean.slice(t.start, t.end))
    .join('');
  const tail = kept
    .slice(insertAt)
    .map((t) => clean.slice(t.start, t.end))
    .join('');
  const amountTlv = '54' + String(amountStr.length).padStart(2, '0') + amountStr;
  const withCrcTag = head + amountTlv + tail + '6304';
  return withCrcTag + crc16Ccitt(withCrcTag);
}

/**
 * Nominal yang ditanam ke QR:
 * - invoice full → total tagihan
 * - invoice DP → nominal DP yang sedang dibayar
 * - kwitansi → nominal pada kwitansi
 */
export function resolveQrisAmount(doc: Document): number {
  if (doc.type === 'kwitansi') {
    return Math.round(doc.pelunasanAmount || doc.payment.paidAmount || doc.totalAmount || 0);
  }
  const amt = doc.payment.method === 'full' ? doc.totalAmount : doc.payment.dpAmount;
  return Math.round(amt || 0);
}

/** Payload QRIS dinamis siap-encode untuk sebuah dokumen. Null bila tak valid. */
export function getQrisPayloadForDocument(doc: Document): string | null {
  return makeDynamicQris(QRIS_STATIC_PAYLOAD, resolveQrisAmount(doc));
}

/**
 * Render payload menjadi gambar PNG (data URL) untuk <img> maupun jsPDF.
 * Import `qrcode` dibuat dinamis agar tidak membebani bundle awal.
 */
export async function getQrisDataUrl(payload: string): Promise<string | null> {
  try {
    const { default: QRCode } = await import('qrcode');
    return await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 360,
    });
  } catch {
    return null;
  }
}
