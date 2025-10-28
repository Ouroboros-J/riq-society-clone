import { getDb } from "./db";
import { aiVerifications, applications } from "../drizzle/schema";
import { eq, and, sql, isNotNull } from "drizzle-orm";

export interface AiAccuracyStats {
  platform: string;
  totalVerifications: number;
  truePositive: number; // AI 승인 + 관리자 승인
  trueNegative: number; // AI 반려 + 관리자 반려
  falsePositive: number; // AI 승인 + 관리자 반려
  falseNegative: number; // AI 반려 + 관리자 승인
  accuracy: number; // (TP + TN) / Total
  precision: number; // TP / (TP + FP)
  recall: number; // TP / (TP + FN)
}

/**
 * AI 플랫폼별 정확도 통계 조회
 */
export async function getAiAccuracyStats(): Promise<AiAccuracyStats[]> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  // AI 검증 결과와 최종 관리자 결정 비교
  const results = await db
    .select({
      platform: aiVerifications.platform,
      aiResult: aiVerifications.result,
      adminDecision: applications.status,
    })
    .from(aiVerifications)
    .innerJoin(applications, eq(aiVerifications.applicationId, applications.id))
    .where(
      and(
        isNotNull(applications.status),
        sql`${applications.status} IN ('approved', 'rejected')`
      )
    );

  // 플랫폼별로 그룹화
  const platformStats = new Map<string, {
    total: number;
    tp: number;
    tn: number;
    fp: number;
    fn: number;
  }>();

  results.forEach((row) => {
    const platform = row.platform;
    const aiApproved = row.aiResult === 'approved';
    const adminApproved = row.adminDecision === 'approved';

    if (!platformStats.has(platform)) {
      platformStats.set(platform, { total: 0, tp: 0, tn: 0, fp: 0, fn: 0 });
    }

    const stats = platformStats.get(platform)!;
    stats.total++;

    if (aiApproved && adminApproved) {
      stats.tp++; // True Positive
    } else if (!aiApproved && !adminApproved) {
      stats.tn++; // True Negative
    } else if (aiApproved && !adminApproved) {
      stats.fp++; // False Positive (오탐)
    } else if (!aiApproved && adminApproved) {
      stats.fn++; // False Negative (미탐)
    }
  });

  // 통계 계산
  const accuracyStats: AiAccuracyStats[] = [];

  platformStats.forEach((stats, platform) => {
    const accuracy = stats.total > 0 
      ? ((stats.tp + stats.tn) / stats.total) * 100 
      : 0;
    
    const precision = (stats.tp + stats.fp) > 0
      ? (stats.tp / (stats.tp + stats.fp)) * 100
      : 0;
    
    const recall = (stats.tp + stats.fn) > 0
      ? (stats.tp / (stats.tp + stats.fn)) * 100
      : 0;

    accuracyStats.push({
      platform,
      totalVerifications: stats.total,
      truePositive: stats.tp,
      trueNegative: stats.tn,
      falsePositive: stats.fp,
      falseNegative: stats.fn,
      accuracy: Math.round(accuracy * 100) / 100,
      precision: Math.round(precision * 100) / 100,
      recall: Math.round(recall * 100) / 100,
    });
  });

  return accuracyStats.sort((a, b) => b.accuracy - a.accuracy);
}

/**
 * 전체 AI 시스템 정확도 통계
 */
export async function getOverallAiAccuracy(): Promise<{
  totalVerifications: number;
  accuracy: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
}> {
  const platformStats = await getAiAccuracyStats();

  let totalVerifications = 0;
  let totalCorrect = 0;
  let totalFP = 0;
  let totalFN = 0;

  platformStats.forEach((stats) => {
    totalVerifications += stats.totalVerifications;
    totalCorrect += stats.truePositive + stats.trueNegative;
    totalFP += stats.falsePositive;
    totalFN += stats.falseNegative;
  });

  const accuracy = totalVerifications > 0
    ? (totalCorrect / totalVerifications) * 100
    : 0;

  const fpRate = totalVerifications > 0
    ? (totalFP / totalVerifications) * 100
    : 0;

  const fnRate = totalVerifications > 0
    ? (totalFN / totalVerifications) * 100
    : 0;

  return {
    totalVerifications,
    accuracy: Math.round(accuracy * 100) / 100,
    falsePositiveRate: Math.round(fpRate * 100) / 100,
    falseNegativeRate: Math.round(fnRate * 100) / 100,
  };
}

