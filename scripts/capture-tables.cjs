const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Load guest data
const guestsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/guests.json'), 'utf8'));

// Group guests by table
const tables = {};
guestsData.forEach(guest => {
    if (guest.group && guest.group !== '高砂' && guest.group !== '応援席') {
        if (!tables[guest.group]) {
            tables[guest.group] = [];
        }
        tables[guest.group].push(guest);
    }
});

// Sort guests within each table by tableOrder
Object.keys(tables).forEach(tableKey => {
    tables[tableKey].sort((a, b) => parseInt(a.tableOrder) - parseInt(b.tableOrder));
});

// Table colors
const TABLE_COLORS = {
    "A": "#d65b75",
    "B": "#f2a842",
    "C": "#6987cf",
    "D": "#cea1d1",
    "E": "#87bda2",
    "F": "#ffc2e8"
};

function generateHTML(tableKey, guests, publicDir) {
    const color = TABLE_COLORS[tableKey] || "#F39800";
    const totalGuests = guests.length;

    // Canvas size
    const canvasSize = 1000;
    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;

    // Aggressive packing parameters
    // To minimize whitespace:
    // 1. Maximize Center Table Circle
    // 2. Maximize Guest Image Size
    // 3. Minimize gaps

    const centerTableSize = 340; // Diameter
    const guestImageSize = 220; // Diameter

    // Radius from center of canvas to center of guest
    // CenterR (170) + Gap (10) + GuestR (110) = 290
    // But we also want to fill the screen.
    // Screen Edge (500) - GuestR (110) - Margin (10) = 380
    // Let's pick a radius that balances these.

    const radius = 350;

    // Check overlap for 8 guests
    // C = 2*PI*350 = 2200.
    // Arc = 2200/8 = 275.
    // Guest Width (with wrapper) approx 240.
    // Gap = 35px. Good.

    // Vertical check
    // Top: 500 - 350 - 110 = 40px. (Table label inside circle?)
    // Bottom: 500 + 350 + 110 = 960px. (Name label overlapping?)

    let guestElements = '';

    guests.forEach((guest, index) => {
        const angleStep = (2 * Math.PI) / totalGuests;
        const startAngle = -Math.PI / 2;
        const angle = startAngle + index * angleStep;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        const imagePath = guest.image ? 'file://' + path.join(publicDir, guest.image) : '';

        // Full name with honorific
        const fullName = `${guest.name} ${guest.honorific || '様'}`;
        // Adjust font size based on name length
        const fontSize = fullName.length > 7 ? 24 : 28;

        guestElements += `
        <div style="
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            transform: translate(-50%, -50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 240px;
            height: 240px;
            justify-content: center;
        ">
             <!-- Table Number Badge (Top Left of Image) -->
            <div style="
                position: absolute;
                top: 40%;
                left: -20px;
                transform: translateY(-50%);
                z-index: 10;
                background: ${color};
                color: white;
                font-weight: bold;
                font-size: 24px;
                padding: 6px 14px;
                border-radius: 30px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.4);
                border: 2px solid white;
            ">${guest.table}</div>

            <!-- Image -->
            <div style="
                width: ${guestImageSize}px;
                height: ${guestImageSize}px;
                border-radius: 50%;
                border: 6px solid ${color};
                overflow: hidden;
                background: #222;
                box-shadow: 0 5px 25px rgba(0,0,0,0.6);
                position: relative;
                z-index: 1;
            ">
                ${imagePath ? `<img src="${imagePath}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'" />` : ''}
            </div>
            
            <!-- Name Label (Overlapping Bottom) -->
            <div style="
                position: absolute;
                bottom: -30px;
                text-align: center;
                background: rgba(0,0,0,0.85);
                padding: 8px 14px;
                border-radius: 14px;
                min-width: 160px;
                max-width: 260px;
                z-index: 20;
                border: 1px solid rgba(255,255,255,0.1);
            ">
                <div style="color: white; font-size: ${fontSize}px; font-weight: bold; white-space: nowrap; line-height: 1.2;">
                    ${fullName}
                </div>
                ${guest.title ? `<div style="color: #fff; font-size: 20px; font-weight: bold; margin-top: 3px; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">${guest.title}</div>` : ''}
            </div>
        </div>
        `;
    });

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: "Hiragino Kaku Gothic ProN", "ヒラギノ角ゴ ProN", sans-serif;
        }
        .container {
            width: ${canvasSize}px;
            height: ${canvasSize}px;
            position: relative;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Center table -->
        <div style="
            position: absolute;
            left: ${centerX}px;
            top: ${centerY}px;
            transform: translate(-50%, -50%);
            width: ${centerTableSize}px;
            height: ${centerTableSize}px;
            border-radius: 50%;
            border: 10px solid ${color};
            background: rgba(0,0,0,0.5);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 80px ${color}90;
            z-index: 0;
        ">
            <div style="color: #ddd; font-size: 40px; font-family: serif; margin-bottom: 5px;">Table</div>
            <div style="color: ${color}; font-size: 160px; font-weight: bold; font-family: serif; line-height: 1;">${tableKey}</div>
        </div>
        
        ${guestElements}
    </div>
</body>
</html>
    `;
}

async function captureTable(browser, tableKey, guests, outputDir, publicDir) {
    const html = generateHTML(tableKey, guests, publicDir);
    const page = await browser.newPage();

    // High res output
    await page.setViewport({ width: 1000, height: 1000, deviceScaleFactor: 2 });

    const tempHtmlPath = path.join(outputDir, `temp-${tableKey}.html`);
    fs.writeFileSync(tempHtmlPath, html);

    await page.goto('file://' + tempHtmlPath, {
        waitUntil: 'load',
        timeout: 60000
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    const pngPath = path.join(outputDir, `table-${tableKey}.png`);
    await page.screenshot({
        path: pngPath,
        omitBackground: true,
        type: 'png'
    });

    await page.close();
    fs.unlinkSync(tempHtmlPath);

    console.log(`Generated: ${pngPath}`);
}

async function main() {
    const outputDir = path.join(__dirname, '../public/table-pngs');
    const publicDir = path.join(__dirname, '../public');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--allow-file-access-from-files']
    });

    const tableKeys = Object.keys(tables).sort();
    console.log(`Capturing tables: ${tableKeys.join(', ')}`);

    for (const tableKey of tableKeys) {
        await captureTable(browser, tableKey, tables[tableKey], outputDir, publicDir);
    }

    await browser.close();
    console.log('\nDone! PNG files are in:', outputDir);
}

main().catch(console.error);
