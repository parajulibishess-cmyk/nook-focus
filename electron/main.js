const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

// Check if the app is running in development or production
const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false, // Frameless window for your custom UI
    backgroundColor: '#fcfcf7', // Matches app background
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      devTools: isDev // Enable DevTools only in dev mode
    },
    autoHideMenuBar: true
  });

  // Handle external links to open in the default browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  if (isDev) {
    // DEVELOPMENT: Load the Vite local server
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
    console.log('Electron running in dev mode: loading http://localhost:5173');
  } else {
    // PRODUCTION: Load the built file
    const indexPath = path.join(__dirname, '../dist/index.html');
    win.loadFile(indexPath);
  }
}

app.whenReady().then(createWindow);

// Quit the app immediately when all windows are closed
app.on('window-all-closed', () => {
  app.quit();
});