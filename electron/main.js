const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
    autoHideMenuBar: true
  });

  // This is the relative path from 'electron/main.js' to 'dist/index.html'
  // It works for both Dev (source files) and Prod (asar archive)
  const indexPath = path.join(__dirname, '../dist/index.html');

  console.log('Loading:', indexPath);

  win.loadFile(indexPath).catch(e => {
      dialog.showErrorBox('Missing File', `Could not load app.\nPath: ${indexPath}\nError: ${e.message}`);
  });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });