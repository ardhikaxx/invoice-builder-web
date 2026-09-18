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
import KwitansiPreview from '@/components/preview/KwitansiPreview';
import Button from '@/components/ui/Button';
import { Save, Printer, ArrowLeft, RotateCcw, StickyNote } from 'lucide-react';

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
  onUpdatePelunasanAmount: (amount: number) => void;
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
  onUpdatePelunasanAmount,
  onSave,
  onReset,
  onBack,
  showToast,
}: BuilderProps) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    const result = onSave();
    if (result.success) {
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const subtotal = calculateSubtotal(currentDocument.items);
  const additionalCostsTotal = calculateAdditionalCostsTotal(currentDocument.additionalCosts);
  const discountAmount = calculateDiscountAmount(subtotal, currentDocument.discount);
  const totalAmount = calculateTotalAmount(subtotal, additionalCostsTotal, discountAmount);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="bg-white border-b border-zinc-200 px-4 py-3 no-print">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-sm font-semibold text-black">
                {currentDocument.type === 'invoice' ? 'Invoice Builder' : 'Kwitansi Builder'}
              </h1>
              <p className="text-xs text-zinc-500">{currentDocument.documentNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConfirmReset(true)}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrint}
              icon={<Printer className="w-3.5 h-3.5" />}
            >
              Print
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              icon={<Save className="w-3.5 h-3.5" />}
            >
              Simpan
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto p-4">
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="w-full xl:w-[520px] shrink-0 space-y-6 no-print">
            <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-6">
              <BusinessForm business={business} onChange={onUpdateBusiness} />

              <div className="border-t border-zinc-200" />

              <CustomerForm
                customer={currentDocument.customer}
                onChange={onUpdateCustomer}
                errors={errors}
              />

              <div className="border-t border-zinc-200" />

              <DocumentInfoForm
                type={currentDocument.type}
                documentNumber={currentDocument.documentNumber}
                date={currentDocument.date}
                onChange={onUpdateDocumentInfo}
                errors={errors}
              />
            </div>

            {currentDocument.type === 'invoice' && (
              <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-6">
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
                  documentType={currentDocument.type}
                  errors={errors}
                />
              </div>
            )}

            {currentDocument.type === 'kwitansi' && (
              <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <StickyNote className="w-4 h-4 text-zinc-500" />
                  <h3 className="text-sm font-semibold text-zinc-800 uppercase tracking-wide">Detail Kwitansi</h3>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">Nominal Pembayaran (Rp) *</label>
                  <input
                    type="number"
                    value={currentDocument.pelunasanAmount || ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      onUpdatePelunasanAmount(val);
                      onUpdatePayment({ dpAmount: val, paidAmount: val, remainingPayment: Math.max(0, currentDocument.totalAmount - val) });
                    }}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">Keterangan Pembayaran</label>
                  <textarea
                    value={currentDocument.notes}
                    onChange={(e) => onUpdateNotes(e.target.value)}
                    placeholder="Contoh: Pembayaran telah diterima untuk pembuatan website"
                    rows={3}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 resize-none"
                  />
                </div>
              </div>
            )}

            {currentDocument.type === 'invoice' && (
              <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
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
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="sticky top-4">
              <div className="bg-zinc-200 rounded-xl p-4 overflow-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
                <div ref={previewRef} className="transform-origin-top" style={{ transform: 'scale(0.55)', transformOrigin: 'top center' }}>
                  {currentDocument.type === 'invoice' ? (
                    <InvoicePreview document={currentDocument} />
                  ) : (
                    <KwitansiPreview document={currentDocument} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
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
