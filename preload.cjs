const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('petHost', {
  dragStart: point => ipcRenderer.send('pet:drag-start', point),
  dragMove: point => ipcRenderer.send('pet:drag-move', point),
  dragEnd: () => ipcRenderer.send('pet:drag-end'),
  openMenu: () => ipcRenderer.send('pet:open-menu'),
  onInitialState: callback => ipcRenderer.on('pet:set-initial', (_event, value) => callback(value)),
  onMenuClosed: callback => ipcRenderer.on('pet:menu-closed', callback)
});
