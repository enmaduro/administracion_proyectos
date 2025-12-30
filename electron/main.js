import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// --- FIX PARA __dirname EN ES MODULES ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1400, 
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        icon: path.join(__dirname, '../build/icon.ico') 
    });

    // Load the index.html of the app.
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
        
        // --- IMPORTANTE: AQUÍ ESTÁ DESACTIVADO ---
        // mainWindow.webContents.openDevTools(); 
        // --------------------------------------
        
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Remove menu for a more "app-like" feel
    mainWindow.setMenu(null);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});