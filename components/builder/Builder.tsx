'use client';
import React, { useState, useRef } from 'react';
import { Document, Business, ServiceItem, AdditionalCost, Discount, Payment } from '@/lib/types';
import { formatRupiah } from '@/lib/utils';
import { calculateSubtotal, calculateAdditionalCostsTotal, calculateDiscountAmount, calculateTotalAmount } from '@/lib/calculations';
import BusinessForm from '@/components/forms/BusinessForm';
import CustomerForm from '@/components/forms/CustomerForm';
import DocumentInfoForm from '@/components/forms/DocumentInfoForm';
import ServiceItemsForm from '@/components/forms/ServiceItemsForm';
import AdditionalCostForm from '@/components/forms/AdditionalCostForm';
import DiscountForm from '@/components/forms/DiscountForm';
import PaymentForm from '@/components/forms/PaymentForm';
import InvoicePreview from '@/components/preview/InvoicePreview';
import Button from '@/components/ui/Button';
import { downloadDocumentPdf } from '@/lib/exportPdf';
import { Save, Printer, ArrowLeft, RotateCcw, StickyNote, ZoomIn, ZoomOut, Loader2 } from 'lucide-react';

interface BuilderProps {
  currentDocument: Document;
  business: Business;
  errors: Record<string, string>;
  onUpdateBusiness: (business: Business) => void;
  onUpdateCustomer: (customer: { name: string; phone: string }) => void;
  onUpdateDocumentInfo: (info: { documentNumber?: string; date?: string }) => void;
  onAddItem: () => void;
  onUpdateItem: (itemId: string, updates: Partial<ServiceItem>) => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateAdditionalCosts: (costs: AdditionalCost[]) => void;
  onUpdateDiscount: (discount: Discount) => void;
  onUpdatePayment: (payment: Partial<Payment>) => void;
  onUpdateNotes: (notes: string) => void;
  onSave: () => { success: boolean; message: string };
  onReset: () => void;
  onBack: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'warning') => void;
}

export default function Builder({
  currentDocument,
  business,
  errors,
  onUpdateBusiness,
  onUpdateCustomer,
  onUpdateDocumentInfo,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onUpdateAdditionalCosts,
  onUpdateDiscount,
  onUpdatePayment,
  onUpdateNotes,
  onSave,
  onReset,
  onBack,
  showToast,
}: BuilderProps) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    const result = onSave();
    if (result.success) {
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  const handlePrint = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      // Langsung unduh sebagai PDF, nama file = nomor dokumen (mis. INV-...-.pdf)
      const fileName = await downloadDocumentPdf(currentDocument);
      showToast(`Berhasil mengunduh ${fileName}`, 'success');
    } catch (err) {
      console.error('Gagal mengunduh PDF:', err);
      showToast('Gagal mengunduh PDF. Coba lagi.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const subtotal = calculateSubtotal(currentDocument.items);
  const additionalCostsTotal = calculateAdditionalCostsTotal(currentDocument.additionalCosts);
  const discountAmount = calculateDiscountAmount(subtotal, currentDocument.discount);
  const totalAmount = calculateTotalAmount(subtotal, additionalCostsTotal, discountAmount);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="bg-white border-b border-zinc-200 px-4 py-3 no-print">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={onBack}
              className="p-2 shrink-0 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-black truncate">
                Invoice Builder
              </h1>
              <p className="text-xs text-zinc-500 truncate">{currentDocument.documentNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConfirmReset(true)}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              <span className="hidden sm:inline">Reset</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrint}
              disabled={isDownloading}
              icon={isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
            >
              <span className="hidden sm:inline">{isDownloading ? 'Mengunduh...' : 'Print'}</span>
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              icon={<Save className="w-3.5 h-3.5" />}
            >
              <span className="hidden sm:inline">Simpan</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto p-4">
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="w-full xl:w-[520px] shrink-0 space-y-6 no-print">
            <div className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-6 space-y-6">
              <BusinessForm business={business} onChange={onUpdateBusiness} />

              <div className="border-t border-zinc-200" />

              <CustomerForm
                customer={currentDocument.customer}
                onChange={onUpdateCustomer}
                errors={errors}
              />

              <div className="border-t border-zinc-200" />

              <DocumentInfoForm
                documentNumber={currentDocument.documentNumber}
                date={currentDocument.date}
                onChange={onUpdateDocumentInfo}
                errors={errors}
              />
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-6 space-y-6">
                <ServiceItemsForm
                  items={currentDocument.items}
                  onAddItem={onAddItem}
                  onUpdateItem={onUpdateItem}
                  onRemoveItem={onRemoveItem}
                  errors={errors}
                />

                <div className="border-t border-zinc-200" />

                <AdditionalCostForm
                  costs={currentDocument.additionalCosts}
                  onChange={onUpdateAdditionalCosts}
                />

                <div className="border-t border-zinc-200" />

                <DiscountForm
                  discount={currentDocument.discount}
                  onChange={onUpdateDiscount}
                  subtotal={subtotal}
                />

                <div className="border-t border-zinc-200" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Subtotal</span>
                    <span className="font-medium text-black">{formatRupiah(subtotal)}</span>
                  </div>
                  {additionalCostsTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Biaya Tambahan</span>
                      <span className="font-medium text-black">{formatRupiah(additionalCostsTotal)}</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Diskon</span>
                      <span className="font-medium text-black">-{formatRupiah(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-zinc-200">
                    <span className="font-bold text-black">Total Tagihan</span>
                    <span className="font-bold text-black">{formatRupiah(totalAmount)}</span>
                  </div>
                </div>

                <div className="border-t border-zinc-200" />

                <PaymentForm
                  payment={currentDocument.payment}
                  totalAmount={totalAmount}
                  onChange={onUpdatePayment}
                  errors={errors}
                />
              </div>

            <div className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-zinc-500" />
                <h3 className="text-sm font-semibold text-zinc-800 uppercase tracking-wide">Catatan (Opsional)</h3>
              </div>
              <textarea
                value={currentDocument.notes}
                onChange={(e) => onUpdateNotes(e.target.value)}
                placeholder="Informasi pembayaran, syarat, atau catatan lainnya..."
                rows={3}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 resize-none"
              />
            </div>
          </div>

          <div className="flex-1 min-w-0" id="print-area">
            <div className="sticky top-4">
              <div className="bg-zinc-200 rounded-xl p-4 overflow-auto preview-container" style={{ maxHeight: 'calc(100vh - 120px)' }}>
                <div className="flex items-center justify-center gap-2 mb-3 no-print">
                  <button
                    onClick={() => setZoom((z) => Math.max(0.5, Math.round((z - 0.1) * 10) / 10))}
                    className="p-1.5 bg-white border border-zinc-300 rounded-lg text-zinc-600 hover:text-black hover:border-zinc-400 transition-colors"
                    title="Perkecil"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setZoom(1)}
                    className="px-2.5 py-1 bg-white border border-zinc-300 rounded-lg text-xs font-medium text-zinc-700 hover:text-black min-w-[52px]"
                    title="Reset ke 100%"
                  >
                    {Math.round(zoom * 100)}%
                  </button>
                  <button
                    onClick={() => setZoom((z) => Math.min(1.5, Math.round((z + 0.1) * 10) / 10))}
                    className="p-1.5 bg-white border border-zinc-300 rounded-lg text-zinc-600 hover:text-black hover:border-zinc-400 transition-colors"
                    title="Perbesar"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex justify-center preview-scale-wrapper">
                  <div ref={previewRef} className="preview-zoom-wrapper" style={{ zoom } as React.CSSProperties}>
                    <InvoicePreview document={currentDocument} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-black mb-2">Reset Form</h3>
            <p className="text-sm text-zinc-600 mb-6">Seluruh data yang belum disimpan akan hilang. Apakah Anda yakin?</p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowConfirmReset(false)}>Batal</Button>
              <Button variant="danger" onClick={() => { onReset(); setShowConfirmReset(false); }}>Reset</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
