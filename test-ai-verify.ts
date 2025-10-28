import { getDb } from './server/db.js';
import { applications } from './server/schema.js';
import { eq } from 'drizzle-orm';
import { getFirstDocumentAsBase64 } from './server/s3-helper.js';

const db = await getDb();
if (!db) {
  console.error('DB connection failed');
  process.exit(1);
}

const [app] = await db.select().from(applications).where(eq(applications.id, 1));
console.log('=== Testing AI Verification ===');
console.log('Document URLs:', app.documentUrls);

try {
  const base64 = await getFirstDocumentAsBase64(app.documentUrls!);
  if (base64) {
    console.log('✅ Successfully downloaded and converted to Base64');
    console.log('Base64 length:', base64.length);
    console.log('First 100 chars:', base64.substring(0, 100));
  } else {
    console.log('❌ Failed to get Base64');
  }
} catch (error: any) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
}

process.exit(0);
