import { getDb } from "./db";
import { recognizedTests } from "../drizzle/schema";

async function deleteTests() {
  const db = await getDb();
  if (!db) {
    console.error("Database connection failed");
    return;
  }

  console.log("Deleting all recognized tests...");
  await db.delete(recognizedTests);
  console.log("✓ All tests deleted!");
}

deleteTests()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deleting tests:", error);
    process.exit(1);
  });

