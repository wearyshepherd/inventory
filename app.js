document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const scanButton = document.getElementById('scan-btn');
    const manualAddButton = document.getElementById('manual-add-btn');
    const exportCSVButton = document.getElementById('export-csv');
    const inventoryList = document.getElementById('inventory-list');
    const scannerPreview = document.getElementById('scanner-preview');

    // 🌙 Theme Toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('light-mode');
        themeToggle.textContent = document.body.classList.contains('dark-mode') ? 'Switch to Light Theme' : 'Switch to Dark Theme';
    });

    // 📷 Start Barcode Scanner
    scanButton.addEventListener('click', () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("Camera access is not supported on this device.");
            return;
        }

        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(function(stream) {
            let video = document.getElementById("scanner-preview");
            video.srcObject = stream;
            video.play();
        })
        .catch(function(err) {
            console.error("Camera error: ", err);
        });    

        Quagga.init({
            inputStream: {
                type: "LiveStream",
                constraints: { width: 640, height: 480, facingMode: "environment" },
                target: scannerPreview
            },
            decoder: { readers: ["ean_reader", "code_128_reader", "upc_reader"] }
        }, (err) => {
            if (err) {
                console.error("Quagga Init Error:", err);
                alert("Error initializing scanner.");
                return;
            }
            Quagga.start();
        });

        Quagga.onDetected((data) => {
            handleBarcode(data.codeResult.code);
        });
    });

    // 🏷️ Handle Barcode Data
    function handleBarcode(barcode) {
        let itemData = JSON.parse(localStorage.getItem(barcode));
        if (!itemData) {
            let name = prompt(`New item detected! Enter a name for: ${barcode}`);
            if (name) {
                itemData = { name: name, quantity: 1 };
                localStorage.setItem(barcode, JSON.stringify(itemData));
            }
        } else {
            itemData.quantity += 1;
            localStorage.setItem(barcode, JSON.stringify(itemData));
        }
        addInventoryItem(barcode, itemData);
    }

    // 📝 Manually Add Items
    manualAddButton.addEventListener('click', () => {
        let itemName = prompt("Enter item name:");
        let itemBarcode = prompt("Enter item barcode (or leave blank for auto-generated):") || Date.now();
        if (itemName) {
            let itemData = { name: itemName, quantity: 1 };
            localStorage.setItem(itemBarcode, JSON.stringify(itemData));
            addInventoryItem(itemBarcode, itemData);
        }
    });

    // 📋 Add Item to Inventory UI (Now includes Quantity Adjustment)
    function addInventoryItem(barcode, itemData) {
        let existingItem = document.getElementById(`item-${barcode}`);
        if (existingItem) {
            existingItem.querySelector(".quantity").textContent = `(${itemData.quantity})`;
            return;
        }

        const listItem = document.createElement("li");
        listItem.id = `item-${barcode}`;
        listItem.innerHTML = `
            <span>${itemData.name} <span class="quantity">(${itemData.quantity})</span></span>
            <button class="decrease-btn">➖</button>
            <button class="increase-btn">➕</button>
            <button class="delete-btn">🗑️ Delete</button>
        `;

        // Increase Quantity
        listItem.querySelector(".increase-btn").addEventListener("click", () => {
            itemData.quantity += 1;
            localStorage.setItem(barcode, JSON.stringify(itemData));
            listItem.querySelector(".quantity").textContent = `(${itemData.quantity})`;
        });

        // Decrease Quantity
        listItem.querySelector(".decrease-btn").addEventListener("click", () => {
            if (itemData.quantity > 1) {
                itemData.quantity -= 1;
                localStorage.setItem(barcode, JSON.stringify(itemData));
                listItem.querySelector(".quantity").textContent = `(${itemData.quantity})`;
            } else {
                alert("Quantity cannot be less than 1. Delete the item if necessary.");
            }
        });

        // Delete Item
        listItem.querySelector(".delete-btn").addEventListener("click", () => {
            if (confirm(`Are you sure you want to delete ${itemData.name}?`)) {
                localStorage.removeItem(barcode);
                listItem.remove();
            }
        });

        inventoryList.appendChild(listItem);
    }

    // 📤 Export Inventory as CSV
    exportCSVButton.addEventListener('click', () => {
        let csvContent = "data:text/csv;charset=utf-8,Item Name,Quantity,Barcode\n";
        Object.keys(localStorage).forEach((barcode) => {
            let itemData = JSON.parse(localStorage.getItem(barcode));
            csvContent += `${itemData.name},${itemData.quantity},${barcode}\n`;
        });

        let encodedUri = encodeURI(csvContent);
        let link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "inventory.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // 🔄 Load Stored Items
    Object.keys(localStorage).forEach((barcode) => {
        let itemData = JSON.parse(localStorage.getItem(barcode));
        addInventoryItem(barcode, itemData);
    });
});
