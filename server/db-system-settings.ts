import { getDb } from "./db";
import { systemSettings, type SystemSetting } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export async function getSystemSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const results = await db
    .select()
    .from(systemSettings)
    .where(eq(systemSettings.settingKey, key))
    .limit(1);
  
  return results[0]?.settingValue || null;
}

export async function setSystemSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const existing = await getSystemSetting(key);
  
  if (existing !== null) {
    await db
      .update(systemSettings)
      .set({ settingValue: value, updatedAt: new Date() })
      .where(eq(systemSettings.settingKey, key));
  } else {
    await db.insert(systemSettings).values({
      settingKey: key,
      settingValue: value,
    });
  }
}

export async function isAutopilotEnabled(): Promise<boolean> {
  const value = await getSystemSetting('autopilot_enabled');
  return value === '1' || value === 'true';
}

