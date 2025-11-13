const WebSocket = require("ws");

const SERVER_ADDRESS = "ws://localhost:5002";

const audio = new Audio("alarm.mp3");
audio.loop = true;
let ws;

function connect() {
  console.log("Attempting to connect to WebSocket server...");

  try {
    ws = new WebSocket(SERVER_ADDRESS);

    ws.onopen = () => {
      console.log("Connected to Server!");
    };

    ws.onmessage = (event) => {
      const message = event.data;
      console.log(`Message received: ${message}`);

      if (message === "play-alarm") {
        console.log("Playing Alarm...");
        audio.play().catch((e) => console.error("Audio play failed:".e));
      } else if (message === "stop-alarm") {
        console.log("Stopping Alarm...");
        audio.pause();
        audio.currentTime = 0;
      }
    };

    ws.onclose = (event) => {
      console.log(
        `Connection closed (Code: ${event.code}). Trying to reconnect again after 3s...`
      );
      setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      console.error("WebSocket error: ", err.message);
      ws.close();
    };
  } catch (err) {
    console.error("Unable to reach WebSocket Server: ", err);
    setTimeout(connect, 3000);
  }
}

//ACK Button
document.getElementById("ackButton").addEventListener("click", () => {
  console.log("Acknowledge by user, sending 'ack-alarm' to server.");
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send("ack-alarm");
  } else {
    console.warn("Cannot send ACK: WebSocket is not open.");
  }
});

//Start Connection
connect();
