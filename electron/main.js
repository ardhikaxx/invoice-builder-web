// Entry point aplikasi desktop Invoice Builder (Electron).
// Mode produksi: menjalankan server Next.js secara lokal lalu menampilkannya
// di jendela desktop. Mode development: arahkan ke `next dev` melalui
// env ELECTRON_START_URL atau argumen --startup-url=<url>.
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const http = require('http');

const APP_TITLE = 'Invoice Builder';
app.setAppUserModelId('com.yanuarardhika.invoice-builder');

function getStartupUrlArg() {
  const arg = process.argv.find((a) => a.startsWith('--startup-url='));
  return arg ? arg.slice('--startup-url='.length) : null;
}
const DEV_URL = process.env.ELECTRON_START_URL || getStartupUrlArg();

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

// Dipakai preload untuk mengetahui lokasi berkas database SQLite.
ipcMain.on('get-user-data-path', (event) => {
  event.returnValue = app.getPath('userData');
});

let nextServer = null;

async function startNextServer() {
  const next = require('next');
  const dir = path.join(__dirname, '..');
  const nextApp = next({ dev: false, dir });
  await nextApp.prepare();
  const handler = nextApp.getRequestHandler();
  nextServer = http.createServer((req, res) => handler(req, res));
  await new Promise((resolve) => nextServer.listen(0, '127.0.0.1', resolve));
  return `http://127.0.0.1:${nextServer.address().port}`;
}

function createWindow(url) {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 360,
    minHeight: 600,
    title: APP_TITLE,
    autoHideMenuBar: true,
    backgroundColor: '#f4f4f5',
    icon: path.join(__dirname, '..', 'public', 'logo-invoice.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // preload butuh akses Node (better-sqlite3); konten yang dimuat
      // hanya dari server lokal, bukan web publik.
      sandbox: false,
    },
  });
  win.loadURL(url);
  // Tautan keluar (mis. website portofolio) dibuka di browser, bukan di aplikasi.
  win.webContents.setWindowOpenHandler(({ url: target }) => {
    shell.openExternal(target);
    return { action: 'deny' };
  });
  return win;
}

app.whenReady().then(async () => {
  try {
    const url = DEV_URL || (await startNextServer());
    const win = createWindow(url);
    app.on('second-instance', () => {
      if (win.isMinimized()) win.restore();
      win.focus();
    });
  } catch (err) {
    console.error('[invoice] Gagal menjalankan aplikasi:', err);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (nextServer) nextServer.close();
  if (process.platform !== 'darwin') app.quit();
});
