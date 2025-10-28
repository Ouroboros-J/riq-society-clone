/**
 * 파일 업로드 보안 검증
 */

// 허용된 MIME 타입
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
];

// 허용된 파일 확장자
const ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.pdf',
];

// 최대 파일 크기 (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * 파일 타입 검증
 */
export function validateFileType(fileName: string, mimeType: string): { valid: boolean; error?: string } {
  // MIME 타입 검증
  if (!ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
    return {
      valid: false,
      error: `허용되지 않는 파일 형식입니다. 허용된 형식: ${ALLOWED_MIME_TYPES.join(', ')}`,
    };
  }

  // 파일 확장자 검증
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `허용되지 않는 파일 확장자입니다. 허용된 확장자: ${ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }

  // MIME 타입과 확장자 일치 검증
  const mimeExtensionMap: Record<string, string[]> = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/jpg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
    'application/pdf': ['.pdf'],
  };

  const expectedExtensions = mimeExtensionMap[mimeType.toLowerCase()];
  if (expectedExtensions && !expectedExtensions.includes(extension)) {
    return {
      valid: false,
      error: '파일 확장자와 MIME 타입이 일치하지 않습니다.',
    };
  }

  return { valid: true };
}

/**
 * 파일 크기 검증
 */
export function validateFileSize(fileData: string): { valid: boolean; error?: string; size?: number } {
  // Base64 디코딩 후 실제 파일 크기 계산
  const buffer = Buffer.from(fileData, 'base64');
  const fileSize = buffer.length;

  if (fileSize > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `파일 크기가 너무 큽니다. 최대 크기: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      size: fileSize,
    };
  }

  return { valid: true, size: fileSize };
}

/**
 * 파일명 sanitization
 */
export function sanitizeFileName(fileName: string): string {
  // 위험한 문자 제거
  let sanitized = fileName
    .replace(/[^a-zA-Z0-9가-힣._-]/g, '_') // 허용된 문자만 유지
    .replace(/\.{2,}/g, '.') // 연속된 점 제거
    .replace(/^\./, '') // 시작 점 제거
    .substring(0, 255); // 최대 길이 제한

  // 파일명이 비어있으면 기본값 사용
  if (!sanitized || sanitized === '.') {
    sanitized = 'unnamed_file';
  }

  return sanitized;
}

/**
 * 파일 업로드 전체 검증
 */
export function validateFileUpload(
  fileName: string,
  fileType: string,
  fileData: string
): { valid: boolean; error?: string; sanitizedFileName?: string; fileSize?: number } {
  // 파일 크기 검증
  const sizeValidation = validateFileSize(fileData);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }

  // 파일 타입 검증
  const typeValidation = validateFileType(fileName, fileType);
  if (!typeValidation.valid) {
    return typeValidation;
  }

  // 파일명 sanitization
  const sanitizedFileName = sanitizeFileName(fileName);

  return {
    valid: true,
    sanitizedFileName,
    fileSize: sizeValidation.size,
  };
}

