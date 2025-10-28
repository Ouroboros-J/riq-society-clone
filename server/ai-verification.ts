import { getEnabledAiSettings } from "./db-ai-settings";
import { broadcastVerificationProgress } from "./websocket.js";

// AI 검증 프롬프트 템플릿
const VERIFICATION_PROMPT = `당신은 고지능 단체(High IQ Society) 입회 심사 전문가입니다.

제출된 서류를 검토하여 다음을 확인해주세요:

1. **시험 정보 확인**
   - 신청자가 선택한 시험: {testName}
   - 제출된 서류에 해당 시험 이름이 명확히 표시되어 있는가?

2. **점수 확인**
   - 신청자가 입력한 점수: {testScore}
   - 서류에 표시된 점수와 일치하는가?

3. **입회 자격 기준**
   - RIQ Society는 상위 1% 고지능자만 입회 가능합니다.
   - 제출된 점수가 해당 시험의 상위 1% 기준을 충족하는가?

4. **서류 진위성**
   - 서류가 공식 기관에서 발급한 것으로 보이는가?
   - 위조 또는 변조 흔적이 있는가?

**응답 형식 (JSON):**
\`\`\`json
{
  "approved": true 또는 false,
  "reason": "승인/거절 사유를 한국어로 상세히 작성",
  "confidence": 0.0 ~ 1.0 (확신도)
}
\`\`\`

**중요:** 
- 의심스러운 경우 반드시 거절하세요.
- 점수가 상위 1% 기준에 미달하면 거절하세요.
- 서류가 불명확하거나 위조 의심이 있으면 거절하세요.`;

interface VerificationResult {
  approved: boolean;
  reason: string;
  confidence: number;
}

interface AiVerificationResponse {
  platform: string;
  model: string;
  result: VerificationResult;
  rawResponse: string;
}

/**
 * OpenAI API를 사용한 서류 검증
 */
async function verifyWithOpenAI(
  apiKey: string,
  model: string,
  testName: string,
  testScore: string,
  documentBase64: string
): Promise<VerificationResult> {
  const prompt = VERIFICATION_PROMPT
    .replace('{testName}', testName)
    .replace('{testScore}', testScore);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${documentBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  // JSON 파싱
  const jsonMatch = content.match(/```json\n([\s\S]+?)\n```/) || content.match(/{[\s\S]+}/);
  if (!jsonMatch) {
    throw new Error('Invalid response format from OpenAI');
  }

  const result = JSON.parse(jsonMatch[1] || jsonMatch[0]);
  return result;
}

/**
 * Anthropic (Claude) API를 사용한 서류 검증
 */
async function verifyWithAnthropic(
  apiKey: string,
  model: string,
  testName: string,
  testScore: string,
  documentBase64: string
): Promise<VerificationResult> {
  const prompt = VERIFICATION_PROMPT
    .replace('{testName}', testName)
    .replace('{testScore}', testScore);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: documentBase64,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.content[0].text;

  // JSON 파싱
  const jsonMatch = content.match(/```json\n([\s\S]+?)\n```/) || content.match(/{[\s\S]+}/);
  if (!jsonMatch) {
    throw new Error('Invalid response format from Anthropic');
  }

  const result = JSON.parse(jsonMatch[1] || jsonMatch[0]);
  return result;
}

/**
 * Google Gemini API를 사용한 서류 검증
 */
async function verifyWithGemini(
  apiKey: string,
  model: string,
  testName: string,
  testScore: string,
  documentBase64: string
): Promise<VerificationResult> {
  const prompt = VERIFICATION_PROMPT
    .replace('{testName}', testName)
    .replace('{testScore}', testScore);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: documentBase64,
                },
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.candidates[0].content.parts[0].text;

  // JSON 파싱
  const jsonMatch = content.match(/```json\n([\s\S]+?)\n```/) || content.match(/{[\s\S]+}/);
  if (!jsonMatch) {
    throw new Error('Invalid response format from Gemini');
  }

  const result = JSON.parse(jsonMatch[1] || jsonMatch[0]);
  return result;
}

/**
 * Perplexity API를 사용한 서류 검증
 * 주의: Perplexity는 이미지 분석을 지원하지 않을 수 있음
 */
async function verifyWithPerplexity(
  apiKey: string,
  model: string,
  testName: string,
  testScore: string,
  documentBase64: string
): Promise<VerificationResult> {
  const prompt = VERIFICATION_PROMPT
    .replace('{testName}', testName)
    .replace('{testScore}', testScore);

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'user',
          content: prompt + '\n\n(이미지 분석은 지원되지 않으므로 텍스트 정보만으로 판단)',
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  // JSON 파싱
  const jsonMatch = content.match(/```json\n([\s\S]+?)\n```/) || content.match(/{[\s\S]+}/);
  if (!jsonMatch) {
    throw new Error('Invalid response format from Perplexity');
  }

  const result = JSON.parse(jsonMatch[1] || jsonMatch[0]);
  return result;
}

/**
 * 다중 AI 교차 검증
 * 모든 활성화된 AI가 동일한 결과(승인 또는 거절)를 반환해야 통과
 */
export async function verifyApplicationWithAI(
  testName: string,
  testScore: string,
  documentBase64: string,
  applicationId?: number
): Promise<{
  approved: boolean;
  reason: string;
  verifications: AiVerificationResponse[];
}> {
  const enabledSettings = await getEnabledAiSettings();

  if (enabledSettings.length < 2) {
    throw new Error('최소 2개 이상의 AI 모델이 활성화되어야 합니다.');
  }

  const verifications: AiVerificationResponse[] = [];

  // 각 AI로 검증 수행
  for (const setting of enabledSettings) {
    // WebSocket으로 진행 상태 전송: running
    if (applicationId) {
      broadcastVerificationProgress(applicationId, setting.platform, 'running');
    }

    try {
      let result: VerificationResult;

      switch (setting.platform) {
        case 'openai':
          result = await verifyWithOpenAI(
            setting.apiKey!,
            setting.selectedModel!,
            testName,
            testScore,
            documentBase64
          );
          break;
        case 'anthropic':
          result = await verifyWithAnthropic(
            setting.apiKey!,
            setting.selectedModel!,
            testName,
            testScore,
            documentBase64
          );
          break;
        case 'google':
          result = await verifyWithGemini(
            setting.apiKey!,
            setting.selectedModel!,
            testName,
            testScore,
            documentBase64
          );
          break;
        case 'perplexity':
          result = await verifyWithPerplexity(
            setting.apiKey!,
            setting.selectedModel!,
            testName,
            testScore,
            documentBase64
          );
          break;
        default:
          throw new Error(`Unsupported platform: ${setting.platform}`);
      }

      verifications.push({
        platform: setting.platform,
        model: setting.selectedModel!,
        result,
        rawResponse: JSON.stringify(result),
      });

      // WebSocket으로 진행 상태 전송: completed
      if (applicationId) {
        broadcastVerificationProgress(applicationId, setting.platform, 'completed');
      }
    } catch (error: any) {
      console.error(`AI verification failed for ${setting.platform}:`, error);
      
      // WebSocket으로 진행 상태 전송: error
      if (applicationId) {
        broadcastVerificationProgress(applicationId, setting.platform, 'error', error.message);
      }

      // 실패한 AI는 거절로 간주
      verifications.push({
        platform: setting.platform,
        model: setting.selectedModel!,
        result: {
          approved: false,
          reason: `AI 검증 실패: ${error.message}`,
          confidence: 0,
        },
        rawResponse: JSON.stringify(error),
      });
    }
  }

  // 모든 AI의 결과가 일치하는지 확인
  const approvedCount = verifications.filter((v) => v.result.approved).length;
  const allApproved = approvedCount === verifications.length;
  const allRejected = approvedCount === 0;

  let finalApproved = false;
  let finalReason = '';

  if (allApproved) {
    finalApproved = true;
    finalReason = '모든 AI가 승인했습니다. ' + verifications.map((v) => `[${v.platform}] ${v.result.reason}`).join(' ');
  } else if (allRejected) {
    finalApproved = false;
    finalReason = '모든 AI가 거절했습니다. ' + verifications.map((v) => `[${v.platform}] ${v.result.reason}`).join(' ');
  } else {
    // 일치하지 않으면 거절
    finalApproved = false;
    finalReason = `AI 검증 결과가 일치하지 않습니다. (승인: ${approvedCount}/${verifications.length}) 관리자의 수동 검토가 필요합니다.`;
  }

  return {
    approved: finalApproved,
    reason: finalReason,
    verifications,
  };
}

