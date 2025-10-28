import { getDb } from "./server/db";
import { aiSettings } from "./drizzle/schema";
import { eq } from "drizzle-orm";

async function updateAiKeys() {
  const db = await getDb();
  
  // Anthropic API 키 업데이트
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    await db.update(aiSettings)
      .set({ apiKey: anthropicKey })
      .where(eq(aiSettings.platform, "anthropic"));
    console.log("✅ Anthropic API 키 업데이트 완료");
  }
  
  // Perplexity API 키 업데이트
  const sonarKey = process.env.SONAR_API_KEY;
  if (sonarKey) {
    await db.update(aiSettings)
      .set({ apiKey: sonarKey })
      .where(eq(aiSettings.platform, "perplexity"));
    console.log("✅ Perplexity API 키 업데이트 완료");
  }
  
  // 확인
  const settings = await db.select().from(aiSettings);
  console.log("\n=== 업데이트된 AI Settings ===");
  settings.forEach(s => {
    console.log(`${s.platform}: ${s.apiKey?.substring(0, 20)}...`);
  });
  
  process.exit(0);
}

updateAiKeys();

