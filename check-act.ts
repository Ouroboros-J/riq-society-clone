import { getDb } from './server/db.js';
import { recognizedTests } from './drizzle/schema.js';
import { like } from 'drizzle-orm';

async function main() {
  const db = await getDb();
  const acts = await db.select().from(recognizedTests).where(like(recognizedTests.testName, '%ACT%'));
  console.log(JSON.stringify(acts, null, 2));
  process.exit(0);
}

main();

