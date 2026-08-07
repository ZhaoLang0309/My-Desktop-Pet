const { app, BrowserWindow, Menu, ipcMain, screen } = require('electron');
const path = require('node:path');

let petWindow;
let dragOrigin;

function createWindow() {
  petWindow = new BrowserWindow({
    width: 192,
    height: 208,
    frame: false,
    transparent: true,
    resizable: false,
    hasShadow: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  petWindow.setAlwaysOnTop(true, 'floating');
  petWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  petWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => app.quit());

ipcMain.on('pet:drag-start', (_event, point) => {
  const [x, y] = petWindow.getPosition();
  dragOrigin = { pointerX: point.x, pointerY: point.y, x, y };
});
ipcMain.on('pet:drag-move', (_event, point) => {
  if (!dragOrigin) return;
  const display = screen.getDisplayNearestPoint({ x: point.x, y: point.y }).workArea;
  const x = Math.max(display.x, Math.min(display.x + display.width - 192, dragOrigin.x + point.x - dragOrigin.pointerX));
  const y = Math.max(display.y, Math.min(display.y + display.height - 208, dragOrigin.y + point.y - dragOrigin.pointerY));
  petWindow.setPosition(Math.round(x), Math.round(y), false);
});
ipcMain.on('pet:drag-end', () => { dragOrigin = undefined; });
ipcMain.on('pet:open-menu', event => {
  const states = ['Idle', 'Wave', 'Sad', 'Working', 'Review'];
  const menu = Menu.buildFromTemplate([
    ...states.map(label => ({
      label,
      click: () => event.sender.send('pet:set-initial', label.toLowerCase())
    })),
    { type: 'separator' },
    { label: 'Close Mochi Pet', click: () => app.quit() }
  ]);
  menu.popup({ window: petWindow, callback: () => event.sender.send('pet:menu-closed') });
});
