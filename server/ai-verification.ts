import { getEnabledAiSettings } from './db-ai-settings.js';
import { broadcastVerificationProgress } from "./websocket.js";
import { downloadFileAsBase64 } from './s3-helper.js';

// AI 검증 프롬프트 템플릿 (시험 유형별)
const STANDARD_IQ_TEST_PROMPT = `당신은 고지능 단체(High IQ Society) 입회 심사 전문가입니다.

**제출된 서류: 신원 증명 + 표준 지능 검사 결과지**

다음 항목을 철저히 확인해주세요:

1. **신원 증명 확인**
   - 신원 증명 서류(주민등록증, 운전면허증, 여권, 학생증, 국가 자격증 등)에 본인 이름이 명확히 표시되어 있는가?
   - 신원 증명 서류가 유효하고 위조 흔적이 없는가?

2. **시험 정보 확인**
   - 신청자가 선택한 시험: {testName}
   - 결과지에 해당 시험 이름이 명확히 표시되어 있는가?

3. **결과지 필수 항목 확인 (표준 지능 검사)**
   - ✅ 본인 이름 (신원 증명 서류와 일치하는가?)
   - ✅ 전체 점수 (신청자 입력: {testScore})
   - ✅ 응시 장소
   - ✅ 응시 날짜
   - ✅ 담당 심리학자의 면허 번호
   - ✅ 담당 심리학자의 연락처
   - ✅ 담당 심리학자의 날인 또는 서명

4. **점수 확인**
   - 신청자가 입력한 점수: {testScore}
   - 결과지에 표시된 점수와 일치하는가?

5. **입회 자격 기준**
   - RIQ Society는 상위 1% 고지능자만 입회 가능합니다.
   - 제출된 점수가 해당 시험의 상위 1% 기준을 충족하는가?

6. **서류 진위성**
   - 결과지가 공식 심리학 기관에서 발급한 것으로 보이는가?
   - 위조 또는 변조 흔적이 있는가?

**응답 형식 (JSON):**
\`\`\`json
{
  "approved": true 또는 false,
  "reason": "승인/거절 사유를 한국어로 상세히 작성 (누락된 항목이 있으면 명시)",
  "confidence": 0.0 ~ 1.0 (확신도)
}
\`\`\`

**중요:** 
- 필수 항목이 하나라도 누락되면 반드시 거절하세요.
- 신원 증명 서류와 결과지의 이름이 일치하지 않으면 거절하세요.
- 점수가 상위 1% 기준에 미달하면 거절하세요.
- 서류가 불명확하거나 위조 의심이 있으면 거절하세요.`;

const ACADEMIC_TEST_PROMPT = `당신은 고지능 단체(High IQ Society) 입회 심사 전문가입니다.

**제출된 서류: 신원 증명 + 학업 및 인지 능력 검사 결과지**

다음 항목을 철저히 확인해주세요:

1. **신원 증명 확인**
   - 신원 증명 서류에 본인 이름이 명확히 표시되어 있는가?
   - 신원 증명 서류가 유효하고 위조 흔적이 없는가?

2. **시험 정보 확인**
   - 신청자가 선택한 시험: {testName}
   - 결과지에 해당 시험 이름이 명확히 표시되어 있는가?

3. **결과지 필수 항목 확인**
   - ✅ 본인 이름 (신원 증명 서류와 일치하는가?)
   - ✅ 전체 점수 (신청자 입력: {testScore})
   - ✅ 응시 날짜

4. **점수 확인**
   - 신청자가 입력한 점수: {testScore}
   - 결과지에 표시된 점수와 일치하는가?

5. **입회 자격 기준**
   - RIQ Society는 상위 1% 고지능자만 입회 가능합니다.
   - 제출된 점수가 해당 시험의 상위 1% 기준을 충족하는가?

6. **서류 진위성**
   - 결과지가 공식 기관에서 발급한 것으로 보이는가?
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
- 신원 증명 서류와 결과지의 이름이 일치하지 않으면 거절하세요.
- 점수가 상위 1% 기준에 미달하면 거절하세요.
- 서류가 불명확하거나 위조 의심이 있으면 거절하세요.`;

const COLLEGE_TEST_PROMPT = `당신은 고지능 단체(High IQ Society) 입회 심사 전문가입니다.

**제출된 서류: 신원 증명 + 대학/대학원 진학 시험 성적표**

다음 항목을 철저히 확인해주세요:

1. **신원 증명 확인**
   - 신원 증명 서류에 본인 이름이 명확히 표시되어 있는가?
   - 신원 증명 서류가 유효하고 위조 흔적이 없는가?

2. **시험 정보 확인**
   - 신청자가 선택한 시험: {testName}
   - 성적표에 해당 시험 이름이 명확히 표시되어 있는가?

3. **성적표 필수 항목 확인**
   - ✅ 본인 이름 (신원 증명 서류와 일치하는가?)
   - ✅ 전체 점수 (신청자 입력: {testScore})
   - ✅ 응시 날짜

4. **점수 확인**
   - 신청자가 입력한 점수: {testScore}
   - 성적표에 표시된 점수와 일치하는가?

5. **입회 자격 기준**
   - RIQ Society는 상위 1% 고지능자만 입회 가능합니다.
   - 제출된 점수가 해당 시험의 상위 1% 기준을 충족하는가?

6. **서류 진위성**
   - 성적표가 공식 시험 기관에서 발급한 것으로 보이는가?
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
- 신원 증명 서류와 성적표의 이름이 일치하지 않으면 거절하세요.
- 점수가 상위 1% 기준에 미달하면 거절하세요.
- 서류가 불명확하거나 위조 의심이 있으면 거절하세요.`;

// 시험 유형에 따라 적절한 프롬프트 선택
function getVerificationPrompt(testCategory: string): string {
  if (testCategory === "표준 지능 검사") {
    return STANDARD_IQ_TEST_PROMPT;
  } else if (testCategory === "학업 및 인지 능력 검사") {
    return ACADEMIC_TEST_PROMPT;
  } else if (testCategory === "대학 및 대학원 진학 시험") {
    return COLLEGE_TEST_PROMPT;
  }
  // 기본값: 표준 지능 검사 프롬프트
  return STANDARD_IQ_TEST_PROMPT;
}

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
 * @param identityDocumentUrl 신원 증명 서류 URL
 * @param testResultUrl 시험 결과지 URL
 */
async function verifyWithOpenAI(
  apiKey: string,
  model: string,
  testName: string,
  testScore: string,
  testCategory: string,
  identityDocumentUrl: string,
  testResultUrl: string
): Promise<VerificationResult> {
  // S3에서 파일 다운로드 및 Base64 변환
  const identityBase64 = await downloadFileAsBase64(identityDocumentUrl);
  const testResultBase64 = await downloadFileAsBase64(testResultUrl);
  
  // 파일 타입 확인 (PDF vs 이미지)
  const identityIsPdf = identityDocumentUrl.toLowerCase().endsWith('.pdf');
  const testResultIsPdf = testResultUrl.toLowerCase().endsWith('.pdf');
  
  const prompt = getVerificationPrompt(testCategory)
    .replace('{testName}', testName)
    .replace('{testScore}', testScore);

  const content: any[] = [
    { type: 'text', text: `${prompt}\n\n**첫 번째 파일: 신원 증명 서류**\n**두 번째 파일: 시험 결과지**` },
  ];
  
  // 신원 증명 서류 추가
  if (identityIsPdf) {
    content.push({
      type: 'image_url',
      image_url: { url: `data:application/pdf;base64,${identityBase64}` },
    });
  } else {
    content.push({
      type: 'image_url',
      image_url: { url: `data:image/jpeg;base64,${identityBase64}` },
    });
  }
  
  // 시험 결과지 추가
  if (testResultIsPdf) {
    content.push({
      type: 'image_url',
      image_url: { url: `data:application/pdf;base64,${testResultBase64}` },
    });
  } else {
    content.push({
      type: 'image_url',
      image_url: { url: `data:image/jpeg;base64,${testResultBase64}` },
    });
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content }],
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const responseContent = data.choices[0].message.content;

  // JSON 파싱
  const jsonMatch = responseContent.match(/```json\n([\s\S]+?)\n```/) || responseContent.match(/{[\s\S]+}/);
  if (!jsonMatch) {
    throw new Error('Invalid response format from OpenAI');
  }

  const result = JSON.parse(jsonMatch[1] || jsonMatch[0]);
  return result;
}

/**
 * Anthropic (Claude) API를 사용한 서류 검증
 * @param identityDocumentUrl 신원 증명 서류 URL
 * @param testResultUrl 시험 결과지 URL
 */
async function verifyWithAnthropic(
  apiKey: string,
  model: string,
  testName: string,
  testScore: string,
  testCategory: string,
  identityDocumentUrl: string,
  testResultUrl: string
): Promise<VerificationResult> {
  // S3에서 파일 다운로드 및 Base64 변환
  const identityBase64 = await downloadFileAsBase64(identityDocumentUrl);
  const testResultBase64 = await downloadFileAsBase64(testResultUrl);
  
  // 파일 타입 확인 (PDF vs 이미지)
  const identityIsPdf = identityDocumentUrl.toLowerCase().endsWith('.pdf');
  const testResultIsPdf = testResultUrl.toLowerCase().endsWith('.pdf');
  
  const prompt = getVerificationPrompt(testCategory)
    .replace('{testName}', testName)
    .replace('{testScore}', testScore);

  const messageContent: any[] = [];
  
  // 신원 증명 서류 추가
  messageContent.push({
    type: 'image',
    source: {
      type: 'base64',
      media_type: identityIsPdf ? 'application/pdf' : (identityDocumentUrl.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'),
      data: identityBase64,
    },
  });
  
  // 시험 결과지 추가
  messageContent.push({
    type: 'image',
    source: {
      type: 'base64',
      media_type: testResultIsPdf ? 'application/pdf' : (testResultUrl.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'),
      data: testResultBase64,
    },
  });
  
  // 프롬프트 추가
  messageContent.push({
    type: 'text',
    text: `${prompt}\n\n**첫 번째 파일: 신원 증명 서류**\n**두 번째 파일: 시험 결과지**`,
  });

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
          content: messageContent,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Anthropic API error response:', errorText);
    throw new Error(`Anthropic API error: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  const responseText = data.content[0].text;

  // JSON 파싱
  const jsonMatch = responseText.match(/```json\n([\s\S]+?)\n```/) || responseText.match(/{[\s\S]+}/);
  if (!jsonMatch) {
    throw new Error('Invalid response format from Anthropic');
  }

  const result = JSON.parse(jsonMatch[1] || jsonMatch[0]);
  return result;
}

/**
 * Google Gemini API를 사용한 서류 검증
 * @param identityDocumentUrl 신원 증명 서류 URL
 * @param testResultUrl 시험 결과지 URL
 */
async function verifyWithGemini(
  apiKey: string,
  model: string,
  testName: string,
  testScore: string,
  testCategory: string,
  identityDocumentUrl: string,
  testResultUrl: string
): Promise<VerificationResult> {
  // S3에서 파일 다운로드 및 Base64 변환
  const identityBase64 = await downloadFileAsBase64(identityDocumentUrl);
  const testResultBase64 = await downloadFileAsBase64(testResultUrl);
  
  // 파일 타입 확인 (PDF vs 이미지)
  const identityIsPdf = identityDocumentUrl.toLowerCase().endsWith('.pdf');
  const testResultIsPdf = testResultUrl.toLowerCase().endsWith('.pdf');
  
  const prompt = getVerificationPrompt(testCategory)
    .replace('{testName}', testName)
    .replace('{testScore}', testScore);

  const parts: any[] = [
    { text: `${prompt}\n\n**첫 번째 파일: 신원 증명 서류**\n**두 번째 파일: 시험 결과지**` },
  ];
  
  // 신원 증명 서류 추가
  parts.push({
    inline_data: {
      mime_type: identityIsPdf ? 'application/pdf' : 'image/jpeg',
      data: identityBase64,
    },
  });
  
  // 시험 결과지 추가
  parts.push({
    inline_data: {
      mime_type: testResultIsPdf ? 'application/pdf' : 'image/jpeg',
      data: testResultBase64,
    },
  });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts }],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  const geminiContent = data.candidates[0].content.parts[0].text;

  // JSON 파싱
  const jsonMatch = geminiContent.match(/```json\n([\s\S]+?)\n```/) || geminiContent.match(/{[\s\S]+}/);
  if (!jsonMatch) {
    throw new Error('Invalid response format from Gemini');
  }

  const result = JSON.parse(jsonMatch[1] || jsonMatch[0]);
  return result;
}

/**
 * Perplexity API를 사용한 서류 검증
 * Sonar 모델은 이미지 분석을 지원합니다.
 * @param identityDocumentUrl 신원 증명 서류 URL
 * @param testResultUrl 시험 결과지 URL
 */
async function verifyWithPerplexity(
  apiKey: string,
  model: string,
  testName: string,
  testScore: string,
  testCategory: string,
  identityDocumentUrl: string,
  testResultUrl: string
): Promise<VerificationResult> {
  // 모델 제한 확인: sonar, sonar-pro만 이미지/파일 지원
  const supportedModels = ['sonar', 'sonar-pro'];
  if (!supportedModels.includes(model)) {
    throw new Error(`Perplexity 모델 '${model}'은(는) 이미지/파일 분석을 지원하지 않습니다. sonar 또는 sonar-pro 모델을 사용하세요.`);
  }
  
  // S3에서 파일 다운로드 및 Base64 변환
  const identityBase64 = await downloadFileAsBase64(identityDocumentUrl);
  const testResultBase64 = await downloadFileAsBase64(testResultUrl);
  
  // 파일 타입 확인 (PDF vs 이미지)
  const identityIsPdf = identityDocumentUrl.toLowerCase().endsWith('.pdf');
  const testResultIsPdf = testResultUrl.toLowerCase().endsWith('.pdf');
  
  const prompt = getVerificationPrompt(testCategory)
    .replace('{testName}', testName)
    .replace('{testScore}', testScore);

  const messageContent: any[] = [
    { type: 'text', text: `${prompt}\n\n**첫 번째 파일: 신원 증명 서류**\n**두 번째 파일: 시험 결과지**` },
  ];
  
  // 신원 증명 서류 추가
  if (identityIsPdf) {
    // PDF는 file_url 형식 사용 (base64 without data URI prefix)
    messageContent.push({
      type: 'file_url',
      file_url: { url: identityBase64 },
      file_name: 'identity.pdf',
    });
  } else {
    // 이미지는 image_url 형식 사용 (data URI)
    messageContent.push({
      type: 'image_url',
      image_url: { url: `data:image/jpeg;base64,${identityBase64}` },
    });
  }
  
  // 시험 결과지 추가
  if (testResultIsPdf) {
    messageContent.push({
      type: 'file_url',
      file_url: { url: testResultBase64 },
      file_name: 'test_result.pdf',
    });
  } else {
    messageContent.push({
      type: 'image_url',
      image_url: { url: `data:image/jpeg;base64,${testResultBase64}` },
    });
  }

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
          content: messageContent,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.statusText}`);
  }

  const data = await response.json();
  const perplexityContent = data.choices[0].message.content;

  // JSON 파싱
  const jsonMatch = perplexityContent.match(/```json\n([\s\S]+?)\n```/) || perplexityContent.match(/{[\s\S]+}/);
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
  testCategory: string,
  identityDocumentUrl: string | null, // 신원 증명 서류 URL
  testResultUrl: string | null, // 시험 결과지 URL
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

  // 파일 URL 유효성 검사
  if (!identityDocumentUrl || !testResultUrl) {
    throw new Error('신원 증명 서류와 시험 결과지 URL이 필요합니다.');
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
            testCategory,
            identityDocumentUrl,
            testResultUrl
          );
          break;
        case 'anthropic':
          result = await verifyWithAnthropic(
            setting.apiKey!,
            setting.selectedModel!,
            testName,
            testScore,
            testCategory,
            identityDocumentUrl,
            testResultUrl
          );
          break;
        case 'google':
          result = await verifyWithGemini(
            setting.apiKey!,
            setting.selectedModel!,
            testName,
            testScore,
            testCategory,
            identityDocumentUrl,
            testResultUrl
          );
          break;
        case 'perplexity':
          result = await verifyWithPerplexity(
            setting.apiKey!,
            setting.selectedModel!,
            testName,
            testScore,
            testCategory,
            identityDocumentUrl,
            testResultUrl
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
    finalReason = '모든 AI 검증을 통과했습니다.';
  } else if (allRejected) {
    finalApproved = false;
    // 모든 AI가 거절한 경우, 거절 사유를 통합하여 전달
    const rejectionReasons = verifications
      .filter((v) => !v.result.approved)
      .map((v) => `• ${v.platform.toUpperCase()}: ${v.result.reason}`)
      .join('\n');
    
    finalReason = `AI 검증 결과 입회 신청이 거부되었습니다.\n\n[거절 사유]\n${rejectionReasons}`;
  } else {
    // 일부 AI만 승인한 경우, 거절한 AI의 사유를 통합
    finalApproved = false;
    const rejectionReasons = verifications
      .filter((v) => !v.result.approved)
      .map((v) => `• ${v.platform.toUpperCase()}: ${v.result.reason}`)
      .join('\n');
    
    finalReason = `AI 검증 결과가 일치하지 않아 거부되었습니다. (승인: ${approvedCount}/${verifications.length})\n\n[거절 사유]\n${rejectionReasons}\n\n※ 보다 정확한 검토를 위해 관리자가 직접 확인할 예정입니다.`;
  }

  return {
    approved: finalApproved,
    reason: finalReason,
    verifications,
  };
}

