const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // Security: Disable Node in renderer
      contextIsolation: true, // Security: Enable context isolation
      webSecurity: true
    },
    autoHideMenuBar: true
  });

  // Load the built index.html
  const indexPath = path.join(__dirname, '../dist/index.html');

  // In development, you might want to load the Vite URL instead:
  // win.loadURL('http://localhost:5173'); 
  // But for production builds, verify the file exists first:
  
  win.loadFile(indexPath).catch(e => {
      console.error('Failed to load index.html', e);
      // Fallback for development if file not found (optional)
      // win.loadURL('http://localhost:5173');
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});