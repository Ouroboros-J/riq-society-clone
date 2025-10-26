import { drizzle } from "drizzle-orm/mysql2";
import { badges } from "./drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const rankingBadges = [
  { name: "주간 1위", description: "주간 랭킹 1위 달성", icon: "🥇", price: 0 },
  { name: "주간 2위", description: "주간 랭킹 2위 달성", icon: "🥈", price: 0 },
  { name: "주간 3위", description: "주간 랭킹 3위 달성", icon: "🥉", price: 0 },
  { name: "월간 1위", description: "월간 랭킹 1위 달성", icon: "👑", price: 0 },
  { name: "월간 2위", description: "월간 랭킹 2위 달성", icon: "💎", price: 0 },
  { name: "월간 3위", description: "월간 랭킹 3위 달성", icon: "💍", price: 0 },
];

async function seed() {
  console.log("Seeding ranking badges...");
  for (const badge of rankingBadges) {
    await db.insert(badges).values(badge);
    console.log(`Added badge: ${badge.name}`);
  }
  console.log("Done!");
  process.exit(0);
}

seed();
