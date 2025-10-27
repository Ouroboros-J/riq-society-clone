import { getDb } from "./db";
import { blogs } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export async function getAllBlogs() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(blogs).where(eq(blogs.isPublished, 1)).orderBy(desc(blogs.publishedAt));
}

export async function getAllBlogsAdmin() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(blogs).orderBy(desc(blogs.createdAt));
}

export async function getBlogBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(blogs).where(eq(blogs.slug, slug)).limit(1);
  return result[0] || null;
}

export async function getBlogById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(blogs).where(eq(blogs.id, id)).limit(1);
  return result[0] || null;
}

export async function createBlog(data: {
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
  
  await db.insert(blogs).values(data);
  return { success: true };
}

export async function updateBlog(id: number, data: {
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
  
  await db.update(blogs).set({ ...data, updatedAt: new Date() }).where(eq(blogs.id, id));
  return { success: true };
}

export async function deleteBlog(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  await db.delete(blogs).where(eq(blogs.id, id));
  return { success: true };
}
