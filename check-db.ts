import { getDb } from './server/db.js';
import { applications } from './server/schema.js';
import { eq } from 'drizzle-orm';

const db = await getDb();
if (!db) {
  console.error('DB connection failed');
  process.exit(1);
}

const [app] = await db.select().from(applications).where(eq(applications.id, 1));
console.log('Application status:', app.status);
console.log('AI verification status:', app.aiVerificationStatus);
console.log('AI verification result:', app.aiVerificationResult);
console.log('Updated at:', app.updatedAt);

process.exit(0);
