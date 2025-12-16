const audio = new Audio("alarm.mp3");
audio.loop = true;

const ackButton = document.getElementById("ackButton");
const resetButton = document.getElementById("resetButton");
const alertListContainer = document.getElementById("alert-list");

//Lottie Fire Animation
const lottieFire = document.getElementById("lottie-fire");

//Lottie Status Animation
const lottieMainIdle = document.getElementById("lottie-main-idle");
const lottieMainFiring = document.getElementById("lottie-main-firing");

//Lottie Status Animation
const lottieIdle = document.getElementById("lottie-idle");
const lottieFiring = document.getElementById("lottie-firing");

// Define Idle/Firing Elements
const idleElements = [lottieMainIdle, lottieIdle];
const firingElements = [lottieMainFiring, lottieFiring, lottieFire];

function setVisualState(isFiring) {
  idleElements.forEach((el) => el.classList.toggle("hidden", isFiring));
  firingElements.forEach((el) => el.classList.toggle("hidden", !isFiring));
}

function sanitizeServiceName(name) {
  if (!name) return "default";
  return name.toLowerCase().replace(/[^a-z0-9-_]/g, "");
}

// Send Ack
ackButton.addEventListener("click", () => {
  console.log("Ack button clicked. Sending to main process...");
  window.ipc.send("ack-alarm");
});

// Send Reset
if (resetButton) {
  resetButton.addEventListener("click", () => {
    console.log("Reset button clicked. Sending to main process...");
    window.ipc.send("reset-all");
  });
}

// Listen to main process
window.ipc.on("server-message", (payload) => {
  const { type, alerts } = payload;
  console.log("Renderer received: ", type, alerts);

  if (type === "play-alarm") {
    console.log("Received 'play-alarm' from main process. Playing audio...");
    audio.play().catch((e) => console.error("Audio play failed: ", e));

    setVisualState(true);

    //Update Alarm List
    renderAlertList(alerts);
  } else if (type === "stop-alarm") {
    console.log("Received 'stop-alarm' from main process. Stopping audio...");
    audio.pause();
    audio.currentTime = 0;

    setVisualState(false);

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
    const serviceName = alert.service || "Unknown";
    const imageName = sanitizeServiceName(serviceName);

    const imagePath = `public/img/${imageName}.png`;
    const defaultImagePath = `public/img/default.png`;

    const item = document.createElement("div");

    item.className =
      "relative group h-24 flex items-center justify-center animate-pulse rounded-lg p-2 transition-colors";

    item.title = `Service: ${serviceName}\nAlert: ${alert.alertname}\n${
      alert.summary || ""
    }`;

    // 4. Buat Elemen Gambar
    const img = document.createElement("img");
    img.src = imagePath;
    img.alt = serviceName;
    img.className = "w-full h-full object-contain drop-shadow-md";

    // 5. LOGIKA FALLBACK (KUNCI PERBAIKAN)
    // Jika gambar gagal dimuat (error), ganti dengan Teks Nama Service
    img.onerror = () => {
      // Hapus elemen gambar yang rusak
      img.remove();

      // Buat elemen teks pengganti
      const textNode = document.createElement("p");
      // Styling teks agar terlihat bagus & muat dalam kotak
      textNode.className =
        "text-white font-bold text-sm text-center uppercase leading-tight drop-shadow-md break-words w-24";
      textNode.innerText = serviceName; // Tampilkan nama service dari webhook

      // Masukkan teks ke dalam container
      item.appendChild(textNode);

      // Opsional: Pertegas border/bg jika gambar tidak ada
      item.classList.add("border-red-600", "bg-red-900/80");
    };

    // Masukkan gambar ke container (default)
    item.appendChild(img);

    alertListContainer.appendChild(item);
  });
}

console.log("Renderer.js loaded and listeners are active.");
