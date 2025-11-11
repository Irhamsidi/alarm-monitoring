const { ipcRenderer } = require("electron");

const audio = new Audio("alarm.mp3");
audio.loop = true;

ipcRenderer.on("play-alarm", () => {
  console.log("Playing alarm");
  audio.play();
});

ipcRenderer.on("stop-alarm", () => {
  console.log("Stopping alarm");
  audio.pause();
  audio.currentTime = 0;
});

document.getElementById("ackButton").addEventListener("click", () => {
  ipcRenderer.send("ack-alarm");
});
