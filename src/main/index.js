const { app, BrowserWindow, globalShortcut, ipcMain, Menu, Tray, nativeImage } = require('electron');
const path = require('path');
const { is } = require('@electron-toolkit/utils');
const Store = require('electron-store');

const store = new Store();

let mainWindow;
let inputWindow;
let tray;

// Configuration defaults
const config = {
  followNoteToApp: store.get('followNoteToApp', false) // false = Return saves and closes, true = Return follows to app
};

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    show: false,
    title: 'Dash Notes'
  });

  // Load the remote URL for development or the local html file for production
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/main.html');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/main.html'));
  }

  // Handle window closed - hide instead of destroy for dock icon functionality
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle window being brought to front
  mainWindow.on('show', () => {
    mainWindow.focus();
  });
}

function createInputWindow() {
  inputWindow = new BrowserWindow({
    width: 600,
    height: 120,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    show: false,
    transparent: true
  });

  // Load the remote URL for development or the local html file for production
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    inputWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/input.html');
  } else {
    inputWindow.loadFile(path.join(__dirname, '../renderer/input.html'));
  }

  // Hide window when it loses focus
  inputWindow.on('blur', () => {
    hideInputWindow();
  });
}

function showInputWindow() {
  if (!inputWindow || inputWindow.isDestroyed()) {
    createInputWindow();
  }

  // Center the window on screen
  const { screen } = require('electron');
  const display = screen.getPrimaryDisplay();
  const { width, height } = display.workAreaSize;

  inputWindow.setPosition(
    Math.round((width - 600) / 2),
    Math.round((height - 120) / 2)
  );

  inputWindow.show();
  inputWindow.focus();
  inputWindow.webContents.send('focus-input');
}

function hideInputWindow() {
  if (inputWindow && !inputWindow.isDestroyed()) {
    inputWindow.hide();
    inputWindow.webContents.send('clear-input');
  }
}

function createTray() {
  // Create a simple tray icon (we'll use a basic icon for now)
  const icon = nativeImage.createFromPath(path.join(__dirname, '../assets/icon.png')).resize({ width: 16, height: 16 });
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Dash Notes',
      click: () => {
        if (!mainWindow || mainWindow.isDestroyed()) {
          createMainWindow();
        }
        mainWindow.show();
        mainWindow.focus();
      }
    },
    {
      label: 'Quick Note (Ctrl+Space)',
      click: showInputWindow
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: () => {
        // TODO: Open settings window
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('Dash Notes - Quick Notes');
}

// IPC handlers
ipcMain.handle('save-note', async (event, noteText) => {
  const notes = store.get('notes', []);
  const newNote = {
    id: Date.now(),
    text: noteText,
    createdAt: new Date().toISOString()
  };

  notes.unshift(newNote); // Add to beginning
  store.set('notes', notes);

  // Refresh main window if it exists and is visible
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('refresh-notes');
  }

  return newNote;
});

ipcMain.handle('get-notes', async () => {
  return store.get('notes', []);
});

ipcMain.handle('delete-note', async (event, noteId) => {
  const notes = store.get('notes', []);
  const filteredNotes = notes.filter(note => note.id !== noteId);
  store.set('notes', filteredNotes);

  // Refresh main window if it exists and is visible
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('refresh-notes');
  }

  return filteredNotes;
});

ipcMain.handle('update-note', async (event, noteId, newText) => {
  const notes = store.get('notes', []);
  const noteIndex = notes.findIndex(note => note.id === noteId);

  if (noteIndex === -1) {
    throw new Error('Note not found');
  }

  // Update the note text and modified timestamp
  notes[noteIndex].text = newText;
  notes[noteIndex].modifiedAt = new Date().toISOString();

  store.set('notes', notes);

  // Refresh main window if it exists and is visible
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('refresh-notes');
  }

  return notes[noteIndex];
});

ipcMain.handle('get-config', async () => {
  return {
    followNoteToApp: store.get('followNoteToApp', false),
    darkMode: store.get('darkMode', false)
  };
});

ipcMain.handle('set-config', async (event, newConfig) => {
  Object.keys(newConfig).forEach(key => {
    store.set(key, newConfig[key]);
  });
  return store.store;
});

ipcMain.on('note-submitted', (event, data) => {
  hideInputWindow();

  if (data.followToApp) {
    if (!mainWindow || mainWindow.isDestroyed()) {
      createMainWindow();
    }
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send('refresh-notes');
  }
});

ipcMain.on('show-quick-note', () => {
  showInputWindow();
});

ipcMain.on('set-theme', (event, theme) => {
  // Update input window theme if it exists
  if (inputWindow && !inputWindow.isDestroyed()) {
    inputWindow.webContents.send('set-theme', theme);
  }
});

app.whenReady().then(() => {
  // Ensure dock icon is always visible on macOS
  if (process.platform === 'darwin') {
    app.dock.show();
  }

  createMainWindow();
  createInputWindow();
  createTray();

  // Register global shortcut
  const ret = globalShortcut.register('Control+Space', () => {
    showInputWindow();
  });

  if (!ret) {
    console.log('Global shortcut registration failed');
  }
});

app.on('window-all-closed', (event) => {
  event.preventDefault(); // Prevent app from quitting
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('activate', () => {
  // On macOS, show main window when dock icon is clicked
  if (!mainWindow || mainWindow.isDestroyed()) {
    createMainWindow();
  }
  mainWindow.show();
  mainWindow.focus();
});

// Handle app being brought to foreground (Alt+Tab) - but not when input window is active
app.on('browser-window-focus', (event, window) => {
  // Only show main window if:
  // 1. It's the main window being focused
  // 2. The input window is not currently shown
  if (window === mainWindow && mainWindow && !mainWindow.isDestroyed() &&
      (!inputWindow || inputWindow.isDestroyed() || !inputWindow.isVisible())) {
    mainWindow.show();
    mainWindow.focus();
  }
});