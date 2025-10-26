import { drizzle } from "drizzle-orm/mysql2";
import { badges } from "./drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const defaultBadges = [
  { name: "신입 회원", description: "RIQ Society에 가입한 신입 회원", icon: "🌱", price: 0 },
  { name: "활동가", description: "활발한 커뮤니티 활동을 하는 회원", icon: "⭐", price: 50 },
  { name: "지식인", description: "많은 지식을 공유하는 회원", icon: "📚", price: 100 },
  { name: "리더", description: "커뮤니티를 이끄는 리더", icon: "👑", price: 200 },
  { name: "천재", description: "뛰어난 지능을 가진 회원", icon: "🧠", price: 300 },
  { name: "전설", description: "전설적인 활동을 하는 회원", icon: "🏆", price: 500 },
];

async function seed() {
  console.log("Seeding badges...");
  for (const badge of defaultBadges) {
    await db.insert(badges).values(badge);
    console.log(`Added badge: ${badge.name}`);
  }
  console.log("Done!");
  process.exit(0);
}

seed();
