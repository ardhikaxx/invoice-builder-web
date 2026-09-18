import { AppState, Business, Document, AppSettings } from './types';
import { generateDocumentNumber } from './utils';

const STORAGE_KEY = 'invoice-builder-data';

const DEFAULT_BUSINESS: Business = {
  name: '',
  phone: '',
  email: '',
  address: '',
  website: '',
};

const DEFAULT_SETTINGS: AppSettings = {
  nextInvoiceNumber: 1,
  nextKwitansiNumber: 1,
};

const DEFAULT_STATE: AppState = {
  business: DEFAULT_BUSINESS,
  documents: [],
  draftDocument: null,
  settings: DEFAULT_SETTINGS,
};

function safeGetStorage(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function safeSetStorage(data: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, data);
  } catch {
    // Storage full or unavailable
  }
}

function safeRemoveStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function loadState(): AppState {
  const raw = safeGetStorage();
  if (!raw) return DEFAULT_STATE;

  try {
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATE,
      ...parsed,
      business: { ...DEFAULT_BUSINESS, ...parsed.business },
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
      documents: Array.isArray(parsed.documents) ? parsed.documents : [],
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state: AppState): void {
  safeSetStorage(JSON.stringify(state));
}

export function clearState(): void {
  safeRemoveStorage();
}

export function saveBusiness(business: Business): AppState {
  const state = loadState();
  const newState = { ...state, business };
  saveState(newState);
  return newState;
}

export function saveDocument(doc: Document): AppState {
  const state = loadState();
  const existingIndex = state.documents.findIndex(d => d.id === doc.id);
  const documents = [...state.documents];

  if (existingIndex >= 0) {
    documents[existingIndex] = doc;
  } else {
    documents.push(doc);
  }

  const newState = { ...state, documents, draftDocument: null };
  saveState(newState);
  return newState;
}

export function deleteDocument(docId: string): AppState {
  const state = loadState();
  const documents = state.documents.filter(d => d.id !== docId);
  const newState = { ...state, documents };
  saveState(newState);
  return newState;
}

export function getNextDocumentNumber(type: 'invoice' | 'kwitansi'): string {
  const state = loadState();
  if (type === 'invoice') {
    return generateDocumentNumber('invoice', state.settings.nextInvoiceNumber);
  }
  return generateDocumentNumber('kwitansi', state.settings.nextKwitansiNumber);
}

export function incrementDocumentNumber(type: 'invoice' | 'kwitansi'): AppState {
  const state = loadState();
  const settings = { ...state.settings };
  if (type === 'invoice') {
    settings.nextInvoiceNumber += 1;
  } else {
    settings.nextKwitansiNumber += 1;
  }
  const newState = { ...state, settings };
  saveState(newState);
  return newState;
}

export function getAllDocumentNumbers(): string[] {
  const state = loadState();
  return state.documents.map(d => d.documentNumber);
}

export function exportData(): string {
  const state = loadState();
  return JSON.stringify(state, null, 2);
}

export function importData(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object') return false;
    if (!Array.isArray(parsed.documents)) return false;

    const state: AppState = {
      ...DEFAULT_STATE,
      ...parsed,
      business: { ...DEFAULT_BUSINESS, ...parsed.business },
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
      documents: parsed.documents,
    };

    saveState(state);
    return true;
  } catch {
    return false;
  }
}
