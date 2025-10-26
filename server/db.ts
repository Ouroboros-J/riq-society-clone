import { and, desc, eq, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { badges, certificates, comments, InsertBadge, InsertCertificate, InsertComment, InsertPointTransaction, InsertPost, InsertPostLike, InsertUser, InsertUserBadge, pointTransactions, postLikes, posts, userBadges, users } from "../drizzle/schema";
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

// Post functions
export async function getAllPosts(limit?: number, offset?: number, search?: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get posts: database not available");
    return [];
  }

  let query = db.select().from(posts).orderBy(desc(posts.createdAt));
  
  if (search) {
    query = query.where(
      or(
        like(posts.title, `%${search}%`),
        like(posts.content, `%${search}%`)
      )
    ) as any;
  }
  
  if (limit) {
    query = query.limit(limit) as any;
  }
  
  if (offset) {
    query = query.offset(offset) as any;
  }

  const result = await query;
  return result;
}

export async function getPostById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get post: database not available");
    return null;
  }

  const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createPost(post: InsertPost) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create post: database not available");
    return null;
  }

  const result = await db.insert(posts).values(post);
  return result;
}

export async function updatePost(id: number, title: string, content: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update post: database not available");
    return null;
  }

  const result = await db.update(posts).set({ title, content }).where(eq(posts.id, id));
  return result;
}

export async function deletePost(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete post: database not available");
    return null;
  }

  // Delete comments first
  await db.delete(comments).where(eq(comments.postId, id));
  
  const result = await db.delete(posts).where(eq(posts.id, id));
  return result;
}

export async function incrementPostViewCount(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot increment view count: database not available");
    return null;
  }

  const post = await getPostById(id);
  if (!post) return null;

  const result = await db.update(posts).set({ viewCount: post.viewCount + 1 }).where(eq(posts.id, id));
  return result;
}

// Comment functions
export async function getCommentsByPostId(postId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get comments: database not available");
    return [];
  }

  const result = await db.select().from(comments).where(eq(comments.postId, postId)).orderBy(desc(comments.createdAt));
  return result;
}

export async function createComment(comment: InsertComment) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create comment: database not available");
    return null;
  }

  const result = await db.insert(comments).values(comment);
  return result;
}

export async function updateComment(id: number, content: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update comment: database not available");
    return null;
  }

  const result = await db.update(comments).set({ content }).where(eq(comments.id, id));
  return result;
}

export async function deleteComment(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete comment: database not available");
    return null;
  }

  const result = await db.delete(comments).where(eq(comments.id, id));
  return result;
}

// Post Like functions
export async function getPostLike(postId: number, userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get post like: database not available");
    return null;
  }

  const result = await db.select().from(postLikes).where(
    and(eq(postLikes.postId, postId), eq(postLikes.userId, userId))
  ).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createPostLike(like: InsertPostLike) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create post like: database not available");
    return null;
  }

  const result = await db.insert(postLikes).values(like);
  return result;
}

export async function deletePostLike(postId: number, userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete post like: database not available");
    return null;
  }

  const result = await db.delete(postLikes).where(
    and(eq(postLikes.postId, postId), eq(postLikes.userId, userId))
  );
  return result;
}

export async function incrementPostLikeCount(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot increment like count: database not available");
    return null;
  }

  const post = await getPostById(id);
  if (!post) return null;

  const result = await db.update(posts).set({ likeCount: post.likeCount + 1 }).where(eq(posts.id, id));
  return result;
}

export async function decrementPostLikeCount(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot decrement like count: database not available");
    return null;
  }

  const post = await getPostById(id);
  if (!post) return null;

  const result = await db.update(posts).set({ likeCount: Math.max(0, post.likeCount - 1) }).where(eq(posts.id, id));
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

// TODO: add feature queries here as your schema grows.
