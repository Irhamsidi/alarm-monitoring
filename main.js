const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile("index.html");
  console.log("Desktop Alarm App Loaded!");
}

app.whenReady().then(createWindow);
