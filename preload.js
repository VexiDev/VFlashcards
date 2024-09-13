const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  readDecks: () => ipcRenderer.invoke('readDecks'),
  readDeck: (deckName) => ipcRenderer.invoke('readDeck', deckName),
  writeDeck: (deckName, deckData) => ipcRenderer.invoke('writeDeck', deckName, deckData),
  deleteDeck: (deckName) => ipcRenderer.invoke('deleteDeck', deckName),
  renameDeck: (oldName, newName) => ipcRenderer.invoke('renameDeck', oldName, newName)
});
