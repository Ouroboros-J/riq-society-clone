import { broadcastVerificationProgress } from "./websocket.js";
import { downloadFileAsBase64 } from './s3-helper.js';
import { callOpenRouterChatCompletion } from './openrouter-helper.js';
import { getVerifierPrompt, getSummarizerPrompt } from './ai-prompts.js';
import { getDb } from './db.js';
import { aiSettings } from '../drizzle/schema.js';
import { eq } from 'drizzle-orm';

interface VerificationResult {
  approved: boolean;
  reason: string;
  confidence: number;
}

/**
 * OpenRouter를 사용한 AI 검증 함수
 * Verifier 또는 Summarizer 역할에 따라 다른 프롬프트 사용
 */
async function verifyWithOpenRouter(
  modelId: string,
  role: 'verifier' | 'summarizer',
  prompt: string,
  identityDocumentUrl?: string,
  testResultUrl?: string
): Promise<VerificationResult> {
  try {
    const messages: any[] = [
      {
        role: 'user',
        content: []
      }
    ];

    // Verifier인 경우 이미지 첨부
    if (role === 'verifier' && identityDocumentUrl && testResultUrl) {
      // 신원 증명 서류
      const identityData = await downloadFileAsBase64(identityDocumentUrl);
      const identityMimeType = identityData.mimeType;
      const identityBase64 = identityData.base64;

      // 시험 결과지
      const testResultData = await downloadFileAsBase64(testResultUrl);
      const testResultMimeType = testResultData.mimeType;
      const testResultBase64 = testResultData.base64;

      // 프롬프트 텍스트
      messages[0].content.push({
        type: 'text',
        text: prompt
      });

      // 신원 증명 서류 이미지
      messages[0].content.push({
        type: 'image_url',
        image_url: {
          url: `data:${identityMimeType};base64,${identityBase64}`
        }
      });

      // 시험 결과지 이미지
      messages[0].content.push({
        type: 'image_url',
        image_url: {
          url: `data:${testResultMimeType};base64,${testResultBase64}`
        }
      });
    } else {
      // Summarizer인 경우 텍스트만
      messages[0].content.push({
        type: 'text',
        text: prompt
      });
    }

    // OpenRouter API 호출
    const response = await callOpenRouterChatCompletion(modelId, messages);

    // 응답 파싱
    const responseText = response.choices[0]?.message?.content || '';

    // JSON 파싱 시도
    let result: VerificationResult;
    try {
      // JSON 블록 추출 (```json ... ``` 또는 {...})
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                       responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonText = jsonMatch[1] || jsonMatch[0];
        const parsed = JSON.parse(jsonText);
        result = {
          approved: parsed.approved || false,
          reason: parsed.reason || responseText,
          confidence: parsed.confidence || 0
        };
      } else {
        // JSON이 아닌 경우 텍스트 그대로 사용
        result = {
          approved: false,
          reason: responseText,
          confidence: 0
        };
      }
    } catch (parseError) {
      // 파싱 실패 시 텍스트 그대로 사용
      result = {
        approved: false,
        reason: responseText,
        confidence: 0
      };
    }

    return result;
  } catch (error: any) {
    console.error(`OpenRouter AI verification failed for ${modelId}:`, error);
    throw new Error(`OpenRouter API error: ${error.message}`);
  }
}

/**
 * 2단계 AI 검증 프로세스
 * 1단계: Verifier AI들로 검증 (서로 다른 provider 2개 이상)
 * 2단계: Summarizer AI로 결과 종합
 */
export async function verifyApplicationWithAI(
  testName: string,
  testScore: string,
  testCategory: string,
  identityDocumentUrl: string,
  testResultUrl: string,
  applicantName: string,
  applicantBirthDate: string,
  testDate?: string,
  applicationId?: number
): Promise<{
  approved: boolean;
  reason: string;
  confidence?: number;
  verifierResults?: Array<{
    platform: string;
    approved: boolean;
    confidence: number;
    reason: string;
  }>;
}> {
  try {
    // 1. 활성화된 AI 설정 가져오기
    const db = await getDb();
    if (!db) {
      throw new Error('데이터베이스에 연결할 수 없습니다.');
    }
    const allSettings = await db.select().from(aiSettings).where(eq(aiSettings.isEnabled, 1));

    const verifiers = allSettings.filter(s => s.role === 'verifier');
    const summarizers = allSettings.filter(s => s.role === 'summarizer');

    // 검증: 최소 2개의 Verifier, 정확히 1개의 Summarizer
    if (verifiers.length < 2) {
      throw new Error('최소 2개의 Verifier AI가 활성화되어 있어야 합니다.');
    }

    if (summarizers.length !== 1) {
      throw new Error('정확히 1개의 Summarizer AI가 활성화되어 있어야 합니다.');
    }

    // 검증: Verifier들이 서로 다른 provider인지 확인
    const verifierProviders = new Set(verifiers.map(v => v.provider));
    if (verifierProviders.size < 2) {
      throw new Error('Verifier AI들은 서로 다른 provider여야 합니다.');
    }

    // 2. Verifier AI들로 검증 수행
    const verifierPrompt = getVerifierPrompt(
      testCategory,
      applicantName,
      applicantBirthDate,
      testName,
      testScore,
      testDate
    );

    const verifierResults: Array<{
      platform: string;
      approved: boolean;
      confidence: number;
      reason: string;
    }> = [];

    for (let i = 0; i < verifiers.length; i++) {
      const verifier = verifiers[i];
      
      if (applicationId) {
        await broadcastVerificationProgress(applicationId, {
          status: 'verifying',
          currentStep: i + 1,
          totalSteps: verifiers.length + 1,
          message: `Verifying with ${verifier.modelName}...`
        });
      }

      try {
        const result = await verifyWithOpenRouter(
          verifier.modelId,
          'verifier',
          verifierPrompt,
          identityDocumentUrl,
          testResultUrl
        );

        verifierResults.push({
          platform: verifier.provider,
          approved: result.approved,
          confidence: result.confidence,
          reason: result.reason
        });
      } catch (error: any) {
        console.error(`Verifier ${verifier.modelName} failed:`, error);
        verifierResults.push({
          platform: verifier.provider,
          approved: false,
          confidence: 0,
          reason: `AI verification failed: ${error.message}`
        });
      }
    }

    // 3. Summarizer AI로 결과 종합
    const summarizer = summarizers[0];
    
    if (applicationId) {
      await broadcastVerificationProgress(applicationId, {
        status: 'summarizing',
        currentStep: verifiers.length + 1,
        totalSteps: verifiers.length + 1,
        message: `Summarizing results with ${summarizer.modelName}...`
      });
    }

    const summarizerPrompt = getSummarizerPrompt(verifierResults);

    let summarizerResult: VerificationResult;
    try {
      summarizerResult = await verifyWithOpenRouter(
        summarizer.modelId,
        'summarizer',
        summarizerPrompt
      );
    } catch (error: any) {
      console.error(`Summarizer ${summarizer.modelName} failed:`, error);
      // Summarizer 실패 시 Verifier 결과 기반으로 결정
      const approvedCount = verifierResults.filter(r => r.approved).length;
      const approved = approvedCount >= Math.ceil(verifierResults.length / 2);
      
      return {
        approved,
        reason: `AI verification completed. ${approvedCount}/${verifierResults.length} verifiers approved. (Summarizer failed: ${error.message})`,
        verifierResults
      };
    }

    // 4. 최종 결정: Verifier 다수결 + Summarizer 메시지
    const approvedCount = verifierResults.filter(r => r.approved).length;
    const finalApproved = approvedCount >= Math.ceil(verifierResults.length / 2);

    return {
      approved: finalApproved,
      reason: summarizerResult.reason, // Summarizer의 사용자 친화적 메시지
      confidence: summarizerResult.confidence,
      verifierResults // 관리자용 상세 결과
    };

  } catch (error: any) {
    console.error('AI verification process failed:', error);
    throw error;
  }
}

