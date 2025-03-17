document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const scanBtn = document.getElementById('scan-btn');
    const inventoryList = document.getElementById('inventory-list');
    const scannerContainer = document.getElementById('scanner-container');

    let inventory = JSON.parse(localStorage.getItem('inventoryItems') || '[]');

    function renderInventory() {
        inventoryList.innerHTML = '';
        inventory.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            inventoryList.appendChild(li);
        });
    }

    renderInventory();

    themeToggleBtn.onclick = () => {
        document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('light-mode');

        const isDark = document.body.classList.contains('dark-mode');
        themeToggleBtn.textContent = isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme';
    };

    scanBtn.addEventListener('click', () => {
        scannerContainer.innerHTML = '';
        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: scannerContainer,
                constraints: {
                    facingMode: "environment"
                }
            },
            decoder: {
                readers: ["code_128_reader", "ean_reader", "upc_reader"]
            }
        }, (err) => {
            if (err) {
                console.error(err);
                alert("Failed to initialize barcode scanner.");
                return;
            }
            Quagga.start();
        });

        Quagga.onDetected((data) => {
            const barcode = data.codeResult.code;
            Quagga.stop();
            scannerContainer.innerHTML = '';

            let itemName = localStorage.getItem(barcode);
            if (!itemName) {
                itemName = prompt("New item detected! Enter name for barcode: " + barcode);
                if (itemName) {
                    localStorage.setItem(barcode, itemName);
                } else {
                    itemName = "Unnamed Item";
                }
            }

            inventory.push(`${itemName} (${barcode})`);
            localStorage.setItem('inventoryItems', JSON.stringify(inventory));
            renderInventory();
        });
    });
});
