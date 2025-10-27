import { getDb } from "./db";
import { aiVerifications, type InsertAiVerification } from "../drizzle/schema";

export async function saveAiVerification(data: InsertAiVerification) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  await db.insert(aiVerifications).values(data);
}

export async function saveMultipleAiVerifications(verifications: InsertAiVerification[]) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  if (verifications.length > 0) {
    await db.insert(aiVerifications).values(verifications);
  }
}

