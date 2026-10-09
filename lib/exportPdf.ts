import { jsPDF } from 'jspdf';
import type { Document } from './types';
import { formatRupiah, formatDateIndonesia, getPaymentStatusLabel } from './utils';
import { terbilang } from './terbilang';
import {
  QRIS_STATIC_PAYLOAD,
  makeDynamicQris,
  getQrisDataUrl,
  resolveQrisAmount,
} from './qris';
import {
  calculateSubtotal,
  calculateAdditionalCostsTotal,
  calculateDiscountAmount,
  calculateTotalAmount,
} from './calculations';

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 15;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2; // 180
const BOTTOM_MARGIN = 15;

const C_BLACK: [number, number, number] = [0, 0, 0];
const C_DARK: [number, number, number] = [39, 39, 42];
const C_GRAY: [number, number, number] = [113, 113, 122];
const C_LIGHT_GRAY: [number, number, number] = [161, 161, 170];
const C_BORDER: [number, number, number] = [212, 212, 216];
const C_BG: [number, number, number] = [244, 244, 245];

/** Ubah nomor dokumen menjadi nama file yang aman untuk semua OS. */
export function sanitizeFileName(name: string): string {
  const cleaned = (name || '')
    .trim()
    .replace(/[\/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
  // Batasi panjang agar tidak terlalu panjang di filesystem
  return cleaned.slice(0, 120);
}

/** Nama file PDF sesuai nomor invoice, mis. INV-20250101-001.pdf */
export function getPdfFileName(doc: Document): string {
  const base = sanitizeFileName(doc.documentNumber);
  return `${base || 'invoice'}.pdf`;
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_HEIGHT - BOTTOM_MARGIN) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

function drawDivider(doc: jsPDF, y: number) {
  doc.setDrawColor(...C_BORDER);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
}

function drawHeader(doc: jsPDF, businessName: string, businessLines: string[], title: string): number {
  let y = MARGIN;

  // Nama usaha (kiri) & judul dokumen (kanan) sejajar
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C_BLACK);
  doc.setFontSize(16);
  const nameLines = doc.splitTextToSize(businessName || 'Nama Usaha', 110);
  doc.text(nameLines, MARGIN, y + 6);

  doc.setFontSize(22);
  doc.text(title, PAGE_WIDTH - MARGIN, y + 6, { align: 'right' });

  y += 6 + nameLines.length * 6 + 2;

  // Kontak usaha
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C_GRAY);
  for (const line of businessLines) {
    if (!line) continue;
    const wrapped = doc.splitTextToSize(line, 110) as string[];
    for (const w of wrapped) {
      doc.text(w, MARGIN, y);
      y += 4;
    }
  }

  y += 3;
  drawDivider(doc, y);
  y += 6;
  return y;
}

/**
 * Gambar kotak QRIS dengan nominal tertanam (QR dinamis). Saat QR di-scan,
 * aplikasi pembayaran langsung menampilkan nominal â€” tanpa ketik manual.
 * Mengembalikan posisi y setelah kotak. Bila QR tak bisa dibuat, y
 * dikembalikan apa adanya (kotak dilewati).
 */
async function drawQrisSection(docPdf: jsPDF, doc: Document, y: number): Promise<number> {
  const amount = resolveQrisAmount(doc);
  if (amount <= 0) return y;
  const payload = makeDynamicQris(QRIS_STATIC_PAYLOAD, amount);
  if (!payload) return y;
  const imgData = await getQrisDataUrl(payload);
  if (!imgData) return y;

  const QR_SIZE = 34;
  y = ensureSpace(docPdf, y, QR_SIZE + 16);
  const boxStart = y;
  docPdf.setFont('helvetica', 'bold');
  docPdf.setFontSize(7);
  docPdf.setTextColor(...C_BLACK);
  docPdf.text('PEMBAYARAN VIA QRIS', MARGIN + 3, y + 5);

  const imgY = y + 8;
  docPdf.addImage(imgData, 'PNG', MARGIN + 3, imgY, QR_SIZE, QR_SIZE);

  const textX = MARGIN + 3 + QR_SIZE + 4;
  const textW = PAGE_WIDTH - MARGIN - 3 - textX;
  docPdf.setFont('helvetica', 'normal');
  docPdf.setFontSize(8);
  docPdf.setTextColor(...C_GRAY);
  docPdf.text('Nominal', textX, imgY + 5);
  docPdf.setFont('helvetica', 'bold');
  docPdf.setFontSize(11);
  docPdf.setTextColor(...C_BLACK);
  docPdf.text(formatRupiah(amount), textX, imgY + 11);
  docPdf.setFont('helvetica', 'normal');
  docPdf.setFontSize(7.5);
  docPdf.setTextColor(...C_GRAY);
  const noteLines = docPdf.splitTextToSize(
    'Pembayaran bisa melalui QRIS yang tersedia.',
    textW
  ) as string[];
  docPdf.text(noteLines, textX, imgY + 17);

  y = boxStart + QR_SIZE + 14;
  docPdf.setDrawColor(...C_BORDER);
  docPdf.setLineWidth(0.3);
  docPdf.roundedRect(MARGIN, boxStart, CONTENT_WIDTH, y - boxStart, 2, 2);
  return y;
}

function drawFooterThanks(doc: jsPDF) {
  const y = PAGE_HEIGHT - BOTTOM_MARGIN - 4;
  doc.setDrawColor(...C_BORDER);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, y - 4, PAGE_WIDTH - MARGIN, y - 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...C_LIGHT_GRAY);
  doc.text('Terima kasih atas kepercayaan Anda', PAGE_WIDTH / 2, y, { align: 'center' });
}

function drawMetaRight(
  doc: jsPDF,
  y: number,
  rows: { label: string; value: string; bold?: boolean }[]
): number {
  doc.setFontSize(8);
  const labelX = PAGE_WIDTH - MARGIN - 85;
  const valueX = PAGE_WIDTH - MARGIN;
  for (const row of rows) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C_GRAY);
    doc.text(`${row.label}:`, labelX, y);
    doc.setFont('helvetica', row.bold ? 'bold' : 'normal');
    doc.setTextColor(...C_BLACK);
    const wrapped = doc.splitTextToSize(row.value, 55) as string[];
    doc.text(wrapped, valueX, y, { align: 'right' });
    y += 4 + (wrapped.length - 1) * 4;
  }
  return y;
}

async function buildInvoicePdf(docPdf: jsPDF, doc: Document) {
  const { business, customer, payment, notes, documentNumber, date } = doc;

  const items = doc.items.filter((i) => i.name.trim());
  const subtotal = calculateSubtotal(doc.items);
  const additionalTotal = calculateAdditionalCostsTotal(doc.additionalCosts);
  const discountAmount = calculateDiscountAmount(subtotal, doc.discount);
  const totalAmount = calculateTotalAmount(subtotal, additionalTotal, discountAmount);

  const businessLines = [business.phone, business.email, business.address, business.website].filter(Boolean);

  let y = drawHeader(docPdf, business.name, businessLines, 'INVOICE');

  // Bill To + meta
  const leftStartY = y;
  docPdf.setFont('helvetica', 'bold');
  docPdf.setFontSize(7);
  docPdf.setTextColor(...C_LIGHT_GRAY);
  docPdf.text('BILL TO', MARGIN, y);
  y += 5;
  docPdf.setFontSize(10);
  docPdf.setTextColor(...C_BLACK);
  const custLines = docPdf.splitTextToSize(customer.name || 'Nama Pelanggan', 85) as string[];
  docPdf.text(custLines, MARGIN, y);
  y += custLines.length * 5;
  if (customer.phone) {
    docPdf.setFont('helvetica', 'normal');
    docPdf.setFontSize(8);
    docPdf.setTextColor(...C_GRAY);
    docPdf.text(customer.phone, MARGIN, y);
    y += 4;
  }
  const leftEndY = y;

  let rightY = drawMetaRight(docPdf, leftStartY + 5, [
    { label: 'Nomor', value: documentNumber, bold: true },
    { label: 'Tanggal', value: formatDateIndonesia(date) },
    { label: 'Status', value: getPaymentStatusLabel(payment.status), bold: true },
  ]);

  y = Math.max(leftEndY, rightY) + 6;

  // Tabel header
  y = ensureSpace(docPdf, y, 12);
  const colNo = MARGIN;
  const colJasa = MARGIN + 10;
  const colQty = MARGIN + 85;
  const colHarga = MARGIN + 110;
  const colTotal = PAGE_WIDTH - MARGIN;

  docPdf.setFont('helvetica', 'bold');
  docPdf.setFontSize(8);
  docPdf.setTextColor(...C_BLACK);
  docPdf.text('#', colNo, y);
  docPdf.text('Jasa / Pekerjaan', colJasa, y);
  docPdf.text('Qty', colQty + 12.5, y, { align: 'center' });
  docPdf.text('Harga Satuan', colHarga + 30, y, { align: 'right' });
  docPdf.text('Total', colTotal, y, { align: 'right' });
  y += 2;
  docPdf.setDrawColor(...C_BLACK);
  docPdf.setLineWidth(0.6);
  docPdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 5;

  // Tabel isi
  docPdf.setFontSize(8);
  items.forEach((item, idx) => {
    const nameLines = docPdf.splitTextToSize(item.name, 72) as string[];
    const descLines = item.description
      ? (docPdf.splitTextToSize(item.description, 72) as string[])
      : [];
    const rowHeight = Math.max(6, nameLines.length * 4 + descLines.length * 3.2 + 3);

    y = ensureSpace(docPdf, y, rowHeight + 2);
    // Ulangi header tabel jika ganti halaman
    if (y === MARGIN) {
      docPdf.setFont('helvetica', 'bold');
      docPdf.setFontSize(8);
      docPdf.setTextColor(...C_BLACK);
      docPdf.text('#', colNo, y);
      docPdf.text('Jasa / Pekerjaan', colJasa, y);
      docPdf.text('Qty', colQty + 12.5, y, { align: 'center' });
      docPdf.text('Harga Satuan', colHarga + 30, y, { align: 'right' });
      docPdf.text('Total', colTotal, y, { align: 'right' });
      y += 2;
      docPdf.setDrawColor(...C_BLACK);
      docPdf.setLineWidth(0.6);
      docPdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
      y += 5;
      docPdf.setFontSize(8);
    }

    docPdf.setFont('helvetica', 'normal');
    docPdf.setTextColor(...C_GRAY);
    docPdf.text(String(idx + 1), colNo, y);

    docPdf.setTextColor(...C_BLACK);
    docPdf.setFont('helvetica', 'bold');
    docPdf.text(nameLines, colJasa, y);
    let ty = y + nameLines.length * 4;
    if (descLines.length > 0) {
      docPdf.setFont('helvetica', 'normal');
      docPdf.setFontSize(7);
      docPdf.setTextColor(...C_GRAY);
      docPdf.text(descLines, colJasa, ty);
      ty += descLines.length * 3.2;
      docPdf.setFontSize(8);
    }

    docPdf.setFont('helvetica', 'normal');
    docPdf.setTextColor(...C_DARK);
    docPdf.text(`${item.qty} ${item.unit}`, colQty + 12.5, y, { align: 'center' });
    docPdf.text(formatRupiah(item.unitPrice), colHarga + 30, y, { align: 'right' });
    docPdf.setFont('helvetica', 'bold');
    docPdf.setTextColor(...C_BLACK);
    docPdf.text(formatRupiah(item.total), colTotal, y, { align: 'right' });

    y = Math.max(y + 6, ty + 2);
    docPdf.setDrawColor(...C_BORDER);
    docPdf.setLineWidth(0.2);
    docPdf.line(MARGIN, y - 2, PAGE_WIDTH - MARGIN, y - 2);
    y += 3;
  });

  // Ringkasan total (rata kanan)
  y = ensureSpace(docPdf, y, 30);
  const summaryX_label = PAGE_WIDTH - MARGIN - 80;
  const summaryX_value = PAGE_WIDTH - MARGIN;
  const row = (label: string, value: string, bold = false) => {
    y = ensureSpace(docPdf, y, 6);
    docPdf.setFont('helvetica', bold ? 'bold' : 'normal');
    docPdf.setFontSize(bold ? 10 : 8);
    docPdf.setTextColor(...(bold ? C_BLACK : C_GRAY));
    docPdf.text(label, summaryX_label, y);
    docPdf.setTextColor(...C_BLACK);
    docPdf.text(value, summaryX_value, y, { align: 'right' });
    y += bold ? 6 : 5;
  };

  row('Subtotal', formatRupiah(subtotal));
  for (const cost of doc.additionalCosts.filter((c) => c.amount > 0)) {
    const label = (cost.name || 'Biaya Tambahan').slice(0, 30);
    row(label, formatRupiah(cost.amount));
  }
  if (additionalTotal > 0 && doc.additionalCosts.filter((c) => c.amount > 0).length > 1) {
    row('Total Biaya Tambahan', formatRupiah(additionalTotal));
  }
  if (discountAmount > 0) {
    const pct = doc.discount.type === 'percentage' ? ` (${doc.discount.value}%)` : '';
    row(`Diskon${pct}`, `-${formatRupiah(discountAmount)}`);
  }
  // Garis tebal sebelum total
  docPdf.setDrawColor(...C_BLACK);
  docPdf.setLineWidth(0.6);
  docPdf.line(summaryX_label, y, summaryX_value, y);
  y += 6;
  row('Total Tagihan', formatRupiah(totalAmount), true);
  y += 4;

  // Kotak info pembayaran
  y = ensureSpace(docPdf, y, 28);
  const boxStart = y;
  docPdf.setFont('helvetica', 'bold');
  docPdf.setFontSize(7);
  docPdf.setTextColor(...C_BLACK);
  docPdf.text('INFORMASI PEMBAYARAN', MARGIN + 3, y + 5);
  y += 10;
  docPdf.setFont('helvetica', 'normal');
  docPdf.setFontSize(8);
  docPdf.setTextColor(...C_DARK);
  if (payment.method === 'full') {
    const lines = docPdf.splitTextToSize(
      `Pembayaran Full sebesar ${formatRupiah(totalAmount)}`,
      CONTENT_WIDTH - 6
    ) as string[];
    docPdf.text(lines, MARGIN + 3, y);
    y += lines.length * 4 + 2;
  } else {
    docPdf.text(`DP Dibayar: ${formatRupiah(payment.dpAmount)}`, MARGIN + 3, y);
    y += 4.5;
    docPdf.text(`Sisa Pelunasan: ${formatRupiah(payment.remainingPayment)}`, MARGIN + 3, y);
    y += 4.5;
  }
  docPdf.setFontSize(7.5);
  docPdf.setTextColor(...C_GRAY);
  const terbilangLines = docPdf.splitTextToSize(
    `Terbilang: ${terbilang(payment.dpAmount || totalAmount)}`,
    CONTENT_WIDTH - 6
  ) as string[];
  docPdf.text(terbilangLines, MARGIN + 3, y);
  y += terbilangLines.length * 4 + 4;

  const boxH = y - boxStart;
  docPdf.setDrawColor(...C_BORDER);
  docPdf.setLineWidth(0.3);
  docPdf.roundedRect(MARGIN, boxStart, CONTENT_WIDTH, boxH, 2, 2);

  // QRIS dinamis: nominal full / DP tertanam di QR
  y += 4;
  y = await drawQrisSection(docPdf, doc, y);

  // Catatan
  if (notes?.trim()) {
    y += 4;
    y = ensureSpace(docPdf, y, 20);
    const noteStart = y;
    docPdf.setFont('helvetica', 'bold');
    docPdf.setFontSize(7);
    docPdf.setTextColor(...C_BLACK);
    docPdf.text('CATATAN', MARGIN + 3, y + 5);
    y += 10;
    docPdf.setFont('helvetica', 'normal');
    docPdf.setFontSize(8);
    docPdf.setTextColor(...C_DARK);
    const noteLines = docPdf.splitTextToSize(notes, CONTENT_WIDTH - 6) as string[];
    // Jika catatan panjang dan melewati halaman, bagi per halaman
    let li = 0;
    while (li < noteLines.length) {
      const spaceLeft = PAGE_HEIGHT - BOTTOM_MARGIN - y - 4;
      const linesFit = Math.max(1, Math.floor(spaceLeft / 4));
      const chunk = noteLines.slice(li, li + linesFit);
      docPdf.text(chunk, MARGIN + 3, y);
      y += chunk.length * 4;
      li += chunk.length;
      if (li < noteLines.length) {
        // gambar kotak parsial lalu lanjut halaman baru â€” sederhanakan: tutup & buka kotak baru
        const h = y - noteStart;
        docPdf.setDrawColor(...C_BORDER);
        docPdf.setLineWidth(0.3);
        docPdf.roundedRect(MARGIN, noteStart, CONTENT_WIDTH, h, 2, 2);
        docPdf.addPage();
        y = MARGIN;
        // lanjutkan tanpa judul
      }
    }
    y += 4;
    const noteH = y - noteStart;
    docPdf.setFillColor(...C_BG);
    docPdf.setDrawColor(...C_BORDER);
    docPdf.setLineWidth(0.3);
    docPdf.roundedRect(MARGIN, noteStart, CONTENT_WIDTH, noteH, 2, 2, 'FD');
    // gambar ulang teks di atas fill agar tetap terbaca
    docPdf.setFont('helvetica', 'bold');
    docPdf.setFontSize(7);
    docPdf.setTextColor(...C_BLACK);
    docPdf.text('CATATAN', MARGIN + 3, noteStart + 5);
    docPdf.setFont('helvetica', 'normal');
    docPdf.setFontSize(8);
    docPdf.setTextColor(...C_DARK);
    docPdf.text(noteLines, MARGIN + 3, noteStart + 10);
  }

  drawFooterThanks(docPdf);
}

/**
 * Langsung mengunduh dokumen sebagai PDF.
 * Nama file mengikuti nomor dokumen (mis. INV-20250101-001.pdf).
 * Mengembalikan nama file yang dipakai.
 */
export async function downloadDocumentPdf(doc: Document): Promise<string> {
  const docPdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  docPdf.setProperties({
    title: `Invoice ${doc.documentNumber}`,
    subject: doc.documentNumber,
    creator: 'Invoice Builder',
  });

  await buildInvoicePdf(docPdf, doc);

  const fileName = getPdfFileName(doc);
  docPdf.save(fileName);
  return fileName;
}
