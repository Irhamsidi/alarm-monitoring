const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const WebSocket = require("ws");

const SERVER_ADDRESS = "ws://localhost:5002";
// const SERVER_ADDRESS = "ws://10.16.20.52:5002";
let win;
let ws;

// No User Gesture Policy
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

// Logger Helper
const log = (...args) => {
  const timestamp = new Date().toLocaleString("sv");
  console.log(`[${timestamp}]`, ...args);
};

const logWarn = (...args) => {
  const timestamp = new Date().toLocaleString("sv");
  console.warn(`[${timestamp}] WARN: `, ...args);
};

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 500,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadFile("index.html");
  log("Desktop Alarm App Loaded!");

  // DevTools Debug
  // win.webContents.openDevTools();

  win.webContents.on("did-finish-load", () => {
    log("Renderer UI has finished loading. Connecting to WebSocket...");
    connect();
  });
}

// Webhook Logic
function connect() {
  log("Attempting to connect to WebSocket server...");

  try {
    ws = new WebSocket(SERVER_ADDRESS);

    ws.onopen = () => {
      log("Connected to Server!");
    };

    // Heartbeat: 'ping' listener
    ws.on("ping", () => {
      log("Ping received from server, sending pong.");
      ws.pong();
    });

    ws.onmessage = (event) => {
      console.log(`Message received (raw):`, event.data);
      const message = event.data.toString();
      log(`Message received: ${message}`);

      // Send message to renderer (Play/Stop Audio)
      if (win) {
        if (message === "play-alarm") {
          log("Playing audio....");
          win.webContents.send("play-alarm");
        } else if (message === "stop-alarm") {
          log("Stopping audio....");
          win.webContents.send("stop-alarm");
        }
      }
    };

    ws.onclose = (event) => {
      log(
        `Connection closed (Code: ${event.code}). Trying to reconnect again after 3s....`
      );
      setTimeout(connect, 3000);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error: ", err.message);
      ws.close();
    };
  } catch (err) {
    console.error("Unable to create WebSocket: ", err);
    setTimeout(connect, 3000);
  }
}

// Ack Button Handling
ipcMain.on("ack-alarm", () => {
  log("\n ----- ACK received. Sending to server... -----");
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send("ack-alarm");
    console.log("ACK sent to server.");
  } else {
    logWarn("Cannot send ACK: WebSocket is not open.");
  }
});

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
