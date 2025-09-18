"use strict";
const { app, BrowserWindow, globalShortcut, ipcMain, Menu, Tray, nativeImage } = require("electron");
const path = require("path");
const Store = require("electron-store");
const store = new Store();
let mainWindow;
let inputWindow;
let tray;
({
  followNoteToApp: store.get("followNoteToApp", false)
  // false = Return saves and closes, true = Return follows to app
});
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    show: false,
    title: "Dash Notes"
  });
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:3000/main.html");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist-renderer/main.html"));
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  mainWindow.on("show", () => {
    mainWindow.focus();
  });
}
function createInputWindow() {
  inputWindow = new BrowserWindow({
    width: 400,
    height: 100,
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
  if (process.env.NODE_ENV === "development") {
    inputWindow.loadURL("http://localhost:3000/input.html");
  } else {
    inputWindow.loadFile(path.join(__dirname, "../dist-renderer/input.html"));
  }
  inputWindow.on("blur", () => {
    hideInputWindow();
  });
}
function showInputWindow() {
  if (!inputWindow || inputWindow.isDestroyed()) {
    createInputWindow();
  }
  const { screen } = require("electron");
  const display = screen.getPrimaryDisplay();
  const { width, height } = display.workAreaSize;
  inputWindow.setPosition(
    Math.round((width - 400) / 2),
    Math.round((height - 100) / 2)
  );
  inputWindow.show();
  inputWindow.focus();
  inputWindow.webContents.send("focus-input");
}
function hideInputWindow() {
  if (inputWindow && !inputWindow.isDestroyed()) {
    inputWindow.hide();
    inputWindow.webContents.send("clear-input");
  }
}
function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, "../assets/icon.png")).resize({ width: 16, height: 16 });
  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show Dash Notes",
      click: () => {
        if (!mainWindow || mainWindow.isDestroyed()) {
          createMainWindow();
        }
        mainWindow.show();
        mainWindow.focus();
      }
    },
    {
      label: "Quick Note (Ctrl+Space)",
      click: showInputWindow
    },
    { type: "separator" },
    {
      label: "Settings",
      click: () => {
      }
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        app.quit();
      }
    }
  ]);
  tray.setContextMenu(contextMenu);
  tray.setToolTip("Dash Notes - Quick Notes");
}
ipcMain.handle("save-note", async (event, noteText) => {
  const notes = store.get("notes", []);
  const newNote = {
    id: Date.now(),
    text: noteText,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  notes.unshift(newNote);
  store.set("notes", notes);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("refresh-notes");
  }
  return newNote;
});
ipcMain.handle("get-notes", async () => {
  return store.get("notes", []);
});
ipcMain.handle("delete-note", async (event, noteId) => {
  const notes = store.get("notes", []);
  const filteredNotes = notes.filter((note) => note.id !== noteId);
  store.set("notes", filteredNotes);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("refresh-notes");
  }
  return filteredNotes;
});
ipcMain.handle("update-note", async (event, noteId, newText) => {
  const notes = store.get("notes", []);
  const noteIndex = notes.findIndex((note) => note.id === noteId);
  if (noteIndex === -1) {
    throw new Error("Note not found");
  }
  notes[noteIndex].text = newText;
  notes[noteIndex].modifiedAt = (/* @__PURE__ */ new Date()).toISOString();
  store.set("notes", notes);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("refresh-notes");
  }
  return notes[noteIndex];
});
ipcMain.handle("get-config", async () => {
  return {
    followNoteToApp: store.get("followNoteToApp", false),
    darkMode: store.get("darkMode", false)
  };
});
ipcMain.handle("set-config", async (event, newConfig) => {
  Object.keys(newConfig).forEach((key) => {
    store.set(key, newConfig[key]);
  });
  return store.store;
});
ipcMain.on("note-submitted", (event, data) => {
  hideInputWindow();
  if (data.followToApp) {
    if (!mainWindow || mainWindow.isDestroyed()) {
      createMainWindow();
    }
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send("refresh-notes");
  }
});
ipcMain.on("show-quick-note", () => {
  showInputWindow();
});
ipcMain.on("set-theme", (event, theme) => {
  if (inputWindow && !inputWindow.isDestroyed()) {
    inputWindow.webContents.send("set-theme", theme);
  }
});
app.whenReady().then(() => {
  if (process.platform === "darwin") {
    app.dock.show();
  }
  createMainWindow();
  createInputWindow();
  createTray();
  const ret = globalShortcut.register("Control+Space", () => {
    showInputWindow();
  });
  if (!ret) {
    console.log("Global shortcut registration failed");
  }
});
app.on("window-all-closed", (event) => {
  event.preventDefault();
});
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
app.on("activate", () => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createMainWindow();
  }
  mainWindow.show();
  mainWindow.focus();
});
app.on("browser-window-focus", (event, window) => {
  if (window === mainWindow && mainWindow && !mainWindow.isDestroyed() && (!inputWindow || inputWindow.isDestroyed() || !inputWindow.isVisible())) {
    mainWindow.show();
    mainWindow.focus();
  }
});
