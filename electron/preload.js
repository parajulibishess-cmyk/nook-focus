const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('minimize-window'),
  maximize: () => ipcRenderer.send('maximize-window'),
  close: () => ipcRenderer.send('close-window'),
  // NEW: Listeners for window state
  onMaximized: (callback) => ipcRenderer.on('window-maximized', () => callback()),
  onUnmaximized: (callback) => ipcRenderer.on('window-unmaximized', () => callback())
});