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
    
    // GPT-4 Vision 모델만 필터링 (문서 검증용)
    const visionModels = data.data
      .filter((model: any) => 
        model.id.includes('gpt-4') && 
        (model.id.includes('vision') || model.id.includes('turbo'))
      )
      .map((model: any) => ({
        id: model.id,
        name: model.id,
        description: `OpenAI ${model.id}`,
      }));

    return visionModels;
  } catch (error) {
    console.error('Failed to fetch OpenAI models:', error);
    // API 호출 실패 시 기본 모델 목록 반환
    return [
      { id: 'gpt-4-vision-preview', name: 'gpt-4-vision-preview', description: 'OpenAI GPT-4 Vision (Preview)' },
      { id: 'gpt-4-turbo', name: 'gpt-4-turbo', description: 'OpenAI GPT-4 Turbo' },
      { id: 'gpt-4o', name: 'gpt-4o', description: 'OpenAI GPT-4o' },
    ];
  }
}

/**
 * Claude 모델 목록 조회
 * Anthropic API는 모델 목록 조회 엔드포인트를 제공하지 않으므로 정적 목록 반환
 */
export async function getClaudeModels(apiKey?: string): Promise<ModelInfo[]> {
  return [
    { id: 'claude-3-5-sonnet-20241022', name: 'claude-3-5-sonnet-20241022', description: 'Claude 3.5 Sonnet (Latest)' },
    { id: 'claude-3-5-sonnet-20240620', name: 'claude-3-5-sonnet-20240620', description: 'Claude 3.5 Sonnet' },
    { id: 'claude-3-opus-20240229', name: 'claude-3-opus-20240229', description: 'Claude 3 Opus' },
    { id: 'claude-3-sonnet-20240229', name: 'claude-3-sonnet-20240229', description: 'Claude 3 Sonnet' },
    { id: 'claude-3-haiku-20240307', name: 'claude-3-haiku-20240307', description: 'Claude 3 Haiku' },
  ];
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
    
    // Vision 지원 모델만 필터링
    const visionModels = data.models
      .filter((model: any) => 
        model.supportedGenerationMethods?.includes('generateContent') &&
        (model.name.includes('gemini-pro-vision') || model.name.includes('gemini-1.5'))
      )
      .map((model: any) => ({
        id: model.name.replace('models/', ''),
        name: model.displayName || model.name.replace('models/', ''),
        description: model.description || `Google ${model.displayName}`,
      }));

    return visionModels;
  } catch (error) {
    console.error('Failed to fetch Gemini models:', error);
    // API 호출 실패 시 기본 모델 목록 반환
    return [
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Google Gemini 1.5 Pro' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Google Gemini 1.5 Flash' },
      { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', description: 'Google Gemini Pro Vision' },
    ];
  }
}

/**
 * Perplexity 모델 목록 조회
 * Perplexity API는 모델 목록 조회 엔드포인트를 제공하지 않으므로 정적 목록 반환
 */
export async function getPerplexityModels(apiKey?: string): Promise<ModelInfo[]> {
  return [
    { id: 'sonar-pro', name: 'sonar-pro', description: 'Perplexity Sonar Pro' },
    { id: 'sonar', name: 'sonar', description: 'Perplexity Sonar' },
    { id: 'sonar-reasoning', name: 'sonar-reasoning', description: 'Perplexity Sonar Reasoning' },
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
      return await getClaudeModels(apiKey);
    case 'gemini':
      return apiKey ? await getGeminiModels(apiKey) : [];
    case 'perplexity':
      return await getPerplexityModels(apiKey);
    default:
      return [];
  }
}

