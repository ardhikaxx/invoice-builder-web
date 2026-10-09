// Preload: menjembatani SQLite (Node) ke halaman web secara aman.
// Berjalan sebelum halaman dimuat; halaman cukup memakai `window.invoiceDB`
// dengan API yang sama persis seperti localStorage (getItem/setItem/removeItem).
// Bila SQLite gagal diinisialisasi, `window.invoiceDB` = null dan aplikasi
// otomatis fallback ke localStorage.
const { contextBridge, ipcRenderer } = require('electron');
const { openDatabase } = require('./db');

let invoiceDB = null;

try {
  const userDataDir = ipcRenderer.sendSync('get-user-data-path');
  const store = openDatabase(userDataDir);
  invoiceDB = {
    isDesktop: true,
    dbPath: store.path,
    getItem: (key) => {
      try {
        return store.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: (key, value) => {
      try {
        store.setItem(key, value);
      } catch {
        // abaikan: data tetap di memori sesi ini
      }
    },
    removeItem: (key) => {
      try {
        store.removeItem(key);
      } catch {
        // abaikan
      }
    },
  };
} catch (err) {
  console.error('[invoice] SQLite init gagal, fallback ke localStorage:', err);
  invoiceDB = null;
}

contextBridge.exposeInMainWorld('invoiceDB', invoiceDB);
