import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { FileStore } from './FileStore';
import { Note, GraphData } from '../shared/types';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let fileStore: FileStore;
let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  const userDataPath = path.join(app.getPath('home'), '.notes-app');
  fileStore = new FileStore(userDataPath);
  // Initialize settings to ensure dataPath is correct
  await fileStore.readSettings();

  // Register IPC handlers
  ipcMain.handle('settings:load', async () => {
    return fileStore.readSettings();
  });

  ipcMain.handle('settings:save', async (_, settings) => {
    return fileStore.writeSettings(settings);
  });

  ipcMain.handle('dialog:openDirectory', async () => {
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });
    if (result.canceled) {
      return null;
    }
    return result.filePaths[0];
  });

  ipcMain.handle('project:load', async () => {
    return fileStore.readProjectMetadata();
  });
  
  ipcMain.handle('note:save', async (_, note: Note) => {
    return fileStore.writeNote(note);
  });
  
  ipcMain.handle('note:delete', async (_, id: string) => {
    return fileStore.deleteNote(id);
  });
  
  ipcMain.handle('graph:save', async (_, graph: GraphData) => {
    return fileStore.writeGraph(graph);
  });
  
  ipcMain.handle('graph:load', async () => {
    return fileStore.readGraph();
  });
  
  ipcMain.handle('files:list', async () => {
    return fileStore.listNotes();
  });

  fileStore.watch((event, filePath) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('file:changed', { event, filePath });
    }
  });

  ipcMain.handle('ping', () => 'pong');
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
