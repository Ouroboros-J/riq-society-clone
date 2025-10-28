import { getDb } from "./db";
import { applications } from "../drizzle/schema";
import { and, lt, or, isNull, sql } from "drizzle-orm";
import { storageDelete } from "./storage";

/**
 * 미승인 신청자의 서류를 자동 파기하는 함수
 * 
 * 조건 (모두 충족해야 파기):
 * - 신청서 제출일로부터 30일 이상 경과
 * - 입회 승인된 적이 없음 (status != 'approved')
 * - documentUrls가 존재
 * 
 * 서류 유지 조건:
 * - 입회가 승인됨 (status = 'approved') - 자격을 갖추었다고 판단된 경우
 * 
 * 주의: 연회비 결제 여부와 관계없이 입회 승인 여부만으로 판단
 */
export async function cleanupUnpaidDocuments(daysThreshold: number = 30): Promise<{
  deletedCount: number;
  deletedApplicationIds: number[];
  errors: string[];
}> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database connection failed');
  }
  
  const errors: string[] = [];
  const deletedApplicationIds: number[] = [];
  
  try {
    // 30일 이전 날짜 계산
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);
    
    // 미승인 신청서 조회 (서류가 있는 경우만)
    const unapprovedApplications = await db
      .select()
      .from(applications)
      .where(
        and(
          // 제출일이 30일 이전
          lt(applications.submittedAt, thresholdDate),
          // 입회 승인되지 않음
          sql`${applications.status} != 'approved'`,
          // 서류 URL이 존재
          sql`${applications.documentUrls} IS NOT NULL AND ${applications.documentUrls} != ''`
        )
      );
    
    console.log(`Found ${unapprovedApplications.length} unapproved applications with documents older than ${daysThreshold} days`);
    
    // 각 신청서의 서류 삭제
    for (const application of unapprovedApplications) {
      try {
        if (!application.documentUrls) continue;
        
        // documentUrls는 JSON 배열 문자열 형태
        const documentUrls: string[] = JSON.parse(application.documentUrls);
        
        // 각 서류 파일 삭제
        for (const url of documentUrls) {
          try {
            // S3 URL에서 키 추출 (예: https://bucket.s3.region.amazonaws.com/key -> key)
            const urlObj = new URL(url);
            const key = urlObj.pathname.substring(1); // 앞의 '/' 제거
            
            await storageDelete(key);
            console.log(`Deleted document: ${key}`);
          } catch (error) {
            const errorMsg = `Failed to delete document ${url}: ${error}`;
            console.error(errorMsg);
            errors.push(errorMsg);
          }
        }
        
        // 데이터베이스에서 서류 URL 제거
        await db
          .update(applications)
          .set({ documentUrls: null })
          .where(sql`${applications.id} = ${application.id}`);
        
        deletedApplicationIds.push(application.id);
        console.log(`Cleared documentUrls for application ${application.id}`);
        
      } catch (error) {
        const errorMsg = `Failed to process application ${application.id}: ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }
    
    return {
      deletedCount: deletedApplicationIds.length,
      deletedApplicationIds,
      errors,
    };
    
  } catch (error) {
    console.error('Error in cleanupUnpaidDocuments:', error);
    throw error;
  }
}

/**
 * 특정 신청서의 서류만 삭제하는 함수
 */
export async function deleteApplicationDocuments(applicationId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    return false;
  }
  
  try {
    const application = await db
      .select()
      .from(applications)
      .where(sql`${applications.id} = ${applicationId}`)
      .limit(1);
    
    if (!application[0] || !application[0].documentUrls) {
      return false;
    }
    
    const documentUrls: string[] = JSON.parse(application[0].documentUrls);
    
    // 각 서류 파일 삭제
    for (const url of documentUrls) {
      try {
        const urlObj = new URL(url);
        const key = urlObj.pathname.substring(1);
        await storageDelete(key);
      } catch (error) {
        console.error(`Failed to delete document ${url}:`, error);
      }
    }
    
    // 데이터베이스에서 서류 URL 제거
    await db
      .update(applications)
      .set({ documentUrls: null })
      .where(sql`${applications.id} = ${applicationId}`);
    
    return true;
    
  } catch (error) {
    console.error('Error in deleteApplicationDocuments:', error);
    return false;
  }
}

