const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("alarmAPI", {
  onAlert: (callback) => ipcRenderer.on("trigger-alarm", callback),
});
