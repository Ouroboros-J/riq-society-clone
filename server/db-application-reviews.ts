import { getDb } from "./db";
import { applicationReviews, applications } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export async function createApplicationReview(data: {
  applicationId: number;
  requestReason: string;
  additionalDocuments?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const [review] = await db.insert(applicationReviews).values(data);
  return review;
}

export async function getApplicationReviewsByApplicationId(applicationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  return await db
    .select()
    .from(applicationReviews)
    .where(eq(applicationReviews.applicationId, applicationId));
}

export async function getAllPendingReviews() {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  return await db
    .select({
      review: applicationReviews,
      application: applications,
    })
    .from(applicationReviews)
    .leftJoin(applications, eq(applicationReviews.applicationId, applications.id))
    .where(eq(applicationReviews.status, "pending"));
}

export async function updateApplicationReviewStatus(
  reviewId: number,
  status: "approved" | "rejected",
  reviewedBy: number,
  adminNotes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  await db
    .update(applicationReviews)
    .set({
      status,
      reviewedBy,
      reviewedAt: new Date(),
      adminNotes,
    })
    .where(eq(applicationReviews.id, reviewId));
}

export async function incrementReviewRequestCount(applicationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const [app] = await db
    .select()
    .from(applications)
    .where(eq(applications.id, applicationId));
  
  if (!app) throw new Error("Application not found");
  
  await db
    .update(applications)
    .set({
      reviewRequestCount: (app.reviewRequestCount || 0) + 1,
    })
    .where(eq(applications.id, applicationId));
}

