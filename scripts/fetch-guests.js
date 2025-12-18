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

    try {
        console.log("⏳ Fetching guests from Notion...");
        const response = await notion.databases.query({
            database_id: NOTION_DATABASE_ID,
        });

        const guests = response.results.map((page) => {
            // Customize these property names based on your Notion Database columns
            const props = page.properties;
            return {
                id: page.id,
                name: props.Name?.title?.[0]?.plain_text || "Unknown",
                table: props.Table?.rich_text?.[0]?.plain_text || "",
                message: props.Message?.rich_text?.[0]?.plain_text || "",
            };
        });

        const outputPath = path.join(__dirname, "../src/data/guests.json");

        // Ensure directory exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(outputPath, JSON.stringify(guests, null, 2));
        console.log(`✅ Successfully fetched ${guests.length} guests and saved to src/data/guests.json`);

    } catch (error) {
        console.error("❌ Error fetching from Notion:", error);
        process.exit(1);
    }
}

fetchGuests();
