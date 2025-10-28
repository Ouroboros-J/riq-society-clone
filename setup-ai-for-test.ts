/**
 * AI 설정 저장 및 테스트 준비
 */

import { upsertAiSetting } from './server/db-ai-settings';

async function setupAiSettings() {
  console.log('🔧 AI 설정 저장 중...\n');

  try {
    // Perplexity 설정 (sonar-pro 모델)
    const perplexityKey = process.env.SONAR_API_KEY;
    if (perplexityKey) {
      await upsertAiSetting({
        platform: 'perplexity',
        apiKey: perplexityKey,
        selectedModel: 'sonar-pro',
        isEnabled: 1
      });
      console.log('✅ Perplexity 설정 완료 (sonar-pro)');
    } else {
      console.log('⚠️  Perplexity API 키가 없습니다.');
    }

    // Google Gemini 설정
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      await upsertAiSetting({
        platform: 'google',
        apiKey: geminiKey,
        selectedModel: 'gemini-2.0-flash-exp',
        isEnabled: 1
      });
      console.log('✅ Google Gemini 설정 완료 (gemini-2.0-flash-exp)');
    } else {
      console.log('⚠️  Google Gemini API 키가 없습니다.');
    }

    // Anthropic Claude 설정
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicKey) {
      await upsertAiSetting({
        platform: 'anthropic',
        apiKey: anthropicKey,
        selectedModel: 'claude-3-5-sonnet-20241022',
        isEnabled: 1
      });
      console.log('✅ Anthropic Claude 설정 완료 (claude-3-5-sonnet-20241022)');
    } else {
      console.log('⚠️  Anthropic API 키가 없습니다.');
    }

    console.log('\n🎉 AI 설정 저장 완료!');
    console.log('\n📋 다음 단계:');
    console.log('  1. 테스트용 이미지/PDF 파일 준비');
    console.log('  2. AI 검증 함수 직접 호출 테스트');
    console.log('  3. 결과 확인\n');

  } catch (error: any) {
    console.error('❌ AI 설정 저장 실패:', error.message);
  }
}

setupAiSettings();

