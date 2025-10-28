/**
 * Rate limiting 미들웨어
 */
import rateLimit from 'express-rate-limit';

/**
 * 일반 API 요청 제한
 * - 15분당 100개 요청
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100개 요청
  message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
  standardHeaders: true, // `RateLimit-*` 헤더 반환
  legacyHeaders: false, // `X-RateLimit-*` 헤더 비활성화
});

/**
 * 로그인 시도 제한
 * - 15분당 5개 요청
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 최대 5개 요청
  message: '로그인 시도 횟수를 초과했습니다. 15분 후 다시 시도해주세요.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // 성공한 요청은 카운트하지 않음
});

/**
 * 파일 업로드 제한
 * - 1시간당 20개 파일
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 20, // 최대 20개 파일
  message: '파일 업로드 횟수를 초과했습니다. 1시간 후 다시 시도해주세요.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * 이메일 발송 제한
 * - 1시간당 10개 이메일
 */
export const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 10, // 최대 10개 이메일
  message: '이메일 발송 횟수를 초과했습니다. 1시간 후 다시 시도해주세요.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * AI 검증 요청 제한
 * - 1시간당 5개 요청
 */
export const aiVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 5, // 최대 5개 요청
  message: 'AI 검증 요청 횟수를 초과했습니다. 1시간 후 다시 시도해주세요.',
  standardHeaders: true,
  legacyHeaders: false,
});

