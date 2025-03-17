const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const resultValue = document.getElementById("result-value");
const itemList = document.getElementById("items");

let inventory = JSON.parse(localStorage.getItem("inventory") || "{}");

function updateInventoryUI() {
  itemList.innerHTML = '';
  for (let code in inventory) {
    const item = document.createElement('li');
    item.className = 'inventory-item';
    item.innerHTML = `
      <span>${code} — Quantity: ${inventory[code]}</span>
      <button onclick="editItem('${code}')">+1</button>
    `;
    itemList.appendChild(item);
  }
}

window.editItem = (code) => {
  inventory[code]++;
  localStorage.setItem("inventory", JSON.stringify(inventory));
  updateInventoryUI();
};

updateInventoryUI();

const html5QrCode = new Html5Qrcode("reader");

function onScanSuccess(decodedText, decodedResult) {
  resultValue.textContent = decodedText;
  inventory[decodedText] = (inventory[decodedText] || 0) + 1;
  localStorage.setItem("inventory", JSON.stringify(inventory));
  updateInventoryUI();

  html5QrCode.stop().catch(err => console.log("Stop error:", err));
}

startBtn.onclick = () => {
  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    onScanSuccess
  ).catch(err => alert("Error starting scanner: " + err));
};

stopBtn.onclick = () => {
  html5QrCode.stop().catch(err => alert("Error stopping scanner: " + err));
};
