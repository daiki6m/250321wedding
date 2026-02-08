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

// Generate SVG for each table
function generateTableSVG(tableKey, guests) {
    const color = TABLE_COLORS[tableKey] || "#F39800";
    const totalGuests = guests.length;
    const centerX = 500;
    const centerY = 500;
    const radius = 350;
    const imageSize = 100;

    let guestElements = '';

    guests.forEach((guest, index) => {
        const angleStep = (2 * Math.PI) / totalGuests;
        const startAngle = -Math.PI / 2;
        const angle = startAngle + index * angleStep;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        // Guest image path
        const imagePath = guest.image ? path.join(__dirname, '../public', guest.image) : null;
        let imageData = '';

        if (imagePath && fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);
            const base64 = imageBuffer.toString('base64');
            const ext = path.extname(imagePath).toLowerCase();
            const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
            imageData = `data:${mimeType};base64,${base64}`;
        }

        // Calculate text position
        const textY = y + imageSize / 2 + 30;
        const titleY = textY + 25;
        const seatY = y - imageSize / 2 - 15;

        guestElements += `
        <!-- Guest: ${guest.name} -->
        <g>
            <!-- Seat number -->
            <text x="${x}" y="${seatY}" text-anchor="middle" fill="${color}" font-family="sans-serif" font-size="18" font-weight="bold">${guest.table}</text>
            
            <!-- Photo circle -->
            <defs>
                <clipPath id="clip-${tableKey}-${index}">
                    <circle cx="${x}" cy="${y}" r="${imageSize / 2}" />
                </clipPath>
            </defs>
            <circle cx="${x}" cy="${y}" r="${imageSize / 2 + 3}" fill="none" stroke="${color}" stroke-width="4" />
            ${imageData ? `<image href="${imageData}" x="${x - imageSize / 2}" y="${y - imageSize / 2}" width="${imageSize}" height="${imageSize}" clip-path="url(#clip-${tableKey}-${index})" preserveAspectRatio="xMidYMid slice" />` : `<circle cx="${x}" cy="${y}" r="${imageSize / 2}" fill="#333" />`}
            
            <!-- Name -->
            <text x="${x}" y="${textY}" text-anchor="middle" fill="white" font-family="sans-serif" font-size="22" font-weight="bold">${guest.name} ${guest.honorific || '様'}</text>
            
            <!-- Title -->
            <text x="${x}" y="${titleY}" text-anchor="middle" fill="#999" font-family="sans-serif" font-size="16">${guest.title || ''}</text>
        </g>
        `;
    });

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1000" height="1000" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Transparent background -->
    
    <!-- Center table circle -->
    <circle cx="${centerX}" cy="${centerY}" r="120" fill="none" stroke="${color}" stroke-width="4" />
    <circle cx="${centerX}" cy="${centerY}" r="115" fill="rgba(0,0,0,0.3)" />
    
    <!-- Table label -->
    <text x="${centerX}" y="${centerY - 20}" text-anchor="middle" fill="#999" font-family="serif" font-size="24">Table</text>
    <text x="${centerX}" y="${centerY + 40}" text-anchor="middle" fill="${color}" font-family="serif" font-size="72" font-weight="bold">${tableKey}</text>
    
    <!-- Guests -->
    ${guestElements}
</svg>`;

    return svg;
}

// Create output directory
const outputDir = path.join(__dirname, '../public/table-pngs');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Generate SVG files first
const tableKeys = Object.keys(tables).sort();
console.log(`Generating table images for: ${tableKeys.join(', ')}`);

tableKeys.forEach(tableKey => {
    const guests = tables[tableKey];
    const svg = generateTableSVG(tableKey, guests);
    const svgPath = path.join(outputDir, `table-${tableKey}.svg`);
    fs.writeFileSync(svgPath, svg);
    console.log(`Generated: ${svgPath}`);
});

console.log('\nSVG files generated! To convert to PNG with transparency, run:');
console.log('  For each SVG: npx sharp-cli --input table-X.svg --output table-X.png');
console.log('\nOr use an online converter or Inkscape for PNG conversion.');
