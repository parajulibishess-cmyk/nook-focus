const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false // Allows simple require() in your HTML
    },
    autoHideMenuBar: true
  });

  win.loadFile('index.html');
  // win.webContents.openDevTools(); // Uncomment to debug
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});