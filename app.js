// app.js (Version 2 - Minimal Inventory UI with Persistent Barcode Naming & Theme Toggle)

// Theme toggle (Light/Dark mode)
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

themeToggle.onclick = () => {
    body.classList.toggle('dark-mode');
    body.classList.toggle('light-mode');
    themeToggle.textContent = body.classList.contains('dark-mode') ? 'Switch to Light Theme' : 'Switch to Dark Theme';
};

// Barcode Scanner initialization using QuaggaJS
document.addEventListener('DOMContentLoaded', () => {
    const scannerSection = document.querySelector('.scanner-section');

    // Initialize Quagga scanner
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: scannerSection,
            constraints: {
                facingMode: "environment" // use rear camera
            }
        },
        decoder: {
            readers: ["code_128_reader"] // supports standard barcode
        }
    }, (err) => {
        if (err) {
            console.error("Quagga initialization failed:", err);
            alert("Failed to start scanner. Ensure your camera is accessible and try again.");
            return;
        }
        Quagga.start();
    });

    // Barcode detection event
    Quagga.onDetected((data) => {
        const barcode = data.codeResult.code;
        handleScan(barcode);
    });
});

// Handle scanned barcodes and store persistent item names
function handleScan(barcode) {
    let itemName = localStorage.getItem(barcode);

    // If barcode not previously scanned, prompt for a name
    if (!itemName) {
        itemName = prompt("New barcode detected. Please enter item name:");
        if (itemName) {
            localStorage.setItem(barcode, itemName);
        } else {
            itemName = "Unnamed Item";
        }
    }

    displayScanResult(barcode, itemName);
}

// Display barcode scan results in the inventory list
function displayScanResult(barcode, itemName) {
    const inventoryList = document.getElementById('inventory-list');

    // Create new inventory item
    const item = document.createElement('li');
    item.className = 'fade-in'; // optional fade-in animation for aesthetics
    item.textContent = `${itemName} — (${barcode})`;

    inventoryList.appendChild(item);
}
