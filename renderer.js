const audio = new Audio("alarm.mp3");
audio.loop = true;

const ackButton = document.getElementById("ackButton");
const alertListContainer = document.getElementById("alert-list");

//Lottie Fire Animation
const lottieFire = document.getElementById("lottie-fire");

//Lottie Status Animation
const lottieMainIdle = document.getElementById("lottie-main-idle");
const lottieMainFiring = document.getElementById("lottie-main-firing");

//Lottie Status Animation
const lottieIdle = document.getElementById("lottie-idle");
const lottieFiring = document.getElementById("lottie-firing");

// Send ack
ackButton.addEventListener("click", () => {
  console.log("Ack button clicked. Sending to main process...");
  window.ipc.send("ack-alarm");
});

// Listen to main process
window.ipc.on("server-message", (payload) => {
  const { type, alerts } = payload;
  console.log("Renderer received: ", type, alerts);

  if (type === "play-alarm") {
    console.log("Received 'play-alarm' from main process. Playing audio...");
    audio.play().catch((e) => console.error("Audio play failed: ", e));

    //Main
    lottieMainIdle.classList.add("hidden");
    lottieMainFiring.classList.remove("hidden");
    //Status
    lottieIdle.classList.add("hidden");
    lottieFiring.classList.remove("hidden");
    //Fire
    lottieFire.classList.remove("hidden");

    //Update Alarm List
    renderAlertList(alerts);
  } else if (type === "stop-alarm") {
    console.log("Received 'stop-alarm' from main process. Stopping audio...");
    audio.pause();
    audio.currentTime = 0;

    //Main
    lottieMainFiring.classList.add("hidden");
    lottieMainIdle.classList.remove("hidden");
    //Status
    lottieFiring.classList.add("hidden");
    lottieIdle.classList.remove("hidden");
    //Fire
    lottieFire.classList.add("hidden");

    //Update Alarm List
    renderAlertList([]);
  } else if (type === "update-list") {
    renderAlertList(alerts);
  }
});

// Render List Function
function renderAlertList(alerts) {
  alertListContainer.innerHTML = "";

  if (!alerts || alerts.length === 0) {
    alertListContainer.innerHTML =
      "<p class='text-gray-500 text-sm italic'>No active alerts</p>";
    return;
  }

  alerts.forEach((alert) => {
    const item = document.createElement("div");
    item.className =
      "bg-red-900/50 border border-red-500/50 p-3 rounded mb-2 text-left animate-pulse";

    item.innerHTML = `
      <div class="font-bold text-red-200 text-sm">${alert.service}</div>
      <div class="text-red-100 text-xs mt-1">Alertname: ${alert.alertname}</div>
    `;

    alertListContainer.appendChild(item);
  });
}

console.log("Renderer.js loaded and listeners are active.");
