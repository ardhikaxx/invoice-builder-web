// Lapisan SQLite untuk aplikasi desktop (dipakai via preload).
// Berkas database otomatis dibuat di folder userData saat aplikasi pertama dibuka,
// jadi hasil install langsung siap dipakai tanpa setup tambahan.
// Modul ini juga bisa di-require langsung dari Node biasa (untuk pengujian).
const path = require('path');
const fs = require('fs');

const DB_FILE_NAME = 'invoice-builder.db';

function openDatabase(userDataDir) {
  const Database = require('better-sqlite3');
  fs.mkdirSync(userDataDir, { recursive: true });
  const dbPath = path.join(userDataDir, DB_FILE_NAME);
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS store (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const getStmt = db.prepare('SELECT value FROM store WHERE key = ?');
  const setStmt = db.prepare(
    'INSERT INTO store (key, value) VALUES (?, ?) ' +
      'ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  );
  const delStmt = db.prepare('DELETE FROM store WHERE key = ?');

  return {
    path: dbPath,
    getItem: (key) => {
      const row = getStmt.get(key);
      return row ? row.value : null;
    },
    setItem: (key, value) => {
      setStmt.run(key, value);
    },
    removeItem: (key) => {
      delStmt.run(key);
    },
    close: () => db.close(),
  };
}

module.exports = { openDatabase, DB_FILE_NAME };
