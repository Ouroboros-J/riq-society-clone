import { getDb } from "./db";
import { aiSettings, type AiSetting, type InsertAiSetting } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export async function getAllAiSettings(): Promise<AiSetting[]> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  return await db.select().from(aiSettings);
}

export async function getAiSettingByPlatform(platform: string): Promise<AiSetting | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const results = await db
    .select()
    .from(aiSettings)
    .where(eq(aiSettings.platform, platform))
    .limit(1);
  
  return results[0];
}

export async function upsertAiSetting(data: InsertAiSetting): Promise<AiSetting> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const existing = await getAiSettingByPlatform(data.platform);
  
  if (existing) {
    // Update
    await db
      .update(aiSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(aiSettings.platform, data.platform));
    
    const updated = await getAiSettingByPlatform(data.platform);
    if (!updated) throw new Error("Failed to update AI setting");
    return updated;
  } else {
    // Insert
    const result = await db.insert(aiSettings).values(data);
    const insertedId = result[0].insertId;
    
    const inserted = await db
      .select()
      .from(aiSettings)
      .where(eq(aiSettings.id, insertedId))
      .limit(1);
    
    if (!inserted[0]) throw new Error("Failed to create AI setting");
    return inserted[0];
  }
}

export async function getEnabledAiSettings(): Promise<AiSetting[]> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  return await db
    .select()
    .from(aiSettings)
    .where(eq(aiSettings.isEnabled, 1));
}

export async function countEnabledAiSettings(): Promise<number> {
  const enabled = await getEnabledAiSettings();
  return enabled.length;
}

