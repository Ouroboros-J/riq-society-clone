import { getDb } from './server/db';
import * as schema from './drizzle/schema';

async function debugAIVerification() {
  const db = await getDb();
  
  // 1. AI 설정 확인
  console.log('\n=== AI 설정 확인 ===');
  const aiSettings = await db.select().from(schema.aiSettings);
  console.log('AI Settings:', JSON.stringify(aiSettings, null, 2));
  
  // 2. 최근 입회 신청 확인
  console.log('\n=== 최근 입회 신청 확인 ===');
  const applications = await db.select().from(schema.applications).limit(1);
  console.log('Latest Application:', JSON.stringify(applications[0], null, 2));
  
  // 3. AI 검증 결과 확인
  if (applications[0]) {
    console.log('\n=== AI 검증 결과 확인 ===');
    console.log('aiVerificationResult:', applications[0].aiVerificationResult);
    console.log('aiVerificationStatus:', applications[0].aiVerificationStatus);
  }
}

debugAIVerification().catch(console.error);

