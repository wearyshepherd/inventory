document.addEventListener("DOMContentLoaded", () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const scanBtn = document.getElementById('scan-btn');
    const manualEntryBtn = document.getElementById('manual-entry');
    const exportBtn = document.getElementById('export-inventory');
    const inventoryList = document.getElementById('inventory-list');

    // Load theme preference
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggleBtn.textContent = "Switch to Light Theme";
    }

    themeToggleBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        let mode = document.body.classList.contains("dark-mode") ? "dark" : "light";
        localStorage.setItem('theme', mode);
        themeToggleBtn.textContent = mode === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme";
    });

    // Start barcode scanner
    scanBtn.addEventListener("click", () => {
        Quagga.init({
            inputStream: {
                type: "Live",
                target: document.querySelector("#scanner-preview"),
                constraints: { facingMode: "environment" }
            },
            decoder: { readers: ["code_128_reader", "ean_reader", "upc_reader", "qr_reader"] }
        }, (err) => {
            if (err) {
                console.error(err);
                return;
            }
            Quagga.start();
        });

        Quagga.onDetected((data) => {
            let barcode = data.codeResult.code;
            handleBarcode(barcode);
        });
    });

    // Handle barcode input
    function handleBarcode(barcode) {
        let itemName = localStorage.getItem(barcode);
        if (!itemName) {
            itemName = prompt("Item not recognized. Enter item name:");
            if (itemName) {
                localStorage.setItem(barcode, itemName);
            }
        }
        addItemToInventory(barcode, itemName);
    }

    // Manually add item
    manualEntryBtn.addEventListener("click", () => {
        let barcode = prompt("Enter barcode manually:");
        let name = prompt("Enter item name:");
        if (barcode && name) {
            localStorage.setItem(barcode, name);
            addItemToInventory(barcode, name);
        }
    });

    // Add item to inventory
    function addItemToInventory(barcode, name) {
        let existingItem = document.querySelector(`li[data-barcode="${barcode}"]`);
        if (existingItem) {
            let quantityElement = existingItem.querySelector(".quantity");
            quantityElement.textContent = parseInt(quantityElement.textContent) + 1;
            return;
        }

        let listItem = document.createElement("li");
        listItem.setAttribute("data-barcode", barcode);
        listItem.innerHTML = `
            ${name} (${barcode})
            <span class="quantity">1</span>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="adjustQuantity('${barcode}', 1)">+</button>
                <button class="quantity-btn" onclick="adjustQuantity('${barcode}', -1)">-</button>
                <button class="delete-btn" onclick="removeItem('${barcode}')">🗑️</button>
            </div>
        `;
        inventoryList.appendChild(listItem);
    }

    // Adjust quantity
    window.adjustQuantity = (barcode, amount) => {
        let item = document.querySelector(`li[data-barcode="${barcode}"]`);
        if (item) {
            let quantityElement = item.querySelector(".quantity");
            let newQuantity = parseInt(quantityElement.textContent) + amount;
            if (newQuantity <= 0) {
                item.remove();
            } else {
                quantityElement.textContent = newQuantity;
            }
        }
    };

    // Remove item
    window.removeItem = (barcode) => {
        document.querySelector(`li[data-barcode="${barcode}"]`).remove();
    };

    // Export inventory to CSV
    exportBtn.addEventListener("click", () => {
        let csv = "Item Name, Barcode, Quantity\n";
        document.querySelectorAll("li").forEach(item => {
            let name = item.childNodes[0].textContent.trim();
            let barcode = item.getAttribute("data-barcode");
            let quantity = item.querySelector(".quantity").textContent;
            csv += `${name},${barcode},${quantity}\n`;
        });

        let blob = new Blob([csv], { type: "text/csv" });
        let link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "inventory.csv";
        link.click();
    });
});
