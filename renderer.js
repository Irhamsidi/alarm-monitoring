const audio = new Audio("alarm.mp3");
audio.loop = true;

const ackButton = document.getElementById("ackButton");

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
window.ipc.on("play-alarm", () => {
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
});

window.ipc.on("stop-alarm", () => {
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
});

console.log("Renderer.js loaded and listeners are active.");
