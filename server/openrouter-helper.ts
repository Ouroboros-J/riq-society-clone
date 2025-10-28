/**
 * OpenRouter API Helper Functions
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export interface OpenRouterModel {
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

export interface OpenRouterModelsByProvider {
  provider: string;
  models: OpenRouterModel[];
}

/**
 * OpenRouter에서 모든 모델 목록 가져오기
 */
export async function getAllModels(): Promise<OpenRouterModel[]> {
  const response = await fetch(`${OPENROUTER_BASE_URL}/models`, {
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

/**
 * Vision 지원 모델만 필터링
 */
export function filterVisionModels(models: OpenRouterModel[]): OpenRouterModel[] {
  return models.filter(model => {
    // Vision 지원 모델 = input_modalities에 'image' 포함
    return model.architecture.input_modalities.includes('image');
  });
}

/**
 * Provider별로 모델 그룹화
 */
export function groupModelsByProvider(models: OpenRouterModel[]): OpenRouterModelsByProvider[] {
  const grouped = new Map<string, OpenRouterModel[]>();
  
  for (const model of models) {
    // ID에서 provider 추출 (예: "openai/gpt-4" → "openai")
    const provider = model.id.split('/')[0];
    
    if (!grouped.has(provider)) {
      grouped.set(provider, []);
    }
    
    grouped.get(provider)!.push(model);
  }
  
  // Map을 배열로 변환
  return Array.from(grouped.entries()).map(([provider, models]) => ({
    provider,
    models,
  }));
}

/**
 * 특정 Provider의 Vision 모델 목록 가져오기
 */
export async function getVisionModelsByProvider(provider: string): Promise<OpenRouterModel[]> {
  const allModels = await getAllModels();
  const visionModels = filterVisionModels(allModels);
  
  return visionModels.filter(model => model.id.startsWith(`${provider}/`));
}

/**
 * 모든 Provider 목록 가져오기 (Vision 모델이 있는 Provider만)
 */
export async function getProvidersWithVision(): Promise<string[]> {
  const allModels = await getAllModels();
  const visionModels = filterVisionModels(allModels);
  const grouped = groupModelsByProvider(visionModels);
  
  return grouped.map(g => g.provider).sort();
}

/**
 * OpenRouter Chat Completions API 호출
 */
export async function callOpenRouterChatCompletion(
  modelId: string,
  messages: any[],
  maxTokens: number = 1000
): Promise<any> {
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://riqsociety.org',
      'X-Title': 'RIQ Society',
    },
    body: JSON.stringify({
      model: modelId,
      messages,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

