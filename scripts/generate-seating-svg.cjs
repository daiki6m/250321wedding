const fs = require('fs');
const path = require('path');

const guestsPath = path.join(__dirname, '../src/data/guests.json');
const outputPath = path.join(__dirname, '../seating_chart.svg');

const tableColors = {
    'A': '#d65b75',
    'B': '#f2a842',
    'C': '#6987cf',
    'D': '#cea1d1',
    'E': '#87bda2',
    'F': '#0097b2'
};

try {
    const guests = JSON.parse(fs.readFileSync(guestsPath, 'utf8'));
    const regularGuests = guests.filter(g => g.participation === '出席' || !g.participation);

    const tables = regularGuests.reduce((acc, guest) => {
        const group = guest.group || "Other";
        if (!acc[group]) acc[group] = [];
        acc[group].push(guest);
        return acc;
    }, {});

    const sortedGroups = Object.keys(tables).sort();

    const width = 1200;
    const height = 800;
    const tableWidth = 300;
    const tableHeight = 350;
    const padding = 50;
    const cols = 3;

    let svgContent = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
    svgContent += `<rect width="100%" height="100%" fill="#050505" />`;
    svgContent += `<text x="${width / 2}" y="50" font-family="serif" font-size="32" fill="white" text-anchor="middle">SEATING CHART</text>`;

    sortedGroups.forEach((group, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = padding + col * (tableWidth + padding);
        const y = 100 + row * (tableHeight + padding);
        const color = tableColors[group] || '#F39800';

        // Table Card
        svgContent += `<rect x="${x}" y="${y}" width="${tableWidth}" height="${tableHeight}" rx="15" fill="${color}1A" stroke="${color}" stroke-width="2" />`;
        svgContent += `<text x="${x + tableWidth / 2}" y="${y + 40}" font-family="serif" font-size="24" fill="${color}" text-anchor="middle">Table ${group}</text>`;
        svgContent += `<line x1="${x + 20}" y1="${y + 55}" x2="${x + tableWidth - 20}" y2="${y + 55}" stroke="${color}" stroke-width="1" opacity="0.5" />`;

        // Guests
        const groupGuests = tables[group].sort((a, b) => parseInt(a.tableOrder || "0") - parseInt(b.tableOrder || "0"));
        groupGuests.forEach((guest, i) => {
            const gx = x + 20 + (i % 2) * (tableWidth / 2 - 10);
            const gy = y + 85 + Math.floor(i / 2) * 60;

            svgContent += `<text x="${gx}" y="${gy}" font-family="sans-serif" font-size="14" fill="white">${guest.name}</text>`;
            if (guest.title) {
                svgContent += `<text x="${gx}" y="${gy + 18}" font-family="sans-serif" font-size="10" fill="#999">${guest.title}</text>`;
            }
        });
    });

    svgContent += `</svg>`;

    fs.writeFileSync(outputPath, svgContent, 'utf8');
    console.log('SVG generated successfully at ' + outputPath);
} catch (error) {
    console.error('Error generating SVG:', error);
    process.exit(1);
}
