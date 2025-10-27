import { getDb } from "./db";
import { resources } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export async function getAllResources() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(resources).where(eq(resources.isPublished, 1)).orderBy(desc(resources.createdAt));
}

export async function getAllResourcesAdmin() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(resources).orderBy(desc(resources.createdAt));
}

export async function getResourceById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(resources).where(eq(resources.id, id)).limit(1);
  return result[0] || null;
}

export async function createResource(data: {
  title: string;
  description?: string;
  fileUrl: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  category?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  await db.insert(resources).values(data);
  return { success: true };
}

export async function updateResource(id: number, data: {
  title?: string;
  description?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  category?: string;
  isPublished?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  await db.update(resources).set({ ...data, updatedAt: new Date() }).where(eq(resources.id, id));
  return { success: true };
}

export async function deleteResource(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  await db.delete(resources).where(eq(resources.id, id));
  return { success: true };
}

export async function incrementDownloadCount(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const resource = await getResourceById(id);
  if (resource) {
    await db.update(resources).set({ downloadCount: resource.downloadCount + 1 }).where(eq(resources.id, id));
  }
  return { success: true };
}
