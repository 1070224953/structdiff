const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 500,
    title: 'StructDiff',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const loadPath = path.join(__dirname, '..', 'dist', 'index.html');
  console.log('Loading:', loadPath);

  mainWindow.loadFile(loadPath);

  mainWindow.webContents.on('did-fail-load', (_event, code, desc) => {
    console.error('Load failed:', code, desc);
  });

  // Open DevTools in dev mode to see errors
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  // No menu bar
  Menu.setApplicationMenu(null);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
