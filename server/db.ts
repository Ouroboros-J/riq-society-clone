import { and, desc, eq, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { certificates, InsertCertificate, InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get users: database not available");
    return [];
  }

  const result = await db.select().from(users);
  return result;
}

export async function getUserCertificates(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get certificates: database not available");
    return [];
  }

  const result = await db.select().from(certificates).where(eq(certificates.userId, userId));
  return result;
}

export async function getAllCertificates() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get certificates: database not available");
    return [];
  }

  const result = await db.select().from(certificates);
  return result;
}

export async function createCertificate(certificate: InsertCertificate) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create certificate: database not available");
    return null;
  }

  const result = await db.insert(certificates).values(certificate);
  return result;
}

export async function getCertificateById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get certificate: database not available");
    return null;
  }

  const result = await db.select().from(certificates).where(eq(certificates.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateCertificateStatus(
  id: number,
  status: "pending" | "approved" | "rejected",
  rejectionReason?: string
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update certificate: database not available");
    return null;
  }

  const updateData: any = { status };
  if (rejectionReason) {
    updateData.rejectionReason = rejectionReason;
  }

  const result = await db.update(certificates).set(updateData).where(eq(certificates.id, id));
  return result;
}

export async function updateUserApprovalStatus(
  userId: number,
  approvalStatus: "pending" | "approved" | "rejected"
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user approval: database not available");
    return null;
  }

  const result = await db.update(users).set({ approvalStatus }).where(eq(users.id, userId));
  return result;
}


