/**
 * OpenRouter API 테스트 스크립트
 * 1. 모델 목록 가져오기
 * 2. Vision 지원 모델 필터링
 * 3. Chat Completions API 테스트 (이미지 포함)
 */

// OpenRouter API 키가 필요합니다
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

if (!OPENROUTER_API_KEY) {
  console.error('❌ OPENROUTER_API_KEY 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

interface OpenRouterModel {
  id: string;
  name: string;
  created: number;
  pricing: {
    prompt: string;
    completion: string;
    request: string;
    image: string;
  };
  context_length: number;
  architecture: {
    modality: string;
    input_modalities: string[];
    output_modalities: string[];
    tokenizer: string;
    instruct_type: string | null;
  };
  top_provider: {
    is_moderated: boolean;
    context_length: number;
    max_completion_tokens: number | null;
  };
  description: string;
}

async function getModels(): Promise<OpenRouterModel[]> {
  console.log('\n📋 OpenRouter 모델 목록 가져오기...\n');
  
  const response = await fetch('https://openrouter.ai/api/v1/models', {
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
}

function filterVisionModels(models: OpenRouterModel[]): OpenRouterModel[] {
  return models.filter(model => {
    // Vision 지원 모델 = input_modalities에 'image' 포함
    return model.architecture.input_modalities.includes('image');
  });
}

function groupModelsByProvider(models: OpenRouterModel[]): Map<string, OpenRouterModel[]> {
  const grouped = new Map<string, OpenRouterModel[]>();
  
  for (const model of models) {
    // ID에서 provider 추출 (예: "openai/gpt-4" → "openai")
    const provider = model.id.split('/')[0];
    
    if (!grouped.has(provider)) {
      grouped.set(provider, []);
    }
    
    grouped.get(provider)!.push(model);
  }
  
  return grouped;
}

async function testChatCompletion(modelId: string) {
  console.log(`\n🤖 Chat Completions API 테스트 (모델: ${modelId})...\n`);
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        {
          role: 'user',
          content: 'Hello! Can you see this message?',
        },
      ],
      max_tokens: 100,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('✅ 응답:', data.choices[0].message.content);
  console.log('📊 사용량:', data.usage);
}

async function main() {
  try {
    // 1. 모델 목록 가져오기
    const allModels = await getModels();
    console.log(`✅ 총 ${allModels.length}개 모델 발견`);

    // 2. Vision 지원 모델 필터링
    const visionModels = filterVisionModels(allModels);
    console.log(`✅ Vision 지원 모델: ${visionModels.length}개`);

    // 3. Provider별 그룹화
    const groupedModels = groupModelsByProvider(visionModels);
    console.log(`\n📦 Provider별 Vision 모델 수:\n`);
    
    for (const [provider, models] of groupedModels.entries()) {
      console.log(`  - ${provider}: ${models.length}개`);
      
      // 각 provider의 첫 3개 모델만 출력
      models.slice(0, 3).forEach(model => {
        console.log(`    • ${model.id} (${model.name})`);
      });
      
      if (models.length > 3) {
        console.log(`    ... 외 ${models.length - 3}개`);
      }
    }

    // 4. 주요 provider 모델 테스트
    console.log(`\n🧪 주요 Provider 모델 테스트:\n`);
    
    const testProviders = ['openai', 'anthropic', 'google'];
    
    for (const provider of testProviders) {
      const models = groupedModels.get(provider);
      if (models && models.length > 0) {
        console.log(`\n--- ${provider.toUpperCase()} ---`);
        await testChatCompletion(models[0].id);
      }
    }

  } catch (error) {
    console.error('❌ 에러:', error);
    process.exit(1);
  }
}

main();

