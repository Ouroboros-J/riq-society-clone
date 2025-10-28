import { getDb } from "./server/db";
import { aiSettings } from "./drizzle/schema";

async function checkAiSettings() {
  const db = await getDb();
  
  const settings = await db.select().from(aiSettings);
  
  console.log("=== AI Settings ===");
  console.log(JSON.stringify(settings, null, 2));
  
  process.exit(0);
}

checkAiSettings();

