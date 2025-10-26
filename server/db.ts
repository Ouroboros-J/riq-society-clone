import { and, desc, eq, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { badges, certificates, InsertBadge, InsertCertificate, InsertPointTransaction, InsertUser, InsertUserBadge, pointTransactions, userBadges, users } from "../drizzle/schema";
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


// Points system
export async function addPoints(userId: number, amount: number, reason: string, referenceId?: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const transaction: InsertPointTransaction = {
    userId,
    amount,
    reason,
    referenceId,
  };

  await db.insert(pointTransactions).values(transaction);
}

export async function getUserPoints(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const transactions = await db.select().from(pointTransactions).where(eq(pointTransactions.userId, userId));
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}

export async function getUserPointHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(pointTransactions).where(eq(pointTransactions.userId, userId)).orderBy(desc(pointTransactions.createdAt));
}

// Badges
export async function createBadge(badge: InsertBadge) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(badges).values(badge);
  return badge;
}

export async function getAllBadges() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(badges);
}

export async function purchaseBadge(userId: number, badgeId: number): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) return { success: false, message: "Database not available" };

  // Check if user already owns the badge
  const existing = await db.select().from(userBadges).where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)));
  if (existing.length > 0) {
    return { success: false, message: "You already own this badge" };
  }

  // Get badge info
  const badgeInfo = await db.select().from(badges).where(eq(badges.id, badgeId));
  if (badgeInfo.length === 0) {
    return { success: false, message: "Badge not found" };
  }

  const badge = badgeInfo[0];
  const userPoints = await getUserPoints(userId);

  if (userPoints < badge.price) {
    return { success: false, message: "Insufficient points" };
  }

  // Deduct points
  await addPoints(userId, -badge.price, "badge_purchase", badgeId);

  // Add badge to user
  const userBadge: InsertUserBadge = {
    userId,
    badgeId,
  };
  await db.insert(userBadges).values(userBadge);

  return { success: true, message: "Badge purchased successfully" };
}

export async function getUserBadges(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      id: userBadges.id,
      badgeId: userBadges.badgeId,
      purchasedAt: userBadges.purchasedAt,
      name: badges.name,
      description: badges.description,
      icon: badges.icon,
    })
    .from(userBadges)
    .leftJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.userId, userId));

  return result;
}

// Ranking system
export async function getAllTimeRanking(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  // Get all users with their total points
  const allUsers = await db.select().from(users);
  const userPoints = await Promise.all(
    allUsers.map(async (user) => ({
      userId: user.id,
      name: user.name,
      email: user.email,
      points: await getUserPoints(user.id),
    }))
  );

  return userPoints
    .sort((a, b) => b.points - a.points)
    .slice(0, limit);
}

export async function getWeeklyRanking(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  // Get all users
  const allUsers = await db.select().from(users);
  
  // Get points for each user in the last week
  const userPoints = await Promise.all(
    allUsers.map(async (user) => {
      const transactions = await db
        .select()
        .from(pointTransactions)
        .where(
          and(
            eq(pointTransactions.userId, user.id),
            // Note: MySQL timestamp comparison
            // We'll filter in memory for simplicity
          )
        );
      
      const weeklyPoints = transactions
        .filter(t => new Date(t.createdAt) >= weekAgo)
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        points: weeklyPoints,
      };
    })
  );

  return userPoints
    .sort((a, b) => b.points - a.points)
    .slice(0, limit);
}

export async function getMonthlyRanking(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);

  // Get all users
  const allUsers = await db.select().from(users);
  
  // Get points for each user in the last month
  const userPoints = await Promise.all(
    allUsers.map(async (user) => {
      const transactions = await db
        .select()
        .from(pointTransactions)
        .where(eq(pointTransactions.userId, user.id));
      
      const monthlyPoints = transactions
        .filter(t => new Date(t.createdAt) >= monthAgo)
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        points: monthlyPoints,
      };
    })
  );

  return userPoints
    .sort((a, b) => b.points - a.points)
    .slice(0, limit);
}

// TODO: add feature queries here as your schema grows.
