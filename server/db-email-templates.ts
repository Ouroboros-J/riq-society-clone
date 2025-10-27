import { getDb } from "./db";

export async function getEmailTemplate(templateKey: string) {
  const db = await getDb();
  if (!db) return null;
  
  const { emailTemplates } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  const templates = await db.select().from(emailTemplates).where(eq(emailTemplates.templateKey, templateKey));
  return templates[0] || null;
}

export async function getAllEmailTemplates() {
  const db = await getDb();
  if (!db) return [];
  
  const { emailTemplates } = await import("../drizzle/schema");
  
  return await db.select().from(emailTemplates);
}

export async function updateEmailTemplate(templateKey: string, subject: string, body: string) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const { emailTemplates } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  await db.update(emailTemplates)
    .set({ subject, body, updatedAt: new Date() })
    .where(eq(emailTemplates.templateKey, templateKey));
  
  return { success: true };
}

export async function createEmailTemplate(templateKey: string, subject: string, body: string, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const { emailTemplates } = await import("../drizzle/schema");
  
  await db.insert(emailTemplates).values({
    templateKey,
    subject,
    body,
    description
  });
  
  return { success: true };
}
