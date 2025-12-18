import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

async function fetchGuests() {
    if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
        console.warn("⚠️ Notion API Key or Database ID not found. Skipping fetch.");
        console.warn("   Using existing mock data if available.");
        return;
    }

    const notion = new Client({ auth: NOTION_API_KEY });

    // Helper to format UUID with dashes if missing
    const formatUUID = (uuid) => {
        if (uuid.includes("-")) return uuid;
        return `${uuid.slice(0, 8)}-${uuid.slice(8, 12)}-${uuid.slice(12, 16)}-${uuid.slice(16, 20)}-${uuid.slice(20)}`;
    };

    const rawId = NOTION_DATABASE_ID;
    const formattedId = formatUUID(rawId);

    console.log(`🔍 Debugging ID: ${rawId} -> ${formattedId}`);

    try {
        // Step 1: Verify Database Access
        console.log(`⏳ Verifying Database Access...`);
        try {
            const db = await notion.databases.retrieve({ database_id: formattedId });
            console.log("✅ Database found:", db.title?.[0]?.plain_text || "Untitled");
        } catch (e) {
            console.error("❌ Database verification failed:", e.message);
            // If database verification fails, we might try to check if it's a page, but usually we just want to fail or try query anyway.
            // Let's check if it's a page just for info
            try {
                const page = await notion.pages.retrieve({ page_id: formattedId });
                console.error("⚠️ The provided ID points to a PAGE, not a Database. Please create a Database inside this page or use a Database ID.");
                process.exit(1);
            } catch (pageError) {
                // Ignore page error, original db error is more relevant
            }
            throw e; // Re-throw original error
        }

        // Step 2: Query Database
        console.log("⏳ Fetching guests from Notion (using native fetch)...");

        const response = await fetch(`https://api.notion.com/v1/databases/${formattedId}/query`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${NOTION_API_KEY}`,
                "Notion-Version": "2022-06-28",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Notion API Error: ${response.status} ${response.statusText} - ${errText}`);
        }

        const data = await response.json();

        const guests = [];
        const imagesDir = path.join(__dirname, "../public/guest-images");
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true });
        }

        for (const page of response.results) {
            const props = page.properties;
            const id = page.id;
            const name = props['名前']?.title?.[0]?.plain_text || "Unknown";
            const table = props['テーブル番号']?.rich_text?.[0]?.plain_text || "";
            const message = props['メッセージ']?.rich_text?.[0]?.plain_text || "";

            let imageUrl = null;
            const imageProp = props['イメージ']?.files?.[0];
            if (imageProp) {
                const url = imageProp.file?.url || imageProp.external?.url;
                if (url) {
                    try {
                        // Download image
                        console.log(`⏳ Downloading image for ${name}...`);
                        const imgResp = await fetch(url);
                        if (imgResp.ok) {
                            const buffer = await imgResp.arrayBuffer();
                            // Determine extension (default to jpg if unknown)
                            // Simple way: assume jpg or png based on url or content-type, but for now just save as id.jpg or use original name if possible.
                            // Let's use a safe default.
                            const ext = url.split('?')[0].split('.').pop() || 'jpg';
                            const filename = `${id}.${ext}`;
                            const filePath = path.join(imagesDir, filename);
                            fs.writeFileSync(filePath, Buffer.from(buffer));
                            imageUrl = `/wedding/guest-images/${filename}`; // Adjust base path if needed
                        }
                    } catch (err) {
                        console.error(`❌ Failed to download image for ${name}:`, err.message);
                    }
                }
            }

            guests.push({
                id,
                name,
                table,
                message,
                image: imageUrl
            });
        }

        const outputPath = path.join(__dirname, "../src/data/guests.json");
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(outputPath, JSON.stringify(guests, null, 2));
        console.log(`✅ Successfully fetched ${guests.length} guests and saved to src/data/guests.json`);

    } catch (error) {
        console.error("❌ Error fetching from Notion:", error.message);
        process.exit(1);
    }
}

fetchGuests();
