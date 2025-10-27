import { getDb } from "./db";
import { applications } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export async function createApplication(data: {
  userId: number;
  fullName: string;
  email: string;
  dateOfBirth: string;
  phone?: string;
  testType: string;
  testScore: string;
  testDate?: string;
  documentUrls?: string;
  isDraft?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .insert(applications)
    .values({
      ...data,
      isDraft: data.isDraft ?? 0,
      submittedAt: data.isDraft === 0 ? new Date() : null,
    });

  // Get the inserted application
  const insertId = (result as any).insertId;
  const [application] = await db
    .select()
    .from(applications)
    .where(eq(applications.id, Number(insertId)));

  return application;
}

export async function updateApplication(
  id: number,
  data: Partial<{
    fullName: string;
    email: string;
    dateOfBirth: string;
    phone: string;
    testType: string;
    testScore: string;
    testDate: string;
    documentUrls: string;
    isDraft: number;
    status: "pending" | "approved" | "rejected";
    adminNotes: string;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(applications)
    .set({
      ...data,
      submittedAt: data.isDraft === 0 ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(applications.id, id));

  // Get the updated application
  const [updated] = await db
    .select()
    .from(applications)
    .where(eq(applications.id, id));

  return updated;
}

export async function getUserApplication(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [application] = await db
    .select()
    .from(applications)
    .where(eq(applications.userId, userId))
    .limit(1);

  return application;
}

export async function getAllApplications() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select()
    .from(applications)
    .where(eq(applications.isDraft, 0))
    .orderBy(applications.createdAt);
}

export async function updateApplicationStatus(
  id: number,
  status: "pending" | "approved" | "rejected",
  adminNotes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(applications)
    .set({
      status,
      adminNotes,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(applications.id, id));

  // Get the updated application
  const [updated] = await db
    .select()
    .from(applications)
    .where(eq(applications.id, id));

  return updated;
}

