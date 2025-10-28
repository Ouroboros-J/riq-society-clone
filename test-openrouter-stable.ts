/**
 * OpenRouter API 테스트 - 안정적인 모델만 사용
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

if (!OPENROUTER_API_KEY) {
  console.error('❌ OPENROUTER_API_KEY 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

async function testChatCompletion(modelId: string, modelName: string) {
  console.log(`\n🤖 테스트: ${modelName} (${modelId})`);
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://riqsociety.org',
        'X-Title': 'RIQ Society',
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: 'user',
            content: 'Hello! Please respond with "OK" if you can see this message.',
          },
        ],
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`  ❌ 실패: ${response.status} - ${errorText.substring(0, 100)}`);
      return false;
    }

    const data = await response.json();
    console.log(`  ✅ 성공: ${data.choices[0].message.content}`);
    console.log(`  📊 사용량: ${JSON.stringify(data.usage)}`);
    return true;
  } catch (error: any) {
    console.log(`  ❌ 에러: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔍 OpenRouter API 테스트 (안정적인 모델만)\n');
  
  // 안정적이고 널리 사용되는 Vision 모델들
  const stableModels = [
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
    { id: 'google/gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash' },
    { id: 'openai/gpt-4o', name: 'GPT-4o' },
    { id: 'perplexity/sonar-pro', name: 'Perplexity Sonar Pro' },
  ];
  
  let successCount = 0;
  
  for (const model of stableModels) {
    const success = await testChatCompletion(model.id, model.name);
    if (success) successCount++;
    
    // API 레이트 리밋 방지
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n\n📊 테스트 결과: ${successCount}/${stableModels.length} 성공`);
  
  if (successCount === 0) {
    console.error('\n❌ 모든 모델 테스트 실패. OpenRouter API 키 또는 크레딧을 확인하세요.');
    process.exit(1);
  } else {
    console.log('\n✅ OpenRouter API 정상 작동 확인!');
  }
}

main();

