/**
 * AI API 키 유효성 검증
 * 각 플랫폼별로 실제 API를 호출하여 키가 유효한지 확인
 */

interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * OpenAI API 키 유효성 검증
 */
export async function validateOpenAIKey(apiKey: string): Promise<ValidationResult> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      return {
        valid: false,
        error: `OpenAI API error: ${response.statusText}`,
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Anthropic API 키 유효성 검증
 */
export async function validateAnthropicKey(apiKey: string): Promise<ValidationResult> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
    });

    if (!response.ok) {
      return {
        valid: false,
        error: `Anthropic API error: ${response.statusText}`,
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Google Gemini API 키 유효성 검증
 */
export async function validateGeminiKey(apiKey: string): Promise<ValidationResult> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

    if (!response.ok) {
      return {
        valid: false,
        error: `Gemini API error: ${response.statusText}`,
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Perplexity API 키 유효성 검증
 */
export async function validatePerplexityKey(apiKey: string): Promise<ValidationResult> {
  try {
    // Perplexity는 간단한 chat completion 요청으로 검증
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1,
      }),
    });

    if (!response.ok) {
      return {
        valid: false,
        error: `Perplexity API error: ${response.statusText}`,
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 플랫폼별 API 키 유효성 검증
 */
export async function validateApiKey(platform: string, apiKey: string): Promise<ValidationResult> {
  switch (platform.toLowerCase()) {
    case 'openai':
      return await validateOpenAIKey(apiKey);
    case 'anthropic':
      return await validateAnthropicKey(apiKey);
    case 'gemini':
      return await validateGeminiKey(apiKey);
    case 'perplexity':
      return await validatePerplexityKey(apiKey);
    default:
      return {
        valid: false,
        error: `Unknown platform: ${platform}`,
      };
  }
}

