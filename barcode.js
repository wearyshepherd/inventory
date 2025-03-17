const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const resultValue = document.getElementById("result-value");

const html5QrCode = new Html5Qrcode("reader");
const qrCodeSuccessCallback = (decodedText, decodedResult) => {
  resultValue.textContent = decodedText;
  html5QrCode.stop().then(ignore => {
    console.log("Scan complete.");
  }).catch(err => console.log("Error stopping scanner:", err));
};

startBtn.addEventListener("click", () => {
  html5QrCode.start(
    { facingMode: "environment" }, // rear camera
    {
      fps: 10,
      qrbox: { width: 250, height: 250 }
    },
    qrCodeSuccessCallback
  ).catch(err => console.log("Unable to start scanning:", err));
});

stopBtn.addEventListener("click", () => {
  html5QrCode.stop().then(() => {
    console.log("Scanner stopped.");
  }).catch(err => console.log("Error stopping scanner:", err));
});
