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
 * @param documentUrls 쉰표로 구분된 파일 URL 문자열 또는 JSON 배열 문자열
 * @returns 첫 번째 파일의 Base64 인코딩된 문자열
 */
export async function getFirstDocumentAsBase64(documentUrls: string): Promise<string | null> {
  let urls: string[] = [];
  
  // JSON 배열 형식인지 확인
  if (documentUrls.trim().startsWith('[')) {
    try {
      urls = JSON.parse(documentUrls);
    } catch (e) {
      console.error('Failed to parse documentUrls as JSON:', e);
      return null;
    }
  } else {
    // 쉰표로 구분된 형식
    urls = documentUrls.split(',').map(url => url.trim()).filter(url => url);
  }
  
  if (urls.length === 0) {
    return null;
  }
  
  // 첫 번째 파일만 다운로드
  return await downloadFileAsBase64(urls[0]);
}


/**
 * 파일(PDF 또는 이미지)을 Base64 이미지 배열로 변환
 * PDF인 경우 모든 페이지를 개별 이미지로 변환
 * @param fileUrl S3 파일 URL
 * @returns Base64 인코딩된 이미지 배열
 */
export async function getDocumentAsBase64Array(fileUrl: string): Promise<string[]> {
  try {
    // 파일 확장자 확인
    const url = new URL(fileUrl);
    const pathname = url.pathname.toLowerCase();
    const isPdf = pathname.endsWith('.pdf');
    
    if (isPdf) {
      // PDF를 이미지로 변환
      return await convertPdfToBase64Images(fileUrl);
    } else {
      // 이미지 파일은 그대로 Base64로 변환하여 배열로 반환
      const base64 = await downloadFileAsBase64(fileUrl);
      return [base64];
    }
  } catch (error: any) {
    console.error('Failed to convert document to Base64 array:', error);
    throw new Error(`문서 변환 실패: ${error.message}`);
  }
}

/**
 * PDF 파일을 이미지 배열로 변환
 * @param pdfUrl PDF 파일 URL
 * @returns Base64 인코딩된 이미지 배열
 */
async function convertPdfToBase64Images(pdfUrl: string): Promise<string[]> {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);
  const fs = await import('fs/promises');
  const path = await import('path');
  const os = await import('os');
  
  // 임시 디렉토리 생성
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdf-convert-'));
  const pdfPath = path.join(tempDir, 'document.pdf');
  
  try {
    // PDF 다운로드
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    await fs.writeFile(pdfPath, Buffer.from(arrayBuffer));
    
    // Python 스크립트로 PDF를 이미지로 변환
    const pythonScript = `
import sys
import json
import base64
from pdf2image import convert_from_path
from io import BytesIO

try:
    pdf_path = sys.argv[1]
    images = convert_from_path(pdf_path, dpi=200)
    
    base64_images = []
    for img in images:
        buffered = BytesIO()
        img.save(buffered, format="JPEG", quality=85)
        img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
        base64_images.append(img_base64)
    
    print(json.dumps(base64_images))
except Exception as e:
    print(json.dumps({"error": str(e)}), file=sys.stderr)
    sys.exit(1)
`;
    
    const scriptPath = path.join(tempDir, 'convert.py');
    await fs.writeFile(scriptPath, pythonScript);
    
    // Python 스크립트 실행
    const { stdout, stderr } = await execAsync(`python3.11 "${scriptPath}" "${pdfPath}"`);
    
    if (stderr && stderr.includes('error')) {
      throw new Error(`PDF 변환 실패: ${stderr}`);
    }
    
    const base64Images: string[] = JSON.parse(stdout);
    return base64Images;
    
  } finally {
    // 임시 파일 정리
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error('Failed to cleanup temp directory:', cleanupError);
    }
  }
}

