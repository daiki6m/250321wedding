const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputDir = path.join(__dirname, '../public/table-pngs');
const outputDir = inputDir;

async function convertSvgToPng() {
    const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.svg'));

    for (const file of files) {
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(outputDir, file.replace('.svg', '.png'));

        try {
            await sharp(inputPath)
                .resize(1000, 1000)
                .png()
                .toFile(outputPath);
            console.log(`Converted: ${file} -> ${file.replace('.svg', '.png')}`);
        } catch (error) {
            console.error(`Error converting ${file}:`, error.message);
        }
    }

    console.log('\nDone! PNG files are in:', outputDir);
}

convertSvgToPng();
