const audio = new Audio("alarm.mp3");
audio.loop = true;

const ackButton = document.getElementById("ackButton");

// Send ack
ackButton.addEventListener("click", () => {
  console.log("Ack button clicked. Sending to main process...");
  window.ipc.send("ack-alarm");
});

// Listen to main process
window.ipc.on("play-alarm", () => {
  console.log("Received 'play-alarm' from main process. Playing audio...");
  audio.play().catch((e) => console.error("Audio play failed: ", e));
});

window.ipc.on("stop-alarm", () => {
  console.log("Received 'stop-alarm' from main process. Stopping audio...");
  audio.pause();
  audio.currentTime = 0;
});

console.log("Renderer.js loaded and listeners are active.");
