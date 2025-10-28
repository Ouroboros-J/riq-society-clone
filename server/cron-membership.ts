import { downgradeExpiredMembers, getMembersExpiringWithin } from "./db-membership";

/**
 * 매일 자정에 실행: 만료된 회원 자동 등급 하락
 */
export async function checkAndDowngradeExpiredMembers() {
  console.log("[Cron] Checking for expired members...");
  
  try {
    const result = await downgradeExpiredMembers();
    console.log(`[Cron] Downgraded ${result.count} expired members`);
    return result;
  } catch (error) {
    console.error("[Cron] Error downgrading expired members:", error);
    throw error;
  }
}

/**
 * 만료 임박 회원 알림 (30일, 7일, 1일 전)
 */
export async function notifyExpiringMembers() {
  console.log("[Cron] Checking for expiring members...");
  
  try {
    // 30일 이내 만료 예정
    const expiring30 = await getMembersExpiringWithin(30);
    console.log(`[Cron] ${expiring30.length} members expiring within 30 days`);
    
    // TODO: 이메일 알림 발송
    // for (const member of expiring30) {
    //   await sendMembershipExpiryNotification(member.email!, member.name!, 30);
    // }
    
    // 7일 이내 만료 예정
    const expiring7 = await getMembersExpiringWithin(7);
    console.log(`[Cron] ${expiring7.length} members expiring within 7 days`);
    
    // TODO: 이메일 알림 발송
    
    // 1일 이내 만료 예정
    const expiring1 = await getMembersExpiringWithin(1);
    console.log(`[Cron] ${expiring1.length} members expiring within 1 day`);
    
    // TODO: 이메일 알림 발송
    
    return {
      expiring30: expiring30.length,
      expiring7: expiring7.length,
      expiring1: expiring1.length
    };
  } catch (error) {
    console.error("[Cron] Error notifying expiring members:", error);
    throw error;
  }
}

