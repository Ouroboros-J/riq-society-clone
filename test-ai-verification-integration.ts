/**
 * AI 검증 통합 테스트
 * - 테스트 이미지를 S3에 업로드
 * - AI 검증 함수 호출
 * - 결과 확인
 */

import { storagePut } from './server/storage';
import { verifyApplicationWithAI } from './server/ai-verification';
import { readFileSync } from 'fs';

async function testAiVerificationIntegration() {
  console.log('🧪 AI 검증 통합 테스트 시작\n');

  try {
    // 1. 테스트 이미지 읽기
    console.log('📁 테스트 이미지 읽기...');
    const identityDocument = readFileSync('/home/ubuntu/test-identity-document.png');
    const testResult = readFileSync('/home/ubuntu/test-iq-result.png');
    console.log('✅ 이미지 읽기 완료\n');

    // 2. S3에 업로드
    console.log('☁️  S3에 업로드 중...');
    const identityUpload = await storagePut(
      `test/identity-${Date.now()}.png`,
      identityDocument,
      'image/png'
    );
    const testResultUpload = await storagePut(
      `test/test-result-${Date.now()}.png`,
      testResult,
      'image/png'
    );
    console.log('✅ S3 업로드 완료');
    console.log('  - 신원 증명:', identityUpload.url);
    console.log('  - 시험 결과:', testResultUpload.url);
    console.log('');

    // 3. AI 검증 실행
    console.log('🤖 AI 검증 실행 중...\n');
    const result = await verifyApplicationWithAI(
      'Stanford-Binet IQ Test', // testName
      '145', // testScore
      'IQ Test', // testCategory
      identityUpload.url, // identityDocumentUrl
      testResultUpload.url // testResultUrl
    );

    // 4. 결과 출력
    console.log('📊 AI 검증 결과:\n');
    console.log('승인 여부:', result.approved ? '✅ 승인' : '❌ 거부');
    console.log('신뢰도:', result.confidence);
    console.log('사유:', result.reason);
    console.log('');

    if (result.details) {
      console.log('상세 정보:');
      console.log(JSON.stringify(result.details, null, 2));
      console.log('');
    }

    console.log('🎉 테스트 완료!\n');

  } catch (error: any) {
    console.error('❌ 테스트 실패:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
  }
}

testAiVerificationIntegration();

