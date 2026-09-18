'use client';
import React, { useState, useRef } from 'react';
import { useDocumentState } from '@/hooks/useDocumentState';
import { useToast } from '@/hooks/useToast';
import Builder from '@/components/builder/Builder';
import DocumentHistory from '@/components/history/DocumentHistory';
import EmptyState from '@/components/ui/EmptyState';
import ToastContainer from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import { ConfirmationModal } from '@/components/ui/Modal';
import { FileText, Receipt, Download, Upload, Trash2, FileJson } from 'lucide-react';
import { exportData, importData, saveState as saveAppState } from '@/lib/storage';

export default function Home() {
  const {
    state,
    currentDocument,
    errors,
    startNewDocument,
    loadDocument,
    duplicateDocument,
    updateBusiness,
    updateCustomer,
    updateDocumentInfo,
    addItem,
    updateItem,
    removeItem,
    updateAdditionalCosts,
    updateDiscount,
    updatePayment,
    updateNotes,
    updatePelunasanAmount,
    saveCurrentDocument,
    deleteDocument,
    resetForm,
  } = useDocumentState();

  const { toasts, removeToast, success, error, warning } = useToast();
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-builder-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    success('Data berhasil diekspor');
  };

  const handleImport = () => {
    setImportError('');
    if (!importJson.trim()) {
      setImportError('File tidak boleh kosong');
      return;
    }
    const result = importData(importJson);
    if (result) {
      success('Data berhasil diimpor. Memuat ulang...');
      setShowImportModal(false);
      setImportJson('');
      setTimeout(() => window.location.reload(), 1000);
    } else {
      setImportError('Format data tidak valid. Pastikan file adalah backup dari aplikasi ini.');
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportJson(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDeleteAllHistory = () => {
    const emptyState = { ...state, documents: [] };
    saveAppState(emptyState);
    window.location.reload();
  };

  if (currentDocument) {
    return (
      <>
        <Builder
          currentDocument={currentDocument}
          business={state.business}
          errors={errors}
          onUpdateBusiness={updateBusiness}
          onUpdateCustomer={updateCustomer}
          onUpdateDocumentInfo={updateDocumentInfo}
          onAddItem={addItem}
          onUpdateItem={updateItem}
          onRemoveItem={removeItem}
          onUpdateAdditionalCosts={updateAdditionalCosts}
          onUpdateDiscount={updateDiscount}
          onUpdatePayment={updatePayment}
          onUpdateNotes={updateNotes}
          onUpdatePelunasanAmount={updatePelunasanAmount}
          onSave={saveCurrentDocument}
          onReset={resetForm}
          onBack={resetForm}
          showToast={(msg, type) => {
            if (type === 'success') success(msg);
            else if (type === 'error') error(msg);
            else warning(msg);
          }}
        />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-black tracking-tight">Invoice & Kwitansi Builder</h1>
            <p className="text-xs text-zinc-500">Buat invoice dan kwitansi profesional tanpa login</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleExport} icon={<Download className="w-3.5 h-3.5" />}>
              Export
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowImportModal(true)} icon={<Upload className="w-3.5 h-3.5" />}>
              Import
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {state.documents.length === 0 ? (
          <EmptyState
            onInvoice={() => startNewDocument('invoice')}
            onKwitansi={() => startNewDocument('kwitansi')}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => startNewDocument('invoice')} icon={<FileText className="w-4 h-4" />}>
                Buat Invoice Baru
              </Button>
              <Button variant="secondary" onClick={() => startNewDocument('kwitansi')} icon={<Receipt className="w-4 h-4" />}>
                Buat Kwitansi Baru
              </Button>
            </div>

            <DocumentHistory
              documents={state.documents}
              onLoad={loadDocument}
              onDuplicate={duplicateDocument}
              onDelete={deleteDocument}
            />

            {state.documents.length > 0 && (
              <div className="flex justify-end">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowDeleteAllModal(true)}
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                >
                  Hapus Semua Riwayat
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold text-black mb-2">Import Data</h3>
            <p className="text-sm text-zinc-500 mb-4">Pilih file JSON backup atau tempelkan data langsung.</p>
            <div className="space-y-4">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  icon={<FileJson className="w-3.5 h-3.5" />}
                >
                  Pilih File JSON
                </Button>
              </div>
              <textarea
                value={importJson}
                onChange={(e) => { setImportJson(e.target.value); setImportError(''); }}
                placeholder='{"business": {...}, "documents": [...]}'
                rows={6}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 resize-none"
              />
              {importError && (
                <p className="text-xs text-red-500">{importError}</p>
              )}
              <div className="flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => { setShowImportModal(false); setImportJson(''); setImportError(''); }}>
                  Batal
                </Button>
                <Button onClick={handleImport}>Import</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteAllModal}
        onClose={() => setShowDeleteAllModal(false)}
        onConfirm={handleDeleteAllHistory}
        title="Hapus Semua Riwayat"
        message="Seluruh dokumen yang tersimpan akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus Semua"
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
