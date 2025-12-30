import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// --- CONFIGURACIÓN DE RUTAS ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createWindow = () => {
    // Definir la ruta del icono de forma segura para producción y desarrollo
    const iconPath = app.isPackaged
        ? path.join(process.resourcesPath, 'build', 'icon.ico') // En instalación
        : path.join(__dirname, '../build/icon.ico');         // En desarrollo

    const mainWindow = new BrowserWindow({
        width: 1400, 
        height: 900,
        icon: iconPath, // Carga el icono de los obreros con Bs.
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.setMenu(null);

    // Asegura que el icono se asocie a la ventana incluso si hay retraso en la carga
    mainWindow.on('ready-to-show', () => {
        mainWindow.setIcon(iconPath);
    });
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});