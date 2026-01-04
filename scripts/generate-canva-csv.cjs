const fs = require('fs');
const path = require('path');

const guestsPath = path.join(__dirname, '../src/data/guests.json');
const outputPath = path.join(__dirname, '../guests_for_canva.csv');

try {
    const guests = JSON.parse(fs.readFileSync(guestsPath, 'utf8'));

    // CSV Header
    const header = ['ID', 'Name', 'Table', 'Group', 'TableOrder', 'Title', 'Relationship', 'Message', 'Participation'];
    const rows = [header.join(',')];

    guests.forEach(guest => {
        const row = [
            guest.id || '',
            `"${(guest.name || '').replace(/"/g, '""')}"`,
            `"${(guest.table || '').replace(/"/g, '""')}"`,
            `"${(guest.group || '').replace(/"/g, '""')}"`,
            `"${(guest.tableOrder || '').replace(/"/g, '""')}"`,
            `"${(guest.title || '').replace(/"/g, '""')}"`,
            `"${(guest.relationship || '').replace(/"/g, '""')}"`,
            `"${(guest.message || '').replace(/\n/g, ' ').replace(/"/g, '""')}"`, // Flatten message for CSV
            `"${(guest.participation || '').replace(/"/g, '""')}"`
        ];
        rows.push(row.join(','));
    });

    fs.writeFileSync(outputPath, rows.join('\n'), 'utf8');
    console.log('CSV generated successfully at ' + outputPath);
} catch (error) {
    console.error('Error generating CSV:', error);
    process.exit(1);
}
