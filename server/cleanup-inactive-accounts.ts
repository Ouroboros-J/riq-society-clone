import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { and, lt, or, isNull, sql } from "drizzle-orm";
import { sendEmail } from "./_core/email";

/**
 * 휴면 계정을 조회하고 관리하는 함수들
 * 
 * 휴면 계정 조건:
 * - 입회 승인된 적이 없음 (approvalStatus != 'approved')
 * - 일정 기간(기본 90일) 이상 로그인하지 않음
 */

interface InactiveAccount {
  id: number;
  email: string | null;
  name: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
}

/**
 * 휴면 계정 알림 이메일 발송
 */
export async function notifyInactiveAccounts(inactiveDays: number = 90): Promise<{
  notifiedCount: number;
  notifiedUserIds: number[];
  errors: string[];
}> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database connection failed');
  }
  
  const errors: string[] = [];
  const notifiedUserIds: number[] = [];
  
  try {
    // 휴면 계정 기준 날짜 계산
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - inactiveDays);
    
    // 휴면 계정 조회
    const inactiveUsers = await db
      .select()
      .from(users)
      .where(
        and(
          // 입회 승인되지 않음
          sql`${users.approvalStatus} != 'approved'`,
          // 마지막 로그인이 90일 이전이거나 null (한 번도 로그인 안 함)
          or(
            isNull(users.lastLoginAt),
            lt(users.lastLoginAt, thresholdDate)
          ),
          // 휴면 알림을 아직 받지 않았거나, 알림 후 7일 이내
          or(
            isNull(users.dormancyNotifiedAt),
            sql`${users.dormancyNotifiedAt} < DATE_SUB(NOW(), INTERVAL 7 DAY)`
          )
        )
      );
    
    console.log(`Found ${inactiveUsers.length} inactive accounts to notify`);
    
    // 각 휴면 계정에 알림 이메일 발송
    for (const user of inactiveUsers) {
      try {
        if (!user.email) {
          console.log(`Skipping user ${user.id}: no email address`);
          continue;
        }
        
        await sendEmail({
          to: user.email,
          subject: '[RIQ Society] 휴면 계정 알림 - 계정 삭제 예정',
          html: `
            <h2>휴면 계정 알림</h2>
            <p>안녕하세요, ${user.name || user.email}님.</p>
            <p>귀하의 RIQ Society 계정이 ${inactiveDays}일 이상 사용되지 않아 휴면 계정으로 분류되었습니다.</p>
            <p><strong>7일 이내에 로그인하지 않으시면 계정이 자동으로 삭제됩니다.</strong></p>
            <p>계정을 유지하시려면 아래 링크를 클릭하여 로그인해주세요:</p>
            <p><a href="${process.env.VITE_APP_URL || 'https://riqsociety.org'}/login">로그인하기</a></p>
            <p>감사합니다.<br>RIQ Society</p>
          `,
        });
        
        // 휴면 알림 발송 시간 기록
        await db
          .update(users)
          .set({ dormancyNotifiedAt: new Date() })
          .where(sql`${users.id} = ${user.id}`);
        
        notifiedUserIds.push(user.id);
        console.log(`Sent dormancy notification to user ${user.id} (${user.email})`);
        
      } catch (error) {
        const errorMsg = `Failed to notify user ${user.id}: ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }
    
    return {
      notifiedCount: notifiedUserIds.length,
      notifiedUserIds,
      errors,
    };
    
  } catch (error) {
    console.error('Error in notifyInactiveAccounts:', error);
    throw error;
  }
}

/**
 * 휴면 계정 삭제 (알림 후 7일 경과)
 */
export async function deleteInactiveAccounts(): Promise<{
  deletedCount: number;
  deletedUserIds: number[];
  errors: string[];
}> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database connection failed');
  }
  
  const errors: string[] = [];
  const deletedUserIds: number[] = [];
  
  try {
    // 알림 후 7일 경과한 휴면 계정 조회
    const accountsToDelete = await db
      .select()
      .from(users)
      .where(
        and(
          // 입회 승인되지 않음
          sql`${users.approvalStatus} != 'approved'`,
          // 휴면 알림을 받은 지 7일 이상 경과
          sql`${users.dormancyNotifiedAt} IS NOT NULL AND ${users.dormancyNotifiedAt} < DATE_SUB(NOW(), INTERVAL 7 DAY)`
        )
      );
    
    console.log(`Found ${accountsToDelete.length} inactive accounts to delete`);
    
    // 각 계정 삭제
    for (const user of accountsToDelete) {
      try {
        if (!user.email) {
          console.log(`Skipping user ${user.id}: no email address`);
          continue;
        }
        
        // 계정 삭제 전 최종 알림 이메일 발송
        await sendEmail({
          to: user.email,
          subject: '[RIQ Society] 계정이 삭제되었습니다',
          html: `
            <h2>계정 삭제 완료</h2>
            <p>안녕하세요, ${user.name || user.email}님.</p>
            <p>귀하의 RIQ Society 계정이 휴면 상태로 인해 삭제되었습니다.</p>
            <p>다시 가입을 원하시면 언제든지 신규 가입하실 수 있습니다.</p>
            <p>감사합니다.<br>RIQ Society</p>
          `,
        });
        
        // 계정 삭제
        await db
          .delete(users)
          .where(sql`${users.id} = ${user.id}`);
        
        deletedUserIds.push(user.id);
        console.log(`Deleted inactive account ${user.id} (${user.email})`);
        
      } catch (error) {
        const errorMsg = `Failed to delete user ${user.id}: ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }
    
    return {
      deletedCount: deletedUserIds.length,
      deletedUserIds,
      errors,
    };
    
  } catch (error) {
    console.error('Error in deleteInactiveAccounts:', error);
    throw error;
  }
}

/**
 * 휴면 계정 조회 (알림 발송 전)
 */
export async function getInactiveAccounts(inactiveDays: number = 90): Promise<InactiveAccount[]> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database connection failed');
  }
  
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - inactiveDays);
  
  const inactiveUsers = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(
      and(
        // 입회 승인되지 않음
        sql`${users.approvalStatus} != 'approved'`,
        // 마지막 로그인이 90일 이전이거나 null
        or(
          isNull(users.lastLoginAt),
          lt(users.lastLoginAt, thresholdDate)
        )
      )
    );
  
  return inactiveUsers;
}

