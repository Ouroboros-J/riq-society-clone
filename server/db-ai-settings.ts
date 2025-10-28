import { getDb } from "./db";
import { aiSettings, type AiSetting, type InsertAiSetting } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export async function getAllAiSettings(): Promise<AiSetting[]> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  return await db.select().from(aiSettings);
}

export async function getAiSettingById(id: number): Promise<AiSetting | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const results = await db
    .select()
    .from(aiSettings)
    .where(eq(aiSettings.id, id))
    .limit(1);
  
  return results[0];
}

export async function getAiSettingByProvider(provider: string): Promise<AiSetting | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const results = await db
    .select()
    .from(aiSettings)
    .where(eq(aiSettings.provider, provider))
    .limit(1);
  
  return results[0];
}

export async function addAiSetting(data: InsertAiSetting): Promise<AiSetting> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  // 같은 provider가 이미 존재하는지 확인
  const existing = await getAiSettingByProvider(data.provider);
  if (existing) {
    throw new Error(`Provider "${data.provider}" already exists. Each provider can only be added once.`);
  }
  
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

export async function updateAiSetting(id: number, data: Partial<InsertAiSetting>): Promise<AiSetting> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  await db
    .update(aiSettings)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(aiSettings.id, id));
  
  const updated = await getAiSettingById(id);
  if (!updated) throw new Error("Failed to update AI setting");
  return updated;
}

export async function deleteAiSetting(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  await db
    .delete(aiSettings)
    .where(eq(aiSettings.id, id));
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

/**
 * 검증 규칙 체크
 * - 최소 2개 Verifier (서로 다른 provider)
 * - 정확히 1개 Summarizer
 */
export async function validateAiSettingsConfiguration(): Promise<{ valid: boolean; error?: string }> {
  const enabled = await getEnabledAiSettings();
  
  const verifiers = enabled.filter(s => s.role === 'verifier');
  const summarizers = enabled.filter(s => s.role === 'summarizer');
  
  // Verifier 개수 체크
  if (verifiers.length < 2) {
    return { valid: false, error: 'At least 2 Verifier models are required.' };
  }
  
  // Verifier provider 중복 체크
  const verifierProviders = new Set(verifiers.map(v => v.provider));
  if (verifierProviders.size < 2) {
    return { valid: false, error: 'Verifier models must be from at least 2 different providers.' };
  }
  
  // Summarizer 개수 체크
  if (summarizers.length !== 1) {
    return { valid: false, error: 'Exactly 1 Summarizer model is required.' };
  }
  
  return { valid: true };
}

