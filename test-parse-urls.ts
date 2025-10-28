const documentUrls = '["https://forge.manus.ai/v1/storage/download/FqTMAnpiFzHpWUkZd9dTdd/applications/1/1761648254139-test_wais_result.jpg"]';

console.log('Original:', documentUrls);
console.log('Type:', typeof documentUrls);

// 파싱 시도
try {
  const parsed = JSON.parse(documentUrls);
  console.log('Parsed:', parsed);
  console.log('First URL:', parsed[0]);
} catch (e: any) {
  console.error('Parse error:', e.message);
}

// split 방식
const urls = documentUrls.split(',').map(url => url.trim()).filter(url => url);
console.log('Split result:', urls);
