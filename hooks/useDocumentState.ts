'use client';
import { useState, useCallback, useEffect } from 'react';
import { Document, Business, ServiceItem, AdditionalCost, Discount, Payment, DocumentType, AppState } from '@/lib/types';
import { generateId, getTodayDate } from '@/lib/utils';
import { calculateItemTotal, calculateSubtotal, calculateAdditionalCostsTotal, calculateDiscountAmount, calculateTotalAmount, calculatePayment } from '@/lib/calculations';
import { loadState, saveState, saveDocument as saveDocumentToStorage, deleteDocument as deleteDocumentFromStorage, incrementDocumentNumber, getNextDocumentNumber } from '@/lib/storage';

function createEmptyDocument(type: DocumentType): Document {
  return {
    id: generateId(),
    type,
    documentNumber: getNextDocumentNumber(type),
    date: getTodayDate(),
    business: loadState().business,
    customer: { name: '', phone: '' },
    items: [createEmptyItem()],
    additionalCosts: [],
    discount: { type: 'nominal', value: 0 },
    subtotal: 0,
    totalAmount: 0,
    payment: {
      method: 'full',
      dpType: 'percentage',
      dpNominal: 0,
      dpPercentage: 30,
      dpAmount: 0,
      remainingPayment: 0,
      paidAmount: 0,
      status: 'lunas',
    },
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function createEmptyItem(): ServiceItem {
  return {
    id: generateId(),
    name: '',
    description: '',
    qty: 1,
    unit: 'Project',
    unitPrice: 0,
    total: 0,
  };
}

export function useDocumentState() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    saveState(state);
  }, [state]);

  const startNewDocument = useCallback((type: DocumentType) => {
    const doc = createEmptyDocument(type);
    setCurrentDocument(doc);
    setErrors({});
  }, []);

  const loadDocument = useCallback((doc: Document) => {
    setCurrentDocument({ ...doc });
    setErrors({});
  }, []);

  const duplicateDocument = useCallback((doc: Document) => {
    const newDoc: Document = {
      ...doc,
      id: generateId(),
      documentNumber: getNextDocumentNumber(doc.type),
      date: getTodayDate(),
      payment: {
        method: 'full',
        dpType: 'percentage',
        dpNominal: 0,
        dpPercentage: 30,
        dpAmount: 0,
        remainingPayment: 0,
        paidAmount: 0,
        status: 'lunas',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    recalculateDocument(newDoc);
    setCurrentDocument(newDoc);
    setErrors({});
  }, []);

  const updateBusiness = useCallback((business: Business) => {
    setState(prev => {
      const newState = { ...prev, business };
      return newState;
    });
    setCurrentDocument(prev => {
      if (!prev) return null;
      return { ...prev, business };
    });
  }, []);

  const updateCustomer = useCallback((customer: { name: string; phone: string }) => {
    setCurrentDocument(prev => {
      if (!prev) return null;
      return { ...prev, customer };
    });
  }, []);

  const updateDocumentInfo = useCallback((info: { documentNumber?: string; date?: string }) => {
    setCurrentDocument(prev => {
      if (!prev) return null;
      return { ...prev, ...info, updatedAt: new Date().toISOString() };
    });
  }, []);

  const updatePelunasanAmount = useCallback((amount: number) => {
    setCurrentDocument(prev => {
      if (!prev) return null;
      return { ...prev, pelunasanAmount: amount };
    });
  }, []);

  const addItem = useCallback(() => {
    setCurrentDocument(prev => {
      if (!prev) return null;
      const newItems = [...prev.items, createEmptyItem()];
      const doc = { ...prev, items: newItems };
      recalculateDocument(doc);
      return doc;
    });
  }, []);

  const updateItem = useCallback((itemId: string, updates: Partial<ServiceItem>) => {
    setCurrentDocument(prev => {
      if (!prev) return null;
      const newItems = prev.items.map(item => {
        if (item.id !== itemId) return item;
        const updated = { ...item, ...updates };
        if (updates.qty !== undefined || updates.unitPrice !== undefined) {
          updated.total = calculateItemTotal(updated.qty, updated.unitPrice);
        }
        return updated;
      });
      const doc = { ...prev, items: newItems };
      recalculateDocument(doc);
      return doc;
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setCurrentDocument(prev => {
      if (!prev) return null;
      const newItems = prev.items.filter(item => item.id !== itemId);
      if (newItems.length === 0) newItems.push(createEmptyItem());
      const doc = { ...prev, items: newItems };
      recalculateDocument(doc);
      return doc;
    });
  }, []);

  const updateAdditionalCosts = useCallback((costs: AdditionalCost[]) => {
    setCurrentDocument(prev => {
      if (!prev) return null;
      const doc = { ...prev, additionalCosts: costs };
      recalculateDocument(doc);
      return doc;
    });
  }, []);

  const updateDiscount = useCallback((discount: Discount) => {
    setCurrentDocument(prev => {
      if (!prev) return null;
      const doc = { ...prev, discount };
      recalculateDocument(doc);
      return doc;
    });
  }, []);

  const updatePayment = useCallback((payment: Partial<Payment>) => {
    setCurrentDocument(prev => {
      if (!prev) return null;
      const newPayment = { ...prev.payment, ...payment };
      const doc = { ...prev, payment: newPayment };
      recalculateDocument(doc);
      return doc;
    });
  }, []);

  const updateNotes = useCallback((notes: string) => {
    setCurrentDocument(prev => {
      if (!prev) return null;
      return { ...prev, notes };
    });
  }, []);

  function recalculateDocument(doc: Document): void {
    const subtotal = calculateSubtotal(doc.items);
    const additionalCostsTotal = calculateAdditionalCostsTotal(doc.additionalCosts);
    const discountAmount = calculateDiscountAmount(subtotal, doc.discount);
    const totalAmount = calculateTotalAmount(subtotal, additionalCostsTotal, discountAmount);

    doc.subtotal = subtotal;
    doc.totalAmount = totalAmount;

    if (doc.payment.method === 'full') {
      doc.payment = calculatePayment(totalAmount, 'full', 'nominal', 0, 100);
    } else {
      doc.payment = calculatePayment(
        totalAmount,
        'dp',
        doc.payment.dpType,
        doc.payment.dpNominal,
        doc.payment.dpPercentage
      );
    }
  }

  const validateCurrentDocument = useCallback(() => {
    if (!currentDocument) return { valid: false, message: 'Tidak ada dokumen aktif' };

    const newErrors: Record<string, string> = {};

    if (!currentDocument.business.name.trim()) {
      newErrors['business.name'] = 'Nama usaha wajib diisi';
    }
    if (!currentDocument.customer.name.trim()) {
      newErrors['customer.name'] = 'Nama pelanggan wajib diisi';
    }
    if (!currentDocument.customer.phone.trim()) {
      newErrors['customer.phone'] = 'Nomor telepon pelanggan wajib diisi';
    }
    if (!currentDocument.documentNumber.trim()) {
      newErrors['documentNumber'] = 'Nomor dokumen wajib diisi';
    }
    if (!currentDocument.date) {
      newErrors['date'] = 'Tanggal dokumen wajib diisi';
    }

    const validItems = currentDocument.items.filter(item => item.name.trim());
    if (validItems.length === 0) {
      newErrors['items'] = 'Minimal satu item jasa harus ditambahkan';
    }

    currentDocument.items.forEach((item, index) => {
      if (!item.name.trim()) {
        newErrors[`item.${index}.name`] = 'Nama jasa wajib diisi';
      }
      if (item.qty < 1) {
        newErrors[`item.${index}.qty`] = 'Qty minimal 1';
      }
      if (item.unitPrice < 0) {
        newErrors[`item.${index}.unitPrice`] = 'Harga satuan tidak boleh negatif';
      }
    });

    if (currentDocument.payment.method === 'dp') {
      if (currentDocument.payment.dpNominal <= 0) {
        newErrors['payment.dp'] = 'DP harus lebih dari 0';
      }
      if (currentDocument.payment.dpPercentage <= 0 || currentDocument.payment.dpPercentage > 100) {
        newErrors['payment.dp'] = 'Persentase DP harus antara 1% - 100%';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return { valid: false, message: 'Mohon lengkapi data yang diperlukan' };
    }

    return { valid: true, message: '' };
  }, [currentDocument]);

  const saveCurrentDocument = useCallback(() => {
    if (!currentDocument) return { success: false, message: 'Tidak ada dokumen aktif' };

    const validation = validateCurrentDocument();
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    const allNumbers = state.documents.map(d => d.documentNumber);
    const isDuplicate = currentDocument.id && state.documents.some(d => d.id === currentDocument.id);

    if (!isDuplicate && allNumbers.includes(currentDocument.documentNumber)) {
      return { success: false, message: 'Nomor dokumen sudah digunakan' };
    }

    const doc = { ...currentDocument, updatedAt: new Date().toISOString() };
    recalculateDocument(doc);

    const newState = saveDocumentToStorage(doc);
    setState(newState);
    incrementDocumentNumber(doc.type);
    setCurrentDocument(doc);

    return { success: true, message: 'Dokumen berhasil disimpan' };
  }, [currentDocument, state.documents, validateCurrentDocument]);

  const deleteDocument = useCallback((docId: string) => {
    const newState = deleteDocumentFromStorage(docId);
    setState(newState);
    if (currentDocument?.id === docId) {
      setCurrentDocument(null);
    }
  }, [currentDocument]);

  const resetForm = useCallback(() => {
    setCurrentDocument(null);
    setErrors({});
  }, []);

  return {
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
    validateCurrentDocument,
  };
}
