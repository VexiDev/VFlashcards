const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: '#121212',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.png')
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  mainWindow.webContents.on('did-fail-load', () => {
    console.error('Failed to load app');
    app.quit();
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Ensure the decks directory exists
  const decksDir = path.join(app.getPath('userData'), 'decks');
  if (!fs.existsSync(decksDir)) {
    fs.mkdirSync(decksDir);
  }

  // IPC Handlers
  ipcMain.handle('readDecks', async () => {
    const files = await fs.promises.readdir(decksDir);
    return files.filter(file => path.extname(file) === '.json');
  });

  ipcMain.handle('readDeck', async (event, deckName) => {
    const filePath = path.join(decksDir, `${deckName}.json`);
    if (fs.existsSync(filePath)) {
      const data = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } else {
      return [];
    }
  });

  ipcMain.handle('writeDeck', async (event, deckName, deckData) => {
    const filePath = path.join(decksDir, `${deckName}.json`);
    await fs.promises.writeFile(filePath, JSON.stringify(deckData, null, 4));
  });

  ipcMain.handle('deleteDeck', async (event, deckName) => {
    const filePath = path.join(decksDir, `${deckName}.json`);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  });

  ipcMain.handle('renameDeck', async (event, oldName, newName) => {
    const oldPath = path.join(decksDir, `${oldName}.json`);
    const newPath = path.join(decksDir, `${newName}.json`);
    if (fs.existsSync(oldPath)) {
      await fs.promises.rename(oldPath, newPath);
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
