const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

let win;
let alarmAcked = false;

function createWindow() {
  win = new BrowserWindow({
    width: 400,
    height: 200,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile("index.html");
  console.log("Desktop Alarm App Loaded!");
}

//Start Alarm
function triggerAlarm() {
  if (!alarmAcked) {
    console.log("Triggering alarm...");
    win.webContents.send("play-alarm");
  }
}

//Stop Alarm
function stopAlarm() {
  console.log("Stopping alarm...");
  win.webContents.send("stop-alarm");
}

//Webhook Server
const webhookApp = express();
webhookApp.use(bodyParser.json());

webhookApp.post("/alert", (req, res) => {
  const { status, message } = req.body;
  console.log("Webhook received: ", req.body);

  if (status === "firing") {
    alarmAcked = false;
    triggerAlarm();
  } else if (status === "resolved") {
    stopAlarm();
  }

  res.send("OK");
});

webhookApp.listen(5001, () => console.log("Webhook running on port 5001"));

//Ack Button
ipcMain.on("ack-alarm", () => {
  console.log("Ack Button Clicked, Alarm Stopped!");
  alarmAcked = true;
  stopAlarm();
});

app.whenReady().then(createWindow);
