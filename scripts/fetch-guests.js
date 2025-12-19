import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NOTION_API_KEY = process.env.NOTION_API_KEY ? process.env.NOTION_API_KEY.trim() : "";
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID ? process.env.NOTION_DATABASE_ID.trim() : "";

async function fetchGuests() {
    console.log("🚀 Starting fetch-guests script...");
    console.log("Environment check:");
    console.log(`- NOTION_API_KEY: ${NOTION_API_KEY ? `Present (Starts with ${NOTION_API_KEY.substring(0, 7)}...)` : "Missing"}`);
    console.log(`- NOTION_DATABASE_ID: ${NOTION_DATABASE_ID ? `Present (${NOTION_DATABASE_ID})` : "Missing"}`);

    if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
        console.warn("⚠️ Notion API Key or Database ID not found.");
        if (process.env.GITHUB_ACTIONS) {
            console.error("❌ Error: Secrets are missing in GitHub Actions environment. Please check repository secrets.");
            process.exit(1);
        }
        console.warn("   Skipping fetch and using existing data.");
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
            console.error(`❌ Notion API Query Failed: ${response.status} ${response.statusText}`);
            console.error(`Response Body: ${errText}`);
            throw new Error(`Notion API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`✅ Successfully queried Notion. Found ${data.results.length} raw records.`);

        const guests = [];
        const imagesDir = path.join(__dirname, "../public/guest-images");
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true });
        }

        for (const page of data.results) {
            const props = page.properties;
            const id = page.id;

            // Helper to safely get text from various property types
            const getText = (prop) => {
                if (!prop) return "";
                if (prop.type === 'title') return prop.title?.[0]?.plain_text || "";
                if (prop.type === 'rich_text') return prop.rich_text?.[0]?.plain_text || "";
                if (prop.type === 'select') return prop.select?.name || "";
                if (prop.type === 'number') return String(prop.number || "");
                if (prop.type === 'formula') {
                    if (prop.formula.type === 'string') return prop.formula.string || "";
                    if (prop.formula.type === 'number') return String(prop.formula.number || "");
                    if (prop.formula.type === 'boolean') return String(prop.formula.boolean);
                    return "";
                }
                if (prop.type === 'rollup') {
                    // Handle rollup (array of values), usually we just want the first one or join them
                    const array = prop.rollup?.array;
                    if (array && array.length > 0) {
                        // Recursively get text for the first item in rollup
                        return getText(array[0]);
                    }
                    return "";
                }
                if (prop.type === 'phone_number') return prop.phone_number || "";
                if (prop.type === 'email') return prop.email || "";
                if (prop.type === 'url') return prop.url || "";
                return "";
            };

            const name = getText(props['名前']) || "Unknown";
            const table = getText(props['テーブル番号']);
            const group = getText(props['テーブル']);
            const tableOrder = getText(props['テーブル内No.']); // Fetch sort order
            const message = getText(props['メッセージ']);
            const title = getText(props['肩書き']);
            const birthMonth = getText(props['誕生月']);
            const relationship = getText(props['間柄']);
            const participation = getText(props['参加']); // Fetch participation status

            // Skip if not attending, cheering, or principal
            const validParticipation = ['出席', '応援席', '本人'];
            if (!validParticipation.includes(participation)) {
                continue;
            }

            let imageUrl = null;
            const imageProp = props['イメージ'];
            if (imageProp && imageProp.type === 'files' && imageProp.files.length > 0) {
                const fileObj = imageProp.files[0];
                const url = fileObj.file?.url || fileObj.external?.url;
                if (url) {
                    try {
                        // Download image
                        // console.log(`⏳ Downloading image for ${name}...`); // Reduce noise
                        const imgResp = await fetch(url);
                        if (imgResp.ok) {
                            const buffer = await imgResp.arrayBuffer();
                            const ext = url.split('?')[0].split('.').pop() || 'jpg';
                            const filename = `${id}.${ext}`;
                            const filePath = path.join(imagesDir, filename);
                            fs.writeFileSync(filePath, Buffer.from(buffer));
                            imageUrl = `guest-images/${filename}`;
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
                group,
                tableOrder,
                message,
                title,
                birthMonth,
                relationship,
                participation,
                image: imageUrl
            });
        }

        console.log(`📊 Processed ${guests.length} valid guests after filtering.`);

        const outputPath = path.join(__dirname, "../src/data/guests.json");
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(outputPath, JSON.stringify(guests, null, 2));
        console.log(`✅ Successfully fetched ${guests.length} guests and saved to src/data/guests.json`);

    } catch (error) {
        console.error("❌ Error fetching from Notion:", error.message);
        console.warn("⚠️ Continuing build with existing or empty data to prevent deployment failure.");

        // Ensure guests.json exists even if fetch failed
        const outputPath = path.join(__dirname, "../src/data/guests.json");
        if (!fs.existsSync(outputPath)) {
            const dir = path.dirname(outputPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(outputPath, JSON.stringify([], null, 2));
            console.log("⚠️ Created empty guests.json as fallback.");
        }
        // Do NOT exit with 1, allow build to continue
        process.exit(0);
    }
}

fetchGuests();
