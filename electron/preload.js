const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Add any IPC methods here if needed in the future
    // example: sendNotification: (msg) => ipcRenderer.send('notify', msg)
});
