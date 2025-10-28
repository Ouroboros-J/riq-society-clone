import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { and, eq, lt, isNotNull } from "drizzle-orm";

/**
 * 만료된 회원 목록 조회
 * membershipExpiryDate가 현재 시간보다 이전이고, role이 여전히 "member"인 사용자
 */
export async function getExpiredMembers() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get expired members: database not available");
    return [];
  }

  const now = new Date();
  
  return await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.role, "member"),
        isNotNull(users.membershipExpiryDate),
        lt(users.membershipExpiryDate, now)
      )
    );
}

/**
 * 만료된 회원의 role을 "user"로 변경
 */
export async function downgradeExpiredMembers() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot downgrade expired members: database not available");
    return { count: 0 };
  }

  const expiredMembers = await getExpiredMembers();
  
  if (expiredMembers.length === 0) {
    console.log("[Membership] No expired members found");
    return { count: 0 };
  }

  // 각 만료된 회원의 role을 "user"로 변경
  for (const member of expiredMembers) {
    await db
      .update(users)
      .set({ 
        role: "user",
        updatedAt: new Date()
      })
      .where(eq(users.id, member.id));
    
    console.log(`[Membership] Downgraded user ${member.id} (${member.email}) from member to user`);
  }

  return { count: expiredMembers.length };
}

/**
 * 회원 기간 연장
 */
export async function renewMembership(
  userId: number,
  membershipType: "annual" | "lifetime",
  customExpiryDate?: Date
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot renew membership: database not available");
    return null;
  }

  const now = new Date();
  let membershipExpiryDate: Date | null;

  if (customExpiryDate) {
    // 수동 날짜 설정
    membershipExpiryDate = customExpiryDate;
  } else if (membershipType === "lifetime") {
    // 평생회원
    membershipExpiryDate = null;
  } else {
    // 연회원: 현재 만료일 또는 현재 시간에서 1년 연장
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user) {
      throw new Error("User not found");
    }

    const baseDate = user.membershipExpiryDate && user.membershipExpiryDate > now
      ? user.membershipExpiryDate
      : now;
    
    membershipExpiryDate = new Date(baseDate.getTime() + 365 * 24 * 60 * 60 * 1000);
  }

  await db
    .update(users)
    .set({
      membershipType,
      membershipExpiryDate,
      membershipRenewedAt: now,
      updatedAt: now
    })
    .where(eq(users.id, userId));

  return { success: true, membershipExpiryDate };
}

/**
 * 만료 임박 회원 조회 (N일 이내)
 */
export async function getMembersExpiringWithin(days: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get expiring members: database not available");
    return [];
  }

  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.role, "member"),
        eq(users.membershipType, "annual"),
        isNotNull(users.membershipExpiryDate),
        lt(users.membershipExpiryDate, futureDate)
      )
    );
}

