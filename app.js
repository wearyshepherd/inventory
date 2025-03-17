// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');

themeToggle.onclick = () => {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
    themeToggle.textContent = document.body.classList.contains('dark-mode') ? 'Switch to Light Theme' : 'Switch to Dark Theme';
};

// Barcode Scanner setup using QuaggaJS
document.addEventListener('DOMContentLoaded', () => {
    if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
        Quagga.init({
            inputStream: {
                type: "Live",
                target: document.querySelector('.scanner-section'),
                constraints: { facingMode: "environment" }
            },
            decoder: {
                readers: ["code_128_reader"]
            }
        }, (err) => {
            if (err) {
                console.error(err);
                alert("Error initializing scanner");
                return;
            }
            Quagga.start();
        });

        Quagga.onDetected((data) => {
            const barcode = data.codeResult.code;
            handleBarcode(barcode);
        });
    }
});

// Handle Barcode Scanning and Persistent Naming
function handleBarcode(barcode) {
    let itemName = localStorage.getItem(barcode);

    if (!itemName) {
        itemName = prompt("Item not recognized. Enter item name:");
        if (itemName) {
            localStorage.setItem(barcode, itemName);
        }
    }

    displayScanResult(barcode, localStorage.getItem(barcode));
}

// Display scan result in inventory list
function displayScanResult(barcode, itemName) {
    const inventoryList = document.getElementById('inventory-list');
    const listItem = document.createElement('li');
    listItem.textContent = itemName ? `${itemName} (${barcode})` : `Unknown Item (${barcode})`;
    inventoryList.appendChild(listItem);
}
