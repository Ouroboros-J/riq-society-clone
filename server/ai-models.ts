/**
 * AI 모델 목록 동적 로딩
 * 각 플랫폼별로 사용 가능한 모델 목록을 API를 통해 조회
 */

interface ModelInfo {
  id: string;
  name: string;
  description?: string;
}

/**
 * OpenAI 모델 목록 조회
 */
export async function getOpenAIModels(apiKey: string): Promise<ModelInfo[]> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // 모든 모델 반환
    const models = data.data.map((model: any) => ({
      id: model.id,
      name: model.id,
      description: `OpenAI ${model.id}`,
    }));

    return models;
  } catch (error) {
    console.error('Failed to fetch OpenAI models:', error);
    return [];
  }
}

/**
 * Claude 모델 목록 조회
 */
export async function getClaudeModels(apiKey: string): Promise<ModelInfo[]> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // 모든 모델 반환
    const models = data.data.map((model: any) => ({
      id: model.id,
      name: model.display_name || model.id,
      description: `Anthropic ${model.display_name || model.id}`,
    }));

    return models;
  } catch (error) {
    console.error('Failed to fetch Claude models:', error);
    return [];
  }
}

/**
 * Gemini 모델 목록 조회
 */
export async function getGeminiModels(apiKey: string): Promise<ModelInfo[]> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // generateContent 지원 모델만 필터링 (채팅 가능한 모델)
    const models = data.models
      .filter((model: any) => model.supportedGenerationMethods?.includes('generateContent'))
      .map((model: any) => ({
        id: model.name.replace('models/', ''),
        name: model.displayName || model.name.replace('models/', ''),
        description: model.description || `Google ${model.displayName}`,
      }));

    return models;
  } catch (error) {
    console.error('Failed to fetch Gemini models:', error);
    return [];
  }
}

/**
 * Perplexity 모델 목록 조회
 * Perplexity API는 모델 목록 조회 엔드포인트를 제공하지 않으므로 정적 목록 반환
 * 출처: https://docs.perplexity.ai/getting-started/models
 */
export async function getPerplexityModels(apiKey?: string): Promise<ModelInfo[]> {
  return [
    // Sonar Models (Online)
    { id: 'sonar', name: 'Sonar', description: 'Perplexity Sonar - Online LLM' },
    { id: 'sonar-pro', name: 'Sonar Pro', description: 'Perplexity Sonar Pro - Advanced Online LLM' },
    
    // Chat Models (Offline)
    { id: 'llama-3.1-sonar-small-128k-chat', name: 'Llama 3.1 Sonar Small 128k Chat', description: 'Small offline chat model' },
    { id: 'llama-3.1-sonar-large-128k-chat', name: 'Llama 3.1 Sonar Large 128k Chat', description: 'Large offline chat model' },
    { id: 'llama-3.1-sonar-huge-128k-chat', name: 'Llama 3.1 Sonar Huge 128k Chat', description: 'Huge offline chat model' },
  ];
}

/**
 * 플랫폼별 모델 목록 조회
 */
export async function getModelsByPlatform(platform: string, apiKey?: string): Promise<ModelInfo[]> {
  switch (platform.toLowerCase()) {
    case 'openai':
      return apiKey ? await getOpenAIModels(apiKey) : [];
    case 'claude':
      return apiKey ? await getClaudeModels(apiKey) : [];
    case 'gemini':
      return apiKey ? await getGeminiModels(apiKey) : [];
    case 'perplexity':
      return await getPerplexityModels(apiKey);
    default:
      return [];
  }
}

