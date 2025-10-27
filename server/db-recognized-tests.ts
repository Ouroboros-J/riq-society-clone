import { getDb } from "./db";
import { recognizedTests, type RecognizedTest, type InsertRecognizedTest } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export async function getAllRecognizedTests(): Promise<RecognizedTest[]> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  return await db
    .select()
    .from(recognizedTests)
    .where(eq(recognizedTests.isActive, 1))
    .orderBy(recognizedTests.displayOrder);
}

export async function getRecognizedTestById(id: number): Promise<RecognizedTest | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const results = await db
    .select()
    .from(recognizedTests)
    .where(eq(recognizedTests.id, id))
    .limit(1);
  
  return results[0];
}

export async function createRecognizedTest(data: InsertRecognizedTest): Promise<RecognizedTest> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const result = await db.insert(recognizedTests).values(data);
  const insertedId = result[0].insertId;
  
  const test = await getRecognizedTestById(insertedId);
  if (!test) throw new Error("Failed to create recognized test");
  
  return test;
}

export async function updateRecognizedTest(
  id: number,
  data: Partial<InsertRecognizedTest>
): Promise<RecognizedTest> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  await db
    .update(recognizedTests)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(recognizedTests.id, id));
  
  const test = await getRecognizedTestById(id);
  if (!test) throw new Error("Failed to update recognized test");
  
  return test;
}

export async function deleteRecognizedTest(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  await db.delete(recognizedTests).where(eq(recognizedTests.id, id));
}

