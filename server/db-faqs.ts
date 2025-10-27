import { getDb } from "./db";
import { faqs } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export async function getAllFaqs() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(faqs).where(eq(faqs.isPublished, 1)).orderBy(faqs.displayOrder, faqs.id);
}

export async function getAllFaqsAdmin() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(faqs).orderBy(faqs.displayOrder, faqs.id);
}

export async function getFaqById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(faqs).where(eq(faqs.id, id)).limit(1);
  return result[0] || null;
}

export async function createFaq(data: { question: string; answer: string; category?: string; displayOrder?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  await db.insert(faqs).values(data);
  return { success: true };
}

export async function updateFaq(id: number, data: { question?: string; answer?: string; category?: string; displayOrder?: number; isPublished?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  await db.update(faqs).set({ ...data, updatedAt: new Date() }).where(eq(faqs.id, id));
  return { success: true };
}

export async function deleteFaq(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  await db.delete(faqs).where(eq(faqs.id, id));
  return { success: true };
}
