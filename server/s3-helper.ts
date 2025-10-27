/**
 * S3에서 파일을 다운로드하여 Base64로 변환
 * @param fileUrl S3 파일 URL
 * @returns Base64 인코딩된 문자열
 */
export async function downloadFileAsBase64(fileUrl: string): Promise<string> {
  try {
    // S3 URL에서 파일 다운로드
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    
    // ArrayBuffer로 읽기
    const arrayBuffer = await response.arrayBuffer();
    
    // Buffer로 변환 후 Base64 인코딩
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    
    return base64;
  } catch (error: any) {
    console.error('Failed to download file from S3:', error);
    throw new Error(`S3 파일 다운로드 실패: ${error.message}`);
  }
}

/**
 * 여러 파일 URL을 Base64로 변환 (첫 번째 파일만 반환)
 * @param documentUrls 쉼표로 구분된 파일 URL 문자열
 * @returns 첫 번째 파일의 Base64 인코딩된 문자열
 */
export async function getFirstDocumentAsBase64(documentUrls: string): Promise<string | null> {
  const urls = documentUrls.split(',').map(url => url.trim()).filter(url => url);
  
  if (urls.length === 0) {
    return null;
  }
  
  // 첫 번째 파일만 다운로드
  return await downloadFileAsBase64(urls[0]);
}

