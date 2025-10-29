import { getDb } from "./db";
import { journals } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export async function getAllJournals() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(journals).where(eq(journals.isPublished, 1)).orderBy(desc(journals.publishedAt));
}

export async function getAllJournalsAdmin() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(journals).orderBy(desc(journals.createdAt));
}

export async function getJournalBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(journals).where(eq(journals.slug, slug)).limit(1);
  return result[0] || null;
}

export async function getJournalById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(journals).where(eq(journals.id, id)).limit(1);
  return result[0] || null;
}

export async function createJournal(data: {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  thumbnailUrl?: string;
  category?: string;
  authorId: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  await db.insert(journals).values(data);
  return { success: true };
}

export async function updateJournal(id: number, data: {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  thumbnailUrl?: string;
  category?: string;
  isPublished?: number;
  publishedAt?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  await db.update(journals).set({ ...data, updatedAt: new Date() }).where(eq(journals.id, id));
  return { success: true };
}

export async function deleteJournal(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  await db.delete(journals).where(eq(journals.id, id));
  return { success: true };
}

