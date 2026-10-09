# Invoice Builder (Aplikasi Desktop)

Aplikasi desktop **Invoice Builder** untuk usaha jasa pembuatan website — buat invoice profesional dengan preview A4, unduh langsung sebagai PDF (nama file mengikuti nomor invoice), bayar via QRIS dinamis bernominal otomatis, dan riwayat dokumen tersimpan lokal.

## Fitur

- Builder invoice: data usaha, pelanggan, rincian jasa, biaya tambahan, diskon, DP / full, catatan
- Status pembayaran: Lunas, Lunas Pembayaran DP, Lunas Pelunasan
- Preview A4 + unduh PDF langsung (tanpa dialog print)
- QRIS dinamis: nominal full / DP tertanam di QR, tinggal scan
- Riwayat dokumen: cari, filter status, gandakan, hapus, export/import JSON
- Data usaha tersimpan otomatis (nama, kontak, alamat, website portofolio)

## Menjalankan

Versi web (browser, penyimpanan `localStorage`):

```bash
npm install
npm run dev
```

Versi desktop (Electron, penyimpanan SQLite):

```bash
npm run desktop
```

Buka aplikasi desktop yang muncul — data tersimpan di database SQLite
(`invoice-builder.db`) yang otomatis dibuat di folder data aplikasi, jadi
langsung siap dipakai tanpa setup tambahan.

## Build Installer Windows (.exe)

```bash
npm run dist
```

Hasilnya ada di folder `dist/`, contoh: `Invoice Builder Setup 1.0.0.exe`.
Installer NSIS per-user (tanpa perlu admin), membuat shortcut Desktop dan
Start Menu dengan ikon aplikasi. Catatan: karena belum ditandatangani,
Windows SmartScreen dapat menampilkan peringatan saat install (normal untuk
aplikasi distribusi sendiri).

## Teknologi

Next.js + React + Tailwind CSS · Electron · SQLite (`better-sqlite3`) ·
jsPDF · QRIS dinamis (EMVCo + CRC16)
